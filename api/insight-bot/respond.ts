import { randomUUID, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { routeLlm } from "../_lib/llmRouter.js";
import {
  INSIGHT_BOT_SCHEMA_VERSION,
  parseInsightRuntimeRequest,
  toPublicInsightResponse,
  type InsightRuntimeResponse,
} from "../../shared/insight-bot/contracts.js";

const INSIGHT_SYSTEM_PROMPT = `You are Insight-Bot, a public doorway into GestaltView.
Respond with warmth, precision, and practical clarity while preserving the user's language.
Separate known facts from inference and uncertainty. Never claim access to private profiles,
private memory, or hidden context. Do not diagnose or claim clinical care. Capture and artifact
creation are proposals only and always require explicit user approval. If the user may be in
immediate danger, encourage immediate contact with local emergency services and a trusted human.`;

function secureEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

function authorized(req: VercelRequest): boolean {
  const expected = process.env.GESTALTVIEW_RUNTIME_TOKEN?.trim();
  if (!expected) return process.env.NODE_ENV === "test";
  const header = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization;
  return Boolean(header?.startsWith("Bearer ")) && secureEqual(header!.slice(7), expected);
}

function crisisLanguage(text: string): boolean {
  return /\b(kill myself|end my life|hurt myself|suicide|suicidal|self[- ]harm)\b/i.test(
    text,
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!authorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let input;
  try {
    input = parseInsightRuntimeRequest(req.body);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid request",
    });
    return;
  }

  const traceId = randomUUID();
  const crisisDetected = crisisLanguage(input.context.originalText);
  const mode = input.context.mode ?? "respond";

  try {
    const result = await routeLlm(input.context.originalText, {
      mode: `insight-bot:${mode}`,
      systemPrompt: INSIGHT_SYSTEM_PROMPT,
      tier: "anonymous",
    });
    const content = crisisDetected
      ? "You deserve immediate human support. Please contact local emergency services now if you may act on this, and reach out to a trusted person who can stay with you. Insight-Bot is not clinical or emergency care."
      : result.response;

    const actions: InsightRuntimeResponse["actions"] = [];
    if (!crisisDetected && mode === "capture" && input.consent.allowCapture) {
      actions.push({
        kind: "capture",
        status: "proposed",
        originalText: input.context.originalText,
        requiresUserApproval: true,
      });
    }
    if (!crisisDetected && mode === "artifact" && input.consent.allowArtifactProposal) {
      actions.push({
        kind: "artifact",
        status: "proposed",
        title: "Insight-Bot draft",
        body: content,
        sourceRequestId: input.requestId,
        requiresUserApproval: true,
      });
    }

    const response: InsightRuntimeResponse = {
      schemaVersion: INSIGHT_BOT_SCHEMA_VERSION,
      requestId: input.requestId,
      content,
      trace: {
        traceId,
        provider: result.provider,
        route: "gestaltview-runtime",
        generatedAt: new Date().toISOString(),
        uncertainty: result.provider === "offline-fallback" ? "high" : "unknown",
        ...(result.provider === "offline-fallback"
          ? { limitations: ["Configured model providers were unavailable."] }
          : {}),
      },
      ...(actions.length ? { actions } : {}),
      safety: {
        crisisDetected,
        ...(crisisDetected ? { humanSupportRecommended: true } : {}),
        publicPostingAllowed: !crisisDetected,
      },
    };

    res
      .status(200)
      .json(
        input.source.visibility === "public"
          ? toPublicInsightResponse(response)
          : response,
      );
  } catch (error) {
    console.error("[insight-bot] runtime failure", {
      requestId: input.requestId,
      traceId,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(503).json({
      error: "GestaltView runtime unavailable",
      requestId: input.requestId,
      traceId,
    });
  }
}
