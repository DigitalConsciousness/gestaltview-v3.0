// api/resume-rockstar/score-section.ts
// GestaltView Phase 3 — Resume Rockstar
// POST /api/resume-rockstar/score-section
// Lightweight single-bullet / single-paragraph scorer.
// Same engine as /analyze but optimised for inline UI feedback.
// Returns ATS + PLK + top metaphors. No word-count floor enforced.
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  calculateATSScore,
  calculatePLKScore,
} from "../../shared/modules/resumeRockstar";

export interface SectionScoreResult {
  ats: ReturnType<typeof calculateATSScore>;
  plk: ReturnType<typeof calculatePLKScore>;
  wordCount: number;
  scoredMs: number;
}

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

  // Soft cap: a single section shouldn't exceed 5,000 chars
  if (text.length > 5_000) {
    res.status(400).json({
      error: "text exceeds 5,000 character limit for section scoring. Use /analyze for full documents.",
    });
    return;
  }

  const start = Date.now();

  try {
    const cleaned = text.trim().replace(/\r\n/g, "\n");
    const ats = calculateATSScore(cleaned);
    const plk = calculatePLKScore(cleaned);
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

    const result: SectionScoreResult = {
      ats,
      plk,
      wordCount,
      scoredMs: Date.now() - start,
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("[score-section] error:", err);
    res.status(500).json({ error: "Scoring failed" });
  }
}
