import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ExternalLink, Layers3, Trash2, X } from "lucide-react";
import { ArtifactViewSurface } from "@/components/inner-world/ArtifactViewSurface";
import { cn } from "@/lib/utils";
import {
  artifactStatusLabel,
  artifactOriginLabel,
  classifyInnerWorldArtifactOrigin,
  classifyInnerWorldArtifactView,
  roomOriginLabel,
  type InnerWorldArtifactRecord,
} from "@/lib/innerWorldFiles";

type Props = {
  artifacts: InnerWorldArtifactRecord[];
  selectedArtifactId: string | null;
  onSelectArtifact: (artifactId: string) => void;
  onCloseArtifact: () => void;
  onDeleteArtifact?: (artifactId: string) => void;
  className?: string;
};

export function InnerWorldArtifactGallery({
  artifacts,
  selectedArtifactId,
  onSelectArtifact,
  onCloseArtifact,
  onDeleteArtifact,
  className,
}: Props) {
  const reducedMotion = useReducedMotion();
  const selectedArtifact = useMemo(
    () => artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null,
    [artifacts, selectedArtifactId],
  );
  const selectedArtifactKind = selectedArtifact ? getArtifactKindLabel(selectedArtifact) : null;
  const selectedArtifactOrigin = selectedArtifact
    ? classifyInnerWorldArtifactOrigin(selectedArtifact)
    : null;

  return (
    <section className={cn("rounded-[2rem] border border-white/10 bg-white/[0.04] p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#BF00FF]">Artifact surfaces</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Artifacts routed through their real viewer contracts.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/56">
            Rich exhibits stay rich, scene graphs stay legible, and raw source only shows up when that is the truthful thing to show.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/52">
          {artifacts.length} artifacts
        </div>
      </div>

      {selectedArtifact ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[1.65rem] border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/75">Featured artifact</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{selectedArtifact.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/58">{selectedArtifact.summary}</p>

            <div className="mt-4 space-y-2 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Origin</span>
                <span>{roomOriginLabel(selectedArtifact.originRoom)}</span>
              </div>
              {selectedArtifact.originDiId ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Curator DI</span>
                  <span>{selectedArtifact.originDiId}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Source file</span>
                <span>{selectedArtifact.sourceFileId ?? "None"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Created</span>
                <span>{selectedArtifact.createdAt}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Context nodes</span>
                <span>{selectedArtifact.evidenceNodeIds.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Artifact kind</span>
                <span>{selectedArtifactKind}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Status</span>
                <span>{artifactStatusLabel(selectedArtifact.status)}</span>
              </div>
              {selectedArtifactOrigin ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Provenance</span>
                  <span>{artifactOriginLabel(selectedArtifactOrigin)}</span>
                </div>
              ) : null}
              {selectedArtifactOrigin === "render_projection_verified" ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Render job</span>
                    <span className="max-w-[16rem] truncate">{String(selectedArtifact.contentRef?.renderJobId)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Render artifact</span>
                    <span className="max-w-[16rem] truncate">{String(selectedArtifact.contentRef?.renderArtifactId)}</span>
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedArtifact.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/48">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.65rem] border border-white/10 bg-black/28">
            <ArtifactViewSurface artifact={selectedArtifact} minHeight={480} className="h-[480px] w-full" />
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artifacts.length === 0 ? (
          <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-sm text-white/52 md:col-span-2 xl:col-span-3">
            No artifact surfaces yet. Pin a file from the explorer or generate a recap to create one.
          </div>
        ) : null}

        {artifacts.map((artifact, index) => {
          const spanClass = artifactSpanClasses[index % artifactSpanClasses.length];
          const isSelected = artifact.id === selectedArtifactId;
          const artifactOrigin = classifyInnerWorldArtifactOrigin(artifact);
          return (
            <motion.button
              key={artifact.id}
              type="button"
              onClick={() => onSelectArtifact(artifact.id)}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, delay: reducedMotion ? 0 : index * 0.03 }}
              className={cn(
                "group overflow-hidden rounded-[1.5rem] border text-left transition-all",
                isSelected
                  ? "border-cyan-200/40 bg-cyan-200/10 shadow-[0_0_40px_rgba(18,214,255,0.14)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20",
                spanClass,
              )}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-lg font-semibold text-white">{artifact.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/58">{artifact.summary}</p>
                </div>
                <Layers3 className="mt-1 h-5 w-5 shrink-0 text-cyan-100/90" />
              </div>

              <div className="grid gap-3 px-4 py-4">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{roomOriginLabel(artifact.originRoom)}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{artifact.sourceFileId ? "File-backed" : "Standalone"}</span>
                  <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-2.5 py-1 text-cyan-50">{getArtifactKindLabel(artifact)}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{artifactStatusLabel(artifact.status)}</span>
                  <span className="rounded-full border border-purple-200/18 bg-purple-200/10 px-2.5 py-1 text-purple-50">{artifactOriginLabel(artifactOrigin)}</span>
                  {artifact.tags[0] ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{artifact.tags[0]}</span> : null}
                </div>

                <div className="overflow-hidden rounded-[1.15rem] border border-white/10 bg-black/38 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <ArtifactViewSurface artifact={artifact} minHeight={220} className="h-[220px] w-full" />
                </div>

                <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/42">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {artifact.createdAt}
                  </span>
                  <span>{artifact.tags[0] ?? "artifact"}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedArtifact ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-md"
            onClick={onCloseArtifact}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#05060a] shadow-[0_0_100px_rgba(18,214,255,0.18)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-200/72">Artifact overlay</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedArtifact.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/58">{selectedArtifact.summary}</p>
                </div>
                  <button
                    type="button"
                    onClick={onCloseArtifact}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/68 transition-colors hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

              <div className="grid gap-0 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="border-b border-white/8 bg-white/[0.02] p-5 lg:border-b-0 lg:border-r">
                  <div className="space-y-3 rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Origin</span>
                      <span>{roomOriginLabel(selectedArtifact.originRoom)}</span>
                    </div>
                    {selectedArtifact.originDiId ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Curator DI</span>
                        <span>{selectedArtifact.originDiId}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Source file</span>
                      <span>{selectedArtifact.sourceFileId ?? "None"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Created</span>
                      <span>{selectedArtifact.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Context nodes</span>
                      <span>{selectedArtifact.evidenceNodeIds.length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Artifact kind</span>
                      <span>{selectedArtifactKind}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Status</span>
                      <span>{artifactStatusLabel(selectedArtifact.status)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Provenance</span>
                      <span>{artifactOriginLabel(classifyInnerWorldArtifactOrigin(selectedArtifact))}</span>
                    </div>
                    {classifyInnerWorldArtifactOrigin(selectedArtifact) ===
                    "render_projection_verified" ? (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Render job</span>
                          <span className="max-w-[14rem] truncate">{String(selectedArtifact.contentRef?.renderJobId)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] uppercase tracking-[0.22em] text-white/42">Render artifact</span>
                          <span className="max-w-[14rem] truncate">{String(selectedArtifact.contentRef?.renderArtifactId)}</span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedArtifact.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/48">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {onDeleteArtifact ? (
                    <button
                      type="button"
                      onClick={() => onDeleteArtifact(selectedArtifact.id)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-rose-50 transition-colors hover:bg-rose-300/16"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete artifact
                    </button>
                  ) : null}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/42">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {classifyInnerWorldArtifactView(selectedArtifact).kind.replace(/_/g, " ")}
                  </div>
                  <ArtifactViewSurface artifact={selectedArtifact} minHeight={720} className="h-[72vh] w-full rounded-[1.4rem]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

const artifactSpanClasses = [
  "md:col-span-2 xl:col-span-1",
  "md:col-span-1 xl:col-span-2",
  "md:col-span-1 xl:col-span-1",
  "md:col-span-2 xl:col-span-2",
  "md:col-span-1 xl:col-span-1",
  "md:col-span-1 xl:col-span-2",
];

function getArtifactKindLabel(artifact: InnerWorldArtifactRecord): string {
  const explicitCodexKind = artifact.tags.find((tag) => tag.startsWith("codex-"));
  if (explicitCodexKind) {
    return explicitCodexKind.replace(/^codex-/, "").replace(/-/g, " ");
  }

  if (artifact.tags.includes("session-recap")) {
    return "session recap";
  }

  if (artifact.tags.includes("dynamic-inner-world-showcase")) {
    return "showcase";
  }

  if (artifact.tags.includes("profile-portrait")) {
    return "profile portrait";
  }

  return artifact.tags[0] ?? "artifact";
}
