import type { KitTierName } from "./tiers.js";

export type BuyerSegment = "solo" | "business" | "enterprise";

export interface SegmentDefinition {
  segment: BuyerSegment;
  label: string;
  promise: string;
  packagingModel: string;
  onboardingPath: string;
  dashboardEmphasis: string;
  primaryJobs: string[];
  starterTemplates: string[];
}

export interface SegmentRecommendationInput {
  teamSize?: number;
  needsCompliance?: boolean;
  multiWorkspace?: boolean;
  identityBoundary?: boolean;
  sourceVolume?: number;
  deploymentPreference?: "hosted" | "hybrid" | "private";
}

export interface SegmentRecommendation {
  segment: BuyerSegment;
  score: number;
  breakdown: {
    teamSizeWeight: number;
    complianceWeight: number;
    multiWorkspaceWeight: number;
    identityWeight: number;
    sourceVolumeWeight: number;
    deploymentPreferenceWeight: number;
  };
}

export const segmentDefinitions: Record<BuyerSegment, SegmentDefinition> = {
  solo: {
    segment: "solo",
    label: "Solo",
    promise: "Launch a grounded personal or client-facing agent in under an hour.",
    packagingModel: "Single workspace, guided defaults, premium presets, simple billing.",
    onboardingPath: "Low-friction launch path with a single workspace, one provider, and fast publish.",
    dashboardEmphasis: "Theme personalization, lane readiness, first-eval wins, and publish momentum.",
    primaryJobs: [
      "Ingest a small, high-signal corpus.",
      "Configure brand and tone without editing code.",
      "Validate answers quickly and publish a polished assistant."
    ],
    starterTemplates: ["consultant", "creator", "coach", "indie-builder"]
  },
  business: {
    segment: "business",
    label: "Business",
    promise: "Turn team knowledge, code context, and operating language into a shared AI workspace.",
    packagingModel: "Shared workspace with reusable packs, multiple agents, analytics, and admin controls.",
    onboardingPath: "Collaborative rollout with invites, lane ownership, import automation, and usage tracking.",
    dashboardEmphasis: "Shared memory controls, reusable packs, activation milestones, and weak-answer diagnostics.",
    primaryJobs: [
      "Onboard multiple contributors and define lane owners.",
      "Operationalize reusable packs and shared memory.",
      "Track usage, weak spots, and measurable answer quality."
    ],
    starterTemplates: ["agency", "studio", "saas-team", "internal-ops"]
  },
  enterprise: {
    segment: "enterprise",
    label: "Enterprise",
    promise: "Deploy governed, branded, multi-workspace AI systems with auditability and policy control.",
    packagingModel: "Organization-wide console with policy packs, audit export, procurement tooling, and deployment choice.",
    onboardingPath: "Governed rollout with workspace boundaries, identity hooks, retention review, and go-live approval.",
    dashboardEmphasis: "Audit trails, policy posture, org-wide readiness, and procurement/export readiness.",
    primaryJobs: [
      "Define workspace boundaries and route data by policy.",
      "Support security review, procurement, and identity controls.",
      "Manage governed rollout across multiple departments and workspaces."
    ],
    starterTemplates: ["department-rollout", "compliance-review", "private-deployment"]
  }
};

const tierToSegment: Record<KitTierName, BuyerSegment> = {
  SOLO_SPARK: "solo",
  STUDIO: "business",
  GROWTH: "business",
  ENTERPRISE: "enterprise"
};

export function getSegmentForTier(tier: KitTierName): BuyerSegment {
  return tierToSegment[tier];
}

export function recommendBuyerSegment(
  input: SegmentRecommendationInput
): SegmentRecommendation {
  const teamSizeWeight = (input.teamSize ?? 1) >= 10 ? 2 : (input.teamSize ?? 1) >= 3 ? 1 : 0;
  const complianceWeight = input.needsCompliance ? 3 : 0;
  const multiWorkspaceWeight = input.multiWorkspace ? 2 : 0;
  const identityWeight = input.identityBoundary ? 2 : 0;
  const sourceVolumeWeight =
    (input.sourceVolume ?? 0) >= 500 ? 2 : (input.sourceVolume ?? 0) >= 100 ? 1 : 0;
  const deploymentPreferenceWeight =
    input.deploymentPreference === "private"
      ? 3
      : input.deploymentPreference === "hybrid"
        ? 1
        : 0;

  const score =
    teamSizeWeight +
    complianceWeight +
    multiWorkspaceWeight +
    identityWeight +
    sourceVolumeWeight +
    deploymentPreferenceWeight;

  const segment: BuyerSegment =
    score <= 3 ? "solo" : score <= 8 ? "business" : "enterprise";

  return {
    segment,
    score,
    breakdown: {
      teamSizeWeight,
      complianceWeight,
      multiWorkspaceWeight,
      identityWeight,
      sourceVolumeWeight,
      deploymentPreferenceWeight
    }
  };
}
