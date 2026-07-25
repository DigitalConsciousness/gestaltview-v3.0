import { describe, expect, it } from "vitest";
import { parseEnvText, validateKitEnv } from "../../scripts/validate-env";

describe("env validation", () => {
  it("parses env text into key value pairs", () => {
    const parsed = parseEnvText("KIT_NAME=Demo\nKIT_TIER=STUDIO\n");
    expect(parsed.KIT_NAME).toBe("Demo");
    expect(parsed.KIT_TIER).toBe("STUDIO");
  });

  it("accepts a minimal valid environment", () => {
    const validated = validateKitEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      GROQ_API_KEY: "groq",
      EMBEDDING_PROVIDER: "gemini",
      EMBEDDING_MODEL: "text-embedding-004",
      EMBEDDING_DIMENSION: "768",
      KIT_NAME: "Demo",
      KIT_DOMAIN: "general",
      KIT_TIER: "STUDIO",
      KIT_PRIMARY_COLOR: "#01696f"
    });

    expect(validated.KIT_NAME).toBe("Demo");
    expect(validated.KIT_TIER).toBe("STUDIO");
  });
});
