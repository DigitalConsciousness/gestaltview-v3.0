export type SourceRoom =
  | "sanctuary"
  | "blackboard-room"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "billy"
  | "import";

export type ConsentState = {
  analyzeText: boolean;
  analyzeImage: boolean;
  analyzeAudio: boolean;
  analyzeVideo: boolean;
  inferEmotion: boolean;
  storeDerivativeSignals: boolean;
};

export type FusionSignal = {
  id: string;
  modality: "text" | "image" | "audio" | "video" | "file";
  adapter: string;
  success: boolean;
  vector?: number[];
  descriptor?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  warnings?: string[];
};

export type ArtifactType =
  | "markdown"
  | "pdf-ready-html"
  | "blueprint-json"
  | "blueprint-markdown"
  | "agent-prompt"
  | "image-prompt"
  | "marketing-copy"
  | "share-card"
  | "code"
  | "session-recap"
  | "mind-map";

export type SynthesisStyle =
  | "faithful"
  | "convergent"
  | "divergent"
  | "revolutionary"
  | "gentle-reflective"
  | "technical"
  | "founder-voice"
  | "plk-resonant";

export type ArtifactDestination =
  | "creation-corner"
  | "dynamic-inner-world"
  | "external-scaffold-pending"
  | "download-only"
  | "gate-package-draft";

export type GeneratedArtifact = {
  id: string;
  userId?: string;
  title: string;
  type: ArtifactType;
  content: string;
  contentFormat: "markdown" | "html" | "json" | "text" | "code";
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  destination: ArtifactDestination;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type ProvenanceEnvelope = {
  artifactId: string;
  sourceCaptureIds: string[];
  sourceHashes: string[];
  artifactHash: string;
  transformType: "summary" | "synthesis" | "translation" | "formatting" | "prompt-generation";
  generatedAt: string;
  engineVersion: string;
  modelProvider?: string;
  modelName?: string;
};

export type AmbientCoherenceSignal = {
  id: string;
  title: string;
  sourceCaptureIds: string[];
  observation: string;
  suggestedAction: "open-cluster" | "send-to-creation-corner" | "ignore" | "archive-suggestion-review";
  confidence: number;
  pressureLevel: "quiet" | "medium";
  generatedAt: string;
};

export type GenEngineHealth = {
  status: "operational" | "degraded" | "offline";
  adapters: Record<string, boolean>;
  version: string;
  warnings: string[];
};

export type FusionRequest = {
  captureId?: string;
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
  audioUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  sourceRoom: SourceRoom | string;
  consent: ConsentState;
  userId?: string;
  context?: Record<string, unknown>;
};

export type FusionResponse = {
  success: boolean;
  captureId: string;
  fusedText: string;
  embedding?: number[];
  signals: FusionSignal[];
  metadata: Record<string, unknown>;
  warnings: string[];
};

export type ResonanceRequest = {
  text: string;
  userId?: string;
  plkContext?: Record<string, string>;
};

export type ResonanceResponse = {
  score: number;
  metaphorsMatched: string[];
  energyBoost: number;
  triggerPenalty: number;
  warnings: string[];
};

export type LearnRequest = {
  captureId?: string;
  multiInput: Record<string, unknown>;
  aiOutput: string;
  userFeedback: number;
};

export type LearnResponse = {
  status: "queued" | "stored" | "skipped";
  message: string;
};

export type PredictionRequest = {
  text?: string;
  visualUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  scope?: "current-session" | "selected-captures" | "arc";
};

export type PredictionResponse = {
  prediction: string;
  confidence: number;
  source: "history" | "fallback" | "none";
  warnings: string[];
};

export type LightningRequest = {
  content: string;
  intensity?: number;
  tags?: string[];
  sourceRoom: SourceRoom | string;
};

export type LightningResponse = {
  boltId: string;
  resonanceScore: number;
  message: string;
};

export type ArtifactSynthesisRequest = {
  sourceCaptureIds: string[];
  sourceArtifactIds?: string[];
  targetType: ArtifactType;
  synthesisStyle: SynthesisStyle;
  destination: ArtifactDestination;
  userInstructions?: string;
  preserveExactLanguage: boolean;
  plkMode: "off" | "score-only" | "light-touch" | "full-resonance-pass";
  title?: string;
  summary?: string;
  sourceTitle?: string;
  sourceSummary?: string;
  sourceText?: string;
  sourceRoom?: SourceRoom | string;
  consent?: ConsentState;
  tags?: string[];
  userId?: string;
};

export type ArtifactSynthesisResponse = {
  artifact: GeneratedArtifact;
  provenance: ProvenanceEnvelope;
  warnings: string[];
  reviewRequired: boolean;
};

export type AmbientScanRequest = {
  userId: string;
  room: "dynamic-inner-world" | "creation-corner" | "all";
  timeRange?: { from?: string; to?: string };
  maxSignals?: number;
};

export type AmbientScanResponse = {
  signals: AmbientCoherenceSignal[];
  generatedArtifacts: never[];
};

export type ArtifactExportFormat = "markdown" | "html" | "json" | "text" | "code";

export type ArtifactExportResult = {
  fileName: string;
  mimeType: string;
  content: string;
};

export type CreationCornerDraftInput = {
  title: string;
  summary: string;
  tags: string[];
  status: "draft" | "ready" | "exported";
  note: string;
  sourceMarkdown: string;
  sourceBlueprintJson: string;
  sourceCaptureIds: string[];
  captureCount: number;
  sourceRoom?: SourceRoom | string;
};

export type CreationCornerOutputFamily = {
  markdown: string;
  html: string;
  code: string;
  agentPrompt: string;
  imagePrompt: string;
  marketingCopy: string;
  shareCard: string;
  pdfHtml: string;
};
