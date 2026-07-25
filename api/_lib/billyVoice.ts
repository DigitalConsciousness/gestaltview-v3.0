// api/_lib/billyVoice.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

export type BillyVoiceClientMode = "disabled" | "browser" | "deepgram";

export interface BillyVoiceHealth {
  ok: boolean;
  client: {
    mode: BillyVoiceClientMode;
    preferredBrowserVoice: string | null;
  };
  output: {
    provider: "deepgram";
    configured: boolean;
    model: string | null;
    endpoint: "/api/voice/billy";
  };
  runtime: {
    configured: boolean;
    missing: string[];
    livekitUrl: string | null;
    billyApiUrl: string | null;
    deepgramApiKeyConfigured: boolean;
    voiceProfileSlug: string | null;
    voiceProfileRegistry: string | null;
    billyMode: string | null;
  };
  summary: string;
}

export const BILLY_VOICE_RUNTIME_ENV_KEYS = [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "BILLY_API_URL",
  "DEEPGRAM_API_KEY",
  "VOICE_PROFILE_SLUG",
] as const;

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function normalizeBillyVoiceClientMode(value: string | undefined): BillyVoiceClientMode {
  if (value === "browser" || value === "deepgram") {
    return value;
  }

  return "disabled";
}

export function buildBillyVoiceHealth(
  env: Record<string, string | undefined> = process.env
): BillyVoiceHealth {
  const clientMode = normalizeBillyVoiceClientMode(env.VITE_BILLY_VOICE);
  const preferredBrowserVoice = hasValue(env.VITE_BILLY_BROWSER_VOICE_NAME)
    ? env.VITE_BILLY_BROWSER_VOICE_NAME!.trim()
    : null;
  const outputConfigured = hasValue(env.DEEPGRAM_API_KEY);
  const runtimeMissing = BILLY_VOICE_RUNTIME_ENV_KEYS.filter((key) => !hasValue(env[key]));
  const runtimeConfigured = runtimeMissing.length === 0;

  const summaryParts = [
    clientMode === "disabled"
      ? "Client voice is disabled"
      : clientMode === "browser"
        ? preferredBrowserVoice
          ? `Client voice is set to browser (${preferredBrowserVoice})`
          : "Client voice is set to browser"
        : "Client voice is set to Deepgram",
    outputConfigured
      ? "hosted Deepgram TTS is configured"
      : "hosted Deepgram TTS is incomplete",
    runtimeConfigured
      ? "the Deepgram billy_voice runtime env is wired"
      : `the Deepgram billy_voice runtime is missing ${runtimeMissing.length} env value${runtimeMissing.length === 1 ? "" : "s"}`,
  ];

  return {
    ok: clientMode !== "disabled" || outputConfigured || runtimeConfigured,
    client: {
      mode: clientMode,
      preferredBrowserVoice,
    },
    output: {
      provider: "deepgram",
      configured: outputConfigured,
      model: env.DEEPGRAM_BILLY_TTS_MODEL?.trim() || "aura-2-aries-en",
      endpoint: "/api/voice/billy",
    },
    runtime: {
      configured: runtimeConfigured,
      missing: runtimeMissing,
      livekitUrl: env.LIVEKIT_URL?.trim() || null,
      billyApiUrl: env.BILLY_API_URL?.trim() || null,
      deepgramApiKeyConfigured: outputConfigured,
      voiceProfileSlug: env.VOICE_PROFILE_SLUG?.trim() || null,
      voiceProfileRegistry: env.VOICE_PROFILE_REGISTRY?.trim() || null,
      billyMode: env.BILLY_MODE?.trim() || null,
    },
    summary: summaryParts.join("; ") + ".",
  };
}
