import { describe, expect, it } from "vitest";

import {
  BILLY_VOICE_RUNTIME_ENV_KEYS,
  buildBillyVoiceHealth,
  normalizeBillyVoiceClientMode,
} from "../_lib/billyVoice";

describe("normalizeBillyVoiceClientMode", () => {
  it("accepts supported configured providers", () => {
    expect(normalizeBillyVoiceClientMode("browser")).toBe("browser");
    expect(normalizeBillyVoiceClientMode("deepgram")).toBe("deepgram");
  });

  it("falls back to disabled for unknown values", () => {
    expect(normalizeBillyVoiceClientMode("disabled")).toBe("disabled");
    expect(normalizeBillyVoiceClientMode("none")).toBe("disabled");
    expect(normalizeBillyVoiceClientMode(undefined)).toBe("disabled");
  });
});

describe("buildBillyVoiceHealth", () => {
  it("reports browser voice and missing billy_voice runtime env values", () => {
    const health = buildBillyVoiceHealth({
      VITE_BILLY_VOICE: "browser",
      VITE_BILLY_BROWSER_VOICE_NAME: "Daniel",
    });

    expect(health.client.mode).toBe("browser");
    expect(health.client.preferredBrowserVoice).toBe("Daniel");
    expect(health.output.configured).toBe(false);
    expect(health.runtime.configured).toBe(false);
    expect(health.runtime.missing).toEqual([...BILLY_VOICE_RUNTIME_ENV_KEYS]);
    expect(health.summary).toContain("Client voice is set to browser (Daniel)");
  });

  it("reports fully wired hosted and alternate voice runtime config", () => {
    const env = Object.fromEntries(
      BILLY_VOICE_RUNTIME_ENV_KEYS.map((key) => [key, `${key.toLowerCase()}-value`])
    ) as Record<string, string>;

    const health = buildBillyVoiceHealth({
      ...env,
      VITE_BILLY_VOICE: "deepgram",
      DEEPGRAM_API_KEY: "secret",
      DEEPGRAM_BILLY_TTS_MODEL: "aura-2-aries-en",
    });

    expect(health.client.mode).toBe("deepgram");
    expect(health.output.configured).toBe(true);
    expect(health.output.model).toBe("aura-2-aries-en");
    expect(health.runtime.configured).toBe(true);
    expect(health.runtime.missing).toHaveLength(0);
    expect(health.ok).toBe(true);
    expect(health.summary).toContain("hosted Deepgram TTS is configured");
  });
});
