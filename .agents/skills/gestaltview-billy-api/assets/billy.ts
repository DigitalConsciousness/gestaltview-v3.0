// api/billy.ts — GestaltView v2  ·  Billy API Route
// © 2026 Keith Soyka / GestaltView
//
// Fully-wired Vercel serverless function.
// Responsibilities:
//   1. Parse request (message, mode, section, bootstrap, exhibitDomain)
//   2. Embed query via Gemini → vector search  (semantic)
//      + full-text search (BM25 via pg tsvector)
//   3. Merge + deduplicate corpus chunks (RRF)
//   4. Build Billy messages (BILLY_SYSTEM_PROMPT + context block + PLK)
//   5. Route to LLM via llmRouter (free-first cascade)
//   6. Log session to billy_sessions (fire-and-forget)
//   7. Return ApiEnvelope { response, provider, timestamp, metadata }
//
// Endpoints consumed:
//   POST /api/billy          → main chat + bootstrap
//   (See api/billy-bucket-drop.ts for bucket drop)
//   (See api/billy-health.ts  for health check)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, envelope }                 from "./_lib/response";
import { getUserId }                          from "./_lib/user";
import { routeLlm, embedQuery }               from "./_lib/llmRouter";
import { applyCorsHeaders }                   from "./_lib/cors";
import {
  matchKnowledgeFragments,
  searchKnowledgeFragments,
  insertRow,
  getFounderContext,
  upsertFounderContext,
} from "./_lib/supabase";
import type { FounderContextRow } from "./_lib/supabase";
import {
  buildBillyMessages,
  inferPackageFromQuery,
  deduplicateChunks,
  BILLY_SYSTEM_PROMPT,
} from "../shared/billy/runtime";
import type { RetrievedChunk } from "../shared/billy/types";

// ─── Constants ─────────────────────────────────────────────────────────────
const TOP_K_SEMANTIC = 10;
const TOP_K_TEXT = 8;
const MAX_CONTEXT_CHUNKS = 14;
const DEFAULT_CORS_ORIGIN = "https://gestaltview-v2-indol.vercel.app";

// Bootstrap greeting (used when bootstrap:true)
const BOOTSTRAP_PROMPT =
  "START SESSION. Greet the user with your full Billy personality. " +
  "Be warm, funny, slightly chaotic in the best way. " +
  "Introduce GestaltView briefly and invite them to begin their tapestry.";

export { inferPackageFromQuery, BILLY_SYSTEM_PROMPT };

export function truncatePromptValue(value: string | null | undefined, max = 400): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 1))}…`;
}

export function buildFounderAppendix(founderContext: FounderContextRow | null): string {
  if (!founderContext) return "";

  const plk = founderContext.plk_snapshot
    ? truncatePromptValue(JSON.stringify(founderContext.plk_snapshot), 1200)
    : "none";
  const thread = truncatePromptValue(founderContext.session_thread ?? "", 900);
  const currentState = truncatePromptValue(founderContext.current_state ?? "", 900);

  return [
    "FOUNDER SESSION ACTIVE.",
    `PLK snapshot: ${plk}`,
    `Last session thread: ${thread || "none"}`,
    `Current state: ${currentState || "none"}`,
  ].join("\n");
}

export function buildBootstrapMessage(founderContext: FounderContextRow | null, mode = "chat"): string {
  if (founderContext?.session_thread) {
    return `Vibe mode is live. ${truncatePromptValue(founderContext.session_thread, 220)} Where are we going this morning?`;
  }
  return `Billy is in ${mode} mode.`;
}

function getCorsOrigin(req: VercelRequest): { origin: string; isDynamic: boolean } {
  const configured = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const requestOrigin = typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (configured && configured.length > 0) {
    if (requestOrigin && configured.includes(requestOrigin)) {
      return { origin: requestOrigin, isDynamic: true };
    }

    return { origin: configured[0], isDynamic: true };
  }

  return { origin: DEFAULT_CORS_ORIGIN, isDynamic: false };
}

function applyCors(req: VercelRequest, res: VercelResponse): void {
  const { origin, isDynamic } = getCorsOrigin(req);

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-Id, X-Billy-Api-Secret"
  );

  if (isDynamic) {
    res.setHeader("Vary", "Origin");
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-User-Id", "X-Billy-Api-Secret"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const userId = getUserId(req, body);

  const isBootstrap = Boolean(body.bootstrap);
  const rawMessage =
    typeof body.message === "string"
      ? body.message.trim()
      : typeof body.query === "string"
        ? body.query.trim()
        : "";
  const mode = typeof body.mode === "string" ? body.mode : "synthesis";
  const section = typeof body.section === "string" ? body.section : "general";
  const exhibitDomain = typeof body.exhibitDomain === "string" ? body.exhibitDomain : undefined;

  // Bootstrap: skip retrieval, fire pure personality greeting
  if (isBootstrap) {
    const result = await routeLlm(BOOTSTRAP_PROMPT, {
      userId,
      mode,
      exhibit: exhibitDomain,
      systemPrompt: BILLY_SYSTEM_PROMPT,
    });

    void logSession(userId, "(bootstrap)", result.response, result.provider, mode, {
      bootstrap: true,
      retrievalMode: "none",
      contextSources: 0,
    });

    sendJson(res, 200, {
      ...envelope(result.response, result.provider, {
        conversationMode: mode,
        retrievalMode: "none",
        contextSources: 0,
        founderSessionActive: false,
      }),
      free: result.free,
      tokensUsed: result.tokensUsed ?? null,
      processingTime: result.processingTime ?? 0,
    });
    return;
  }

  if (!rawMessage) {
    sendJson(res, 400, { error: "message is required" });
    return;
  }

  // ── 1. Infer package from query ─────────────────────────────────────────
  const packageFilter = inferPackageFromQuery(rawMessage) ?? null;

  // ── 2. Parallel retrieval: semantic + text search ───────────────────────
  let semanticChunks: RetrievedChunk[] = [];
  let textChunks: RetrievedChunk[] = [];
  let retrievalMode: "semantic" | "text" | "text-only" | "none" = "none";

  try {
    const embedding = await embedQuery(rawMessage);

    if (embedding && embedding.length > 0) {
      const [semRows, txtRows] = await Promise.all([
        matchKnowledgeFragments({
          queryEmbedding: embedding,
          topK: TOP_K_SEMANTIC,
          packageFilter,
        }),
        searchKnowledgeFragments({
          query: rawMessage,
          topK: TOP_K_TEXT,
          packageFilter,
        }),
      ]);

      semanticChunks = semRows.map((r) => ({
        id: r.id,
        content: r.content,
        filename: r.source_file,
        document_type: r.document_type,
        chunk_index: r.chunk_index,
        tags: r.tags ?? [],
        score: r.similarity,
      }));

      textChunks = txtRows.map((r) => ({
        id: r.id,
        content: r.content,
        filename: r.source_file,
        document_type: r.document_type,
        chunk_index: r.chunk_index,
        tags: r.tags ?? [],
        score: r.rank,
      }));

      retrievalMode = "semantic";
    } else {
      // Embedding failed — fall back to text-only
      const txtRows = await searchKnowledgeFragments({
        query: rawMessage,
        topK: TOP_K_TEXT + TOP_K_SEMANTIC,
        packageFilter,
      });
      textChunks = txtRows.map((r) => ({
        id: r.id,
        content: r.content,
        filename: r.source_file,
        document_type: r.document_type,
        chunk_index: r.chunk_index,
        tags: r.tags ?? [],
        score: r.rank,
      }));
      retrievalMode = "text-only";
    }
  } catch (err) {
    console.error("[Billy] Retrieval error (degraded gracefully):", err);
    retrievalMode = "none";
  }

  // ── 3. RRF merge + deduplicate ──────────────────────────────────────────
  const merged = rrfMerge(semanticChunks, textChunks, MAX_CONTEXT_CHUNKS);
  const chunks = deduplicateChunks(merged).slice(0, MAX_CONTEXT_CHUNKS);

  // ── 4. Load founder context (PLK + session thread) ──────────────────────
  let plkProfile: string | undefined;
  let sessionThread: string | undefined;

  try {
    const fc = await getFounderContext(userId);
    if (fc) {
      plkProfile = fc.plk_snapshot ? JSON.stringify(fc.plk_snapshot) : undefined;
      sessionThread = fc.session_thread ?? undefined;
    }
  } catch {
    // Non-fatal — Billy works without PLK enrichment
  }

  // ── 5. Build Billy messages ──────────────────────────────────────────────
  const messages = buildBillyMessages({
    query: rawMessage,
    fragments: chunks,
    packageFilter,
    plkProfile,
    gapSignal: sessionThread ? `[Continuing thread: ${sessionThread}]` : undefined,
  });

  // The first message is always the system prompt role.
  const systemPrompt = messages.find((m) => m.role === "system")?.content ?? BILLY_SYSTEM_PROMPT;

  // ── 6. Route to LLM ─────────────────────────────────────────────────────
  const userMessage = messages.find((m) => m.role === "user")?.content ?? rawMessage;

  const result = await routeLlm(userMessage, {
    userId,
    mode,
    exhibit: exhibitDomain ?? section,
    plk: plkProfile,
    systemPrompt,
  });

  // ── 7. Persist session + update founder context (fire-and-forget) ────────
  void logSession(userId, rawMessage, result.response, result.provider, mode, {
    retrievalMode,
    contextSources: chunks.length,
    packageFilter,
    section,
    exhibitDomain,
  });

  void upsertFounderContext(userId, {
    last_session_at: new Date().toISOString(),
    ...(mode === "synthesis" || mode === "chat" ? { mode_preference: mode as "synthesis" | "chat" } : {}),
  }).catch(() => {
    /* non-fatal */
  });

  // ── 8. Return ────────────────────────────────────────────────────────────
  sendJson(res, 200, {
    ...envelope(result.response, result.provider, {
      conversationMode: mode,
      retrievalMode,
      contextSources: chunks.length,
      packageFilter: packageFilter ?? null,
      founderSessionActive: Boolean(plkProfile),
      sessionThread: sessionThread ?? null,
    }),
    free: result.free,
    tokensUsed: result.tokensUsed ?? null,
    processingTime: result.processingTime ?? 0,
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Reciprocal Rank Fusion — merges semantic + text results into a single
 * ranked list without needing score normalisation.
 */
function rrfMerge(
  semantic: RetrievedChunk[],
  text: RetrievedChunk[],
  topK: number,
  k = 60
): RetrievedChunk[] {
  const scores = new Map<string, number>();
  const byId = new Map<string, RetrievedChunk>();

  const rank = (list: RetrievedChunk[], weight = 1) => {
    list.forEach((chunk, i) => {
      const id = chunk.id ?? `${chunk.filename}:${chunk.chunk_index}`;
      const rrf = weight / (k + i + 1);
      scores.set(id, (scores.get(id) ?? 0) + rrf);
      if (!byId.has(id)) byId.set(id, chunk);
    });
  };

  rank(semantic, 1.2); // Slight semantic boost — better PLK resonance
  rank(text, 1.0);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({ ...byId.get(id)!, score }));
}

/** Fire-and-forget session logger — never throws. */
async function logSession(
  userId: string,
  message: string,
  response: string,
  provider: string,
  mode: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await insertRow("billy_sessions", {
      user_id: userId,
      message: message.slice(0, 4000),
      response: response.slice(0, 8000),
      provider,
      mode,
      metadata,
    });
  } catch (err) {
    console.error("[Billy] Session log failed (non-fatal):", err);
  }
}
