import { pgTable, serial, text, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dayEntries = pgTable("day_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  counterparty: text("counterparty").notNull(), // 거래처
  productName: text("product_name").notNull(), // 품명
  thickness: real("thickness").notNull(), // 두께
  winding: integer("winding").notNull(), // 권취
  workType: text("work_type").notNull(), // 작업
  emboss: text("emboss").notNull(), // 엠보
  size: integer("size").notNull(), // 사이즈
  note: text("note"), // 기타
});

export const insertDayEntrySchema = createInsertSchema(dayEntries).omit({ id: true });

export type DayEntry = typeof dayEntries.$inferSelect;
export type InsertDayEntry = z.infer<typeof insertDayEntrySchema>;

// Explicit API contract types
export type CreateDayEntryRequest = InsertDayEntry;
export type UpdateDayEntryRequest = Partial<InsertDayEntry>;
export type DayEntryResponse = DayEntry;
export type DayEntriesListResponse = DayEntry[];

export interface DayEntriesQueryParams {
  date?: string; // YYYY-MM-DD
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  counterparty?: string;
  q?: string;
}

export type ImportExcelRequest = {
  replaceAll?: boolean;
};

export type ImportExcelResponse = {
  inserted: number;
  skipped: number;
  errors: { row: number; message: string }[];
};
