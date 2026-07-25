// api/symbiocoder/analyze.ts
// GestaltView Phase 3 — SymbioCoder
// POST /api/symbiocoder/analyze
// Synchronous. No LLM.
// Returns full SymbioAnalysis: intent, emotion, flow, route, prompt fragments.
// Consumers (Billy, chat route, frontend) inject systemPromptFragment into
// their LLM call and optionally prepend userPromptFragment to the user message.
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeSymbio } from "../../shared/modules/symbioCoder";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body ?? {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (text.length > 20_000) {
    res.status(400).json({ error: "text exceeds 20,000 character limit" });
    return;
  }

  try {
    const result = analyzeSymbio(text);
    res.status(200).json(result);
  } catch (err) {
    console.error("[symbiocoder/analyze] error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
