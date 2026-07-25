import {
  getEntitlementProfile,
} from "../agent_trainer/gestaltview_agent_trainer/config/entitlements.js";
import {
  operatorPacks,
} from "../agent_trainer/gestaltview_agent_trainer/config/operatorPacks.js";
import {
  sourceBundles,
} from "../agent_trainer/gestaltview_agent_trainer/config/sourceBundles.js";
import {
  themePresets,
} from "../agent_trainer/gestaltview_agent_trainer/config/themeEngine.js";
import {
  tierDefinitions,
} from "../agent_trainer/gestaltview_agent_trainer/config/tiers.js";
import type {
  GateOperatorPack,
  GateSourceBundle,
  GateThemePreset,
  GateTier,
  GateTierCatalogEntry,
} from "../shared/gate/schemas.js";

const basePriceMap: Record<GateTier, number> = {
  SOLO_SPARK: 240_000,
  STUDIO: 520_000,
  GROWTH: 980_000,
  ENTERPRISE: 1_850_000,
};

const seatOveragePriceMap: Record<GateTier, number> = {
  SOLO_SPARK: 0,
  STUDIO: 42_000,
  GROWTH: 28_000,
  ENTERPRISE: 0,
};

function humanizeFeatureFlag(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const gateTierCatalog: GateTierCatalogEntry[] = Object.values(
  tierDefinitions
).map((tier) => {
  const entitlement = getEntitlementProfile(tier.name);
  const featureEntries = Object.entries(entitlement.features);
  const enabledFeatureLabels = featureEntries
    .filter(([, enabled]) => enabled)
    .map(([feature]) => humanizeFeatureFlag(feature));
  const excludedFeatureLabels = featureEntries
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => humanizeFeatureFlag(feature));

    return {
      id: tier.name as GateTier,
      label: tier.label,
      includedSeats: tier.seats === "unlimited" ? 100 : tier.seats,
      maxSeats: tier.seats === "unlimited" ? "unlimited" : tier.seats,
      basePriceCents: basePriceMap[tier.name],
      seatOveragePriceCents: seatOveragePriceMap[tier.name],
      packagingModel: entitlement.packagingModel,
      onboardingMode: entitlement.onboardingMode,
      headlinePromise: entitlement.headlinePromise,
      dashboardEmphasis: entitlement.dashboardEmphasis,
      featureFlags: { ...entitlement.features } as Record<string, boolean>,
      enabledFeatureLabels,
      excludedFeatureLabels,
    };
  });

export const gateTierCatalogById: Record<GateTier, GateTierCatalogEntry> =
  Object.fromEntries(
    gateTierCatalog.map((tier) => [tier.id, tier])
  ) as Record<GateTier, GateTierCatalogEntry>;

const packPremiumMap: Record<string, number> = {
  "general-operator-foundation": 18_000,
  "devops-terminal-pack": 26_000,
  "agent-source-starter-bundle": 24_000,
  "persistent-memory-foundation": 20_000,
};

const bundlePremiumMap: Record<string, number> = {
  "knowledge-core-bundle": 12_000,
  "code-context-bundle": 18_000,
  "product-ops-bundle": 12_000,
  "context-alignment-bundle": 10_000,
};

export const gateOperatorPacks: GateOperatorPack[] = operatorPacks.map((pack) => ({
  ...pack,
  premiumCents: packPremiumMap[pack.slug] ?? 15_000,
}));

export const gateOperatorPackBySlug: Record<string, GateOperatorPack> =
  Object.fromEntries(gateOperatorPacks.map((pack) => [pack.slug, pack]));

export const gateSourceBundles: GateSourceBundle[] = sourceBundles.map((bundle) => ({
  ...bundle,
  premiumCents: bundlePremiumMap[bundle.slug] ?? 10_000,
}));

export const gateSourceBundleBySlug: Record<string, GateSourceBundle> =
  Object.fromEntries(gateSourceBundles.map((bundle) => [bundle.slug, bundle]));

export const gateThemePresets: GateThemePreset[] = themePresets.map((preset) => ({
  id: preset.id,
  label: preset.label,
  description: preset.description,
  accentColor: preset.tokens.color.accentPrimary,
  bestFor: preset.bestFor,
  tokens: preset.tokens,
}));

export const gateThemePresetById: Record<string, GateThemePreset> =
  Object.fromEntries(gateThemePresets.map((preset) => [preset.id, preset]));
