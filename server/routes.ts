import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import xlsx from "xlsx";

function yymmddToIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length !== 6) return null;
  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  const year = 2000 + yy;
  const iso = `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return iso;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.dayEntries.list.path, async (req, res) => {
    const input = api.dayEntries.list.input?.safeParse(req.query);
    if (input && !input.success) {
      return res.status(400).json({ message: input.error.errors[0]?.message ?? "Invalid query" });
    }
    const filter = input?.success ? input.data : undefined;
    const rows = await storage.listDayEntries(filter);
    return res.json(rows);
  });

  app.get(api.dayEntries.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const row = await storage.getDayEntry(id);
    if (!row) return res.status(404).json({ message: "Not found" });
    return res.json(row);
  });

  app.post(api.dayEntries.create.path, async (req, res) => {
    try {
      const body = api.dayEntries.create.input.parse(req.body);
      const created = await storage.createDayEntry(body);
      return res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Validation error",
          field: err.errors[0]?.path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.dayEntries.update.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const existing = await storage.getDayEntry(id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    try {
      const body = api.dayEntries.update.input.parse(req.body);
      const updated = await storage.updateDayEntry(id, body);
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Validation error",
          field: err.errors[0]?.path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.dayEntries.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
    const existing = await storage.getDayEntry(id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    await storage.deleteDayEntry(id);
    return res.status(204).send();
  });

  app.post(api.dayEntries.bulkCreate.path, async (req, res) => {
    try {
      const body = api.dayEntries.bulkCreate.input.parse(req.body);
      const inserted = await storage.bulkCreateDayEntries(body.entries);
      return res.status(201).json({ inserted });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Validation error",
          field: err.errors[0]?.path.join("."),
        });
      }
      throw err;
    }
  });

  app.post(api.dayEntries.importExcel.path, async (req, res) => {
    try {
      const body = api.dayEntries.importExcel.input.parse(req.body ?? {});
      const replaceAll = body?.replaceAll ?? false;

      const filePath = "attached_assets/통합_문서1_1770198867069.xlsx";
      const wb = xlsx.readFile(filePath);
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

      const errors: { row: number; message: string }[] = [];
      const toInsert: any[] = [];
      let skipped = 0;

      for (let i = 0; i < rawRows.length; i++) {
        const r = rawRows[i];
        const date = yymmddToIso(r["일자"]);
        const counterparty = (r["거래처"] ?? "").toString().trim();
        const productName = (r["품명"] ?? "").toString().trim();
        const thickness = toNumber(r["두께"]);
        const winding = toNumber(r["권취"]);
        const workType = (r["작업"] ?? "").toString().trim();
        const emboss = (r["엠보"] ?? "").toString().trim();
        const size = toNumber(r["사이즈"]);
        const note = r["기타"] === null ? null : (r["기타"] ?? "").toString().trim();

        if (!date) {
          skipped++;
          errors.push({ row: i + 2, message: "일자 형식이 올바르지 않습니다" });
          continue;
        }
        if (!productName || thickness === null || winding === null || !workType || !emboss || size === null) {
          skipped++;
          errors.push({ row: i + 2, message: "필수 값이 비어있습니다" });
          continue;
        }

        toInsert.push({
          date,
          counterparty,
          productName,
          thickness,
          winding: Math.trunc(winding),
          workType,
          emboss,
          size: Math.trunc(size),
          note: note && note.length ? note : null,
        });
      }

      if (replaceAll) {
        await storage.deleteAllDayEntries();
      }

      const inserted = await storage.bulkCreateDayEntries(toInsert);

      return res.json({ inserted, skipped, errors });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Validation error",
          field: err.errors[0]?.path.join("."),
        });
      }
      throw err;
    }
  });

  // Seed once from Excel if DB is empty
  const count = await storage.countDayEntries();
  if (count === 0) {
    const wb = xlsx.readFile("attached_assets/통합_문서1_1770198867069.xlsx");
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
    const toInsert: any[] = [];
    for (const r of rawRows) {
      const date = yymmddToIso(r["일자"]);
      const counterparty = (r["거래처"] ?? "").toString().trim();
      const productName = (r["품명"] ?? "").toString().trim();
      const thickness = toNumber(r["두께"]);
      const winding = toNumber(r["권취"]);
      const workType = (r["작업"] ?? "").toString().trim();
      const emboss = (r["엠보"] ?? "").toString().trim();
      const size = toNumber(r["사이즈"]);
      const note = r["기타"] === null ? null : (r["기타"] ?? "").toString().trim();
      if (!date || !productName || thickness === null || winding === null || !workType || !emboss || size === null) {
        continue;
      }
      toInsert.push({
        date,
        counterparty,
        productName,
        thickness,
        winding: Math.trunc(winding),
        workType,
        emboss,
        size: Math.trunc(size),
        note: note && note.length ? note : null,
      });
    }
    await storage.bulkCreateDayEntries(toInsert);
  }

  return httpServer;
}
