'use client';

import { useCallback, useState } from "react";

type RouteArgs = {
  prompt: string;
  maxTokens?: number;
};

type RouteResult = {
  text: string;
  provider: string;
  free?: boolean;
  tokensUsed?: number | null;
  timestamp: string;
};

type ProviderConfig = {
  provider: "google" | "groq" | "huggingface" | "openrouter" | "openai";
  model: string;
};

function env(name: string): string {
  const value = (import.meta.env as Record<string, unknown>)[name];
  return typeof value === "string" ? value.trim() : "";
}

function resolveProvider(): ProviderConfig | null {
  if (env("VITE_GEMINI_API_KEY") || env("VITE_GOOGLE_API_KEY")) {
    return { provider: "google", model: env("VITE_GEMINI_MODEL") || "gemini-2.0-flash" };
  }
  if (env("VITE_GROQ_API_KEY") || env("VITE_GROQ_API_KEY")) {
    return { provider: "groq", model: env("VITE_GROQ_MODEL") || "llama-3.3-70b-versatile" };
  }
  if (env("VITE_HUGGINGFACE_API_KEY") || env("VITE_HUGGINGFACE_TOKEN")) {
    return {
      provider: "huggingface",
      model: env("VITE_HUGGINGFACE_MODEL") || "mistralai/Mistral-7B-Instruct-v0.3",
    };
  }
  if (env("VITE_OPENROUTER_API_KEY")) {
    return {
      provider: "openrouter",
      model: env("VITE_OPENROUTER_MODEL") || "google/gemini-2.0-flash-exp:free",
    };
  }
  if (env("VITE_OPENAI_API_KEY")) {
    return { provider: "openai", model: env("VITE_OPENAI_MODEL") || "gpt-4o-mini" };
  }
  return null;
}

async function callProxy(prompt: string, maxTokens: number, providerConfig: ProviderConfig): Promise<RouteResult> {
  const response = await fetch("/api/llm-proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: providerConfig.provider,
      model: providerConfig.model,
      systemPrompt: "You are Billy from GestaltView. Respond with warmth, precision, and practical clarity.",
      userPrompt: prompt,
      temperature: 0.4,
      maxTokens,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `LLM proxy error ${response.status}`);
  }

  const data = (await response.json()) as {
    text?: string;
    provider?: string;
    free?: boolean;
    tokensUsed?: number | null;
    timestamp?: string;
  };

  const text = data.text?.trim() ?? "";
  if (!text) {
    throw new Error("No content returned from LLM.");
  }

  return {
    text,
    provider: data.provider ?? providerConfig.provider,
    free: data.free,
    tokensUsed: data.tokensUsed ?? null,
    timestamp: data.timestamp ?? new Date().toISOString(),
  };
}

export function useLLMRouter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const route = useCallback(async ({ prompt, maxTokens = 800 }: RouteArgs): Promise<RouteResult> => {
    setLoading(true);
    setError(null);

    try {
      const providerConfig = resolveProvider();
      if (!providerConfig) {
        throw new Error(
          "No browser-visible LLM API key found. Add a VITE_* provider key to enable recap generation.",
        );
      }

      return await callProxy(prompt, maxTokens, providerConfig);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { route, loading, error };
}
