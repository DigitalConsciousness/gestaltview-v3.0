import type { KitTierName } from "./tiers.js";
import { getSegmentForTier, segmentDefinitions, type BuyerSegment } from "./segments.js";

export interface EntitlementFeatureSet {
  knowledgeManager: boolean;
  skillsRegistry: boolean;
  vocabularyProfile: boolean;
  analyticsDashboard: boolean;
  memoryViewer: boolean;
  multiUser: boolean;
  customDomainPreset: boolean;
  apiAccess: boolean;
  multiWorkspace: boolean;
  multipleAgents: boolean;
  sharedMemory: boolean;
  reusablePacks: boolean;
  themeMarketplace: boolean;
  onboardingAgent: boolean;
  approvalGates: boolean;
  governanceConsole: boolean;
  policyPacks: boolean;
  auditExport: boolean;
  privateDeployment: boolean;
  procurementExport: boolean;
}

export interface EntitlementLimits {
  workspaces: number | "unlimited";
  seats: number | "unlimited";
  activeAgents: number | "unlimited";
  fragments: number | "unlimited";
  monthlyQueries: number | "unlimited";
}

export interface EntitlementProfile {
  tier: KitTierName;
  segment: BuyerSegment;
  packagingModel: string;
  onboardingMode: "guided" | "assisted" | "governed";
  headlinePromise: string;
  dashboardEmphasis: string;
  features: EntitlementFeatureSet;
  limits: EntitlementLimits;
}

function baseFeatureSet(overrides: Partial<EntitlementFeatureSet>): EntitlementFeatureSet {
  return {
    knowledgeManager: true,
    skillsRegistry: true,
    vocabularyProfile: true,
    analyticsDashboard: true,
    memoryViewer: true,
    multiUser: true,
    customDomainPreset: true,
    apiAccess: false,
    multiWorkspace: false,
    multipleAgents: true,
    sharedMemory: true,
    reusablePacks: true,
    themeMarketplace: true,
    onboardingAgent: true,
    approvalGates: false,
    governanceConsole: false,
    policyPacks: false,
    auditExport: false,
    privateDeployment: false,
    procurementExport: false,
    ...overrides
  };
}

function buildProfile(
  tier: KitTierName,
  options: {
    onboardingMode: EntitlementProfile["onboardingMode"];
    features: Partial<EntitlementFeatureSet>;
    limits: EntitlementLimits;
  }
): EntitlementProfile {
  const segment = getSegmentForTier(tier);
  const segmentDefinition = segmentDefinitions[segment];

  return {
    tier,
    segment,
    packagingModel: segmentDefinition.packagingModel,
    onboardingMode: options.onboardingMode,
    headlinePromise: segmentDefinition.promise,
    dashboardEmphasis: segmentDefinition.dashboardEmphasis,
    features: baseFeatureSet(options.features),
    limits: options.limits
  };
}

export const entitlementProfiles: Record<KitTierName, EntitlementProfile> = {
  SOLO_SPARK: buildProfile("SOLO_SPARK", {
    onboardingMode: "guided",
    features: {
      analyticsDashboard: false,
      multiUser: false,
      customDomainPreset: false,
      apiAccess: false,
      multiWorkspace: false,
      multipleAgents: false,
      sharedMemory: false,
      reusablePacks: false,
      governanceConsole: false,
      policyPacks: false,
      auditExport: false,
      privateDeployment: false,
      procurementExport: false
    },
    limits: {
      workspaces: 1,
      seats: 1,
      activeAgents: 1,
      fragments: 100,
      monthlyQueries: 500
    }
  }),
  STUDIO: buildProfile("STUDIO", {
    onboardingMode: "assisted",
    features: {
      analyticsDashboard: true,
      multiUser: true,
      customDomainPreset: true,
      apiAccess: false,
      multiWorkspace: false,
      multipleAgents: true,
      sharedMemory: true,
      reusablePacks: true,
      governanceConsole: false,
      policyPacks: false,
      auditExport: false,
      privateDeployment: false,
      procurementExport: false
    },
    limits: {
      workspaces: 1,
      seats: 5,
      activeAgents: 5,
      fragments: 1000,
      monthlyQueries: 5000
    }
  }),
  GROWTH: buildProfile("GROWTH", {
    onboardingMode: "assisted",
    features: {
      analyticsDashboard: true,
      multiUser: true,
      customDomainPreset: true,
      apiAccess: true,
      multiWorkspace: true,
      multipleAgents: true,
      sharedMemory: true,
      reusablePacks: true,
      governanceConsole: true,
      policyPacks: false,
      auditExport: false,
      privateDeployment: false,
      procurementExport: false
    },
    limits: {
      workspaces: 5,
      seats: 25,
      activeAgents: 20,
      fragments: 10000,
      monthlyQueries: 50000
    }
  }),
  ENTERPRISE: buildProfile("ENTERPRISE", {
    onboardingMode: "governed",
    features: {
      analyticsDashboard: true,
      multiUser: true,
      customDomainPreset: true,
      apiAccess: true,
      multiWorkspace: true,
      multipleAgents: true,
      sharedMemory: true,
      reusablePacks: true,
      approvalGates: true,
      governanceConsole: true,
      policyPacks: true,
      auditExport: true,
      privateDeployment: true,
      procurementExport: true
    },
    limits: {
      workspaces: "unlimited",
      seats: "unlimited",
      activeAgents: "unlimited",
      fragments: "unlimited",
      monthlyQueries: "unlimited"
    }
  })
};

export function getEntitlementProfile(tier: KitTierName): EntitlementProfile {
  return entitlementProfiles[tier];
}

export function hasEntitlement(
  tier: KitTierName,
  feature: keyof EntitlementFeatureSet
): boolean {
  return entitlementProfiles[tier].features[feature];
}
