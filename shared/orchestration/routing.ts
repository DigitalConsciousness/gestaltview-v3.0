import type {
  ArtifactDestination,
  ArtifactType,
  SourceRoom,
  SynthesisStyle,
} from "../gen-engine/types.js";
import { classifyIntent } from "./intentClassifier.js";
import { augmentDecisionWithSkill } from "./skillRouter.js";
import { classifyState } from "./stateClassifier.js";
import type {
  OrchestratedContentKind,
  OrchestrationDecision,
  OrchestrationDestination,
  OrchestrationExportFormat,
  OrchestrationInput,
  OrchestrationNextAction,
  ProcessorId,
} from "./types.js";

const SOURCE_ROOMS: ReadonlySet<string> = new Set([
  "sanctuary",
  "blackboard-room",
  "dynamic-inner-world",
  "external-scaffold",
  "creation-corner",
  "billy",
  "import",
]);

function nowIso(): string {
  return new Date().toISOString();
}

function createDecisionId(): string {
  const random =
    typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `orch-${random}`;
}

function normalizeSourceRoom(value: SourceRoom | string): SourceRoom | string {
  const normalized = value.trim().toLowerCase().replace(/_/g, "-");
  return SOURCE_ROOMS.has(normalized) ? (normalized as SourceRoom) : value;
}

function unique<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function isExplicitArtifactTrigger(input: OrchestrationInput): boolean {
  return [
    "manual_synthesize",
    "artifact_route",
    "transcript_handoff",
    "user_requested_recap",
    "user_requested_mind_map",
    "user_requested_document",
  ].includes(input.trigger);
}

function contentKindToArtifactTarget(kind: OrchestratedContentKind): ArtifactType | undefined {
  switch (kind) {
    case "session_recap":
      return "session-recap";
    case "mind_map":
      return "mind-map";
    case "report_document":
      return "markdown";
    case "raw_capture":
      return "markdown";
    case "profile_signal":
    case "scaffold_signal":
    default:
      return undefined;
  }
}

function chooseDestination(
  input: OrchestrationInput,
  kind: OrchestratedContentKind,
): OrchestrationDestination {
  const sourceRoom = normalizeSourceRoom(input.sourceRoom);

  switch (kind) {
    case "session_recap":
    case "mind_map":
    case "report_document":
      return "creation-corner";
    case "profile_signal":
      return "profile";
    case "scaffold_signal":
      return "external-scaffold";
    case "raw_capture":
    default:
      if (sourceRoom === "import") {
        return "blackboard-room";
      }

      if (SOURCE_ROOMS.has(String(sourceRoom))) {
        return sourceRoom as SourceRoom;
      }

      return "blackboard-room";
  }
}

function chooseArtifactDestination(destination: OrchestrationDestination): ArtifactDestination | undefined {
  switch (destination) {
    case "creation-corner":
      return "creation-corner";
    case "dynamic-inner-world":
      return "dynamic-inner-world";
    case "external-scaffold":
    case "external-scaffold-pending":
      return "external-scaffold-pending";
    case "download-only":
      return "download-only";
    default:
      return undefined;
  }
}

function chooseSynthesisStyle(
  input: OrchestrationInput,
  kind: OrchestratedContentKind,
): SynthesisStyle {
  const text = [input.title ?? "", input.text ?? "", ...(input.contextClues ?? [])]
    .join("\n")
    .toLowerCase();

  if (kind === "raw_capture") {
    return "faithful";
  }

  if (text.includes("preserve voice") || text.includes("verbatim") || text.includes("exact language")) {
    return "faithful";
  }

  if (kind === "mind_map" || kind === "scaffold_signal") {
    return "technical";
  }

  if (kind === "session_recap") {
    return "convergent";
  }

  if (kind === "profile_signal") {
    return "plk-resonant";
  }

  if (text.includes("founder") || text.includes("campaign") || text.includes("investor")) {
    return "founder-voice";
  }

  return "gentle-reflective";
}

function chooseExportFormats(kind: OrchestratedContentKind): OrchestrationExportFormat[] {
  switch (kind) {
    case "session_recap":
    case "report_document":
      return ["markdown", "html", "json", "pdf_ready_html"];
    case "mind_map":
      return ["markdown", "html", "json"];
    case "raw_capture":
      return ["markdown", "json"];
    case "profile_signal":
    case "scaffold_signal":
    default:
      return ["json"];
  }
}

function chooseNextAction(
  input: OrchestrationInput,
  kind: OrchestratedContentKind,
  supportLevel: OrchestrationDecision["supportLevel"],
  shouldForgeArtifact: boolean,
): OrchestrationNextAction {
  if (supportLevel === "immediate" || supportLevel === "elevated") {
    const explicitArtifactAttempt =
      isExplicitArtifactTrigger(input) ||
      Boolean(input.artifactIntent && input.artifactIntent !== "capture" && input.artifactIntent !== "unknown");

    return shouldForgeArtifact || explicitArtifactAttempt
      ? "ask_user_to_choose"
      : "offer_gentle_next_step";
  }

  switch (kind) {
    case "session_recap":
      return "draft_session_recap";
    case "mind_map":
      return "draft_mind_map";
    case "profile_signal":
      return "queue_profile_signal";
    case "scaffold_signal":
      return "queue_scaffold_signal";
    case "report_document":
      return shouldForgeArtifact ? "forge_artifact" : "ask_user_to_choose";
    case "raw_capture":
    default:
      return input.trigger === "manual_synthesize" ? "ask_user_to_choose" : "preserve_capture";
  }
}

function chooseProcessors(
  input: OrchestrationInput,
  decision: {
    kind: OrchestratedContentKind;
    shouldForgeArtifact: boolean;
    shouldUpdateProfile: boolean;
    shouldUpdateScaffold: boolean;
    supportLevel: OrchestrationDecision["supportLevel"];
  },
): ProcessorId[] {
  const text = [input.title ?? "", input.text ?? "", ...(input.contextClues ?? [])]
    .join("\n")
    .toLowerCase();

  const processors: ProcessorId[] = ["state", "routing"];

  if (input.text?.trim()) {
    processors.push("plk");
  }

  if (
    decision.kind === "mind_map" ||
    decision.shouldUpdateScaffold ||
    /\b(connects to|circles back|reminds me|threads?|relationships?|patterns?)\b/.test(text)
  ) {
    processors.push("loom");
  }

  if (
    decision.kind === "mind_map" ||
    decision.shouldUpdateScaffold ||
    decision.kind === "scaffold_signal" ||
    decision.kind === "profile_signal"
  ) {
    processors.push("tapestry");
  }

  if (decision.shouldForgeArtifact) {
    processors.push("codex");
  }

  if (input.hasImage || input.hasAudio || input.hasVideo || input.hasFile) {
    processors.push("multimodal");
  }

  if (decision.supportLevel === "elevated" || decision.supportLevel === "immediate") {
    processors.push("safety");
  }

  return unique(processors);
}

function buildUserFacingSummary(decision: {
  kind: OrchestratedContentKind;
  destination: OrchestrationDestination;
  nextAction: OrchestrationNextAction;
  supportLevel: OrchestrationDecision["supportLevel"];
}): string {
  if (decision.supportLevel === "immediate") {
    return "This should stay in a conservative support path first. Preserve the capture and surface a grounded next step before synthesis.";
  }

  if (decision.supportLevel === "elevated") {
    return "This looks like a high-load moment. Preserve the raw signal and ask before turning it into a larger artifact.";
  }

  switch (decision.nextAction) {
    case "draft_session_recap":
      return "This is ready to become a session recap in Creation Corner.";
    case "draft_mind_map":
      return "This wants a mind map: preserve the threads, connections, and source language.";
    case "queue_profile_signal":
      return "This looks profile-relevant and should become a private profile signal.";
    case "queue_scaffold_signal":
      return "This belongs in External Scaffold as a connection or dependency signal.";
    case "forge_artifact":
      return "This is artifact-ready and can be sent through the forge.";
    case "preserve_capture":
      return "Preserve this as a raw capture first; it does not need to become an artifact yet.";
    case "offer_gentle_next_step":
      return "Offer one grounded next step and keep the original capture intact.";
    case "ask_user_to_choose":
    default:
      return "Ask the user which shape this should take before generating.";
  }
}

export function decideOrchestration(
  input: OrchestrationInput,
): OrchestrationDecision & { diSelection: import("./skillRouter.js").DISelection } {
  const state = classifyState(input);
  const intent = classifyIntent(input);
  const sourceRoom = normalizeSourceRoom(input.sourceRoom);

  const destination = chooseDestination(input, intent.contentKind);
  const artifactTargetType = contentKindToArtifactTarget(intent.contentKind);
  const artifactDestination = chooseArtifactDestination(destination);
  const synthesisStyle = chooseSynthesisStyle(input, intent.contentKind);
  const exportFormats = chooseExportFormats(intent.contentKind);

  const conservativeSupport =
    state.supportLevel === "elevated" || state.supportLevel === "immediate";

  const shouldUpdateProfile = intent.contentKind === "profile_signal";
  const shouldUpdateScaffold =
    intent.contentKind === "scaffold_signal" || intent.contentKind === "mind_map";

  const shouldForgeArtifact =
    Boolean(artifactTargetType) &&
    (isExplicitArtifactTrigger(input) || intent.contentKind === "session_recap") &&
    !(
      conservativeSupport &&
      !["user_requested_recap", "user_requested_document", "user_requested_mind_map"].includes(input.trigger)
    );

  const shouldPersistSignal =
    input.trigger !== "manual_synthesize" ||
    intent.contentKind === "profile_signal" ||
    intent.contentKind === "scaffold_signal";

  const nextAction = chooseNextAction(input, intent.contentKind, state.supportLevel, shouldForgeArtifact);

  const processors = chooseProcessors(input, {
    kind: intent.contentKind,
    shouldForgeArtifact,
    shouldUpdateProfile,
    shouldUpdateScaffold,
    supportLevel: state.supportLevel,
  });

  const confidence = Math.min(0.98, Math.max(0.4, (state.confidence + intent.confidence) / 2));

  const internalDiagnostics = [
    ...state.internalDiagnostics,
    ...intent.internalDiagnostics,
    `sourceRoom:${String(sourceRoom)}`,
    `destination:${destination}`,
    `trigger:${input.trigger}`,
    shouldForgeArtifact ? "artifact forge allowed by trigger/rules." : "artifact forge not selected for this decision.",
    "Triggered-event decision only; no background or always-on behavior implied.",
  ];

  const userFacingSummary = buildUserFacingSummary({
    kind: intent.contentKind,
    destination,
    nextAction,
    supportLevel: state.supportLevel,
  });

  const baseDecision: OrchestrationDecision = {
    decisionId: createDecisionId(),
    triggeredAt: nowIso(),
    trigger: input.trigger,
    sourceRoom,
    detectedState: state.detectedState,
    supportLevel: state.supportLevel,
    contentKind: intent.contentKind,
    destination,
    artifactTargetType,
    artifactDestination,
    synthesisStyle,
    processors,
    exportFormats,
    nextAction,
    shouldForgeArtifact,
    shouldPersistSignal,
    shouldUpdateProfile,
    shouldUpdateScaffold,
    confidence,
    userFacingSummary,
    internalDiagnostics,
  };

  // Level-2 skill routing: attach diSelection (who + skill + execution surface)
  return augmentDecisionWithSkill(baseDecision, input);
}
