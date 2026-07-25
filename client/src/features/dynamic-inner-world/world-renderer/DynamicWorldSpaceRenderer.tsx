import { useMemo, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Box, ExternalLink, Maximize2, PlusCircle, Trash2 } from "lucide-react";
import type { DynamicInnerWorldResonanceLink } from "@/lib/genEngineRoomWiring";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import { buildWorldPlan } from "./buildWorldPlan";
import { renderWorldNode } from "./renderWorldNode";
import { SearchControlDeck } from "./components/SearchControlDeck";
import { ThreeMuseumBackdrop } from "./three/ThreeMuseumBackdrop";
import { WorldRendererProvider } from "./WorldRendererProvider";
import type { ArtifactSortMode, ArtifactTypeFilter, WorldRenderContext, WorldStats } from "./types";

type DynamicWorldSpaceRendererProps = {
  artifacts: InnerWorldArtifactRecord[];
  archivedArtifacts: InnerWorldArtifactRecord[];
  selectedArtifactId: string | null;
  resonanceLinks: DynamicInnerWorldResonanceLink[];
  searchQuery: string;
  selectedTags: string[];
  availableTags: string[];
  typeFilter: ArtifactTypeFilter;
  sortMode: ArtifactSortMode;
  stats: WorldStats;
  hasActiveFilters: boolean;
  dynamicInnerWorldError?: string | null;
  onSelectArtifact: (artifactId: string) => void;
  onOpenArtifact: (artifactId: string) => void;
  onExpandArtifact: (artifactId: string) => void;
  onDeleteArtifact: (artifactId: string) => void;
  onSearchQueryChange: (value: string) => void;
  onTypeFilterChange: (value: ArtifactTypeFilter) => void;
  onSortModeChange: (value: ArtifactSortMode) => void;
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  onGoToCreationCorner: () => void;
  onRestoreArtifact: (artifactId: string) => void;
  onClearArtifact: (artifactId: string) => void;
};

function getNextArtifactId(artifacts: InnerWorldArtifactRecord[], selectedArtifactId: string | null, direction: 1 | -1): string | null {
  if (artifacts.length === 0) {
    return null;
  }

  const currentIndex = Math.max(
    0,
    artifacts.findIndex((artifact) => artifact.id === selectedArtifactId),
  );
  const nextIndex = (currentIndex + direction + artifacts.length) % artifacts.length;
  return artifacts[nextIndex].id;
}

export default function DynamicWorldSpaceRenderer({
  artifacts,
  archivedArtifacts,
  selectedArtifactId,
  resonanceLinks,
  searchQuery,
  selectedTags,
  availableTags,
  typeFilter,
  sortMode,
  stats,
  hasActiveFilters,
  dynamicInnerWorldError,
  onSelectArtifact,
  onOpenArtifact,
  onExpandArtifact,
  onDeleteArtifact,
  onSearchQueryChange,
  onTypeFilterChange,
  onSortModeChange,
  onToggleTag,
  onClearFilters,
  onGoToCreationCorner,
  onRestoreArtifact,
  onClearArtifact,
}: DynamicWorldSpaceRendererProps) {
  const reducedMotion = useReducedMotion();
  const plan = useMemo(
    () =>
      buildWorldPlan({
        artifacts,
        archivedArtifacts,
        selectedArtifactId,
        resonanceLinks,
        searchQuery,
        selectedTags,
        typeFilter,
        sortMode,
      }),
    [archivedArtifacts, artifacts, resonanceLinks, searchQuery, selectedArtifactId, selectedTags, sortMode, typeFilter],
  );

  const artifactsById = useMemo(() => new Map(artifacts.map((artifact) => [artifact.id, artifact])), [artifacts]);
  const context = useMemo<WorldRenderContext>(
    () => ({
      plan,
      artifactsById,
      archivedArtifacts,
      searchQuery,
      selectedTags,
      availableTags,
      typeFilter,
      sortMode,
      stats,
      hasActiveFilters,
      dynamicInnerWorldError,
      onSelectArtifact,
      onOpenArtifact,
      onSearchQueryChange,
      onTypeFilterChange,
      onSortModeChange,
      onToggleTag,
      onClearFilters,
      onGoToCreationCorner,
      onRestoreArtifact,
      onClearArtifact,
    }),
    [
      archivedArtifacts,
      artifactsById,
      availableTags,
      dynamicInnerWorldError,
      hasActiveFilters,
      onClearFilters,
      onGoToCreationCorner,
      onOpenArtifact,
      onRestoreArtifact,
      onClearArtifact,
      onSearchQueryChange,
      onSelectArtifact,
      onSortModeChange,
      onToggleTag,
      onTypeFilterChange,
      plan,
      searchQuery,
      selectedTags,
      sortMode,
      stats,
      typeFilter,
    ],
  );

  const handleStageKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      const nextId = getNextArtifactId(artifacts, selectedArtifactId, 1);
      if (nextId) {
        event.preventDefault();
        onSelectArtifact(nextId);
      }
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      const nextId = getNextArtifactId(artifacts, selectedArtifactId, -1);
      if (nextId) {
        event.preventDefault();
        onSelectArtifact(nextId);
      }
    }

    if (event.key === "Enter" && selectedArtifactId) {
      event.preventDefault();
      // Enter in the 3D stage now triggers expand (full-screen) for maximum immersion
      onExpandArtifact(selectedArtifactId);
    }
  };

  const stageNodes = plan.nodes.filter((node) => node.kind !== "search-control-deck" && node.kind !== "empty-hall-state" && node.kind !== "world-stats-ribbon");
  const selectedArtifact = selectedArtifactId ? artifactsById.get(selectedArtifactId) : artifacts[0] ?? null;

  return (
    <WorldRendererProvider value={context}>
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_0_120px_rgba(18,214,255,0.10)] backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(18,214,255,0.18),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(191,0,255,0.14),transparent_28%),linear-gradient(180deg,rgba(1,5,12,0.44),rgba(1,5,12,0.96))]" />
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
        </div>
        <ThreeMuseumBackdrop plan={plan} reducedMotion={Boolean(reducedMotion)} />

        <div className="relative z-10 flex min-h-[74vh] flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/68">Dynamic Inner World</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">A museum hall of rendered HTML artifacts.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Finished pieces render as live showcases along the hall. Select an exhibit to pull it forward, then press Enter or tap Expand to view full-screen.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/48">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                <Box className="h-3.5 w-3.5" />
                {plan.mode}
              </span>
              <button
                type="button"
                onClick={onGoToCreationCorner}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-cyan-100/10 px-3 py-2 text-white/78 transition-colors hover:bg-cyan-100/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Creation Corner
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <SearchControlDeck node={plan.nodes.find((node) => node.kind === "search-control-deck") ?? plan.nodes[0]} context={context} />
          </div>

          {artifacts.length === 0 ? (
            <div className="px-4 pb-6 sm:px-5">{renderWorldNode(plan.nodes.find((node) => node.kind === "empty-hall-state") ?? plan.nodes[0], context)}</div>
          ) : (
            <>
              {/* ── Desktop 3D stage ─────────────────────────────────────── */}
              <section
                tabIndex={0}
                onKeyDown={handleStageKeyDown}
                aria-label="Dynamic Inner World museum hall. Use arrow keys to move between showcases and Enter to expand the selected artifact full-screen."
                className="relative mx-4 mb-5 hidden min-h-[38rem] flex-1 overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/20 outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 lg:block"
                style={{ perspective: "1200px" }}
              >
                <div className="absolute inset-x-5 top-5 z-20">{renderWorldNode(plan.nodes.find((node) => node.kind === "world-stats-ribbon") ?? plan.nodes[0], context)}</div>
                <motion.div
                  className="absolute inset-0 z-10 transform-gpu"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={reducedMotion ? undefined : { rotateX: [0, 0.7, 0], rotateY: [-1.2, 1.2, -1.2] }}
                  transition={reducedMotion ? undefined : { duration: 32, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  {stageNodes.map((node) => renderWorldNode(node, context))}
                </motion.div>
                <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/38 px-3 py-2 text-xs text-white/52 backdrop-blur-md">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <ArrowRight className="h-3.5 w-3.5" />
                  Arrow keys retrieve · Enter expands full-screen
                </div>
              </section>

              {/* ── Mobile card list ─────────────────────────────────────── */}
              {/* Always visible below lg breakpoint. Expand is the primary     */}
              {/* action on mobile; Open preserved for the metadata side-panel. */}
              <section
                className="space-y-3 px-4 pb-5 lg:hidden"
                aria-label="Mobile museum showcase list"
              >
                {renderWorldNode(plan.nodes.find((node) => node.kind === "world-stats-ribbon") ?? plan.nodes[0], context)}
                {artifacts.slice(0, 20).map((artifact) => {
                  const selected = artifact.id === selectedArtifact?.id;

                  return (
                    <article
                      key={artifact.id}
                      className={`w-full rounded-[1.25rem] border p-4 text-left backdrop-blur-md transition-colors ${
                        selected ? "border-cyan-100/34 bg-cyan-100/[0.09]" : "border-white/10 bg-white/[0.035]"
                      }`}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/58">
                        {selected ? "Selected exhibit" : artifact.originRoom.replace(/_/g, " ")}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-white">{artifact.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{artifact.summary}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {/* Select */}
                        <button
                          type="button"
                          onClick={() => onSelectArtifact(artifact.id)}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3 py-2 text-xs text-white/58 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                        >
                          Select
                        </button>

                        {/* Expand — primary open action on mobile */}
                        <button
                          type="button"
                          onClick={() => onExpandArtifact(artifact.id)}
                          aria-label={`Expand ${artifact.title} full-screen`}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-cyan-100/25 bg-cyan-100/12 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:bg-cyan-100/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Expand
                        </button>

                        {/* Open — metadata + context panel */}
                        <button
                          type="button"
                          onClick={() => onOpenArtifact(artifact.id)}
                          aria-label={`Open ${artifact.title} with metadata panel`}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/58 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Info
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${artifact.title}"? This cannot be undone.`)) {
                              onDeleteArtifact(artifact.id);
                            }
                          }}
                          aria-label={`Delete ${artifact.title}`}
                          className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300/80 transition-colors hover:bg-red-400/18 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </div>
      </section>
    </WorldRendererProvider>
  );
}
