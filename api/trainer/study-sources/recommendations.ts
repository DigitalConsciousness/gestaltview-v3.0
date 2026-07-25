import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";

import { sendJson } from "../../_lib/response.js";
import { handleTrainerOptions, requireTrainerAdmin } from "../_helpers.js";
import { recommendTrainerStudySources } from "../../../server/agent-trainer/study-sources.js";
import { SubmitTrainingRunRequestSchema } from "../../../shared/agent-trainer/schemas.js";

const RECOMMENDATIONS_ROUTE_TIMEOUT_MS = 6_000;
let lastGoodRecommendationSnapshot: Awaited<ReturnType<typeof recommendTrainerStudySources>> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      const timer = setTimeout(() => resolve(fallback), ms);
      timer.unref?.();
    }),
  ]);
}

function parseDraftFromGetQuery(req: VercelRequest): unknown {
  const serialized = Array.isArray(req.query.runDraft) ? req.query.runDraft[0] : req.query.runDraft;
  if (!serialized) {
    throw new Error("Missing runDraft query parameter.");
  }

  return JSON.parse(serialized) as unknown;
}

function parseDraftFromPostBody(req: VercelRequest): unknown {
  const rawBody = req.body;
  const parsedBody =
    typeof rawBody === "string"
      ? (JSON.parse(rawBody) as unknown)
      : rawBody;
  if (!parsedBody || typeof parsedBody !== "object") {
    throw new Error("Missing trainer draft payload.");
  }

  const draftCandidate =
    "runDraft" in parsedBody
      ? (parsedBody as { runDraft?: unknown }).runDraft
      : parsedBody;
  if (!draftCandidate || typeof draftCandidate !== "object") {
    throw new Error("Missing trainer draft payload.");
  }

  if (Object.keys(draftCandidate as Record<string, unknown>).length === 0) {
    throw new Error("Missing trainer draft payload.");
  }

  return draftCandidate;
}

function parseLimit(req: VercelRequest): number {
  const queryLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const bodyLimit =
    req.body && typeof req.body === "object" && "limit" in req.body
      ? (req.body as { limit?: unknown }).limit
      : undefined;
  const candidate = queryLimit ?? bodyLimit ?? 6;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "POST"])) {
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const rawDraft =
      req.method === "POST"
        ? parseDraftFromPostBody(req)
        : parseDraftFromGetQuery(req);
    const draft = SubmitTrainingRunRequestSchema.parse(rawDraft);
    const recommendationResponse = await withTimeout(
      recommendTrainerStudySources({
        brief: draft,
        limit: parseLimit(req),
      }),
      RECOMMENDATIONS_ROUTE_TIMEOUT_MS,
      lastGoodRecommendationSnapshot
        ? {
            ...lastGoodRecommendationSnapshot,
            degraded: true,
            reason: "trainer_recommendations_timeout",
            fallbackSource: "last_good_snapshot",
          }
        : {
            degraded: true,
            reason: "trainer_recommendations_timeout",
            fallbackSource: "empty",
            recommendations: [],
            retrievalQuery: "",
            sourceFiles: [],
          }
    );

    if (!recommendationResponse.degraded && recommendationResponse.recommendations.length > 0) {
      lastGoodRecommendationSnapshot = recommendationResponse;
    }

    sendJson(res, 200, {
      ok: true,
      degraded: Boolean((recommendationResponse as { degraded?: unknown }).degraded),
      ...recommendationResponse,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      sendJson(res, 400, {
        ok: false,
        degraded: false,
        reason: "invalid_trainer_draft",
        error: "Missing trainer draft payload.",
      });
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate trainer study-source recommendations.";
    const status =
      message.includes("Missing runDraft") || message.includes("Missing trainer draft payload")
        ? 400
        : 200;
    sendJson(res, status, {
      ok: status === 200,
      degraded: status === 200,
      reason: status === 200 ? "trainer_recommendations_unavailable" : "invalid_trainer_draft",
      error: message,
      fallbackSource: status === 200 && lastGoodRecommendationSnapshot ? "last_good_snapshot" : "empty",
      recommendations: status === 200 ? (lastGoodRecommendationSnapshot?.recommendations ?? []) : [],
      retrievalQuery: status === 200 ? (lastGoodRecommendationSnapshot?.retrievalQuery ?? "") : "",
      sourceFiles: status === 200 ? (lastGoodRecommendationSnapshot?.sourceFiles ?? []) : [],
    });
  }
}
