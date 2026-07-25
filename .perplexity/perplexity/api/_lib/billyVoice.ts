// api/_lib/billyVoice.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

export type BillyVoiceClientMode = "disabled" | "browser" | "elevenlabs";

export interface BillyVoiceHealth {
  ok: boolean;
  client: {
    mode: BillyVoiceClientMode;
    preferredBrowserVoice: string | null;
  };
  output: {
    provider: "elevenlabs";
    configured: boolean;
    voiceIdConfigured: boolean;
    model: string | null;
    endpoint: "/api/voice/billy";
  };
  runtime: {
    configured: boolean;
    missing: string[];
    livekitUrl: string | null;
    billyApiUrl: string | null;
    cosyvoiceUrl: string | null;
    cosyvoiceSpeaker: string | null;
    whisperModel: string | null;
    whisperDevice: string | null;
    whisperLanguage: string | null;
    billyMode: string | null;
  };
  summary: string;
}

export const BILLY_VOICE_RUNTIME_ENV_KEYS = [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "BILLY_API_URL",
  "COSYVOICE_URL",
  "COSYVOICE_SPEAKER",
  "WHISPER_MODEL",
  "WHISPER_DEVICE",
  "WHISPER_LANGUAGE",
  "BILLY_MODE",
] as const;

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function normalizeBillyVoiceClientMode(value: string | undefined): BillyVoiceClientMode {
  if (value === "browser" || value === "elevenlabs") {
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
  const outputConfigured = hasValue(env.ELEVENLABS_API_KEY);
  const voiceIdConfigured = hasValue(env.ELEVENLABS_BILLY_VOICE_ID);
  const runtimeMissing = BILLY_VOICE_RUNTIME_ENV_KEYS.filter((key) => !hasValue(env[key]));
  const runtimeConfigured = runtimeMissing.length === 0;

  const summaryParts = [
    clientMode === "disabled"
      ? "Client voice is disabled"
      : clientMode === "browser"
        ? preferredBrowserVoice
          ? `Client voice is set to browser (${preferredBrowserVoice})`
          : "Client voice is set to browser"
        : "Client voice is set to ElevenLabs",
    outputConfigured && voiceIdConfigured
      ? "hosted ElevenLabs TTS is configured"
      : "hosted ElevenLabs TTS is incomplete",
    runtimeConfigured
      ? "the alternate billy_voice runtime env is wired"
      : `the alternate billy_voice runtime is missing ${runtimeMissing.length} env value${runtimeMissing.length === 1 ? "" : "s"}`,
  ];

  return {
    ok: clientMode !== "disabled" || (outputConfigured && voiceIdConfigured) || runtimeConfigured,
    client: {
      mode: clientMode,
      preferredBrowserVoice,
    },
    output: {
      provider: "elevenlabs",
      configured: outputConfigured,
      voiceIdConfigured,
      model: env.ELEVENLABS_TTS_MODEL?.trim() || "eleven_multilingual_v2",
      endpoint: "/api/voice/billy",
    },
    runtime: {
      configured: runtimeConfigured,
      missing: runtimeMissing,
      livekitUrl: env.LIVEKIT_URL?.trim() || null,
      billyApiUrl: env.BILLY_API_URL?.trim() || null,
      cosyvoiceUrl: env.COSYVOICE_URL?.trim() || null,
      cosyvoiceSpeaker: env.COSYVOICE_SPEAKER?.trim() || null,
      whisperModel: env.WHISPER_MODEL?.trim() || null,
      whisperDevice: env.WHISPER_DEVICE?.trim() || null,
      whisperLanguage: env.WHISPER_LANGUAGE?.trim() || null,
      billyMode: env.BILLY_MODE?.trim() || null,
    },
    summary: summaryParts.join("; ") + ".",
  };
}
