import {
  STORAGE_KEYS,
  type CaptureBlueprint,
  type CaptureOrb,
  type InnerWorldCapture,
  readApprovedOrbs,
  readBlueprints,
  readInnerWorldCaptures,
  readSavedCaptures,
  readScaffoldQueue,
} from "@/components/Scaffold";

export type RuntimeArtifactKind =
  | "capture"
  | "blueprint"
  | "draft"
  | "approved"
  | "queue"
  | "saved"
  | "profile-note"
  | "link";

export type RuntimeArtifact = {
  id: string;
  title: string;
  kind: RuntimeArtifactKind;
  sourceRoom: "home" | "sanctuary" | "blackboard" | "dynamic-inner-world" | "external-scaffold" | "creation-corner" | "profile" | "settings";
  mimeType: string;
  createdAt: string;
  summary: string;
  content: string;
  tags: string[];
  status?: string;
  surface?: string;
  objectUrl?: string;
  storageRef?: string;
  transcript?: string;
  metadata?: Record<string, unknown>;
};

export type RuntimeArtifactCounts = {
  queued: number;
  approved: number;
  saved: number;
  innerWorld: number;
  blueprints: number;
  totalCaptures: number;
};

export type RuntimeArtifactPreviewKind = "text" | "image" | "audio" | "video" | "pdf" | "markdown" | "file";

const TEXT_PREVIEW_MIME_PREFIXES = ["text/"];
const TEXT_PREVIEW_MIME_TYPES = new Set([
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/xhtml+xml",
  "application/javascript",
  "application/typescript",
  "application/csv",
  "text/csv",
  "text/markdown",
  "text/x-markdown",
]);

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function isTextPreviewableFile(mimeType?: string, fileName = ""): boolean {
  const normalizedMime = (mimeType ?? "").toLowerCase();
  const normalizedName = fileName.toLowerCase();

  if (TEXT_PREVIEW_MIME_PREFIXES.some((prefix) => normalizedMime.startsWith(prefix))) {
    return true;
  }

  if (TEXT_PREVIEW_MIME_TYPES.has(normalizedMime)) {
    return true;
  }

  return [
    ".txt",
    ".md",
    ".markdown",
    ".json",
    ".jsonl",
    ".csv",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".css",
    ".html",
    ".htm",
    ".xml",
    ".yml",
    ".yaml",
    ".svg",
    ".log",
    ".ini",
    ".toml",
    ".env",
  ].some((suffix) => normalizedName.endsWith(suffix));
}

export function previewLabelFromMimeType(mimeType?: string, fileName = ""): RuntimeArtifactPreviewKind {
  if (isTextPreviewableFile(mimeType, fileName)) {
    return mimeType?.toLowerCase().includes("markdown") || fileName.toLowerCase().endsWith(".md") ? "markdown" : "text";
  }

  return previewKindFromMimeType(mimeType, fileName);
}

export function getRuntimeArtifactCounts(): RuntimeArtifactCounts {
  const queued = readScaffoldQueue().length;
  const approved = readApprovedOrbs().length;
  const saved = readSavedCaptures().length;
  const innerWorld = readInnerWorldCaptures().length;
  const blueprints = readBlueprints().length;

  return {
    queued,
    approved,
    saved,
    innerWorld,
    blueprints,
    totalCaptures: queued + approved + saved + innerWorld,
  };
}

export function buildRuntimeArtifactFromCapture(
  capture: CaptureOrb | InnerWorldCapture,
  sourceRoom: RuntimeArtifact["sourceRoom"],
  overrides: Partial<RuntimeArtifact> = {},
): RuntimeArtifact {
  return {
    id: capture.id,
    title: capture.title,
    kind: sourceRoom === "creation-corner" ? "draft" : "capture",
    sourceRoom,
    mimeType: capture.attachment?.mimeType ?? capture.metadata.attachment?.mimeType ?? "text/plain",
    createdAt: capture.createdAt,
    summary: capture.metadata.meaning ?? capture.metadata.context ?? capture.text,
    content: capture.text,
    tags: capture.tags,
    status: capture.status,
    surface: capture.metadata.surface ?? (capture as InnerWorldCapture).surface,
    transcript: capture.transcript ?? capture.metadata.transcript,
    metadata: {
      ...capture.metadata,
      ...overrides.metadata,
    },
    ...overrides,
  };
}

export function buildRuntimeArtifactFromBlueprint(
  blueprint: CaptureBlueprint,
  sourceRoom: RuntimeArtifact["sourceRoom"] = "creation-corner",
): RuntimeArtifact {
  return {
    id: blueprint.id,
    title: blueprint.title,
    kind: blueprint.status === "draft" ? "draft" : "blueprint",
    sourceRoom,
    mimeType: "text/markdown",
    createdAt: blueprint.createdAt,
    summary: blueprint.summary,
    content: blueprint.outputs.markdown,
    tags: blueprint.tags,
    status: blueprint.status,
    metadata: {
      captureCount: blueprint.captureCount,
      sourceOrbIds: blueprint.sourceOrbIds,
      outputs: blueprint.outputs,
      updatedAt: blueprint.updatedAt,
    },
  };
}

export function previewKindFromMimeType(mimeType: string | undefined, fileName = ""): RuntimeArtifactPreviewKind {
  const normalizedMime = (mimeType ?? "").toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (normalizedMime.startsWith("image/")) return "image";
  if (normalizedMime.startsWith("audio/")) return "audio";
  if (normalizedMime.startsWith("video/")) return "video";
  if (normalizedMime === "application/pdf" || lowerName.endsWith(".pdf")) return "pdf";
  if (normalizedMime.includes("markdown") || lowerName.endsWith(".md")) return "markdown";
  if (normalizedMime.startsWith("text/")) return "text";
  return "file";
}

export function storageKeysForRuntimeSummary(): string[] {
  return [
    STORAGE_KEYS.scaffoldQueue,
    STORAGE_KEYS.scaffoldApproved,
    STORAGE_KEYS.savedCaptures,
    STORAGE_KEYS.innerWorld,
    STORAGE_KEYS.blueprints,
  ];
}
