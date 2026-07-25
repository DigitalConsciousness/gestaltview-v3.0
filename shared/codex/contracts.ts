import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

const Uuid = z.string().uuid();
const IsoDatetime = z.string().datetime({ offset: true });

export const ArtifactKind = z.enum([
  "session_recap",
  "blueprint",
  "report_document",
  "mind_map",
  "share_card",
  "code_module",
  "spatial_scene",
  "audio_narration",
  "profile_portrait",
]);
export type ArtifactKind = z.infer<typeof ArtifactKind>;

export const SecurityClass = z.enum(["private", "workspace", "public"]);
export type SecurityClass = z.infer<typeof SecurityClass>;

export const ExportFormat = z.enum(["html", "pdf", "png", "mp3", "wav", "gltf", "json", "zip"]);
export type ExportFormat = z.infer<typeof ExportFormat>;

// ─── Provenance ───────────────────────────────────────────────────────────────

const ProvenanceEdgeSchema = z.object({
  sourceType: z.enum(["capture", "artifact", "file", "session", "message"]),
  sourceId: z.string().min(1).max(128),
  hash: z.string().regex(/^[a-f0-9]{16,128}$/i),
  transform: z.enum(["preserve", "extract", "summarize", "synthesize", "render", "export"]),
  confidence: z.number().min(0).max(1).optional(),
});

// ─── Export manifest ──────────────────────────────────────────────────────────

export const ExportManifestItemSchema = z.object({
  format: ExportFormat,
  status: z.enum(["pending", "ready", "failed"]),
  storagePath: z.string().min(1).max(512).optional(),
  mimeType: z.string().min(1).max(120).optional(),
  bytes: z.number().int().nonnegative().optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
});
export type ExportManifestItem = z.infer<typeof ExportManifestItemSchema>;

export const ExportFormatSchema = ExportFormat;

// ─── Block types (shared across multiple bodies) ──────────────────────────────

const MarkdownBlockSchema = z.strictObject({
  type: z.literal("markdown"),
  id: z.string().min(1).max(64),
  markdown: z.string().min(1),
});

const CalloutBlockSchema = z.strictObject({
  type: z.literal("callout"),
  id: z.string().min(1).max(64),
  tone: z.enum(["info", "warning", "success", "error", "highlight"]),
  title: z.string().max(120).optional(),
  text: z.string().min(1).max(2_000),
});

const TimelineBlockSchema = z.strictObject({
  type: z.literal("timeline"),
  id: z.string().min(1).max(64),
  items: z.array(z.strictObject({
    at: z.string().min(1).max(80),
    title: z.string().min(1).max(200),
    text: z.string().max(1_000).optional(),
  })).min(1).max(100),
});

const ListBlockSchema = z.strictObject({
  type: z.literal("list"),
  id: z.string().min(1).max(64),
  ordered: z.boolean(),
  items: z.array(z.string().min(1).max(500)).min(1).max(100),
});

const BlockSchema = z.discriminatedUnion("type", [
  MarkdownBlockSchema,
  CalloutBlockSchema,
  TimelineBlockSchema,
  ListBlockSchema,
]);

// ─── Base envelope ────────────────────────────────────────────────────────────

const BaseArtifactSchema = z.object({
  id: Uuid,
  contractVersion: z.literal("codex.v1"),
  kind: ArtifactKind,
  title: z.string().min(1).max(160),
  slug: z.string().regex(/^[a-z0-9-]{3,120}$/),
  userId: Uuid,
  workspaceId: Uuid.optional(),
  securityClass: SecurityClass,
  templateKey: z.string().min(1).max(80),
  templateVersion: z.string().regex(/^v\d+$/),
  createdAt: IsoDatetime,
  updatedAt: IsoDatetime,
  sourceIds: z.array(z.string().min(1).max(128)).min(1).max(256),
  provenance: z.array(ProvenanceEdgeSchema).min(1).max(512),
  exports: z.array(ExportManifestItemSchema).max(16).default([]),
  meta: z.record(z.string(), z.unknown()).default({}),
});

// ─── Body schemas ─────────────────────────────────────────────────────────────

const SessionRecapBodySchema = z.strictObject({
  summary: z.string().min(1).max(5_000),
  decisions: z.array(z.string().min(1).max(500)).max(50),
  nextActions: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    owner: z.string().max(120).optional(),
    text: z.string().min(1).max(500),
    dueAt: IsoDatetime.optional(),
  })).max(50),
  openLoops: z.array(z.string().min(1).max(500)).max(50),
  sections: z.array(BlockSchema).min(1).max(50),
});

const BlueprintBodySchema = z.strictObject({
  summary: z.string().min(1).max(5_000),
  principles: z.array(z.string().min(1).max(500)).max(50),
  sections: z.array(BlockSchema).min(1).max(80),
  risks: z.array(z.string().max(500)).max(30),
});

const ReportDocumentBodySchema = z.strictObject({
  summary: z.string().min(1).max(5_000),
  sections: z.array(BlockSchema).min(1).max(120),
  appendix: z.array(z.string().max(2_000)).max(20),
});

const MindMapBodySchema = z.strictObject({
  summary: z.string().min(1).max(3_000),
  nodes: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(120),
    parentId: z.string().max(64).optional(),
    sourceIds: z.array(z.string().min(1).max(128)).min(1).max(32),
  })).min(1).max(500),
  edges: z.array(z.strictObject({
    from: z.string().min(1).max(64),
    to: z.string().min(1).max(64),
    label: z.string().max(120).optional(),
  })).max(1_000),
});

const ShareCardBodySchema = z.strictObject({
  headline: z.string().min(1).max(120),
  subhead: z.string().max(300).optional(),
  theme: z.string().min(1).max(64),
});

const CodeModuleBodySchema = z.strictObject({
  language: z.string().min(1).max(40),
  entryFile: z.string().min(1).max(120),
  files: z.array(z.strictObject({
    path: z.string().min(1).max(200),
    contents: z.string().min(1),
  })).min(1).max(50),
  notes: z.array(z.string().max(1_000)).max(20),
});

const SpatialSceneBodySchema = z.strictObject({
  sceneVersion: z.literal("1"),
  nodes: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    label: z.string().min(1).max(120),
    position: z.tuple([z.number(), z.number(), z.number()]),
    radius: z.number().positive().max(100),
    nodeType: z.enum(["artifact", "capture", "cluster", "callout"]),
    sourceIds: z.array(z.string().min(1).max(128)).min(1).max(32),
  })).min(1).max(500),
  edges: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    from: z.string().min(1).max(64),
    to: z.string().min(1).max(64),
    weight: z.number().min(0).max(1),
    label: z.string().max(120).optional(),
  })).max(1_000),
  camera: z.strictObject({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
  }),
});

const AudioNarrationBodySchema = z.strictObject({
  script: z.string().min(1).max(20_000),
  segments: z.array(z.strictObject({
    id: z.string().min(1).max(64),
    text: z.string().min(1).max(2_000),
    sourceIds: z.array(z.string().min(1).max(128)).max(32),
    voiceId: z.string().max(80).optional(),
  })).min(1).max(200),
  voiceId: z.string().max(80).optional(),
});

const PortraitDimensionKindSchema = z.enum([
  "cognitive_style",
  "linguistic_signature",
  "energy_rhythm",
  "capture_behavior",
  "synthesis_readiness",
  "emotional_texture",
  "identity_anchors",
  "growth_edges",
  "relational_patterns",
  "creative_mode",
]);

const PortraitDimensionSchema = z.strictObject({
  kind: PortraitDimensionKindSchema,
  label: z.string().min(1).max(80),
  summary: z.string().min(10).max(800),
  confidence: z.number().min(0).max(1),
  evidenceCount: z.number().int().min(0),
  signalSources: z.array(z.string().min(1).max(80)).min(1).max(8),
  metaphorFamily: z.array(z.string().min(1).max(80)).max(5).optional(),
  rawQuotes: z.array(z.string().min(1).max(300)).max(3).optional(),
  delta: z.string().max(400).optional(),
});

const ProfilePortraitBodySchema = z.strictObject({
  portraitTitle: z.string().min(1).max(120),
  tagline: z.string().min(1).max(280),
  dimensions: z.array(PortraitDimensionSchema).length(10),
  overallConfidence: z.number().min(0).max(1),
  sourceWindowStart: IsoDatetime,
  sourceWindowEnd: IsoDatetime,
  totalSourceRecords: z.number().int().min(0),
  plkResonanceScore: z.number().min(0).max(1).optional(),
  deltaFromPrevious: z.string().max(600).optional(),
  inferenceTriggeredBy: z.enum(["cadence", "threshold", "manual"]),
  inferenceRunId: Uuid,
  version: z.number().int().min(1),
});

// ─── Discriminated union ──────────────────────────────────────────────────────

export const CodexArtifactSchema = z.discriminatedUnion("kind", [
  BaseArtifactSchema.extend({ kind: z.literal("session_recap"), body: SessionRecapBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("blueprint"), body: BlueprintBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("report_document"), body: ReportDocumentBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("mind_map"), body: MindMapBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("share_card"), body: ShareCardBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("code_module"), body: CodeModuleBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("spatial_scene"), body: SpatialSceneBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("audio_narration"), body: AudioNarrationBodySchema }),
  BaseArtifactSchema.extend({ kind: z.literal("profile_portrait"), body: ProfilePortraitBodySchema }),
]);

export type CodexArtifact = z.infer<typeof CodexArtifactSchema>;
export const CodexArtifactJsonSchema = z.toJSONSchema(CodexArtifactSchema);
