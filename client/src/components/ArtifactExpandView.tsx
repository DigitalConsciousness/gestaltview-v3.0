import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, ArchiveRestore, Trash2, Info, ChevronDown } from "lucide-react";
import type { ArtifactScreenModel } from "./ArtifactScreen";
import { HtmlArtifactRenderer } from "@/lib/rendering";
import type { DynamicInnerWorldResonanceLink } from "@/lib/genEngineRoomWiring";

type ArtifactExpandViewProps = {
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

function isHtmlString(value: string | null | undefined): boolean {
  return Boolean(value && /<\/?[a-z][\s\S]*>/i.test(value));
}

export default function ArtifactExpandView({
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
}: ArtifactExpandViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keyboard shortcuts: Esc = close, I = toggle info drawer
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if ((e.key === "i" || e.key === "I") && !e.metaKey && !e.ctrlKey) {
        setDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll while expanded
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset drawer when artifact changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [artifact?.id]);

  if (!artifact) return null;

  const src = artifact.contentRef ?? artifact.contentHtml ?? "";
  const html =
    artifact.contentType === "html"
      ? isHtmlString(src)
        ? src
        : (artifact.contentHtml ?? src)
      : isHtmlString(src)
        ? src
        : "";
  const isHtml = artifact.contentType === "html" || (artifact.contentType !== "image" && isHtmlString(src));
  const isImage = artifact.contentType === "image" && !isHtml;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded view: ${artifact.title}`}
          className="fixed inset-0 z-[60] flex flex-col bg-black"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ── Floating header ─────────────────────────────────────────── */}
          <header className="fixed inset-x-0 top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 backdrop-blur-xl sm:px-5">
            <p
              className="min-w-0 flex-1 truncate text-sm font-semibold text-white"
              title={artifact.title}
            >
              {artifact.title}
            </p>

            <div className="flex shrink-0 items-center gap-1">
              {/* Info toggle — minimum 44×44 touch target */}
              <button
                type="button"
                onClick={() => setDrawerOpen((prev) => !prev)}
                aria-label="Toggle artifact info panel"
                aria-expanded={drawerOpen}
                aria-controls="artifact-expand-drawer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
              >
                <Info className="h-4.5 w-4.5" />
              </button>

              {/* Download */}
              {onDownload ? (
                <button
                  type="button"
                  onClick={() => onDownload(artifact)}
                  aria-label="Download artifact"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                >
                  <Download className="h-4 w-4" />
                </button>
              ) : null}

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close expanded view"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </header>

          {/* ── Content area — fills all space below header ──────────────── */}
          <div className="flex-1 overflow-hidden pt-14">
            {isHtml ? (
              <HtmlArtifactRenderer
                title={artifact.title}
                html={html}
                retrievalMode="persistent"
                mode="fullscreen"
                chrome={false}
                className="h-full w-full"
              />
            ) : isImage ? (
              <div
                className="flex h-full w-full items-center justify-center overflow-auto"
                style={{ touchAction: "pinch-zoom" }}
              >
                <img
                  src={src}
                  alt={artifact.title}
                  className="max-h-full max-w-full object-contain"
                  style={{ touchAction: "pinch-zoom" }}
                />
              </div>
            ) : (
              /* Plain text — editorial reading layout */
              <div className="h-full overflow-y-auto bg-[#0c0c10] px-5 py-12">
                <article
                  className="mx-auto max-w-[72ch]"
                  aria-label={artifact.title}
                >
                  <h1 className="mb-6 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {artifact.title}
                  </h1>
                  {artifact.summary ? (
                    <p className="mb-8 text-base leading-7 text-white/60">{artifact.summary}</p>
                  ) : null}
                  <div className="whitespace-pre-wrap text-base leading-8 text-white/80">
                    {src || "No content available."}
                  </div>
                </article>
              </div>
            )}
          </div>

          {/* ── Pull-up info drawer ──────────────────────────────────────── */}
          <AnimatePresence>
            {drawerOpen ? (
              <motion.aside
                id="artifact-expand-drawer"
                role="complementary"
                aria-label="Artifact metadata and connections"
                className="fixed inset-x-0 bottom-0 z-20 max-h-[60dvh] overflow-y-auto rounded-t-[1.5rem] border-t border-white/12 bg-[#080c10]/95 pb-safe backdrop-blur-2xl"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Drawer handle + close row */}
                <div className="sticky top-0 flex items-center justify-between border-b border-white/8 bg-[#080c10]/95 px-5 py-3 backdrop-blur-xl">
                  <div className="mx-auto h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close info panel"
                    className="absolute right-4 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  {/* Context grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Session origin</p>
                      <p className="mt-2 text-sm text-white/85">{sessionOrigin ?? "Unknown session"}</p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Content type</p>
                      <p className="mt-2 text-sm text-white/85">{artifact.contentType}</p>
                    </div>
                  </div>

                  {/* PLK connections */}
                  <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">PLK connections</p>
                    {plkConnections.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {plkConnections.map((connection) => (
                          <li key={connection} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-white/70">
                            {connection}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-white/45">No PLK links surfaced yet.</p>
                    )}
                  </div>

                  {/* External Scaffold links */}
                  {externalLinks.length > 0 ? (
                    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">External Scaffold links</p>
                      <ul className="mt-3 space-y-2">
                        {externalLinks.map((link) => (
                          <li key={link} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-white/70">
                            {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Resonance links */}
                  {resonanceLinks.length > 0 ? (
                    <div className="rounded-[1rem] border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Resonance links</p>
                      <ul className="mt-3 space-y-2">
                        {resonanceLinks.map((link) => (
                          <li key={link.artifactId}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectResonanceLink?.(link.artifactId);
                                setDrawerOpen(false);
                                onClose();
                              }}
                              className="w-full rounded-xl border border-cyan-400/15 bg-black/20 px-3 py-2 text-left transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                            >
                              <span className="block text-sm text-white/85">{link.title}</span>
                              <span className="mt-0.5 block text-xs text-white/50">
                                {Math.round(link.score * 100)}% · {link.reason}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-1 pb-2">
                    {onArchive ? (
                      <button
                        type="button"
                        onClick={() => {
                          onArchive(artifact);
                          setDrawerOpen(false);
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                        Archive
                      </button>
                    ) : null}
                    {onDownload ? (
                      <button
                        type="button"
                        onClick={() => onDownload(artifact)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-cyan-400/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
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
                            setDrawerOpen(false);
                          }
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          {/* Drawer backdrop — tap outside to close */}
          {drawerOpen ? (
            <div
              className="fixed inset-0 z-[15] bg-black/30"
              aria-hidden="true"
              onClick={() => setDrawerOpen(false)}
            />
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
