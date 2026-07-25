import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "./_lib/response.js";
import { routeLlm } from "./_lib/llmRouter.js";
import {
  buildRecapPrompt,
  buildRecapFallbackHtml,
  buildRecapSystemPrompt,
  cleanRecapHtml,
  normalizeRecapVoice,
  validateRecapHtml,
  type RecapCaptureShape,
  type RecapMessageShape,
} from "../shared/sessionRecap.js";

interface RecapRequestBody {
  captures?: RecapCaptureShape[];
  conversationHistory?: RecapMessageShape[];
  sessionLabel?: string;
  di?: string;
}

function buildAttemptNote(errors: string[]): string {
  return [
    "Previous attempt did not meet the HTML finish gate.",
    "Repair the artifact before answering.",
    `Validation failures: ${errors.join(", ")}`,
  ].join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = (req.body ?? {}) as RecapRequestBody;
    const captures = Array.isArray(body.captures) ? body.captures : [];
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const sessionLabel = typeof body.sessionLabel === "string" ? body.sessionLabel : "";
    const recapVoice = normalizeRecapVoice(body.di);

    const systemPrompt = buildRecapSystemPrompt(recapVoice);
    const prompt = buildRecapPrompt(captures, conversationHistory, sessionLabel);
    const startedAt = Date.now();

    let providerResult = null as Awaited<ReturnType<typeof routeLlm>> | null;
    let validationErrors: string[] = [];
    let finalHtml = "";
    let usedFallback = false;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const attemptPrompt = attempt === 0 ? prompt : buildRecapPrompt(captures, conversationHistory, sessionLabel, buildAttemptNote(validationErrors));
      providerResult = await routeLlm(attemptPrompt, {
        mode: "session_recap",
        systemPrompt,
        exhibit: "session_recap",
      });

      const cleaned = cleanRecapHtml(providerResult.response ?? "");
      const validation = validateRecapHtml(cleaned);
      if (validation.ok) {
        finalHtml = cleaned;
        break;
      }

      validationErrors = validation.errors;

      if (attempt < 1) {
        continue;
      }

      console.warn("[sessionRecap] invalid provider recap html", validation.errors);
      const fallbackHtml = buildRecapFallbackHtml(captures, conversationHistory, sessionLabel, recapVoice);
      const fallbackValidation = validateRecapHtml(fallbackHtml);

      if (!fallbackValidation.ok) {
        console.error("[sessionRecap] fallback recap html failed validation", fallbackValidation.errors);
        validationErrors = fallbackValidation.errors;
        continue;
      }

      finalHtml = fallbackHtml;
      usedFallback = true;
      break;
    }

    if (!finalHtml || !providerResult) {
      sendJson(
        res,
        validationErrors.length > 0 ? 502 : 500,
        {
          error: validationErrors.length > 0
            ? "Recap generation did not produce a finished HTML artifact."
            : "Recap generation failed.",
        },
      );
      return;
    }

    sendJson(res, 200, {
      html: finalHtml,
      provider: usedFallback ? "session-recap-fallback" : providerResult.provider,
      free: providerResult.free,
      tokensUsed: providerResult.tokensUsed,
      timestamp: providerResult.timestamp,
      di: recapVoice,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("Failed to generate session recap", error);
    sendJson(res, 500, { error: "Recap generation failed." });
  }
}
