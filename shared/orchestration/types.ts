import type {
  ArtifactDestination,
  ArtifactType,
  ConsentState,
  SourceRoom,
  SynthesisStyle,
} from "../gen-engine/types.js";

export type OrchestrationTrigger =
  | "manual_synthesize"
  | "session_end"
  | "capture_saved"
  | "transcript_handoff"
  | "artifact_route"
  | "upload_processed"
  | "user_requested_recap"
  | "user_requested_mind_map"
  | "user_requested_document"
  | "user_requested_profile"
  | "user_requested_scaffold";

export type ArtifactIntent =
  | "recap"
  | "document"
  | "mind_map"
  | "profile"
  | "scaffold"
  | "capture"
  | "unknown";

export type DetectedState =
  | "steady_processing"
  | "processing_load"
  | "active_creation"
  | "breakthrough_processing"
  | "hyperfocus"
  | "low_energy"
  | "late_night_processing";

export type SupportLevel = "none" | "low" | "elevated" | "immediate";

export type OrchestratedContentKind =
  | "raw_capture"
  | "session_recap"
  | "report_document"
  | "mind_map"
  | "profile_signal"
  | "scaffold_signal";

export type OrchestrationDestination =
  | SourceRoom
  | "profile"
  | "external-scaffold-pending"
  | "download-only";

export type ProcessorId =
  | "state"
  | "routing"
  | "plk"
  | "loom"
  | "tapestry"
  | "codex"
  | "multimodal"
  | "safety";

export type OrchestrationExportFormat =
  | "markdown"
  | "html"
  | "json"
  | "pdf_ready_html";

export type OrchestrationNextAction =
  | "preserve_capture"
  | "offer_gentle_next_step"
  | "forge_artifact"
  | "draft_session_recap"
  | "draft_mind_map"
  | "queue_profile_signal"
  | "queue_scaffold_signal"
  | "ask_user_to_choose";

export type OrchestralGateState = "auto" | "approval";

export type OrchestralWorkerId =
  | "intake"
  | "normalization"
  | "profile_enrichment"
  | "scaffold_context"
  | "orb_generation"
  | "synthesis"
  | "rendering"
  | "persistence"
  | "presentation"
  | "validation";

export type OrchestrationInput = {
  trigger: OrchestrationTrigger;
  sourceRoom: SourceRoom | string;
  text?: string;
  title?: string;
  artifactIntent?: ArtifactIntent;
  energyLevel?: number;
  contextClues?: string[];
  userId?: string;
  sourceCaptureIds?: string[];
  sourceArtifactIds?: string[];
  hasImage?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasFile?: boolean;
  consent?: Partial<ConsentState>;
  meta?: Record<string, unknown>;
};

export type StateClassification = {
  detectedState: DetectedState;
  supportLevel: SupportLevel;
  confidence: number;
  markers: string[];
  internalDiagnostics: string[];
};

export type IntentClassification = {
  contentKind: OrchestratedContentKind;
  confidence: number;
  markers: string[];
  internalDiagnostics: string[];
};

export type OrchestrationDecision = {
  decisionId: string;
  triggeredAt: string;
  trigger: OrchestrationTrigger;
  sourceRoom: SourceRoom | string;
  detectedState: DetectedState;
  supportLevel: SupportLevel;
  contentKind: OrchestratedContentKind;
  destination: OrchestrationDestination;
  artifactTargetType?: ArtifactType;
  artifactDestination?: ArtifactDestination;
  synthesisStyle: SynthesisStyle;
  processors: ProcessorId[];
  exportFormats: OrchestrationExportFormat[];
  nextAction: OrchestrationNextAction;
  shouldForgeArtifact: boolean;
  shouldPersistSignal: boolean;
  shouldUpdateProfile: boolean;
  shouldUpdateScaffold: boolean;
  confidence: number;
  userFacingSummary: string;
  internalDiagnostics: string[];
};
