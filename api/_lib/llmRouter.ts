// api/_lib/llmRouter.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// LLM provider cascade:
//   Ollama → Groq → HuggingFace → OpenRouter → Gemini
//   Anthropic → OpenAI
// Embedding: Gemma text-embedding-gemma3 at vector(768) via Google AI API

import type { BillyTier } from "../../shared/billy/types.js";
import { buildPlkSystemPrompt } from "../../shared/llm/plk.js";
import { traceBraintrust } from "../../instrument.js";

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

type ProviderId =
  | "ollama"
  | "groq"
  | "huggingface"
  | "openrouter"
  | "gemini"
  | "anthropic"
  | "openai";

type ProviderResult = {
  response: string;
  tokensUsed: number | null;
};

type ProviderDef = {
  id: ProviderId;
  free: boolean;
  envKeys: string[];
  call: (systemPrompt: string, userPrompt: string) => Promise<ProviderResult>;
};

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

const DEFAULT_SYSTEM_PROMPT =
  "You are Billy from GestaltView. Respond with warmth, precision, and practical clarity. Preserve user language where possible.";

// Bootstrapped cascade: free/local providers first, paid last
const CASCADE_ORDER: ProviderId[] = [
  "ollama",
  "groq",
  "huggingface",
  "openrouter",
  "gemini",
  "anthropic",
  "openai",
];

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function hasAnyEnv(...keys: string[]): boolean {
  return Boolean(envValue(...keys));
}

function nowIso(): string {
  return new Date().toISOString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTraceMessages(systemPrompt: string, userPrompt: string) {
  return [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];
}

function cleanPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  const userMatch = trimmed.match(/User message:\s*([\s\S]*)$/i);
  const candidate = userMatch?.[1]?.trim() || trimmed;
  if (!candidate) return "";
  return candidate.slice(0, 1200);
}

function buildSystemPrompt(context: LlmContext): string {
  const mode = context.mode ?? "billy";
  const tier = context.tier ?? "anonymous";
  const basePrompt = [
    context.systemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT,
    `Operational mode: ${mode}.`,
    `User tier: ${tier}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return context.plk ? buildPlkSystemPrompt(basePrompt, context.plk) : basePrompt;
}

async function traceProviderCall(
  provider: ProviderId,
  systemPrompt: string,
  userPrompt: string,
  metadata: Record<string, unknown>,
  call: () => Promise<ProviderResult>,
): Promise<ProviderResult> {
  return traceBraintrust(
    {
      name: `${provider} provider call`,
      type: "llm",
      metadata: {
        provider,
        ...metadata,
      },
    },
    async (span: BraintrustSpan | null) => {
      span?.log({
        input: buildTraceMessages(systemPrompt, userPrompt),
        metadata: {
          provider,
          ...metadata,
        },
      });

      try {
        const result = await call();
        span?.log({
          output: result.response,
          metrics: {
            tokens: result.tokensUsed ?? undefined,
          },
          metadata: {
            provider,
            ...metadata,
            status: "success",
          },
        });
        return result;
      } catch (error) {
        span?.log({
          metadata: {
            provider,
            ...metadata,
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        throw error;
      }
    },
  );
}

function isConfigured(provider: ProviderId): boolean {
  if (provider === "ollama") {
    return hasAnyEnv("BILLY_OLLAMA_URL", "OLLAMA_BASE_URL", "OLLAMA_HOST", "OLLAMA_API_URL", "OLLAMA_URL");
  }
  if (provider === "groq") {
    return hasAnyEnv("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY");
  }
  if (provider === "huggingface") {
    return hasAnyEnv("HUGGINGFACE_API_KEY", "HF_API_TOKEN", "VITE_HUGGINGFACE_API_KEY", "VITE_HUGGINGFACE_TOKEN");
  }
  if (provider === "openrouter") {
    return hasAnyEnv("OPENROUTER_API_KEY", "VITE_OPENROUTER_API_KEY");
  }
  if (provider === "gemini") {
    return hasAnyEnv("GOOGLE_API_KEY", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY");
  }
  if (provider === "anthropic") {
    return hasAnyEnv("ANTHROPIC_API_KEY", "VITE_ANTHROPIC_API_KEY", "CLAUDE_API_KEY");
  }
  return hasAnyEnv("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
}

function offlineFallback(
  prompt: string,
  context: LlmContext = {},
  attemptedProviders: string[] = [...CASCADE_ORDER]
): LlmResult {
  const excerpt = cleanPrompt(prompt);
  const response = excerpt
    ? `Local fallback is active. Source thread preserved: "${excerpt}"`
    : "Local fallback is active. Add the source text you want preserved, and the thread will stay intact.";

  return {
    response,
    provider: "offline-fallback",
    timestamp: nowIso(),
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

async function withRetry(call: () => Promise<ProviderResult>): Promise<ProviderResult> {
  try {
    return await call();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/429/.test(message)) throw error;
    await sleep(1000);
    return call();
  }
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("GOOGLE_API_KEY", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY");
  const model = envValue("GEMINI_MODEL") || "gemini-2.0-flash";

  return traceProviderCall("gemini", systemPrompt, userPrompt, { model }, () =>
    withRetry(async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.4 },
          }),
        },
      );
      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { totalTokenCount?: number };
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join(" ").trim() || "";
      if (!text) throw new Error("Gemini returned empty response");
      return { response: text, tokensUsed: data.usageMetadata?.totalTokenCount ?? null };
    }),
  );
}

async function callOpenAICompat(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  providerName: string,
  provider: ProviderId,
): Promise<ProviderResult> {
  return traceProviderCall(provider, systemPrompt, userPrompt, { model, baseUrl, providerName }, () =>
    withRetry(async () => {
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
        }),
      });
      if (!response.ok) throw new Error(`${providerName} error: ${response.status}`);
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (!text) throw new Error(`${providerName} returned empty response`);
      return { response: text, tokensUsed: data.usage?.total_tokens ?? null };
    }),
  );
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY");
  const model = envValue("GROQ_MODEL") || "llama-3.3-70b-versatile";
  return callOpenAICompat(apiKey, "https://api.groq.com/openai/v1", model, systemPrompt, userPrompt, "Groq", "groq");
}

async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("OPENROUTER_API_KEY", "VITE_OPENROUTER_API_KEY");
  const model = envValue("OPENROUTER_MODEL") || "google/gemini-2.0-flash-exp:free";
  return traceProviderCall("openrouter", systemPrompt, userPrompt, { model }, () =>
    withRetry(async () => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://gestaltview-digital-intelligence.vercel.app",
          "X-Title": "GestaltView Billy",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
        }),
      });
      if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (!text) throw new Error("OpenRouter returned empty response");
      return { response: text, tokensUsed: data.usage?.total_tokens ?? null };
    }),
  );
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("OPENAI_API_KEY", "VITE_OPENAI_API_KEY");
  const baseUrl = envValue("OPENAI_BASE_URL") || "https://api.openai.com/v1";
  const model = envValue("OPENAI_MODEL") || "gpt-4o-mini";
  return callOpenAICompat(apiKey, baseUrl, model, systemPrompt, userPrompt, "OpenAI", "openai");
}

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("ANTHROPIC_API_KEY", "VITE_ANTHROPIC_API_KEY", "CLAUDE_API_KEY");
  const baseUrl = envValue("ANTHROPIC_BASE_URL", "CLAUDE_BASE_URL") || "https://api.anthropic.com";
  const model = envValue("ANTHROPIC_MODEL", "CLAUDE_MODEL") || "claude-sonnet-4-6";
  return traceProviderCall("anthropic", systemPrompt, userPrompt, { model, baseUrl }, () =>
    withRetry(async () => {
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          max_tokens: 2048,
          temperature: 0.4,
        }),
      });
      if (!response.ok) throw new Error(`Anthropic error: ${response.status}`);
      const data = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>;
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      const text = data.content?.find((b) => b.type === "text")?.text?.trim() || "";
      if (!text) throw new Error("Anthropic returned empty response");
      return {
        response: text,
        tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      };
    }),
  );
}

async function callHuggingFace(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const apiKey = envValue("HUGGINGFACE_API_KEY", "HF_API_TOKEN", "VITE_HUGGINGFACE_API_KEY", "VITE_HUGGINGFACE_TOKEN");
  const model = envValue("HUGGINGFACE_MODEL") || "mistralai/Mistral-7B-Instruct-v0.3";
  const prompt = `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
  return traceProviderCall("huggingface", systemPrompt, userPrompt, { model }, () =>
    withRetry(async () => {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 1024, temperature: 0.4, return_full_text: false },
        }),
      });
      if (!response.ok) throw new Error(`HuggingFace error: ${response.status}`);
      const data = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
      const text = Array.isArray(data)
        ? data[0]?.generated_text?.trim() || ""
        : data.generated_text?.trim() || "";
      if (!text) throw new Error("HuggingFace returned empty response");
      return { response: text, tokensUsed: text.split(/\s+/).filter(Boolean).length || null };
    }),
  );
}

async function callOllama(systemPrompt: string, userPrompt: string): Promise<ProviderResult> {
  const baseUrl =
    envValue("BILLY_OLLAMA_URL", "OLLAMA_BASE_URL", "OLLAMA_HOST", "OLLAMA_API_URL", "OLLAMA_URL") ||
    "http://127.0.0.1:11434";
  const model = envValue("OLLAMA_MODEL") || "qwen2.5-coder:7b";
  return traceProviderCall("ollama", systemPrompt, userPrompt, { model, baseUrl }, () =>
    withRetry(async () => {
      const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
          options: { temperature: 0.4 },
        }),
      });
      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
      const data = (await response.json()) as {
        message?: { content?: string };
        prompt_eval_count?: number;
        eval_count?: number;
      };
      const text = data.message?.content?.trim() || "";
      if (!text) throw new Error("Ollama returned empty response");
      return {
        response: text,
        tokensUsed: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      };
    }),
  );
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "ollama",
    free: true,
    envKeys: ["BILLY_OLLAMA_URL", "OLLAMA_BASE_URL", "OLLAMA_HOST", "OLLAMA_API_URL", "OLLAMA_URL"],
    call: callOllama,
  },
  {
    id: "groq",
    free: true,
    envKeys: ["GROQ_API_KEY", "VITE_GROQ_API_KEY", "VITE_GROK_API_KEY"],
    call: callGroq,
  },
  {
    id: "huggingface",
    free: true,
    envKeys: ["HUGGINGFACE_API_KEY", "HF_API_TOKEN", "VITE_HUGGINGFACE_API_KEY", "VITE_HUGGINGFACE_TOKEN"],
    call: callHuggingFace,
  },
  {
    id: "openrouter",
    free: true,
    envKeys: ["OPENROUTER_API_KEY", "VITE_OPENROUTER_API_KEY"],
    call: callOpenRouter,
  },
  {
    id: "gemini",
    free: true,
    envKeys: ["GOOGLE_API_KEY", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY"],
    call: callGemini,
  },
  {
    id: "anthropic",
    free: false,
    envKeys: ["ANTHROPIC_API_KEY", "VITE_ANTHROPIC_API_KEY", "CLAUDE_API_KEY"],
    call: callAnthropic,
  },
  {
    id: "openai",
    free: false,
    envKeys: ["OPENAI_API_KEY", "VITE_OPENAI_API_KEY"],
    call: callOpenAI,
  },
];

// ─── Embedding: Gemma text-embedding-gemma3 (768 dim) ────────────────────────
// Model: text-embedding-gemma3 via Google AI API
// Output dim: 768 — matches knowledge_fragments and skill_fragments tables.
// Falls back to text-embedding-004 (768 dim) if gemma3 is unavailable.

export async function embedQuery(text: string): Promise<number[] | null> {
  const apiKey = envValue("GOOGLE_API_KEY", "GEMINI_API_KEY", "VITE_GEMINI_API_KEY", "VITE_GOOGLE_API_KEY");
  if (!apiKey || !text.trim()) return null;

  // Primary: text-embedding-gemma3 (768 dim)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-gemma3:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-gemma3",
          content: { parts: [{ text }] },
        }),
      }
    );
    if (response.ok) {
      const data = (await response.json()) as { embedding?: { values?: number[] } };
      const values = data.embedding?.values;
      if (values && values.length > 0) return values;
    }
  } catch {
    // fall through to backup
  }

  // Fallback: text-embedding-004 (also 768 dim)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
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
  const status: Record<string, unknown> = {};
  for (const provider of PROVIDERS) {
    status[provider.id] = {
      configured: isConfigured(provider.id),
      free: provider.free,
      order: CASCADE_ORDER.indexOf(provider.id) + 1,
    };
  }
  return status;
}

export async function routeLlm(prompt: string, context: LlmContext = {}): Promise<LlmResult> {
  return traceBraintrust(
    {
      name: "routeLlm",
      type: "task",
      metadata: {
        mode: context.mode ?? "billy",
        exhibit: context.exhibit ?? null,
        tier: context.tier ?? "anonymous",
        plk: context.plk ?? null,
        userId: context.userId ?? null,
      },
    },
    async (span: BraintrustSpan | null) => {
      if (process.env.NODE_ENV === "test") {
        const result = {
          response: cleanPrompt(prompt) || "Test mode response.",
          provider: "test-provider",
          timestamp: nowIso(),
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

        span?.log({
          input: buildTraceMessages(buildSystemPrompt(context), cleanPrompt(prompt)),
          output: result.response,
          metadata: result.metadata,
        });
        return result;
      }

      const attemptedProviders = [...CASCADE_ORDER];
      const configuredProviders = PROVIDERS.filter((p) => isConfigured(p.id));

      if (configuredProviders.length === 0) {
        const fallback = offlineFallback(prompt, context, attemptedProviders);
        span?.log({
          input: buildTraceMessages(buildSystemPrompt(context), cleanPrompt(prompt)),
          output: fallback.response,
          metadata: fallback.metadata,
        });
        return fallback;
      }

      const systemPrompt = buildSystemPrompt(context);
      const userPrompt = cleanPrompt(prompt);
      const startedAt = Date.now();
      const providerErrors: Record<string, string> = {};

      span?.log({
        input: buildTraceMessages(systemPrompt, userPrompt),
        metadata: {
          attemptedProviders,
          configuredProviders: configuredProviders.map((p) => p.id),
          usedSystemPrompt: Boolean(context.systemPrompt),
        },
      });

      for (const provider of configuredProviders) {
        try {
          const result = await provider.call(systemPrompt, userPrompt);
          const response = {
            response: result.response,
            provider: provider.id,
            timestamp: nowIso(),
            free: provider.free,
            tokensUsed: result.tokensUsed,
            processingTime: Date.now() - startedAt,
            metadata: {
              mode: context.mode ?? "billy",
              exhibit: context.exhibit ?? null,
              tier: context.tier ?? "anonymous",
              plk: context.plk,
              attemptedProviders,
              configuredProviders: configuredProviders.map((p) => p.id),
              resolvedProvider: provider.id,
              providerErrors,
              usedSystemPrompt: Boolean(context.systemPrompt),
            },
          };

          span?.log({
            output: response.response,
            metrics: {
              tokens: response.tokensUsed ?? undefined,
              latency_ms: response.processingTime,
            },
            metadata: response.metadata,
          });

          return response;
        } catch (error) {
          providerErrors[provider.id] = error instanceof Error ? error.message : "Unknown provider error";
        }
      }

      const fallback = offlineFallback(prompt, context, attemptedProviders);
      fallback.metadata = {
        ...(fallback.metadata || {}),
        configuredProviders: configuredProviders.map((p) => p.id),
        providerErrors,
        usedSystemPrompt: Boolean(context.systemPrompt),
      };

      span?.log({
        output: fallback.response,
        metadata: fallback.metadata,
      });

      return fallback;
    },
  );
}
