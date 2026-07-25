import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Layers3 } from "lucide-react";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useBillySection } from "@/components/Billy";
import DemoGate from "@/components/DemoGate";
import ProfileDisplay from "@/components/ProfileDisplay";
import { type ArtifactScreenModel } from "@/components/ArtifactScreen";
import BabylonAtmosphere from "@/components/BabylonAtmosphere";
import ArtifactDeepView from "@/components/ArtifactDeepView";
import ArtifactExpandView from "@/components/ArtifactExpandView";
import CuratorDI from "@/components/CuratorDI";
import DynamicWorldSpaceRenderer from "@/features/dynamic-inner-world/world-renderer/DynamicWorldSpaceRenderer";
import type {
  ArtifactSortMode,
  ArtifactTypeFilter,
} from "@/features/dynamic-inner-world/world-renderer/types";
import { useDynamicInnerWorld } from "@/hooks/useDynamicInnerWorld";
import { loadShowcaseArtifacts, loadShowcaseArtifactHtml } from "@/lib/showcaseArtifacts";
import {
  archiveInnerWorldArtifact,
  clearInnerWorldArtifact,
  loadInnerWorldArtifactsFromServer,
  mergeInnerWorldArtifacts,
  purgeAllInnerWorldArtifacts,
  readArchivedInnerWorldArtifacts,
  readInnerWorldArtifacts,
  restoreInnerWorldArtifact,
  writeInnerWorldArtifacts,
  isMuseumVisibleArtifact,
  type InnerWorldArtifactRecord,
} from "@/lib/innerWorldFiles";
import {
  downloadInnerWorldArtifact,
  type InnerWorldDownloadFormat,
} from "@/lib/dynamicInnerWorldDownloads";
import {
  buildDynamicInnerWorldResonanceLinks,
  type DynamicInnerWorldResonanceLink,
} from "@/lib/genEngineRoomWiring";
import type { DynamicInnerWorldArtifact } from "@shared/profileIngestion";
import GestaltRenderSurface from "@/components/rendering/GestaltRenderSurface";
import { mixedContentSceneGraph } from "@/lib/rendering/sampleScenes";
import InnerWorldTimeline, {
  filterArtifactsByRange,
  type TimelineRange,
} from "@/components/inner-world/InnerWorldTimeline";

let demoArtifactGeneratedThisSession = false;

// Founder email — God Mode purge is only offered to this user.
const FOUNDER_EMAIL = "keith@gestaltview.com";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Returns true if the string contains any HTML content — full documents
 * (<!doctype html> / <html>) or partial markup (<p>, <div>, etc.).
 */
function hasHtmlContent(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed.startsWith("<!doctype html") || /<html/i.test(trimmed)) return true;
  return /<\/?[a-z][\s\S]*>/i.test(trimmed);
}

function toArtifactModel(record: InnerWorldArtifactRecord): ArtifactScreenModel {
  const preview = stripHtml(record.summary || record.html).slice(0, 240) || record.title;
  const contentType = hasHtmlContent(record.html)
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
  const { isAuthenticated, user } = useAuth();
  const dynamicInnerWorld = useDynamicInnerWorld(user?.id);
  const [, setLocation] = useLocation();
  const [artifacts, setArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readInnerWorldArtifacts());
  const [archivedArtifacts, setArchivedArtifacts] = useState<InnerWorldArtifactRecord[]>(() => readArchivedInnerWorldArtifacts());
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [openedArtifactId, setOpenedArtifactId] = useState<string | null>(null);
  // Immersive expand view — full-screen, no metadata chrome competing
  const [expandedArtifactId, setExpandedArtifactId] = useState<string | null>(null);
  const [dismissedEndpointIds, setDismissedEndpointIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ArtifactTypeFilter>("all");
  const [sortMode, setSortMode] = useState<ArtifactSortMode>("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [resonanceLinks, setResonanceLinks] = useState<DynamicInnerWorldResonanceLink[]>([]);
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [demoArtifact, setDemoArtifact] = useState<InnerWorldArtifactRecord | null>(null);
  const [demoGateOpen, setDemoGateOpen] = useState(false);
  const [lossPromptOpen, setLossPromptOpen] = useState(false);
  const [showcaseSeeds, setShowcaseSeeds] = useState<InnerWorldArtifactRecord[]>([]);
  const [godModePurging, setGodModePurging] = useState(false);
  const [godModeConfirmOpen, setGodModeConfirmOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<InnerWorldArtifactRecord | null>(null);

  // Determine if this user is the founder (God Mode eligible).
  const isFounder = Boolean(user?.email && user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase());

  const combinedArtifacts = useMemo(
    () => {
      const base = [
        ...artifacts,
        ...(demoArtifact ? [demoArtifact] : []),
        ...(dynamicInnerWorld.data?.artifacts ?? [])
          .map((artifact) => endpointArtifactToRecord(artifact, user?.id ?? "demo"))
          .filter((artifact) => !dismissedEndpointIds.has(artifact.id)),
      ];

      const existingIds = new Set(base.map(a => a.id));
      const filteredSeeds = showcaseSeeds.filter(s => !existingIds.has(s.id));

      return [...base, ...filteredSeeds];
    },
    [artifacts, demoArtifact, dismissedEndpointIds, dynamicInnerWorld.data?.artifacts, user?.id, showcaseSeeds],
  );

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();

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
  }, [combinedArtifacts]);

  const visibleArtifacts = useMemo(() => {
    const timeFiltered = filterArtifactsByRange(combinedArtifacts, timelineRange);
    const filtered = timeFiltered.filter((artifact) => {
      if (!isMuseumVisibleArtifact(artifact) && openedArtifactId !== artifact.id && selectedArtifactId !== artifact.id) {
        return false;
      }
      return matchesArtifactFilters(artifact, searchQuery, typeFilter, selectedTags);
    });

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
  }, [combinedArtifacts, searchQuery, selectedTags, sortMode, typeFilter, timelineRange]);

  const selectedArtifact = useMemo(
    () => visibleArtifacts.find((artifact) => artifact.id === selectedArtifactId) ?? visibleArtifacts[0] ?? null,
    [selectedArtifactId, visibleArtifacts],
  );

  const openedArtifact = useMemo(
    () => combinedArtifacts.find((artifact) => artifact.id === openedArtifactId) ?? null,
    [combinedArtifacts, openedArtifactId],
  );

  const expandedArtifact = useMemo(
    () => combinedArtifacts.find((artifact) => artifact.id === expandedArtifactId) ?? null,
    [combinedArtifacts, expandedArtifactId],
  );

  const selectedModel = openedArtifact ? toArtifactModel(openedArtifact) : null;
  const expandedModel = expandedArtifact ? toArtifactModel(expandedArtifact) : null;

  // Fix: check combinedArtifacts (not just artifacts) so exhibit seeds resolve connections.
  const selectedConnections = openedArtifact ? summarizeConnections(openedArtifact, combinedArtifacts) : [];
  const expandedConnections = expandedArtifact ? summarizeConnections(expandedArtifact, combinedArtifacts) : [];

  useEffect(() => {
    const needsHtml = openedArtifact ?? expandedArtifact;
    if (needsHtml && !needsHtml.html && needsHtml.id.startsWith("exhibit-")) {
      loadShowcaseArtifactHtml(needsHtml.id).then(html => {
        if (html) {
          setArtifacts(prev => prev.map(a => a.id === needsHtml.id ? { ...a, html } : a));
          setShowcaseSeeds(prev => prev.map(a => a.id === needsHtml.id ? { ...a, html } : a));
        }
      });
    }
  }, [openedArtifact, expandedArtifact]);

  useEffect(() => {
    const refresh = () => {
      setArtifacts(readInnerWorldArtifacts());
      setArchivedArtifacts(readArchivedInnerWorldArtifacts());
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
    loadShowcaseArtifacts().then(seeds => {
      setShowcaseSeeds(seeds);
    });
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
    if (!demoArtifact || isAuthenticated) {
      return;
    }

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Your creation will disappear unless you unlock GestaltView.";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [demoArtifact, isAuthenticated]);

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

    if (expandedArtifactId && !combinedArtifacts.some((artifact) => artifact.id === expandedArtifactId)) {
      setExpandedArtifactId(null);
    }
  }, [combinedArtifacts, expandedArtifactId, openedArtifactId, selectedArtifactId, visibleArtifacts]);

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

  // Fix: check combinedArtifacts so showcase/seed artifacts can be archived.
  const archiveArtifact = (artifact: ArtifactScreenModel) => {
    if (!combinedArtifacts.some((item) => item.id === artifact.id)) {
      return;
    }

    // If it's a showcase seed (not in the user's artifact list), skip server archive.
    if (artifacts.some((item) => item.id === artifact.id)) {
      const next = archiveInnerWorldArtifact(artifact.id);
      setArtifacts(next.active);
      setArchivedArtifacts(next.archived);
    } else {
      // Dismiss from combinedArtifacts without persisting (seed artifact).
      setDismissedEndpointIds((prev) => new Set([...prev, artifact.id]));
      setShowcaseSeeds((prev) => prev.filter((s) => s.id !== artifact.id));
    }
    setOpenedArtifactId(null);
    setExpandedArtifactId(null);
  };

  const deleteArtifact = (artifact: ArtifactScreenModel) => {
    if (artifact.id.startsWith("endpoint-")) {
      setDismissedEndpointIds((prev) => new Set([...prev, artifact.id]));
    } else {
      const next = clearInnerWorldArtifact(artifact.id);
      setArtifacts(next.active);
      setArchivedArtifacts(next.archived);
    }
    // Also remove from showcase seeds so it can't reappear.
    setShowcaseSeeds((prev) => prev.filter((s) => s.id !== artifact.id));
    setOpenedArtifactId(null);
    setExpandedArtifactId(null);
  };

  // Card-level delete (no deep-view needed) — called directly from mobile cards.
  const deleteArtifactById = (artifactId: string) => {
    if (artifactId.startsWith("endpoint-")) {
      setDismissedEndpointIds((prev) => new Set([...prev, artifactId]));
    } else {
      const next = clearInnerWorldArtifact(artifactId);
      setArtifacts(next.active);
      setArchivedArtifacts(next.archived);
    }
    setShowcaseSeeds((prev) => prev.filter((s) => s.id !== artifactId));
    if (openedArtifactId === artifactId) {
      setOpenedArtifactId(null);
    }
    if (expandedArtifactId === artifactId) {
      setExpandedArtifactId(null);
    }
    if (selectedArtifactId === artifactId) {
      setSelectedArtifactId(null);
    }
  };

  const restoreArtifact = (artifactId: string) => {
    const next = restoreInnerWorldArtifact(artifactId);
    setArtifacts(next.active);
    setArchivedArtifacts(next.archived);
    setSelectedArtifactId(artifactId);
  };

  const clearArtifactRecord = (artifactId: string) => {
    const next = clearInnerWorldArtifact(artifactId);
    setArtifacts(next.active);
    setArchivedArtifacts(next.archived);
    if (openedArtifactId === artifactId) {
      setOpenedArtifactId(null);
    }
    if (expandedArtifactId === artifactId) {
      setExpandedArtifactId(null);
    }
  };

  const downloadArtifact = (artifact: ArtifactScreenModel) => {
    const record = combinedArtifacts.find((item) => item.id === artifact.id);
    if (!record) {
      return;
    }
    setDownloadTarget(record);
  };

  const confirmArtifactDownload = (format: InnerWorldDownloadFormat) => {
    if (!downloadTarget) {
      return;
    }

    downloadInnerWorldArtifact(downloadTarget, format);
    setDownloadTarget(null);
  };

  // Open expand view — sets selection + expand
  const expandArtifact = (artifactId: string) => {
    setSelectedArtifactId(artifactId);
    setExpandedArtifactId(artifactId);
  };

  // GOD MODE — founder-only full purge.
  const handleGodModePurge = async () => {
    setGodModeConfirmOpen(false);
    setGodModePurging(true);
    try {
      const purgedCount = await purgeAllInnerWorldArtifacts();
      setArtifacts([]);
      setArchivedArtifacts([]);
      setShowcaseSeeds([]);
      setSelectedArtifactId(null);
      setOpenedArtifactId(null);
      setExpandedArtifactId(null);
      console.info(`[GodMode] Purged ${purgedCount} artifacts.`);
    } finally {
      setGodModePurging(false);
    }
  };

  const hasOnlySeeds = useMemo(() => {
    return artifacts.length === 0 && showcaseSeeds.length > 0;
  }, [artifacts, showcaseSeeds]);

  const curatorMessage = useMemo(() => {
    if (selectedArtifact) {
      if (selectedArtifact.id === "exhibit-resume-keith-soyka-v1") {
        return "This is where the work lives. Twenty-two years of management. A platform built on a Samsung A35. Every scar became code.";
      }
      if (selectedArtifact.id === "exhibit-wiki-gestaltview-v1") {
        return "The whole platform in one room. If you want to understand the Recognition Gap, start here.";
      }
      if (selectedArtifact.id === "exhibit-audio-analysis-v1") {
        return "Upload anything. The platform hears what the Spotify wall couldn't.";
      }
      return "This one came from a Tuesday you probably don't remember being good.";
    }

    if (hasOnlySeeds) {
      return "This is the beginning of your Inner World. Three exhibits are lit. When you're ready, Creation Corner can fill the rest.";
    }

    if (visibleArtifacts.length === 0) {
      return "Nothing matches those filters yet. Clear them and the hall will answer.";
    }

    return "Nothing's made it here yet. That's fine. The hall isn't going anywhere.";
  }, [selectedArtifact, hasOnlySeeds, visibleArtifacts.length]);

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

  const createDemoArtifact = () => {
    if (isAuthenticated) {
      setLocation("/creation-corner");
      return;
    }

    if (demoArtifactGeneratedThisSession) {
      setDemoGateOpen(true);
      return;
    }

    const now = new Date().toISOString();
    const artifact: InnerWorldArtifactRecord = {
      id: `demo-artifact-${Date.now()}`,
      userId: "guest",
      title: "Guest Inner World Artifact",
      summary: "A session-only proof of how a saved piece can live spatially in your Dynamic Inner World.",
      sourceFileId: null,
      html: `
        <article style="font-family: Inter, system-ui, sans-serif; padding: 32px; color: #eef8ff; background: radial-gradient(circle at 20% 10%, rgba(0,212,255,.22), transparent 34%), #071015; min-height: 100%;">
          <p style="letter-spacing:.18em;text-transform:uppercase;color:#93e9ff;font-size:12px;">Session-only demo</p>
          <h1 style="font-size:36px;line-height:1.05;margin:16px 0;">Your first piece has a place.</h1>
          <p style="font-size:16px;line-height:1.7;color:#bdd6df;max-width:680px;">This artifact is real enough to inspect, select, and feel in the room, but it is not saved for guest sessions. Create an account to keep the world you are building.</p>
        </article>
      `,
      thumbnailUrl: undefined,
      createdAt: now,
      updatedAt: now,
      originRoom: "dynamic_inner_world",
      evidenceNodeIds: ["demo-session"],
      tags: ["demo", "session-only", "inner-world"],
    };

    demoArtifactGeneratedThisSession = true;
    setDemoArtifact(artifact);
    setSelectedArtifactId(artifact.id);
    setExpandedArtifactId(artifact.id);
  };

  const requestCreationCorner = () => {
    if (!isAuthenticated && demoArtifact) {
      setLossPromptOpen(true);
      return;
    }

    setLocation("/creation-corner");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary">
      <BabylonAtmosphere mode="inner-world" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (!isAuthenticated && demoArtifact ? setLossPromptOpen(true) : setLocation("/"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:text-gv-text-primary"
            >
              Home
            </button>
            <Link href="/artifact-gallery">
              <a className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-50 transition-colors hover:bg-cyan-200/16">
                <Layers3 className="h-4 w-4" />
                Artifact Gallery
              </a>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-gv-text-muted md:block">Finished artifacts stay alive here.</div>
            {/* God Mode — founder-only purge button */}
            {isFounder && (
              <button
                type="button"
                onClick={() => setGodModeConfirmOpen(true)}
                disabled={godModePurging}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-400/18 disabled:opacity-50"
              >
                {godModePurging ? "Purging…" : "⚡ God Mode Purge"}
              </button>
            )}
          </div>
        </header>

        <section className="mt-8 space-y-4">
          {!isAuthenticated ? (
            <div className="rounded-[1.5rem] border border-cyan-200/18 bg-cyan-300/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gv-text-primary">Guest artifact demo</p>
                  <p className="mt-1 text-sm leading-6 text-gv-text-secondary">
                    Generate one session-only artifact. It appears here, but it disappears unless you save your world.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={createDemoArtifact}
                  className="rounded-full border border-cyan-200/25 bg-cyan-200/14 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/20"
                >
                  Generate Demo Artifact
                </button>
              </div>
            </div>
          ) : null}

          <InnerWorldTimeline
            artifacts={combinedArtifacts}
            activeRange={timelineRange}
            onRangeChange={setTimelineRange}
            className="px-1"
          />

          <GestaltRenderSurface
            graph={mixedContentSceneGraph}
            onPromoteToCreationCorner={() => setLocation("/creation-corner?source=nextgen-render") }
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
            onExpandArtifact={expandArtifact}
            onDeleteArtifact={deleteArtifactById}
            onSearchQueryChange={setSearchQuery}
            onTypeFilterChange={setTypeFilter}
            onSortModeChange={setSortMode}
            onToggleTag={toggleTagFilter}
            onClearFilters={clearFilters}
            onGoToCreationCorner={requestCreationCorner}
            onRestoreArtifact={restoreArtifact}
            onClearArtifact={clearArtifactRecord}
          />

          <ProfileDisplay
            userId={user?.id ?? "demo"}
            profile={dynamicInnerWorld.data?.profile ?? null}
            portrait={dynamicInnerWorld.data?.portrait ?? null}
            isLoading={dynamicInnerWorld.isLoading}
            onRefreshRequest={dynamicInnerWorld.refetch}
          />
        </section>
      </div>

      {/* ArtifactDeepView — metadata + context side-panel */}
      {selectedModel ? (
        <ArtifactDeepView
          open
          artifact={selectedModel}
          sessionOrigin={openedArtifact?.originRoom ?? "unknown"}
          plkConnections={selectedConnections}
          externalLinks={openedArtifact?.evidenceNodeIds ?? []}
          resonanceLinks={resonanceLinks}
          onArchive={archiveArtifact}
          onDelete={deleteArtifact}
          onDownload={downloadArtifact}
          onSelectResonanceLink={(artifactId) => setSelectedArtifactId(artifactId)}
          onClose={() => setOpenedArtifactId(null)}
        />
      ) : null}

      {/* ArtifactExpandView — immersive full-screen viewer, z-[60] above DeepView */}
      {expandedModel ? (
        <ArtifactExpandView
          open
          artifact={expandedModel}
          sessionOrigin={expandedArtifact?.originRoom ?? "unknown"}
          plkConnections={expandedConnections}
          externalLinks={expandedArtifact?.evidenceNodeIds ?? []}
          resonanceLinks={resonanceLinks}
          onArchive={archiveArtifact}
          onDelete={deleteArtifact}
          onDownload={downloadArtifact}
          onSelectResonanceLink={(artifactId) => {
            setSelectedArtifactId(artifactId);
            setExpandedArtifactId(null);
          }}
          onClose={() => setExpandedArtifactId(null)}
        />
      ) : null}

      <CuratorDI
        message={curatorMessage}
        note={curatorNote}
        actionLabel={visibleArtifacts.length > 0 ? "Creation Corner" : "Go to Creation Corner"}
        onAction={requestCreationCorner}
      />

      {downloadTarget ? (
        <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[1.8rem] border border-white/10 bg-[#071015]/96 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/72">Choose format</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{downloadTarget.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Pick the export format before downloading this Inner World artifact.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDownloadTarget(null)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Close download format picker"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { format: "html", label: "HTML", description: "Keeps the rendered artifact intact." },
                { format: "txt", label: "Text", description: "Strips markup into a readable transcript." },
                { format: "json", label: "JSON", description: "Includes structured metadata and HTML." },
              ].map((option) => (
                <button
                  key={option.format}
                  type="button"
                  onClick={() => confirmArtifactDownload(option.format as InnerWorldDownloadFormat)}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/[0.08]"
                >
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-xs leading-5 text-white/55">{option.description}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDownloadTarget(null)}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* God Mode confirmation modal */}
      {godModeConfirmOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-400/30 bg-[#0a0208] p-6 shadow-2xl">
            <p className="text-lg font-semibold text-red-200">⚡ God Mode — Full Purge</p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              This will permanently delete every artifact and archived piece from your Inner World — both locally and on the server. Showcase exhibits will reload. This cannot be undone.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleGodModePurge()}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
              >
                Yes, purge everything
              </button>
              <button
                type="button"
                onClick={() => setGodModeConfirmOpen(false)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {demoGateOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <DemoGate
            isActive
            title="Save this to your world"
            description="Guest sessions can create one artifact. Unlock GestaltView to keep building a world that persists across sessions."
            ctaLabel="Save your world"
            ctaHref="/signup"
            className="w-full max-w-md"
          />
          <button
            type="button"
            onClick={() => setDemoGateOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/75"
          >
            Close
          </button>
        </div>
      ) : null}

      {lossPromptOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#071015] p-6 shadow-2xl">
            <p className="text-lg font-semibold text-white">Your creation will disappear</p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              This guest artifact lives only in this session. Save your world to keep it, or leave without saving.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/signup">
                <a className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
                  Save your world
                </a>
              </Link>
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
              >
                Leave without saving
              </button>
              <button
                type="button"
                onClick={() => setLossPromptOpen(false)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75"
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
