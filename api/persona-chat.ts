// api/persona-chat.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Trainer persona chat endpoint.
// Uses the existing llmRouter cascade (Ollama → Groq → HuggingFace → OpenRouter → Gemini → Anthropic → OpenAI).
// No direct Anthropic SDK dependency — free/local providers are always tried first.

import { routeLlm } from "./_lib/llmRouter.js";
import { withSentryFetchHandler } from "./_lib/sentry.js";
import { buildTrainerPersonaSystemPrompt } from "../shared/embodiment/index.js";
import type { TrainerPersonaId } from "../shared/embodiment/index.js";

interface ChatMessage {
  sender: "agent" | "user";
  text: string;
}

// Map persona-chat.ts legacy keys → TrainerPersonaId slugs used by the embodiment registry.
// The frontend sends short keys (e.g. "weaver", "algorithm"); the registry uses full slugs.
const PERSONA_ID_MAP: Record<string, TrainerPersonaId> = {
  weaver: "weaver",
  "embodiment-expert": "embodiment-expert",
  spectacle: "spectacle",
  vibe: "vibe",
  "vibe-check": "vibe",
  bridge: "bridge",
  "translation-bridge": "bridge",
  treasurer: "treasurer",
  architect: "architect",
  algorithm: "algorithm",
  guardian: "guardian",
  tailor: "tailor",
  digger: "digger",
  "weird-digger": "digger",
};

async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { personaId, messages } = (await req.json()) as {
      personaId: string;
      messages: ChatMessage[];
    };

    const resolvedPersonaId = PERSONA_ID_MAP[personaId?.trim?.()?.toLowerCase?.()];
    if (!resolvedPersonaId) {
      return new Response(JSON.stringify({ error: "Unknown persona" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build the full embodiment system prompt from the registry — no inline strings.
    const systemPrompt = buildTrainerPersonaSystemPrompt(resolvedPersonaId);

    // Collapse multi-turn history into a single user prompt string.
    // The llmRouter is a single-turn interface; we pass conversation context as a formatted block.
    const history = messages
      .slice(1) // skip the static opening greeting
      .filter((m): m is ChatMessage => Boolean(m?.text?.trim()))
      .map((m) => `${m.sender === "user" ? "User" : "Agent"}: ${m.text.trim()}`)
      .join("\n");

    if (!history) {
      return new Response(JSON.stringify({ error: "No messages to process" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await routeLlm(history, {
      systemPrompt,
      mode: `trainer-persona-${resolvedPersonaId}`,
    });

    return new Response(JSON.stringify({ text: result.response, provider: result.provider }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("persona-chat error", err);
    return new Response(
      JSON.stringify({ error: "Persona chat unavailable right now." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export default withSentryFetchHandler(handler, "/api/persona-chat");
