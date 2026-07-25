// api/vibecoder/analyze.ts
// GestaltView Phase 3 — VibeCoder
// POST /api/vibecoder/analyze
// Modes:
//   { text }                    → single-text analysis (clarity + self-vibe)
//   { source, target }          → compare source voice against target output
// Synchronous. No LLM. Returns VibeAnalysis or comparison result.
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  analyzeVibe,
  calculateClarityScore,
  calculateVibeScore,
} from "../../shared/modules/vibeCoder";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text, source, target } = req.body ?? {};

  // ── Mode 2: source vs target comparison ───────────────────────────────────
  if (source !== undefined || target !== undefined) {
    if (!source || typeof source !== "string" || source.trim().length === 0) {
      res.status(400).json({ error: "source is required for comparison mode" });
      return;
    }
    if (!target || typeof target !== "string" || target.trim().length === 0) {
      res.status(400).json({ error: "target is required for comparison mode" });
      return;
    }
    if (source.length > 50_000 || target.length > 50_000) {
      res.status(400).json({ error: "source and target must each be under 50,000 characters" });
      return;
    }

    try {
      const start = Date.now();
      const cleanedSource = source.trim().replace(/\r\n/g, "\n");
      const cleanedTarget = target.trim().replace(/\r\n/g, "\n");

      const result = {
        mode: "comparison",
        source: {
          text: cleanedSource,
          wordCount: cleanedSource.split(/\s+/).filter(Boolean).length,
          clarity: calculateClarityScore(cleanedSource),
        },
        target: {
          text: cleanedTarget,
          wordCount: cleanedTarget.split(/\s+/).filter(Boolean).length,
          clarity: calculateClarityScore(cleanedTarget),
        },
        vibe: calculateVibeScore(cleanedSource, cleanedTarget),
        analysisMs: Date.now() - start,
      };

      res.status(200).json(result);
    } catch (err) {
      console.error("[vibecoder/analyze] comparison error:", err);
      res.status(500).json({ error: "Comparison failed" });
    }
    return;
  }

  // ── Mode 1: single-text analysis ──────────────────────────────────────────
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({
      error: "Provide either { text } for single analysis or { source, target } for comparison",
    });
    return;
  }

  if (text.length > 50_000) {
    res.status(400).json({ error: "text exceeds 50,000 character limit" });
    return;
  }

  try {
    const result = { mode: "single", ...analyzeVibe(text) };
    res.status(200).json(result);
  } catch (err) {
    console.error("[vibecoder/analyze] error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
