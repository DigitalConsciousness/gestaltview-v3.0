import type {
  DetectedState,
  OrchestrationInput,
  StateClassification,
  SupportLevel,
} from "./types.js";

function normalizeText(input: OrchestrationInput): string {
  return [
    input.title ?? "",
    input.text ?? "",
    ...(input.contextClues ?? []),
  ]
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function collectMarkers(text: string, patterns: readonly string[]): string[] {
  return patterns.filter((pattern) => text.includes(pattern));
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

const IMMEDIATE_SUPPORT_PATTERNS = [
  "kill myself",
  "hurt myself",
  "end my life",
  "not safe",
  "can't stay safe",
  "cannot stay safe",
  "suicide",
  "self harm",
  "self-harm",
] as const;

const ELEVATED_SUPPORT_PATTERNS = [
  "don't know how to cope",
  "cant cope",
  "can't cope",
  "completely overwhelmed",
  "spiraling",
  "falling apart",
  "breaking down",
  "no way out",
] as const;

const PROCESSING_LOAD_PATTERNS = [
  "overwhelmed",
  "carrying",
  "weight",
  "too much",
  "stuck",
  "scattered",
  "can't organize",
  "cannot organize",
  "cognitive load",
  "too many tabs",
  "brain is on fire",
] as const;

const BREAKTHROUGH_PATTERNS = [
  "mind blown",
  "my mind is blown",
  "this is the moment",
  "significant",
  "breakthrough",
  "this changes everything",
  "paradigm",
  "i just realized",
] as const;

const ACTIVE_CREATION_PATTERNS = [
  "building",
  "creating",
  "implement",
  "implementation",
  "shipping",
  "weaving",
  "forge",
  "artifact",
  "spec",
  "codex",
  "repo",
] as const;

const HYPERFOCUS_PATTERNS = [
  "hyperfocus",
  "locked in",
  "in flow",
  "flow state",
  "zone",
] as const;

const LATE_NIGHT_PATTERNS = [
  "4am",
  "late night",
  "rambling",
  "tangent",
  "voice to text",
  "speech to text",
] as const;

export function classifySupportLevel(input: OrchestrationInput): {
  supportLevel: SupportLevel;
  markers: string[];
  confidence: number;
} {
  const text = normalizeText(input);
  const immediateMarkers = collectMarkers(text, IMMEDIATE_SUPPORT_PATTERNS);
  if (immediateMarkers.length > 0) {
    return {
      supportLevel: "immediate",
      markers: immediateMarkers,
      confidence: 0.96,
    };
  }

  const elevatedMarkers = collectMarkers(text, ELEVATED_SUPPORT_PATTERNS);
  if (elevatedMarkers.length > 0) {
    return {
      supportLevel: "elevated",
      markers: elevatedMarkers,
      confidence: 0.82,
    };
  }

  const loadMarkers = collectMarkers(text, PROCESSING_LOAD_PATTERNS);
  if (loadMarkers.length > 0 || (typeof input.energyLevel === "number" && input.energyLevel <= 3)) {
    return {
      supportLevel: "low",
      markers: loadMarkers,
      confidence: 0.62,
    };
  }

  return {
    supportLevel: "none",
    markers: [],
    confidence: 0.5,
  };
}

export function classifyState(input: OrchestrationInput): StateClassification {
  const text = normalizeText(input);
  const energy = typeof input.energyLevel === "number" ? input.energyLevel : undefined;
  const diagnostics: string[] = [];
  const support = classifySupportLevel(input);

  const lateNightMarkers = collectMarkers(text, LATE_NIGHT_PATTERNS);
  const loadMarkers = collectMarkers(text, PROCESSING_LOAD_PATTERNS);
  const breakthroughMarkers = collectMarkers(text, BREAKTHROUGH_PATTERNS);
  const creationMarkers = collectMarkers(text, ACTIVE_CREATION_PATTERNS);
  const hyperfocusMarkers = collectMarkers(text, HYPERFOCUS_PATTERNS);

  let detectedState: DetectedState = "steady_processing";
  let markers: string[] = [];
  let confidence = 0.52;

  if (energy !== undefined && energy <= 3) {
    detectedState = "low_energy";
    markers = [`energy:${energy}`, ...loadMarkers];
    confidence = 0.78;
  }

  if (lateNightMarkers.length > 0) {
    detectedState = "late_night_processing";
    markers = [...markers, ...lateNightMarkers];
    confidence = Math.max(confidence, 0.72);
  }

  if (loadMarkers.length > 0 && detectedState !== "low_energy") {
    detectedState = "processing_load";
    markers = [...markers, ...loadMarkers];
    confidence = Math.max(confidence, 0.76);
  }

  if (breakthroughMarkers.length > 0) {
    detectedState = "breakthrough_processing";
    markers = [...markers, ...breakthroughMarkers];
    confidence = Math.max(confidence, 0.82);
  }

  if (creationMarkers.length > 0 && breakthroughMarkers.length === 0 && detectedState !== "processing_load") {
    detectedState = "active_creation";
    markers = [...markers, ...creationMarkers];
    confidence = Math.max(confidence, 0.74);
  }

  if (hyperfocusMarkers.length > 0 || (energy !== undefined && energy >= 9 && creationMarkers.length > 0)) {
    detectedState = "hyperfocus";
    markers = [...markers, ...hyperfocusMarkers, ...(energy !== undefined ? [`energy:${energy}`] : [])];
    confidence = Math.max(confidence, 0.84);
  }

  if (support.supportLevel === "immediate") {
    diagnostics.push("Immediate support markers detected; route should be conservative and include safety processor.");
  } else if (support.supportLevel === "elevated") {
    diagnostics.push("Elevated support markers detected; avoid aggressive artifact forging unless explicitly requested.");
  }

  if (markers.length === 0) {
    diagnostics.push("No strong state markers detected; using steady_processing fallback.");
  }

  return {
    detectedState,
    supportLevel: support.supportLevel,
    confidence: clamp((confidence + support.confidence) / 2),
    markers: Array.from(new Set([...markers, ...support.markers])),
    internalDiagnostics: diagnostics,
  };
}
