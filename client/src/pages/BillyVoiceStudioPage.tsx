// © 2026 Keith Soyka — GestaltView
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import EmbodimentSelector from "@/components/EmbodimentSelector";
import { callBillyApi, type BillyConversationMode } from "@/lib/billyApi";
import { useBillyVoice } from "@/hooks/useBillyVoice";
import { useBillyVoicePreference } from "@/hooks/useBillyVoicePreference";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";

interface StudioMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  provider?: string;
}

interface RuntimeCard {
  title: string;
  detail: string;
  status: "ready" | "partial" | "pending";
}

interface RuntimeFileEntry {
  name: string;
  role: string;
}

interface BillyVoiceHealth {
  client: {
    mode: "disabled" | "browser" | "deepgram";
    preferredBrowserVoice: string | null;
  };
  output: {
    provider: "deepgram";
    configured: boolean;
    model: string | null;
    endpoint: string;
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

interface BillyHealthResponse {
  timestamp?: string;
  voice?: BillyVoiceHealth;
}

const T = {
  teal: "#00D4FF",
  dim: "#006B7F",
  glow: "rgba(0,212,255,0.35)",
  bg: "#0A0F14",
  card: "#050A0E",
  black: "#000000",
  soft: "rgba(0,212,255,0.72)",
  muted: "rgba(0,212,255,0.54)",
  border: "rgba(0,212,255,0.18)",
  warn: "#F7B267",
} as const;

const STUDIO_STYLES = `
  .voice-studio-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 100% 4px;
    opacity: 0.08;
    mix-blend-mode: screen;
  }

  .voice-studio-grid {
    background-image:
      linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .voice-studio-panel {
    position: relative;
    overflow: hidden;
  }

  .voice-studio-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgba(0,212,255,0.08), transparent 42%, transparent 58%, rgba(0,212,255,0.05));
  }

  .voice-studio-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 18px;
  }

  .voice-studio-compose {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 12px;
    align-items: stretch;
  }

  .voice-studio-pulse {
    animation: voice-studio-pulse 2.2s ease-in-out infinite;
  }

  .voice-studio-transmitting {
    animation: voice-studio-transmitting 1.2s ease-in-out infinite;
  }

  @media (max-width: 980px) {
    .voice-studio-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .voice-studio-compose {
      grid-template-columns: 1fr;
    }
  }

  @keyframes voice-studio-pulse {
    0%, 100% { opacity: 0.38; transform: scale(1); }
    50% { opacity: 0.95; transform: scale(1.06); }
  }

  @keyframes voice-studio-transmitting {
    0%, 100% { opacity: 0.45; box-shadow: 0 0 0 rgba(0,212,255,0.12); }
    50% { opacity: 1; box-shadow: 0 0 22px rgba(0,212,255,0.28); }
  }
`;

const runtimeCards: RuntimeCard[] = [
  {
    title: "Browser voice loop",
    detail: "Live now on this page via Web Speech input plus Billy speech playback.",
    status: "ready",
  },
  {
    title: "Billy text response chain",
    detail: "Calls the existing /api/billy endpoint so the secret page stays aligned with Billy's real brain.",
    status: "ready",
  },
  {
    title: "LiveKit + Deepgram runtime",
    detail: "Repository files are now surfaced here with setup guidance, but still need the Python worker and Deepgram credentials running.",
    status: "partial",
  },
  {
    title: "Production-grade custom Billy voice",
    detail: "Pending once Deepgram, LiveKit, and backend worker deployment are stood up outside the browser demo.",
    status: "pending",
  },
];

const runtimeFiles: RuntimeFileEntry[] = [
  { name: "billy_voice/app.py", role: "LiveKit worker session loop" },
  { name: "billy_voice/deepgram_stt.py", role: "Deepgram speech-to-text bridge" },
  { name: "billy_voice/style_planner.py", role: "Billy delivery and style planner" },
  { name: "billy_voice/deepgram_tts.py", role: "Deepgram TTS wrapper" },
  { name: "billy_voice/README.md", role: "runtime architecture and setup guide" },
];

const runtimeEnv = [
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "BILLY_API_URL",
  "DEEPGRAM_API_KEY",
  "DEEPGRAM_BILLY_TTS_MODEL",
  "DEEPGRAM_BILLY_TTS_SPEED",
  "VOICE_PROFILE_SLUG",
  "BILLY_MODE",
];

const modeCopy: Record<BillyConversationMode, { title: string; subtitle: string }> = {
  chat: {
    title: "Chat Mode",
    subtitle: "Immediate, conversational Billy for live back-and-forth voice testing.",
  },
  synthesis: {
    title: "Synthesis Mode",
    subtitle: "More reflective Billy for longer-form continuity and grounded response shaping.",
  },
};

const shellButtonStyle: CSSProperties = {
  border: `1px solid ${T.border}`,
  background: "rgba(0,212,255,0.07)",
  color: T.teal,
  fontSize: 11,
  letterSpacing: ".16em",
  padding: "10px 14px",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "inherit",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: `1px solid ${T.border}`,
  background: "rgba(0,0,0,0.34)",
  color: T.teal,
  padding: "12px 14px",
  fontFamily: "inherit",
  fontSize: 13,
  lineHeight: 1.7,
  resize: "vertical",
  minHeight: 120,
  outline: "none",
  boxShadow: `inset 0 0 24px rgba(0,212,255,0.04), 0 0 18px rgba(0,0,0,0.22)`,
};

function getStatusColors(status: RuntimeCard["status"]) {
  if (status === "ready") {
    return {
      color: T.teal,
      glow: "rgba(0,212,255,0.18)",
      label: "READY",
    };
  }

  if (status === "partial") {
    return {
      color: T.warn,
      glow: "rgba(247,178,103,0.16)",
      label: "PARTIAL",
    };
  }

  return {
    color: "rgba(255,255,255,0.62)",
    glow: "rgba(255,255,255,0.08)",
    label: "PENDING",
  };
}

export default function BillyVoiceStudioPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<BillyConversationMode>("chat");
  const [embodimentProfileSlug, setEmbodimentProfileSlug] =
    useState<TrainerEmbodimentSlug>("billy");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<StudioMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Voice Studio is open. Use the mic or type a prompt and I'll route it through Billy's current text brain while we watch the Deepgram voice path separately.",
      provider: "studio-bootstrap",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    speak,
    stop,
    isSpeaking,
    isAvailable: isVoiceAvailable,
    provider: voiceProvider,
    mode: voiceMode,
    error: voiceError,
  } = useBillyVoice();
  const voiceReplyAvailable = isVoiceAvailable;
  const resolvedVoiceProvider = voiceProvider === "none"
    ? voiceMode === "disabled"
      ? "offline"
      : voiceMode
    : voiceProvider;
  const [voiceEnabled, setVoiceEnabled] = useBillyVoicePreference("shared");
  const [runtimeHealth, setRuntimeHealth] = useState<BillyVoiceHealth | null>(null);
  const [runtimeHealthCheckedAt, setRuntimeHealthCheckedAt] = useState<string | null>(null);
  const [isRuntimeHealthLoading, setIsRuntimeHealthLoading] = useState(false);
  const [runtimeHealthError, setRuntimeHealthError] = useState<string | null>(null);

  const refreshRuntimeHealth = useCallback(async () => {
    setIsRuntimeHealthLoading(true);
    try {
      const response = await fetch("/api/billy-health", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as BillyHealthResponse;
      setRuntimeHealth(payload.voice ?? null);
      setRuntimeHealthCheckedAt(payload.timestamp ?? new Date().toISOString());
      setRuntimeHealthError(
        response.ok
          ? null
          : `Billy health returned ${response.status}. Voice diagnostics may still be useful below.`
      );
    } catch (error: unknown) {
      setRuntimeHealthError(
        error instanceof Error ? error.message : "Unable to load Billy voice diagnostics."
      );
    } finally {
      setIsRuntimeHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRuntimeHealth();
  }, [refreshRuntimeHealth]);

  const submitPrompt = useCallback(
    async (promptOverride?: string) => {
      const resolvedPrompt = (promptOverride ?? draft).trim();
      if (!resolvedPrompt || isLoading) {
        return;
      }

      if (promptOverride === undefined) {
        setDraft("");
      }
      setApiError(null);
      setIsLoading(true);

      setMessages((previous) => [
        ...previous,
        { id: previous.length + 1, role: "user", content: resolvedPrompt },
      ]);

      try {
        const result = await callBillyApi(
          resolvedPrompt,
          "voice",
          mode,
          undefined,
          embodimentProfileSlug
        );
        setMessages((previous) => [
          ...previous,
          {
            id: previous.length + 1,
            role: "assistant",
            content: result.text,
            provider: result.provider,
          },
        ]);
        if (voiceReplyAvailable && voiceEnabled) {
          await speak(result.text);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setApiError(message);
        setMessages((previous) => [
          ...previous,
          {
            id: previous.length + 1,
            role: "assistant",
            content:
              "Billy's voice studio hit a disruption before the response loop completed. The secret room is still here — try another thread in a second.",
            provider: "error",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [draft, embodimentProfileSlug, isLoading, mode, speak, voiceEnabled, voiceReplyAvailable]
  );

  const {
    toggle,
    stop: stopListening,
    isListening,
    isSupported,
    interimText,
    audioLevel,
    error: listeningError,
  } = useVoiceChat({
    lang: "en-US",
    continuous: false,
    onTranscript: (text: string) => {
      void submitPrompt(text);
    },
  });

  const statusLine = useMemo(() => {
    if (isLoading) {
      return "Billy is weaving the reply...";
    }

    if (isSpeaking) {
      return "Billy is talking now.";
    }

    if (isListening) {
      return "Mic is hot. Speak naturally.";
    }

    return "Standby. Drop a thread when ready.";
  }, [isListening, isLoading, isSpeaking]);

  const activeError = apiError ?? voiceError ?? listeningError;
  const diagnosticsClientMode = runtimeHealth?.client.mode ?? voiceMode;
  const diagnosticsTimestamp = runtimeHealthCheckedAt
    ? new Date(runtimeHealthCheckedAt).toISOString().replace(/\..+/, " UTC").replace("T", " ")
    : null;
  const voiceOutputDetail = !voiceReplyAvailable
    ? "No Billy voice provider is currently available in this client."
    : !voiceEnabled
      ? "Voice reply is available here, but muted until you explicitly enable it in this studio."
      : voiceMode === "browser"
      ? runtimeHealth?.client.preferredBrowserVoice
        ? `Browser speech synthesis is active with ${runtimeHealth.client.preferredBrowserVoice}.`
        : "Browser speech synthesis is active in this client."
      : runtimeHealth && !runtimeHealth.output.configured
        ? "Client voice is pointed at Deepgram, but the hosted proxy is not fully configured yet."
        : "Billy is speaking through the hosted Deepgram proxy."
  const runtimeNextStep = runtimeHealth?.runtime.configured
    ? "The Deepgram billy_voice env is wired. Start LiveKit and the Python worker together, then verify room join plus interruption."
    : runtimeHealth?.runtime.missing.length
      ? `Finish Deepgram runtime env wiring first: ${runtimeHealth.runtime.missing.join(", ")}.`
      : voiceReplyAvailable
        ? "Voice playback is live here. Use the diagnostics block to finish staging the Deepgram Python runtime when you want the full LiveKit path."
        : "Stand up either browser speech or the hosted Deepgram path first, then finish the Python worker.";

  return (
    <div
      className="voice-studio-grid"
      style={{
        minHeight: "100vh",
        backgroundColor: T.bg,
        color: T.teal,
        fontFamily: "'JetBrains Mono','Courier New',monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{STUDIO_STYLES}</style>
      <div className="voice-studio-scanlines" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 20%, rgba(0,212,255,0.18), transparent 24%), radial-gradient(circle at 82% 10%, rgba(0,212,255,0.12), transparent 20%), radial-gradient(circle at 50% 55%, rgba(0,212,255,0.08), transparent 34%), linear-gradient(180deg, rgba(10,15,20,0.95), rgba(0,0,0,0.98))",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1240, margin: "0 auto", padding: "28px 16px 48px" }}>
        <div
          className="voice-studio-panel"
          style={{
            border: `1px solid ${T.border}`,
            background: "linear-gradient(180deg, rgba(5,10,14,0.96), rgba(0,0,0,0.94))",
            padding: "18px 18px 20px",
            boxShadow: `0 0 42px ${T.glow}`,
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".34em", color: T.dim, marginBottom: 10 }}>
                SECRET PAGE · BILLY / VOICESTUDIO
              </div>
              <h1 style={{ margin: 0, fontSize: 34, letterSpacing: ".18em", lineHeight: 1.1, textTransform: "uppercase" }}>
                Billy Voice Studio
              </h1>
              <p style={{ margin: "12px 0 0", maxWidth: 760, color: T.soft, fontSize: 13, lineHeight: 1.8 }}>
                This room stages Billy's alternate voice path from the <code>billy_voice</code> folder while still letting the browser and hosted voice layers carry the current loop.
                You can use the mic, inspect the live text chain, and see exactly how far the dedicated runtime is wired.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <button onClick={() => setLocation("/billy")} style={shellButtonStyle}>
                Back to Billy
              </button>
              <button onClick={() => setLocation("/")} style={shellButtonStyle}>
                Home
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div style={{ border: `1px solid ${T.border}`, padding: "14px 14px 12px", background: "rgba(0,0,0,0.32)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 8 }}>STATUS</div>
              <div style={{ fontSize: 18, color: T.teal, textShadow: `0 0 12px ${T.glow}` }}>{statusLine}</div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, padding: "14px 14px 12px", background: "rgba(0,0,0,0.32)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 8 }}>VOICE OUTPUT</div>
              <div style={{ fontSize: 18, color: voiceReplyAvailable ? T.teal : T.warn }}>
                {voiceReplyAvailable ? resolvedVoiceProvider.toUpperCase() : "OFFLINE"}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                {voiceOutputDetail}
              </div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, padding: "14px 14px 12px", background: "rgba(0,0,0,0.32)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 8 }}>MIC INPUT</div>
              <div style={{ fontSize: 18, color: isSupported ? T.teal : T.warn }}>{isSupported ? "SUPPORTED" : "UNAVAILABLE"}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Current audio level: {Math.round(audioLevel * 100)}%</div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, padding: "14px 14px 12px", background: "rgba(0,0,0,0.32)" }}>
              <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 8 }}>MODE</div>
              <div style={{ fontSize: 18, color: T.teal }}>{modeCopy[mode].title.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>{modeCopy[mode].subtitle}</div>
            </div>
          </div>
        </div>

        <div className="voice-studio-layout">
          <section
            className="voice-studio-panel"
            style={{
              border: `1px solid ${T.border}`,
              background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.95))",
              padding: "18px",
              boxShadow: `0 0 34px rgba(0,212,255,0.12)`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim, marginBottom: 8 }}>LIVE LOOP</div>
                <h2 style={{ margin: 0, fontSize: 22, letterSpacing: ".14em", textTransform: "uppercase" }}>Speak with Billy</h2>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["chat", "synthesis"] as BillyConversationMode[]).map((nextMode) => (
                  <button
                    key={nextMode}
                    onClick={() => setMode(nextMode)}
                    style={{
                      ...shellButtonStyle,
                      minWidth: 150,
                      background: mode === nextMode ? "rgba(0,212,255,0.14)" : "rgba(0,212,255,0.05)",
                      borderColor: mode === nextMode ? T.teal : T.border,
                      boxShadow: mode === nextMode ? `0 0 18px rgba(0,212,255,0.18)` : "none",
                    }}
                  >
                    {modeCopy[nextMode].title}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <EmbodimentSelector
                value={embodimentProfileSlug}
                onValueChange={setEmbodimentProfileSlug}
                label="Embodiment Standard"
                showDetails={false}
                className="max-w-md"
                triggerClassName="border-cyan-500/20 bg-black/30 text-cyan-100"
                labelClassName="text-cyan-500/60"
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <button
                onClick={() => toggle()}
                style={{
                  ...shellButtonStyle,
                  minWidth: 190,
                  background: isListening ? "rgba(255,80,80,0.12)" : "rgba(0,212,255,0.08)",
                  borderColor: isListening ? "rgba(255,90,90,0.38)" : T.teal,
                  color: isListening ? "rgba(255,140,140,0.92)" : T.teal,
                  boxShadow: isListening ? "0 0 18px rgba(255,80,80,0.16)" : "0 0 16px rgba(0,212,255,0.14)",
                }}
              >
                {isListening ? "Stop Mic" : "Talk to Billy"}
              </button>
              <button
                onClick={() => stop()}
                disabled={!voiceReplyAvailable}
                style={{
                  ...shellButtonStyle,
                  minWidth: 190,
                  background: "transparent",
                  opacity: voiceReplyAvailable ? 1 : 0.5,
                  cursor: voiceReplyAvailable ? "pointer" : "not-allowed",
                }}
              >
                Stop Voice Playback
              </button>
              <button
                onClick={() =>
                  setVoiceEnabled((current) => {
                    const nextValue = !current;
                    if (!nextValue) {
                      stop();
                    }
                    return nextValue;
                  })
                }
                disabled={!voiceReplyAvailable}
                style={{
                  ...shellButtonStyle,
                  minWidth: 190,
                  background: voiceEnabled ? "rgba(0,212,255,0.12)" : "transparent",
                  opacity: voiceReplyAvailable ? 1 : 0.5,
                  cursor: voiceReplyAvailable ? "pointer" : "not-allowed",
                }}
              >
                {!voiceReplyAvailable
                  ? "Voice Reply Offline"
                  : voiceEnabled
                    ? "Mute Voice Reply"
                    : "Enable Voice Reply"}
              </button>
              <button
                onClick={() => stopListening()}
                style={{
                  ...shellButtonStyle,
                  minWidth: 190,
                  background: "transparent",
                }}
              >
                End Current Capture
              </button>
            </div>

            <div className="voice-studio-compose" style={{ marginBottom: 16 }}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a thread for Billy here, or use the mic for hands-free capture..."
                style={inputStyle}
              />

              <div
                style={{
                  border: `1px solid ${T.border}`,
                  background: "rgba(0,0,0,0.3)",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 8 }}>VOICE STATE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span
                      className={isListening || isSpeaking ? "voice-studio-pulse" : undefined}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: isListening ? "#FF6B6B" : isSpeaking ? T.teal : T.dim,
                        display: "inline-block",
                        boxShadow: isListening ? "0 0 18px rgba(255,107,107,0.24)" : `0 0 16px ${T.glow}`,
                      }}
                    />
                    <span style={{ fontSize: 12, color: T.soft }}>{isListening ? "Listening" : isSpeaking ? "Transmitting" : "Idle"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.8 }}>
                    Interim transcript:
                    <div style={{ marginTop: 8, minHeight: 80, color: T.teal }}>{interimText || "—"}</div>
                  </div>
                </div>

                <button
                  onClick={() => void submitPrompt()}
                  disabled={isLoading || !draft.trim()}
                  className={isLoading ? "voice-studio-transmitting" : undefined}
                  style={{
                    ...shellButtonStyle,
                    opacity: isLoading || !draft.trim() ? 0.5 : 1,
                    cursor: isLoading || !draft.trim() ? "not-allowed" : "pointer",
                    background: isLoading || !draft.trim() ? "rgba(255,255,255,0.04)" : "rgba(0,212,255,0.14)",
                    borderColor: isLoading || !draft.trim() ? T.border : T.teal,
                  }}
                >
                  {isLoading ? "Weaving Reply..." : "Transmit to Billy"}
                </button>
              </div>
            </div>

            {activeError && (
              <div
                style={{
                  border: `1px solid rgba(247,178,103,0.3)`,
                  background: "rgba(247,178,103,0.08)",
                  color: T.warn,
                  fontSize: 12,
                  lineHeight: 1.8,
                  padding: "10px 12px",
                  marginBottom: 16,
                }}
              >
                {activeError}
              </div>
            )}

            <div
              style={{
                border: `1px solid ${T.border}`,
                background: "rgba(0,0,0,0.28)",
                minHeight: 420,
                maxHeight: 640,
                overflowY: "auto",
                padding: "14px",
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: ".18em", color: T.dim, marginBottom: 5 }}>
                    {message.role === "user"
                      ? "YOU"
                      : `BILLY${message.provider ? ` // ${message.provider.toUpperCase()}` : ""}`}
                  </div>
                  <div
                    style={{
                      maxWidth: "92%",
                      padding: "10px 12px",
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: message.role === "user" ? "rgba(255,255,255,0.82)" : T.teal,
                      border: `1px solid ${message.role === "user" ? "rgba(255,255,255,0.12)" : T.border}`,
                      background: message.role === "user" ? "rgba(255,255,255,0.04)" : "rgba(0,212,255,0.05)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 18, alignContent: "start" }}>
            <section
              className="voice-studio-panel"
              style={{
                border: `1px solid ${T.border}`,
                background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.94))",
                padding: "18px",
                boxShadow: `0 0 30px rgba(0,212,255,0.11)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim }}>LIVE DIAGNOSTICS</div>
                <button
                  onClick={() => void refreshRuntimeHealth()}
                  style={{
                    ...shellButtonStyle,
                    padding: "8px 12px",
                    fontSize: 10,
                    opacity: isRuntimeHealthLoading ? 0.6 : 1,
                    cursor: isRuntimeHealthLoading ? "wait" : "pointer",
                  }}
                >
                  {isRuntimeHealthLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.8, marginBottom: 12 }}>
                {runtimeHealth?.summary ??
                  (isRuntimeHealthLoading
                    ? "Checking Billy voice diagnostics..."
                    : "Voice diagnostics will appear here once the health endpoint responds.")}
              </div>
              {runtimeHealthError && (
                <div
                  style={{
                    border: `1px solid rgba(247,178,103,0.3)`,
                    background: "rgba(247,178,103,0.08)",
                    color: T.warn,
                    fontSize: 11,
                    lineHeight: 1.7,
                    padding: "8px 10px",
                    marginBottom: 12,
                  }}
                >
                  {runtimeHealthError}
                </div>
              )}
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ border: `1px solid ${T.border}`, padding: "10px 12px", background: "rgba(0,0,0,0.26)" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".16em", color: T.dim, marginBottom: 6 }}>CLIENT DRIVER</div>
                  <div style={{ fontSize: 13, color: T.teal }}>{diagnosticsClientMode.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>
                    {runtimeHealth?.client.preferredBrowserVoice
                      ? `Preferred browser voice: ${runtimeHealth.client.preferredBrowserVoice}`
                      : diagnosticsClientMode === "browser"
                        ? "No preferred browser voice is pinned."
                        : "Client mode comes from Vite voice configuration."}
                  </div>
                </div>
                <div style={{ border: `1px solid ${T.border}`, padding: "10px 12px", background: "rgba(0,0,0,0.26)" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".16em", color: T.dim, marginBottom: 6 }}>HOSTED TTS</div>
                  <div style={{ fontSize: 13, color: runtimeHealth?.output.configured ? T.teal : T.warn }}>
                    {runtimeHealth?.output.configured ? "CONFIGURED" : "INCOMPLETE"}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>
                    {runtimeHealth?.output.model
                      ? `${runtimeHealth.output.provider} · ${runtimeHealth.output.model}`
                      : "Awaiting health response."}
                  </div>
                </div>
                <div style={{ border: `1px solid ${T.border}`, padding: "10px 12px", background: "rgba(0,0,0,0.26)" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".16em", color: T.dim, marginBottom: 6 }}>ALT RUNTIME ENV</div>
                  <div style={{ fontSize: 13, color: runtimeHealth?.runtime.configured ? T.teal : T.warn }}>
                    {runtimeHealth?.runtime.configured ? "WIRED" : isRuntimeHealthLoading ? "CHECKING" : "INCOMPLETE"}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>
                    {runtimeHealth?.runtime.configured
                      ? `LiveKit ${runtimeHealth.runtime.livekitUrl || "set"} · Deepgram ${runtimeHealth.runtime.deepgramApiKeyConfigured ? "set" : "missing"}`
                      : runtimeHealth?.runtime.missing.length
                        ? `Missing: ${runtimeHealth.runtime.missing.join(", ")}`
                        : "Awaiting health response."}
                  </div>
                </div>
              </div>
              {diagnosticsTimestamp && (
                <div style={{ fontSize: 10, letterSpacing: ".16em", color: T.dim, marginTop: 12 }}>
                  LAST CHECK · {diagnosticsTimestamp}
                </div>
              )}
            </section>

            <section
              className="voice-studio-panel"
              style={{
                border: `1px solid ${T.border}`,
                background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.94))",
                padding: "18px",
                boxShadow: `0 0 30px rgba(0,212,255,0.11)`,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim, marginBottom: 10 }}>RUNTIME CHAIN</div>
              <h2 style={{ margin: 0, fontSize: 22, letterSpacing: ".14em", textTransform: "uppercase" }}>billy_voice Integration</h2>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {runtimeCards.map((card) => {
                  const status = getStatusColors(card.status);
                  return (
                    <div
                      key={card.title}
                      style={{
                        border: `1px solid ${T.border}`,
                        background: "rgba(0,0,0,0.28)",
                        padding: "12px",
                        boxShadow: `0 0 18px ${status.glow}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, color: T.teal }}>{card.title}</div>
                        <div style={{ fontSize: 10, letterSpacing: ".18em", color: status.color }}>{status.label}</div>
                      </div>
                      <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.8 }}>{card.detail}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section
              className="voice-studio-panel"
              style={{
                border: `1px solid ${T.border}`,
                background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.94))",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim, marginBottom: 10 }}>FILES DEPLOYED</div>
              <div style={{ display: "grid", gap: 10 }}>
                {runtimeFiles.map((file) => (
                  <div key={file.name} style={{ border: `1px solid ${T.border}`, padding: "10px 12px", background: "rgba(0,0,0,0.26)" }}>
                    <div style={{ fontSize: 12, color: T.teal }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>{file.role}</div>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="voice-studio-panel"
              style={{
                border: `1px solid ${T.border}`,
                background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.94))",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim, marginBottom: 10 }}>ENV WIRING</div>
              <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.8, marginBottom: 12 }}>
                These runtime variables are now documented in <code>.env.example</code> so the alternate Billy voice worker can be stood up without hunting through notes.
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {runtimeEnv.map((variable) => (
                  <div key={variable} style={{ border: `1px solid ${T.border}`, padding: "8px 10px", background: "rgba(0,0,0,0.24)", fontSize: 11, color: T.teal }}>
                    {variable}
                  </div>
                ))}
              </div>
            </section>

            <section
              className="voice-studio-panel"
              style={{
                border: `1px solid ${T.border}`,
                background: "linear-gradient(180deg, rgba(5,10,14,0.97), rgba(0,0,0,0.94))",
                padding: "18px",
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: ".22em", color: T.dim, marginBottom: 10 }}>NEXT DEPLOYMENT STEP</div>
              <div style={{ fontSize: 12, color: T.soft, lineHeight: 1.9 }}>
                {runtimeNextStep}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
