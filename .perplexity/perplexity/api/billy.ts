// api/billy.ts — GestaltView v2  ·  Billy API Route
// © 2026 Keith Soyka / GestaltView
//
// Billy chat + retrieval API.
// Supports:
//   • bootstrap greetings,
//   • semantic + text retrieval from knowledge_fragments AND skill_fragments,
//   • RRF merging across all three retrieval streams,
//   • degraded text-only fallback,
//   • protected diagnose mode,
//   • founder continuity metadata.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AsyncLocalStorage } from "node:async_hooks";
import { getAuthUser, getBearerToken, isFounderAdminEmail } from "./_lib/auth.js";
import { sendJson, envelope } from "./_lib/response.js";
import { getUserId } from "./_lib/user.js";
import { routeLlm } from "./_lib/llmRouter.js";
import { applyCorsHeaders } from "./_lib/cors.js";
import { embedTextForRetrieval, type EmbedBackend } from "./_lib/embeddings.js";
import { traceBraintrust } from "../instrument.js";
import { captureBillyMemories, retrieveMemoryEntries } from "./_lib/memory.js";
import {
  matchKnowledgeFragments,
  searchKnowledgeFragments,
  matchSkillFragments,
  searchSkillFragments,
  insertRow,
  getFounderContext,
  upsertFounderContext,
} from "./_lib/supabase.js";
import type {
  FounderContextRow,
  MatchKnowledgeFragmentRow,
  SearchKnowledgeFragmentRow,
  MatchSkillFragmentRow,
  SearchSkillFragmentRow,
} from "./_lib/supabase.js";
import {
  buildBillyMessages,
  inferPackageFromQuery,
  deduplicateChunks,
  BILLY_SYSTEM_PROMPT,
  buildBillyRuntimeSystemPrompt,
} from "../shared/billy/runtime.js";
import { buildBillySessionSystemPrompt, recordBillySessionCloseout } from "./_lib/billyMemoryPipeline.js";
import {
  buildChunkSignalWeight,
  runTwoPassGravityProtocol,
  type TwoPassGravityResult,
} from "../shared/gravity/index.js";
import { diagnoseBilly } from "../shared/billy/diagnostics.js";
import type { BillyTier, RetrievedChunk, RetrievedMemoryEntry } from "../shared/billy/types.js";

const DEFAULT_TOP_K = 8;
const MAX_TOP_K = 12;
const MAX_CONTEXT_CHUNKS = 14;
// How many of the MAX_CONTEXT_CHUNKS slots can be filled by skill fragments.
// This keeps knowledge fragments as the primary context spine while ensuring
// skill corpus is always represented when relevant.
const MAX_SKILL_CHUNKS = 4;
const MAX_MEMORY_ENTRIES = 4;

const BOOTSTRAP_PROMPT =
  "START SESSION. Greet the user with your full Billy personality. " +
  "Be warm, funny, slightly chaotic in the best way. " +
  "Introduce GestaltView briefly and invite them to begin their tapestry.";

type RetrievalMode = "semantic" | "text" | "text-only" | "none";
type FounderContinuityState =
  | "founder-active"
  | "founder-eligible-unseeded"
  | "session"
  | "anonymous";

type RequestCorrelation = {
  requestId: string;
  traceId: string;
  path: string;
};

type GravityChunkSignal = {
  documentId: string;
  filename: string;
  documentType: string | null;
  chunkIndex: number;
  retrievalScore: number | null;
  gravitySignalWeight: number;
  confidence: TwoPassGravityResult["gravity_report"]["confidence"];
  loadBearingClaims: string[];
  actualDelta: string;
};

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

const requestDiagnosticsStore = new AsyncLocalStorage<RequestCorrelation>();
let deprecationWarningHookRegistered = false;

function normalizeCorrelationValue(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value.trim();
}

function getRequestCorrelation(req: VercelRequest): RequestCorrelation {
  const requestId = normalizeCorrelationValue(req.headers["x-request-id"], "unknown-request");
  const traceId = normalizeCorrelationValue(req.headers["x-trace-id"], "unknown-trace");
  const path =
    normalizeCorrelationValue(req.headers["x-vercel-deployment-url"], "") ||
    normalizeCorrelationValue(req.url, "/api/billy");

  return { requestId, traceId, path };
}

function ensureDeprecationWarningHook(): void {
  if (deprecationWarningHookRegistered) return;
  deprecationWarningHookRegistered = true;

  process.on("warning", (warning) => {
    if (warning.name !== "DeprecationWarning") return;

    const context = requestDiagnosticsStore.getStore();
    if (!context) return;

    const warningCode =
      typeof (warning as NodeJS.ErrnoException).code === "string"
        ? (warning as NodeJS.ErrnoException).code
        : "unknown";

    console.warn("[Billy][deprecation-warning]", {
      requestId: context.requestId,
      traceId: context.traceId,
      path: context.path,
      code: warningCode,
      message: warning.message,
      stack: warning.stack,
    });
  });
}

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

function normalizeTopK(value: unknown, fallback = DEFAULT_TOP_K): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(MAX_TOP_K, Math.max(1, Math.floor(numeric)));
}

function normalizeTier(value: unknown): BillyTier {
  if (
    value === "free" ||
    value === "core" ||
    value === "pro" ||
    value === "enterprise" ||
    value === "founder"
  ) {
    return value;
  }
  return "anonymous";
}

function normalizeConversationMode(mode: string): "synthesis" | "chat" {
  return mode === "chat" ? "chat" : "synthesis";
}

function getBillyApiSecret(req: VercelRequest, body: Record<string, unknown>): string {
  const headerSecret = typeof req.headers["x-billy-api-secret"] === "string"
    ? req.headers["x-billy-api-secret"]
    : "";
  const bodySecret = typeof body.apiSecret === "string" ? body.apiSecret : "";
  return (headerSecret || bodySecret).trim();
}

function buildFounderMetadata(founderContext: FounderContextRow | null) {
  if (!founderContext) return null;

  return {
    currentState: founderContext.current_state ?? null,
    sessionThread: founderContext.session_thread ?? null,
    modePreference: founderContext.mode_preference ?? null,
    confirmedAdult: founderContext.confirmed_adult ?? null,
  };
}

function getFounderContinuityState(params: {
  founderContext: FounderContextRow | null;
  founderEligible: boolean;
  isAuthenticated: boolean;
}): FounderContinuityState {
  if (params.founderContext) {
    return "founder-active";
  }

  if (params.founderEligible) {
    return "founder-eligible-unseeded";
  }

  return params.isAuthenticated ? "session" : "anonymous";
}

function shouldRefreshFounderHeartbeat(params: {
  founderContext: FounderContextRow | null;
  mode: "synthesis" | "chat";
  allowCreate: boolean;
  minIntervalMs?: number;
}): boolean {
  const { founderContext, mode, allowCreate, minIntervalMs = 2 * 60 * 1000 } = params;

  if (!founderContext) {
    return allowCreate;
  }

  if (founderContext.mode_preference !== mode) {
    return true;
  }

  if (!founderContext.last_session_at) {
    return true;
  }

  const lastSessionAt = new Date(founderContext.last_session_at).getTime();
  if (!Number.isFinite(lastSessionAt)) {
    return true;
  }

  return Date.now() - lastSessionAt >= minIntervalMs;
}

function mapSemanticRows(rows: MatchKnowledgeFragmentRow[]): RetrievedChunk[] {
  return rows.map((row) => ({
    id: row.id,
    document_id: row.id,
    content: row.content,
    filename: row.source_file,
    document_type: row.document_type,
    chunk_index: row.chunk_index,
    tags: row.tags ?? [],
    score: row.similarity,
  }));
}

function mapTextRows(rows: SearchKnowledgeFragmentRow[]): RetrievedChunk[] {
  return rows.map((row) => ({
    id: row.id,
    document_id: row.id,
    content: row.content,
    filename: row.source_file,
    document_type: row.document_type,
    chunk_index: row.chunk_index,
    tags: row.tags ?? [],
    score: row.rank,
  }));
}

function mapSkillSemanticRows(rows: MatchSkillFragmentRow[]): RetrievedChunk[] {
  return rows.map((row) => ({
    id: `skill:${row.id}`,
    document_id: row.id,
    content: row.content,
    filename: row.source_file,
    document_type: row.skill_name ?? "Skill",
    chunk_index: row.chunk_index,
    tags: [...(row.tags ?? []), "skill"],
    score: row.similarity,
  }));
}

function mapSkillTextRows(rows: SearchSkillFragmentRow[]): RetrievedChunk[] {
  return rows.map((row) => ({
    id: `skill:${row.id}`,
    document_id: row.id,
    content: row.content,
    filename: row.source_file,
    document_type: row.skill_name ?? "Skill",
    chunk_index: row.chunk_index,
    tags: [...(row.tags ?? []), "skill"],
    score: row.rank,
  }));
}

function summarizeChunks(chunks: RetrievedChunk[]) {
  return chunks.map((chunk) => ({
    document_id: chunk.document_id ?? chunk.id ?? `${chunk.filename}:${chunk.chunk_index}`,
    chunk_index: chunk.chunk_index,
    score: chunk.score ?? null,
    filename: chunk.filename,
    document_type: chunk.document_type ?? null,
  }));
}

function buildGravityChunkSignals(
  contextAnalysis: TwoPassGravityResult,
  chunks: RetrievedChunk[]
): GravityChunkSignal[] {
  return chunks
    .map((chunk) => ({
      documentId: chunk.document_id ?? chunk.id ?? chunk.filename,
      filename: chunk.filename,
      documentType: chunk.document_type ?? null,
      chunkIndex: chunk.chunk_index,
      retrievalScore: chunk.score ?? null,
      gravitySignalWeight: buildChunkSignalWeight(contextAnalysis, chunk.content, chunk.chunk_index),
      confidence: contextAnalysis.gravity_report.confidence,
      loadBearingClaims: contextAnalysis.gravity_report.load_bearing_claims,
      actualDelta: contextAnalysis.gravity_report.actual_delta,
    }))
    .sort((a, b) => b.gravitySignalWeight - a.gravitySignalWeight || a.chunkIndex - b.chunkIndex)
    .slice(0, Math.min(chunks.length, 5));
}

function buildGravityMetadata(params: {
  queryText: string;
  responseText: string;
  chunks: RetrievedChunk[];
  sourceType?: string;
}): Record<string, unknown> {
  const queryAnalysis = runTwoPassGravityProtocol({
    title: "Billy query",
    text: params.queryText,
    source_type: params.sourceType,
  });

  const contextAnalysis = runTwoPassGravityProtocol({
    title: "Billy retrieval context",
    text: params.chunks.map((chunk) => chunk.content).join("\n\n"),
    context: params.queryText,
    source_type: params.sourceType,
  });

  const responseAnalysis = runTwoPassGravityProtocol({
    title: "Billy response",
    text: params.responseText,
    context: params.queryText,
    source_type: params.sourceType,
  });

  return {
    protocolVersion: "two-pass-gravity-v1",
    query: queryAnalysis,
    context: {
      ...contextAnalysis,
      rankedChunks: buildGravityChunkSignals(contextAnalysis, params.chunks),
    },
    response: responseAnalysis,
  };
}

async function safeUpdateFounderContext(
  userId: string,
  payload: {
    last_session_at: string;
    mode_preference?: "synthesis" | "chat";
  },
  accessToken?: string | null
): Promise<void> {
  if (!userId) return;

  try {
    await upsertFounderContext(userId, payload, accessToken);
  } catch {
    // Non-fatal.
  }
}

async function logSession(
  userId: string,
  message: string,
  response: string,
  provider: string,
  mode: string,
  metadata: Record<string, unknown>
): Promise<void> {
  if (!userId || userId === "guest-user") {
    return;
  }

  try {
    await insertRow("billy_sessions", {
      user_id: userId,
      message: message.slice(0, 4000),
      response: response.slice(0, 8000),
      provider,
      mode,
      metadata,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('No "insertRow" export is defined')) {
      return;
    }
    console.error("[Billy] Session log failed (non-fatal):", error);
  }
}

/**
 * rrfMerge — Reciprocal Rank Fusion across multiple result lists.
 * Semantic knowledge fragments are weighted highest (1.3),
 * skill fragments slightly lower (1.1) to keep them additive,
 * text/keyword results at baseline (1.0).
 */
function rrfMerge(
  semanticKnowledge: RetrievedChunk[],
  textKnowledge: RetrievedChunk[],
  semanticSkill: RetrievedChunk[],
  textSkill: RetrievedChunk[],
  topK: number,
  k = 60
): RetrievedChunk[] {
  const scores = new Map<string, number>();
  const byId = new Map<string, RetrievedChunk>();

  const rank = (list: RetrievedChunk[], weight: number) => {
    list.forEach((chunk, index) => {
      const id = chunk.id ?? `${chunk.filename}:${chunk.chunk_index}`;
      const rrfScore = weight / (k + index + 1);
      scores.set(id, (scores.get(id) ?? 0) + rrfScore);
      if (!byId.has(id)) {
        byId.set(id, chunk);
      }
    });
  };

  rank(semanticKnowledge, 1.3);
  rank(textKnowledge, 1.0);
  rank(semanticSkill, 1.1);
  rank(textSkill, 0.9);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({ ...byId.get(id)!, score }));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  ensureDeprecationWarningHook();
  const correlation = getRequestCorrelation(req);

  return requestDiagnosticsStore.run(correlation, async () => {
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
  const authUser = await getAuthUser(req);
  const accessToken = getBearerToken(req);
  const requestedMode = typeof body.mode === "string" ? body.mode : "synthesis";
  const conversationMode = normalizeConversationMode(requestedMode);
  const userId = authUser?.id || getUserId(req, body);
  const founderEligible = Boolean(authUser?.email && isFounderAdminEmail(authUser.email));
  const userTier = authUser?.tier ?? normalizeTier(body.userTier);
  const requestedTopK = normalizeTopK(body.topK, DEFAULT_TOP_K);
  const section = typeof body.section === "string" ? body.section : "general";
  const exhibitDomain = typeof body.exhibitDomain === "string" ? body.exhibitDomain : undefined;
  const requestedEmbodimentProfileSlug =
    typeof body.embodimentProfileSlug === "string"
      ? body.embodimentProfileSlug.trim()
      : "billy";
  const requestedRoomSlug =
    typeof body.roomSlug === "string" ? body.roomSlug.trim() : null;
  const resolvedSystemPrompt = buildBillyRuntimeSystemPrompt(
    requestedEmbodimentProfileSlug || "billy",
    requestedRoomSlug || null
  );
  const rawMessage =
    typeof body.message === "string"
      ? body.message.trim()
      : typeof body.query === "string"
        ? body.query.trim()
        : "";

  if (requestedMode === "diagnose") {
    const expectedSecret = (process.env.BILLY_API_SECRET || "").trim();
    const providedSecret = getBillyApiSecret(req, body);

    if (!expectedSecret || providedSecret !== expectedSecret) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }

    const diagnosis = await diagnoseBilly();
    sendJson(
      res,
      200,
      envelope("Billy diagnostics completed.", "gestaltview-actions", {
        free: true,
        tokensUsed: null,
        processingTime: 0,
        metadata: {
          diagnosis: diagnosis.status,
          diagnosisDetails: diagnosis.details,
        },
      })
    );
    return;
  }

  let founderContext: FounderContextRow | null = null;
  try {
    founderContext = await getFounderContext(userId, accessToken);
  } catch {
    founderContext = null;
  }
  const sessionContext = await buildBillySessionSystemPrompt({
    userId,
    baseSystemPrompt: resolvedSystemPrompt,
    sessionId: null,
  });
  const sessionSystemPrompt = sessionContext.systemPrompt;
  const founderContinuityState = getFounderContinuityState({
    founderContext,
    founderEligible,
    isAuthenticated: Boolean(authUser),
  });

  if (Boolean(body.bootstrap)) {
    const founderAppendix = buildFounderAppendix(founderContext);
    const preferredOpening = buildBootstrapMessage(founderContext, conversationMode);
    const prompt = founderAppendix
      ? `${BOOTSTRAP_PROMPT}\n\n${founderAppendix}\n\nPreferred opening: ${preferredOpening}`
      : `${BOOTSTRAP_PROMPT}\n\nPreferred opening: ${preferredOpening}`;

    const result = await traceBraintrust(
      {
        name: "billy bootstrap",
        type: "task",
        metadata: {
          userId,
          mode: conversationMode,
          exhibit: exhibitDomain ?? section,
          founderContinuityState,
        },
      },
      async (span: BraintrustSpan | null) => {
        span?.log({
          input: prompt,
          metadata: {
            bootstrap: true,
            founderEligible,
            founderContinuityState,
          },
        });

        return routeLlm(prompt, {
          userId,
          mode: conversationMode,
          exhibit: exhibitDomain,
          tier: userTier,
          systemPrompt: sessionSystemPrompt,
        });
      },
    );

    void logSession(userId, "(bootstrap)", result.response, result.provider, conversationMode, {
      bootstrap: true,
      retrievalMode: "none",
      contextSources: 0,
      skillSources: 0,
      memorySources: 0,
      founderContinuityState,
    });

    if (
      shouldRefreshFounderHeartbeat({
        founderContext,
        mode: conversationMode,
        allowCreate: founderEligible,
      })
    ) {
      void safeUpdateFounderContext(userId, {
        last_session_at: new Date().toISOString(),
        mode_preference: conversationMode,
      }, accessToken);
    }

    const gravityMetadata = buildGravityMetadata({
      queryText: preferredOpening,
      responseText: result.response,
      chunks: [],
      sourceType: "bootstrap",
    });

    sendJson(
      res,
      200,
      envelope(result.response, result.provider, {
        free: result.free,
        tokensUsed: result.tokensUsed ?? null,
        processingTime: result.processingTime ?? 0,
        metadata: {
          ...(result.metadata || {}),
          conversationMode,
          retrievalMode: "none",
          contextSources: 0,
          skillSources: 0,
          memorySources: 0,
          founderEligible,
          founderContinuityState,
          founderSessionActive: Boolean(founderContext),
          founderContext: buildFounderMetadata(founderContext),
          embodimentProfileSlug: requestedEmbodimentProfileSlug || "billy",
          roomSlug: requestedRoomSlug,
          sessionThread: founderContext?.session_thread ?? null,
          modePreference: founderContext?.mode_preference ?? null,
          gravity: gravityMetadata,
        },
      })
    );
    return;
  }

  if (!rawMessage) {
    sendJson(res, 400, { error: "message is required" });
    return;
  }

  const packageFilter = inferPackageFromQuery(rawMessage) ?? null;

  let semanticKnowledgeChunks: RetrievedChunk[] = [];
  let textKnowledgeChunks: RetrievedChunk[] = [];
  let semanticSkillChunks: RetrievedChunk[] = [];
  let textSkillChunks: RetrievedChunk[] = [];
  let memoryEntries: RetrievedMemoryEntry[] = [];
  let retrievalMode: RetrievalMode = "none";
  let memoryRetrievalMode: RetrievalMode = "none";
  let embedBackend: EmbedBackend = null;
  let embedModel: string | null = null;

  try {
    const embedResult = await embedTextForRetrieval(rawMessage);
    embedBackend = embedResult.backend;
    embedModel = embedResult.model;

    if (embedResult.embedding && embedResult.embedding.length > 0) {
      const memoryPromise = retrieveMemoryEntries({
        userId,
        query: rawMessage,
        topK: MAX_MEMORY_ENTRIES,
        queryEmbedding: embedResult.embedding,
        embedBackend,
        embedModel,
      });

      const [semanticKnowledgeRows, textKnowledgeRows, semanticSkillRows, textSkillRows, memoryResult] =
        await Promise.all([
          matchKnowledgeFragments({
            queryEmbedding: embedResult.embedding,
            topK: requestedTopK,
            packageFilter,
          }),
          searchKnowledgeFragments({
            query: rawMessage,
            topK: requestedTopK,
            packageFilter,
          }),
          matchSkillFragments({
            queryEmbedding: embedResult.embedding,
            topK: MAX_SKILL_CHUNKS,
            skillFilter: packageFilter,
          }),
          searchSkillFragments({
            query: rawMessage,
            topK: MAX_SKILL_CHUNKS,
            skillFilter: packageFilter,
          }),
          memoryPromise,
        ]);

      semanticKnowledgeChunks = mapSemanticRows(semanticKnowledgeRows);
      textKnowledgeChunks = mapTextRows(textKnowledgeRows);
      semanticSkillChunks = mapSkillSemanticRows(semanticSkillRows);
      textSkillChunks = mapSkillTextRows(textSkillRows);
      memoryEntries = memoryResult.memories;
      memoryRetrievalMode = memoryResult.retrievalMode;

      retrievalMode =
        semanticKnowledgeChunks.length > 0
          ? "semantic"
          : textKnowledgeChunks.length > 0
          ? "text"
          : "none";
    } else {
      const [textKnowledgeRows, textSkillRows, memoryResult] = await Promise.all([
        searchKnowledgeFragments({
          query: rawMessage,
          topK: requestedTopK,
          packageFilter,
        }),
        searchSkillFragments({
          query: rawMessage,
          topK: MAX_SKILL_CHUNKS,
          skillFilter: packageFilter,
        }),
        retrieveMemoryEntries({
          userId,
          query: rawMessage,
          topK: MAX_MEMORY_ENTRIES,
          textOnly: true,
          embedBackend,
          embedModel,
        }),
      ]);

      textKnowledgeChunks = mapTextRows(textKnowledgeRows);
      textSkillChunks = mapSkillTextRows(textSkillRows);
      memoryEntries = memoryResult.memories;
      memoryRetrievalMode = memoryResult.retrievalMode;
      retrievalMode = textKnowledgeChunks.length > 0 ? "text-only" : "none";
    }
  } catch (error) {
    console.error("[Billy] Retrieval error (degraded gracefully):", error);

    try {
      const [textKnowledgeRows, textSkillRows, memoryResult] = await Promise.all([
        searchKnowledgeFragments({
          query: rawMessage,
          topK: requestedTopK,
          packageFilter,
        }),
        searchSkillFragments({
          query: rawMessage,
          topK: MAX_SKILL_CHUNKS,
          skillFilter: packageFilter,
        }),
        retrieveMemoryEntries({
          userId,
          query: rawMessage,
          topK: MAX_MEMORY_ENTRIES,
          textOnly: true,
          embedBackend,
          embedModel,
        }),
      ]);
      textKnowledgeChunks = mapTextRows(textKnowledgeRows);
      textSkillChunks = mapSkillTextRows(textSkillRows);
      memoryEntries = memoryResult.memories;
      memoryRetrievalMode = memoryResult.retrievalMode;
      retrievalMode = textKnowledgeChunks.length > 0 ? "text-only" : "none";
    } catch (fallbackError) {
      console.error("[Billy] Text fallback failed:", fallbackError);
      retrievalMode = "none";
      memoryRetrievalMode = "none";
    }
  }

  const merged = rrfMerge(
    semanticKnowledgeChunks,
    textKnowledgeChunks,
    semanticSkillChunks,
    textSkillChunks,
    Math.min(MAX_CONTEXT_CHUNKS, requestedTopK)
  );
  const chunks = deduplicateChunks(merged).slice(0, Math.min(MAX_CONTEXT_CHUNKS, requestedTopK));
  const skillCount = chunks.filter((c) => (c.tags ?? []).includes("skill")).length;
  const founderMetadata = buildFounderMetadata(founderContext);

  const plkProfile = founderContext?.plk_snapshot
    ? JSON.stringify(founderContext.plk_snapshot)
    : undefined;
  const sessionThread = founderContext?.session_thread ?? undefined;

  const messages = buildBillyMessages({
    query: rawMessage,
    fragments: chunks,
    packageFilter,
    memories: memoryEntries,
    plkProfile,
    gapSignal: sessionThread ? `[Continuing thread: ${sessionThread}]` : undefined,
    systemPrompt: sessionSystemPrompt,
  });

  const systemPrompt =
    messages.find((message) => message.role === "system")?.content ??
    resolvedSystemPrompt;
  const userMessage = messages.find((message) => message.role === "user")?.content ?? rawMessage;

  const result = await traceBraintrust(
    {
      name: "billy synthesis",
      type: "task",
      metadata: {
        userId,
        mode: conversationMode,
        exhibit: exhibitDomain ?? section,
        retrievalMode,
        memoryRetrievalMode,
        embedBackend,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: userMessage,
        metadata: {
          section,
          packageFilter,
          contextSources: chunks.length,
          skillSources: skillCount,
          memorySources: memoryEntries.length,
          founderContinuityState,
        },
      });

      return routeLlm(userMessage, {
        userId,
        mode: conversationMode,
        exhibit: exhibitDomain ?? section,
        plk: plkProfile,
        tier: userTier,
        systemPrompt,
      });
    },
  );

  const memoryCapture = await captureBillyMemories({
    userId,
    userMessage: rawMessage,
    assistantResponse: result.response,
    section,
    conversationMode,
  });

  void logSession(userId, rawMessage, result.response, result.provider, conversationMode, {
    retrievalMode,
    contextSources: chunks.length,
    skillSources: skillCount,
    memorySources: memoryEntries.length,
    memoryRetrievalMode,
    packageFilter,
    section,
    exhibitDomain,
    embedBackend,
    embedModel,
    founderContinuityState,
  });

  if (
    (conversationMode === "synthesis" || conversationMode === "chat") &&
    shouldRefreshFounderHeartbeat({
      founderContext,
      mode: conversationMode,
      allowCreate: founderEligible,
    })
  ) {
    void safeUpdateFounderContext(userId, {
      last_session_at: new Date().toISOString(),
      mode_preference: conversationMode,
      }, accessToken);
  }

  void recordBillySessionCloseout({
    userId,
    sessionId: null,
    transcript: [
      { role: "user", content: rawMessage },
      { role: "assistant", content: result.response },
    ],
    section,
    conversationMode,
    bootstrap: false,
  }).catch((error) => {
    console.error("[Billy] session memory closeout failed:", error);
  });

  const gravityMetadata = buildGravityMetadata({
    queryText: rawMessage,
    responseText: result.response,
    chunks,
    sourceType: exhibitDomain ?? section,
  });

  sendJson(
    res,
    200,
    {
      ...envelope(result.response, result.provider, {
        free: result.free,
        tokensUsed: result.tokensUsed ?? null,
        processingTime: result.processingTime ?? 0,
        metadata: {
          ...(result.metadata || {}),
          conversationMode,
          retrievalMode,
          contextSources: chunks.length,
          skillSources: skillCount,
          memorySources: memoryEntries.length,
          memoryRetrievalMode,
          memoryCaptureCandidates: memoryCapture.candidates,
          memoryCaptured: memoryCapture.stored,
          packageFilter,
          founderEligible,
          founderContinuityState,
          embodimentProfileSlug: requestedEmbodimentProfileSlug || "billy",
          roomSlug: requestedRoomSlug,
          founderSessionActive: Boolean(founderContext),
          founderContext: founderMetadata,
          sessionThread: sessionThread ?? null,
          modePreference: founderContext?.mode_preference ?? null,
          embedBackend,
          embedModel,
          gravity: gravityMetadata,
        },
      }),
      chunks: summarizeChunks(chunks),
    }
  );
  });
}
