// api/resume-rockstar/analyze.ts
// GestaltView Phase 3 — Resume Rockstar
// POST /api/resume-rockstar/analyze
// Synchronous. No LLM. Returns full ATS + PLK + metadata.
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeResume } from "../../shared/modules/resumeRockstar";

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

  if (text.length > 50_000) {
    res.status(400).json({ error: "text exceeds 50,000 character limit" });
    return;
  }

  try {
    const result = analyzeResume(text);
    res.status(200).json(result);
  } catch (err) {
    console.error("[analyze] error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
}
