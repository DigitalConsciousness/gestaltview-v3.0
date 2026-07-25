// api/modules/resume-rockstar/analyze.ts
// © 2026 Keith Soyka — GestaltView
// ATS + PLK analysis — synchronous, no LLM call.
// POST { text: string }
// Returns ResumeAnalysis (ats, plk, metaphors, wordCount, analysisMs)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson } from "../../_lib/response.js";
import { prepareJsonRoute, readBody } from "../../gen-engine/_shared.js";
import { analyzeResume } from "../../../shared/modules/resumeRockstar.js";

interface AnalyzeBody {
  text?: string;
  section?: string; // optional label e.g. "experience", "objective"
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) return;

  const { text, section } = readBody<AnalyzeBody>(req);

  if (!text || typeof text !== "string" || !text.trim()) {
    sendJson(res, 400, { error: "text is required" });
    return;
  }

  if (text.length > 8_000) {
    sendJson(res, 400, { error: "text exceeds 8,000 character limit" });
    return;
  }

  try {
    const analysis = analyzeResume(text);
    sendJson(res, 200, {
      section: section ?? null,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[resume-rockstar/analyze]", err);
    sendJson(res, 500, { error: "Analysis failed" });
  }
}
