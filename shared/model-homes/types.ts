export type ModelHomeRing = "inner_slm" | "outer_llm" | "adapter" | "embedding" | "judge";
export type ModelHomeModality = "text" | "image" | "audio" | "video" | "file" | "embedding";
export type ModelHomePrivacyTier = "local_only" | "private_cloud" | "external_api" | "restricted";
export type ModelHomeStatus = "draft" | "active" | "paused" | "deprecated";
export type ModelHomeConsentTier =
  | "private_default"
  | "room_local"
  | "cross_room_allowed"
  | "profile_pipeline_allowed"
  | "trainer_allowed"
  | "export_allowed"
  | "public_allowed";

export type ModelHome = {
  id: string;
  slug: string;
  displayName: string;
  providerSlug: string;
  modelSlug: string;
  ring: ModelHomeRing;
  modality: ModelHomeModality[];
  strengths: string[];
  limitations: string[];
  defaultRooms: string[];
  privacyTier: ModelHomePrivacyTier;
  consentRequired: boolean;
  maxContextTokens?: number;
  costTier: 0 | 1 | 2 | 3;
  speedTier: 0 | 1 | 2 | 3;
  supportsStructuredOutput: boolean;
  supportsTools: boolean;
  supportsEmbeddings: boolean;
  fallbackModelHomeSlug?: string;
  governance: {
    allowedForIdentityClaims: boolean;
    allowedForEmbodimentMutation: boolean;
    allowedForTrainerJudging: boolean;
    requiresFounderApproval: boolean;
  };
  status: ModelHomeStatus;
};

export type ModelHomeRouteRequest = {
  homes?: ModelHome[];
  room: string;
  taskType: "capture" | "interpret" | "synthesize" | "identity_claim" | "trainer_eval" | "embedding";
  modalities: ModelHomeModality[];
  consentTier: ModelHomeConsentTier;
};
