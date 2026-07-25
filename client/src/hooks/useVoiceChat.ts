/**
 * useVoiceChat.ts — Universal Voice-to-Text Hook
 * GestaltView v6 — Keith Soyka
 *
 * Works across all chat windows in the application.
 * Uses the Web Speech API (SpeechRecognition) with:
 *   - Interim results for live transcript display
 *   - Continuous mode option for long dictation
 *   - Audio level visualization via Web Audio API
 *   - Graceful degradation if mic is denied or unsupported
 */

import { useState, useRef, useCallback, useEffect } from "react";

export interface VoiceChatOptions {
  /** Called with the final transcript when recognition ends */
  onTranscript?: (text: string) => void;
  /** Called with interim (in-progress) transcript for live display */
  onInterim?: (text: string) => void;
  /** Language code, defaults to "en-US" */
  lang?: string;
  /** Whether to keep listening until manually stopped */
  continuous?: boolean;
}

export interface VoiceChatState {
  isListening: boolean;
  isRecording: boolean;
  isSupported: boolean;
  interimText: string;
  transcript: string;
  audioLevel: number;
  error: string | null;
  toggle: () => void;
  stop: () => void;
  start: () => void;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useVoiceChat(options: VoiceChatOptions = {}): VoiceChatState {
  const { onTranscript, onInterim, lang = "en-US", continuous = false } = options;

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>("");
  const shouldKeepListeningRef = useRef(false);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    const speechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(Boolean(speechRecognitionClass));

    return () => {
      shouldKeepListeningRef.current = false;
      recognitionRef.current?.abort?.();
      cleanup();
    };
  }, [cleanup]);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      const context = new AudioContextClass();
      audioCtxRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const poll = () => {
        if (!analyserRef.current) {
          return;
        }

        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const average =
          data.reduce((sum: number, value: number) => sum + value, 0) / data.length / 255;
        setAudioLevel(average);
        animFrameRef.current = requestAnimationFrame(poll);
      };

      poll();
    } catch {
      // Visualization is optional; do not block recognition if mic metering fails.
    }
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    setError(null);
    shouldKeepListeningRef.current = true;
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimText("");

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      void startAudioVisualization();
    };

    recognition.onresult = (event: any) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];

      for (let index = 0; index < event.results.length; index += 1) {
        const nextTranscript = event.results[index]?.[0]?.transcript ?? "";
        if (event.results[index].isFinal) {
          finalParts.push(nextTranscript);
        } else {
          interimParts.push(nextTranscript);
        }
      }

      const resolvedFinal = finalParts.join(" ").replace(/\s+/g, " ").trim();
      const resolvedInterim = interimParts.join(" ").replace(/\s+/g, " ").trim();

      if (resolvedFinal && resolvedFinal !== finalTranscriptRef.current) {
        finalTranscriptRef.current = resolvedFinal;
        setTranscript(resolvedFinal);
        onTranscript?.(resolvedFinal);
      }

      setInterimText(resolvedInterim);
      onInterim?.(resolvedInterim);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");

      if (continuous && shouldKeepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // If restart fails, fall through to cleanup and show stopped state.
        }
      }

      cleanup();
    };

    recognition.onerror = (event: any) => {
      const message =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow mic access in your browser."
          : event.error === "no-speech"
            ? "No speech detected. Try again."
            : `Voice error: ${event.error}`;
      shouldKeepListeningRef.current = false;
      setError(message);
      setIsListening(false);
      cleanup();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      shouldKeepListeningRef.current = false;
      setError("Voice input could not be started. Please try again.");
      cleanup();
    }
  }, [cleanup, continuous, lang, onInterim, onTranscript, startAudioVisualization]);

  const stop = useCallback(() => {
    shouldKeepListeningRef.current = false;
    recognitionRef.current?.stop?.();
    setIsListening(false);
    cleanup();
  }, [cleanup]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
      return;
    }
    start();
  }, [isListening, start, stop]);

  return {
    isListening,
    isRecording: isListening,
    isSupported,
    interimText,
    transcript,
    audioLevel,
    error,
    toggle,
    stop,
    start,
    startRecording: start,
    stopRecording: stop,
  };
}
