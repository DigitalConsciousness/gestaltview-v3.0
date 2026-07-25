import { afterEach, describe, expect, it } from "vitest";
import { routeLlm, routerStatus } from "../../api/_lib/llmRouter";

const ORIGINAL_ENV = { ...process.env };

describe("llmRouter", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("exposes the provider cascade order used by routeLlm", async () => {
    const status = await routerStatus();
    expect(Object.fromEntries(Object.entries(status).map(([provider, value]) => [provider, (value as { order: number }).order]))).toMatchObject({
      ollama: 1,
      groq: 2,
      huggingface: 3,
      openrouter: 4,
      gemini: 5,
      anthropic: 6,
      openai: 7,
    });
  });

  it("routeLlm test-mode mock returns a deterministic provider without network calls", async () => {
    process.env.NODE_ENV = "test";
    const result = await routeLlm("User message: preserve this prompt", { mode: "billy" });
    expect(result.provider).toBe("test-provider");
    expect(result.response).toBe("preserve this prompt");
  });
});
