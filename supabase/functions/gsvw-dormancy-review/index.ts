import { handleCors } from "../_shared/cors.ts";
import { requireSharedSecret } from "../_shared/auth.ts";
import { createSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { errorResponse, jsonResponse, readJson } from "../_shared/json.ts";

type ReviewRequest = {
  older_than_days?: number;
  max_candidates?: number;
  dry_run?: boolean;
};

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse(req, 405, "Method not allowed. Use POST.");
  }

  try {
    requireSharedSecret(req, "x-gsvw-operator-secret");
    const body = await readJson<ReviewRequest>(req);
    const olderThanDays = Math.max(1, body.older_than_days ?? 120);
    const maxCandidates = Math.min(100, Math.max(1, body.max_candidates ?? 25));
    const dryRun = body.dry_run ?? true;
    const supabase = createSupabaseAdmin();
    const cutoff = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: docs, error } = await supabase
      .from("gsvw_ingestion_documents")
      .select(
        "document_id, source_repo, source_path, document_type, tags, last_seen_at, metadata",
      )
      .eq("status", "active")
      .lt("last_seen_at", cutoff)
      .order("last_seen_at", { ascending: true })
      .limit(maxCandidates);

    if (error) throw error;
    const candidates = docs ?? [];

    if (!dryRun && candidates.length) {
      const rows = candidates.map((doc) => ({
        document_id: doc.document_id,
        proposed_reason: `Not seen since ${doc.last_seen_at}; proposed only, never auto-deleted.`,
        evidence: {
          source_repo: doc.source_repo,
          source_path: doc.source_path,
          document_type: doc.document_type,
          tags: doc.tags ?? [],
          last_seen_at: doc.last_seen_at,
        },
        status: "proposed",
      }));

      const { error: insertError } = await supabase
        .from("gsvw_dormancy_review_items")
        .insert(rows);
      if (insertError) throw insertError;

      await supabase
        .from("gsvw_ingestion_documents")
        .update({ status: "dormant_candidate" })
        .in(
          "document_id",
          candidates.map((doc) => doc.document_id),
        );
    }

    return jsonResponse(req, {
      ok: true,
      dry_run: dryRun,
      cutoff,
      candidate_count: candidates.length,
      candidates,
      rule: "Dormancy is a review proposal only. No automatic deletion.",
    });
  } catch (error) {
    const status =
      error instanceof Error && error.message.includes("Unauthorized")
        ? 401
        : 500;
    return errorResponse(
      req,
      status,
      error instanceof Error ? error.message : String(error),
    );
  }
});
