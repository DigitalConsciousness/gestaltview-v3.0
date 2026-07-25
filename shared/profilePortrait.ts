import type { PersonalityProfile } from "./profileIngestion.js";

export type PortraitDimensionKind =
  | "cognitive_style"
  | "linguistic_signature"
  | "energy_rhythm"
  | "capture_behavior"
  | "synthesis_readiness"
  | "emotional_texture"
  | "identity_anchors"
  | "growth_edges"
  | "relational_patterns"
  | "creative_mode";

export interface ProfilePortraitDimension {
  kind: PortraitDimensionKind;
  label: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  signalSources: string[];
  metaphorFamily?: string[];
  rawQuotes?: string[];
  delta?: string;
}

export interface ProfilePortrait {
  userId: string;
  version: number;
  portraitTitle: string;
  tagline: string;
  dimensions: ProfilePortraitDimension[];
  overallConfidence: number;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  totalSourceRecords: number;
  plkResonanceScore?: number;
  deltaFromPrevious?: string;
  inferenceTriggeredBy: "cadence" | "threshold" | "manual";
  inferenceRunId: string;
}

export type PortraitMemoryEntry = {
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  kind?: string | null;
  scope?: string | null;
  importance?: number | null;
  pinned?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  tags?: string[] | null;
};

export type PortraitBucketDrop = {
  content?: string | null;
  raw_text?: string | null;
  created_at?: string | null;
  intensity?: number | null;
  plk_resonance_score?: number | string | null;
  stage?: string | null;
  tags?: string[] | null;
};

export type PortraitGravityReport = {
  source_title?: string | null;
  source_type?: string | null;
  source_kind?: string | null;
  signal_weight?: number | null;
  confidence?: string | number | null;
  created_at?: string | null;
  gravity_report?: Record<string, unknown> | null;
};

export type PortraitFounderContext = {
  plk_snapshot?: Record<string, unknown> | null;
  current_state?: string | null;
  session_thread?: string | null;
  mode_preference?: string | null;
  last_session_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type PortraitEvidence = {
  memoryEntries: PortraitMemoryEntry[];
  bucketDrops: PortraitBucketDrop[];
  gravityReports: PortraitGravityReport[];
  founderContext: PortraitFounderContext | null;
};

export type BuildProfilePortraitInput = {
  userId: string;
  profile: PersonalityProfile;
  evidence?: Partial<PortraitEvidence>;
  previousPortrait?: ProfilePortrait | null;
  version?: number;
  sourceWindowStart?: string;
  sourceWindowEnd?: string;
  inferenceTriggeredBy?: ProfilePortrait["inferenceTriggeredBy"];
  inferenceRunId?: string;
  contextFraming?: string;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function toIsoOr(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : new Date(parsed).toISOString();
}

function stableUuidFromText(value: string): string {
  let hashA = 2166136261;
  let hashB = 16777619;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 16777619);
    hashB ^= code + index;
    hashB = Math.imul(hashB, 2166136261);
  }

  const seed = `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0).toString(16).padStart(8, "0")}`.repeat(2).slice(0, 32);
  return [
    seed.slice(0, 8),
    seed.slice(8, 12),
    `4${seed.slice(12, 15)}`,
    `8${seed.slice(16, 19)}`,
    seed.slice(20, 32),
  ].join("-");
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );
}

function paragraphFromFragments(
  fragments: Array<string | null | undefined>,
  fallback: string,
  limit = 2,
): string {
  const cleaned = unique(fragments).filter(Boolean).slice(0, limit);
  if (cleaned.length === 0) {
    return fallback;
  }

  return cleaned.join(" ");
}

function evidenceQuotes(
  entries: Array<{ content?: string | null | undefined; summary?: string | null | undefined; title?: string | null | undefined }>,
  limit = 3,
): string[] {
  return unique(
    entries
      .flatMap((entry) => [entry.title, entry.summary, entry.content])
      .map((value) => (typeof value === "string" ? truncate(value, 160) : ""))
      .filter(Boolean),
  ).slice(0, limit);
}

function parseIntensity(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function countSignals(values: Array<string | null | undefined>): number {
  return unique(values).length;
}

function findProfileDimension(profile: PersonalityProfile, predicate: (label: string, summary: string) => boolean) {
  return profile.dimensions.find((dimension) => predicate(dimension.dimensionLabel, dimension.dimensionValue.summary));
}

function buildDimension(input: {
  kind: PortraitDimensionKind;
  label: string;
  summary: string;
  confidence: number;
  evidenceCount: number;
  signalSources: string[];
  metaphorFamily?: string[];
  rawQuotes?: string[];
  previousPortrait?: ProfilePortrait | null;
}): ProfilePortraitDimension {
  const previousDimension = input.previousPortrait?.dimensions.find((dimension) => dimension.kind === input.kind);
  const delta =
    previousDimension && previousDimension.summary !== input.summary
      ? `Evolved from "${truncate(previousDimension.summary, 120)}"`
      : undefined;

  return {
    kind: input.kind,
    label: input.label,
    summary: truncate(input.summary, 800),
    confidence: clamp(Number(input.confidence.toFixed(3))),
    evidenceCount: input.evidenceCount,
    signalSources: unique(input.signalSources),
    metaphorFamily: input.metaphorFamily?.length ? unique(input.metaphorFamily).slice(0, 5) : undefined,
    rawQuotes: input.rawQuotes?.length ? unique(input.rawQuotes).slice(0, 3) : undefined,
    delta,
  };
}

function latestDate(values: Array<string | null | undefined>, fallback: string): string {
  const parsed = values
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter((value) => Number.isFinite(value));

  if (parsed.length === 0) {
    return fallback;
  }

  return new Date(Math.max(...parsed)).toISOString();
}

function earliestDate(values: Array<string | null | undefined>, fallback: string): string {
  const parsed = values
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter((value) => Number.isFinite(value));

  if (parsed.length === 0) {
    return fallback;
  }

  return new Date(Math.min(...parsed)).toISOString();
}

function selectPortraitTitle(profile: PersonalityProfile, evidence: PortraitEvidence, contextFraming?: string): string {
  const searchable = [
    profile.coreNarrative,
    profile.keyThemes.join(" "),
    profile.unresolvedTensions.join(" "),
    contextFraming ?? "",
    evidence.founderContext?.current_state ?? "",
    evidence.founderContext?.session_thread ?? "",
    evidence.bucketDrops.map((drop) => drop.content ?? drop.raw_text ?? "").join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const candidates = [
    { pattern: /profile upload|document|ingest|import/, title: "The Living Archive" },
    { pattern: /founder|creator|origin|keith/, title: "The Founder Thread" },
    { pattern: /music|song|rhythm|listening/, title: "The Listening Architect" },
    { pattern: /create|creative|build|artifact|design/, title: "The Weaving Architect" },
    { pattern: /collabor|relat|together|partner/, title: "The Shared Thread" },
    { pattern: /repair|resilien|conflict|edge/, title: "The Repair Keeper" },
    { pattern: /memory|recall|history|continuity/, title: "The Continuity Cartographer" },
  ];

  const match = candidates.find((candidate) => candidate.pattern.test(searchable));
  return match?.title ?? "The Living Portrait";
}

function selectTagline(profile: PersonalityProfile, evidence: PortraitEvidence, contextFraming?: string): string {
  const base = profile.coreNarrative || "A living portrait built from the user’s accumulated signal.";
  const extra =
    contextFraming ||
    evidence.founderContext?.current_state ||
    evidence.founderContext?.session_thread ||
    profile.keyThemes[0] ||
    "";

  return truncate(extra ? `${base} ${extra}` : base, 280);
}

export function buildProfilePortrait(input: BuildProfilePortraitInput): ProfilePortrait {
  const evidence: PortraitEvidence = {
    memoryEntries: input.evidence?.memoryEntries ?? [],
    bucketDrops: input.evidence?.bucketDrops ?? [],
    gravityReports: input.evidence?.gravityReports ?? [],
    founderContext: input.evidence?.founderContext ?? null,
  };

  const now = new Date().toISOString();
  const sourceDates = [
    ...evidence.memoryEntries.map((entry) => entry.created_at ?? entry.updated_at ?? null),
    ...evidence.bucketDrops.map((drop) => drop.created_at ?? null),
    ...evidence.gravityReports.map((report) => report.created_at ?? null),
    evidence.founderContext?.last_session_at ?? null,
    evidence.founderContext?.updated_at ?? null,
  ];
  const sourceWindowStart = input.sourceWindowStart ?? earliestDate(sourceDates, now);
  const sourceWindowEnd = input.sourceWindowEnd ?? latestDate(sourceDates, now);
  const previousPortrait = input.previousPortrait ?? null;
  const version = input.version ?? (previousPortrait ? previousPortrait.version + 1 : 1);

  const memoryCount = evidence.memoryEntries.length;
  const bucketDropCount = evidence.bucketDrops.length;
  const gravityCount = evidence.gravityReports.length;
  const founderSnapshot = evidence.founderContext?.plk_snapshot ?? null;
  const snapshotText = founderSnapshot ? JSON.stringify(founderSnapshot) : "";
  const signatureText = [
    input.profile.keyThemes.join(" "),
    input.profile.coreNarrative,
    input.profile.unresolvedTensions.join(" "),
    snapshotText,
    evidence.founderContext?.session_thread ?? "",
    evidence.memoryEntries.map((entry) => [entry.title, entry.summary, entry.content].filter(Boolean).join(" ")).join(" "),
    evidence.bucketDrops.map((drop) => [drop.content, drop.raw_text].filter(Boolean).join(" ")).join(" "),
  ]
    .join(" ")
    .trim();

  const profileDimensions = input.profile.dimensions;
  const creativeExpression = findProfileDimension(input.profile, (label) => /creative expression/i.test(label));
  const collaborationStyle = findProfileDimension(input.profile, (label) => /collaboration style/i.test(label));
  const resiliencePattern = findProfileDimension(input.profile, (label) => /resilience pattern/i.test(label));
  const learningStyle = findProfileDimension(input.profile, (label) => /learning style/i.test(label));
  const conflictResolution = findProfileDimension(input.profile, (label) => /conflict resolution/i.test(label));
  const musicDNA = findProfileDimension(input.profile, (label) => /music dna resonance/i.test(label));

  const averageIntensity = average(evidence.bucketDrops.map((drop) => parseIntensity(drop.intensity)));
  const captureSources = evidence.bucketDrops.map((drop) => drop.stage ?? "bucket_drops");
  const memoryKinds = evidence.memoryEntries.map((entry) => entry.kind ?? entry.scope ?? "memory_entries");
  const gravitySignals = evidence.gravityReports.map((report) => report.source_title ?? report.source_type ?? report.source_kind ?? "gravity_reports");

  const dimensions: ProfilePortraitDimension[] = [
    buildDimension({
      kind: "cognitive_style",
      label: "Cognitive style",
      summary: paragraphFromFragments(
        [
          learningStyle?.dimensionValue.summary,
          creativeExpression?.dimensionValue.summary,
          profileDimensions[0]?.dimensionValue.summary,
          `The evidence shows ${memoryCount} remembered signal${memoryCount === 1 ? "" : "s"} and ${bucketDropCount} unfiltered capture${bucketDropCount === 1 ? "" : "s"} feeding the mental model.`,
        ],
        "The cognitive pattern is present, but needs more source material before the shape can be called settled.",
      ),
      confidence: clamp(0.32 + Math.min(0.45, (learningStyle?.confidence ?? 0.36) * 0.35 + (creativeExpression?.confidence ?? 0.36) * 0.35 + memoryCount * 0.01)),
      evidenceCount: Math.max(1, memoryCount + 1),
      signalSources: ["personality_profile", "memory_entries", "bucket_drops"],
      metaphorFamily: unique(["weaving", "architecting", "mapping"]),
      rawQuotes: evidenceQuotes([
        { summary: learningStyle?.dimensionValue.summary, title: learningStyle?.dimensionLabel },
        { summary: creativeExpression?.dimensionValue.summary, title: creativeExpression?.dimensionLabel },
      ]),
      previousPortrait,
    }),
    buildDimension({
      kind: "linguistic_signature",
      label: "Linguistic signature",
      summary: paragraphFromFragments(
        [
          evidence.founderContext?.session_thread,
          evidence.founderContext?.current_state,
          evidence.founderContext?.plk_snapshot
            ? `PLK snapshot present with ${Object.keys(evidence.founderContext.plk_snapshot).length} anchor field${Object.keys(evidence.founderContext.plk_snapshot).length === 1 ? "" : "s"}.`
            : "",
        ],
        "The language pattern is still being assembled from founder context and live signal.",
      ),
      confidence: clamp(0.42 + (evidence.founderContext ? 0.22 : 0) + (signatureText.length > 120 ? 0.1 : 0)),
      evidenceCount: Math.max(1, (evidence.founderContext ? 1 : 0) + countSignals([evidence.founderContext?.session_thread, evidence.founderContext?.current_state, snapshotText])),
      signalSources: ["founder_context", "personality_profile"],
      metaphorFamily: unique(["voice", "register", "fingerprint"]),
      rawQuotes: evidenceQuotes([
        { summary: evidence.founderContext?.session_thread, title: "Session thread" },
        { summary: evidence.founderContext?.current_state, title: "Current state" },
      ]),
      previousPortrait,
    }),
    buildDimension({
      kind: "energy_rhythm",
      label: "Energy rhythm",
      summary: paragraphFromFragments(
        [
          bucketDropCount > 0 ? `Average bucket-drop intensity lands at ${averageIntensity.toFixed(2)} on the local 0-10 scale.` : "",
          bucketDropCount > 0 ? `Recent capture cadence is visible across ${bucketDropCount} drop${bucketDropCount === 1 ? "" : "s"}.` : "",
          evidence.gravityReports[0]?.source_title ? `Gravity reports add ${gravityCount} corroborating signal${gravityCount === 1 ? "" : "s"}.` : "",
        ],
        "There is not enough cadence data yet to name the energy rhythm with confidence.",
      ),
      confidence: clamp(0.28 + Math.min(0.5, averageIntensity / 12 + bucketDropCount * 0.02 + gravityCount * 0.015)),
      evidenceCount: Math.max(1, bucketDropCount + gravityCount),
      signalSources: ["bucket_drops", "gravity_reports"],
      metaphorFamily: unique(["pulse", "tempo", "wave"]),
      rawQuotes: evidenceQuotes(
        evidence.bucketDrops.map((drop) => ({ content: drop.content, summary: drop.raw_text })),
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "capture_behavior",
      label: "Capture behavior",
      summary: paragraphFromFragments(
        [
          `The user leaves ${bucketDropCount} capture${bucketDropCount === 1 ? "" : "s"} in the bucket stream and ${memoryCount} memory entr${memoryCount === 1 ? "y" : "ies"} in the longer archive.`,
          captureSources.length > 0 ? `Most captures land through ${unique(captureSources).join(", ")}.` : "",
        ],
        "Capture behavior is still sparse enough that the pattern should be treated as provisional.",
      ),
      confidence: clamp(0.35 + Math.min(0.4, bucketDropCount * 0.03 + memoryCount * 0.015)),
      evidenceCount: Math.max(1, bucketDropCount + memoryCount),
      signalSources: ["bucket_drops", "memory_entries"],
      metaphorFamily: unique(["bucket", "archive", "trail"]),
      rawQuotes: evidenceQuotes(
        evidence.memoryEntries.map((entry) => ({ title: entry.title, summary: entry.summary, content: entry.content })),
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "synthesis_readiness",
      label: "Synthesis readiness",
      summary: paragraphFromFragments(
        [
          input.profile.unresolvedTensions.length > 0 ? input.profile.unresolvedTensions[0] : "",
          gravitySignals.length > 0 ? `Gravity reports contribute ${gravitySignals.length} signal point${gravitySignals.length === 1 ? "" : "s"}.` : "",
          conflictResolution?.dimensionValue.summary,
        ],
        "The system does not yet have enough contradiction and resolution signal to rate synthesis readiness cleanly.",
      ),
      confidence: clamp(0.33 + Math.min(0.42, gravityCount * 0.04 + input.profile.unresolvedTensions.length * 0.03 + (conflictResolution?.confidence ?? 0.3) * 0.2)),
      evidenceCount: Math.max(1, gravityCount + input.profile.unresolvedTensions.length + (conflictResolution ? 1 : 0)),
      signalSources: ["gravity_reports", "personality_profile"],
      metaphorFamily: unique(["threshold", "gate", "translation"]),
      rawQuotes: evidenceQuotes(
        evidence.gravityReports.map((report) => ({ title: report.source_title, summary: typeof report.gravity_report === "object" ? JSON.stringify(report.gravity_report) : undefined })),
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "emotional_texture",
      label: "Emotional texture",
      summary: paragraphFromFragments(
        [
          bucketDropCount > 0 ? `The bucket stream suggests emotion is carried more through direct naming than through display.` : "",
          resiliencePattern?.dimensionValue.summary,
          musicDNA?.dimensionValue.summary,
        ],
        "The emotional register is visible, but the signal is still too thin for a settled reading.",
      ),
      confidence: clamp(0.3 + Math.min(0.45, bucketDropCount * 0.025 + (resiliencePattern?.confidence ?? 0.32) * 0.18 + (musicDNA?.confidence ?? 0.3) * 0.12)),
      evidenceCount: Math.max(1, bucketDropCount + (resiliencePattern ? 1 : 0) + (musicDNA ? 1 : 0)),
      signalSources: ["bucket_drops", "personality_profile"],
      metaphorFamily: unique(["weather", "texture", "undertone"]),
      rawQuotes: evidenceQuotes(
        evidence.bucketDrops.map((drop) => ({ content: drop.content })),
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "identity_anchors",
      label: "Identity anchors",
      summary: paragraphFromFragments(
        [
          input.profile.keyThemes.join(", "),
          input.profile.coreNarrative,
          evidence.founderContext?.current_state,
        ],
        "Identity anchors are still provisional and need a denser longitudinal sample.",
      ),
      confidence: clamp(0.4 + Math.min(0.4, input.profile.keyThemes.length * 0.08 + input.profile.dimensions.length * 0.01)),
      evidenceCount: Math.max(1, input.profile.keyThemes.length + input.profile.dimensions.length),
      signalSources: ["personality_profile", "founder_context"],
      metaphorFamily: unique(["anchor", "thread", "constellation"]),
      rawQuotes: evidenceQuotes(
        input.profile.dimensions.map((dimension) => ({ title: dimension.dimensionLabel, summary: dimension.dimensionValue.summary })),
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "growth_edges",
      label: "Growth edges",
      summary: paragraphFromFragments(
        [
          input.profile.unresolvedTensions.join(" "),
          evidence.memoryEntries.find((entry) => /challenge|hard|stuck|blocked|repair/i.test(`${entry.title} ${entry.summary} ${entry.content}`))?.content ?? "",
          evidence.bucketDrops.find((drop) => /challenge|hard|stuck|blocked|repair/i.test(`${drop.content} ${drop.raw_text}`))?.content ?? "",
        ],
        "No strong growth edge surfaced yet; more evidence is needed before this dimension should be read as stable.",
      ),
      confidence: clamp(0.28 + Math.min(0.45, input.profile.unresolvedTensions.length * 0.08 + bucketDropCount * 0.015)),
      evidenceCount: Math.max(1, input.profile.unresolvedTensions.length + bucketDropCount),
      signalSources: ["personality_profile", "memory_entries", "bucket_drops"],
      metaphorFamily: unique(["edge", "friction", "threshold"]),
      rawQuotes: evidenceQuotes(
        [
          ...evidence.memoryEntries,
          ...evidence.bucketDrops.map((drop) => ({ content: drop.content })),
        ],
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "relational_patterns",
      label: "Relational patterns",
      summary: paragraphFromFragments(
        [
          collaborationStyle?.dimensionValue.summary,
          evidence.founderContext?.session_thread,
          evidence.founderContext?.current_state,
        ],
        "Relational pattern data is still light, so this remains a provisional reading.",
      ),
      confidence: clamp(0.35 + Math.min(0.4, (collaborationStyle?.confidence ?? 0.34) * 0.25 + (evidence.founderContext ? 0.18 : 0))),
      evidenceCount: Math.max(1, (collaborationStyle ? 1 : 0) + (evidence.founderContext ? 1 : 0) + memoryCount),
      signalSources: ["founder_context", "personality_profile", "memory_entries"],
      metaphorFamily: unique(["mirror", "bond", "conversation"]),
      rawQuotes: evidenceQuotes(
        [
          { summary: collaborationStyle?.dimensionValue.summary, title: collaborationStyle?.dimensionLabel },
          { summary: evidence.founderContext?.session_thread, title: "Session thread" },
        ],
      ),
      previousPortrait,
    }),
    buildDimension({
      kind: "creative_mode",
      label: "Creative mode",
      summary: paragraphFromFragments(
        [
          creativeExpression?.dimensionValue.summary,
          memoryKinds.length > 0 ? `Creative outputs appear across ${unique(memoryKinds).join(", ")}.` : "",
          input.profile.coreNarrative,
        ],
        "Creative mode is visible but still needs more direct source material before it should be treated as stable.",
      ),
      confidence: clamp(0.38 + Math.min(0.4, (creativeExpression?.confidence ?? 0.35) * 0.3 + memoryCount * 0.01 + bucketDropCount * 0.01)),
      evidenceCount: Math.max(1, memoryCount + bucketDropCount + (creativeExpression ? 1 : 0)),
      signalSources: ["personality_profile", "memory_entries", "bucket_drops"],
      metaphorFamily: unique(["architect", "loom", "studio"]),
      rawQuotes: evidenceQuotes(
        [
          { summary: creativeExpression?.dimensionValue.summary, title: creativeExpression?.dimensionLabel },
          { summary: input.profile.coreNarrative, title: "Core narrative" },
        ],
      ),
      previousPortrait,
    }),
  ];

  const weightedConfidence = dimensions.reduce((sum, dimension) => sum + dimension.confidence * Math.max(1, dimension.evidenceCount), 0);
  const totalWeights = dimensions.reduce((sum, dimension) => sum + Math.max(1, dimension.evidenceCount), 0);

  const previousSummary = previousPortrait
    ? `Updated from portrait v${previousPortrait.version} to v${version}.`
    : undefined;

  return {
    userId: input.userId,
    version,
    portraitTitle: selectPortraitTitle(input.profile, evidence, input.contextFraming),
    tagline: selectTagline(input.profile, evidence, input.contextFraming),
    dimensions,
    overallConfidence: clamp(totalWeights > 0 ? weightedConfidence / totalWeights : 0.35),
    sourceWindowStart,
    sourceWindowEnd,
    totalSourceRecords: memoryCount + bucketDropCount + gravityCount + (evidence.founderContext ? 1 : 0) + input.profile.dimensions.length,
    plkResonanceScore: evidence.founderContext?.plk_snapshot ? clamp(0.45 + Math.min(0.4, signatureText.length / 4000)) : undefined,
    deltaFromPrevious: previousPortrait ? previousSummary : undefined,
    inferenceTriggeredBy: input.inferenceTriggeredBy ?? "manual",
    inferenceRunId: input.inferenceRunId ?? stableUuidFromText([input.userId, sourceWindowStart, sourceWindowEnd, signatureText].join("|")),
  };
}
