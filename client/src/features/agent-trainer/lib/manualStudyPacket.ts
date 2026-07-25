import { unzipSync, zipSync } from "fflate";

import type { SubmitTrainingRunRequest, TrainerStudySourceRecommendation, TrainerStudySourceSummary } from "@shared/agent-trainer/schemas";

const STORAGE_NAMESPACE = "gestaltview.agent-trainer";
const MANUAL_SOURCES_KEY = `${STORAGE_NAMESPACE}.manual-sources.v2`;
const WORKSPACE_DRAFT_KEY = `${STORAGE_NAMESPACE}.workspace-draft.v2`;

export interface ManualStudySource {
  id: string;
  name: string;
  size: number;
  importedAt: string;
  text: string;
  truncated: boolean;
  tags: string[];
  fileType: string;
}

export interface ManualStudyPacketManifest {
  version: 1;
  title: string;
  description: string;
  createdAt: string;
  tags: string[];
  sourceCount: number;
  totalBytes: number;
}

export interface ManualTrainerPacket {
  manifest: ManualStudyPacketManifest;
  draft: Partial<SubmitTrainingRunRequest>;
  manualSources: ManualStudySource[];
}

export interface TrainerWorkspaceDraft {
  slug: string;
  title: string;
  domain: string;
  embodimentProfileSlug: string;
  goal: string;
  targetBehaviors: string;
  antiGoals: string;
  studyFocus: string;
  maxCycles: string;
  qualityThreshold: string;
  selectedScenarioSetIds: string[];
  selectedStudySourceFiles: string[];
  activeExperimentId: string | null;
  activeStage: string;
  showAdvanced: boolean;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota and private-mode failures.
  }
}

function sanitizeFilePart(value: string): string {
  return value
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "source";
}

function inferFileType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".txt")) return "text";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return "file";
}

function inferTags(fileName: string, text: string): string[] {
  const haystack = `${fileName} ${text}`.toLowerCase();
  const tags = new Set<string>();
  for (const candidate of [
    "resume",
    "cv",
    "memory",
    "transcript",
    "research",
    "paper",
    "brief",
    "spec",
    "profile",
    "skill",
    "timeline",
    "personality",
    "plk",
    "cadence",
    "quirk",
  ]) {
    if (haystack.includes(candidate)) {
      tags.add(candidate);
    }
  }
  return [...tags];
}

function normalizeManualStudySource(
  source: Partial<ManualStudySource> & { text: string; name: string }
): ManualStudySource {
  const safeText = source.text.trim();
  return {
    id:
      source.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `manual-source-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    name: source.name,
    size: typeof source.size === "number" ? source.size : safeText.length,
    importedAt: source.importedAt ?? new Date().toISOString(),
    text: safeText,
    truncated: Boolean(source.truncated),
    tags: Array.isArray(source.tags) ? source.tags.filter((tag) => typeof tag === "string") : [],
    fileType: source.fileType ?? inferFileType(source.name),
  };
}

export function createManualStudySourceFromFile(file: File, text: string): ManualStudySource {
  return normalizeManualStudySource({
    name: file.name,
    size: file.size,
    importedAt: new Date().toISOString(),
    text,
    truncated: text.length > 24_000,
    tags: inferTags(file.name, text),
    fileType: inferFileType(file.name),
  });
}

export function readManualStudySources(): ManualStudySource[] {
  return readJson<ManualStudySource[]>(MANUAL_SOURCES_KEY, []);
}

export function writeManualStudySources(sources: ManualStudySource[]): void {
  writeJson(MANUAL_SOURCES_KEY, sources);
}

export function readTrainerWorkspaceDraft(): TrainerWorkspaceDraft | null {
  return readJson<TrainerWorkspaceDraft | null>(WORKSPACE_DRAFT_KEY, null);
}

export function writeTrainerWorkspaceDraft(draft: TrainerWorkspaceDraft | null): void {
  if (!draft) {
    if (hasStorage()) {
      window.localStorage.removeItem(WORKSPACE_DRAFT_KEY);
    }
    return;
  }

  writeJson(WORKSPACE_DRAFT_KEY, draft);
}

export function buildManualStudySourceSummaries(sources: readonly ManualStudySource[]): TrainerStudySourceSummary[] {
  return sources.map((source) => ({
    sourceFile: source.name,
    documentType: source.fileType,
    fragmentCount: Math.max(1, Math.ceil(Math.max(1, source.text.length) / 1200)),
    sampleExcerpt: source.text.slice(0, 220) || null,
  }));
}

function toConfidenceLabel(score: number): "high" | "medium" | "low" {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function scoreSource(source: ManualStudySource, payload: SubmitTrainingRunRequest): number {
  const haystack = `${source.name} ${source.text} ${payload.goal} ${payload.studyFocus}`.toLowerCase();
  const keywords = [
    payload.slug,
    payload.title,
    payload.domain,
    ...payload.targetBehaviors,
    ...payload.antiGoals,
    ...(payload.scenarioSetIds ?? []).map((value) => value.slice(0, 8)),
  ].filter(Boolean);

  let score = 0.25;
  for (const keyword of keywords) {
    if (haystack.includes(String(keyword).toLowerCase())) {
      score += 0.12;
    }
  }

  if (source.tags.includes("resume")) score += 0.15;
  if (source.tags.includes("profile")) score += 0.1;
  if (source.tags.includes("spec")) score += 0.08;
  if (source.text.length > 2_400) score += 0.08;

  return Math.min(1, score);
}

export function buildLocalStudySourceRecommendations(
  sources: readonly ManualStudySource[],
  payload: SubmitTrainingRunRequest
): {
  recommendations: TrainerStudySourceRecommendation[];
  retrievalQuery: string;
  sourceFiles: string[];
} {
  const retrievalQuery = [
    payload.slug,
    payload.title,
    payload.domain,
    payload.goal,
    payload.studyFocus,
    payload.targetBehaviors.join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const recommendations = sources
    .map((source) => {
      const score = scoreSource(source, payload);
      return {
        sourceFile: source.name,
        title: source.name.replace(/\.[^.]+$/, ""),
        documentType: source.fileType,
        finalScore: Number(score.toFixed(3)),
        confidenceLabel: toConfidenceLabel(score),
        reason: source.tags.length > 0
          ? `Tagged ${source.tags.join(", ")} and available as a manual packet source.`
          : "Available as a manually uploaded study source.",
        fragmentCount: Math.max(1, Math.ceil(Math.max(1, source.text.length) / 1200)),
        tags: source.tags,
        fragments: [
          {
            reference: source.name,
            excerpt: source.text.slice(0, 180),
            score: Number(score.toFixed(3)),
          },
        ],
        pinned: source.tags.includes("resume") || source.tags.includes("profile"),
        selected: score >= 0.45,
      } satisfies TrainerStudySourceRecommendation;
    })
    .sort((left, right) => right.finalScore - left.finalScore);

  return {
    recommendations,
    retrievalQuery,
    sourceFiles: sources.map((source) => source.name),
  };
}

export function buildManualStudyPacketManifest(
  title: string,
  description: string,
  sources: readonly ManualStudySource[],
  tags: string[] = []
): ManualStudyPacketManifest {
  return {
    version: 1,
    title,
    description,
    createdAt: new Date().toISOString(),
    tags,
    sourceCount: sources.length,
    totalBytes: sources.reduce((sum, source) => sum + source.size, 0),
  };
}

export function buildManualStudyPacketZip(packet: ManualTrainerPacket): Blob {
  const files: Record<string, Uint8Array> = {
    "manifest.json": textEncoder.encode(JSON.stringify(packet.manifest, null, 2)),
    "draft.json": textEncoder.encode(JSON.stringify(packet.draft, null, 2)),
  };

  for (const source of packet.manualSources) {
    const fileName = `sources/${sanitizeFilePart(source.name)}.txt`;
    files[fileName] = textEncoder.encode(source.text);
  }

  const zipped = zipSync(files, { level: 6 });
  const blobBytes = new Uint8Array(zipped);
  return new Blob([blobBytes.buffer], {
    type: "application/zip",
  });
}

export async function readManualStudyPacket(file: File): Promise<Partial<ManualTrainerPacket>> {
  const rawText = await file.text();
  const isJson = file.name.toLowerCase().endsWith(".json") || rawText.trim().startsWith("{");

  if (isJson) {
    try {
      return JSON.parse(rawText) as Partial<ManualTrainerPacket>;
    } catch {
      throw new Error("The manual packet JSON could not be parsed.");
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(bytes);
  const manifest = entries["manifest.json"] ? textDecoder.decode(entries["manifest.json"]) : null;
  const draft = entries["draft.json"] ? textDecoder.decode(entries["draft.json"]) : null;
  const manualSources = Object.entries(entries)
    .filter(([path]) => path.startsWith("sources/") && path.endsWith(".txt"))
    .map(([path, content]) =>
      normalizeManualStudySource({
        id: `${path}-${content.length}`,
        name: path.replace(/^sources\//, "").replace(/\.txt$/, ""),
        size: content.length,
        importedAt: new Date().toISOString(),
        text: textDecoder.decode(content),
        truncated: false,
        tags: [],
        fileType: "text",
      })
    );

  return {
    manifest: manifest ? (JSON.parse(manifest) as ManualStudyPacketManifest) : undefined,
    draft: draft ? (JSON.parse(draft) as Partial<SubmitTrainingRunRequest>) : undefined,
    manualSources,
  };
}

export function summarizeManualStudyPacket(sources: readonly ManualStudySource[]): string {
  const summary = [
    `${sources.length} file${sources.length === 1 ? "" : "s"}`,
    `${new Set(sources.flatMap((source) => source.tags)).size} tags`,
    sources.length > 0 ? `created ${sources[0].importedAt}` : "no import timestamp",
  ];
  return summary.join(" · ");
}
