import type { OrchestrationTrigger } from "./types.js";

export type OrchestrationConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type RuntimeDailyEntry = {
  title: string;
  summary?: string;
  notes?: string[];
  moduleHint?: string;
  tags?: string[];
  source?: string;
};

export type OrchestrationExtractionInput = {
  trigger: OrchestrationTrigger | string;
  sourceRoom: string;
  title?: string;
  text?: string;
  contextClues?: string[];
  conversationHistory?: OrchestrationConversationMessage[];
  runtimeDailies?: RuntimeDailyEntry[];
};

export type OrchestrationNugget = {
  id: string;
  title: string;
  summary: string;
  source: "text" | "conversation" | "runtime-daily";
  evidence: string[];
  tags: string[];
  moduleTargets: string[];
  presentation: {
    mode: "orbit" | "halo" | "gallery" | "ledger" | "stage";
    accent: string;
    motion: "still" | "breathing" | "drifting";
  };
};

export type OrchestrationModulePopulation = {
  moduleId: string;
  label: string;
  reason: string;
  priority: number;
  nuggetIds: string[];
};

export type OrchestrationExtractionResult = {
  extractionId: string;
  extractedAt: string;
  trigger: OrchestrationExtractionInput["trigger"];
  sourceRoom: string;
  nuggets: OrchestrationNugget[];
  modulePopulation: OrchestrationModulePopulation[];
};

type SignalProfile = {
  moduleId: string;
  label: string;
  keywords: string[];
  accent: string;
  mode: OrchestrationNugget["presentation"]["mode"];
};

const MODULE_PROFILES: SignalProfile[] = [
  {
    moduleId: "external-scaffold",
    label: "External Scaffold Of You",
    keywords: ["scaffold", "orb", "orbs", "tag", "tags", "capture", "fragment", "artifact", "approval", "queue", "galaxy"],
    accent: "#12D6FF",
    mode: "orbit",
  },
  {
    moduleId: "creation-corner",
    label: "Creation Corner",
    keywords: ["blueprint", "document", "recap", "forge", "presentation", "artifact", "module", "synthesize", "report", "mind map", "mindmap"],
    accent: "#BF00FF",
    mode: "gallery",
  },
  {
    moduleId: "sanctuary",
    label: "Sanctuary",
    keywords: ["ground", "grounding", "stabilize", "recovery", "support", "reflect", "hold", "safe", "quiet", "gentle"],
    accent: "#FF8FA3",
    mode: "halo",
  },
  {
    moduleId: "blackboard-room",
    label: "Blackboard Room",
    keywords: ["conversation", "conversation history", "thread", "session", "capture", "note", "journal", "voice", "transcript", "talk"],
    accent: "#00E5FF",
    mode: "ledger",
  },
  {
    moduleId: "dynamic-inner-world",
    label: "Dynamic Inner World",
    keywords: ["inner world", "dynamic", "live", "scene", "spatial", "presentation", "room", "orb", "galaxy", "motion"],
    accent: "#FF3CAC",
    mode: "stage",
  },
];

const TAG_HINTS: Array<{ tag: string; keywords: string[] }> = [
  { tag: "conversation", keywords: ["conversation", "dialogue", "exchange", "thread"] },
  { tag: "runtime-daily", keywords: ["daily", "dailies", "check-in", "reflection", "log"] },
  { tag: "nugget", keywords: ["nugget", "signal", "insight", "fragment"] },
  { tag: "module", keywords: ["module", "surface", "room", "lane"] },
  { tag: "tagging", keywords: ["tag", "tags", "label", "labeling"] },
  { tag: "presentation", keywords: ["presentation", "display", "visual", "wow", "dynamic"] },
];

function createExtractionId(): string {
  const random =
    typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `extract-${random}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toSegments(value: string): string[] {
  return normalize(value)
    .split(/[\n.!?]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function titleFromText(value: string): string {
  const words = normalize(value).replace(/[.!?]+$/g, "").split(" ").slice(0, 6);
  return words.join(" ") || "Untitled nugget";
}

function buildTags(text: string, extras: string[] = []): string[] {
  const lower = text.toLowerCase();
  const matchedHints = TAG_HINTS.flatMap((hint) => (hint.keywords.some((keyword) => lower.includes(keyword)) ? [hint.tag] : []));
  const freeTags = lower
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 6);

  return Array.from(new Set([...matchedHints, ...extras, ...freeTags])).slice(0, 12);
}

function resolveModuleProfiles(text: string, tags: string[], moduleHint?: string): SignalProfile[] {
  const lower = `${text} ${moduleHint ?? ""}`.toLowerCase();
  const scored = MODULE_PROFILES.map((profile) => ({
    profile,
    score:
      profile.keywords.reduce((count, keyword) => count + (lower.includes(keyword) ? 1 : 0), 0) +
      tags.reduce((count, tag) => count + (profile.keywords.includes(tag) ? 1 : 0), 0),
  }));

  const bestScore = Math.max(...scored.map((entry) => entry.score), 0);
  if (bestScore > 0) {
    return scored.filter((entry) => entry.score === bestScore).map((entry) => entry.profile);
  }

  if (moduleHint) {
    const hinted = MODULE_PROFILES.find((profile) => profile.moduleId === moduleHint || profile.label.toLowerCase() === moduleHint.toLowerCase());
    if (hinted) {
      return [hinted];
    }
  }

  return [MODULE_PROFILES[0]];
}

function buildPresentation(profile: SignalProfile): OrchestrationNugget["presentation"] {
  return {
    mode: profile.mode,
    accent: profile.accent,
    motion: profile.mode === "ledger" ? "still" : profile.mode === "halo" ? "breathing" : "drifting",
  };
}

function gatherCandidates(input: OrchestrationExtractionInput): Array<{ source: OrchestrationNugget["source"]; text: string; evidence: string[]; tags: string[] }> {
  const candidates: Array<{ source: OrchestrationNugget["source"]; text: string; evidence: string[]; tags: string[] }> = [];

  if (input.title?.trim()) {
    candidates.push({
      source: "text",
      text: input.title,
      evidence: [input.title],
      tags: buildTags(input.title, ["title"]),
    });
  }

  if (input.text?.trim()) {
    const segments = toSegments(input.text);
    for (const segment of segments) {
      candidates.push({
        source: "text",
        text: segment,
        evidence: [segment],
        tags: buildTags(segment),
      });
    }
  }

  for (const clue of input.contextClues ?? []) {
    if (!clue.trim()) {
      continue;
    }
    candidates.push({
      source: "text",
      text: clue,
      evidence: [clue],
      tags: buildTags(clue, ["context"]),
    });
  }

  for (const message of input.conversationHistory ?? []) {
    const text = normalize(message.content);
    if (!text) {
      continue;
    }
    const source = message.role === "assistant" ? "conversation" : "conversation";
    candidates.push({
      source,
      text,
      evidence: [message.role, text],
      tags: buildTags(text, [message.role]),
    });
  }

  for (const daily of input.runtimeDailies ?? []) {
    const text = normalize([daily.title, daily.summary, ...(daily.notes ?? [])].filter(Boolean).join(" "));
    if (!text) {
      continue;
    }
    candidates.push({
      source: "runtime-daily",
      text,
      evidence: [daily.title, daily.summary ?? "", ...(daily.notes ?? [])].filter(Boolean),
      tags: buildTags(text, ["runtime-daily", ...(daily.tags ?? [])]),
    });
  }

  return candidates;
}

function selectCandidates(
  candidates: Array<{ source: OrchestrationNugget["source"]; text: string; evidence: string[]; tags: string[] }>,
): Array<{ source: OrchestrationNugget["source"]; text: string; evidence: string[]; tags: string[] }> {
  const scored = candidates
    .map((candidate) => {
      const lower = candidate.text.toLowerCase();
      const score =
        candidate.tags.length +
        ["need", "should", "must", "remember", "next", "module", "scaffold", "daily", "recap", "capture", "present", "tag"].reduce(
          (count, keyword) => count + (lower.includes(keyword) ? 2 : 0),
          0,
        ) +
        Math.min(3, candidate.evidence.length);

      return { candidate, score };
    })
    .sort((left, right) => right.score - left.score || right.candidate.text.length - left.candidate.text.length);

  return scored.slice(0, 8).map((entry) => entry.candidate);
}

function buildNuggets(input: OrchestrationExtractionInput) {
  const selected = selectCandidates(gatherCandidates(input));

  return selected.map((candidate, index) => {
    const moduleProfiles = resolveModuleProfiles(candidate.text, candidate.tags, input.runtimeDailies?.[0]?.moduleHint);
    const moduleTargets = moduleProfiles.map((profile) => profile.moduleId);
    const presentation = buildPresentation(moduleProfiles[0]);

    return {
      id: `${index}-${createExtractionId()}`,
      title: titleFromText(candidate.text),
      summary: normalize(candidate.text),
      source: candidate.source,
      evidence: candidate.evidence.slice(0, 4),
      tags: candidate.tags,
      moduleTargets,
      presentation,
    } satisfies OrchestrationNugget;
  });
}

function buildModulePopulation(nuggets: OrchestrationNugget[]): OrchestrationModulePopulation[] {
  const grouped = new Map<string, OrchestrationNugget[]>();

  for (const nugget of nuggets) {
    for (const target of nugget.moduleTargets) {
      const bucket = grouped.get(target) ?? [];
      bucket.push(nugget);
      grouped.set(target, bucket);
    }
  }

  return Array.from(grouped.entries())
    .map(([moduleId, items]) => {
      const profile = MODULE_PROFILES.find((entry) => entry.moduleId === moduleId) ?? MODULE_PROFILES[0];
      return {
        moduleId,
        label: profile.label,
        reason: items[0]?.summary ?? profile.label,
        priority: items.length,
        nuggetIds: items.map((item) => item.id),
      };
    })
    .sort((left, right) => right.priority - left.priority || left.label.localeCompare(right.label));
}

export function extractOrchestrationSignals(
  input: OrchestrationExtractionInput,
): OrchestrationExtractionResult {
  const nuggets = buildNuggets(input);
  const modulePopulation = buildModulePopulation(nuggets);

  return {
    extractionId: createExtractionId(),
    extractedAt: nowIso(),
    trigger: input.trigger,
    sourceRoom: input.sourceRoom,
    nuggets,
    modulePopulation,
  };
}
