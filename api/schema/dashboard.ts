import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { sendJson } from "../_lib/response.js";
import { invokeRpc } from "../_lib/supabase.js";

interface SchemaDashboardTableRow {
  table_name: string;
  row_count: number;
  column_count: number;
  foreign_key_count: number;
  index_count: number;
  has_rows: boolean;
  has_vector_index: boolean;
}

interface SchemaDashboardSummary {
  public_tables: number;
  lit_tables: number;
  dark_tables: number;
  vector_tables: number;
  enum_types: number;
}

interface SchemaDashboardSnapshot {
  generated_at: string;
  summary: SchemaDashboardSummary;
  tables: SchemaDashboardTableRow[];
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  if (!auth.isAdmin) {
    sendJson(res, 403, { error: "Admin access required" });
    return;
  }

  try {
    const snapshot = await invokeRpc<SchemaDashboardSnapshot>("get_schema_dashboard_snapshot", {});
    sendJson(res, 200, snapshot);
  } catch (error) {
    sendJson(res, 500, {
      error: "Failed to load schema dashboard snapshot",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
