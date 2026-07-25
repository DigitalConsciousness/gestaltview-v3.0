import { useEffect, useState } from "react";
import { X, ArchiveRestore, Link as LinkIcon, Download } from "lucide-react";

export type OrbType = "memory" | "connection" | "insight" | "pattern" | "skill" | "emotion";

export type InsightOrbModel = {
  id: string;
  type: OrbType;
  title: string;
  preview: string;
  contentRef?: string | null;
  sessionOrigin?: string | null;
  createdAt: string;
  highlightedText?: string | null;
  linkedTo?: string[];
  resonance?: number;
  updatedAt?: string;
};

type InsightOrbProps = {
  orb: InsightOrbModel | null;
  open: boolean;
  linkMode?: boolean;
  connections?: string[];
  externalLinks?: string[];
  onArchive?: (orb: InsightOrbModel) => void;
  onDownload?: (orb: InsightOrbModel) => void;
  onLinkAnother?: () => void;
  onClose: () => void;
};

function useIsCompact(): boolean {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsCompact(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isCompact;
}

export default function InsightOrb({
  orb,
  open,
  linkMode,
  connections = [],
  externalLinks = [],
  onArchive,
  onDownload,
  onLinkAnother,
  onClose,
}: InsightOrbProps) {
  const isCompact = useIsCompact();

  if (!open || !orb) {
    return null;
  }

  const shellClassName = isCompact
    ? "fixed inset-x-0 bottom-0 z-50 max-h-[70dvh] overflow-y-auto rounded-t-[1.6rem] border border-white/10 bg-gv-bg-deep/98 p-4 shadow-[0_-18px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    : "fixed right-4 top-4 z-50 w-[min(92vw,26rem)] rounded-[1.6rem] border border-white/10 bg-gv-bg-deep/96 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl";

  return (
    <div className={shellClassName}>
      {isCompact ? <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-white/12" /> : null}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
        aria-label="Close orb detail"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="pr-12">
        <p className="text-xs uppercase tracking-[0.22em] text-gv-text-muted">{orb.type}</p>
        <h3 className="mt-2 text-2xl font-semibold text-gv-text-primary">{orb.title}</h3>
        <p className="mt-3 text-sm leading-6 text-gv-text-secondary">{orb.preview}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Session origin</p>
          <p className="mt-2 text-sm text-gv-text-primary">{orb.sessionOrigin ?? "Unknown"}</p>
        </div>
        <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Date</p>
          <p className="mt-2 text-sm text-gv-text-primary">{new Date(orb.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-3 rounded-[1.1rem] border border-white/10 bg-black/25 p-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Highlighted extraction</p>
        <p className="mt-2 text-sm leading-6 text-gv-text-secondary">{orb.highlightedText ?? orb.preview}</p>
      </div>

      {connections.length > 0 ? (
        <div className="mt-3 rounded-[1.1rem] border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Linked orbs</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {connections.map((connection) => (
              <span key={connection} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gv-text-secondary">
                {connection}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {externalLinks.length > 0 ? (
        <div className="mt-3 rounded-[1.1rem] border border-white/10 bg-black/25 p-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">External Scaffold links</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <span key={link} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gv-text-secondary">
                {link}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {onLinkAnother ? (
          <button
            type="button"
            onClick={onLinkAnother}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              linkMode
                ? "border-gv-aurora-cyan/30 bg-gv-aurora-cyan/10 text-gv-text-primary"
                : "border-white/10 bg-white/[0.04] text-gv-text-primary hover:border-white/20 hover:bg-white/[0.08]"
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Link to another orb
          </button>
        ) : null}
        {onArchive ? (
          <button
            type="button"
            onClick={() => onArchive(orb)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
          >
            <ArchiveRestore className="h-4 w-4" />
            Archive orb
          </button>
        ) : null}
        {onDownload ? (
          <button
            type="button"
            onClick={() => onDownload(orb)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/14"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        ) : null}
      </div>

      {linkMode ? (
        <div className="mt-4 rounded-[1.1rem] border border-cyan-300/12 bg-cyan-300/[0.06] p-3 text-sm leading-6 text-gv-text-secondary">
          Link mode is active. Tap the current orb in the graph to use it as the source, then tap
          another orb to connect it.
        </div>
      ) : null}
    </div>
  );
}
