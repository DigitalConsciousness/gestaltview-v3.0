import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import type { DynamicInnerWorldResonanceLink } from "@/lib/genEngineRoomWiring";

export type WorldRenderMode = "museum" | "constellation" | "timeline" | "archive";

export type WorldNodeKind =
  | "world-atrium"
  | "artifact-pod"
  | "artifact-constellation"
  | "resonance-rail"
  | "curator-console"
  | "archive-vault"
  | "search-control-deck"
  | "empty-hall-state"
  | "world-stats-ribbon";

export type WorldPosition = {
  x: number;
  y: number;
  z: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
};

export type WorldNode = {
  id: string;
  kind: WorldNodeKind;
  artifactId?: string;
  title?: string;
  summary?: string;
  tags?: string[];
  position: WorldPosition;
  emphasis: "primary" | "secondary" | "ambient" | "archived";
  children?: WorldNode[];
  props?: Record<string, unknown>;
};

export type WorldPlan = {
  id: string;
  mode: WorldRenderMode;
  generatedAt: string;
  selectedArtifactId: string | null;
  nodes: WorldNode[];
  atmosphere: {
    density: number;
    accent: "cyan" | "emerald" | "purple" | "gold";
    signage: string;
    corridorDepth: number;
  };
  curator: {
    message: string;
    note?: string;
    activePersonaSlug: "curator";
  };
};

export type ArtifactTypeFilter = "all" | "image" | "text" | "code" | "audio";
export type ArtifactSortMode = "recent" | "oldest" | "title";

export type BuildWorldPlanInput = {
  artifacts: InnerWorldArtifactRecord[];
  archivedArtifacts: InnerWorldArtifactRecord[];
  selectedArtifactId: string | null;
  resonanceLinks: DynamicInnerWorldResonanceLink[];
  searchQuery: string;
  selectedTags: string[];
  typeFilter: string;
  sortMode: string;
};

export type WorldStats = {
  totalArtifacts: number;
  plkFragmentCount: number;
  recentUpdates: number;
  curatorLabel: string;
};

export type WorldRenderContext = {
  plan: WorldPlan;
  artifactsById: Map<string, InnerWorldArtifactRecord>;
  archivedArtifacts: InnerWorldArtifactRecord[];
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
  onSearchQueryChange: (value: string) => void;
  onTypeFilterChange: (value: ArtifactTypeFilter) => void;
  onSortModeChange: (value: ArtifactSortMode) => void;
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  onGoToCreationCorner: () => void;
  onRestoreArtifact: (artifactId: string) => void;
  onClearArtifact: (artifactId: string) => void;
};
