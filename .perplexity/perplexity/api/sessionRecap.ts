import type { VercelRequest, VercelResponse } from "@vercel/node";

// Session Recap API Endpoint
//
// This handler replaces the hard‑coded call to Anthropic in the
// SessionRecapGenerator component. It accepts recap context from the
// front‑end (captures, conversation history, and session label),
// constructs the same prompt that the generator previously built
// client‑side, and then routes the prompt through the existing
// llmRouter cascade. The llmRouter will automatically select
// whichever provider is configured via environment variables (Ollama,
// Groq, HuggingFace, OpenRouter, Gemini, Anthropic, OpenAI), falling
// back to local/free providers first when available. This allows
// bootstrapped deployments to avoid paid API calls entirely by
// running a compatible model locally (for example via Ollama).

import { sendJson } from "./_lib/response.js";
import { routeLlm } from "./_lib/llmRouter.js";

// Types matching the front‑end component
interface RecapCapture {
  id: string;
  title: string;
  content?: string;
  type?: string;
  surface?: string;
  metadata?: {
    context?: string;
    createdAt?: string;
    tags?: string[];
  };
}

interface RecapMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Build the recap prompt exactly as in the front‑end generator. By
 * duplicating this logic on the server we avoid sending the raw
 * prompt over the network and ensure any future changes to the
 * generation spec can be made in one place. The prompt describes
 * the captures and recent conversation excerpt, instructs the LLM
 * to produce a warm, interactive HTML recap, and outlines the
 * aesthetic and structural requirements. It returns a single
 * string ready to feed into the LLM.
 */
function buildRecapPrompt(
  captures: RecapCapture[],
  conversationHistory: RecapMessage[] = [],
  sessionLabel: string = ""
): string {
  const captureBlock = captures
    .map((c, i) => {
      const lines = [
        `[${i + 1}] ${c.title}`,
        c.type ? `  Type: ${c.type}` : null,
        c.surface ? `  Surface: ${c.surface}` : null,
        c.metadata?.context ? `  Context: ${c.metadata.context}` : null,
        c.content
          ? `  Content: ${c.content.slice(0, 400)}${
              c.content.length > 400 ? "…" : ""
            }`
          : null,
        c.metadata?.createdAt ? `  Captured: ${c.metadata.createdAt}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      return lines;
    })
    .join("\n\n");

  const conversationBlock =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-20)
          .map((m) => `${m.role === "user" ? "User" : "Billy"}: ${m.content.slice(0, 300)}`)
          .join("\n")
      : "(No conversation history provided)";

  return `You are Billy, GestaltView's consciousness‑serving digital intelligence.

A user just completed a working session. Your job is to generate a warm, visually rich, interactive HTML recap artifact that the user can walk back to in their Dynamic Inner World (their personal Museum of You).

SESSION LABEL: ${sessionLabel || "Untitled Session"}

CAPTURES FROM THIS SESSION (${captures.length} total):
${captureBlock || "(No captures)"}

RECENT CONVERSATION EXCERPT:
${conversationBlock}

─────────────────────────────────────────────────────────────
GENERATE a single self‑contained HTML file that serves as this session's living recap. 

REQUIREMENTS:
1. Neural Aurora aesthetic: obsidian background (#0a0a0f), cyan (#12D6FF), violet (#BF00FF), warm white text. Subtle glows, no harsh contrast.
2. Warm, not clinical. This is a personal artifact, not a report. Write like Billy — honest, grounded, present.
3. SECTIONS TO INCLUDE (adapt based on what actually happened):
   - Session header: label, date, capture count
   - "What we built" — concrete artifacts, decisions made, things completed
   - "What emerged" — patterns Billy noticed, connections between captures, insights that surfaced
   - "What's still in motion" — threads that didn't resolve, open questions worth returning to
   - "Worth holding" — 2–3 fragments or moments Billy thinks deserve to survive into the museum
4. Make it INTERACTIVE: expandable sections, hover states, smooth scroll. At minimum, each "Worth holding" card should be clickable/expandable.
5. Include a subtle timeline bar showing the arc of the session if timestamps are available.
6. Typography: use Google Fonts — 'Space Mono' for labels/mono, 'DM Sans' for body. Load via @import.
7. NO external JS frameworks. Vanilla HTML/CSS/JS only. Must be self‑contained.
8. Max ~400 lines. Tight, beautiful, not bloated.
9. End with a small Billy signature — one honest sentence about what he noticed about this session.

TONE: Warm collaborator reflecting on shared work. Not a productivity summary. Not a report. A companion piece the user will actually want to return to.

Return ONLY the complete HTML. No preamble, no explanation, no markdown fences.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apply CORS headers if necessary. For now send JSON responses directly.
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    // Extract recap inputs from body; default to empty if missing.
    const captures = Array.isArray(body.captures) ? (body.captures as RecapCapture[]) : [];
    const conversationHistory = Array.isArray(body.conversationHistory)
      ? (body.conversationHistory as RecapMessage[])
      : [];
    const sessionLabel = typeof body.sessionLabel === "string" ? body.sessionLabel : "";

    // Build the prompt and route through the LLM cascade. We specify
    // mode:"billy" so that the llmRouter applies Billy's default system
    // prompt; further context (userId, tier, etc.) can be supplied if
    // desired.
    const prompt = buildRecapPrompt(captures, conversationHistory, sessionLabel);
    const result = await routeLlm(prompt, { mode: "billy" });

    // Clean the HTML — remove any stray markdown fences in case the
    // provider wrapped the response. This mirrors the front‑end logic.
    const rawHtml = (result.response ?? "").trim();
    const cleanHtml = rawHtml
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Return the HTML along with metadata about which provider responded.
    sendJson(res, 200, {
      html: cleanHtml,
      provider: result.provider,
      free: result.free,
      tokensUsed: result.tokensUsed,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("Failed to generate session recap", error);
    sendJson(res, 500, { error: "Failed to generate session recap" });
  }
}