import { handleCors } from "../_shared/cors.ts";
import { errorResponse, jsonResponse, readJson } from "../_shared/json.ts";
import { createSupabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { requireSharedSecret } from "../_shared/auth.ts";

type ChunkPayload = {
  chunk_index: number;
  total_chunks: number;
  content: string;
  content_hash: string;
  char_count?: number;
  token_estimate?: number;
  embedding?: unknown;
  embedding_model?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

type DocumentPayload = {
  source_repo: string;
  source_label?: string;
  source_branch?: string;
  source_commit?: string;
  source_path: string;
  source_url?: string;
  lane?: string;
  document_type?: string;
  title?: string;
  mime_type?: string;
  file_size_bytes?: number;
  char_count?: number;
  content_hash: string;
  raw_text?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  chunks?: ChunkPayload[];
};

type BatchPayload = {
  run_id?: string;
  run_label?: string;
  source_branch?: string;
  source_repos?: string[];
  dry_run?: boolean;
  manifest?: Record<string, unknown>;
  documents: DocumentPayload[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function assertDocument(doc: DocumentPayload): void {
  if (!doc.source_repo) throw new Error("document.source_repo is required");
  if (!doc.source_path) throw new Error("document.source_path is required");
  if (!doc.content_hash)
    throw new Error(`document.content_hash is required for ${doc.source_path}`);
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return errorResponse(req, 405, "Method not allowed. Use POST.");
  }

  try {
    requireSharedSecret(req);
    const payload = await readJson<BatchPayload>(req);
    const documents = payload.documents ?? [];

    if (!Array.isArray(documents) || documents.length === 0) {
      return errorResponse(req, 400, "documents[] is required.");
    }

    for (const doc of documents) assertDocument(doc);

    if (payload.dry_run) {
      const chunkCount = documents.reduce(
        (sum, doc) => sum + (doc.chunks?.length ?? 0),
        0,
      );
      return jsonResponse(req, {
        ok: true,
        dry_run: true,
        would_write_documents: documents.length,
        would_write_chunks: chunkCount,
      });
    }

    const supabase = createSupabaseAdmin();
    const sourceRepos = payload.source_repos?.length
      ? payload.source_repos
      : Array.from(new Set(documents.map((doc) => doc.source_repo)));

    const { data: runRows, error: runError } = await supabase
      .from("gsvw_ingestion_runs")
      .insert({
        run_id: payload.run_id,
        run_label: payload.run_label ?? "repo alignment batch",
        status: "running",
        source_repos: sourceRepos,
        source_branch: payload.source_branch ?? null,
        dry_run: false,
        manifest: payload.manifest ?? {},
        started_at: nowIso(),
      })
      .select("run_id")
      .single();

    if (runError) throw runError;
    const runId = runRows.run_id as string;

    let documentsWritten = 0;
    let documentsSeen = 0;
    let chunksWritten = 0;
    const errors: Record<string, unknown>[] = [];

    for (const doc of documents) {
      const seen = await supabase.rpc("gsvw_mark_document_seen", {
        p_source_repo: doc.source_repo,
        p_source_path: doc.source_path,
        p_content_hash: doc.content_hash,
        p_run_id: runId,
      });

      if (seen.data) {
        documentsSeen += 1;
        continue;
      }

      const { data: docRow, error: docError } = await supabase
        .from("gsvw_ingestion_documents")
        .insert({
          run_id: runId,
          source_repo: doc.source_repo,
          source_label: doc.source_label ?? null,
          source_branch: doc.source_branch ?? payload.source_branch ?? null,
          source_commit: doc.source_commit ?? null,
          source_path: doc.source_path,
          source_url: doc.source_url ?? null,
          lane: doc.lane ?? "corpus",
          document_type: doc.document_type ?? "general",
          title: doc.title ?? null,
          mime_type: doc.mime_type ?? null,
          file_size_bytes: doc.file_size_bytes ?? 0,
          char_count: doc.char_count ?? doc.raw_text?.length ?? 0,
          content_hash: doc.content_hash,
          raw_text: doc.raw_text ?? null,
          tags: doc.tags ?? [],
          metadata: doc.metadata ?? {},
          status: "active",
          last_seen_at: nowIso(),
        })
        .select("document_id")
        .single();

      if (docError) {
        errors.push({
          source_path: doc.source_path,
          stage: "document",
          error: docError.message,
        });
        continue;
      }

      documentsWritten += 1;
      const documentId = docRow.document_id as string;
      const chunks = doc.chunks ?? [];

      if (chunks.length) {
        const chunkRows = chunks.map((chunk) => ({
          document_id: documentId,
          run_id: runId,
          source_repo: doc.source_repo,
          source_path: doc.source_path,
          chunk_index: chunk.chunk_index,
          total_chunks: chunk.total_chunks,
          content: chunk.content,
          content_hash: chunk.content_hash,
          char_count: chunk.char_count ?? chunk.content.length,
          token_estimate:
            chunk.token_estimate ?? Math.ceil(chunk.content.length / 4),
          embedding: chunk.embedding ?? null,
          embedding_model: chunk.embedding_model ?? null,
          tags: chunk.tags ?? doc.tags ?? [],
          metadata: chunk.metadata ?? {},
        }));

        const { error: chunkError } = await supabase
          .from("gsvw_ingestion_chunks")
          .insert(chunkRows);

        if (chunkError) {
          errors.push({
            source_path: doc.source_path,
            stage: "chunks",
            error: chunkError.message,
          });
        } else {
          chunksWritten += chunkRows.length;
        }
      }
    }

    const finalStatus = errors.length ? "partial" : "complete";
    await supabase
      .from("gsvw_ingestion_runs")
      .update({
        status: finalStatus,
        counts: {
          documents_received: documents.length,
          documents_written: documentsWritten,
          documents_seen: documentsSeen,
          chunks_written: chunksWritten,
          errors: errors.length,
        },
        errors,
        finished_at: nowIso(),
      })
      .eq("run_id", runId);

    return jsonResponse(req, {
      ok: errors.length === 0,
      run_id: runId,
      status: finalStatus,
      documents_received: documents.length,
      documents_written: documentsWritten,
      documents_seen: documentsSeen,
      chunks_written: chunksWritten,
      errors,
    });
  } catch (error) {
    return errorResponse(
      req,
      error instanceof Error && error.message.includes("Unauthorized")
        ? 401
        : 500,
      error instanceof Error ? error.message : String(error),
    );
  }
});
