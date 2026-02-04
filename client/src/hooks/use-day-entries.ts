import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type {
  DayEntriesListResponse,
  DayEntryCreateInput,
  DayEntryResponse,
  DayEntryUpdateInput,
  ImportExcelResponse,
} from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

function buildQueryString(input?: Record<string, unknown>) {
  const params = new URLSearchParams();
  if (!input) return "";
  Object.entries(input).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useDayEntries(filters?: z.infer<typeof api.dayEntries.list.input>) {
  const qs = buildQueryString(filters ?? undefined);
  const url = `${api.dayEntries.list.path}${qs}`;

  return useQuery<DayEntriesListResponse>({
    queryKey: [api.dayEntries.list.path, filters ?? {}],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch day entries");
      const json = await res.json();
      return parseWithLogging(api.dayEntries.list.responses[200], json, "dayEntries.list");
    },
  });
}

export function useDayEntry(id: number) {
  return useQuery<DayEntryResponse | null>({
    queryKey: [api.dayEntries.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.dayEntries.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch day entry");
      const json = await res.json();
      return parseWithLogging(api.dayEntries.get.responses[200], json, "dayEntries.get");
    },
  });
}

export function useCreateDayEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: DayEntryCreateInput) => {
      const validated = api.dayEntries.create.input.parse(data);
      const res = await fetch(api.dayEntries.create.path, {
        method: api.dayEntries.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.create.responses[400], errJson, "dayEntries.create.400");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to create day entry");
      }

      const json = await res.json();
      return parseWithLogging(api.dayEntries.create.responses[201], json, "dayEntries.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.dayEntries.list.path] });
    },
  });
}

export function useUpdateDayEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & DayEntryUpdateInput) => {
      const validated = api.dayEntries.update.input.parse(updates); // partial ok
      const url = buildUrl(api.dayEntries.update.path, { id });

      const res = await fetch(url, {
        method: api.dayEntries.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.update.responses[400], errJson, "dayEntries.update.400");
          throw new Error(parsed.message);
        }
        if (res.status === 404) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.update.responses[404], errJson, "dayEntries.update.404");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to update day entry");
      }

      const json = await res.json();
      return parseWithLogging(api.dayEntries.update.responses[200], json, "dayEntries.update.200");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [api.dayEntries.list.path] });
      qc.invalidateQueries({ queryKey: [api.dayEntries.get.path, vars.id] });
    },
  });
}

export function useDeleteDayEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.dayEntries.delete.path, { id });
      const res = await fetch(url, {
        method: api.dayEntries.delete.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.delete.responses[404], errJson, "dayEntries.delete.404");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to delete day entry");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.dayEntries.list.path] });
    },
  });
}

export function useBulkCreateDayEntries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: DayEntryCreateInput[]) => {
      const validated = api.dayEntries.bulkCreate.input.parse({ entries });
      const res = await fetch(api.dayEntries.bulkCreate.path, {
        method: api.dayEntries.bulkCreate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.bulkCreate.responses[400], errJson, "dayEntries.bulkCreate.400");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to bulk create day entries");
      }

      const json = await res.json();
      return parseWithLogging(api.dayEntries.bulkCreate.responses[201], json, "dayEntries.bulkCreate.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.dayEntries.list.path] });
    },
  });
}

export function useImportDayEntriesExcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input?: { replaceAll?: boolean }) => {
      const validated = api.dayEntries.importExcel.input.parse(input ?? undefined);
      const res = await fetch(api.dayEntries.importExcel.path, {
        method: api.dayEntries.importExcel.method,
        headers: { "Content-Type": "application/json" },
        body: validated ? JSON.stringify(validated) : undefined,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json();
          const parsed = parseWithLogging(api.dayEntries.importExcel.responses[400], errJson, "dayEntries.importExcel.400");
          throw new Error(parsed.message);
        }
        throw new Error("Failed to import Excel");
      }

      const json = await res.json();
      return parseWithLogging(api.dayEntries.importExcel.responses[200], json, "dayEntries.importExcel.200") as ImportExcelResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.dayEntries.list.path] });
    },
  });
}
