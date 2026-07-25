import { AnimatePresence, motion } from "framer-motion";
import { X, ArchiveRestore, Download, Trash2 } from "lucide-react";
import ArtifactScreen, { type ArtifactScreenModel } from "./ArtifactScreen";
import type { DynamicInnerWorldResonanceLink } from "@/lib/genEngineRoomWiring";

type ArtifactDeepViewProps = {
  open: boolean;
  artifact: ArtifactScreenModel | null;
  sessionOrigin?: string;
  plkConnections?: string[];
  externalLinks?: string[];
  resonanceLinks?: DynamicInnerWorldResonanceLink[];
  onArchive?: (artifact: ArtifactScreenModel) => void;
  onDelete?: (artifact: ArtifactScreenModel) => void;
  onDownload?: (artifact: ArtifactScreenModel) => void;
  onSelectResonanceLink?: (artifactId: string) => void;
  onClose: () => void;
};

export default function ArtifactDeepView({
  open,
  artifact,
  sessionOrigin,
  plkConnections = [],
  externalLinks = [],
  resonanceLinks = [],
  onArchive,
  onDelete,
  onDownload,
  onSelectResonanceLink,
  onClose,
}: ArtifactDeepViewProps) {
  return (
    <AnimatePresence>
      {open && artifact ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 px-4 py-4 backdrop-blur-xl sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-gv-bg-deep/96 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            initial={{ y: 28, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.99 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-gv-text-primary transition-colors hover:border-white/20 hover:bg-black/55"
              aria-label="Close artifact detail"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="border-b border-white/8 lg:border-b-0 lg:border-r lg:border-white/8">
                <ArtifactScreen artifact={artifact} className="rounded-none border-0" />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gv-text-muted">Context</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gv-text-primary">{artifact.title}</h2>
                  {artifact.summary ? <p className="mt-3 text-sm leading-6 text-gv-text-secondary">{artifact.summary}</p> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Session origin</p>
                    <p className="mt-2 text-sm text-gv-text-primary">{sessionOrigin ?? "Unknown session"}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Content type</p>
                    <p className="mt-2 text-sm text-gv-text-primary">{artifact.contentType}</p>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">PLK connections</p>
                  {plkConnections.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gv-text-secondary">
                      {plkConnections.map((connection) => (
                        <li key={connection} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                          {connection}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gv-text-secondary">No PLK links surfaced yet.</p>
                  )}
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">External Scaffold links</p>
                  {externalLinks.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gv-text-secondary">
                      {externalLinks.map((link) => (
                        <li key={link} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                          {link}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gv-text-secondary">No scaffold links surfaced yet.</p>
                  )}
                </div>

                <div className="rounded-[1.25rem] border border-gv-aurora-cyan/15 bg-gv-aurora-cyan/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Resonance links</p>
                  {resonanceLinks.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gv-text-secondary">
                      {resonanceLinks.map((link) => (
                        <li key={link.artifactId}>
                          <button
                            type="button"
                            onClick={() => onSelectResonanceLink?.(link.artifactId)}
                            className="w-full rounded-xl border border-gv-aurora-cyan/15 bg-black/20 px-3 py-2 text-left transition-colors hover:border-gv-aurora-cyan/30 hover:bg-gv-aurora-cyan/[0.08]"
                          >
                            <span className="block text-gv-text-primary">{link.title}</span>
                            <span className="mt-1 block text-xs text-gv-text-secondary">
                              {Math.round(link.score * 100)}% · {link.reason}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-gv-text-secondary">No resonance links surfaced yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  {onArchive ? (
                    <button
                      type="button"
                      onClick={() => onArchive(artifact)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                      Archive
                    </button>
                  ) : null}
                  {onDownload ? (
                    <button
                      type="button"
                      onClick={() => onDownload(artifact)}
                      className="inline-flex items-center gap-2 rounded-full border border-gv-aurora-cyan/25 bg-gv-aurora-cyan/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-cyan/14"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Permanently delete "${artifact.title}"? This cannot be undone.`)) {
                          onDelete(artifact);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
