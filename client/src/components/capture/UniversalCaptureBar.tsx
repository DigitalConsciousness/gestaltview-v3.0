import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Mic, MicOff, SendHorizonal, Upload } from "lucide-react";
import {
  readUserSurfaceSettings,
  USER_SURFACE_SETTINGS_EVENT,
  type UserSurfaceSettings,
} from "@/lib/userSurfaceSettings";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (source?: "typed" | "voice" | "upload") => void;
  onUploadFile?: (file: File) => Promise<void> | void;
  placeholder?: string;
  companion?: ReactNode;
};

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export default function UniversalCaptureBar({ value, onChange, onSubmit, onUploadFile, placeholder, companion }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const committedVoiceTextRef = useRef("");
  const shouldSubmitOnEndRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(() => readUserSurfaceSettings());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "u") {
        event.preventDefault();
        fileRef.current?.click();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const next = (event as CustomEvent<UserSurfaceSettings>).detail ?? readUserSurfaceSettings();
      setSurfaceSettings(next);
      if (!next.voiceCapture) {
        recognitionRef.current?.stop?.();
      }
    };

    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    return () => window.removeEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
  }, []);

  const startVoice = () => {
    if (!surfaceSettings.voiceCapture) {
      setVoiceError("Voice capture is turned off in Settings.");
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceError("Voice capture unavailable in this browser. Type or upload still works.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setVoiceError(null);
      committedVoiceTextRef.current = value.trim();
      shouldSubmitOnEndRef.current = false;
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (shouldSubmitOnEndRef.current && committedVoiceTextRef.current.trim()) {
        onSubmit("voice");
      }
      shouldSubmitOnEndRef.current = false;
    };
    recognition.onerror = (event: any) => setVoiceError(event?.error ? `Voice capture stopped: ${event.error}` : "Voice capture stopped.");
    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      const normalizedFinal = finalChunk.replace(/\s+/g, " ").trim();
      const normalizedInterim = interimChunk.replace(/\s+/g, " ").trim();

      if (normalizedFinal) {
        committedVoiceTextRef.current = [committedVoiceTextRef.current, normalizedFinal].filter(Boolean).join(" ").trim();
        shouldSubmitOnEndRef.current = true;
        onChange(committedVoiceTextRef.current);
        return;
      }

      if (normalizedInterim) {
        const preview = [committedVoiceTextRef.current, normalizedInterim].filter(Boolean).join(" ").trim();
        onChange(preview);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => recognitionRef.current?.stop?.();

  return (
    <div className="rounded-[1.75rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/70">Capture lane</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/64">
            Capture raw thought, voice, or a file. The room holds it first.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/54">
          Cmd/Ctrl+U upload
        </div>
      </div>

      <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-3 shadow-[inset_0_0_40px_rgba(18,214,255,0.06)]">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? "Capture raw thought, voice, or file..."}
          className="min-h-[112px] w-full resize-none rounded-[1rem] border border-white/10 bg-[#05060a]/75 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/32 focus:border-cyan-300/30"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file && onUploadFile) {
                  await onUploadFile(file);
                  onSubmit("upload");
                }
                event.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
            <button
              type="button"
              disabled={!surfaceSettings.voiceCapture}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] transition-colors ${
                isListening
                  ? "border-rose-300/25 bg-rose-300/10 text-rose-50"
                  : surfaceSettings.voiceCapture
                    ? "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08]"
                    : "cursor-not-allowed border-white/8 bg-white/[0.02] text-white/30"
              }`}
              onClick={isListening ? stopVoice : startVoice}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {isListening ? "Stop" : "Voice"}
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/12 px-4 py-2 text-xs uppercase tracking-[0.16em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
            onClick={() => onSubmit("typed")}
          >
            <SendHorizonal className="h-3.5 w-3.5" />
            Capture
          </button>
        </div>
      </div>

      {voiceError ? <p className="mt-3 text-xs text-amber-200">{voiceError}</p> : null}
      {companion ? (
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/18 p-3">
          {companion}
        </div>
      ) : null}
    </div>
  );
}
