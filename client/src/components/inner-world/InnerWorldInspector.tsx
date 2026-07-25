import type { ReactNode } from "react";
import { FileDown, Send, Sparkles, Trash2 } from "lucide-react";
import { SOURCE_LABELS, type InnerWorldCapture } from "@/components/Scaffold";

type Props = {
  capture: InnerWorldCapture | null;
  onSendToExternalScaffold: (capture: InnerWorldCapture) => void;
  onSendToCreationCorner?: (capture: InnerWorldCapture) => void;
  onDownload?: (capture: InnerWorldCapture) => void;
  onDelete?: (captureId: string) => void;
};

export function InnerWorldInspector({
  capture,
  onSendToExternalScaffold,
  onSendToCreationCorner,
  onDownload,
  onDelete,
}: Props) {
  if (!capture) {
    return (
      <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/50">
        Select an artifact to inspect its context, metadata, and routing options.
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/70">Artifact context</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{capture.title}</h3>
        </div>
        <Sparkles className="h-5 w-5 text-fuchsia-200" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/62">{capture.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill>{SOURCE_LABELS[capture.source]}</Pill>
        <Pill>{capture.type}</Pill>
        <Pill>{capture.surface}</Pill>
        {capture.tags.slice(0, 4).map((tag) => (
          <Pill key={tag}>{tag}</Pill>
        ))}
      </div>
      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Context trail</p>
        <div className="mt-3 space-y-2 text-xs text-white/58">
          <HistoryRow label="Created" value={capture.createdAt} />
          <HistoryRow label="Updated" value={capture.metadata.updatedAt ?? capture.metadata.createdAt} />
          <HistoryRow label="Transcript" value={capture.transcript ?? capture.metadata.transcript ?? "Not present"} />
        </div>
      </div>
      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Placement</p>
        <p className="mt-2 text-sm leading-relaxed text-white/58">
          Surfaces are assigned automatically by the room. This panel only shows the current landing.
        </p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSendToExternalScaffold(capture)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/16"
        >
          <Send className="h-3.5 w-3.5" />
          External Scaffold
        </button>
        {onSendToCreationCorner ? (
          <button
            type="button"
            onClick={() => onSendToCreationCorner(capture)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50 transition-colors hover:bg-emerald-300/16"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Creation Corner
          </button>
        ) : null}
        {onDownload ? (
          <button
            type="button"
            onClick={() => onDownload(capture)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:text-white"
          >
            <FileDown className="h-3.5 w-3.5" />
            Download
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(capture.id)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold text-rose-50 transition-colors hover:bg-rose-300/16"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/48">
      {children}
    </span>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</span>
      <span className="max-w-[70%] text-right text-white/66">{value}</span>
    </div>
  );
}
