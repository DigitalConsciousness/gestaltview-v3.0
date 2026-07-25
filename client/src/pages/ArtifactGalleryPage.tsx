import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCw, Trash2, Send, RotateCcw, PanelsTopLeft, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ArtifactViewSurface } from "@/components/inner-world/ArtifactViewSurface";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import InnerWorldTimeline, { filterArtifactsByRange, type TimelineRange } from "@/components/inner-world/InnerWorldTimeline";
import {
  clearInnerWorldArtifact,
  isGalleryStagingStatus,
  isMuseumVisibleArtifact,
  loadInnerWorldArtifactsFromServer,
  mergeInnerWorldArtifacts,
  readArchivedInnerWorldArtifacts,
  readInnerWorldArtifacts,
  restoreInnerWorldArtifact,
  updateInnerWorldArtifact,
  writeInnerWorldArtifacts,
  artifactStatusLabel,
  classifyInnerWorldArtifactView,
  roomOriginLabel,
  type InnerWorldArtifactRecord,
  type InnerWorldArtifactStatus,
} from "@/lib/innerWorldFiles";
import { PAGE_SEO } from "@/hooks/useSEO";

type GalleryStatusFilter = "all" | InnerWorldArtifactStatus;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function statusCounts(artifacts: InnerWorldArtifactRecord[]): Record<GalleryStatusFilter, number> {
  const counts: Record<GalleryStatusFilter, number> = {
    all: artifacts.length,
    queued: 0,
    rendering: 0,
    ready: 0,
    failed: 0,
    draft: 0,
    active: 0,
    archived: 0,
  };

  for (const artifact of artifacts) {
    const status = artifact.status ?? "ready";
    counts[status] += 1;
  }

  return counts;
}

function artifactTimestamp(artifact: InnerWorldArtifactRecord): number {
  const parsed = Date.parse(artifact.updatedAt || artifact.createdAt || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function artifactStatus(artifact: InnerWorldArtifactRecord): InnerWorldArtifactStatus {
  return artifact.status ?? "ready";
}

export default function ArtifactGalleryPage() {
  useSEO(PAGE_SEO.artifactGallery);
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();
  const [artifacts, setArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readInnerWorldArtifacts());
  const [archivedArtifacts, setArchivedArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readArchivedInnerWorldArtifacts());
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [statusFilter, setStatusFilter] = useState<GalleryStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = () => {
    setArtifacts(readInnerWorldArtifacts());
    setArchivedArtifacts(readArchivedInnerWorldArtifacts());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("gestaltview:inner-world-artifacts-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gestaltview:inner-world-artifacts-updated", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!user?.id) {
        return;
      }

      setIsSyncing(true);
      const remoteArtifacts = await loadInnerWorldArtifactsFromServer();
      if (!cancelled && remoteArtifacts) {
        const merged = mergeInnerWorldArtifacts(readInnerWorldArtifacts(), remoteArtifacts);
        writeInnerWorldArtifacts(merged);
        refresh();
      }
      if (!cancelled) {
        setIsSyncing(false);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const combinedArtifacts = useMemo(() => {
    const archivedIds = new Set(archivedArtifacts.map((artifact) => artifact.id));
    const merged = [...artifacts, ...archivedArtifacts];
    const byId = new Map<string, InnerWorldArtifactRecord>();
    for (const artifact of merged) {
      const normalizedArtifact: InnerWorldArtifactRecord = archivedIds.has(artifact.id)
        ? { ...artifact, status: "archived" }
        : { ...artifact, status: artifact.status ?? "ready" };
      const existing = byId.get(artifact.id);
      if (!existing || artifactTimestamp(normalizedArtifact) >= artifactTimestamp(existing)) {
        byId.set(artifact.id, normalizedArtifact);
      }
    }
    return [...byId.values()].sort((left, right) => artifactTimestamp(right) - artifactTimestamp(left));
  }, [archivedArtifacts, artifacts]);

  const filteredArtifacts = useMemo(() => {
    return filterArtifactsByRange(combinedArtifacts, timelineRange)
      .filter((artifact) => {
        const status = artifactStatus(artifact);
        if (statusFilter !== "all" && status !== statusFilter) {
          return false;
        }

        if (!searchQuery.trim()) {
          return true;
        }

        const blob = [
          artifact.title,
          artifact.summary,
          artifact.originDiId ?? "",
          artifact.originRoom,
          artifact.tags.join(" "),
          artifact.evidenceNodeIds.join(" "),
          artifactStatusLabel(status),
        ]
          .join(" ")
          .toLowerCase();

        return blob.includes(searchQuery.trim().toLowerCase());
      })
      .sort((left, right) => artifactTimestamp(right) - artifactTimestamp(left));
  }, [combinedArtifacts, searchQuery, statusFilter, timelineRange]);

  useEffect(() => {
    if (filteredArtifacts.length === 0) {
      setSelectedArtifactId(null);
      return;
    }

    if (!selectedArtifactId || !filteredArtifacts.some((artifact) => artifact.id === selectedArtifactId)) {
      setSelectedArtifactId(filteredArtifacts[0].id);
    }
  }, [filteredArtifacts, selectedArtifactId]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => filteredArtifacts.some((artifact) => artifact.id === id)));
  }, [filteredArtifacts]);

  const selectedArtifact = useMemo(
    () => combinedArtifacts.find((artifact) => artifact.id === selectedArtifactId) ?? null,
    [combinedArtifacts, selectedArtifactId],
  );

  const counts = useMemo(() => statusCounts(combinedArtifacts), [combinedArtifacts]);

  const commitArtifact = (artifactId: string, status: InnerWorldArtifactStatus) => {
    if (archivedArtifacts.some((artifact) => artifact.id === artifactId)) {
      restoreInnerWorldArtifact(artifactId);
    }
    updateInnerWorldArtifact(artifactId, (artifact) => ({
      ...artifact,
      status,
      updatedAt: new Date().toISOString(),
    }));
    refresh();
  };

  const commitMany = (ids: string[], status: InnerWorldArtifactStatus) => {
    for (const id of ids) {
      commitArtifact(id, status);
    }
    toast.success(status === "ready" ? "Published to Museum" : `Marked ${artifactStatusLabel(status).toLowerCase()}.`);
  };

  const deleteMany = (ids: string[]) => {
    for (const id of ids) {
      clearInnerWorldArtifact(id);
    }
    refresh();
    setSelectedIds([]);
    toast.success("Artifacts deleted.");
  };

  const restoreMany = (ids: string[]) => {
    for (const id of ids) {
      restoreInnerWorldArtifact(id);
    }
    refresh();
    setSelectedIds([]);
    toast.success("Artifacts restored.");
  };

  const toggleSelected = (artifactId: string) => {
    setSelectedIds((current) =>
      current.includes(artifactId) ? current.filter((id) => id !== artifactId) : [...current, artifactId],
    );
  };

  const visibleCount = filteredArtifacts.length;

  return (
    <main className="min-h-screen bg-[#06070c] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,214,255,0.14),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(191,0,255,0.12),transparent_26%),linear-gradient(180deg,#05060a,#06070c_50%,#05060a)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] opacity-40" />
      </div>

      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_80px_rgba(18,214,255,0.08)] backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-100/70">Artifact Gallery</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Queue, repair, and publish finished artifacts.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
              This staging layer sits between the capture rooms and the museum. Queue raw or unfinished work, repair failures, then publish only the ready pieces into the Dynamic Inner World.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dynamic-inner-world">
                <a className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-50 transition-colors hover:bg-cyan-200/16">
                  <PanelsTopLeft className="h-4 w-4" />
                  Open museum
                </a>
              </Link>
              <button
                type="button"
                onClick={() => refresh()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:bg-white/[0.08]"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                Sync storage
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            {([
              ["Queued", counts.queued],
              ["Rendering", counts.rendering],
              ["Ready", counts.ready],
              ["Failed", counts.failed],
            ] as const).map(([label, count]) => (
              <div key={label} className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-3 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-violet-200/70">Filters</p>
                <p className="mt-2 text-sm text-white/58">{visibleCount} artifact{visibleCount === 1 ? "" : "s"} visible</p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, tags, provenance..."
                  className="min-h-11 w-full rounded-full border border-white/10 bg-black/25 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-cyan-200/30"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["all", "queued", "rendering", "ready", "failed", "draft", "active", "archived"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                    statusFilter === status
                      ? "border-cyan-200/30 bg-cyan-200/12 text-cyan-50"
                      : "border-white/10 bg-white/[0.03] text-white/56 hover:bg-white/[0.06]"
                  }`}
                >
                  {status === "all" ? "All" : artifactStatusLabel(status)}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <InnerWorldTimeline
                artifacts={combinedArtifacts}
                activeRange={timelineRange}
                onRangeChange={setTimelineRange}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => commitMany(selectedIds, "ready")}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                Publish to Museum
              </button>
              <button
                type="button"
                onClick={() => commitMany(selectedIds, "queued")}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                Retry rendering
              </button>
              <button
                type="button"
                onClick={() => deleteMany(selectedIds)}
                disabled={selectedIds.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm text-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                Delete selected
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {filteredArtifacts.length === 0 ? (
                <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-5 text-sm text-white/52">
                  No artifacts match the current filters.
                </div>
              ) : (
                filteredArtifacts.map((artifact, index) => {
                  const selected = artifact.id === selectedArtifactId;
                  const checked = selectedIds.includes(artifact.id);
                  const status = artifactStatus(artifact);
                  const summary = stripHtml(artifact.summary || artifact.html).slice(0, 180) || artifact.title;

                  return (
                    <motion.button
                      key={artifact.id}
                      type="button"
                      onClick={() => setSelectedArtifactId(artifact.id)}
                      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.18, delay: reducedMotion ? 0 : index * 0.02 }}
                      className={`text-left rounded-[1.4rem] border p-4 transition-colors ${
                        selected ? "border-cyan-200/30 bg-cyan-200/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelected(artifact.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4 rounded border-white/20 bg-black/25 text-cyan-300"
                            />
                            <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                              {artifactStatusLabel(status)}
                            </span>
                            {isMuseumVisibleArtifact(artifact) ? (
                              <span className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-50">
                                Museum ready
                              </span>
                            ) : (
                              <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-50">
                                Staging
                              </span>
                            )}
                          </div>
                          <h2 className="mt-3 line-clamp-1 text-lg font-semibold text-white">{artifact.title}</h2>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{summary}</p>
                        </div>
                        <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.18em] text-white/40">
                          <p>{roomOriginLabel(artifact.originRoom)}</p>
                          {artifact.originDiId ? <p className="mt-1">{artifact.originDiId}</p> : null}
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
            {selectedArtifact ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/70">Selected artifact</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedArtifact.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/58">{stripHtml(selectedArtifact.summary || selectedArtifact.html) || "No summary yet."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => commitArtifact(selectedArtifact.id, "ready")}
                      className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-emerald-50"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() => commitArtifact(selectedArtifact.id, "queued")}
                      className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-violet-50"
                    >
                      Retry
                    </button>
                  <button
                    type="button"
                    onClick={() => clearInnerWorldArtifact(selectedArtifact.id)}
                    className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-rose-50"
                  >
                    Delete
                  </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-sm text-white/62">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Origin</span>
                    <span>{roomOriginLabel(selectedArtifact.originRoom)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Curator DI</span>
                    <span>{selectedArtifact.originDiId ?? "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Status</span>
                    <span>{artifactStatusLabel(selectedArtifact.status)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Created</span>
                    <span>{selectedArtifact.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">Context nodes</span>
                    <span>{selectedArtifact.evidenceNodeIds.length}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedArtifact.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/48">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/35">
                  <ArtifactViewSurface artifact={selectedArtifact} minHeight={520} className="h-[520px] w-full" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds((current) => (current.includes(selectedArtifact.id) ? current : [...current, selectedArtifact.id]))}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/72"
                  >
                    Select for batch
                  </button>
                  <Link href="/dynamic-inner-world">
                    <a className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-50">
                      <PanelsTopLeft className="h-3.5 w-3.5" />
                      Open {classifyInnerWorldArtifactView(selectedArtifact).kind.replace(/_/g, " ")} in museum
                    </a>
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => restoreMany(selectedIds.length > 0 ? selectedIds : [selectedArtifact.id])}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/72"
                    disabled={!selectedArtifact.status || selectedArtifact.status !== "archived"}
                  >
                    Restore
                  </button>
                  {isGalleryStagingStatus(selectedArtifact.status) ? (
                    <button
                      type="button"
                      onClick={() => commitArtifact(selectedArtifact.id, "ready")}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-emerald-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Publish this one
                    </button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm text-white/56">
                Choose an artifact to inspect it here.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
