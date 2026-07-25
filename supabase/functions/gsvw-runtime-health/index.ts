import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse } from "../_shared/json.ts";
import { createSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { requireSharedSecret } from "../_shared/auth.ts";

async function countTable(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  table: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) return null;
  return count ?? 0;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (!["GET", "POST"].includes(req.method)) {
    return errorResponse(req, 405, "Method not allowed. Use GET or POST.");
  }

  try {
    requireSharedSecret(req, "x-gsvw-operator-secret");
    const supabase = createSupabaseAdmin();
    const [runs, documents, chunks, captures, dormancy] = await Promise.all([
      countTable(supabase, "gsvw_ingestion_runs"),
      countTable(supabase, "gsvw_ingestion_documents"),
      countTable(supabase, "gsvw_ingestion_chunks"),
      countTable(supabase, "gsvw_runtime_capture_events"),
      countTable(supabase, "gsvw_dormancy_review_items"),
    ]);

    return jsonResponse(req, {
      ok: true,
      checked_at: new Date().toISOString(),
      cors_origin: req.headers.get("origin") ?? null,
      tables: {
        gsvw_ingestion_runs: runs,
        gsvw_ingestion_documents: documents,
        gsvw_ingestion_chunks: chunks,
        gsvw_runtime_capture_events: captures,
        gsvw_dormancy_review_items: dormancy,
      },
    });
  } catch (error) {
    return errorResponse(
      req,
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
});
