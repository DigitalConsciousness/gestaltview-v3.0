import type { EntitlementFeatureSet } from "./entitlements.js";
import { entitlementProfiles } from "./entitlements.js";
import type { KitTierName } from "./tiers.js";

export type TierFeatures = EntitlementFeatureSet;

export const tierFeatures: Record<KitTierName, TierFeatures> = {
  SOLO_SPARK: entitlementProfiles.SOLO_SPARK.features,
  STUDIO: entitlementProfiles.STUDIO.features,
  GROWTH: entitlementProfiles.GROWTH.features,
  ENTERPRISE: entitlementProfiles.ENTERPRISE.features
};
