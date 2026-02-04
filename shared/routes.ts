import { z } from "zod";
import { insertDayEntrySchema, type DayEntry } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const dayEntrySchema = z.custom<DayEntry>();

export const api = {
  dayEntries: {
    list: {
      method: "GET" as const,
      path: "/api/day-entries",
      input: z
        .object({
          date: z.string().optional(),
          from: z.string().optional(),
          to: z.string().optional(),
          counterparty: z.string().optional(),
          q: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(dayEntrySchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/day-entries/:id",
      responses: {
        200: dayEntrySchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/day-entries",
      input: insertDayEntrySchema,
      responses: {
        201: dayEntrySchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/day-entries/:id",
      input: insertDayEntrySchema.partial(),
      responses: {
        200: dayEntrySchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/day-entries/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    bulkCreate: {
      method: "POST" as const,
      path: "/api/day-entries/bulk",
      input: z.object({
        entries: z.array(insertDayEntrySchema),
      }),
      responses: {
        201: z.object({
          inserted: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
    importExcel: {
      method: "POST" as const,
      path: "/api/day-entries/import/excel",
      input: z
        .object({
          replaceAll: z.boolean().optional(),
        })
        .optional(),
      responses: {
        200: z.object({
          inserted: z.number(),
          skipped: z.number(),
          errors: z.array(
            z.object({
              row: z.number(),
              message: z.string(),
            }),
          ),
        }),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
  }
  return url;
}

export type DayEntriesListResponse = z.infer<typeof api.dayEntries.list.responses[200]>;
export type DayEntryResponse = z.infer<typeof api.dayEntries.get.responses[200]>;
export type DayEntryCreateInput = z.infer<typeof api.dayEntries.create.input>;
export type DayEntryUpdateInput = z.infer<typeof api.dayEntries.update.input>;
export type ImportExcelResponse = z.infer<typeof api.dayEntries.importExcel.responses[200]>;
