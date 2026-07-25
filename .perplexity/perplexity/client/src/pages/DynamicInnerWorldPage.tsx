import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useBillySection } from "@/components/Billy";
import ProfileDisplay from "@/components/ProfileDisplay";
import { type ArtifactScreenModel } from "@/components/ArtifactScreen";
import BabylonAtmosphere from "@/components/BabylonAtmosphere";
import ArtifactDeepView from "@/components/ArtifactDeepView";
import CuratorDI from "@/components/CuratorDI";
import DynamicWorldSpaceRenderer from "@/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer";
import type {
  ArtifactSortMode,
  ArtifactTypeFilter,
} from "@/features/dynamic-inner-world/world-renderer/types";
import { useDynamicInnerWorld } from "@/hooks/useDynamicInnerWorld";
import {
  loadInnerWorldArtifactsFromServer,
  mergeInnerWorldArtifacts,
  readInnerWorldArtifacts,
  removeInnerWorldArtifact,
  writeInnerWorldArtifacts,
  type InnerWorldArtifactRecord,
} from "@/lib/innerWorldFiles";
import {
  buildDynamicInnerWorldResonanceLinks,
  type DynamicInnerWorldResonanceLink,
} from "@/lib/genEngineRoomWiring";
import type { DynamicInnerWorldArtifact } from "@shared/profileIngestion";
import InnerWorldTimeline, {
  filterArtifactsByRange,
  type TimelineRange,
} from "@/components/inner-world/InnerWorldTimeline";

const ARCHIVED_STORAGE_KEY = "gv.dynamicInnerWorld.archived.v1";

function readArchivedArtifacts(): InnerWorldArtifactRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ARCHIVED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InnerWorldArtifactRecord[]) : [];
  } catch {
    return [];
  }
}

function writeArchivedArtifacts(artifacts: InnerWorldArtifactRecord[]): void {
  try {
    window.localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(artifacts));
  } catch {
    // Ignore storage failures in private mode.
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toArtifactModel(record: InnerWorldArtifactRecord): ArtifactScreenModel {
  const preview = stripHtml(record.summary || record.html).slice(0, 240) || record.title;
  const contentType = record.html.trim().startsWith("<!doctype html") || /<html/i.test(record.html)
    ? "html"
    : record.thumbnailUrl
      ? "image"
      : "text";

  return {
    id: record.id,
    title: record.title,
    contentType,
    contentRef: contentType === "html" ? record.html : record.thumbnailUrl ?? preview,
    contentHtml: contentType === "html" ? record.html : undefined,
    summary: record.summary,
    createdAt: record.createdAt,
  };
}

function endpointArtifactToRecord(artifact: DynamicInnerWorldArtifact, userId: string): InnerWorldArtifactRecord {
  return {
    id: `endpoint-${artifact.id}`,
    userId,
    title: artifact.title,
    summary: artifact.summary,
    sourceFileId: null,
    html: artifact.content,
    thumbnailUrl: undefined,
    createdAt: artifact.updatedAt,
    updatedAt: artifact.updatedAt,
    originRoom: "dynamic_inner_world",
    evidenceNodeIds: [artifact.sourceId],
    tags: [artifact.type, "profile-ingestion", "live-profile"],
  };
}

function downloadTextFile(fileName: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function summarizeConnections(record: InnerWorldArtifactRecord, artifacts: InnerWorldArtifactRecord[]): string[] {
  const tagMatches = artifacts
    .filter((item) => item.id !== record.id)
    .map((item) => ({
      title: item.title,
      shared: record.tags.filter((tag) => item.tags.includes(tag)).slice(0, 3),
    }))
    .filter((item) => item.shared.length > 0)
    .slice(0, 3);

  if (tagMatches.length === 0) {
    return [record.originRoom, record.evidenceNodeIds[0] ? `Source ${record.evidenceNodeIds[0]}` : "No PLK links yet."].filter(Boolean);
  }

  return tagMatches.map((item) => `${item.title}: ${item.shared.join(", ")}`);
}

function artifactTimestamp(record: InnerWorldArtifactRecord): number {
  const candidates = [record.updatedAt, record.createdAt];

  for (const value of candidates) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function inferArtifactType(record: InnerWorldArtifactRecord): ArtifactTypeFilter {
  const tags = record.tags.map((tag) => tag.toLowerCase());

  if (tags.includes("audio")) {
    return "audio";
  }

  if (tags.includes("image") || record.thumbnailUrl) {
    return "image";
  }

  if (tags.includes("code") || /```|<code|<pre|function\s|const\s|class\s/i.test(record.html)) {
    return "code";
  }

  return "text";
}

function artifactSearchBlob(record: InnerWorldArtifactRecord): string {
  return [
    record.title,
    record.summary,
    record.originRoom,
    record.evidenceNodeIds.join(" "),
    record.tags.join(" "),
    inferArtifactType(record),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesArtifactFilters(
  record: InnerWorldArtifactRecord,
  searchQuery: string,
  typeFilter: ArtifactTypeFilter,
  selectedTags: string[],
): boolean {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  if (typeFilter !== "all" && inferArtifactType(record) !== typeFilter) {
    return false;
  }

  if (selectedTags.length > 0 && !selectedTags.every((tag) => record.tags.includes(tag))) {
    return false;
  }

  if (!normalizedSearch) {
    return true;
  }

  return artifactSearchBlob(record).includes(normalizedSearch);
}

export default function DynamicInnerWorldPage() {
  useSEO(PAGE_SEO.dynamicInnerWorld);
  useBillySection("dynamic-inner-world");
  const { user } = useAuth();
  const dynamicInnerWorld = useDynamicInnerWorld(user?.id);
  const [, setLocation] = useLocation();
  const [artifacts, setArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readInnerWorldArtifacts());
  const [archivedArtifacts, setArchivedArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readArchivedArtifacts());
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [openedArtifactId, setOpenedArtifactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ArtifactTypeFilter>("all");
  const [sortMode, setSortMode] = useState<ArtifactSortMode>("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [resonanceLinks, setResonanceLinks] = useState<DynamicInnerWorldResonanceLink[]>([]);
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();

    const combinedArtifacts = [
      ...artifacts,
      ...(dynamicInnerWorld.data?.artifacts ?? []).map((artifact) => endpointArtifactToRecord(artifact, user?.id ?? "demo")),
    ];

    for (const artifact of combinedArtifacts) {
      for (const tag of artifact.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((left, right) => {
        if (right[1] !== left[1]) {
          return right[1] - left[1];
        }

        return left[0].localeCompare(right[0]);
      })
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [artifacts, dynamicInnerWorld.data?.artifacts, user?.id]);

  const combinedArtifacts = useMemo(
    () => [
      ...artifacts,
      ...(dynamicInnerWorld.data?.artifacts ?? []).map((artifact) => endpointArtifactToRecord(artifact, user?.id ?? "demo")),
    ],
    [artifacts, dynamicInnerWorld.data?.artifacts, user?.id],
  );

  const visibleArtifacts = useMemo(() => {
    const timeFiltered = filterArtifactsByRange(combinedArtifacts, timelineRange);
    const filtered = timeFiltered.filter((artifact) => matchesArtifactFilters(artifact, searchQuery, typeFilter, selectedTags));

    filtered.sort((left, right) => {
      if (sortMode === "title") {
        return left.title.localeCompare(right.title);
      }

      const leftTime = artifactTimestamp(left);
      const rightTime = artifactTimestamp(right);

      if (sortMode === "oldest") {
        return leftTime - rightTime;
      }

      return rightTime - leftTime;
    });

    return filtered;
  }, [combinedArtifacts, searchQuery, selectedTags, sortMode, typeFilter]);

  const selectedArtifact = useMemo(
    () => visibleArtifacts.find((artifact) => artifact.id === selectedArtifactId) ?? visibleArtifacts[0] ?? null,
    [selectedArtifactId, visibleArtifacts],
  );

  const openedArtifact = useMemo(
    () => combinedArtifacts.find((artifact) => artifact.id === openedArtifactId) ?? null,
    [combinedArtifacts, openedArtifactId],
  );
  const selectedModel = openedArtifact ? toArtifactModel(openedArtifact) : null;
  const selectedConnections = openedArtifact ? summarizeConnections(openedArtifact, combinedArtifacts) : [];

  useEffect(() => {
    const refresh = () => {
      setArtifacts(readInnerWorldArtifacts());
      setArchivedArtifacts(readArchivedArtifacts());
    };

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

      const remoteArtifacts = await loadInnerWorldArtifactsFromServer();
      if (cancelled || !remoteArtifacts) {
        return;
      }

      const mergedArtifacts = mergeInnerWorldArtifacts(readInnerWorldArtifacts(), remoteArtifacts);
      writeInnerWorldArtifacts(mergedArtifacts);
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (visibleArtifacts.length === 0) {
      if (selectedArtifactId !== null) {
        setSelectedArtifactId(null);
      }
      if (openedArtifactId !== null) {
        setOpenedArtifactId(null);
      }

      return;
    }

    if (!selectedArtifactId || !visibleArtifacts.some((artifact) => artifact.id === selectedArtifactId)) {
      setSelectedArtifactId(visibleArtifacts[0].id);
    }

    if (openedArtifactId && !combinedArtifacts.some((artifact) => artifact.id === openedArtifactId)) {
      setOpenedArtifactId(null);
    }
  }, [combinedArtifacts, openedArtifactId, selectedArtifactId, visibleArtifacts]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedArtifact) {
      setResonanceLinks([]);
      return () => {
        cancelled = true;
      };
    }

    setResonanceLinks([]);
    void buildDynamicInnerWorldResonanceLinks({
      selectedArtifact,
      artifacts: combinedArtifacts,
    }).then((links) => {
      if (!cancelled) {
        setResonanceLinks(links);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [combinedArtifacts, selectedArtifact]);

  const archiveArtifact = (artifact: ArtifactScreenModel) => {
    const record = artifacts.find((item) => item.id === artifact.id);
    if (!record) {
      return;
    }

    const archivedRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    const nextArchived = [archivedRecord, ...archivedArtifacts.filter((item) => item.id !== record.id)];
    writeArchivedArtifacts(nextArchived);
    setArchivedArtifacts(nextArchived);

    const nextArtifacts = removeInnerWorldArtifact(record.id);
    setArtifacts(nextArtifacts);
  };

  const downloadArtifact = (artifact: ArtifactScreenModel) => {
    const record = artifacts.find((item) => item.id === artifact.id);
    if (!record) {
      return;
    }

    downloadTextFile(
      `${record.title}.html`,
      record.html || record.summary || record.title,
      record.html ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
    );
  };

  const curatorMessage = selectedArtifact
    ? "This one came from a Tuesday you probably don't remember being good."
    : visibleArtifacts.length === 0
      ? "Nothing matches those filters yet. Clear them and the hall will answer."
      : "Nothing's made it here yet. That's fine. The hall isn't going anywhere.";
  const curatorNote = visibleArtifacts.length > 0
    ? `There are ${visibleArtifacts.length} visible artifacts and ${archivedArtifacts.length} archived pieces.`
    : "Use the search bar or clear filters to widen the hall.";
  const hasActiveFilters = Boolean(searchQuery.trim() || typeFilter !== "all" || selectedTags.length > 0 || sortMode !== "recent" || timelineRange !== "all");

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSelectedTags([]);
    setSortMode("recent");
    setTimelineRange("all");
  };

  const openArtifact = (artifactId: string) => {
    setSelectedArtifactId(artifactId);
    setOpenedArtifactId(artifactId);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary">
      <BabylonAtmosphere mode="inner-world" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:text-gv-text-primary">
              Home
            </a>
          </Link>
          <div className="hidden text-sm text-gv-text-muted md:block">Finished artifacts stay alive here.</div>
        </header>

        <section className="mt-8 space-y-4">
          {/* Timeline filter rail — see yourself at a point in time, or across all time */}
          <InnerWorldTimeline
            artifacts={combinedArtifacts}
            activeRange={timelineRange}
            onRangeChange={setTimelineRange}
            className="px-1"
          />
          <DynamicWorldSpaceRenderer
            artifacts={visibleArtifacts}
            archivedArtifacts={archivedArtifacts}
            selectedArtifactId={selectedArtifact?.id ?? null}
            resonanceLinks={resonanceLinks}
            searchQuery={searchQuery}
            selectedTags={selectedTags}
            availableTags={availableTags}
            typeFilter={typeFilter}
            sortMode={sortMode}
            stats={{
              totalArtifacts: dynamicInnerWorld.data?.stats.totalArtifacts ?? combinedArtifacts.length,
              plkFragmentCount: dynamicInnerWorld.data?.stats.plkFragmentCount ?? 0,
              recentUpdates: dynamicInnerWorld.data?.stats.recentUpdates ?? 0,
              curatorLabel: dynamicInnerWorld.data?.curatorPersonality ?? "curator",
            }}
            hasActiveFilters={hasActiveFilters}
            dynamicInnerWorldError={dynamicInnerWorld.error?.message ?? null}
            onSelectArtifact={setSelectedArtifactId}
            onOpenArtifact={openArtifact}
            onSearchQueryChange={setSearchQuery}
            onTypeFilterChange={setTypeFilter}
            onSortModeChange={setSortMode}
            onToggleTag={toggleTagFilter}
            onClearFilters={clearFilters}
            onGoToCreationCorner={() => setLocation("/creation-corner")}
          />

          <ProfileDisplay
            userId={user?.id ?? "demo"}
            profile={dynamicInnerWorld.data?.profile ?? null}
            isLoading={dynamicInnerWorld.isLoading}
            onRefreshRequest={dynamicInnerWorld.refetch}
          />
        </section>
      </div>

      {selectedModel ? (
        <ArtifactDeepView
          open
          artifact={selectedModel}
          sessionOrigin={openedArtifact?.originRoom ?? "unknown"}
          plkConnections={selectedConnections}
          externalLinks={openedArtifact?.evidenceNodeIds ?? []}
          resonanceLinks={resonanceLinks}
          onArchive={archiveArtifact}
          onDownload={downloadArtifact}
          onSelectResonanceLink={(artifactId) => setSelectedArtifactId(artifactId)}
          onClose={() => setOpenedArtifactId(null)}
        />
      ) : null}

      <CuratorDI
        message={curatorMessage}
        note={curatorNote}
        actionLabel={visibleArtifacts.length > 0 ? "Creation Corner" : "Go to Creation Corner"}
        onAction={() => setLocation("/creation-corner")}
      />
    </main>
  );
}
