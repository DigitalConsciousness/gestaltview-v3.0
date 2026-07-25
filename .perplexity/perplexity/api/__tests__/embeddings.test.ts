import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadEmbeddingsLib() {
  vi.resetModules();
  return import("../_lib/embeddings");
}

describe("embedding helper", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.BILLY_EMBED_BACKEND;
    delete process.env.BILLY_EMBED_MODEL;
    delete process.env.BILLY_EMBED_DIMENSIONS;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;
    delete process.env.HF_API_TOKEN;
    delete process.env.HF_MODEL;
    delete process.env.HF_EMBED_MODEL;
    delete process.env.HUGGINGFACE_API_KEY;
    delete process.env.HUGGINGFACE_EMBED_MODEL;
    delete process.env.HUGGINGFACE_MODEL;
    delete process.env.VITE_HUGGINGFACE_API_KEY;
    delete process.env.VITE_HUGGINGFACE_TOKEN;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses Hugging Face when HF credentials are present even without an explicit backend", async () => {
    process.env.HF_API_TOKEN = "hf-token";
    process.env.BILLY_EMBED_MODEL = "google/embeddinggemma-300m";
    process.env.BILLY_EMBED_DIMENSIONS = "768";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [Array.from({ length: 768 }, (_, index) => index / 1000)],
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { embedTextForRetrieval } = await loadEmbeddingsLib();
    const result = await embedTextForRetrieval("agent trainer onboarding package builder");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/google/embeddinggemma-300m",
      expect.objectContaining({ method: "POST" })
    );
    expect(result.backend).toBe("huggingface");
    expect(result.model).toBe("google/embeddinggemma-300m");
    expect(result.embedding).toHaveLength(768);
  });
});
