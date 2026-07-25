import type {
  AmbientCoherenceSignal,
  AmbientScanRequest,
  AmbientScanResponse,
  ArtifactContentFormat,
  ArtifactDestination,
  ArtifactExportFormat,
  ArtifactExportResult,
  ArtifactSynthesisRequest,
  ArtifactSynthesisResponse,
  ArtifactType,
  CreationCornerDraftInput,
  CreationCornerOutputFamily,
  ConsentState,
  FusionRequest,
  FusionResponse,
  FusionSignal,
  GenEngineHealth,
  GeneratedArtifact,
  LearnRequest,
  LearnResponse,
  LightningRequest,
  LightningResponse,
  PredictionRequest,
  PredictionResponse,
  ProvenanceEnvelope,
  ResonanceRequest,
  ResonanceResponse,
  SourceRoom,
  SynthesisStyle,
} from "./types.js";

export const GEN_ENGINE_VERSION = "1.0.0";

const ROOM_ALIASES: Record<string, SourceRoom> = {
  sanctuary: "sanctuary",
  "blackboard-room": "blackboard-room",
  blackboard: "blackboard-room",
  "dynamic-inner-world": "dynamic-inner-world",
  dynamic_inner_world: "dynamic-inner-world",
  "external-scaffold": "external-scaffold",
  external_scaffold: "external-scaffold",
  "creation-corner": "creation-corner",
  creation_corner: "creation-corner",
  billy: "billy",
  import: "import",
};

const ARTIFACT_TYPE_ALIASES: Record<string, ArtifactType> = {
  markdown: "markdown",
  "pdf-ready-html": "pdf-ready-html",
  "blueprint-json": "blueprint-json",
  "blueprint-markdown": "blueprint-markdown",
  "agent-prompt": "agent-prompt",
  "image-prompt": "image-prompt",
  "marketing-copy": "marketing-copy",
  "share-card": "share-card",
  code: "code",
  "session-recap": "session-recap",
  "mind-map": "mind-map",
  diagram: "diagram",
  mermaid: "mermaid",
  graph: "graph",
  workflow: "workflow",
};

const DESTINATION_ALIASES: Record<string, ArtifactDestination> = {
  "creation-corner": "creation-corner",
  creation_corner: "creation-corner",
  "dynamic-inner-world": "dynamic-inner-world",
  dynamic_inner_world: "dynamic-inner-world",
  "external-scaffold-pending": "external-scaffold-pending",
  external_scaffold_pending: "external-scaffold-pending",
  "download-only": "download-only",
  download_only: "download-only",
  "gate-package-draft": "gate-package-draft",
  gate_package_draft: "gate-package-draft",
};

const STYLE_ALIASES: Record<string, SynthesisStyle> = {
  faithful: "faithful",
  convergent: "convergent",
  divergent: "divergent",
  revolutionary: "revolutionary",
  "gentle-reflective": "gentle-reflective",
  gentle_reflective: "gentle-reflective",
  technical: "technical",
  "founder-voice": "founder-voice",
  founder_voice: "founder-voice",
  "plk-resonant": "plk-resonant",
  plk_resonant: "plk-resonant",
};

const POSITIVE_TERMS = [
  "preserve",
  "hold",
  "source",
  "provenance",
  "witness",
  "trace",
  "care",
  "clear",
  "gentle",
  "exact",
  "language",
  "room",
  "meaning",
  "remember",
  "connect",
  "honest",
];

const GENERIC_TERMS = [
  "generic",
  "flatten",
  "flattening",
  "summarize",
  "rewrite",
  "replace",
  "widget",
  "dashboard",
  "autopilot",
  "hidden",
  "auto",
  "force",
  "pressure",
  "polish",
];

const EMERGENT_TERMS = [
  "blueprint",
  "artifact",
  "capture",
  "cluster",
  "shape",
  "route",
  "room",
  "provenance",
  "thread",
  "signal",
  "resonance",
  "gesture",
];

const DEFAULT_CONSENT: ConsentState = {
  analyzeText: false,
  analyzeImage: false,
  analyzeAudio: false,
  analyzeVideo: false,
  inferEmotion: false,
  storeDerivativeSignals: false,
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix = "gen"): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeBlock(value: string): string {
  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0),
    ),
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyIdentifier(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "artifact";
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `h${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function normalizeByMap<T extends string>(value: string | undefined, map: Record<string, T>, fallback: T): T {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-").replace(/_+/g, "_");
  return map[normalized] ?? map[value.trim().toLowerCase()] ?? fallback;
}

export function normalizeSourceRoom(value: string | undefined): SourceRoom {
  return normalizeByMap(value, ROOM_ALIASES, "import");
}

export function normalizeArtifactType(value: string | undefined): ArtifactType {
  return normalizeByMap(value, ARTIFACT_TYPE_ALIASES, "markdown");
}

export function normalizeArtifactDestination(value: string | undefined): ArtifactDestination {
  return normalizeByMap(value, DESTINATION_ALIASES, "download-only");
}

export function normalizeSynthesisStyle(value: string | undefined): SynthesisStyle {
  return normalizeByMap(value, STYLE_ALIASES, "faithful");
}

function normalizeContentFormat(type: ArtifactType): GeneratedArtifact["contentFormat"] {
  switch (type) {
    case "pdf-ready-html":
      return "html";
    case "blueprint-json":
      return "json";
    case "agent-prompt":
    case "image-prompt":
    case "marketing-copy":
    case "share-card":
      return "text";
    case "code":
      return "code";
    case "diagram":
    case "mermaid":
      return "mermaid";
    case "graph":
    case "workflow":
      return "graph";
    case "markdown":
    case "blueprint-markdown":
    case "session-recap":
    case "mind-map":
    default:
      return "markdown";
  }
}

function tokenize(value: string): string[] {
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 0);
}

function buildTextVector(text: string, dimensions = 12): number[] {
  const buckets = new Array(dimensions).fill(0);
  const tokens = tokenize(text);

  if (tokens.length === 0) {
    return buckets;
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    let hash = 0;
    for (let charIndex = 0; charIndex < token.length; charIndex += 1) {
      hash = ((hash << 5) - hash + token.charCodeAt(charIndex)) | 0;
    }

    const bucket = Math.abs(hash) % dimensions;
    buckets[bucket] += 1;
    if (index % 3 === 0) {
      buckets[(bucket + 1) % dimensions] += 0.25;
    }
  }

  const scale = tokens.length || 1;
  return buckets.map((value) => Number((value / scale).toFixed(3)));
}

function extractPlkTerms(plkContext?: Record<string, string>): string[] {
  if (!plkContext) {
    return [];
  }

  const terms: string[] = [];

  for (const value of Object.values(plkContext)) {
    if (typeof value !== "string") {
      continue;
    }

    for (const token of value.split(/[,;\n|]/g)) {
      const trimmed = token.trim().toLowerCase();
      if (trimmed) {
        terms.push(trimmed);
      }
    }
  }

  return uniqueStrings(terms);
}

// Detect when a caller has passed a JSON-stringified object as a title or
// summary candidate. Without this guard, a Blackboard blueprint dump like
// '{"id":"blueprint-...","title":"Blackboard Summary","summary":"You: Hello"'
// would flow through to `codex_artifacts.title`, producing unrenderable rows.
// Reproduced on 2026-06-09 with 11 affected rows; the runner downstream has
// no way to recover a real title from a JSON dump, so the cleanest fix is
// at the source: reject candidates that visibly originated as serialized
// structures and fall through to the next candidate.
function isLikelyJsonObject(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 2) return false;
  const first = trimmed[0];
  return first === "{" || first === "[";
}

function pickTitleCandidate(value: string | undefined): string {
  const normalized = normalizeWhitespace(value ?? "");
  if (!normalized) return "";
  if (isLikelyJsonObject(normalized)) return "";
  return normalized;
}

function pickBestTitle(request: Partial<ArtifactSynthesisRequest>): string {
  return (
    pickTitleCandidate(request.sourceTitle) ||
    pickTitleCandidate(request.title) ||
    pickTitleCandidate(request.sourceSummary) ||
    pickTitleCandidate(request.sourceText) ||
    "Untitled artifact"
  );
}

function pickBestSummary(request: Partial<ArtifactSynthesisRequest>): string {
  return (
    pickTitleCandidate(request.summary) ||
    pickTitleCandidate(request.sourceSummary) ||
    pickTitleCandidate(request.userInstructions) ||
    "A synthesized GestaltView artifact."
  );
}

function buildSourceDigest(input: {
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  sourceTitle?: string;
  sourceSummary?: string;
  sourceText?: string;
  userInstructions?: string;
  targetType: ArtifactType;
  synthesisStyle: SynthesisStyle;
  destination: ArtifactDestination;
}): string[] {
  return uniqueStrings([
    ...input.sourceCaptureIds.map((id) => `capture:${id}`),
    ...input.sourceArtifactIds.map((id) => `artifact:${id}`),
    input.sourceTitle ? `title:${input.sourceTitle}` : null,
    input.sourceSummary ? `summary:${input.sourceSummary}` : null,
    input.sourceText ? `text:${input.sourceText}` : null,
    input.userInstructions ? `instructions:${input.userInstructions}` : null,
    `type:${input.targetType}`,
    `style:${input.synthesisStyle}`,
    `destination:${input.destination}`,
  ]);
}

function buildProvenanceEnvelope(input: {
  artifact: GeneratedArtifact;
  sourceDigests: string[];
  transformType: ProvenanceEnvelope["transformType"];
  modelProvider?: string;
  modelName?: string;
}): ProvenanceEnvelope {
  return {
    artifactId: input.artifact.id,
    sourceCaptureIds: input.artifact.sourceCaptureIds,
    sourceHashes: input.sourceDigests.map((digest) => stableHash(digest)),
    artifactHash: stableHash(
      [input.artifact.title, input.artifact.type, input.artifact.content, input.artifact.destination].join("|"),
    ),
    transformType: input.transformType,
    generatedAt: input.artifact.createdAt,
    engineVersion: GEN_ENGINE_VERSION,
    ...(input.modelProvider ? { modelProvider: input.modelProvider } : {}),
    ...(input.modelName ? { modelName: input.modelName } : {}),
  };
}

// ── Embellishment vocabulary strip pass ──────────────────────────────────────
// When the local-fallback render path produces interpretive prose, certain
// performative phrases tend to creep in via template defaults and persona
// scaffolding. The anti-sycophancy rule in CONTEXT.md is explicit: "If a
// response flatters, overconfirms, prematurely elevates, or adopts the user's
// frame without sufficient grounding, that is a system failure." This strip
// pass enforces that rule at render time. It is intentionally narrow — it
// only removes phrases that observed practice has confirmed as flatteners.
// Add to the list ONLY after Keith confirms a phrase is genuine flattening,
// not legitimate warmth.
const EMBELLISHMENT_PATTERNS: ReadonlyArray<RegExp> = [
  /\bIt'?s nice to (?:have|see|meet|hear) (?:some|you|your)[^.!?]*[.!?]/gi,
  /\bI'?(?:m|ve been) (?:sitting|waiting|here)[^.!?]*[.!?]/gi,
  /\bWhat brings you here today\??/gi,
  /\bholding space\b/gi,
  /\bthat must (?:be|feel|have been)[^.!?]*[.!?]/gi,
  /\bI\s+hear\s+you[.!]?/gi,
  /\bI'?m here for you[.!]?/gi,
  /\bLet me (?:reflect|sit with|honor)[^.!?]*[.!?]/gi,
  /\b(?:Beautiful|Tender|Powerful|Incredible|Amazing)[!.]/g,
  /\bWhat I hear is[^.!?]*[.!?]/gi,
];

function stripEmbellishment(text: string): string {
  let out = text;
  for (const pattern of EMBELLISHMENT_PATTERNS) {
    out = out.replace(pattern, "");
  }
  // Collapse multi-space runs left behind by removals.
  return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Faithful render path ─────────────────────────────────────────────────────
// When synthesisStyle is "faithful" (UI: "Preserve Voice — Stay exactly in
// your register"), the local fallback emits a quote-only structure with no
// interpretive prose. This is the hard floor against flattening: even if a
// caller misroutes prose into our local fallback, the faithful path refuses
// to add register on top.
function renderFaithfulArtifact(input: {
  title: string;
  sourceText: string;
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  userInstructions?: string;
  tags: string[];
}): string {
  const tagsBlock = input.tags.length > 0 ? input.tags.map((tag) => `- ${tag}`).join("\n") : "- none";
  const sourceCaptureBlock =
    input.sourceCaptureIds.length > 0 ? input.sourceCaptureIds.map((id) => `- ${id}`).join("\n") : "- none";
  const sourceArtifactBlock =
    input.sourceArtifactIds.length > 0 ? input.sourceArtifactIds.map((id) => `- ${id}`).join("\n") : "- none";

  const normalizedSource = normalizeBlock(input.sourceText) || "";
  // Quote every non-empty line with markdown blockquote syntax so the
  // verbatim source is visually inseparable from any framing the agent
  // might later add. No interpretive prose generated at this layer.
  const quotedSource = normalizedSource
    ? normalizedSource
        .split("\n")
        .map((line) => (line.trim().length > 0 ? `> ${line}` : ">"))
        .join("\n")
    : "_No source text provided._";

  const instructionsBlock = input.userInstructions
    ? `\n\n## Instructions (preserved verbatim)\n\n> ${input.userInstructions.replace(/\n/g, "\n> ")}`
    : "";

  return `# ${input.title}

## Mode

Preserve Voice — verbatim source, no interpretive prose.

## Tags

${tagsBlock}

## Source Captures

${sourceCaptureBlock}

## Source Artifacts

${sourceArtifactBlock}

## Source Material (verbatim)

${quotedSource}${instructionsBlock}`;
}

function renderMarkdownArtifact(input: {
  title: string;
  summary: string;
  sourceText: string;
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  sourceRoom: SourceRoom;
  synthesisStyle: SynthesisStyle;
  destination: ArtifactDestination;
  preserveExactLanguage: boolean;
  plkMode: ArtifactSynthesisRequest["plkMode"];
  userInstructions?: string;
  tags: string[];
}): string {
  // Faithful path: emit quote-only structure. Bypass the embellishment-prone
  // template entirely so no "Beautiful" / "holding space" / "It's nice to"
  // can be introduced even by accident.
  if (input.synthesisStyle === "faithful" || input.preserveExactLanguage) {
    return renderFaithfulArtifact({
      title: input.title,
      sourceText: input.sourceText,
      sourceCaptureIds: input.sourceCaptureIds,
      sourceArtifactIds: input.sourceArtifactIds,
      userInstructions: input.userInstructions,
      tags: input.tags,
    });
  }

  const tagsBlock = input.tags.length > 0 ? input.tags.map((tag) => `- ${tag}`).join("\n") : "- none";
  const sourceCaptureBlock =
    input.sourceCaptureIds.length > 0 ? input.sourceCaptureIds.map((id) => `- ${id}`).join("\n") : "- none";
  const sourceArtifactBlock =
    input.sourceArtifactIds.length > 0 ? input.sourceArtifactIds.map((id) => `- ${id}`).join("\n") : "- none";

  // Belt-and-suspenders: strip embellishment vocabulary from all interpretive
  // fields before they enter the template. Source material is preserved
  // verbatim; only the agent-authored summary and userInstructions are
  // passed through the strip pass.
  const safeSummary = stripEmbellishment(input.summary);
  const safeNotes = input.userInstructions ? stripEmbellishment(input.userInstructions) : undefined;
  const safeNoteBlock = safeNotes ? `\n\n## User Instructions\n\n${safeNotes}` : "";

  return `# ${input.title}

${safeSummary}

## Destination

${input.destination}

## Style

${input.synthesisStyle}

## PLK Mode

${input.plkMode}

## Preserve Exact Language

${input.preserveExactLanguage ? "yes" : "no"}

## Source Room

${input.sourceRoom}

## Tags

${tagsBlock}

## Source Captures

${sourceCaptureBlock}

## Source Artifacts

${sourceArtifactBlock}

## Source Material

${normalizeBlock(input.sourceText) || "_No source text provided._"}${safeNoteBlock}`;
}

function renderHtmlArtifact(input: {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  notes?: string;
  sourceRoom: SourceRoom;
  transformLabel: string;
}): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title><style>body{font-family:Inter,system-ui,sans-serif;line-height:1.6;padding:2rem;max-width:920px;margin:0 auto;background:#05070b;color:#f8fafc}article{border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:24px;background:rgba(255,255,255,.04)}.eyebrow{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.45)}h1{margin:.5rem 0 0;font-size:2.2rem}.summary{color:rgba(255,255,255,.72)}section{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.08)}pre{white-space:pre-wrap;font:inherit;color:rgba(255,255,255,.72)}ul{padding-left:1rem;color:rgba(255,255,255,.72)}</style></head><body><article><p class="eyebrow">GestaltView Generative Engine</p><h1>${escapeHtml(input.title)}</h1><p class="summary">${escapeHtml(input.summary)}</p><section><h2>Transform</h2><p>${escapeHtml(input.transformLabel)}</p></section><section><h2>Source Room</h2><p>${escapeHtml(input.sourceRoom)}</p></section><section><h2>Tags</h2><ul>${input.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("") || "<li>none</li>"}</ul></section><section><h2>Body</h2><pre>${escapeHtml(input.body)}</pre></section>${input.notes ? `<section><h2>Notes</h2><p>${escapeHtml(input.notes)}</p></section>` : ""}</article></body></html>`;
}

function renderPdfHtmlArtifact(input: {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  notes?: string;
  sourceRoom: SourceRoom;
  transformLabel: string;
}): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title><style>body{font-family:Georgia,serif;line-height:1.6;padding:1.5in 1.15in;max-width:8.5in;margin:0 auto;background:#fff;color:#111}h1,h2,p{margin-top:0}section{margin-top:1rem;padding-top:.9rem;border-top:1px solid #ddd}pre{white-space:pre-wrap;font:inherit}ul{padding-left:1rem}</style></head><body><h1>${escapeHtml(input.title)}</h1><p>${escapeHtml(input.summary)}</p><section><h2>Transform</h2><p>${escapeHtml(input.transformLabel)}</p></section><section><h2>Source Room</h2><p>${escapeHtml(input.sourceRoom)}</p></section><section><h2>Tags</h2><ul>${input.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("") || "<li>none</li>"}</ul></section><section><h2>Body</h2><pre>${escapeHtml(input.body)}</pre></section>${input.notes ? `<section><h2>Notes</h2><p>${escapeHtml(input.notes)}</p></section>` : ""}</body></html>`;
}

function buildCreationCornerPrompt(input: {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  note: string;
  sourceBlueprintJson: string;
  sourceMarkdown: string;
  captureCount: number;
}): string {
  return `Build from this GestaltView blueprint.

Title: ${input.title}
Summary: ${input.summary}
Status: ${input.status}
Tags: ${input.tags.join(", ") || "none"}
Refinement note: ${input.note || "none"}
Capture count: ${input.captureCount}

Source blueprint:
${input.sourceMarkdown}

Blueprint JSON:
${input.sourceBlueprintJson}`;
}

function buildCreationCornerImagePrompt(input: {
  title: string;
  summary: string;
  tags: string[];
  note: string;
}): string {
  return `Create a GestaltView share image for "${input.title}". Use a Neural Aurora dark field, glowing paper layers, linked room artifacts, and a sense of active drafting. Summary: ${input.summary}. Tags: ${input.tags.join(", ") || "none"}. Note: ${input.note || "none"}.`;
}

function buildCreationCornerCode(input: {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  note: string;
  captureCount: number;
  sourceCaptureIds: string[];
  sourceBlueprintJson: string;
  provenance: ProvenanceEnvelope;
}): string {
  const variableName = slugifyIdentifier(input.title);
  return `export const ${variableName} = ${JSON.stringify(
    {
      title: input.title,
      summary: input.summary,
      status: input.status,
      tags: input.tags,
      note: input.note || null,
      captureCount: input.captureCount,
      sourceCaptureIds: input.sourceCaptureIds,
      sourceBlueprint: input.sourceBlueprintJson,
      provenance: input.provenance,
    },
    null,
    2,
  )};`;
}

function buildCreationCornerShareCard(input: {
  title: string;
  summary: string;
  status: string;
  tags: string[];
}): string {
  return `${input.title}\n${input.summary}\nStatus: ${input.status}\nTags: ${input.tags.join(", ") || "none"}`;
}

function buildCreationCornerMarkdown(input: {
  title: string;
  summary: string;
  status: string;
  tags: string[];
  note: string;
  sourceMarkdown: string;
}): string {
  const tagsBlock = input.tags.length > 0 ? input.tags.map((tag) => `- ${tag}`).join("\n") : "- none";
  const noteBlock = input.note ? `\n\n## Refinement Note\n\n${input.note}` : "";
  return `# ${input.title}

${input.summary}

## Status

${input.status}

## Tags

${tagsBlock}${noteBlock}

## Source Blueprint

${input.sourceMarkdown.trim() || "_No source markdown yet._"}`;
}

function buildCreationCornerMarketingCopy(input: {
  title: string;
  captureCount: number;
}): string {
  return `${input.title} compresses ${input.captureCount} capture${input.captureCount === 1 ? "" : "s"} into a shareable blueprint, ready to route, print, or keep as a draft.`;
}

export function buildGenEngineHealth(env: Record<string, string | undefined> = process.env): GenEngineHealth {
  const providerConfigured = Boolean(
    env.BILLY_OLLAMA_URL ||
      env.OLLAMA_BASE_URL ||
      env.OLLAMA_HOST ||
      env.OLLAMA_API_URL ||
      env.OLLAMA_URL ||
      env.GROQ_API_KEY ||
      env.VITE_GROQ_API_KEY ||
      env.VITE_GROK_API_KEY ||
      env.HUGGINGFACE_API_KEY ||
      env.HF_API_TOKEN ||
      env.VITE_HUGGINGFACE_API_KEY ||
      env.VITE_HUGGINGFACE_TOKEN ||
      env.OPENROUTER_API_KEY ||
      env.VITE_OPENROUTER_API_KEY ||
      env.GOOGLE_API_KEY ||
      env.GEMINI_API_KEY ||
      env.VITE_GEMINI_API_KEY ||
      env.VITE_GOOGLE_API_KEY ||
      env.ANTHROPIC_API_KEY ||
      env.VITE_ANTHROPIC_API_KEY ||
      env.CLAUDE_API_KEY ||
      env.OPENAI_API_KEY ||
      env.VITE_OPENAI_API_KEY,
  );

  return {
    status: providerConfigured ? "operational" : "degraded",
    adapters: {
      text_basic: true,
      image_basic: true,
      audio_basic: true,
      video_basic: true,
      plk: true,
      provenance: true,
      llm: providerConfigured,
    },
    version: GEN_ENGINE_VERSION,
    warnings: providerConfigured
      ? []
      : ["No remote LLM provider detected; using deterministic local synthesis fallbacks."],
  };
}

export function createCaptureSignal(input: FusionRequest): FusionResponse {
  const captureId = normalizeWhitespace(input.captureId ?? "") || createId("capture");
  const sourceRoom = normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : "import");
  const text = normalizeWhitespace(input.text ?? "");
  const warnings: string[] = [];
  const signals: FusionSignal[] = [];
  const analyzedText = Boolean(text) && input.consent.analyzeText;
  const preservedText = text || input.fileName || input.imageUrl || input.audioUrl || input.videoUrl || input.fileUrl || "";

  if (text) {
    signals.push({
      id: createId("signal"),
      modality: "text",
      adapter: "text-basic",
      success: analyzedText,
      vector: analyzedText ? buildTextVector(text) : undefined,
      descriptor: analyzedText ? text.slice(0, 240) : "Text preserved without analysis",
      confidence: analyzedText ? 0.96 : 0.36,
      metadata: {
        sourceRoom,
        preserved: true,
        consent: input.consent.analyzeText,
      },
      warnings: analyzedText ? [] : ["Text analysis skipped by consent; raw text preserved only."],
    });
  }

  if (input.imageUrl || input.imageBase64) {
    const analyzed = input.consent.analyzeImage;
    signals.push({
      id: createId("signal"),
      modality: "image",
      adapter: "image-basic",
      success: analyzed,
      descriptor: input.imageUrl ? `Image attachment: ${input.imageUrl}` : "Inline image attachment",
      confidence: analyzed ? 0.82 : 0.28,
      metadata: {
        sourceRoom,
        url: input.imageUrl ?? null,
        inline: Boolean(input.imageBase64),
        consent: input.consent.analyzeImage,
      },
      warnings: analyzed ? [] : ["Image analysis skipped by consent; attachment metadata preserved only."],
    });
  }

  if (input.audioUrl) {
    const analyzed = input.consent.analyzeAudio;
    signals.push({
      id: createId("signal"),
      modality: "audio",
      adapter: "audio-basic",
      success: analyzed,
      descriptor: `Audio attachment: ${input.audioUrl}`,
      confidence: analyzed ? 0.76 : 0.24,
      metadata: {
        sourceRoom,
        url: input.audioUrl,
        consent: input.consent.analyzeAudio,
      },
      warnings: analyzed ? [] : ["Audio analysis skipped by consent; attachment metadata preserved only."],
    });
  }

  if (input.videoUrl) {
    const analyzed = input.consent.analyzeVideo;
    signals.push({
      id: createId("signal"),
      modality: "video",
      adapter: "video-basic",
      success: analyzed,
      descriptor: `Video attachment: ${input.videoUrl}`,
      confidence: analyzed ? 0.7 : 0.2,
      metadata: {
        sourceRoom,
        url: input.videoUrl,
        consent: input.consent.analyzeVideo,
      },
      warnings: analyzed ? [] : ["Video analysis skipped by consent; attachment metadata preserved only."],
    });
  }

  if (input.fileUrl) {
    signals.push({
      id: createId("signal"),
      modality: "file",
      adapter: "file-basic",
      success: input.consent.storeDerivativeSignals,
      descriptor: `File attachment: ${input.fileUrl}`,
      confidence: input.consent.storeDerivativeSignals ? 0.7 : 0.34,
      metadata: {
        sourceRoom,
        url: input.fileUrl,
        fileName: input.fileName ?? null,
        consent: input.consent.storeDerivativeSignals,
      },
      warnings: input.consent.storeDerivativeSignals
        ? []
        : ["Derivative signal storage skipped by consent; file metadata preserved only."],
    });
  }

  if (!text && !input.imageUrl && !input.imageBase64 && !input.audioUrl && !input.videoUrl && !input.fileUrl) {
    warnings.push("No capture payload supplied; capture was preserved as an empty shell.");
  }

  if (!input.consent.analyzeText && text) {
    warnings.push("Text analysis skipped by consent.");
  }

  const embedding = analyzedText ? buildTextVector(text) : undefined;

  return {
    success: Boolean(text || input.imageUrl || input.imageBase64 || input.audioUrl || input.videoUrl || input.fileUrl),
    captureId,
    fusedText: preservedText || `Capture preserved from ${sourceRoom}.`,
    embedding,
    signals,
    metadata: {
      sourceRoom,
      consent: input.consent,
      context: input.context ?? {},
      userId: input.userId ?? null,
      attachmentCount: [
        input.imageUrl || input.imageBase64 ? 1 : 0,
        input.audioUrl ? 1 : 0,
        input.videoUrl ? 1 : 0,
        input.fileUrl ? 1 : 0,
      ].reduce((sum, value) => sum + value, 0),
      preserved: true,
      analysisMode: analyzedText ? "text-fusion" : "capture-preservation",
    },
    warnings,
  };
}

export function scoreResonance(input: ResonanceRequest): ResonanceResponse {
  const text = normalizeWhitespace(input.text);
  const lower = text.toLowerCase();
  const plkTerms = extractPlkTerms(input.plkContext);
  const matchedMetaphors = new Set<string>();

  let energyBoost = 0;
  let triggerPenalty = 0;

  for (const term of POSITIVE_TERMS) {
    if (lower.includes(term)) {
      energyBoost += 1.8;
      matchedMetaphors.add(term);
    }
  }

  for (const term of EMERGENT_TERMS) {
    if (lower.includes(term)) {
      energyBoost += 1.2;
      matchedMetaphors.add(term);
    }
  }

  for (const term of GENERIC_TERMS) {
    if (lower.includes(term)) {
      triggerPenalty += 1.6;
    }
  }

  for (const term of plkTerms) {
    if (term && lower.includes(term)) {
      energyBoost += 1.3;
      matchedMetaphors.add(term);
    }
  }

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const densityBonus = clamp(wordCount / 24, 0, 2);
  const baseScore = 44 + densityBonus * 6 + energyBoost * 4 - triggerPenalty * 5;
  const score = Math.round(clamp(baseScore, 0, 100));
  const warnings: string[] = [];

  if (score < 45) {
    warnings.push("The language reads a little generic; keep the original texture visible.");
  }

  if (triggerPenalty > 4) {
    warnings.push("The draft carries flattening language; preserve the raw signal more closely.");
  }

  if (plkTerms.length > 0 && matchedMetaphors.size === 0) {
    warnings.push("No PLK terms matched directly; the resonance pass is using fallback language heuristics.");
  }

  return {
    score,
    metaphorsMatched: Array.from(matchedMetaphors).slice(0, 12),
    energyBoost: Number(energyBoost.toFixed(2)),
    triggerPenalty: Number(triggerPenalty.toFixed(2)),
    warnings,
  };
}

function synthesizePrediction(input: PredictionRequest): PredictionResponse {
  const lower = normalizeWhitespace(input.text ?? "").toLowerCase();
  const warnings: string[] = [];
  let prediction = "Keep the raw capture visible and decide whether it wants a blueprint next.";
  let confidence = 0.48;
  let source: PredictionResponse["source"] = "fallback";

  if (!lower && !input.visualUrl && !input.audioUrl && !input.videoUrl) {
    source = "none";
    confidence = 0.2;
    warnings.push("No input yet; prediction is a room-first fallback.");
  } else if (/\b(blueprint|draft|ship|package|artifact)\b/.test(lower)) {
    prediction = "Send this into Creation Corner and shape the next artifact family.";
    confidence = 0.84;
  } else if (/\b(image|visual|photo|sketch|gallery)\b/.test(lower) || input.visualUrl) {
    prediction = "Move it into Dynamic Inner World so the spatial artifact can breathe before export.";
    confidence = 0.8;
  } else if (/\b(scaffold|connect|link|route|cluster|external)\b/.test(lower)) {
    prediction = "Queue the cluster for External Scaffold review and keep the original capture intact.";
    confidence = 0.79;
  } else if (/\b(hold|capture|blackboard|note|transcript)\b/.test(lower)) {
    prediction = "Keep it in Blackboard Room for one more pass before deciding where it belongs.";
    confidence = 0.75;
  } else if (input.scope === "arc") {
    prediction = "Look for the repeating arc and turn the repeat into a synthesis request.";
    confidence = 0.69;
  } else if (input.audioUrl) {
    prediction = "Treat the audio as a capture first, then decide whether it wants a transcript or recap.";
    confidence = 0.67;
  } else if (input.videoUrl) {
    prediction = "Keep the video as a preserved source, then choose whether the stills want to become a recap.";
    confidence = 0.62;
  }

  return {
    prediction,
    confidence,
    source,
    warnings,
  };
}

export function createArtifact(request: ArtifactSynthesisRequest): ArtifactSynthesisResponse {
  const sourceCaptureIds = uniqueStrings(request.sourceCaptureIds);
  const sourceArtifactIds = uniqueStrings(request.sourceArtifactIds ?? []);
  const targetType = normalizeArtifactType(request.targetType);
  const synthesisStyle = normalizeSynthesisStyle(request.synthesisStyle);
  const destination = normalizeArtifactDestination(request.destination);
  const sourceRoom = normalizeSourceRoom(typeof request.sourceRoom === "string" ? request.sourceRoom : undefined);
  const title = pickBestTitle(request);
  const summary = pickBestSummary(request);
  const sourceText = normalizeBlock(request.sourceText ?? "");
  const userInstructions = normalizeBlock(request.userInstructions ?? "");
  const tags = uniqueStrings(request.tags ?? []);
  const createdAt = nowIso();
  const contentFormat = normalizeContentFormat(targetType);
  const resonance = scoreResonance({
    text: [title, summary, sourceText, userInstructions, tags.join(" ")].filter(Boolean).join("\n"),
    plkContext: {
      sourceRoom,
      synthesisStyle,
      destination,
    },
  });
  const warnings: string[] = [];
  const preserveExactLanguage = request.preserveExactLanguage;
  const plkMode = request.plkMode;

  if (!sourceText && !userInstructions) {
    warnings.push("Source text is thin; synthesis is relying on title and summary heuristics.");
  }

  if (!request.consent?.analyzeText && sourceText) {
    warnings.push("Text analysis was not consented; synthesis is running in preserve-only mode.");
  }

  const sourceDigests = buildSourceDigest({
    sourceCaptureIds,
    sourceArtifactIds,
    sourceTitle: title,
    sourceSummary: summary,
    sourceText,
    userInstructions,
    targetType,
    synthesisStyle,
    destination,
  });

  const artifactId = createId("artifact");
  const sourceTextBlock = sourceText || "_No source text provided._";
  const baseMarkdown = renderMarkdownArtifact({
    title,
    summary,
    sourceText: sourceTextBlock,
    sourceCaptureIds,
    sourceArtifactIds,
    sourceRoom,
    synthesisStyle,
    destination,
    preserveExactLanguage,
    plkMode,
    userInstructions,
    tags,
  });

  const content = (() => {
    switch (targetType) {
      case "pdf-ready-html":
        return renderHtmlArtifact({
          title,
          summary,
          body: sourceTextBlock,
          tags,
          notes: userInstructions || undefined,
          sourceRoom,
          transformLabel: synthesisStyle,
        });
      case "blueprint-json":
        return JSON.stringify(
          {
            id: artifactId,
            title,
            summary,
            type: targetType,
            destination,
            sourceCaptureIds,
            sourceArtifactIds,
            sourceRoom,
            synthesisStyle,
            preserveExactLanguage,
            plkMode,
            tags,
            userInstructions: userInstructions || null,
            sourceText: sourceText || null,
            resonance,
          },
          null,
          2,
        );
      case "agent-prompt":
        return `You are generating a GestaltView artifact.

Title: ${title}
Summary: ${summary}
Source room: ${sourceRoom}
Destination: ${destination}
Style: ${synthesisStyle}
PLK mode: ${plkMode}
Preserve exact language: ${preserveExactLanguage ? "yes" : "no"}
Source captures: ${sourceCaptureIds.join(", ") || "none"}
Source artifacts: ${sourceArtifactIds.join(", ") || "none"}
Instructions: ${userInstructions || "none"}

Preserve the source meaning and do not flatten the user's voice.`;
      case "image-prompt":
        return `Create a GestaltView share image for "${title}". Use a Neural Aurora dark field, spatial room artifacts, glowing orbs, scorched notes, and source-linked connection lines. Theme: ${summary}${tags.length > 0 ? `. Tags: ${tags.join(", ")}` : ""}`;
      case "marketing-copy":
        return `${title} compresses ${sourceCaptureIds.length} capture${sourceCaptureIds.length === 1 ? "" : "s"} into a shareable artifact, ready to route, print, or keep as a living draft.`;
      case "share-card":
        return `${title}\n${summary}\n${sourceCaptureIds.map((id) => `• ${id}`).join("\n")}`;
      case "code":
        return `export const ${slugifyIdentifier(title)} = ${JSON.stringify(
          {
            id: artifactId,
            title,
            summary,
            type: targetType,
            destination,
            sourceCaptureIds,
            sourceArtifactIds,
            sourceRoom,
            synthesisStyle,
            preserveExactLanguage,
            plkMode,
            tags,
            userInstructions: userInstructions || null,
            sourceText: sourceText || null,
            resonance,
          },
          null,
          2,
        )};`;
      case "session-recap":
      case "mind-map":
      case "blueprint-markdown":
      case "markdown":
      default:
        return baseMarkdown;
    }
  })();

  const artifact: GeneratedArtifact = {
    id: artifactId,
    userId: request.userId,
    title,
    type: targetType,
    content,
    contentFormat,
    sourceCaptureIds,
    sourceArtifactIds,
    destination,
    createdAt,
    metadata: {
      sourceRoom,
      synthesisStyle,
      preserveExactLanguage,
      plkMode,
      tags,
      userInstructions: userInstructions || null,
      sourceText: sourceText || null,
      resonance,
      reviewRecommended: destination !== "download-only",
      sourceDigests,
    },
  };

  const provenance = buildProvenanceEnvelope({
    artifact,
    sourceDigests,
    transformType:
      targetType === "agent-prompt" || targetType === "image-prompt" || targetType === "marketing-copy" || targetType === "share-card"
        ? "prompt-generation"
        : targetType === "pdf-ready-html"
          ? "formatting"
          : targetType === "blueprint-json" || targetType === "code"
            ? "translation"
            : "synthesis",
  });

  artifact.metadata = {
    ...artifact.metadata,
    provenance,
  };

  return {
    artifact,
    provenance,
    warnings: [...warnings, ...resonance.warnings],
    reviewRequired: destination !== "download-only",
  };
}

export function scanAmbientCoherence(input: AmbientScanRequest): AmbientScanResponse {
  const now = nowIso();
  const room = input.room;
  const signals: AmbientCoherenceSignal[] = [];

  if (room === "all" || room === "dynamic-inner-world") {
    signals.push({
      id: createId("ambient"),
      title: "Spatial artifact cluster is gathering",
      sourceCaptureIds: [`room:${room}`],
      observation: "Several pieces feel like they want to sit together before they are exported.",
      suggestedAction: "open-cluster",
      confidence: room === "dynamic-inner-world" ? 0.76 : 0.64,
      pressureLevel: "quiet",
      generatedAt: now,
    });
  }

  if (room === "all" || room === "creation-corner") {
    signals.push({
      id: createId("ambient"),
      title: "Blueprint-ready material detected",
      sourceCaptureIds: [`room:${room}`],
      observation: "The current draft has enough coherence to warrant a gentle synthesis pass.",
      suggestedAction: "send-to-creation-corner",
      confidence: room === "creation-corner" ? 0.8 : 0.67,
      pressureLevel: "medium",
      generatedAt: now,
    });
  }

  if (room === "all") {
    signals.push({
      id: createId("ambient"),
      title: "Archive review can stay quiet",
      sourceCaptureIds: ["room:external-scaffold"],
      observation: "Approved artifacts are stable enough to remain visible without further compression.",
      suggestedAction: "archive-suggestion-review",
      confidence: 0.58,
      pressureLevel: "quiet",
      generatedAt: now,
    });
  }

  return {
    signals: signals.slice(0, Math.max(1, input.maxSignals ?? signals.length)),
    generatedArtifacts: [],
  };
}

export function exportArtifact(artifact: GeneratedArtifact, format: ArtifactExportFormat = artifact.contentFormat): ArtifactExportResult {
  const resolvedFormat = format;
  const metadata = artifact.metadata ?? {};
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const sourceRoom = normalizeSourceRoom(typeof metadata.sourceRoom === "string" ? metadata.sourceRoom : undefined);
  const transformLabel = typeof metadata.synthesisStyle === "string" ? metadata.synthesisStyle : artifact.type;
  const isHtmlContent = /<!doctype html|<html[\s>]/i.test(artifact.content);
  const content =
    resolvedFormat === "json"
      ? JSON.stringify(artifact, null, 2)
      : resolvedFormat === "html"
        ? isHtmlContent
          ? artifact.content
          : renderHtmlArtifact({
              title: artifact.title,
              summary: typeof metadata.sourceText === "string" ? normalizeWhitespace(metadata.sourceText).slice(0, 220) : artifact.type,
              body: artifact.content,
              tags,
              sourceRoom,
              transformLabel,
            })
      : resolvedFormat === "mindmap"
        ? isHtmlContent
          ? artifact.content
          : renderHtmlArtifact({
              title: artifact.title,
              summary: typeof metadata.sourceText === "string" ? normalizeWhitespace(metadata.sourceText).slice(0, 220) : artifact.type,
              body: artifact.content,
              tags,
              sourceRoom,
              transformLabel: "mind map",
            })
      : artifact.content;
  const mimeType =
    resolvedFormat === "html" || resolvedFormat === "mindmap"
      ? "text/html;charset=utf-8"
      : resolvedFormat === "mermaid" || resolvedFormat === "diagram"
        ? "text/vnd.mermaid;charset=utf-8"
      : resolvedFormat === "json"
        ? "application/json;charset=utf-8"
        : resolvedFormat === "python"
          ? "text/x-python;charset=utf-8"
          : resolvedFormat === "code"
            ? "text/plain;charset=utf-8"
            : resolvedFormat === "markdown"
              ? "text/markdown;charset=utf-8"
              : "text/plain;charset=utf-8";
  const extension =
    resolvedFormat === "html" || resolvedFormat === "mindmap"
      ? "html"
      : resolvedFormat === "mermaid" || resolvedFormat === "diagram"
        ? "mmd"
      : resolvedFormat === "json"
        ? "json"
        : resolvedFormat === "python"
          ? "py"
          : resolvedFormat === "code"
            ? "ts"
            : resolvedFormat === "markdown"
              ? "md"
              : "txt";

  return {
    fileName: `${slugifyIdentifier(artifact.title)}.${extension}`,
    mimeType,
    content,
  };
}

export function buildCreationCornerOutputs(input: CreationCornerDraftInput): CreationCornerOutputFamily {
  const title = normalizeWhitespace(input.title) || "Untitled Blueprint";
  const summary = normalizeWhitespace(input.summary) || "A working blueprint assembled from captured material.";
  const tags = uniqueStrings(input.tags);
  const note = normalizeWhitespace(input.note);
  const sourceMarkdown = normalizeBlock(input.sourceMarkdown);
  const sourceBlueprintJson = normalizeBlock(input.sourceBlueprintJson);
  const sourceCaptureIds = uniqueStrings(input.sourceCaptureIds);
  const captureCount = Math.max(0, Math.floor(input.captureCount));
  const sourceRoom = normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : undefined);
  const artifact = createArtifact({
    sourceCaptureIds,
    sourceArtifactIds: [],
    targetType: "blueprint-markdown",
    synthesisStyle: "faithful",
    destination: "creation-corner",
    userInstructions: note || undefined,
    preserveExactLanguage: true,
    plkMode: "light-touch",
    title,
    summary,
    sourceText: sourceMarkdown,
    sourceRoom,
    tags,
  });

  const provenance = artifact.provenance;
  const tagsBlock = tags.length > 0 ? tags.map((tag) => `- ${tag}`).join("\n") : "- none";
  const noteBlock = note ? `\n\n## Refinement Note\n\n${note}` : "";
  const sourceMarkdownBlock = sourceMarkdown.trim() || "_No source markdown yet._";

  return {
    markdown: buildCreationCornerMarkdown({
      title,
      summary,
      status: input.status,
      tags,
      note,
      sourceMarkdown: sourceMarkdownBlock,
    }),
    html: `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Inter,system-ui,sans-serif;line-height:1.6;padding:2rem;max-width:920px;margin:0 auto;background:#05070b;color:#f8fafc}article{border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:24px;background:rgba(255,255,255,.04)}.eyebrow{font-size:.72rem;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.45)}h1{margin:.5rem 0 0;font-size:2.2rem}.summary{color:rgba(255,255,255,.72)}section{margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.08)}pre{white-space:pre-wrap;font:inherit;color:rgba(255,255,255,.72)}ul{padding-left:1rem;color:rgba(255,255,255,.72)}</style></head><body><article><p class="eyebrow">Creation Corner</p><h1>${escapeHtml(title)}</h1><p class="summary">${escapeHtml(summary)}</p><section><h2>Status</h2><p>${escapeHtml(input.status)}</p></section><section><h2>Refinement Note</h2><p>${escapeHtml(note || "No refinement note yet.")}</p></section><section><h2>Tags</h2><ul>${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("") || "<li>none</li>"}</ul></section><section><h2>Source Blueprint</h2><pre>${escapeHtml(sourceMarkdownBlock)}</pre></section></article></body></html>`,
    code: buildCreationCornerCode({
      title,
      summary,
      status: input.status,
      tags,
      note,
      captureCount,
      sourceCaptureIds,
      sourceBlueprintJson,
      provenance,
    }),
    agentPrompt: buildCreationCornerPrompt({
      title,
      summary,
      status: input.status,
      tags,
      note,
      sourceBlueprintJson,
      sourceMarkdown: sourceMarkdownBlock,
      captureCount,
    }),
    imagePrompt: buildCreationCornerImagePrompt({
      title,
      summary,
      tags,
      note,
    }),
    marketingCopy: buildCreationCornerMarketingCopy({
      title,
      captureCount,
    }),
    shareCard: buildCreationCornerShareCard({
      title,
      summary,
      status: input.status,
      tags,
    }),
    pdfHtml: `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Georgia,serif;line-height:1.6;padding:1.5in 1.15in;max-width:8.5in;margin:0 auto;background:#fff;color:#111}h1,h2,p{margin-top:0}section{margin-top:1rem;padding-top:.9rem;border-top:1px solid #ddd}pre{white-space:pre-wrap;font:inherit}ul{padding-left:1rem}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(summary)}</p><section><h2>Status</h2><p>${escapeHtml(input.status)}</p></section><section><h2>Refinement Note</h2><p>${escapeHtml(note || "No refinement note yet.")}</p></section><section><h2>Tags</h2><ul>${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("") || "<li>none</li>"}</ul></section><section><h2>Source Blueprint</h2><pre>${escapeHtml(sourceMarkdownBlock)}</pre></section></body></html>`,
  };
}

export function buildPredictionFromRequest(input: PredictionRequest): PredictionResponse {
  return synthesizePrediction(input);
}

export function buildLearnResponse(input: LearnRequest): LearnResponse {
  const hasSignal =
    Boolean(input.captureId?.trim()) ||
    Object.keys(input.multiInput ?? {}).length > 0 ||
    Boolean(normalizeWhitespace(input.aiOutput ?? "")) ||
    input.userFeedback > 0;

  if (!hasSignal) {
    return {
      status: "skipped",
      message: "No interaction signal was supplied, so nothing was queued.",
    };
  }

  return {
    status: "queued",
    message: "Interaction feedback was accepted by the local learning lane and queued for later persistence.",
  };
}

export function buildLightningResponse(input: LightningRequest): LightningResponse {
  const resonance = scoreResonance({
    text: normalizeWhitespace(input.content),
    plkContext: {
      sourceRoom: normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : undefined),
    },
  });
  const intensity = clamp(Number(input.intensity ?? 5), 1, 10);

  return {
    boltId: createId("bolt"),
    resonanceScore: Math.min(100, Math.round(resonance.score + intensity * 1.5)),
    message: `Captured a lightning bolt from ${normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : undefined)} with ${Math.round(intensity)}/10 intensity.`,
  };
}

export function normalizeConsent(input?: Partial<ConsentState>): ConsentState {
  return {
    analyzeText: Boolean(input?.analyzeText),
    analyzeImage: Boolean(input?.analyzeImage),
    analyzeAudio: Boolean(input?.analyzeAudio),
    analyzeVideo: Boolean(input?.analyzeVideo),
    inferEmotion: Boolean(input?.inferEmotion),
    storeDerivativeSignals: Boolean(input?.storeDerivativeSignals),
  };
}

export function getDefaultConsent(): ConsentState {
  return { ...DEFAULT_CONSENT };
}

export function inferContentFormat(
  type: ArtifactType,
  mimeType?: string
): ArtifactContentFormat {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (
      mimeType === 'text/x-python' ||
      mimeType === 'application/x-python' ||
      mimeType === 'text/python' ||
      mimeType === 'application/python'
    ) return 'python';
    if (mimeType === 'text/vnd.mermaid' || mimeType === 'application/vnd.mermaid' || mimeType === 'text/mermaid') return 'mermaid';
    if (mimeType === 'application/vnd.gestaltview.graph+json' || mimeType === 'application/graph+json') return 'graph';
    if (mimeType === 'text/csv') return 'csv';
    if (mimeType === 'application/xml' || mimeType === 'text/xml') return 'xml';
  }
  switch (type) {
    case 'markdown':
    case 'blueprint-markdown':
    case 'session-recap':   return 'markdown';
    case 'pdf-ready-html':  return 'html';
    case 'blueprint-json':  return 'json';
    case 'code':            return 'code';
    case 'diagram':         return 'mermaid';
    case 'mermaid':         return 'mermaid';
    case 'graph':           return 'graph';
    case 'workflow':        return 'graph';
    case 'mind-map':        return 'mindmap';
    case 'share-card':      return 'html';
    case 'agent-prompt':
    case 'image-prompt':
    case 'marketing-copy':  return 'text';
    default:                return 'text';
  }
}
