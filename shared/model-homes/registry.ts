import type { ModelHome, ModelHomePrivacyTier, ModelHomeRouteRequest } from "./types";

export const DEFAULT_MODEL_HOMES: ModelHome[] = [
  {
    id: "model-home-local-capture",
    slug: "local-private-capture",
    displayName: "Local Private Capture",
    providerSlug: "local",
    modelSlug: "local-small-text",
    ring: "inner_slm",
    modality: ["text", "file"],
    strengths: ["private capture", "fast routing", "low-cost summaries"],
    limitations: ["limited deep synthesis"],
    defaultRooms: ["sanctuary", "blackboard-room"],
    privacyTier: "local_only",
    consentRequired: false,
    maxContextTokens: 8192,
    costTier: 0,
    speedTier: 3,
    supportsStructuredOutput: true,
    supportsTools: false,
    supportsEmbeddings: false,
    fallbackModelHomeSlug: "groq-fast-structured",
    governance: {
      allowedForIdentityClaims: false,
      allowedForEmbodimentMutation: false,
      allowedForTrainerJudging: false,
      requiresFounderApproval: false,
    },
    status: "active",
  },
  {
    id: "model-home-groq-fast",
    slug: "groq-fast-structured",
    displayName: "Groq Fast Structured",
    providerSlug: "groq",
    modelSlug: "llama-3.1-70b-versatile",
    ring: "outer_llm",
    modality: ["text"],
    strengths: ["structured synthesis", "artifact compression"],
    limitations: ["external API boundary"],
    defaultRooms: ["blackboard-room", "external-scaffold", "creation-corner"],
    privacyTier: "private_cloud",
    consentRequired: true,
    maxContextTokens: 131072,
    costTier: 1,
    speedTier: 3,
    supportsStructuredOutput: true,
    supportsTools: true,
    supportsEmbeddings: false,
    governance: {
      allowedForIdentityClaims: false,
      allowedForEmbodimentMutation: false,
      allowedForTrainerJudging: false,
      requiresFounderApproval: false,
    },
    status: "active",
  },
  {
    id: "model-home-openai-synthesis",
    slug: "openai-gpt-4o-synthesis",
    displayName: "OpenAI Deep Synthesis",
    providerSlug: "openai",
    modelSlug: "gpt-4o",
    ring: "outer_llm",
    modality: ["text", "image", "file"],
    strengths: ["deep reasoning", "multimodal synthesis"],
    limitations: ["external API boundary", "higher cost"],
    defaultRooms: ["creation-corner", "dynamic-inner-world"],
    privacyTier: "external_api",
    consentRequired: true,
    maxContextTokens: 128000,
    costTier: 3,
    speedTier: 1,
    supportsStructuredOutput: true,
    supportsTools: true,
    supportsEmbeddings: false,
    governance: {
      allowedForIdentityClaims: false,
      allowedForEmbodimentMutation: false,
      allowedForTrainerJudging: false,
      requiresFounderApproval: true,
    },
    status: "active",
  },
  {
    id: "model-home-judge",
    slug: "trainer-judge-rubric",
    displayName: "Trainer Judge Rubric",
    providerSlug: "openai_compatible",
    modelSlug: "judge-rubric",
    ring: "judge",
    modality: ["text"],
    strengths: ["rubric judging", "policy review"],
    limitations: ["not for user identity mutation"],
    defaultRooms: ["agent-trainer"],
    privacyTier: "restricted",
    consentRequired: true,
    costTier: 2,
    speedTier: 1,
    supportsStructuredOutput: true,
    supportsTools: false,
    supportsEmbeddings: false,
    governance: {
      allowedForIdentityClaims: false,
      allowedForEmbodimentMutation: false,
      allowedForTrainerJudging: true,
      requiresFounderApproval: true,
    },
    status: "active",
  },
];

const PRIVACY_RANK: Record<ModelHomePrivacyTier, number> = {
  local_only: 0,
  private_cloud: 1,
  external_api: 2,
  restricted: 3,
};

const CONSENT_PRIVACY_CEILING: Record<ModelHomeRouteRequest["consentTier"], number> = {
  private_default: PRIVACY_RANK.private_cloud,
  room_local: PRIVACY_RANK.private_cloud,
  cross_room_allowed: PRIVACY_RANK.private_cloud,
  profile_pipeline_allowed: PRIVACY_RANK.external_api,
  trainer_allowed: PRIVACY_RANK.restricted,
  export_allowed: PRIVACY_RANK.restricted,
  public_allowed: PRIVACY_RANK.restricted,
};

export function routeModelHome(request: ModelHomeRouteRequest): ModelHome | null {
  const homes = request.homes ?? DEFAULT_MODEL_HOMES;
  const privacyCeiling = CONSENT_PRIVACY_CEILING[request.consentTier];

  const candidates = homes
    .filter((home) => home.status === "active")
    .filter((home) => PRIVACY_RANK[home.privacyTier] <= privacyCeiling)
    .filter((home) => request.modalities.every((modality) => home.modality.includes(modality)))
    .filter((home) => {
      if (request.taskType === "trainer_eval") {
        return home.governance.allowedForTrainerJudging;
      }
      if (request.taskType === "identity_claim") {
        return !home.governance.allowedForIdentityClaims;
      }
      if (request.taskType === "embedding") {
        return home.supportsEmbeddings || home.ring === "embedding";
      }
      return true;
    });

  return candidates.sort((left, right) => {
    const privacy = PRIVACY_RANK[left.privacyTier] - PRIVACY_RANK[right.privacyTier];
    if (privacy !== 0) return privacy;
    const room = Number(right.defaultRooms.includes(request.room)) - Number(left.defaultRooms.includes(request.room));
    if (room !== 0) return room;
    const cost = left.costTier - right.costTier;
    if (cost !== 0) return cost;
    return right.speedTier - left.speedTier;
  })[0] ?? null;
}
