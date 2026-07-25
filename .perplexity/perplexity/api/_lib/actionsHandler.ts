// GestaltView v2 — Actions API Handler
// © 2026 Keith Soyka / GestaltView
//
// Shared actions endpoint logic used by both the historical catch-all route and
// explicit Vercel function files. The explicit files exist because the deployed
// catch-all route has been observed to fall through to the SPA shell.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { routeLlm, routerStatus } from "./llmRouter.js";
import { envelope, sendJson } from "./response.js";
import { withSentryVercelHandler } from "./sentry.js";
import { getUserId } from "./user.js";
import { traceBraintrust } from "../../instrument.js";
import type { BillyTier } from "../../shared/billy/types.js";

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
  content?: string;
  userId?: string;
  rawText?: string;
  captureContext?: Record<string, unknown>;
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Id");
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

function buildHealthPayload() {
  return {
    status: "ok",
    version: "1.0.0",
    schemaVersion: "2.0.0",
    platformVersion:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || process.env.VERCEL_ENV || "local",
    timestamp: new Date().toISOString(),
  };
}

async function buildProviderStatusPayload() {
  const status = await routerStatus();
  const providers = Object.entries(status)
    .map(([provider, value]) => {
      const record = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
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
  mode: string
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
        tier: normalizeTier(typeof body.userTier === "string" ? body.userTier : undefined),
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
  explicitPath?: string
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

  if (req.method === "POST" && (path === "chat" || path === "consciousness/reflect")) {
    const body = (req.body || {}) as Record<string, unknown>;
    const message = (typeof body.message === "string" ? body.message : "").trim();

    if (!message) {
      sendJson(res, 400, { error: "message is required" });
      return;
    }

    const mode = path === "chat" ? "chat" : "consciousness";
    const result = await buildAiEnvelope(req, body, message, mode);
    sendJson(res, 200, result);
    return;
  }

  if (req.method === "POST" && (path === "billy/synthesize" || path === "billy/loom" || path === "billy/code")) {
    const body = (req.body || {}) as SynthesisRequest;
    const input = (body.message || body.query || "").trim();

    if (!input) {
      sendJson(res, 400, { error: "message or query is required" });
      return;
    }

    const mode = path.endsWith("loom") ? "loom" : path.endsWith("code") ? "code" : body.mode || "synthesize";
    const result = await buildAiEnvelope(req, body as Record<string, unknown>, input, mode);

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

    if (!content) {
      sendJson(res, 400, { error: "content is required" });
      return;
    }

    const result = envelope("Bucket drop captured and preserved with original phrasing.", "bucket-drop-capture", {
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {
        userId: getUserId(req, body as Record<string, unknown>),
        bucketDrop: {
          content,
          rawText: body.rawText || null,
          captureContext: body.captureContext || null,
        },
      },
    });

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

    if (!question) {
      sendJson(res, 400, { error: "question is required" });
      return;
    }

    const result = await buildAiEnvelope(req, body as Record<string, unknown>, question, "tribunal");
    sendJson(res, 200, {
      ...result,
      metadata: {
        ...(result.metadata || {}),
        participants:
          Array.isArray(body.participants) && body.participants.length > 0
            ? body.participants
            : DEFAULT_TRIBUNAL_PARTICIPANTS,
      },
    });
    return;
  }

  const normalizedUnknownPath = path ? `/actions/${path}` : "/actions";
  sendJson(res, 404, { error: `Unknown actions route: ${normalizedUnknownPath}` });
}

export default withSentryVercelHandler(handleActionsRequest, "/api/actions", {
  captureHandledResponseErrors: false,
});
