import { type ReactNode } from "react";
import { X } from "lucide-react";

export interface CreationPanelProps {
  open: boolean;
  title?: string;
  content: string;
  onClose: () => void;
  onScaffold: () => void;
  onInnerWorld: () => void;
  onCreationCorner: () => void;
  onTribunal: () => void;
  onSave: () => void;
  onShare: () => void;
}

function Button({
  children,
  onClick,
}: {
    children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {children}
    </button>
  );
}

export default function CreationPanel({
  open,
  title = "Creation Panel",
  content,
  onClose,
  onScaffold,
  onInnerWorld,
  onCreationCorner,
  onTribunal,
  onSave,
  onShare,
}: CreationPanelProps) {
  return (
    <aside
      className={[
        "fixed right-0 top-[64px] z-30 h-[calc(100dvh-64px)] w-full max-w-[460px] border-l border-white/10 bg-black/90 backdrop-blur-xl transition-transform duration-200",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-white/10 px-4 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/60">Creation</p>
            <h2 className="mt-1 text-lg font-semibold text-white/90">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-cyan-200/25 hover:text-cyan-100"
            aria-label="Close creation panel"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Seed</p>
            <pre className="mt-3 max-h-[44vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-white/78">
              {content || "No seed selected yet."}
            </pre>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onScaffold}>Scaffold</Button>
            <Button onClick={onInnerWorld}>Inner World</Button>
            <Button onClick={onCreationCorner}>Creation Corner</Button>
            <Button onClick={onTribunal}>Tribunal</Button>
            <Button onClick={onSave}>Save</Button>
            <Button onClick={onShare}>Share</Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
