// tribunal/InvocationAudioPlayer.tsx
// © 2026 Keith Soyka / GestaltView

import { useEffect, useMemo, useRef, useState } from "react";
import type { InvocationSegment } from "@/lib/invocation-segments";

interface InvocationAudioPlayerProps {
  audioUrl: string;
  title: string;
  description: string;
  segments: InvocationSegment[];
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function findActiveSegmentIndex(segments: InvocationSegment[], currentTime: number): number {
  return segments.findIndex(
    (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
  );
}

function InvocationAudioPlayer({ audioUrl, title, description, segments }: InvocationAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const activeSegmentIndex = useMemo(
    () => findActiveSegmentIndex(segments, currentTime),
    [currentTime, segments]
  );

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleLoadedMetadata = (): void => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleTimeUpdate = (): void => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = (): void => {
      setIsPlaying(true);
      setErrorMessage("");
    };

    const handlePause = (): void => {
      setIsPlaying(false);
    };

    const handleEnded = (): void => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (): void => {
      setIsPlaying(false);
      setErrorMessage(
        "Invocation audio could not be loaded from /audio/tribunal/philosophers-invocation.mp3 in this checkout."
      );
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlayback = async (): Promise<void> => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setErrorMessage(
          "The browser blocked playback or the tribunal audio asset is unavailable in this environment."
        );
      }
      return;
    }

    audio.pause();
  };

  const seekToSegment = (segment: InvocationSegment): void => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = segment.startTime;
    setCurrentTime(segment.startTime);
  };

  return (
    <section className="rounded-3xl border border-[#00D4FF]/20 bg-black/40 p-6 shadow-[0_0_35px_rgba(0,212,255,0.16)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[#00D4FF]/80">Invocation</p>
          <h2
            className="mt-3 text-2xl font-semibold text-[#00D4FF]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/72">{description}</p>
        </div>

        <div className="min-w-[260px] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <audio ref={audioRef} preload="none" src={audioUrl} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/12 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#8CEBFF] transition hover:bg-[#00D4FF]/20"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <div className="text-xs uppercase tracking-[0.18em] text-white/55">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[#00D4FF] transition-[width] duration-150"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
            />
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/8 px-3 py-2 text-xs leading-relaxed text-amber-200">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {segments.map((segment, index) => {
          const isActive = index === activeSegmentIndex;

          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => seekToSegment(segment)}
              className="w-full rounded-2xl border px-4 py-4 text-left transition"
              style={{
                borderColor: isActive ? "rgba(0,212,255,0.35)" : "rgba(255,255,255,0.08)",
                background: isActive ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
                boxShadow: isActive ? "0 0 24px rgba(0,212,255,0.12)" : "none",
              }}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#00D4FF]/80">{segment.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{segment.text}</p>
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                  {formatTime(segment.startTime)}–{formatTime(segment.endTime)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default InvocationAudioPlayer;
