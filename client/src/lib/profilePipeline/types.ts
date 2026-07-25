import type {
  GestaltEvent,
  GestaltEventActorType,
} from "@shared/events/gestaltEvents";

export type ProfilePipelineRoom =
  | "sanctuary"
  | "blackboard-room"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "profile"
  | "embodiment-studio"
  | "digital-intelligence-academy";

export type CaptureSourceType = "text" | "voice" | "audio" | "image" | "video" | "file" | "import";
export type CapturePreservationStatus = "private" | "released" | "dormant" | "deleted_by_user";
export type ScaffoldReviewState = "pending" | "approved" | "denied" | "dormant" | "released";
export type ArtifactType = "markdown" | "html" | "code" | "json" | "image_prompt" | "file";
export type ConsentTier =
  | "private_default"
  | "room_local"
  | "cross_room_allowed"
  | "profile_pipeline_allowed"
  | "trainer_allowed"
  | "export_allowed"
  | "public_allowed";

export type CaptureEventRecord = {
  captureId: string;
  ownerUserId?: string;
  room: ProfilePipelineRoom;
  sourceType: CaptureSourceType;
  originalText: string;
  normalizedText?: string;
  preservationStatus: CapturePreservationStatus;
  consentState: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ScaffoldNodeRecord = {
  nodeId: string;
  ownerUserId?: string;
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  title: string;
  body: string;
  reviewState: ScaffoldReviewState;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProvenanceEnvelope = {
  subjectType: string;
  subjectId: string;
  contentHash: string;
  canonicalizationMethod: string;
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  sourceScaffoldNodeIds: string[];
  pipelineRunId?: string;
  operations: string[];
  privacyClass: "private" | "shared" | "enterprise" | "public";
  consentState: Record<string, unknown>;
  createdAt: string;
};

export type ArtifactRecord = {
  artifactId: string;
  ownerUserId?: string;
  title: string;
  body: string;
  artifactType: ArtifactType;
  sourceCaptureIds: string[];
  sourceScaffoldNodeIds: string[];
  provenance: ProvenanceEnvelope;
  createdAt: string;
  updatedAt: string;
};

export type IdentityClaimRecord = {
  claimId: string;
  ownerUserId?: string;
  claimText: string;
  evidenceArtifactIds: string[];
  evidenceScaffoldNodeIds: string[];
  reviewState: "proposed" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type RecordCaptureInput = {
  ownerUserId?: string;
  room: ProfilePipelineRoom;
  sourceType: CaptureSourceType;
  originalText: string;
  consentTier?: ConsentTier;
  consentState?: Record<string, unknown>;
};

export type CreateArtifactInput = {
  ownerUserId?: string;
  title: string;
  body: string;
  artifactType: ArtifactType;
  sourceCaptureIds?: string[];
  sourceScaffoldNodeIds?: string[];
  pipelineRunId?: string;
  consentTier?: ConsentTier;
  consentState?: Record<string, unknown>;
  operations?: string[];
};

export type ReleaseCaptureToScaffoldInput = {
  captureId: string;
  actorType: GestaltEventActorType;
  title?: string;
  body?: string;
};

export type ProfilePipelineStore = {
  saveCapture(capture: CaptureEventRecord): Promise<CaptureEventRecord>;
  getCapture(captureId: string): Promise<CaptureEventRecord | null>;
  updateCapture(
    captureId: string,
    patch: Partial<Omit<CaptureEventRecord, "captureId" | "originalText" | "createdAt">> & {
      explicitUserAction?: boolean;
    },
  ): Promise<CaptureEventRecord>;
  listScaffoldNodes(): Promise<ScaffoldNodeRecord[]>;
  getScaffoldNode?(nodeId: string): Promise<ScaffoldNodeRecord | null>;
  updateScaffoldNode?(
    nodeId: string,
    patch: Partial<Omit<ScaffoldNodeRecord, "nodeId" | "createdAt">>,
  ): Promise<ScaffoldNodeRecord>;
  saveScaffoldNode(node: ScaffoldNodeRecord): Promise<ScaffoldNodeRecord>;
  saveArtifact(artifact: ArtifactRecord): Promise<ArtifactRecord>;
  saveIdentityClaim(claim: IdentityClaimRecord): Promise<IdentityClaimRecord>;
  publishEvent?(event: GestaltEvent): void;
};
