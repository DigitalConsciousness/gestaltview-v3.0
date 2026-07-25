import { Pause, Play, Square, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TranscriptoryRecorder({
  onRecordingReady,
}: {
  onRecordingReady: (file: File) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isRecording || !startedAt || isPaused) return;
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 500);
    return () => window.clearInterval(timer);
  }, [isPaused, isRecording, startedAt]);

  const start = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser does not expose MediaRecorder. Upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `transcriptory-${Date.now()}.webm`, { type });
        onRecordingReady(file);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start(10_000);
      recorderRef.current = recorder;
      streamRef.current = stream;
      setStartedAt(Date.now());
      setElapsed(0);
      setIsRecording(true);
      setIsPaused(false);
    } catch {
      setError("Microphone access is needed for voice input. Allow it in browser settings or upload an audio file.");
    }
  };

  const pause = () => {
    recorderRef.current?.pause();
    setIsPaused(true);
  };

  const resume = () => {
    recorderRef.current?.resume();
    setStartedAt(Date.now() - elapsed);
    setIsPaused(false);
  };

  const stop = () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setIsPaused(false);
  };

  const elapsedLabel = `${Math.floor(elapsed / 60000)}:${String(Math.floor((elapsed / 1000) % 60)).padStart(2, "0")}`;

  return (
    <section className="rounded-[2rem] border border-rose-300/18 bg-rose-300/[0.055] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-rose-100/72">
            <Radio className="size-3.5" />
            Active session
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {isRecording ? `Recording - ${elapsedLabel}` : "Record directly into Transcriptory"}
          </p>
          <p className="mt-1 text-sm text-white/58">
            Uses MediaRecorder chunks. Browser SpeechRecognition is intentionally not used.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isRecording ? (
            <button type="button" onClick={start} className="rounded-full bg-rose-300 px-4 py-2 text-sm font-bold text-[#19080a]">
              Record
            </button>
          ) : isPaused ? (
            <button type="button" onClick={resume} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-[#031014]">
              <Play className="size-4" />
              Resume
            </button>
          ) : (
            <button type="button" onClick={pause} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm text-white">
              <Pause className="size-4" />
              Pause
            </button>
          )}
          {isRecording ? (
            <button type="button" onClick={stop} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm text-white">
              <Square className="size-4" />
              Stop + Save
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-4 rounded-2xl border border-rose-200/20 bg-black/20 p-3 text-sm text-rose-50">{error}</p> : null}
    </section>
  );
}
