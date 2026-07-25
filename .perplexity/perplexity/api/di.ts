import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

import { applyCorsHeaders } from "./_lib/cors.js";
import { envelope, sendJson } from "./_lib/response.js";
import { getBearerToken } from "./_lib/auth.js";
import { embedTextForRetrieval } from "./_lib/embeddings.js";
import { retrieveMemoryEntries } from "./_lib/memory.js";
import {
  getFounderContext,
  matchKnowledgeFragments,
  matchSkillFragments,
  searchKnowledgeFragments,
  searchSkillFragments,
} from "./_lib/supabase.js";
import { routeLlm } from "./_lib/llmRouter.js";
import { buildDIBootstrapPrompt, buildDIMessages, getAllActiveDIProfiles, getDIProfile } from "../shared/di/index.js";
import {
  buildSessionThread,
  evaluateForMemory,
  mergeQuirkActivations,
  normalizeRelationalDepth,
} from "./_lib/diMemoryPipeline.js";
import type { BillyTier } from "../shared/billy/types.js";

type RetrievalMode = "semantic" | "text" | "text-only" | "none";

function normalizeTier(value: unknown): BillyTier {
  if (
    value === "anonymous" ||
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

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    "";

  if (!url.trim() || !key.trim()) {
    return null;
  }

  return { url: url.trim(), key: key.trim() };
}

function createSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function formatKnowledgeSource(row: { source_file?: string | null; filename?: string | null; content?: string | null }, index: number): string {
  const source = row.source_file ?? row.filename ?? "fragment";
  return `[${index + 1}] ${source} :: ${row.content ?? ""}`;
}

function formatMemorySource(
  memory: { title?: string | null; summary?: string | null; content: string },
  index: number
): string {
  const label = memory.title ?? memory.summary ?? "Memory";
  const summary = memory.summary ?? memory.content;
  return `[${index + 1}] ${label} :: ${summary}`;
}

function buildSessionLookup(
  client: any,
  userId: string,
  diSlug: string
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  return client
    .from("di_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("di_slug", diSlug)
    .maybeSingle();
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const diSlug = typeof body.diSlug === "string" ? body.diSlug.trim().toLowerCase() : "";
  const mode = body.mode === "chat" ? "chat" : "synthesis";
  const userTier = normalizeTier(body.userTier);
  const exhibitDomain = typeof body.exhibitDomain === "string" ? body.exhibitDomain.trim() : "";
  const topKRaw = Number(body.topK);
  const topK = Number.isFinite(topKRaw) ? Math.max(1, Math.min(12, Math.floor(topKRaw))) : 8;
  const isBootstrap = message === "__bootstrap__" || body.bootstrap === true;

  if (!message || !diSlug) {
    sendJson(res, 400, { error: "message and diSlug required" });
    return;
  }

  const profile = getDIProfile(diSlug);
  if (!profile || profile.profileStatus !== "active") {
    sendJson(res, 404, { error: `DI profile not found: ${diSlug}` });
    return;
  }

  const supabase = createSupabaseClient();
  const accessToken = getBearerToken(req);

  const authResult = supabase && accessToken
    ? await supabase.auth.getUser(accessToken)
    : { data: { user: null }, error: null };
  const userId = authResult.data.user?.id ?? null;
  const supabaseClient = supabase as any;

  const sessionRow =
    supabaseClient && userId
      ? ((await buildSessionLookup(supabaseClient, userId, diSlug)).data as
          | {
              id?: string | null;
              user_id?: string | null;
              di_slug?: string | null;
              session_thread?: string | null;
              mode_preference?: string | null;
              relational_depth?: number | null;
              quirk_activations?: Record<string, number> | null;
              last_session_at?: string | null;
            }
          | null)
      : null;

  const sessionCtx = {
    diSlug,
    userId: userId ?? undefined,
    relationalDepth: normalizeRelationalDepth(Number(sessionRow?.relational_depth ?? 0)),
    sessionThread: sessionRow?.session_thread ?? undefined,
    modePreference: sessionRow?.mode_preference ?? undefined,
    quirkActivations: sessionRow?.quirk_activations ?? undefined,
    lastSessionAt: sessionRow?.last_session_at ?? undefined,
  };

  let fragments: string[] = [];
  let memories: string[] = [];
  let retrievalMode: RetrievalMode = "none";

  try {
    const embedResult = await embedTextForRetrieval(message);
    const queryEmbedding = embedResult.embedding ?? null;

    if (queryEmbedding && queryEmbedding.length > 0) {
      const [knowledgeMatches, skillMatches] = await Promise.all([
        matchKnowledgeFragments({
          queryEmbedding,
          topK,
          packageFilter: exhibitDomain || null,
        }),
        matchSkillFragments({
          queryEmbedding,
          topK: Math.min(6, topK),
          skillFilter: diSlug,
        }),
      ]);

      const [knowledgeRows, skillRows] = await Promise.all([
        knowledgeMatches.length > 0
          ? Promise.resolve(knowledgeMatches)
          : searchKnowledgeFragments({
              query: message,
              topK,
              packageFilter: exhibitDomain || null,
            }),
        skillMatches.length > 0
          ? Promise.resolve(skillMatches)
          : searchSkillFragments({
              query: message,
              topK: Math.min(6, topK),
              skillFilter: diSlug,
            }),
      ]);

      const knowledgeSources = knowledgeRows.map((row, index) => formatKnowledgeSource(row, index));
      const skillSources = skillRows.map((row, index) =>
        formatKnowledgeSource(
          { source_file: row.source_file, content: row.content },
          knowledgeSources.length + index
        )
      );
      fragments = [...knowledgeSources, ...skillSources];
      retrievalMode = knowledgeMatches.length > 0 || skillMatches.length > 0 ? "semantic" : "text";

      if (userId) {
        const memoryResult = await retrieveMemoryEntries({
          userId,
          query: message,
          topK: 4,
          queryEmbedding,
        });

        memories = memoryResult.memories.map((memory, index) => formatMemorySource(memory, index));
        if (memoryResult.retrievalMode === "semantic") {
          retrievalMode = "semantic";
        } else if (memoryResult.retrievalMode === "text" || memoryResult.retrievalMode === "text-only") {
          retrievalMode = retrievalMode === "semantic" ? "semantic" : memoryResult.retrievalMode;
        }
      }
    }
  } catch {
    fragments = [];
    memories = [];
    retrievalMode = "none";
  }

  const founderCtx = userId ? await getFounderContext(userId, accessToken ?? undefined) : null;
  const messages = buildDIMessages(
    message,
    profile,
    fragments,
    memories,
    sessionCtx,
    founderCtx ? (founderCtx as unknown as Record<string, unknown>) : undefined
  );

  const systemPrompt = [
    messages[0].content,
    isBootstrap ? buildDIBootstrapPrompt(profile, sessionCtx) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const userPrompt = messages[1].content;

  const result = await routeLlm(userPrompt, {
    userId: userId ?? undefined,
    mode,
    tier: userTier,
    exhibit: exhibitDomain || diSlug,
    systemPrompt,
  });

  let memoryEventWritten = false;
  const updatedThread = buildSessionThread(sessionCtx, message, result.response);
  const updatedQuirkActivations = mergeQuirkActivations(sessionRow?.quirk_activations ?? {}, {});
  const nextDepth = normalizeRelationalDepth(sessionCtx.relationalDepth + 0.01);

  if (supabaseClient && userId) {
    await supabaseClient.from("di_sessions").upsert(
      {
        user_id: userId,
        di_slug: diSlug,
        session_thread: updatedThread,
        mode_preference: mode,
        relational_depth: nextDepth,
        quirk_activations: updatedQuirkActivations,
        last_session_at: new Date().toISOString(),
      },
      { onConflict: "user_id,di_slug" }
    );

    if (!isBootstrap) {
      const memoryEvent = evaluateForMemory({
        profile,
        diSlug,
        userMessage: message,
        assistantResponse: result.response,
        sessionCtx,
      });

      if (memoryEvent) {
        const { diSlug: _ignoredDiSlug, ...memoryEventPayload } = memoryEvent;
        await supabaseClient.from("di_memory_events").insert({
          ...memoryEventPayload,
          di_slug: diSlug,
          user_id: userId,
          session_id: sessionRow?.id ?? null,
        });
        memoryEventWritten = true;
      }
    }
  }

  const responseEnvelope = envelope(result.response, result.provider, {
    free: result.free,
    tokensUsed: result.tokensUsed ?? null,
    processingTime: result.processingTime ?? 0,
    metadata: {
      ...(result.metadata ?? {}),
      diSlug,
      conversationMode: mode,
      retrievalMode,
      contextSources: fragments.length,
      memorySources: memories.length,
      relationalDepth: sessionCtx.relationalDepth,
      sessionThread: updatedThread,
      memoryEventWritten,
      founderSessionActive: Boolean(founderCtx),
    },
  });

  sendJson(res, 200, {
    ...responseEnvelope,
    diSlug,
    conversationMode: mode,
    retrievalMode,
    contextSources: fragments,
    memorySources: memories,
    relationalDepth: sessionCtx.relationalDepth,
    sessionThread: updatedThread,
    memoryEventWritten,
    founderSessionActive: Boolean(founderCtx),
  });
}
