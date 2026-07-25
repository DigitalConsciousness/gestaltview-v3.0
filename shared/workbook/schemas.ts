import { z } from "zod";

function normalizeDateValue(value: unknown): string | null | unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return parsed.toISOString().slice(0, 10);
}

const WorkbookDateSchema = z.preprocess(
  normalizeDateValue,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
);

export const WorkbookSheetNameSchema = z.enum([
  "Roadmap",
  "Products_vs_Proof",
  "Claim_Ledger",
  "Evidence_Index",
  "Status_Dashboard",
]);

export const OpsWorkbookItemSchema = z.object({
  id: z.string().uuid(),
  sheetName: WorkbookSheetNameSchema,
  rowKey: z.string().min(1),
  label: z.string().min(1),
  category: z.string().nullable().default(null),
  status: z.string().nullable().default(null),
  priority: z.string().nullable().default(null),
  phase: z.string().nullable().default(null),
  owner: z.string().nullable().default("Keith"),
  targetStart: z.string().nullable().default(null),
  targetEnd: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  linkRef: z.string().nullable().default(null),
  meta: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkbookItemUpsertSchema = z.object({
  sheetName: WorkbookSheetNameSchema,
  rowKey: z.string().min(1).optional(),
  label: z.string().min(1),
  category: z.string().max(200).nullable().optional(),
  status: z.string().max(200).nullable().optional(),
  priority: z.string().max(80).nullable().optional(),
  phase: z.string().max(80).nullable().optional(),
  owner: z.string().max(200).nullable().optional(),
  targetStart: WorkbookDateSchema.optional(),
  targetEnd: WorkbookDateSchema.optional(),
  notes: z.string().max(12000).nullable().optional(),
  linkRef: z.string().max(2000).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const WorkbookItemPatchSchema = WorkbookItemUpsertSchema.omit({
  sheetName: true,
  rowKey: true,
  label: true,
})
  .extend({
    label: z.string().min(1).max(400).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one workbook field is required.",
  });

export const OpsWorkbookSyncRunSchema = z.object({
  id: z.string().uuid(),
  triggeredBy: z.string().nullable().default(null),
  sourceFile: z.string().nullable().default(null),
  rowsUpserted: z.number().int().min(0).default(0),
  rowsSkipped: z.number().int().min(0).default(0),
  errors: z.array(z.record(z.string(), z.unknown())).default([]),
  status: z.enum(["success", "partial", "failed"]),
  createdAt: z.string(),
});

export const WorkbookItemsResponseSchema = z.object({
  items: z.array(OpsWorkbookItemSchema),
});

export const WorkbookSyncRunsResponseSchema = z.object({
  syncRuns: z.array(OpsWorkbookSyncRunSchema),
});

export const WorkbookItemsUpsertResponseSchema = z.object({
  items: z.array(OpsWorkbookItemSchema),
  syncRun: OpsWorkbookSyncRunSchema.nullable().default(null),
});

export type OpsWorkbookItem = z.infer<typeof OpsWorkbookItemSchema>;
export type OpsWorkbookSyncRun = z.infer<typeof OpsWorkbookSyncRunSchema>;
