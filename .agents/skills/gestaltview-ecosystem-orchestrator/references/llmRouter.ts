// api/_lib/llmRouter.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

import type { BillyTier } from "../../shared/billy/types";

export interface LlmContext {
  userId?: string;
  mode?: string;
  exhibit?: string;
  plk?: string;
  systemPrompt?: string;
  tier?: BillyTier;
}

export interface LlmResult {
  response: string;
  provider: string;
  timestamp: string;
  free?: boolean;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?: Record<string, unknown>;
}

const GEMINI_API_KEY =
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  "";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const DEFAULT_SYSTEM_PROMPT =
  "You are Billy from GestaltView. Respond with warmth, precision, and practical clarity. Preserve user language where possible.";

function cleanPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  const userMatch = trimmed.match(/User message:\s*([\s\S]*)$/i);
  const candidate = userMatch?.[1]?.trim() || trimmed;
  if (!candidate) return "";
  return candidate.slice(0, 1200);
}

function isPaidTier(tier: BillyTier | undefined): boolean {
  return tier === "core" || tier === "pro" || tier === "enterprise" || tier === "founder";
}

function buildPromptShape(prompt: string, context: LlmContext): { system: string; user: string } {
  const user = cleanPrompt(prompt);
  const mode = context.mode ?? "billy";
  const tier = context.tier ?? "anonymous";
  const system = [
    context.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    `Operational mode: ${mode}.`,
    `User tier: ${tier}.`,
    context.plk ? `PLK profile: ${context.plk}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

function offlineFallback(
  prompt: string,
  context: LlmContext = {},
  attemptedProviders: string[] = ["gemini", "groq", "openai"]
): LlmResult {
  const excerpt = cleanPrompt(prompt);
  const response = excerpt
    ? `Local fallback is active. Source thread preserved: "${excerpt}"`
    : "Local fallback is active. Add the source text you want preserved, and the thread will stay intact.";

  return {
    response,
    provider: "offline-fallback",
    timestamp: new Date().toISOString(),
    free: true,
    tokensUsed: null,
    processingTime: 0,
    metadata: {
      mode: context.mode ?? "billy",
      exhibit: context.exhibit ?? null,
      tier: context.tier ?? "anonymous",
      plk: context.plk,
      attemptedProviders,
    },
  };
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<{ response: string; tokensUsed: number | null }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { totalTokenCount?: number };
  };

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join(" ").trim() || "";
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  return {
    response: text,
    tokensUsed: data.usageMetadata?.totalTokenCount ?? null,
  };
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<{ response: string; tokensUsed: number | null }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) {
    throw new Error("OpenAI returned empty response");
  }

  return {
    response: text,
    tokensUsed: data.usage?.total_tokens ?? null,
  };
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<{ response: string; tokensUsed: number | null }> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) {
    throw new Error("Groq returned empty response");
  }

  return {
    response: text,
    tokensUsed: data.usage?.total_tokens ?? null,
  };
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<{ response: string; tokensUsed: number | null }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const text = data.content?.find((block) => block.type === "text")?.text?.trim() || "";
  if (!text) {
    throw new Error("Anthropic returned empty response");
  }

  return {
    response: text,
    tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
  };
}

export async function embedQuery(text: string): Promise<number[] | null> {
  if (!GEMINI_API_KEY || !text.trim()) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) return null;
    const data = (await response.json()) as { embedding?: { values?: number[] } };
    return data.embedding?.values ?? null;
  } catch {
    return null;
  }
}

export async function routerStatus(): Promise<Record<string, unknown>> {
  return {
    gemini: { configured: Boolean(GEMINI_API_KEY) },
    openai: { configured: Boolean(OPENAI_API_KEY) },
    groq: { configured: Boolean(GROQ_API_KEY) },
    anthropic: { configured: Boolean(ANTHROPIC_API_KEY) },
  };
}

export async function routeLlm(prompt: string, context: LlmContext = {}): Promise<LlmResult> {
  if (process.env.NODE_ENV === "test") {
    return {
      response: cleanPrompt(prompt) || "Test mode response.",
      provider: "test-provider",
      timestamp: new Date().toISOString(),
      free: true,
      tokensUsed: null,
      processingTime: 0,
      metadata: {
        mode: context.mode,
        exhibit: context.exhibit,
        tier: context.tier,
        plk: context.plk,
      },
    };
  }

  const tribunalMode = (context.mode ?? "").toLowerCase() === "tribunal";
  const paidTribunal = tribunalMode && isPaidTier(context.tier);

  if (tribunalMode && !paidTribunal) {
    return offlineFallback(prompt, context, ["anthropic", "gemini", "openai", "groq"]);
  }

  const attemptedProviders = paidTribunal
    ? ["anthropic", "gemini", "openai", "groq"]
    : ["gemini", "groq", "openai"];

  const configuredProviders = attemptedProviders.filter((provider) => {
    if (provider === "anthropic") return Boolean(ANTHROPIC_API_KEY);
    if (provider === "gemini") return Boolean(GEMINI_API_KEY);
    if (provider === "openai") return Boolean(OPENAI_API_KEY);
    if (provider === "groq") return Boolean(GROQ_API_KEY);
    return false;
  });

  if (configuredProviders.length === 0) {
    return offlineFallback(prompt, context, attemptedProviders);
  }

  const { system, user } = buildPromptShape(prompt, context);
  const providerErrors: Record<string, string> = {};

  for (const provider of configuredProviders) {
    const startedAt = Date.now();

    try {
      const providerResult =
        provider === "anthropic"
          ? await callAnthropic(system, user)
          : provider === "gemini"
            ? await callGemini(system, user)
            : provider === "openai"
              ? await callOpenAI(system, user)
              : await callGroq(system, user);

      return {
        response: providerResult.response,
        provider,
        timestamp: new Date().toISOString(),
        free: false,
        tokensUsed: providerResult.tokensUsed,
        processingTime: Date.now() - startedAt,
        metadata: {
          mode: context.mode ?? "billy",
          exhibit: context.exhibit ?? null,
          tier: context.tier ?? "anonymous",
          plk: context.plk,
          attemptedProviders,
          resolvedProvider: provider,
          configuredProviders,
          usedSystemPrompt: Boolean(context.systemPrompt),
        },
      };
    } catch (error) {
      providerErrors[provider] = error instanceof Error ? error.message : "Unknown provider error";
    }
  }

  const fallback = offlineFallback(prompt, context, attemptedProviders);
  fallback.metadata = {
    ...(fallback.metadata || {}),
    configuredProviders,
    providerErrors,
  };
  return fallback;
}
