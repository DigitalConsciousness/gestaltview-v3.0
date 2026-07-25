// GestaltView v2 — LLM Router Unit Tests
// © 2026 Keith Soyka / GestaltView

import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadRouter() {
  vi.resetModules();
  return import("../_lib/llmRouter");
}

const ALL_PROVIDER_KEYS = [
  "BILLY_OLLAMA_URL",
  "OLLAMA_BASE_URL",
  "OLLAMA_HOST",
  "OLLAMA_API_URL",
  "OLLAMA_URL",
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
  "VITE_GEMINI_API_KEY",
  "VITE_GOOGLE_API_KEY",
  "OPENAI_API_KEY",
  "VITE_OPENAI_API_KEY",
  "GROQ_API_KEY",
  "VITE_GROQ_API_KEY",
  "VITE_GROK_API_KEY",
  "ANTHROPIC_API_KEY",
  "VITE_ANTHROPIC_API_KEY",
  "CLAUDE_API_KEY",
  "OPENROUTER_API_KEY",
  "VITE_OPENROUTER_API_KEY",
  "HUGGINGFACE_API_KEY",
  "HF_API_TOKEN",
  "VITE_HUGGINGFACE_API_KEY",
  "VITE_HUGGINGFACE_TOKEN",
];

function clearAllProviders() {
  for (const key of ALL_PROVIDER_KEYS) {
    delete process.env[key];
  }
}

function createProviderFetchMock(failProviders: string[] = []) {
  return vi.fn(async (url: string | URL) => {
    const requestUrl = String(url);

    if (requestUrl.includes("/api/chat")) {
      if (failProviders.includes("ollama")) {
        return { ok: false, status: 500, text: async () => "ollama-down" };
      }

      return {
        ok: true,
        json: async () => ({
          message: { content: "ollama ok" },
          prompt_eval_count: 4,
          eval_count: 5,
        }),
      };
    }

    if (requestUrl.includes("api-inference.huggingface.co")) {
      if (failProviders.includes("huggingface")) {
        return { ok: false, status: 500, text: async () => "hf-down" };
      }

      return {
        ok: true,
        json: async () => [{ generated_text: "huggingface ok" }],
      };
    }

    if (requestUrl.includes("openrouter.ai")) {
      if (failProviders.includes("openrouter")) {
        return { ok: false, status: 500, text: async () => "openrouter-down" };
      }

      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "openrouter ok" } }],
          usage: { total_tokens: 10 },
        }),
      };
    }

    if (requestUrl.includes("generativelanguage.googleapis.com")) {
      if (failProviders.includes("gemini")) {
        return { ok: false, status: 500, text: async () => "gemini-down" };
      }

      return {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "gemini ok" }] } }],
          usageMetadata: { totalTokenCount: 11 },
        }),
      };
    }

    if (requestUrl.includes("api.anthropic.com")) {
      if (failProviders.includes("anthropic")) {
        return { ok: false, status: 500, text: async () => "anthropic-down" };
      }

      return {
        ok: true,
        json: async () => ({
          content: [{ type: "text", text: "anthropic ok" }],
          usage: { input_tokens: 5, output_tokens: 7 },
        }),
      };
    }

    if (requestUrl.includes("api.groq.com")) {
      if (failProviders.includes("groq")) {
        return { ok: false, status: 500, text: async () => "groq-down" };
      }

      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "groq ok" } }],
          usage: { total_tokens: 9 },
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "openai ok" } }],
        usage: { total_tokens: 9 },
      }),
    };
  });
}

describe("llmRouter — provider selection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    clearAllProviders();
    vi.restoreAllMocks();
  });

  it("uses test-provider in test environment", async () => {
    process.env.NODE_ENV = "test";
    const { routeLlm } = await loadRouter();

    const result = await routeLlm("hello", { userId: "u1" });

    expect(result.provider).toBe("test-provider");
    expect(result.timestamp).toBeTruthy();
    expect(result.response).toBeTruthy();
    expect(result.free).toBe(true);
    expect(result.tokensUsed).toBeNull();
  });

  it("includes mode and tier in metadata on test-provider path", async () => {
    process.env.NODE_ENV = "test";
    const { routeLlm } = await loadRouter();

    const result = await routeLlm("bucket drop: something important", {
      userId: "u1",
      mode: "loom",
      exhibit: "brain-sparks",
      tier: "core",
    });

    expect(result.metadata?.mode).toBe("loom");
    expect(result.metadata?.exhibit).toBe("brain-sparks");
    expect(result.metadata?.tier).toBe("core");
  });

  it("passes plk through to metadata", async () => {
    process.env.NODE_ENV = "test";
    const { routeLlm } = await loadRouter();

    const result = await routeLlm("tell me about myself", {
      userId: "u1",
      plk: "trauma-informed, ADHD-friendly, direct communicator",
    });

    expect(result.metadata?.plk).toBe("trauma-informed, ADHD-friendly, direct communicator");
  });

  it("returns offline fallback when no provider keys exist", async () => {
    process.env.NODE_ENV = "development";
    clearAllProviders();

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("hello", { userId: "u1", mode: "loom" });

    expect(result.provider).toBe("offline-fallback");
    expect(result.metadata?.mode).toBe("loom");
    expect(result.response).toBeTruthy();
    expect(result.free).toBe(true);
  });

  it("offline fallback response contains message excerpt", async () => {
    process.env.NODE_ENV = "development";
    clearAllProviders();

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("This is a test of the bucket drop system", { userId: "u1" });

    expect(result.response).toContain("This is a test of the bucket drop system");
  });

  it("strips Billy retrieval scaffolding from offline fallback echoes", async () => {
    process.env.NODE_ENV = "development";
    clearAllProviders();

    const { routeLlm } = await loadRouter();
    const result = await routeLlm(
      `=== CONTEXT FROM MANIFEST INDEX (GestaltView-Official-Compendium) ===\nPackage filter: billy-engine\n\n\n— No matching fragments were found for this query.\n\nUser message: Billy, walk me through what GestaltView is, why it exists, and the best way to orient myself on this page.`,
      { userId: "u1", mode: "billy" }
    );

    expect(result.provider).toBe("offline-fallback");
    expect(result.response).toContain("Billy, walk me through what GestaltView is");
    expect(result.response).not.toContain("CONTEXT FROM MANIFEST INDEX");
    expect(result.response).not.toContain("No matching fragments were found");
  });

  it("offline fallback returns neutral local-fallback copy for empty input", async () => {
    process.env.NODE_ENV = "development";
    clearAllProviders();

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("", { userId: "u1" });

    expect(result.response).toContain("Local fallback is active");
    expect(result.provider).toBe("offline-fallback");
  });

  it("uses Groq before Gemini when both are configured", async () => {
    process.env.NODE_ENV = "development";
    process.env.GROQ_API_KEY = "groq-key";
    process.env.GEMINI_API_KEY = "gemini-key";
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";

    const fetchMock = createProviderFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("Keep Billy standard.", {
      userId: "u1",
      mode: "billy",
      tier: "pro",
    });

    expect(result.provider).toBe("groq");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api.groq.com");
    expect(result.metadata?.attemptedProviders).toEqual([
      "ollama",
      "groq",
      "huggingface",
      "openrouter",
      "gemini",
      "anthropic",
      "openai",
    ]);
  });

  it("prefers Ollama first when it is configured", async () => {
    process.env.NODE_ENV = "development";
    process.env.BILLY_OLLAMA_URL = "http://127.0.0.1:11434";
    process.env.GROQ_API_KEY = "groq-key";

    const fetchMock = createProviderFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("Keep it local first.", {
      userId: "u1",
      mode: "billy",
    });

    expect(result.provider).toBe("ollama");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/chat");
  });

  it("prefers HuggingFace over OpenRouter and Gemini inside the free tier", async () => {
    process.env.NODE_ENV = "development";
    process.env.HUGGINGFACE_API_KEY = "hf-key";
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.GEMINI_API_KEY = "gemini-key";

    const fetchMock = createProviderFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("Stay on the free tier.", {
      userId: "u1",
      mode: "billy",
    });

    expect(result.provider).toBe("huggingface");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api-inference.huggingface.co");
  });

  it("falls through from HuggingFace to OpenRouter when the first free provider fails", async () => {
    process.env.NODE_ENV = "development";
    process.env.HUGGINGFACE_API_KEY = "hf-key";
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.GEMINI_API_KEY = "gemini-key";

    const fetchMock = createProviderFetchMock(["huggingface"]);
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("Recover cleanly.", {
      userId: "u1",
      mode: "billy",
    });

    expect(result.provider).toBe("openrouter");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api-inference.huggingface.co");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("openrouter.ai");
    expect(result.metadata?.providerErrors).toMatchObject({
      huggingface: "HuggingFace error: 500",
    });
  });

  it("uses Anthropic before OpenAI once free providers are exhausted", async () => {
    process.env.NODE_ENV = "development";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.OPENAI_API_KEY = "openai-key";

    const fetchMock = createProviderFetchMock();
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { routeLlm } = await loadRouter();
    const result = await routeLlm("Deep synthesis.", {
      userId: "u1",
      mode: "tribunal",
      tier: "anonymous",
    });

    expect(result.provider).toBe("anthropic");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("api.anthropic.com");
  });

  it("accepts systemPrompt override in context", async () => {
    process.env.NODE_ENV = "test";
    const { routeLlm } = await loadRouter();

    const result = await routeLlm("What is GestaltView?", {
      userId: "u1",
      systemPrompt: "You are Billy. Answer with warmth and precision.",
    });

    expect(result.provider).toBe("test-provider");
    expect(result.response).toBeTruthy();
    expect(result.metadata).toBeDefined();
  });
});
