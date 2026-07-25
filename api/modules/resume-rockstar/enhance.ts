// api/modules/resume-rockstar/enhance.ts
// © 2026 Keith Soyka — GestaltView
// Full 6-step enhancement pipeline: analyze → prompt → LLM → re-analyze → delta
// POST { text: string, targetRole?: string, plkProfile?: string }
// Returns EnhancementResult

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson } from "../../_lib/response.js";
import { prepareJsonRoute, readBody } from "../../gen-engine/_shared.js";
import { routeLlm } from "../../_lib/llmRouter.js";
import {
  analyzeResume,
  buildEnhancementPrompt,
} from "../../../shared/modules/resumeRockstar.js";

interface EnhanceBody {
  text?: string;
  targetRole?: string;
  plkProfile?: string; // optional PLK string injected into system prompt
  userId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) return;

  const { text, targetRole, plkProfile, userId } = readBody<EnhanceBody>(req);

  if (!text || typeof text !== "string" || !text.trim()) {
    sendJson(res, 400, { error: "text is required" });
    return;
  }

  if (text.length > 6_000) {
    sendJson(res, 400, { error: "text exceeds 6,000 character limit" });
    return;
  }

  const start = Date.now();

  try {
    // Step 1: Baseline analysis
    const atsBefore = analyzeResume(text).ats;
    const plkBefore = analyzeResume(text).plk;

    // Step 2 & 3: Build PLK-aware enhancement prompt
    const userPrompt = buildEnhancementPrompt(text, plkBefore, atsBefore, targetRole);

    // Step 4: LLM call through standard cascade
    const llmResult = await routeLlm(userPrompt, {
      userId,
      mode: "resume-rockstar",
      systemPrompt: `You are Resume Rockstar, a consciousness-serving resume enhancer inside GestaltView. 
Your job is to enhance resume text while preserving the author's exact voice, metaphors, and authentic expression.
PLK constraint: Never paraphrase their signature language. ATS constraint: Score must improve.
Output the enhanced text only — no preamble, no commentary, no "Here's the enhanced version:" framing.`,
      plk: plkProfile,
    });

    const enhanced = llmResult.response.trim();

    // Step 5: Post-analysis
    const atsAfter = analyzeResume(enhanced).ats;
    const plkAfter = analyzeResume(enhanced).plk;

    // Step 6: Delta + metaphor preservation count
    const metaphorsBefore = new Set(plkBefore.metaphors.map((m) => m.text.toLowerCase()));
    const metaphorsAfter = new Set(plkAfter.metaphors.map((m) => m.text.toLowerCase()));
    const metaphorsPreserved = [...metaphorsBefore].filter((m) => metaphorsAfter.has(m)).length;

    sendJson(res, 200, {
      original: text,
      enhanced,
      atsBefore,
      atsAfter,
      plkBefore,
      plkAfter,
      metaphorsPreserved,
      metaphorsTotal: metaphorsBefore.size,
      atsDelta: Math.round((atsAfter.total - atsBefore.total) * 10) / 10,
      plkDelta: Math.round((plkAfter.score - plkBefore.score) * 10) / 10,
      provider: llmResult.provider,
      processingMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[resume-rockstar/enhance]", err);
    sendJson(res, 500, { error: "Enhancement failed" });
  }
}
