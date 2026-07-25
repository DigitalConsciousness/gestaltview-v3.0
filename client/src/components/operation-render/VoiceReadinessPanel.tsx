import { useEffect, useMemo, useState } from "react";
import { Radio, ShieldCheck, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type BillyVoiceHealthResponse = {
  ok?: boolean;
  timestamp?: string;
  voice?: {
    client?: {
      mode?: "disabled" | "browser" | "deepgram";
      preferredBrowserVoice?: string | null;
    };
    output?: {
      configured?: boolean;
      model?: string | null;
      endpoint?: string;
    };
    runtime?: {
      configured?: boolean;
      missing?: string[];
      livekitUrl?: string | null;
      billyApiUrl?: string | null;
      deepgramApiKeyConfigured?: boolean;
      voiceProfileSlug?: string | null;
      voiceProfileRegistry?: string | null;
      billyMode?: string | null;
    };
    summary?: string;
  };
};

type ReadinessRow = {
  label: string;
  ready: boolean;
  detail: string;
};

function hasWindowSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function VoiceReadinessPanel() {
  const [health, setHealth] = useState<BillyVoiceHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVoiceHealth() {
      try {
        setLoading(true);
        const response = await fetch("/api/billy-health", {
          method: "GET",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        const payload = (await response.json()) as BillyVoiceHealthResponse;
        setHealth(payload);
        setError(response.ok ? null : payload.voice?.summary ?? "Billy voice health check returned an error.");
      } catch (thrown) {
        if (controller.signal.aborted) {
          return;
        }

        setHealth(null);
        setError(thrown instanceof Error ? thrown.message : "Unable to load Billy voice health.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadVoiceHealth();

    return () => controller.abort();
  }, []);

  const browserSupported = useMemo(() => hasWindowSpeechSynthesis(), []);
  const voice = health?.voice;
  const localWorkerConfigured = Boolean(voice?.runtime?.configured);
  const deepgramConfigured = Boolean(voice?.output?.configured);
  const activeProvider =
    voice?.client?.mode === "browser" && browserSupported
      ? "browser"
      : voice?.client?.mode === "deepgram"
        ? "deepgram"
        : localWorkerConfigured
          ? "local"
          : browserSupported
            ? "browser"
            : "text-only";

  const rows: ReadinessRow[] = [
    {
      label: "Open/local worker path",
      ready: localWorkerConfigured,
      detail: localWorkerConfigured
        ? "Worker and runtime env look wired for API-light voice."
        : "Not configured yet; text fallback remains available.",
    },
    {
      label: "Deepgram hosted TTS",
      ready: deepgramConfigured,
      detail: deepgramConfigured
        ? `Hosted TTS is configured with ${voice?.output?.model ?? "the default model"}.`
        : "Missing key should not break the page.",
    },
    {
      label: "Browser voice",
      ready: browserSupported,
      detail: browserSupported
        ? "The current browser can fall back to speech synthesis."
        : "This browser does not expose speech synthesis.",
    },
    {
      label: "Text-only continuity",
      ready: true,
      detail: "Always available when audio providers are unavailable.",
    },
  ];

  return (
    <GlassCard surfaceRole="active" glow="cyan" intensity="medium" hover={false} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00D4FF]">voice readiness</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Provider status is transparent.</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">
          {loading ? "checking" : activeProvider}
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex gap-3 rounded-xl border border-[#FFD700]/25 bg-[#FFD700]/8 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-[#FFD700]" />
          <div>
            <p className="text-sm font-semibold text-white">Health check fallback</p>
            <p className="text-xs leading-relaxed text-white/55">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            {row.ready ? (
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[#A7F3D0]" />
            ) : (
              <WifiOff className="mt-0.5 h-4 w-4 text-[#FFD700]" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">{row.label}</p>
              <p className="text-xs leading-relaxed text-white/55">{row.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-white/50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
        Raw audio is not stored by default in this readiness layer.
      </p>
    </GlassCard>
  );
}
