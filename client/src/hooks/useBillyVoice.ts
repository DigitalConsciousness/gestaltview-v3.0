import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type BillyVoiceProvider = "deepgram" | "browser" | "none";
export type BillyVoiceMode = "disabled" | "deepgram" | "browser";

export interface BillyVoiceState {
  isSpeaking: boolean;
  isAvailable: boolean;
  provider: BillyVoiceProvider;
  mode: BillyVoiceMode;
  error: string | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

const ENV =
  typeof import.meta !== "undefined"
    ? ((import.meta as { env?: Record<string, string> }).env ?? {})
    : {};

const PREFERRED_BROWSER_VOICE_NAME = ENV.VITE_BILLY_BROWSER_VOICE_NAME?.trim() ?? "";
const DISABLED_VOICE_MESSAGE =
  "Voice reply is offline until the dedicated Billy voice runtime is ready.";
const BROWSER_VOICE_UNAVAILABLE_MESSAGE =
  "Browser speech synthesis is not available in this browser.";

function normalizeBillyVoiceMode(value: string | undefined): BillyVoiceMode {
  if (value === "deepgram") {
    return "deepgram";
  }

  if (value === "browser") {
    return "browser";
  }

  return "disabled";
}

const DEFAULT_BILLY_VOICE_MODE: BillyVoiceMode = normalizeBillyVoiceMode(
  ENV.VITE_BILLY_VOICE ?? "deepgram"
);

function normalizeSpeechText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function browserSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function pickBrowserVoice(
  voices: SpeechSynthesisVoice[],
  preferredName: string
): SpeechSynthesisVoice | null {
  if (!voices.length) {
    return null;
  }

  const normalizedPreferredName = preferredName.trim().toLowerCase();
  if (normalizedPreferredName) {
    const exactMatch = voices.find((voice) => voice.name.trim().toLowerCase() === normalizedPreferredName);
    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = voices.find((voice) =>
      voice.name.trim().toLowerCase().includes(normalizedPreferredName)
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  return (
    voices.find((voice) => voice.default) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
    voices[0] ??
    null
  );
}

export function useBillyVoice(): BillyVoiceState {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [provider, setProvider] = useState<BillyVoiceProvider>("none");
  const [error, setError] = useState<string | null>(null);

  const mode = useMemo<BillyVoiceMode>(() => DEFAULT_BILLY_VOICE_MODE, []);
  const isBrowserVoiceSupported = useMemo(() => browserSpeechSynthesisSupported(), []);
  const isAvailable = useMemo(
    () => mode === "deepgram" || (mode === "browser" && isBrowserVoiceSupported),
    [isBrowserVoiceSupported, mode]
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const browserUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      browserUtteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    clearObjectUrl();
    setIsSpeaking(false);
  }, [clearObjectUrl]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (!isBrowserVoiceSupported) {
      return;
    }

    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.getVoices();

    const handleVoicesChanged = () => {
      speechSynthesis.getVoices();
    };

    speechSynthesis.addEventListener?.("voiceschanged", handleVoicesChanged);
    return () => {
      speechSynthesis.removeEventListener?.("voiceschanged", handleVoicesChanged);
    };
  }, [isBrowserVoiceSupported]);

  const speak = useCallback(
    async (rawText: string) => {
      const text = normalizeSpeechText(rawText).slice(0, 2400);
      if (!text) {
        return;
      }

      stop();
      setError(null);

      if (mode === "disabled") {
        setProvider("none");
        setError(DISABLED_VOICE_MESSAGE);
        return;
      }

      if (mode === "browser") {
        if (!isBrowserVoiceSupported) {
          setProvider("none");
          setError(BROWSER_VOICE_UNAVAILABLE_MESSAGE);
          return;
        }

        try {
          await new Promise<void>((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            const browserVoice = pickBrowserVoice(
              window.speechSynthesis.getVoices(),
              PREFERRED_BROWSER_VOICE_NAME
            );

            if (browserVoice) {
              utterance.voice = browserVoice;
              utterance.lang = browserVoice.lang;
            } else {
              utterance.lang = "en-US";
            }

            utterance.rate = 0.94;
            utterance.pitch = 0.93;
            utterance.volume = 1;

            utterance.onstart = () => {
              browserUtteranceRef.current = utterance;
              setProvider("browser");
              setIsSpeaking(true);
              setError(null);
            };
            utterance.onend = () => {
              browserUtteranceRef.current = null;
              setIsSpeaking(false);
              resolve();
            };
            utterance.onerror = (event) => {
              browserUtteranceRef.current = null;
              setIsSpeaking(false);
              reject(new Error(event.error || "Billy browser voice playback failed."));
            };

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          });
        } catch (playbackError) {
          setProvider("none");
          setIsSpeaking(false);
          setError(
            playbackError instanceof Error
              ? playbackError.message
              : "Billy browser voice playback failed."
          );
        }
        return;
      }

      if (mode === "deepgram") {
        try {
          const response = await fetch("/api/voice/billy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });

          if (!response.ok) {
            let errorMessage = `Billy voice API error ${response.status}`;
            try {
              const payload = (await response.json()) as { error?: string };
              if (payload.error?.trim()) {
                errorMessage = payload.error.trim();
              }
            } catch {
              const raw = await response.text();
              if (raw.trim()) {
                errorMessage = raw.trim();
              }
            }
            throw new Error(errorMessage);
          }

          const audioBlob = await response.blob();
          const objectUrl = URL.createObjectURL(audioBlob);
          objectUrlRef.current = objectUrl;
          const audio = new Audio(objectUrl);
          audioRef.current = audio;

          await new Promise<void>((resolve, reject) => {
            audio.onplay = () => {
              setProvider("deepgram");
              setIsSpeaking(true);
              setError(null);
            };
            audio.onended = () => {
              setIsSpeaking(false);
              audioRef.current = null;
              clearObjectUrl();
              resolve();
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              audioRef.current = null;
              clearObjectUrl();
              reject(new Error("Billy voice playback failed."));
            };

            void audio.play().catch((playError: unknown) => {
              reject(playError instanceof Error ? playError : new Error(String(playError)));
            });
          });
        } catch (playbackError) {
          setProvider("none");
          setIsSpeaking(false);
          clearObjectUrl();
          setError(
            playbackError instanceof Error ? playbackError.message : "Billy voice playback failed."
          );
        }
        return;
      }

      setProvider("none");
      setError(DISABLED_VOICE_MESSAGE);
    },
    [clearObjectUrl, isBrowserVoiceSupported, mode, stop]
  );

  return {
    isSpeaking,
    isAvailable,
    provider,
    mode,
    error,
    speak,
    stop,
  };
}
