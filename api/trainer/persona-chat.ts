// api/trainer/persona-chat.ts
// Uses the existing GestaltView LLM cascade: Groq → Gemini → OpenAI
// No Anthropic SDK — no surprise billing.
import { withSentryFetchHandler } from "../_lib/sentry.js";
import {
  buildEmbodimentSystemPrompt,
  buildTrainerPersonaSystemPrompt,
  requireEmbodimentProfile,
  TRAINER_PERSONA_REGISTRY,
  type TrainerPersonaId,
} from "../../shared/embodiment/index.js";
import { traceBraintrust } from "../../instrument.js";

interface ChatMessage {
  sender: "agent" | "user";
  text: string;
}

interface OpenAICompatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function buildOpenAIMessages(
  systemPrompt: string,
  messages: ChatMessage[]
): OpenAICompatMessage[] {
  const history = messages
    .slice(1) // skip static opening greeting
    .map((m) => ({
      role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.text,
    }))
    .filter((m, i, arr) => {
      if (i === 0) return m.role === "user";
      return m.role !== arr[i - 1].role;
    });

  return [{ role: "system", content: systemPrompt }, ...history];
}

function buildTraceInput(systemPrompt: string, messages: OpenAICompatMessage[]) {
  return [{ role: "system" as const, content: systemPrompt }, ...messages.slice(1)];
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const TRAINER_RESPONSE_CONTRACT = [
  "Keep responses to 2-3 sentences unless the user explicitly asks for more.",
  "Give specific, non-generic guidance that reflects the actual situation.",
  "If context is thin, ask one pointed clarifying question instead of inventing assumptions.",
  "Never start with 'I'.",
];

const TRAINER_RUNTIME_DIRECTIVES = [
  "Stay faithful to the selected embodiment profile even when the user is vague or testing the edges.",
  "Respond like a real specialist with taste, judgment, and a point of view.",
];

function resolveTrainerPersonaConfig(personaId?: TrainerPersonaId) {
  if (!personaId) {
    return null;
  }

  return (
    TRAINER_PERSONA_REGISTRY[
      personaId as keyof typeof TRAINER_PERSONA_REGISTRY
    ] ?? null
  );
}

export function resolvePersonaChatSystemPrompt(input: {
  personaId?: TrainerPersonaId;
  embodimentProfileSlug?: string;
}): string {
  const config = resolveTrainerPersonaConfig(input.personaId);

  if (input.personaId && !config) {
    throw new Error("Unknown persona");
  }

  if (input.embodimentProfileSlug) {
    const profile = requireEmbodimentProfile(input.embodimentProfileSlug);

    return buildEmbodimentSystemPrompt(profile, {
      role: `${config?.role ?? "Specialist embodiment"} for GestaltView Agent Trainer`,
      audience:
        config?.audience ??
        "a founder evaluating and training agent behavior on the pricing surface",
      responseContract: TRAINER_RESPONSE_CONTRACT,
      runtimeDirectives: [
        ...TRAINER_RUNTIME_DIRECTIVES,
        config
          ? `Stay scoped to the ${input.personaId} training lane while expressing the selected embodiment.`
          : "Operate inside GestaltView Agent Trainer rather than as a generic assistant.",
      ],
      extraContext: config
        ? [
            `Active trainer persona lane: ${input.personaId}.`,
            "The user may be comparing specialist embodiments inside the same product surface.",
          ]
        : [
            "The user may be comparing specialist embodiments inside the same product surface.",
          ],
    });
  }

  if (!input.personaId) {
    throw new Error("Unknown persona");
  }

  return buildTrainerPersonaSystemPrompt(input.personaId);
}

// ── Provider calls (no SDKs — plain fetch, matches BillyEngine pattern) ────

async function callGroq(
  messages: OpenAICompatMessage[],
  apiKey: string
): Promise<string> {
  return traceBraintrust(
    {
      name: "trainer persona groq call",
      type: "llm",
      metadata: { provider: "groq", model: "llama-3.3-70b-versatile" },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: messages,
        metadata: { provider: "groq", model: "llama-3.3-70b-versatile" },
      });

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // fast + free tier friendly
          messages,
          max_tokens: 180,
          temperature: 0.72,
        }),
      });
      if (!res.ok) throw new Error(`Groq ${res.status}`);
      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const text = data.choices[0]?.message?.content ?? "";
      span?.log({ output: text, metadata: { provider: "groq", model: "llama-3.3-70b-versatile" } });
      return text;
    },
  );
}

async function callGemini(
  systemPrompt: string,
  messages: OpenAICompatMessage[],
  apiKey: string
): Promise<string> {
  const userMessages = messages.filter((m) => m.role !== "system");
  const contents = userMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  return traceBraintrust(
    {
      name: "trainer persona gemini call",
      type: "llm",
      metadata: { provider: "gemini", model: "gemini-2.0-flash" },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: buildTraceInput(systemPrompt, messages),
        metadata: { provider: "gemini", model: "gemini-2.0-flash" },
      });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 180, temperature: 0.72 },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = (await res.json()) as {
        candidates: { content: { parts: { text: string }[] } }[];
      };
      const text = data.candidates[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
      span?.log({ output: text, metadata: { provider: "gemini", model: "gemini-2.0-flash" } });
      return text;
    },
  );
}

async function callOpenAI(
  messages: OpenAICompatMessage[],
  apiKey: string
): Promise<string> {
  return traceBraintrust(
    {
      name: "trainer persona openai call",
      type: "llm",
      metadata: { provider: "openai", model: "gpt-4o-mini" },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: messages,
        metadata: { provider: "openai", model: "gpt-4o-mini" },
      });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 180,
          temperature: 0.72,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      const text = data.choices[0]?.message?.content ?? "";
      span?.log({ output: text, metadata: { provider: "openai", model: "gpt-4o-mini" } });
      return text;
    },
  );
}

// ── Handler ────────────────────────────────────────────────────────────────

async function handler(req: Request): Promise<Response> {
  return traceBraintrust(
    {
      name: "trainer persona chat",
      type: "task",
    },
    async (span: BraintrustSpan | null) => {
      if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
      }

      try {
        const { personaId, messages, embodimentProfileSlug } = (await req.json()) as {
          personaId?: TrainerPersonaId;
          messages: ChatMessage[];
          embodimentProfileSlug?: string;
        };

        let systemPrompt: string;
        try {
          systemPrompt = resolvePersonaChatSystemPrompt({
            personaId,
            embodimentProfileSlug,
          });
        } catch {
          return jsonResponse({ error: "Unknown persona or embodiment" }, 400);
        }

        const apiMessages = buildOpenAIMessages(systemPrompt, messages);

        if (apiMessages.length <= 1) {
          return jsonResponse({ error: "No messages to process" }, 400);
        }

        span?.log({
          input: buildTraceInput(systemPrompt, apiMessages),
          metadata: {
            personaId: personaId ?? null,
            embodimentProfileSlug: embodimentProfileSlug ?? null,
            providerOrder: ["groq", "gemini", "openai"],
          },
        });

        const errors: string[] = [];

        // 1. Groq — fastest, bootstrap-friendly free tier
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
          try {
            const text = await callGroq(apiMessages, groqKey);
            if (text.trim()) {
              span?.log({ output: text.trim(), metadata: { resolvedProvider: "groq" } });
              return jsonResponse({ text: text.trim() });
            }
          } catch (e) {
            errors.push(`Groq: ${String(e)}`);
          }
        }

        // 2. Gemini Flash — already wired in BillyEngine
        const geminiKey = process.env.GOOGLE_API_KEY ?? process.env.VITE_GEMINI_API_KEY;
        if (geminiKey) {
          try {
            const text = await callGemini(systemPrompt, apiMessages, geminiKey);
            if (text.trim()) {
              span?.log({ output: text.trim(), metadata: { resolvedProvider: "gemini" } });
              return jsonResponse({ text: text.trim() });
            }
          } catch (e) {
            errors.push(`Gemini: ${String(e)}`);
          }
        }

        // 3. OpenAI gpt-4o-mini — existing fallback
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey) {
          try {
            const text = await callOpenAI(apiMessages, openaiKey);
            if (text.trim()) {
              span?.log({ output: text.trim(), metadata: { resolvedProvider: "openai" } });
              return jsonResponse({ text: text.trim() });
            }
          } catch (e) {
            errors.push(`OpenAI: ${String(e)}`);
          }
        }

        // All providers failed — surface the errors for debugging
        console.error("[persona-chat] all providers failed:", errors);
        span?.log({ metadata: { errors, resolvedProvider: null } });
        return jsonResponse({ error: "Persona chat unavailable right now." }, 500);
      } catch (err) {
        console.error("[persona-chat] handler error", err);
        span?.log({
          metadata: {
            error: err instanceof Error ? err.message : String(err),
          },
        });
        return jsonResponse({ error: "Persona chat unavailable right now." }, 500);
      }
    },
  );
}

export default withSentryFetchHandler(handler, "/api/trainer/persona-chat");
