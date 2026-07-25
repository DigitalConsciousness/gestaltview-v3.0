import type {
  AmbientCoherenceSignal,
  ArtifactDestination,
  ArtifactType,
} from "../../shared/gen-engine/index.js";

export interface CaptureFragment {
  id: string;
  text: string;
  tags: string[];
  sourceRoom: string;
  createdAt: string;
  confidence?: number;
}

export interface ExtractedOrbSuggestion {
  id: string;
  title: string;
  captureIds: string[];
  fragments: CaptureFragment[];
  theme: string;
  coherenceScore: number;
  suggestedType: ArtifactType;
  suggestedStyle: "faithful" | "convergent" | "divergent" | "gentle-reflective";
  destination: ArtifactDestination;
  observation: string;
  confidence: number;
  pressureLevel: "quiet" | "medium";
}

function createId(prefix = "orb"): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Detects clusters of related captures by analyzing common themes, tags, and language patterns.
 * Does NOT auto-generate finished artifacts, only suggests opportunities.
 */
export function scanForAmbientClusters(
  fragments: CaptureFragment[],
  options: {
    minFragmentsInCluster?: number;
    similarityThreshold?: number;
    timeWindowDays?: number;
  } = {},
): ExtractedOrbSuggestion[] {
  const {
    minFragmentsInCluster = 2,
    similarityThreshold = 0.42,
    timeWindowDays = 7,
  } = options;

  if (fragments.length < minFragmentsInCluster) {
    return [];
  }

  const now = Date.now();
  const timeWindow = timeWindowDays * 24 * 60 * 60 * 1000;

  // Filter fragments within time window
  const recentFragments = fragments.filter((frag) => {
    const created = new Date(frag.createdAt).getTime();
    return now - created <= timeWindow;
  });

  if (recentFragments.length < minFragmentsInCluster) {
    return [];
  }

  const clusters = new Map<string, CaptureFragment[]>();
  const clusterThemes = new Map<string, string[]>();

  // Build simple tag-based clusters
  const tagCounts = new Map<string, number>();
  const tagFragments = new Map<string, CaptureFragment[]>();

  for (const frag of recentFragments) {
    for (const tag of frag.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      if (!tagFragments.has(tag)) {
        tagFragments.set(tag, []);
      }
      tagFragments.get(tag)!.push(frag);
    }
  }

  // Find tags that appear multiple times (indicating potential cluster)
  const frequentTags = Array.from(tagCounts.entries())
    .filter(([, count]) => count >= minFragmentsInCluster)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8); // Limit to top 8 clusters to avoid noise

  const suggestions: ExtractedOrbSuggestion[] = [];

  for (const [tag, count] of frequentTags) {
    const clusterFrags = tagFragments.get(tag) ?? [];
    const clusterId = `cluster-${tag}-${Date.now()}`;

    const avgConfidence = clusterFrags.reduce((sum, f) => sum + (f.confidence ?? 0.6), 0) / clusterFrags.length;
    const coherenceScore = Math.min(1, avgConfidence * (count / (count + 2)));

    if (coherenceScore < similarityThreshold) {
      continue; // Skip low-confidence clusters
    }

    // Infer artifact type from tags
    let suggestedType: ArtifactType = "markdown";
    if (tag.includes("code") || tag.includes("blueprint")) {
      suggestedType = "code";
    } else if (tag.includes("image") || tag.includes("visual")) {
      suggestedType = "image-prompt";
    } else if (tag.includes("recap") || tag.includes("summary")) {
      suggestedType = "session-recap";
    } else if (tag.includes("marketing") || tag.includes("copy")) {
      suggestedType = "marketing-copy";
    }

    const suggestion: ExtractedOrbSuggestion = {
      id: createId("orb"),
      title: `Auto-detected ${tag} cluster (${count} fragments)`,
      captureIds: clusterFrags.map((f) => f.id),
      fragments: clusterFrags,
      theme: tag,
      coherenceScore: Number(coherenceScore.toFixed(3)),
      suggestedType,
      suggestedStyle: coherenceScore > 0.8 ? "convergent" : "gentle-reflective",
      destination: "dynamic-inner-world",
      observation: `These ${count} fragments share the "${tag}" theme and may want to become a shared artifact.`,
      confidence: coherenceScore,
      pressureLevel: coherenceScore > 0.75 ? "medium" : "quiet",
    };

    suggestions.push(suggestion);
  }

  return suggestions.sort((a, b) => b.coherenceScore - a.coherenceScore);
}

/**
 * Converts an ExtractedOrbSuggestion to an AmbientCoherenceSignal for display
 */
export function suggestionToSignal(suggestion: ExtractedOrbSuggestion): AmbientCoherenceSignal {
  return {
    id: suggestion.id,
    title: suggestion.title,
    sourceCaptureIds: suggestion.captureIds,
    observation: suggestion.observation,
    suggestedAction: suggestion.pressureLevel === "medium" ? "send-to-creation-corner" : "open-cluster",
    confidence: suggestion.confidence,
    pressureLevel: suggestion.pressureLevel,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Lightweight ambient analysis that respects user boundaries
 * - Does not create finished artifacts
 * - Only suggests opportunities with confidence scores
 * - Gracefully handles missing data
 */
export function buildAmbientOrbSuggestions(
  fragments: CaptureFragment[],
  options?: {
    maxSuggestions?: number;
    minConfidence?: number;
  },
): ExtractedOrbSuggestion[] {
  const { maxSuggestions = 5, minConfidence = 0.5 } = options ?? {};

  const all = scanForAmbientClusters(fragments);
  return all.filter((s) => s.confidence >= minConfidence).slice(0, maxSuggestions);
}
