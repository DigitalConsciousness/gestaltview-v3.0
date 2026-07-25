import type { ArtifactDestination, ArtifactType, SynthesisStyle } from "../gen-engine/types.js";
import type { ArtifactKind, CodexArtifact } from "./contracts.js";
import { CodexArtifactSchema } from "./contracts.js";
import { createManifestItem } from "./manifest.js";
import { getAllowedExportFormats, getTemplateKey } from "./router.js";

export type CreationCornerLegacyArtifactType =
  | "markdown"
  | "blueprint_json"
  | "blueprint_md"
  | "image_prompt"
  | "image"
  | "audio_prompt"
  | "audio"
  | "share_card"
  | "marketing_copy"
  | "session_recap"
  | "mind_map"
  | "agent_prompt"
  | "code";

export type CreationCornerLegacySynthesisStyle =
  | "preserve_voice"
  | "compress"
  | "expand"
  | "reframe"
  | "structural"
  | "narrative";

export type CreationCornerLegacyDestination =
  | "creation_corner"
  | "dynamic_inner_world"
  | "scaffold_pending"
  | "download_only"
  | "gate_draft";

export const DESTINATION_BLOCKLIST: Partial<
  Record<CreationCornerLegacyArtifactType, CreationCornerLegacyDestination[]>
> = {
  session_recap: ["dynamic_inner_world"],
  agent_prompt: ["dynamic_inner_world"],
  marketing_copy: ["dynamic_inner_world"],
};

export function isDestinationAllowed(
  artifactType: CreationCornerLegacyArtifactType,
  destination: CreationCornerLegacyDestination,
): boolean {
  return !(DESTINATION_BLOCKLIST[artifactType] ?? []).includes(destination);
}

export function resolveDestination(
  artifactType: CreationCornerLegacyArtifactType,
  requested: CreationCornerLegacyDestination,
): CreationCornerLegacyDestination {
  return isDestinationAllowed(artifactType, requested) ? requested : "creation_corner";
}

const ANONYMOUS_CODEX_USER_ID = "00000000-0000-4000-8000-000000000000";
const MAX_CODEX_TITLE_LENGTH = 160;
const MAX_MARKDOWN_BLOCK_LENGTH = 20_000;
const MAX_BLOCKS_BY_KIND: Partial<Record<ArtifactKind, number>> = {
  blueprint: 80,
  report_document: 120,
  session_recap: 50,
};

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `00000000-0000-4000-8000-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`;
}

function hashHex(value: string, length = 64): string {
  let hashA = 2166136261;
  let hashB = 16777619;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 16777619);
    hashB ^= code + index;
    hashB = Math.imul(hashB, 2166136261);
  }

  const seed = `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0).toString(16).padStart(8, "0")}`;
  return seed.repeat(Math.ceil(length / seed.length)).slice(0, length);
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug.length >= 3 ? slug : "codex-artifact";
}

function clampString(value: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength).trimEnd() || trimmed.slice(0, maxLength);
}

function boundedTitle(value: string): string {
  return clampString(value, MAX_CODEX_TITLE_LENGTH) || "Creation Corner Artifact";
}

function boundedText(value: string, fallback: string, maxLength: number): string {
  return clampString(value || fallback, maxLength) || fallback;
}

function markdownSections(content: string, fallback: string, maxBlocks: number) {
  const value = content.trim() || fallback;
  const sections = [];

  for (let offset = 0; offset < value.length && sections.length < maxBlocks; offset += MAX_MARKDOWN_BLOCK_LENGTH) {
    sections.push({
      type: "markdown" as const,
      id: `section-${sections.length + 1}`,
      markdown: value.slice(offset, offset + MAX_MARKDOWN_BLOCK_LENGTH),
    });
  }

  return sections.length > 0 ? sections : [{ type: "markdown" as const, id: "section-1", markdown: fallback }];
}

function isUuid(value: string | undefined): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function mapCreationCornerArtifactType(value: CreationCornerLegacyArtifactType | undefined): ArtifactType {
  switch (value) {
    case "blueprint_json":
      return "blueprint-json";
    case "blueprint_md":
      return "blueprint-markdown";
    case "image":
    case "image_prompt":
      return "image-prompt";
    case "audio":
    case "audio_prompt":
      return "agent-prompt";
    case "share_card":
      return "share-card";
    case "marketing_copy":
      return "marketing-copy";
    case "session_recap":
      return "session-recap";
    case "mind_map":
      return "mind-map";
    case "agent_prompt":
      return "agent-prompt";
    case "code":
      return "code";
    case "markdown":
    default:
      return "markdown";
  }
}

export function mapCreationCornerStyle(value: CreationCornerLegacySynthesisStyle | undefined): SynthesisStyle {
  switch (value) {
    case "compress":
      return "convergent";
    case "expand":
      return "divergent";
    case "reframe":
      return "gentle-reflective";
    case "structural":
      return "technical";
    case "narrative":
      return "founder-voice";
    case "preserve_voice":
    default:
      return "faithful";
  }
}

export function mapCreationCornerDestination(value: CreationCornerLegacyDestination | undefined): ArtifactDestination {
  switch (value) {
    case "creation_corner":
      return "creation-corner";
    case "dynamic_inner_world":
      return "dynamic-inner-world";
    case "scaffold_pending":
      return "external-scaffold-pending";
    case "gate_draft":
      return "gate-package-draft";
    case "download_only":
    default:
      return "download-only";
  }
}

export function mapCreationCornerCodexKind(value: CreationCornerLegacyArtifactType | undefined): ArtifactKind {
  switch (value) {
    case "session_recap":
      return "session_recap";
    case "mind_map":
      return "mind_map";
    case "share_card":
    case "marketing_copy":
    case "image":
    case "image_prompt":
      return "share_card";
    case "code":
      return "code_module";
    case "audio":
    case "audio_prompt":
      return "audio_narration";
    case "blueprint_json":
    case "blueprint_md":
      return "blueprint";
    case "markdown":
    default:
      return "report_document";
  }
}

function codexBodyForKind(kind: ArtifactKind, title: string, content: string): CodexArtifact["body"] {
  const sections = markdownSections(content, title, MAX_BLOCKS_BY_KIND[kind] ?? 1);
  const label = boundedText(title, "Creation Corner Artifact", 120);

  switch (kind) {
    case "session_recap":
      return {
        summary: boundedText(content, title, 5_000),
        decisions: [],
        nextActions: [],
        openLoops: [],
        sections,
      };
    case "blueprint":
      return {
        summary: boundedText(content, title, 5_000),
        principles: [],
        sections,
        risks: [],
      };
    case "mind_map":
      return {
        summary: boundedText(content, title, 3_000),
        nodes: [{ id: "node-1", label, sourceIds: ["creation-corner"] }],
        edges: [],
      };
    case "share_card":
      return {
        headline: title,
        subhead: clampString(content, 300),
        theme: "aurora",
      };
    case "code_module":
      return {
        language: "typescript",
        entryFile: "artifact.ts",
        files: [{ path: "artifact.ts", contents: content || `export const title = ${JSON.stringify(title)};` }],
        notes: [],
      };
    case "audio_narration":
      return {
        script: boundedText(content, title, 20_000),
        segments: [{ id: "segment-1", text: boundedText(content, title, 2_000), sourceIds: ["creation-corner"] }],
      };
    case "spatial_scene":
      return {
        sceneVersion: "1",
        nodes: [{
          id: "node-1",
          label,
          position: [0, 0, 0],
          radius: 8,
          nodeType: "artifact",
          sourceIds: ["creation-corner"],
        }],
        edges: [],
        camera: {
          position: [0, 10, 28],
          target: [0, 0, 0],
        },
      };
    case "report_document":
    default:
      return {
        summary: boundedText(content, title, 5_000),
        sections,
        appendix: [],
      };
  }
}

export function buildCreationCornerCodexArtifact(params: {
  legacyType: CreationCornerLegacyArtifactType | undefined;
  userId: string | undefined;
  title: string;
  content: string;
  sourceText: string;
  now?: string;
  id?: string;
}): CodexArtifact {
  const kind = mapCreationCornerCodexKind(params.legacyType);
  const now = params.now ?? new Date().toISOString();
  const title = boundedTitle(params.title);
  const exportFormats = getAllowedExportFormats(kind);
  const artifact = {
    id: params.id ?? createId(),
    contractVersion: "codex.v1",
    kind,
    title,
    slug: slugify(title),
    userId: isUuid(params.userId) ? params.userId : ANONYMOUS_CODEX_USER_ID,
    securityClass: "private",
    templateKey: getTemplateKey(kind),
    templateVersion: "v1",
    createdAt: now,
    updatedAt: now,
    sourceIds: ["creation-corner"],
    provenance: [{
      sourceType: "capture",
      sourceId: "creation-corner",
      hash: hashHex(params.sourceText, 64),
      transform: "synthesize",
      confidence: 0.72,
    }],
    exports: exportFormats.map((format) => createManifestItem(format)),
    meta: {
      legacyArtifactType: params.legacyType ?? "markdown",
      previewOnly: false,
    },
    body: codexBodyForKind(kind, title, params.content),
  };

  return CodexArtifactSchema.parse(artifact);
}
