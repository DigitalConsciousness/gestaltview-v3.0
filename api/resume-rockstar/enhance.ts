// api/resume-rockstar/enhance.ts
// GestaltView Phase 3 — Resume Rockstar
// POST /api/resume-rockstar/enhance
// Calls Groq (primary) → HuggingFace (fallback).
// Returns EnhancementResult with before/after ATS+PLK scores.
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  analyzeResume,
  buildEnhancementPrompt,
} from "../../shared/modules/resumeRockstar";
import type { EnhancementResult } from "../../shared/modules/resumeRockstar";

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN ?? "";

// ─── Groq (primary) ──────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("Groq returned empty content");
  return content.trim();
}

// ─── HuggingFace (fallback) ───────────────────────────────────────────────────

async function callHuggingFace(prompt: string): Promise<string> {
  const res = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 512, temperature: 0.4 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HuggingFace ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  // HF returns [{generated_text: "<prompt>...<completion>"}]
  // Strip the echoed prompt to get only the completion.
  const raw: string = json?.[0]?.generated_text ?? "";
  const stripped = raw.startsWith(prompt)
    ? raw.slice(prompt.length).trim()
    : raw.trim();
  if (!stripped) throw new Error("HuggingFace returned empty content");
  return stripped;
}

// ─── Provider router ─────────────────────────────────────────────────────────

async function callLLM(prompt: string): Promise<{ text: string; provider: string }> {
  if (GROQ_API_KEY) {
    try {
      const text = await callGroq(prompt);
      return { text, provider: "groq/llama-3.1-8b-instant" };
    } catch (err) {
      console.warn("[enhance] Groq failed, falling back to HuggingFace:", err);
    }
  }

  if (HF_TOKEN) {
    const text = await callHuggingFace(prompt);
    return { text, provider: "huggingface/Mistral-7B-Instruct-v0.3" };
  }

  throw new Error(
    "No AI provider configured. Set GROQ_API_KEY or HUGGINGFACE_TOKEN."
  );
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text, targetRole } = req.body ?? {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (text.length > 50_000) {
    res.status(400).json({ error: "text exceeds 50,000 character limit" });
    return;
  }

  const start = Date.now();

  try {
    // Step 1: Analyze original
    const beforeAnalysis = analyzeResume(text);

    // Step 2: Build PLK-aware prompt
    const prompt = buildEnhancementPrompt(
      text,
      beforeAnalysis.plk,
      beforeAnalysis.ats,
      typeof targetRole === "string" ? targetRole : undefined
    );

    // Step 3: Call LLM (Groq → HF fallback)
    const { text: enhanced, provider } = await callLLM(prompt);

    // Step 4: Score the enhanced output
    const afterAnalysis = analyzeResume(enhanced);

    // Step 5: Count preserved metaphors (confidence >= 0.75 in both runs)
    const highConfidenceBefore = new Set(
      beforeAnalysis.plk.metaphors
        .filter((m) => m.confidence >= 0.75)
        .map((m) => m.text.toLowerCase())
    );
    const metaphorsPreserved = afterAnalysis.plk.metaphors.filter(
      (m) => m.confidence >= 0.75 && highConfidenceBefore.has(m.text.toLowerCase())
    ).length;

    const result: EnhancementResult = {
      original: text,
      enhanced,
      atsBefore: beforeAnalysis.ats,
      atsAfter: afterAnalysis.ats,
      plkBefore: beforeAnalysis.plk,
      plkAfter: afterAnalysis.plk,
      metaphorsPreserved,
      provider,
      processingMs: Date.now() - start,
    };

    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enhancement failed";
    console.error("[enhance] error:", err);
    res.status(500).json({ error: message });
  }
}
