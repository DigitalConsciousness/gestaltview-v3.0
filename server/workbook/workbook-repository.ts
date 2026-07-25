import {
  OpsWorkbookItemSchema,
  OpsWorkbookSyncRunSchema,
  type OpsWorkbookItem,
  type OpsWorkbookSyncRun,
} from "../../shared/workbook/schemas.js";
import {
  getTrainerSupabaseAdmin,
  hasTrainerSupabaseConfig,
} from "../agent-trainer/supabaseAdmin.js";

interface OpsWorkbookItemRow {
  id: string;
  sheet_name: string;
  row_key: string;
  label: string;
  category: string | null;
  status: string | null;
  priority: string | null;
  phase: string | null;
  owner: string | null;
  target_start: string | null;
  target_end: string | null;
  notes: string | null;
  link_ref: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface OpsWorkbookSyncRunRow {
  id: string;
  triggered_by: string | null;
  source_file: string | null;
  rows_upserted: number | null;
  rows_skipped: number | null;
  errors: Array<Record<string, unknown>> | null;
  status: "success" | "partial" | "failed";
  created_at: string;
}

function isMissingRelation(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("PGRST205")
  );
}

function mapWorkbookItem(row: OpsWorkbookItemRow): OpsWorkbookItem {
  return OpsWorkbookItemSchema.parse({
    id: row.id,
    sheetName: row.sheet_name,
    rowKey: row.row_key,
    label: row.label,
    category: row.category,
    status: row.status,
    priority: row.priority,
    phase: row.phase,
    owner: row.owner ?? "Keith",
    targetStart: row.target_start,
    targetEnd: row.target_end,
    notes: row.notes,
    linkRef: row.link_ref,
    meta: row.meta ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapWorkbookSyncRun(row: OpsWorkbookSyncRunRow): OpsWorkbookSyncRun {
  return OpsWorkbookSyncRunSchema.parse({
    id: row.id,
    triggeredBy: row.triggered_by,
    sourceFile: row.source_file,
    rowsUpserted: row.rows_upserted ?? 0,
    rowsSkipped: row.rows_skipped ?? 0,
    errors: row.errors ?? [],
    status: row.status,
    createdAt: row.created_at,
  });
}

export async function listWorkbookItems(filters: {
  sheetName?: string;
  status?: string;
  priority?: string;
  phase?: string;
} = {}): Promise<OpsWorkbookItem[]> {
  if (!hasTrainerSupabaseConfig()) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  let query = supabase
    .from("ops_workbook_items")
    .select("*")
    .order("updated_at", { ascending: false });

  if (filters.sheetName) {
    query = query.eq("sheet_name", filters.sheetName);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters.phase) {
    query = query.eq("phase", filters.phase);
  }

  const result = await query;
  if (result.error) {
    if (isMissingRelation(result.error)) {
      return [];
    }
    throw result.error;
  }

  return ((result.data as OpsWorkbookItemRow[] | null) ?? []).map(mapWorkbookItem);
}

export async function upsertWorkbookItems(
  items: Array<{
    sheetName: string;
    rowKey: string;
    label: string;
    category?: string | null;
    status?: string | null;
    priority?: string | null;
    phase?: string | null;
    owner?: string | null;
    targetStart?: string | null;
    targetEnd?: string | null;
    notes?: string | null;
    linkRef?: string | null;
    meta?: Record<string, unknown>;
  }>
): Promise<OpsWorkbookItem[]> {
  if (items.length === 0) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("ops_workbook_items")
    .upsert(
      items.map((item) => ({
        sheet_name: item.sheetName,
        row_key: item.rowKey,
        label: item.label,
        category: item.category ?? null,
        status: item.status ?? null,
        priority: item.priority ?? null,
        phase: item.phase ?? null,
        owner: item.owner ?? "Keith",
        target_start: item.targetStart ?? null,
        target_end: item.targetEnd ?? null,
        notes: item.notes ?? null,
        link_ref: item.linkRef ?? null,
        meta: item.meta ?? {},
      })),
      {
        onConflict: "sheet_name,row_key",
      }
    )
    .select("*");

  if (result.error) {
    throw result.error;
  }

  return ((result.data as OpsWorkbookItemRow[] | null) ?? []).map(mapWorkbookItem);
}

export async function updateWorkbookItem(
  id: string,
  patch: {
    label?: string;
    category?: string | null;
    status?: string | null;
    priority?: string | null;
    phase?: string | null;
    owner?: string | null;
    targetStart?: string | null;
    targetEnd?: string | null;
    notes?: string | null;
    linkRef?: string | null;
    meta?: Record<string, unknown>;
  }
): Promise<OpsWorkbookItem> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("ops_workbook_items")
    .update({
      ...(patch.label !== undefined ? { label: patch.label } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
      ...(patch.phase !== undefined ? { phase: patch.phase } : {}),
      ...(patch.owner !== undefined ? { owner: patch.owner } : {}),
      ...(patch.targetStart !== undefined ? { target_start: patch.targetStart } : {}),
      ...(patch.targetEnd !== undefined ? { target_end: patch.targetEnd } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.linkRef !== undefined ? { link_ref: patch.linkRef } : {}),
      ...(patch.meta !== undefined ? { meta: patch.meta } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (result.error) {
    throw result.error;
  }

  return mapWorkbookItem(result.data as OpsWorkbookItemRow);
}

export async function recordWorkbookSyncRun(input: {
  triggeredBy?: string | null;
  sourceFile?: string | null;
  rowsUpserted: number;
  rowsSkipped: number;
  errors?: Array<Record<string, unknown>>;
  status: "success" | "partial" | "failed";
}): Promise<OpsWorkbookSyncRun> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("ops_workbook_sync_runs")
    .insert({
      triggered_by: input.triggeredBy ?? null,
      source_file: input.sourceFile ?? null,
      rows_upserted: input.rowsUpserted,
      rows_skipped: input.rowsSkipped,
      errors: input.errors ?? [],
      status: input.status,
    })
    .select("*")
    .single();

  if (result.error) {
    throw result.error;
  }

  return mapWorkbookSyncRun(result.data as OpsWorkbookSyncRunRow);
}

export async function listWorkbookSyncRuns(limit = 12): Promise<OpsWorkbookSyncRun[]> {
  if (!hasTrainerSupabaseConfig()) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("ops_workbook_sync_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) {
    if (isMissingRelation(result.error)) {
      return [];
    }
    throw result.error;
  }

  return ((result.data as OpsWorkbookSyncRunRow[] | null) ?? []).map(mapWorkbookSyncRun);
}
