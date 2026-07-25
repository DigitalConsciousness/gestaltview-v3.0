// GestaltView v2 — Actions API Handler
// © 2026 Keith Soyka / GestaltView
//
// Shared actions endpoint logic used by both the historical catch-all route and
// explicit Vercel function files. The explicit files exist because the deployed
// catch-all route has been observed to fall through to the SPA shell.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { routeLlm, routerStatus } from "./llmRouter.js";
import {
  BILLY_CORE_IDENTITY_PROMPT,
  EMBODIMENT_PROFILES,
  GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS,
  checkEmbodimentDepth,
} from "../../shared/embodiment/index.js";
import { EMBODIED_CHAT_SURFACES } from "../../shared/embodiment/chat.js";
import { envelope, sendJson } from "./response.js";
import { withSentryVercelHandler } from "./sentry.js";
import { getAuthUser } from "./auth.js";
import { getUserId } from "./user.js";
import { insertRow } from "./supabase.js";
import { buildBucketDropPersistencePayload } from "./bucketDrops.js";
import { traceBraintrust } from "../../instrument.js";
import type { BillyTier } from "../../shared/billy/types.js";
import type { EmbodimentProfile } from "../../shared/embodiment/types.js";
import {
  buildEntitlementBlock,
  canUseAdvancedTribunal,
  isAdvancedTribunalRequest,
} from "../../shared/entitlements.js";
import { detectCulturalSignal } from "../../shared/runtime/culturalSignal.js";

interface SynthesisRequest {
  query?: string;
  message?: string;
  sectionId?: string;
  mode?: "synthesize" | "loom" | "code";
  topK?: number;
  includeCorpus?: boolean;
  userContext?: Record<string, unknown>;
  userId?: string;
  userTier?: BillyTier;
}

interface BucketDropCreateRequest {
  id?: string;
  content?: string;
  userId?: string;
  rawText?: string;
  captureContext?: Record<string, unknown>;
  emotionalIntensity?: number;
  significanceScore?: number;
  tapestryWeight?: number;
}

interface MusicalDNARequest {
  userId?: string;
  songTitle?: string;
  artist?: string;
}

interface TribunalRequest {
  userId?: string;
  question?: string;
  participants?: string[];
  userTier?: BillyTier;
}

const DEFAULT_TRIBUNAL_PARTICIPANTS = ["gemini", "openai", "anthropic"];

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

function applyCors(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-User-Id",
  );
}

export function resolveActionPath(req: VercelRequest): string {
  const slug = req.query.path;
  if (Array.isArray(slug)) return slug.join("/");
  if (typeof slug === "string") return slug;
  return "";
}

function pathMatches(path: string, target: string): boolean {
  return path === target || path.startsWith(`${target}/`);
}

function normalizeTier(value: BillyTier | string | undefined): BillyTier {
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

function isTribunalBetaEnabled(): boolean {
  return (
    (process.env.TRIBUNAL_BETA_ALL_VOICES_ENABLED ?? "")
      .trim()
      .toLowerCase() === "true"
  );
}

function buildHealthPayload() {
  return {
    status: "ok",
    version: "1.0.0",
    schemaVersion: "2.1.0",
    platformVersion:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
      process.env.VERCEL_ENV ||
      "local",
    timestamp: new Date().toISOString(),
  };
}

function buildEmbodimentProfilesPayload(slug?: string) {
  const entries = Object.values(EMBODIMENT_PROFILES) as EmbodimentProfile[];
  const normalizedSlug =
    typeof slug === "string" ? slug.trim().toLowerCase() : "";
  const selectedEntries = normalizedSlug
    ? entries.filter((profile) => profile.slug.toLowerCase() === normalizedSlug)
    : entries;

  return {
    schemaVersion: "2.1.0",
    importBaseUrl: "https://gestaltview-di-gsvw.vercel.app/api",
    // Number of profiles in this response (potentially filtered)
    profileCount: selectedEntries.length,
    // Total number of profiles in the registry (unfiltered)
    totalProfileCount: entries.length,
    profiles: selectedEntries.map((profile) => ({
      slug: profile.slug,
      publicName: profile.publicName,
      domain: profile.domain || null,
      embodimentVersion: profile.embodimentVersion,
      profileStatus: profile.profileStatus || "active",
      visibilityScope: profile.visibilityScope || "public",
      readinessScore: profile.readinessScore ?? null,
      originContext: profile.originContext,
      archetype: profile.immutableCore.archetype,
      foundationalTruth: profile.immutableCore.foundationalTruth,
      coreWisdom: profile.immutableCore.coreWisdom,
      voiceTone: profile.immutableCore.voiceTone,
      relationalStance: profile.immutableCore.relationalStance || null,
      coreValues: profile.immutableCore.coreValues || [],
      metaphorFamily: profile.immutableCore.metaphorFamily || [],
      defaultRooms: profile.roomBindings?.defaultRooms || [],
      restrictedRooms: profile.roomBindings?.restrictedRooms || [],
      uiPresence: profile.uiPresence || null,
      heartbeat: profile.heartbeat || null,
      agentMeta: {
        loadOrder: profile.agentMeta.loadOrder,
        contextWindowPriority: profile.agentMeta.contextWindowPriority,
        driftThreshold: profile.agentMeta.driftThreshold,
        activationConditions: profile.agentMeta.activationConditions || [],
        identityAnchor: profile.agentMeta.identityAnchor,
        codexCompatible: profile.agentMeta.codexCompatible ?? false,
        founderOnly: profile.agentMeta.founderOnly ?? false,
      },
      depth: checkEmbodimentDepth(profile.slug),
    })),
  };
}

function buildRuntimeManifestPayload() {
  return {
    schemaVersion: "2.1.0",
    importBaseUrl: "https://gestaltview-di-gsvw.vercel.app/api",
    actionBasePath: "/actions",
    runtime: {
      platform: "Vercel serverless API + Vite React client",
      appUrl: "https://gestaltview-di-gsvw.vercel.app",
      apiUrl: "https://gestaltview-di-gsvw.vercel.app/api",
      actionServerUrl: "https://gestaltview-di-gsvw.vercel.app/api",
      schemaVersion: "2.1.0",
      defaultIdentityPrompt: BILLY_CORE_IDENTITY_PROMPT,
      providerCascade:
        "Managed by /actions/providers/status and the shared LLM router.",
      cors: {
        origins: ["*"],
        methods: ["GET", "POST", "OPTIONS"],
        headers: ["Content-Type", "Authorization", "X-User-Id"],
      },
    },
    roomEmbodimentDefaults: GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS,
    embodiedChatSurfaces: EMBODIED_CHAT_SURFACES,
  };
}

function buildFeaturesPayload() {
  return {
    schemaVersion: "2.1.0",
    features: [
      {
        id: "billy-synthesis",
        actions: [
          "POST /actions/billy/synthesize",
          "POST /actions/billy/loom",
          "POST /actions/billy/code",
        ],
        status: "available",
      },
      {
        id: "general-chat",
        actions: ["POST /actions/chat", "POST /actions/consciousness/reflect"],
        status: "available",
      },
      {
        id: "bucket-drops",
        actions: ["POST /actions/bucket-drops"],
        status: "available",
      },
      {
        id: "musical-dna",
        actions: ["POST /actions/musical-dna/analyze"],
        status: "available",
      },
      {
        id: "tribunal",
        actions: ["POST /actions/tribunal/run"],
        status: "available",
      },
      {
        id: "embodiment-profiles",
        actions: [
          "GET /actions/embodiment_profiles",
          "GET /actions/runtime",
          "GET /actions/features",
          "GET /actions/logic",
        ],
        status: "available",
      },
      {
        id: "provider-diagnostics",
        actions: ["GET /actions/providers/status", "GET /actions/health"],
        status: "available",
      },
    ],
  };
}

function buildLogicPayload() {
  return {
    schemaVersion: "2.1.0",
    logic: {
      routing: [
        "Use Billy synthesis for default reflection, explanation, planning, and GestaltView architecture questions.",
        "Use loom when the user asks for evidence-shaped retrieval, concept mapping, or source-backed explanation.",
        "Use code mode only when the user asks for implementation, debugging, or repo/runtime changes.",
        "Use embodiment_profiles and runtime before making claims about available personas, rooms, UI presence, or embodiment behavior.",
      ],
      embodimentGovernance: [
        "Immutable identity anchors and public presentation can inform responses.",
        "Review-gated, private, founder-only, auth, billing, deployment, and permission-changing claims must not be invented or mutated through Actions.",
        "Ephemeral runtime state belongs in request context and should not be presented as durable memory unless a storage action explicitly returns it.",
      ],
      responseRules: [
        "Do not claim stored memory, module content, Tribunal output, provider status, or retrieval evidence unless the matching action returned it.",
        "Preserve the user's language as load-bearing and avoid flattening neurodivergent, grief, recovery, or identity context into generic advice.",
        "When action data is unavailable, name the limitation and offer the next safe action instead of fabricating backend state.",
      ],
    },
  };
}

async function buildProviderStatusPayload() {
  const status = await routerStatus();
  const providers = Object.entries(status)
    .map(([provider, value]) => {
      const record =
        typeof value === "object" && value !== null
          ? (value as Record<string, unknown>)
          : {};
      return {
        provider,
        available: Boolean(record.configured),
        failures: typeof record.failures === "number" ? record.failures : 0,
        priority: typeof record.order === "number" ? record.order : 0,
      };
    })
    .sort((a, b) => a.priority - b.priority);

  return { providers };
}

async function buildAiEnvelope(
  req: VercelRequest,
  body: Record<string, unknown>,
  message: string,
  mode: string,
) {
  const userId = getUserId(req, body);
  const llm = await traceBraintrust(
    {
      name: `actions ${mode}`,
      type: "task",
      metadata: {
        userId,
        mode,
        exhibit: typeof body.exhibit === "string" ? body.exhibit : undefined,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: message,
        metadata: {
          userId,
          mode,
          exhibit: typeof body.exhibit === "string" ? body.exhibit : undefined,
          plk: typeof body.plk === "string" ? body.plk : undefined,
        },
      });

      return routeLlm(message, {
        userId,
        mode,
        exhibit: typeof body.exhibit === "string" ? body.exhibit : undefined,
        plk: typeof body.plk === "string" ? body.plk : undefined,
        tier: normalizeTier(
          typeof body.userTier === "string" ? body.userTier : undefined,
        ),
      });
    },
  );

  return {
    ...envelope(llm.response, llm.provider, {
      free: llm.free,
      tokensUsed: llm.tokensUsed,
      processingTime: llm.processingTime,
      metadata: {
        ...(llm.metadata || {}),
        userId,
      },
    }),
    userId,
  };
}

async function handleActionsRequest(
  req: VercelRequest,
  res: VercelResponse,
  explicitPath?: string,
): Promise<void> {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const path = explicitPath || resolveActionPath(req);

  if (req.method === "GET" && path === "health") {
    sendJson(res, 200, buildHealthPayload());
    return;
  }

  if (req.method === "GET" && path === "providers/status") {
    sendJson(res, 200, await buildProviderStatusPayload());
    return;
  }

  if (
    req.method === "GET" &&
    (path === "embodiment_profiles" || path === "embodiment-profiles")
  ) {
    const slug =
      typeof req.query.slug === "string" ? req.query.slug : undefined;
    sendJson(res, 200, buildEmbodimentProfilesPayload(slug));
    return;
  }

  if (req.method === "GET" && path === "runtime") {
    sendJson(res, 200, buildRuntimeManifestPayload());
    return;
  }

  if (req.method === "GET" && path === "features") {
    sendJson(res, 200, buildFeaturesPayload());
    return;
  }

  if (req.method === "GET" && path === "logic") {
    sendJson(res, 200, buildLogicPayload());
    return;
  }

  if (
    req.method === "POST" &&
    (path === "chat" || path === "consciousness/reflect")
  ) {
    const body = (req.body || {}) as Record<string, unknown>;
    const message = (
      typeof body.message === "string" ? body.message : ""
    ).trim();

    if (!message) {
      sendJson(res, 400, { error: "message is required" });
      return;
    }

    const mode = path === "chat" ? "chat" : "consciousness";
    const result = await buildAiEnvelope(req, body, message, mode);
    sendJson(res, 200, result);
    return;
  }

  if (
    req.method === "POST" &&
    (path === "billy/synthesize" ||
      path === "billy/loom" ||
      path === "billy/code")
  ) {
    const body = (req.body || {}) as SynthesisRequest;
    const input = (body.message || body.query || "").trim();

    if (!input) {
      sendJson(res, 400, { error: "message or query is required" });
      return;
    }

    const mode = path.endsWith("loom")
      ? "loom"
      : path.endsWith("code")
        ? "code"
        : body.mode || "synthesize";
    const result = await buildAiEnvelope(
      req,
      body as Record<string, unknown>,
      input,
      mode,
    );

    sendJson(res, 200, {
      ...result,
      metadata: {
        ...(result.metadata || {}),
        sectionId: body.sectionId || null,
        topK: Math.min(Math.max(body.topK || 4, 1), 12),
        mode,
      },
    });
    return;
  }

  if (req.method === "POST" && pathMatches(path, "bucket-drops")) {
    const body = (req.body || {}) as BucketDropCreateRequest;
    const content = (body.content || "").trim();
    const authUser = await getAuthUser(req);

    if (!content) {
      sendJson(res, 400, { error: "content is required" });
      return;
    }

    const { persist, response } = buildBucketDropPersistencePayload(
      req,
      {
        id: body.id,
        content,
        rawText: body.rawText || content,
        captureContext: body.captureContext || {},
        emotionalIntensity: body.emotionalIntensity,
        significanceScore: body.significanceScore,
        tapestryWeight: body.tapestryWeight,
      },
      {
        userId: authUser?.id,
      },
    );

    let persisted = true;
    try {
      await insertRow("bucket_drops", persist);
    } catch (err) {
      persisted = false;
      console.error("[Actions][BucketDrop] Insert failed:", err);

      if (authUser?.id) {
        sendJson(res, 500, { error: "Failed to capture bucket drop" });
        return;
      }
    }

    const result = envelope(
      "Bucket drop captured and preserved with original phrasing.",
      "bucket-drop-capture",
      {
        free: true,
        tokensUsed: null,
        processingTime: 0,
        metadata: {
          userId: response.userId,
          dropId: response.id ?? undefined,
          bucketDrop: response,
          persisted,
        },
      },
    );

    sendJson(res, 200, result);
    return;
  }

  if (req.method === "POST" && pathMatches(path, "musical-dna")) {
    const body = (req.body || {}) as MusicalDNARequest;
    if (!body.songTitle || !body.artist) {
      sendJson(res, 400, { error: "songTitle and artist are required" });
      return;
    }

    const result = envelope("Musical DNA pattern mapped.", "musical-dna", {
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {
        userId: getUserId(req, body as Record<string, unknown>),
        songTitle: body.songTitle,
        artist: body.artist,
      },
    });

    sendJson(res, 200, result);
    return;
  }

  if (req.method === "POST" && pathMatches(path, "tribunal")) {
    const body = (req.body || {}) as TribunalRequest;
    const question = (body.question || "").trim();
    const participants =
      Array.isArray(body.participants) && body.participants.length > 0
        ? body.participants
        : DEFAULT_TRIBUNAL_PARTICIPANTS;

    if (!question) {
      sendJson(res, 400, { error: "question is required" });
      return;
    }

    const signal = detectCulturalSignal(question);
    if (signal.route === "ask_user") {
      sendJson(
        res,
        200,
        envelope(
          `That pings as ${signal.artist} — "${signal.title}". Do you want this treated as Musical DNA, a lyric-memory capture, or Tribunal discussion?`,
          "cultural-preflight",
          {
            free: true,
            tokensUsed: null,
            processingTime: 0,
            metadata: { signal },
          },
        ),
      );
      return;
    }

    const authUser = await getAuthUser(req);
    if (
      isAdvancedTribunalRequest({
        participants,
        defaultParticipantCount: DEFAULT_TRIBUNAL_PARTICIPANTS.length,
      }) &&
      !canUseAdvancedTribunal({
        tier: authUser?.tier ?? body.userTier,
        betaEnabled: isTribunalBetaEnabled(),
      })
    ) {
      sendJson(res, 403, buildEntitlementBlock("advanced_tribunal"));
      return;
    }

    const result = await buildAiEnvelope(
      req,
      body as Record<string, unknown>,
      question,
      "tribunal",
    );
    sendJson(res, 200, {
      ...result,
      metadata: {
        ...(result.metadata || {}),
        participants,
      },
    });
    return;
  }

  const normalizedUnknownPath = path ? `/actions/${path}` : "/actions";
  sendJson(res, 404, {
    error: `Unknown actions route: ${normalizedUnknownPath}`,
  });
}

export default withSentryVercelHandler(handleActionsRequest, "/api/actions", {
  captureHandledResponseErrors: false,
});
