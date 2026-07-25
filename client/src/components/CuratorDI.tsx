import { Sparkles } from "lucide-react";

type CuratorDIProps = {
  message: string;
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export default function CuratorDI({ message, note, actionLabel, onAction, className }: CuratorDIProps) {
  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-3xl rounded-[1.5rem] border border-white/10 bg-gv-bg-deep/92 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gv-aurora-cyan/20 bg-gv-aurora-cyan/10 text-gv-aurora-cyan">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-gv-text-primary">{message}</p>
          {note ? <p className="mt-1 text-xs leading-5 text-gv-text-muted">{note}</p> : null}
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.07]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
