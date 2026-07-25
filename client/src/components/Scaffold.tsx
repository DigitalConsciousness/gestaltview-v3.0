import { buildMuseumRecapPrompt } from "@/prompts/buildMuseumRecapPrompt";
import {
  deleteCreationCornerBlueprintFromServer,
  saveCreationCornerBlueprintToServer,
} from "@/lib/creationCornerContent";

export type ArtifactType = "journal" | "audio" | "image" | "code" | "fragment" | "memory" | "context";
export type CaptureAction = "save" | "send-to-dynamic-inner-world" | "send-to-external-scaffold";
export type CaptureStatus = "saved" | "pending" | "approved" | "rejected";
export type InnerWorldSurface = "forward" | "back" | "left" | "right" | "ceiling" | "floor";
export type CaptureSource = "blackboard" | "voice" | "typed" | "upload" | "dynamic-inner-world" | "seed";
export type CaptureAttachmentKind = "text" | "audio" | "image" | "video" | "file";

export type CaptureDisplayMode =
  | "scorch"
  | "sticky-note"
  | "pinboard"
  | "waveform"
  | "sketch"
  | "code-panel"
  | "photo"
  | "fragment-shard";

export type CaptureDisplay = {
  surface: InnerWorldSurface;
  /**
   * Preferred contract: 0..1 across the selected surface.
   * Compatibility: room renderers also accept 0..100 and normalize at render time.
   */
  x: number;
  /**
   * Preferred contract: 0..1 down the selected surface.
   * Compatibility: room renderers also accept 0..100 and normalize at render time.
   */
  y: number;
  rotation?: number;
  scale?: number;
  displayMode?: CaptureDisplayMode;
  mediaUrl?: string;
  thumbnailUrl?: string;
  attachmentName?: string;
};

export type CaptureAttachment = {
  kind: CaptureAttachmentKind;
  name: string;
  mimeType: string;
  size?: number;
  dataUrl?: string;
  previewUrl?: string;
  objectUrl?: string;
  storageRef?: string;
  textContent?: string;
  addedAt: string;
};

export type CaptureMetadata = {
  context?: string;
  anchor?: string;
  meaning?: string;
  memory?: string;
  presentation?: {
    mode: "orbit" | "halo" | "gallery" | "ledger" | "stage";
    accent: string;
    motion: "still" | "breathing" | "drifting";
    rationale?: string;
  };
  orchestration?: {
    source: string;
    extractionId?: string;
    nuggetIds?: string[];
    moduleTargets?: string[];
  };
  genEngine?: {
    fusionCaptureId?: string;
    resonanceScore?: number;
    metaphorsMatched?: string[];
    warnings?: string[];
    updatedAt: string;
  };
  surface?: InnerWorldSurface;
  display?: CaptureDisplay;
  originalAction?: CaptureAction;
  transcript?: string;
  attachment?: CaptureAttachment;
  blueprintId?: string;
  bucketDrop?: {
    recipient: string;
    releaseDate?: string;
    releaseTrigger?: string;
    isSealed: boolean;
  };
  profilePipeline?: {
    captureId: string;
    artifactId?: string;
    scaffoldNodeId?: string;
    provenanceHash?: string;
  };
  scaffoldArchive?: {
    previousStatus: CaptureStatus;
  };
  createdAt: string;
  updatedAt?: string;
};

export type CaptureOrb = {
  id: string;
  label: string;
  title: string;
  text: string;
  source: CaptureSource;
  type: ArtifactType;
  tags: string[];
  resonance: number;
  color: string;
  createdAt: string;
  status: CaptureStatus;
  metadata: CaptureMetadata;
  transcript?: string;
  attachment?: CaptureAttachment;
};

export type InnerWorldCapture = CaptureOrb & {
  surface: InnerWorldSurface;
};

export type CaptureBlueprintOutput = {
  markdown: string;
  html: string;
  code: string;
  agentPrompt: string;
  imagePrompt: string;
  marketingCopy: string;
  shareCard: string;
  pdfHtml: string;
};

export type CaptureBlueprint = {
  id: string;
  title: string;
  summary: string;
  sourceOrbIds: string[];
  captureCount: number;
  tags: string[];
  status: "draft" | "ready" | "exported";
  createdAt: string;
  updatedAt: string;
  outputs: CaptureBlueprintOutput;
};

export type ScaffoldPosition = {
  x: number;
  y: number;
  z: number;
  radius: number;
  angle: number;
};

export type ScaffoldArtifact = {
  id: string;
  orbId: string;
  title: string;
  type: ArtifactType;
  source: CaptureSource;
  content: string;
  summary: string;
  tags: string[];
  resonance: number;
  color: string;
  size: number;
  position: ScaffoldPosition;
  metadata: CaptureMetadata & { approvedAt: string };
};

export type ScaffoldConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  reason: string;
  sharedTags: string[];
  discoveredAt: string;
};

export type ExternalScaffoldModel = {
  artifacts: ScaffoldArtifact[];
  connections: ScaffoldConnection[];
};

export type BillyAssistMode = "capture-integrity" | "display-integrity";

export type ExternalScaffoldDiMode = "capture-extraction" | "display-presentation";

export type BillyAssistReport = {
  mode: BillyAssistMode;
  title: string;
  summary: string;
  checklist: string[];
  suggestedMetadata: Partial<CaptureMetadata>;
  addedTags: string[];
};

export type ExternalScaffoldDiReport = {
  mode: ExternalScaffoldDiMode;
  title: string;
  summary: string;
  checklist: string[];
  suggestedMetadata: Partial<CaptureMetadata>;
  addedTags: string[];
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CONNECTION_MINIMUM_SHARED_TAGS = 2;
const MAX_QUEUE_ITEMS = 96;
const MAX_APPROVED_ITEMS = 360;
const MAX_INNER_WORLD_ITEMS = 420;
const MAX_SAVED_ITEMS = 300;
const MAX_BLUEPRINTS = 180;

export const STORAGE_KEYS = {
  scaffoldQueue: "gestaltview.externalScaffold.queue.v1",
  scaffoldApproved: "gestaltview.externalScaffold.approved.v1",
  innerWorld: "gestaltview.dynamicInnerWorld.captures.v1",
  savedCaptures: "gestaltview.blackboard.saved.v1",
  blueprints: "gestaltview.creationCorner.blueprints.v1",
} as const;

export const SCAFFOLD_QUEUE_EVENT = "gestaltview:scaffold-queue-updated";
export const INNER_WORLD_EVENT = "gestaltview:inner-world-updated";
export const BLUEPRINT_EVENT = "gestaltview:creation-blueprints-updated";
export const SAVED_CAPTURE_EVENT = "gestaltview:blackboard-saved-updated";

export const TYPE_COLORS: Record<ArtifactType, string> = {
  journal: "#BF00FF",
  audio: "#12D6FF",
  image: "#FF3CAC",
  code: "#00FF66",
  fragment: "#E60000",
  memory: "#FFFFFF",
  context: "#FFB800",
};

export const SOURCE_LABELS: Record<CaptureSource, string> = {
  blackboard: "Blackboard",
  voice: "Voice transcription",
  typed: "Typed capture",
  upload: "Upload/import",
  "dynamic-inner-world": "Dynamic Inner World",
  seed: "Seeded demo",
};

export const ACTION_LABELS: Record<CaptureAction, string> = {
  save: "Save",
  "send-to-dynamic-inner-world": "Send to Dynamic Inner World",
  "send-to-external-scaffold": "Send to External Scaffold",
};

export const INNER_WORLD_SURFACES: { id: InnerWorldSurface; label: string; description: string }[] = [
  { id: "forward", label: "Current Thread", description: "Near-focus thoughts, active captures, and current questions." },
  { id: "back", label: "Earlier Echoes", description: "Older echoes, memory traces, and return loops." },
  { id: "left", label: "Side Notes", description: "Sketches, lateral associations, unfinished branches, and divergence." },
  { id: "right", label: "Build Lane", description: "Code fragments, structural experiments, and implementation notes." },
  { id: "ceiling", label: "Wide Field", description: "Symbolic, aspirational, and unresolved material that has not landed yet." },
  { id: "floor", label: "Grounding Notes", description: "Raw residue, dormant fragments, and stabilizing anchors." },
];

export const STARTER_ORBS: CaptureOrb[] = [
  {
    id: "orb-blackboard-seed",
    label: "Blackboard fragment",
    title: "Blackboard fragment",
    text: "Loose fragments should land first, stay visible, and only become structure after the user approves the shape.",
    source: "blackboard",
    type: "fragment",
    tags: ["fragment", "blackboard", "approval", "raw-capture"],
    resonance: 78,
    color: TYPE_COLORS.fragment,
    createdAt: "seed",
    status: "pending",
    metadata: { createdAt: "seed", originalAction: "send-to-external-scaffold", surface: "floor" },
  },
  {
    id: "orb-voice-pipeline",
    label: "Voice-to-orb pipeline",
    title: "Voice-to-orb pipeline",
    text: "Voice input needs to become a held capture orb instead of disappearing into a transcript box.",
    source: "voice",
    type: "audio",
    tags: ["audio", "voice", "transcript", "orb"],
    resonance: 84,
    color: TYPE_COLORS.audio,
    createdAt: "seed",
    status: "pending",
    metadata: { createdAt: "seed", originalAction: "send-to-external-scaffold", surface: "forward" },
  },
  {
    id: "orb-approval-rack",
    label: "Approval rack",
    title: "Approval rack",
    text: "Nothing gets pushed into the external scaffold until the user can inspect it and say yes.",
    source: "blackboard",
    type: "context",
    tags: ["context", "approval", "scaffold", "user-gated"],
    resonance: 91,
    color: TYPE_COLORS.context,
    createdAt: "seed",
    status: "pending",
    metadata: { createdAt: "seed", originalAction: "send-to-external-scaffold", surface: "forward" },
  },
];

export const DEMO_PENDING_ORBS: CaptureOrb[] = STARTER_ORBS;

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "before",
  "being",
  "between",
  "could",
  "every",
  "from",
  "have",
  "into",
  "just",
  "like",
  "need",
  "only",
  "that",
  "their",
  "there",
  "these",
  "thing",
  "this",
  "through",
  "user",
  "want",
  "where",
  "with",
  "would",
  "your",
]);

export function createId(prefix = "gv"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emitBrowserEvent<T>(name: string, detail?: T): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!hasBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Scaffold] local storage write failed for ${key}`, error);
  }
}

export function emitScaffoldQueueUpdated(): void {
  emitBrowserEvent(SCAFFOLD_QUEUE_EVENT);
}

export function emitInnerWorldUpdated(): void {
  emitBrowserEvent(INNER_WORLD_EVENT);
}

export function emitBlueprintsUpdated(blueprintId?: string): void {
  emitBrowserEvent(BLUEPRINT_EVENT, blueprintId ? { blueprintId } : undefined);
}

export function emitSavedCapturesUpdated(): void {
  emitBrowserEvent(SAVED_CAPTURE_EVENT);
}

export function clampResonance(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeCaptureText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function titleFromText(text: string): string {
  const normalized = normalizeCaptureText(text);
  if (!normalized) {
    return "Untitled capture";
  }

  const withoutTerminal = normalized.replace(/[.!?]+$/g, "");
  const words = withoutTerminal.split(" ").slice(0, 7).join(" ");
  return words.length < withoutTerminal.length ? `${words}...` : words;
}

export function labelFromText(text: string): string {
  const normalized = normalizeCaptureText(text);
  if (!normalized) {
    return "Untitled fragment";
  }

  const withoutTerminal = normalized.replace(/[.!?]+$/g, "");
  const words = withoutTerminal.split(" ").slice(0, 5).join(" ");
  return words.length < withoutTerminal.length ? `${words}...` : words;
}

export function inferArtifactType(text: string, source: CaptureSource, explicitType?: ArtifactType): ArtifactType {
  if (explicitType) {
    return explicitType;
  }

  const lower = text.toLowerCase();
  const looksLikeCode = /(```|function\s|const\s|let\s|class\s|import\s|export\s|return\s|=>|<\/?[a-z][\s\S]*>)/.test(text);
  if (looksLikeCode) {
    return "code";
  }

  if (source === "voice") {
    return "audio";
  }

  if (/\b(image|photo|picture|sketch|doodle|drawing|png|jpg|jpeg|webp|gif)\b/.test(lower)) {
    return "image";
  }

  if (/\b(memory|remember|legacy|anchor|meaning|childhood|family)\b/.test(lower)) {
    return "memory";
  }

  if (/\b(context|logic|flow|system|module|wiring|workflow|runtime|retrieval|corpus|metadata|schema)\b/.test(lower)) {
    return "context";
  }

  const wordCount = normalizeCaptureText(text).split(/\s+/).filter(Boolean).length;
  if (wordCount <= 9 || /\b(fragment|loose|lost|orphan|unresolved|shard|residue)\b/.test(lower)) {
    return "fragment";
  }

  return "journal";
}

export function colorForSource(source: CaptureSource): string {
  switch (source) {
    case "voice":
      return TYPE_COLORS.audio;
    case "typed":
      return "#00E5FF";
    case "upload":
      return "#FF9F1A";
    case "seed":
      return "#C64DFF";
    case "dynamic-inner-world":
      return TYPE_COLORS.memory;
    case "blackboard":
    default:
      return "#C64DFF";
  }
}

export function extractTags(text: string, type: ArtifactType, source: CaptureSource): string[] {
  const normalized = normalizeCaptureText(text).toLowerCase();
  const keywordTags = [
    "blackboard",
    "dynamic",
    "inner-world",
    "scaffold",
    "external-scaffold",
    "voice",
    "transcription",
    "canvas",
    "memory",
    "context",
    "meaning",
    "anchor",
    "orb",
    "artifact",
    "connection",
    "galaxy",
    "fragment",
    "flow",
    "workflow",
    "logic",
    "system",
    "wiring",
    "retrieval",
    "corpus",
    "billy",
    "creation",
    "blueprint",
  ].filter((tag) => normalized.includes(tag.replace("-", " ")) || normalized.includes(tag));

  const freeTags = normalized
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !STOP_WORDS.has(word))
    .slice(0, 10);

  return Array.from(new Set([type, source, ...keywordTags, ...freeTags])).slice(0, 18);
}

export function resonanceFromText(text: string, type?: ArtifactType): number {
  const normalized = text.trim();
  const wordCount = normalized ? normalized.split(/\s+/).length : 0;
  const signalWords = [
    "connect",
    "pattern",
    "remember",
    "scaffold",
    "blackboard",
    "voice",
    "approval",
    "external",
    "orbit",
    "fragment",
    "resonance",
    "workflow",
    "capture",
    "metadata",
    "meaning",
  ];

  const signalScore = signalWords.reduce((score, word) => score + (normalized.toLowerCase().includes(word) ? 4 : 0), 0);
  const typeLift = type === "memory" ? 12 : type === "context" ? 8 : type === "fragment" ? -6 : type === "code" ? 6 : 0;

  return clampResonance(42 + Math.min(38, wordCount * 2) + signalScore + typeLift);
}

type CreateCaptureOrbInput =
  | string
  | {
      text: string;
      source?: CaptureSource;
      type?: ArtifactType;
      surface?: InnerWorldSurface;
      action?: CaptureAction;
      context?: string;
      anchor?: string;
      meaning?: string;
      memory?: string;
      transcript?: string;
      attachment?: CaptureAttachment;
      display?: CaptureDisplay;
      tags?: string[];
      title?: string;
      label?: string;
      resonance?: number;
      color?: string;
    };

function displayFromAttachment(attachment: CaptureAttachment | undefined, type: ArtifactType, surface: InnerWorldSurface): CaptureDisplay | undefined {
  if (!attachment) {
    return undefined;
  }

  const displayMode: CaptureDisplayMode =
    attachment.kind === "image"
      ? "photo"
      : attachment.kind === "audio"
        ? "waveform"
        : type === "code"
          ? "code-panel"
          : attachment.kind === "file"
            ? "pinboard"
            : "scorch";

  return {
    surface,
    x: 0.5,
    y: 0.5,
    displayMode,
    mediaUrl: attachment.dataUrl,
    thumbnailUrl: attachment.kind === "image" ? attachment.dataUrl : undefined,
    attachmentName: attachment.name,
  };
}

export function createCaptureOrb(input: CreateCaptureOrbInput, source: CaptureSource = "typed"): CaptureOrb | null {
  const normalized = typeof input === "string" ? normalizeCaptureText(input) : normalizeCaptureText(input.text);
  if (!normalized) {
    return null;
  }

  const resolvedSource = typeof input === "string" ? source : input.source ?? source;
  const resolvedType = inferArtifactType(normalized, resolvedSource, typeof input === "string" ? undefined : input.type);
  const surface = typeof input === "string" ? undefined : input.surface;
  const action = typeof input === "string" ? undefined : input.action;
  const attachment = typeof input === "string" ? undefined : input.attachment;
  const transcript = typeof input === "string" ? undefined : input.transcript;
  const now = new Date().toISOString();
  const display = typeof input === "string" ? undefined : input.display ?? displayFromAttachment(attachment, resolvedType, surface ?? "forward");
  const inferredTags = extractTags(normalized, resolvedType, resolvedSource);
  const explicitTags = typeof input === "string" ? [] : input.tags ?? [];
  const tags = Array.from(new Set([...inferredTags, ...explicitTags])).slice(0, 18);

  return {
    id: createId("orb"),
    label: typeof input === "string" ? labelFromText(normalized) : input.label ?? labelFromText(normalized),
    title: typeof input === "string" ? titleFromText(normalized) : input.title ?? titleFromText(normalized),
    text: normalized,
    source: resolvedSource,
    type: resolvedType,
    tags,
    resonance: typeof input === "string" ? resonanceFromText(normalized, resolvedType) : input.resonance ?? resonanceFromText(normalized, resolvedType),
    color: typeof input === "string" ? colorForSource(resolvedSource) : input.color ?? TYPE_COLORS[resolvedType] ?? colorForSource(resolvedSource),
    createdAt: now,
    status: action === "save" ? "saved" : "pending",
    transcript,
    attachment,
    metadata: {
      createdAt: now,
      updatedAt: now,
      context: typeof input === "string" ? undefined : input.context,
      anchor: typeof input === "string" ? undefined : input.anchor,
      meaning: typeof input === "string" ? undefined : input.meaning,
      memory: typeof input === "string" ? undefined : input.memory,
      surface,
      display,
      originalAction: action,
      transcript,
      attachment,
    },
  };
}

export function readScaffoldQueue(): CaptureOrb[] {
  return readJson<CaptureOrb[]>(STORAGE_KEYS.scaffoldQueue, []);
}

export function writeScaffoldQueue(orbs: CaptureOrb[]): void {
  writeJson(STORAGE_KEYS.scaffoldQueue, dedupeOrbs(orbs).slice(0, MAX_QUEUE_ITEMS));
  emitScaffoldQueueUpdated();
}

export function appendScaffoldQueue(orb: CaptureOrb): CaptureOrb[] {
  const pending = { ...orb, status: "pending" as const, metadata: { ...orb.metadata, updatedAt: new Date().toISOString() } };
  const next = [pending, ...readScaffoldQueue().filter((item) => item.id !== pending.id)].slice(0, MAX_QUEUE_ITEMS);
  writeScaffoldQueue(next);
  return next;
}

export function removeScaffoldQueueOrb(orbId: string): CaptureOrb[] {
  const next = readScaffoldQueue().filter((item) => item.id !== orbId);
  writeScaffoldQueue(next);
  return next;
}

export function updateScaffoldQueueOrb(orbId: string, updater: (orb: CaptureOrb) => CaptureOrb): CaptureOrb[] {
  const next = readScaffoldQueue().map((orb) => (orb.id === orbId ? updater(orb) : orb));
  writeScaffoldQueue(next);
  return next;
}

export function readApprovedOrbs(): CaptureOrb[] {
  return readJson<CaptureOrb[]>(STORAGE_KEYS.scaffoldApproved, []);
}

export function writeApprovedOrbs(orbs: CaptureOrb[]): void {
  writeJson(STORAGE_KEYS.scaffoldApproved, dedupeOrbs(orbs).slice(0, MAX_APPROVED_ITEMS));
  emitScaffoldQueueUpdated();
}

export function appendApprovedOrb(orb: CaptureOrb): CaptureOrb[] {
  const approved = approveOrb(orb);
  const next = [approved, ...readApprovedOrbs().filter((item) => item.id !== approved.id)].slice(0, MAX_APPROVED_ITEMS);
  writeApprovedOrbs(next);
  return next;
}

export function removeApprovedOrb(orbId: string): CaptureOrb[] {
  const next = readApprovedOrbs().filter((item) => item.id !== orbId);
  writeApprovedOrbs(next);
  return next;
}

export function readInnerWorldCaptures(): InnerWorldCapture[] {
  return readJson<InnerWorldCapture[]>(STORAGE_KEYS.innerWorld, []);
}

export function writeInnerWorldCaptures(captures: InnerWorldCapture[]): void {
  writeJson(STORAGE_KEYS.innerWorld, dedupeOrbs(captures).slice(0, MAX_INNER_WORLD_ITEMS));
  emitInnerWorldUpdated();
}

export function appendInnerWorldCapture(orb: CaptureOrb): InnerWorldCapture[] {
  const surface = orb.metadata.display?.surface ?? orb.metadata.surface ?? "forward";
  const capture: InnerWorldCapture = {
    ...orb,
    surface,
    status: "saved",
    metadata: {
      ...orb.metadata,
      surface,
      display: orb.metadata.display ?? { surface, x: 0.5, y: 0.5, displayMode: displayModeForType(orb.type) },
      updatedAt: new Date().toISOString(),
    },
  };
  const next = [capture, ...readInnerWorldCaptures().filter((item) => item.id !== capture.id)].slice(0, MAX_INNER_WORLD_ITEMS);
  writeInnerWorldCaptures(next);
  return next;
}

export function removeInnerWorldCapture(captureId: string): InnerWorldCapture[] {
  const next = readInnerWorldCaptures().filter((capture) => capture.id !== captureId);
  writeInnerWorldCaptures(next);
  return next;
}

export function updateInnerWorldCapture(
  captureId: string,
  updater: (capture: InnerWorldCapture) => InnerWorldCapture,
): InnerWorldCapture[] {
  const next = readInnerWorldCaptures().map((capture) => (capture.id === captureId ? updater(capture) : capture));
  writeInnerWorldCaptures(next);
  return next;
}

export function readSavedCaptures(): CaptureOrb[] {
  return readJson<CaptureOrb[]>(STORAGE_KEYS.savedCaptures, []);
}

export function writeSavedCaptures(captures: CaptureOrb[]): void {
  writeJson(STORAGE_KEYS.savedCaptures, dedupeOrbs(captures).slice(0, MAX_SAVED_ITEMS));
  emitSavedCapturesUpdated();
}

export function appendSavedCapture(orb: CaptureOrb): CaptureOrb[] {
  const capture = { ...orb, status: "saved" as const, metadata: { ...orb.metadata, updatedAt: new Date().toISOString() } };
  const next = [capture, ...readSavedCaptures().filter((item) => item.id !== capture.id)].slice(0, MAX_SAVED_ITEMS);
  writeSavedCaptures(next);
  return next;
}

export function updateSavedCapture(captureId: string, updater: (capture: CaptureOrb) => CaptureOrb): CaptureOrb[] {
  const next = readSavedCaptures().map((capture) => (capture.id === captureId ? updater(capture) : capture));
  writeSavedCaptures(next);
  return next;
}

export function removeSavedCapture(captureId: string): CaptureOrb[] {
  const next = readSavedCaptures().filter((capture) => capture.id !== captureId);
  writeSavedCaptures(next);
  return next;
}

export function readBlueprints(): CaptureBlueprint[] {
  return readJson<CaptureBlueprint[]>(STORAGE_KEYS.blueprints, []);
}

export function writeBlueprints(blueprints: CaptureBlueprint[], activeBlueprintId?: string): void {
  writeJson(STORAGE_KEYS.blueprints, blueprints.slice(0, MAX_BLUEPRINTS));
  emitBlueprintsUpdated(activeBlueprintId);
}

function syncBlueprintToServer(blueprint: CaptureBlueprint): void {
  void saveCreationCornerBlueprintToServer({ blueprint });
}

function deleteBlueprintFromServer(blueprintId: string): void {
  void deleteCreationCornerBlueprintFromServer({ blueprintId });
}

export function appendBlueprint(blueprint: CaptureBlueprint): CaptureBlueprint[] {
  const next = [blueprint, ...readBlueprints().filter((item) => item.id !== blueprint.id)].slice(0, MAX_BLUEPRINTS);
  writeBlueprints(next, blueprint.id);
  syncBlueprintToServer(blueprint);
  return next;
}

export function updateBlueprint(blueprintId: string, updater: (blueprint: CaptureBlueprint) => CaptureBlueprint): CaptureBlueprint[] {
  const updatedAt = new Date().toISOString();
  const next = readBlueprints().map((blueprint) =>
    blueprint.id === blueprintId ? { ...updater(blueprint), updatedAt } : blueprint,
  );
  writeBlueprints(next);
  const updatedBlueprint = next.find((blueprint) => blueprint.id === blueprintId);
  if (updatedBlueprint) {
    syncBlueprintToServer(updatedBlueprint);
  }
  return next;
}

export function removeBlueprint(blueprintId: string): CaptureBlueprint[] {
  const next = readBlueprints().filter((blueprint) => blueprint.id !== blueprintId);
  writeBlueprints(next);
  deleteBlueprintFromServer(blueprintId);
  return next;
}

export function approveOrb(orb: CaptureOrb): CaptureOrb {
  return {
    ...orb,
    status: "approved",
    metadata: {
      ...orb.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function rejectOrb(orb: CaptureOrb): CaptureOrb {
  return {
    ...orb,
    status: "rejected",
    metadata: {
      ...orb.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function routeBlackboardCapture(orb: CaptureOrb, action: CaptureAction): void {
  const routedOrb: CaptureOrb = {
    ...orb,
    metadata: { ...orb.metadata, originalAction: action, updatedAt: new Date().toISOString() },
  };

  if (action === "send-to-external-scaffold") {
    appendScaffoldQueue({ ...routedOrb, status: "pending" });
    return;
  }

  if (action === "send-to-dynamic-inner-world") {
    appendInnerWorldCapture({ ...routedOrb, status: "saved" });
    return;
  }

  appendSavedCapture({ ...routedOrb, status: "saved" });
}

export function buildBillyAssistReport(orb: CaptureOrb, mode: BillyAssistMode = "capture-integrity"): BillyAssistReport {
  const surface = INNER_WORLD_SURFACES.find((item) => item.id === orb.metadata.surface || item.id === orb.metadata.display?.surface);
  const source = SOURCE_LABELS[orb.source];
  const destination = ACTION_LABELS[orb.metadata.originalAction ?? "save"];
  const surfaceLabel = surface?.label ?? "Unplaced Surface";
  const compactSummary = orb.text.length > 180 ? `${orb.text.slice(0, 177)}...` : orb.text;
  const hasAttachment = Boolean(orb.attachment ?? orb.metadata.attachment);
  const hasTranscript = Boolean(orb.transcript ?? orb.metadata.transcript);

  return {
    mode,
    title: "Billy capture/display assist",
    summary:
      mode === "display-integrity"
        ? "Billy checks visibility, source, metadata, and handoff integrity without becoming a scaffold node."
        : "Billy checks that the capture has enough source, destination, and metadata context to survive routing without flattening the original words.",
    checklist: [
      `Destination: ${destination}`,
      `Source retained: ${source}`,
      `Surface anchor: ${surfaceLabel}`,
      `Artifact type: ${orb.type}`,
      hasAttachment ? "Attachment reference retained" : "No attachment on this capture",
      hasTranscript ? "Transcript retained" : "No transcript on this capture",
      "Original text preserved before compression",
      "User approval remains required before External Scaffold insertion",
    ],
    suggestedMetadata: {
      context: orb.metadata.context ?? surface?.description ?? "Capture context is held in the routing seam until the user approves compression.",
      anchor: orb.metadata.anchor ?? surfaceLabel,
      meaning:
        orb.metadata.meaning ??
        (orb.metadata.originalAction === "send-to-external-scaffold"
          ? "Candidate for compressed artifact memory."
          : "Raw expression preserved for later placement."),
      memory: orb.metadata.memory ?? compactSummary,
      surface: orb.metadata.surface ?? surface?.id,
      display: orb.metadata.display,
      transcript: orb.metadata.transcript ?? orb.transcript,
      attachment: orb.metadata.attachment ?? orb.attachment,
      updatedAt: new Date().toISOString(),
    },
    // Billy may suggest metadata; tags remain user/system-context driven, not assistant-driven.
    addedTags: [],
  };
}

export function applyBillyAssistToOrb(orb: CaptureOrb, mode: BillyAssistMode = "capture-integrity"): CaptureOrb {
  const report = buildBillyAssistReport(orb, mode);

  return {
    ...orb,
    // Do not add Billy as a tag, node, artifact, or hidden organizing layer.
    tags: orb.tags,
    resonance: orb.resonance,
    metadata: {
      ...orb.metadata,
      ...report.suggestedMetadata,
    },
  };
}

function buildPresentationTags(mode: ExternalScaffoldDiMode, presentation: NonNullable<CaptureMetadata["presentation"]>): string[] {
  return Array.from(
    new Set([
      "external-scaffold-di",
      `presentation-${presentation.mode}`,
      `motion-${presentation.motion}`,
      mode === "display-presentation" ? "display-integrity" : "capture-extraction",
    ]),
  );
}

function inferExternalScaffoldPresentation(orb: CaptureOrb): NonNullable<CaptureMetadata["presentation"]> {
  const lower = `${orb.title} ${orb.text} ${orb.tags.join(" ")}`.toLowerCase();
  if (/\b(recap|document|blueprint|report|pitch)\b/.test(lower)) {
    return {
      mode: "gallery",
      accent: "#BF00FF",
      motion: "breathing",
      rationale: "Document-shaped material gets a gallery presentation.",
    };
  }

  if (/\b(voice|audio|conversation|dialogue|thread)\b/.test(lower)) {
    return {
      mode: "ledger",
      accent: "#12D6FF",
      motion: "still",
      rationale: "Conversation-shaped material stays legible and calm.",
    };
  }

  if (/\b(ground|recovery|support|stabil|sanctuary)\b/.test(lower)) {
    return {
      mode: "halo",
      accent: "#FF8FA3",
      motion: "breathing",
      rationale: "Support material gets a soft halo presentation.",
    };
  }

  if (orb.type === "memory" || orb.resonance >= 88) {
    return {
      mode: "stage",
      accent: orb.color ?? TYPE_COLORS.memory,
      motion: "drifting",
      rationale: "High-resonance or memory-bearing material gets stage presence.",
    };
  }

  return {
    mode: "orbit",
    accent: orb.color ?? TYPE_COLORS[orb.type] ?? "#12D6FF",
    motion: "drifting",
    rationale: "Default scaffold presentation keeps the orb in orbit.",
  };
}

export function buildExternalScaffoldDiReport(
  orb: CaptureOrb,
  mode: ExternalScaffoldDiMode = "capture-extraction",
): ExternalScaffoldDiReport {
  const presentation = inferExternalScaffoldPresentation(orb);
  const title =
    mode === "display-presentation"
      ? "External Scaffold presentation DI"
      : "External Scaffold extraction DI";
  const summary =
    mode === "display-presentation"
      ? "The scaffold DI tunes the orb's public-facing shape so it reads as intentional, luminous, and legible."
      : "The scaffold DI extracts nuggets, enriches tags, and preserves the raw capture before the orb is presented.";

  const keywordTags = extractTags(orb.text, orb.type, orb.source).filter((tag) => !orb.tags.includes(tag));
  const presentationTags = buildPresentationTags(mode, presentation);

  return {
    mode,
    title,
    summary,
    checklist: [
      mode === "display-presentation" ? "Presentation shape selected" : "Nugget extraction completed",
      "Original wording retained",
      "Tags enriched without overwriting user language",
      `Presentation mode: ${presentation.mode}`,
    ],
    suggestedMetadata: {
      presentation,
      orchestration: {
        source: "external-scaffold-di",
        nuggetIds: undefined,
        moduleTargets: undefined,
      },
    },
    addedTags: Array.from(new Set([...keywordTags, ...presentationTags])),
  };
}

export function applyExternalScaffoldDiToOrb(
  orb: CaptureOrb,
  mode: ExternalScaffoldDiMode = "capture-extraction",
): CaptureOrb {
  const report = buildExternalScaffoldDiReport(orb, mode);

  return {
    ...orb,
    tags: Array.from(new Set([...orb.tags, ...report.addedTags])).slice(0, 24),
    metadata: {
      ...orb.metadata,
      ...report.suggestedMetadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function resolveCaptureFileName(capture: CaptureOrb, extension = "json"): string {
  const slug = capture.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return `${slug || "capture"}.${extension}`;
}

export function buildBlueprintFromCaptures(
  captures: CaptureOrb[],
  title?: string,
  options: { summary?: string; status?: CaptureBlueprint["status"]; notes?: string[] } = {},
): CaptureBlueprint {
  const now = new Date().toISOString();
  const resolvedTitle = title ?? (captures[0]?.title ? `${captures[0].title} Blueprint` : "Untitled Blueprint");
  const resolvedSummary =
    options.summary ??
    (captures.length > 0
      ? `Merged ${captures.length} capture${captures.length === 1 ? "" : "s"} into a reusable blueprint.`
      : "A working blueprint assembled from the current room context.");
  const tags = Array.from(new Set(captures.flatMap((capture) => capture.tags))).slice(0, 24);
  const captureCount = captures.length;
  const notes = options.notes ?? [];
  const sourceOrbIds = captures.map((capture) => capture.id);
  const markdownSections = captures
    .map(
      (capture) =>
        `## ${capture.title}\n\n- Source: ${SOURCE_LABELS[capture.source]}\n- Type: ${capture.type}\n- Status: ${capture.status}\n- Tags: ${capture.tags.join(", ") || "none"}\n\n${capture.text}`,
    )
    .join("\n\n");
  const markdown = `# ${resolvedTitle}\n\n${resolvedSummary}\n\n${notes.length > 0 ? `## Notes\n\n${notes.map((note) => `- ${note}`).join("\n")}\n\n` : ""}## Source captures\n\n${markdownSections || "_No captures selected yet._"}`;
  const htmlSections = captures
    .map(
      (capture) =>
        `<section><h2>${escapeHtml(capture.title)}</h2><p class="meta">${escapeHtml(SOURCE_LABELS[capture.source])} · ${escapeHtml(capture.type)} · resonance ${capture.resonance}</p><pre>${escapeHtml(capture.text)}</pre></section>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(resolvedTitle)}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;padding:2rem;max-width:900px;margin:0 auto;background:#0b0e13;color:#fff}article{background:#10151d;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:24px}.meta{color:rgba(255,255,255,.55);font-size:.85rem}pre{white-space:pre-wrap;font:inherit}</style></head><body><article><h1>${escapeHtml(resolvedTitle)}</h1><p>${escapeHtml(resolvedSummary)}</p>${htmlSections}</article></body></html>`;
  const variableName =
    resolvedTitle.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() || "blueprint";
  const code = `export const ${variableName} = ${JSON.stringify(
    captures.map((capture) => ({
      id: capture.id,
      title: capture.title,
      text: capture.text,
      source: capture.source,
      type: capture.type,
      tags: capture.tags,
      metadata: capture.metadata,
      createdAt: capture.createdAt,
    })),
    null,
    2,
  )};`;
  const agentPrompt = `Build from this GestaltView blueprint. Preserve the source meaning and original capture language; compress only after the user-approved intent is clear.\n\nTitle: ${resolvedTitle}\nSummary: ${resolvedSummary}\n\nSource captures:\n${captures
    .map((capture) => `- ${capture.title}: ${capture.text}`)
    .join("\n")}`;
  const imagePrompt = `Create a GestaltView share image for "${resolvedTitle}". Use a Neural Aurora dark field, spatial room artifacts, glowing orbs, scorched notes, and source-linked connection lines. Theme: ${resolvedSummary}`;
  const marketingCopy = `${resolvedTitle} turns ${captureCount} capture${captureCount === 1 ? "" : "s"} into a compressed artifact you can share, send onward, or keep as a living blueprint.`;
  const shareCard = `${resolvedTitle}\n${resolvedSummary}\n${sourceOrbIds.map((id) => `• ${id}`).join("\n")}`;
  const pdfHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(resolvedTitle)}</title><style>body{font-family:Georgia,serif;line-height:1.6;padding:2rem;max-width:8.5in;margin:0 auto;color:#111;background:#fff}h1,h2{margin:0 0 .75rem}section{margin-bottom:1.25rem;border-bottom:1px solid #ddd;padding-bottom:1rem}pre{white-space:pre-wrap;font:inherit}</style></head><body><h1>${escapeHtml(resolvedTitle)}</h1><p>${escapeHtml(resolvedSummary)}</p>${htmlSections}</body></html>`;

  return {
    id: createId("blueprint"),
    title: resolvedTitle,
    summary: resolvedSummary,
    sourceOrbIds,
    captureCount,
    tags,
    status: options.status ?? "draft",
    createdAt: now,
    updatedAt: now,
    outputs: {
      markdown,
      html,
      code,
      agentPrompt,
      imagePrompt,
      marketingCopy,
      shareCard,
      pdfHtml,
    },
  };
}

export function sizeFromArtifact(orb: CaptureOrb): number {
  const base = orb.type === "memory" ? 0.92 : orb.type === "fragment" ? 0.36 : orb.type === "context" ? 0.58 : 0.48;
  return Number((base + orb.resonance / 170).toFixed(3));
}

export function artifactIdFromOrb(orbId: string): string {
  return orbId.startsWith("orb-") ? orbId.replace(/^orb-/, "artifact-") : `artifact-${orbId}`;
}

export function calculateScaffoldPosition(orb: CaptureOrb, index: number, expansionFactor = 5): ScaffoldPosition {
  const angle = index * GOLDEN_ANGLE;
  const isCoreMemory = orb.type === "memory" || orb.resonance >= 90;
  const radius = isCoreMemory ? 1.5 + Math.sqrt(index + 1) * 1.15 : 3.4 + Math.sqrt(index + 1) * expansionFactor;
  const z = (orb.resonance - 50) * 0.18 + (orb.type === "fragment" ? -4 : orb.type === "memory" ? 7 : 0);

  return {
    x: Number((Math.cos(angle) * radius).toFixed(3)),
    y: Number((Math.sin(angle) * radius).toFixed(3)),
    z: Number(z.toFixed(3)),
    radius: Number(radius.toFixed(3)),
    angle: Number(angle.toFixed(3)),
  };
}

export function buildExternalScaffold(orbs: CaptureOrb[]): ExternalScaffoldModel {
  const approvedOrbs = dedupeOrbs(orbs).filter((orb) => orb.status === "approved" || orbs.includes(orb));
  const artifacts: ScaffoldArtifact[] = approvedOrbs.map((orb, index) => ({
    id: artifactIdFromOrb(orb.id),
    orbId: orb.id,
    title: orb.title,
    type: orb.type,
    source: orb.source,
    content: orb.text,
    summary: orb.metadata.meaning ?? orb.metadata.context ?? (orb.text.length > 160 ? `${orb.text.slice(0, 157)}...` : orb.text),
    tags: orb.tags,
    resonance: orb.resonance,
    color: orb.metadata.presentation?.accent ?? orb.color ?? TYPE_COLORS[orb.type],
    size: sizeFromArtifact(orb),
    position: calculateScaffoldPosition(orb, index),
    metadata: {
      ...orb.metadata,
      approvedAt: orb.metadata.updatedAt ?? new Date().toISOString(),
    },
  }));

  return {
    artifacts,
    connections: discoverEvidenceConnections(artifacts),
  };
}

export function buildRecapPrompt(captures: InnerWorldCapture[], surfaceLabel: string): string {
  return buildMuseumRecapPrompt({
    roomName: surfaceLabel,
    surfaceLabel,
    exhibitSummaries: captures.map((capture) => ({
      title: capture.title ?? "Untitled",
      // Priority: text > metadata.context > metadata.meaning (never concatenate all three)
      summary: (() => {
        const text = capture.text?.trim();
        if (text) return text;
        const ctx = capture.metadata.context?.trim();
        if (ctx) return ctx;
        return capture.metadata.meaning?.trim() ?? "";
      })(),
      sourceNotes: [
        { title: "Created", pointer: capture.createdAt },
        { title: "Surface", pointer: capture.surface },
        ...capture.tags.slice(0, 3).map((tag) => ({ title: "Tag", pointer: tag })),
      ],
    })),
  });
}

export function discoverEvidenceConnections(artifacts: ScaffoldArtifact[]): ScaffoldConnection[] {
  const connections: ScaffoldConnection[] = [];
  const now = new Date().toISOString();

  for (let sourceIndex = 0; sourceIndex < artifacts.length; sourceIndex += 1) {
    for (let targetIndex = sourceIndex + 1; targetIndex < artifacts.length; targetIndex += 1) {
      const source = artifacts[sourceIndex];
      const target = artifacts[targetIndex];
      const sharedTags = source.tags.filter((tag) => target.tags.includes(tag));
      const sameType = source.type === target.type;
      const sameSource = source.source === target.source;
      const hasEvidence = sharedTags.length >= CONNECTION_MINIMUM_SHARED_TAGS || (sharedTags.length >= 1 && sameType && sameSource);

      if (!hasEvidence) {
        continue;
      }

      const strength = Math.min(1, 0.24 + sharedTags.length * 0.16 + (sameType ? 0.1 : 0) + (sameSource ? 0.08 : 0));
      connections.push({
        id: `connection-${source.id}-${target.id}`,
        sourceId: source.id,
        targetId: target.id,
        strength: Number(strength.toFixed(2)),
        reason: `Context connection: ${sharedTags.slice(0, 4).join(", ") || "shared source/type"}`,
        sharedTags: sharedTags.slice(0, 8),
        discoveredAt: now,
      });
    }
  }

  return connections.slice(0, 96);
}

function dedupeOrbs<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const next: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    next.push(item);
  }

  return next;
}

function displayModeForType(type: ArtifactType): CaptureDisplayMode {
  switch (type) {
    case "audio":
      return "waveform";
    case "image":
      return "photo";
    case "code":
      return "code-panel";
    case "fragment":
      return "fragment-shard";
    case "context":
      return "sticky-note";
    case "memory":
      return "pinboard";
    case "journal":
    default:
      return "scorch";
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
