// api/_lib/profileIngestion.ts
import { createHash, randomUUID } from "node:crypto";

import { buildPlkSystemPrompt } from "../../shared/llm/plk.js";
import type {
  PersonalityDimension,
  PersonalityProfile,
  ProfileIngestionRequest,
  ProfileIngestionResponse,
  ProfileSourceType,
} from "../../shared/profileIngestion.js";
import { insertRow, upsertMemoryEntry } from "./supabase.js";

export type NormalizedSource = {
  sourceType: ProfileSourceType;
  sourceId: string | null;
  sourceBucket: string;
  rawText: string;
  processingNotes: string;
};

const SOURCE_TYPE_ALLOWLIST = new Set<ProfileSourceType>([
  "journal",
  "transcript",
  "resume",
  "music_dna",
  "profile_upload",
  "lived_experience",
]);

const DIMENSION_BLUEPRINTS = [
  {
    key: "creative_expression",
    label: "Creative expression",
    traits: ["makes meaning through artifacts", "responds to image and language", "iterates in public"],
    keywords: ["create", "write", "music", "art", "design", "story", "build", "make", "song", "visual"],
    // Profile section headers that are authoritative for this dimension
    profileSections: ["PERSONAL LANGUAGE KEY", "INTERESTS", "CREATIVE", "PLK"],
  },
  {
    key: "collaboration_style",
    label: "Collaboration style",
    traits: ["prefers clear context", "values continuity", "works best with concrete next steps"],
    keywords: ["team", "collaborate", "together", "feedback", "partner", "mentor", "work with", "review"],
    profileSections: ["AI COLLABORATOR", "DI COLLABORATION", "COLLABORATION", "VOICE CALIBRATION"],
  },
  {
    key: "resilience_pattern",
    label: "Resilience pattern",
    traits: ["keeps moving through ambiguity", "uses lived experience as signal", "recovers through structure"],
    keywords: ["hard", "survive", "recover", "challenge", "struggle", "adapt", "again", "through"],
    profileSections: ["FOUNDER SURVIVAL", "SOMATIC", "BIOGRAPHY", "NEAR-MORTALITY", "RECOVERY"],
  },
  {
    key: "learning_style",
    label: "Learning style",
    traits: ["learns by building", "needs examples close to the work", "integrates through repetition"],
    keywords: ["learn", "study", "practice", "understand", "teach", "example", "experiment", "prototype"],
    profileSections: ["NEURODEVELOPMENTAL", "COGNITIVE", "EDUCATION", "LEARNING", "ADHD"],
  },
  {
    key: "conflict_resolution",
    label: "Conflict resolution",
    traits: ["seeks explicit expectations", "prefers repair over avoidance", "responds to direct language"],
    keywords: ["conflict", "boundary", "repair", "direct", "trust", "tension", "honest", "clear"],
    profileSections: ["CONSTITUTIONAL INVARIANTS", "CONFLICT", "RELATIONAL", "VOICE CALIBRATION"],
  },
  {
    key: "music_dna_resonance",
    label: "Music DNA resonance",
    traits: ["uses music as autobiographical memory", "tracks emotion through sound", "links preference to identity"],
    keywords: ["music", "song", "artist", "album", "sound", "playlist", "lyric", "guitar", "voice"],
    profileSections: ["CULTURAL ANCHORS", "MUSIC", "INTERESTS"],
  },
] as const;

// ─── Section-aware profile parser ─────────────────────────────────────────────

/**
 * Splits a GestaltView profile document into named sections by ## headers.
 * Returns a Map of uppercased section title → section body text.
 */
function extractProfileSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  // Match ## and ### level headers in the GestaltView profile format
  const headerRegex = /^#{1,3}\s+(.+)$/gm;
  const lines = text.split("\n");
  let currentHeader = "__PREAMBLE__";
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^#{1,3}\s+(.+)$/);
    if (match) {
      if (currentLines.length > 0) {
        sections.set(currentHeader.toUpperCase().trim(), currentLines.join("\n").trim());
      }
      currentHeader = match[1].replace(/[*`]/g, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0) {
    sections.set(currentHeader.toUpperCase().trim(), currentLines.join("\n").trim());
  }

  return sections;
}

/**
 * For a given dimension blueprint, find the most relevant section text
 * from the profile document. Falls back to full text if no section matches.
 */
function getSectionTextForDimension(
  sections: Map<string, string>,
  profileSections: readonly string[],
  fullText: string,
): string {
  const matched: string[] = [];
  for (const [header, body] of sections.entries()) {
    if (profileSections.some((target) => header.includes(target.toUpperCase()))) {
      matched.push(body);
    }
  }
  // Always include the full text for keyword scoring, but use matched sections
  // as the primary evidence source for summaries
  return matched.length > 0 ? matched.join("\n\n") : fullText;
}

/**
 * Strip JSON blocks, METADATA fences, and code fences from text before
 * using it as evidence. These are structural artifacts in the profile document
 * and should not appear in dimension summaries.
 */
function stripStructuralArtifacts(text: string): string {
  return text
    // Remove ```json ... ``` blocks (METADATA, schema blocks)
    .replace(/```[\s\S]*?```/g, "")
    // Remove raw JSON objects at the start of lines
    .replace(/^\s*\{[\s\S]*?\}\s*$/gm, "")
    // Remove markdown bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    // Remove bullet point markers
    .replace(/^[-*•]\s+/gm, "")
    // Collapse excess whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stableId(prefix: string, value: string): string {
  const hash = createHash("sha256").update(value).digest("hex").slice(0, 24);
  return `${prefix}-${hash}`;
}

function stableUuid(value: string): string {
  const hash = createHash("sha256").update(value).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `8${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

function looksLikeRawText(value: string): boolean {
  return /\s/.test(value.trim()) || value.length > 80;
}

function normalizeSourceType(sourceType: ProfileSourceType): ProfileSourceType {
  return SOURCE_TYPE_ALLOWLIST.has(sourceType) ? sourceType : "profile_upload";
}

function normalizeTextList(
  sourceType: ProfileSourceType,
  sourceBucket: string,
  values: string[] | undefined,
): NormalizedSource[] {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value, index) => ({
      sourceType,
      sourceId: looksLikeRawText(value) ? null : value,
      sourceBucket,
      rawText: looksLikeRawText(value) ? value : "",
      processingNotes: looksLikeRawText(value)
        ? "Raw text supplied directly in request."
        : `Source id supplied for later Supabase hydration: ${sourceBucket}:${value || index}`,
    }));
}

export function normalizeProfileSources(request: ProfileIngestionRequest): NormalizedSource[] {
  const sources: NormalizedSource[] = [
    ...normalizeTextList("journal", "bucket_drops", request.sources.journals),
    ...normalizeTextList("transcript", "transcripts", request.sources.transcripts),
  ];

  const resume = request.sources.resume?.trim();
  if (resume) {
    sources.push({
      sourceType: "resume",
      sourceId: looksLikeRawText(resume) ? null : resume,
      sourceBucket: "documents",
      rawText: looksLikeRawText(resume) ? resume : "",
      processingNotes: looksLikeRawText(resume)
        ? "Resume text supplied directly in request."
        : `Resume document id supplied for later hydration: ${resume}`,
    });
  }

  const musicDNA = request.sources.musicDNA?.trim();
  if (musicDNA) {
    sources.push({
      sourceType: "music_dna",
      sourceId: looksLikeRawText(musicDNA) ? null : musicDNA,
      sourceBucket: "musical_dna_analyses",
      rawText: looksLikeRawText(musicDNA) ? musicDNA : "",
      processingNotes: looksLikeRawText(musicDNA)
        ? "Music DNA text supplied directly in request."
        : `Music DNA analysis id supplied for later hydration: ${musicDNA}`,
    });
  }

  const profileUpload = request.sources.profileUpload;
  if (profileUpload?.content.trim()) {
    sources.push({
      sourceType: "profile_upload",
      sourceId: null,
      sourceBucket: "profile_uploads",
      rawText: profileUpload.content.trim(),
      processingNotes: `Uploaded profile document supplied directly in request: ${profileUpload.fileName}`,
    });
  }

  const livedExperience = request.sources.livedExperience;
  if (livedExperience?.narrative?.trim()) {
    const additions = [
      livedExperience.narrative,
      ...(livedExperience.keyTurningPoints ?? []).map((item) => `Turning point: ${item}`),
      ...(livedExperience.currentChallenges ?? []).map((item) => `Current challenge: ${item}`),
    ];
    sources.push({
      sourceType: "lived_experience",
      sourceId: null,
      sourceBucket: "profile_ingestion_request",
      rawText: additions.join("\n"),
      processingNotes: "Lived-experience narrative supplied directly in request.",
    });
  }

  return sources;
}

/**
 * Split text into evidence fragments. Operates on already-cleaned,
 * section-isolated text — NOT the full document blob.
 */
function splitEvidence(text: string): string[] {
  return stripStructuralArtifacts(text)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length >= 24 && fragment.length <= 400)
    // Reject fragments that look like JSON, headers, or metadata artifacts
    .filter((fragment) => !fragment.startsWith("{") && !fragment.startsWith("#") && !/^[A-Z_]+:/.test(fragment))
    .slice(0, 24);
}

function scoreBlueprint(text: string, keywords: readonly string[]): number {
  const lower = text.toLowerCase();
  const matches = keywords.filter((keyword) => lower.includes(keyword)).length;
  return Math.min(1, 0.28 + matches * 0.12);
}

/**
 * Generate a clean, dimension-specific summary from section-isolated evidence.
 * Prioritizes sentences that directly name a trait or behavioral pattern
 * over sentences that merely contain a matching keyword.
 */
function buildDimensionSummary(
  blueprint: (typeof DIMENSION_BLUEPRINTS)[number],
  evidence: string[],
  sectionText: string,
): string {
  if (evidence.length > 0) {
    // Prefer the evidence fragment that most directly describes behavior
    // (contains a verb + pattern language rather than just a keyword match)
    const behavioral = evidence.find(
      (frag) => /\b(learn|build|create|recover|seek|prefer|use|track|respond|value)\b/i.test(frag),
    );
    return behavioral ?? evidence[0];
  }

  // Fallback: extract the first clean sentence from section text that isn't a header
  const fallbackSentences = stripStructuralArtifacts(sectionText)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length >= 30 && s.length <= 300)
    .filter((s) => !s.startsWith("#") && !s.startsWith("{"));

  if (fallbackSentences.length > 0) {
    return fallbackSentences[0];
  }

  return `${blueprint.label} is present, but needs more directly quoted source material before it should steer major decisions.`;
}

function makeDimension(
  runId: string,
  blueprint: (typeof DIMENSION_BLUEPRINTS)[number],
  sources: NormalizedSource[],
  allText: string,
  profileSections: Map<string, string>,
): PersonalityDimension {
  const sourceTypes = Array.from(new Set(sources.map((source) => source.sourceType)));

  // Use section-isolated text for evidence extraction when available
  const sectionText = getSectionTextForDimension(profileSections, blueprint.profileSections, allText);
  const cleanSectionText = stripStructuralArtifacts(sectionText);

  // Score uses the full text (broader signal) but evidence comes from section text only
  const confidence = scoreBlueprint(allText, blueprint.keywords);
  const evidence = splitEvidence(cleanSectionText)
    .filter((fragment) =>
      blueprint.keywords.some((keyword) => fragment.toLowerCase().includes(keyword)),
    )
    .slice(0, 3);

  const summary = buildDimensionSummary(blueprint, evidence, cleanSectionText);

  return {
    dimensionId: stableId("pdim", `${runId}:${blueprint.key}`),
    dimensionKey: blueprint.key,
    dimensionLabel: blueprint.label,
    dimensionValue: {
      summary,
      traits: [...blueprint.traits],
      sourceTypes,
    },
    evidenceFragments: evidence,
    salience: Number(Math.max(0.2, Math.min(0.96, confidence)).toFixed(2)),
    mutationClass:
      blueprint.key === "creative_expression" || blueprint.key === "resilience_pattern" ? "stable" : "dynamic",
    confidence: Number(confidence.toFixed(2)),
  };
}

export function synthesizePersonalityProfile(runId: string, sources: NormalizedSource[]): PersonalityProfile {
  const text = sources.map((source) => source.rawText).filter(Boolean).join("\n\n");

  // Build section map from any profile_upload source (the structured document)
  const profileUploadText =
    sources
      .filter((source) => source.sourceType === "profile_upload")
      .map((source) => source.rawText)
      .join("\n\n") || text;
  const profileSections = extractProfileSections(profileUploadText);

  const dimensions = DIMENSION_BLUEPRINTS
    .map((blueprint) => makeDimension(runId, blueprint, sources, text, profileSections))
    .filter((dimension) => dimension.confidence >= 0.34 || dimension.evidenceFragments.length > 0)
    .filter((dimension) => dimension.salience < 0.75 || dimension.evidenceFragments.length > 0)
    .sort((left, right) => right.salience - left.salience)
    .slice(0, 6);

  const sourceLabels = Array.from(new Set(sources.map((source) => source.sourceType.replace(/_/g, " "))));
  const keyThemes = dimensions.slice(0, 4).map((dimension) => dimension.dimensionLabel);
  const unresolvedTensions =
    sources.some((source) => !source.rawText && source.sourceId)
      ? ["Some supplied source ids still need live table hydration before confidence should be treated as final."]
      : [];

  return {
    dimensions,
    keyThemes,
    unresolvedTensions,
    coreNarrative:
      sourceLabels.length > 0
        ? `This profile is synthesized from ${sourceLabels.join(", ")} and preserves evidence as quoted fragments rather than assigning a personality type.`
        : "This profile needs at least one source before it can form a factual identity narrative.",
  };
}

async function persistProfileRun(
  runId: string,
  request: ProfileIngestionRequest,
  sources: NormalizedSource[],
  profile: PersonalityProfile,
): Promise<"stored" | "skipped" | "partial"> {
  let attempted = 0;
  let stored = 0;
  const now = new Date().toISOString();
  const confidenceScores = Object.fromEntries(
    profile.dimensions.map((dimension) => [dimension.dimensionKey, dimension.confidence]),
  );

  const tryInsert = async (table: string, payload: Record<string, unknown>) => {
    attempted += 1;
    try {
      const ok = await insertRow(table, payload);
      if (ok) stored += 1;
    } catch (error) {
      console.warn(`[profileIngestion] ${table} persistence skipped`, error);
    }
  };

  await tryInsert("user_profile_ingestion_runs", {
    run_id: runId,
    user_id: request.userId,
    status: "complete",
    input_sources: request.sources,
    extracted_attributes: {
      dimensions: profile.dimensions.map((dimension) => ({
        key: dimension.dimensionKey,
        evidenceCount: dimension.evidenceFragments.length,
      })),
    },
    personality_profile: profile,
    confidence_scores: confidenceScores,
    processed_at: now,
  });

  for (const source of sources) {
    await tryInsert("profile_ingestion_sources", {
      source_link_id: randomUUID(),
      run_id: runId,
      source_type: normalizeSourceType(source.sourceType),
      source_id: source.sourceId,
      source_bucket: source.sourceBucket,
      raw_text: source.rawText || null,
      processing_notes: source.processingNotes,
    });
  }

  for (const dimension of profile.dimensions) {
    await tryInsert("user_personality_dimensions", {
      dimension_id: stableUuid(`${runId}:${dimension.dimensionKey}`),
      run_id: runId,
      dimension_key: dimension.dimensionKey,
      dimension_label: dimension.dimensionLabel,
      dimension_value: dimension.dimensionValue,
      evidence_fragments: dimension.evidenceFragments,
      salience: dimension.salience,
      mutation_class: dimension.mutationClass,
    });
  }

  if (attempted === 0 || stored === 0) return "skipped";
  return stored === attempted ? "stored" : "partial";
}

function isMeaningfullyComplete(
  profile: PersonalityProfile,
  sourcesProcessed: number,
  persistence: "stored" | "skipped" | "partial",
): boolean {
  return (
    sourcesProcessed > 0 &&
    profile.dimensions.length > 0 &&
    (persistence === "stored" || persistence === "skipped") &&
    profile.dimensions.every((dimension) => dimension.salience < 0.75 || dimension.evidenceFragments.length > 0)
  );
}

async function seedPlkFragments(userId: string, runId: string, profile: PersonalityProfile): Promise<number> {
  let count = 0;

  for (const dimension of profile.dimensions) {
    const content = buildPlkSystemPrompt(
      `${dimension.dimensionLabel}: ${dimension.dimensionValue.summary}`,
      profile.coreNarrative,
    );
    const contentHash = createHash("sha256")
      .update(`${userId}:${dimension.dimensionKey}:${content}`)
      .digest("hex");
    const row = await upsertMemoryEntry(userId, {
      scope: "profile",
      kind: "semantic",
      title: `Profile dimension: ${dimension.dimensionLabel}`,
      summary: dimension.dimensionValue.summary,
      content,
      content_hash: contentHash,
      source: "profile_ingestion",
      source_ref: runId,
      tags: ["profile-ingestion", dimension.dimensionKey],
      metadata: {
        confidence: dimension.confidence,
        salience: dimension.salience,
        evidenceFragments: dimension.evidenceFragments,
      },
      importance: dimension.salience,
      pinned: false,
    });
    if (row) count += 1;
  }

  return count;
}

export async function runProfileIngestion(
  request: ProfileIngestionRequest,
  options: { persist?: boolean } = {},
): Promise<ProfileIngestionResponse> {
  const startedAt = Date.now();
  const runId = randomUUID();
  const sources = normalizeProfileSources(request);
  const hasRawInput = sources.some((source) => source.rawText.trim());

  if (!request.userId?.trim()) {
    throw new Error("userId is required");
  }

  if (sources.length === 0 || !hasRawInput) {
    throw new Error("At least one raw profile source is required for ingestion");
  }

  const profile = synthesizePersonalityProfile(runId, sources);
  const persistence =
    options.persist === false ? "skipped" : await persistProfileRun(runId, request, sources, profile);
  const plkFragmentsCreated =
    request.includeInPLK === false || options.persist === false
      ? 0
      : await seedPlkFragments(request.userId, runId, profile).catch(() => 0);
  const averageConfidence =
    profile.dimensions.reduce((total, dimension) => total + dimension.confidence, 0) /
    Math.max(1, profile.dimensions.length);

  return {
    runId,
    status: isMeaningfullyComplete(profile, sources.length, persistence) ? "complete" : "processing",
    personalityProfile: profile,
    metadata: {
      sourcesProcessed: sources.length,
      confidenceScore: Number(averageConfidence.toFixed(2)),
      processingTimeMs: Date.now() - startedAt,
      plkFragmentsCreated,
      persistence,
    },
  };
}
