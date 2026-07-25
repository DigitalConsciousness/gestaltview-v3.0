import { CalendarClock, FileAudio, Tags, Trash2 } from "lucide-react";

import type { TranscriptoryCapture } from "@/lib/transcriptory";

export default function TranscriptCard({
  capture,
  selected,
  onOpen,
  onDelete,
}: {
  capture: TranscriptoryCapture;
  selected: boolean;
  onOpen: () => void;
  onDelete?: () => void;
}) {
  const created = new Date(capture.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? "Undated"
    : created.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const preview =
    capture.status === "failed"
      ? capture.errorMessage || "Transcription failed. Open this capture for details, then upload or record again."
      : capture.summary || capture.rawTranscript || "Audio captured. Transcription pending.";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      className={`relative w-full rounded-[1.35rem] border p-4 text-left transition-all ${
        selected
          ? "border-cyan-300/35 bg-cyan-300/[0.08] shadow-[0_18px_56px_rgba(0,212,255,0.12)]"
          : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-cyan-300/22 hover:bg-white/[0.055]"
      }`}
    >
      {onDelete ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full border border-rose-300/18 bg-rose-300/10 text-rose-50 transition hover:bg-rose-300/16"
          aria-label={`Delete ${capture.title}`}
          title={`Delete ${capture.title}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{capture.title}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">
            {preview}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
          {capture.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/42">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          {dateLabel}
        </span>
        {capture.audioStoragePath ? (
          <span className="inline-flex items-center gap-1.5">
            <FileAudio className="size-3.5" />
            audio
          </span>
        ) : null}
        {capture.themes.length > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <Tags className="size-3.5" />
            {capture.themes.slice(0, 3).join(", ")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
