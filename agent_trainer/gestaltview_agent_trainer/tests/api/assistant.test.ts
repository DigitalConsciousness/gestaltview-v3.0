import { describe, expect, it } from "vitest";
import { postAssistant } from "../../api/assistant";

describe("assistant scaffold", () => {
  it("returns a scaffold response with context preview", async () => {
    const result = await postAssistant(
      {
        env: {
          NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
          SUPABASE_SERVICE_ROLE_KEY: "service",
          GROQ_API_KEY: "groq-key",
          EMBEDDING_PROVIDER: "gemini",
          EMBEDDING_MODEL: "text-embedding-004",
          EMBEDDING_DIMENSION: "768",
          KIT_NAME: "Test Kit",
          KIT_DOMAIN: "general",
          KIT_TIER: "STUDIO",
          KIT_PRIMARY_COLOR: "#01696f"
        },
        userId: "user-1",
        tier: "STUDIO"
      },
      {
        message: "Summarize the corpus.",
        sessionId: "session-1",
        domain: "general",
        preloadedFragments: [
          {
            id: "fragment-1",
            userId: "user-1",
            namespace: "knowledge",
            title: "Intro",
            content: "This is a test fragment.",
            chunkIndex: 0,
            metadata: {}
          }
        ]
      }
    );

    expect(result.error).toBeNull();
    // We do not assert on scaffold placeholders anymore. Instead we expect a
    // non‑empty reply string and that the context preview includes our
    // preloaded fragment title. The LLM router is now capable of calling
    // real providers and may return provider‑specific text or an error.
    expect(typeof result.data?.reply).toBe("string");
    expect(result.data?.reply?.length).toBeGreaterThan(0);
    expect(result.data?.contextPreview).toContain("Intro");
  });
});
