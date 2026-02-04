import { db } from "./db";
import {
  dayEntries,
  type CreateDayEntryRequest,
  type UpdateDayEntryRequest,
  type DayEntryResponse,
} from "@shared/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface DayEntriesListFilter {
  date?: string;
  from?: string;
  to?: string;
  counterparty?: string;
  q?: string;
}

export interface IStorage {
  listDayEntries(filter?: DayEntriesListFilter): Promise<DayEntryResponse[]>;
  getDayEntry(id: number): Promise<DayEntryResponse | undefined>;
  createDayEntry(entry: CreateDayEntryRequest): Promise<DayEntryResponse>;
  updateDayEntry(
    id: number,
    updates: UpdateDayEntryRequest,
  ): Promise<DayEntryResponse>;
  deleteDayEntry(id: number): Promise<void>;

  countDayEntries(): Promise<number>;
  deleteAllDayEntries(): Promise<void>;
  bulkCreateDayEntries(entries: CreateDayEntryRequest[]): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async listDayEntries(filter?: DayEntriesListFilter): Promise<DayEntryResponse[]> {
    const where = [] as any[];

    if (filter?.date) {
      where.push(eq(dayEntries.date, filter.date));
    } else {
      if (filter?.from) where.push(sql`${dayEntries.date} >= ${filter.from}`);
      if (filter?.to) where.push(sql`${dayEntries.date} <= ${filter.to}`);
    }

    if (filter?.counterparty) {
      where.push(ilike(dayEntries.counterparty, `%${filter.counterparty}%`));
    }

    if (filter?.q) {
      const q = `%${filter.q}%`;
      where.push(
        or(
          ilike(dayEntries.counterparty, q),
          ilike(dayEntries.productName, q),
          ilike(dayEntries.workType, q),
          ilike(dayEntries.emboss, q),
          ilike(sql`coalesce(${dayEntries.note}, '')`, q),
        ),
      );
    }

    const query = db
      .select()
      .from(dayEntries)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(dayEntries.date), desc(dayEntries.id));

    return await query;
  }

  async getDayEntry(id: number): Promise<DayEntryResponse | undefined> {
    const [row] = await db.select().from(dayEntries).where(eq(dayEntries.id, id));
    return row;
  }

  async createDayEntry(entry: CreateDayEntryRequest): Promise<DayEntryResponse> {
    const [created] = await db.insert(dayEntries).values(entry).returning();
    return created;
  }

  async updateDayEntry(
    id: number,
    updates: UpdateDayEntryRequest,
  ): Promise<DayEntryResponse> {
    const [updated] = await db
      .update(dayEntries)
      .set(updates)
      .where(eq(dayEntries.id, id))
      .returning();
    return updated;
  }

  async deleteDayEntry(id: number): Promise<void> {
    await db.delete(dayEntries).where(eq(dayEntries.id, id));
  }

  async countDayEntries(): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dayEntries);
    return Number(row?.count ?? 0);
  }

  async deleteAllDayEntries(): Promise<void> {
    await db.delete(dayEntries);
  }

  async bulkCreateDayEntries(entries: CreateDayEntryRequest[]): Promise<number> {
    if (entries.length === 0) return 0;
    const inserted = await db.insert(dayEntries).values(entries).returning({ id: dayEntries.id });
    return inserted.length;
  }
}

export const storage = new DatabaseStorage();
