import type {
  IntentClassification,
  OrchestratedContentKind,
  OrchestrationInput,
} from "./types.js";

function normalizeText(input: OrchestrationInput): string {
  return [
    input.artifactIntent ?? "",
    input.title ?? "",
    input.text ?? "",
    ...(input.contextClues ?? []),
    input.trigger,
  ]
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function collectMarkers(text: string, patterns: readonly string[]): string[] {
  return patterns.filter((pattern) => text.includes(pattern));
}

const RECAP_PATTERNS = [
  "recap",
  "session recap",
  "summarize this session",
  "what happened",
  "open loops",
  "decisions",
] as const;

const MIND_MAP_PATTERNS = [
  "mind map",
  "mind-map",
  "map this",
  "threads",
  "connections",
  "connects to",
  "circles back",
  "reminds me",
  "relationship map",
] as const;

const PROFILE_PATTERNS = [
  "profile",
  "plk",
  "personal language",
  "identity",
  "pattern about me",
  "who i am",
  "how i think",
  "my voice",
] as const;

const SCAFFOLD_PATTERNS = [
  "scaffold",
  "external scaffold",
  "external factors",
  "knowledge graph",
  "graph",
  "link this",
  "relationships",
  "dependencies",
] as const;

const DOCUMENT_PATTERNS = [
  "document",
  "report",
  "spec",
  "blueprint",
  "pdf",
  "markdown",
  "deck",
  "export",
  "package",
] as const;

const CAPTURE_PATTERNS = [
  "capture",
  "save this",
  "hold this",
  "bucket drop",
  "lightning",
  "raw note",
] as const;

function explicitIntentToKind(intent: OrchestrationInput["artifactIntent"]): OrchestratedContentKind | null {
  switch (intent) {
    case "recap":
      return "session_recap";
    case "document":
      return "report_document";
    case "mind_map":
      return "mind_map";
    case "profile":
      return "profile_signal";
    case "scaffold":
      return "scaffold_signal";
    case "capture":
      return "raw_capture";
    case "unknown":
    case undefined:
    default:
      return null;
  }
}

function triggerToKind(trigger: OrchestrationInput["trigger"]): OrchestratedContentKind | null {
  switch (trigger) {
    case "session_end":
    case "user_requested_recap":
      return "session_recap";
    case "user_requested_mind_map":
      return "mind_map";
    case "user_requested_document":
      return "report_document";
    case "user_requested_profile":
      return "profile_signal";
    case "user_requested_scaffold":
      return "scaffold_signal";
    case "capture_saved":
      return "raw_capture";
    default:
      return null;
  }
}

export function classifyIntent(input: OrchestrationInput): IntentClassification {
  const text = normalizeText(input);
  const diagnostics: string[] = [];

  const explicit = explicitIntentToKind(input.artifactIntent);
  if (explicit) {
    return {
      contentKind: explicit,
      confidence: 0.95,
      markers: [`artifactIntent:${input.artifactIntent}`],
      internalDiagnostics: ["Intent resolved from explicit artifactIntent."],
    };
  }

  const triggerKind = triggerToKind(input.trigger);
  if (triggerKind) {
    return {
      contentKind: triggerKind,
      confidence: 0.9,
      markers: [`trigger:${input.trigger}`],
      internalDiagnostics: ["Intent resolved from explicit trigger."],
    };
  }

  const candidates: Array<{
    kind: OrchestratedContentKind;
    markers: string[];
    base: number;
  }> = [
    { kind: "session_recap" as const, markers: collectMarkers(text, RECAP_PATTERNS), base: 0.68 },
    { kind: "mind_map" as const, markers: collectMarkers(text, MIND_MAP_PATTERNS), base: 0.7 },
    { kind: "profile_signal" as const, markers: collectMarkers(text, PROFILE_PATTERNS), base: 0.66 },
    { kind: "scaffold_signal" as const, markers: collectMarkers(text, SCAFFOLD_PATTERNS), base: 0.68 },
    { kind: "report_document" as const, markers: collectMarkers(text, DOCUMENT_PATTERNS), base: 0.64 },
    { kind: "raw_capture" as const, markers: collectMarkers(text, CAPTURE_PATTERNS), base: 0.6 },
  ].filter((candidate) => candidate.markers.length > 0);

  if (candidates.length === 0) {
    diagnostics.push("No strong intent markers detected; using raw_capture fallback.");
    return {
      contentKind: "raw_capture",
      confidence: 0.52,
      markers: [],
      internalDiagnostics: diagnostics,
    };
  }

  candidates.sort((a, b) => b.markers.length + b.base - (a.markers.length + a.base));
  const best = candidates[0];

  return {
    contentKind: best.kind,
    confidence: Math.min(0.92, best.base + best.markers.length * 0.08),
    markers: best.markers,
    internalDiagnostics: [`Intent resolved from markers: ${best.markers.join(", ")}`],
  };
}
