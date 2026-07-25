import {
  gateOperatorPackBySlug,
  gateSourceBundleBySlug,
  gateTierCatalogById,
} from "./gateCatalog.js";
import type {
  DataBackend,
  DeliverySurface,
  PackageConfigDraftInput,
  PriceBreakdownItem,
  PriceQuote,
} from "../shared/gate/schemas.js";

const backendPremiums: Record<DataBackend, number> = {
  supabase: 0,
  redis: 35_000,
  mongodb: 42_000,
};

const surfacePremiums: Record<DeliverySurface, number> = {
  web: 0,
  cli: 16_000,
  windows: 28_000,
  ios: 52_000,
  android: 52_000,
};

const nativeInstallerPremiumCents = 26_000;

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function buildBaseItem(draft: PackageConfigDraftInput): PriceBreakdownItem {
  const tier = gateTierCatalogById[draft.tier];
  return {
    code: `tier:${draft.tier}`,
    label: `${tier.label} base package`,
    amountCents: tier.basePriceCents,
    quantity: 1,
    kind: "base",
  };
}

export function quoteGatePackage(
  draft: PackageConfigDraftInput
): PriceQuote {
  const tier = gateTierCatalogById[draft.tier];
  const breakdown: PriceBreakdownItem[] = [buildBaseItem(draft)];

  if (
    tier.maxSeats !== "unlimited" &&
    draft.seatsRequested > tier.includedSeats &&
    tier.seatOveragePriceCents > 0
  ) {
    breakdown.push({
      code: "seat-overage",
      label: "Seat overage",
      amountCents:
        (draft.seatsRequested - tier.includedSeats) * tier.seatOveragePriceCents,
      quantity: draft.seatsRequested - tier.includedSeats,
      kind: "seat_overage",
    });
  }

  if (backendPremiums[draft.backend] > 0) {
    breakdown.push({
      code: `backend:${draft.backend}`,
      label: `${draft.backend.toUpperCase()} runtime premium`,
      amountCents: backendPremiums[draft.backend],
      quantity: 1,
      kind: "backend",
    });
  }

  for (const surface of unique(draft.deliverySurfaces)) {
    const premium = surfacePremiums[surface];
    if (premium <= 0) continue;
    breakdown.push({
      code: `surface:${surface}`,
      label: `${surface.toUpperCase()} delivery surface`,
      amountCents: premium,
      quantity: 1,
      kind: "surface",
    });
  }

  for (const packSlug of unique(draft.operatorPackSlugs)) {
    const pack = gateOperatorPackBySlug[packSlug];
    if (!pack) continue;
    breakdown.push({
      code: `pack:${packSlug}`,
      label: pack.title,
      amountCents: pack.premiumCents,
      quantity: 1,
      kind: "addon",
    });
  }

  for (const bundleSlug of unique(draft.sourceBundleSlugs)) {
    const bundle = gateSourceBundleBySlug[bundleSlug];
    if (!bundle) continue;
    breakdown.push({
      code: `bundle:${bundleSlug}`,
      label: bundle.title,
      amountCents: bundle.premiumCents,
      quantity: 1,
      kind: "addon",
    });
  }

  if (draft.wantsNativeInstaller) {
    breakdown.push({
      code: "native-installer",
      label: "Native installer stub",
      amountCents: nativeInstallerPremiumCents,
      quantity: 1,
      kind: "installer",
    });
  }

  const subtotalCents = breakdown.reduce(
    (total, item) => total + item.amountCents,
    0
  );

  return {
    currency: "usd",
    subtotalCents,
    totalCents: subtotalCents,
    breakdown,
    notes: [
      `${tier.label} sets the base package scope.`,
      "Backend, surfaces, packs, bundles, and installer requests add deterministic premiums.",
    ],
  };
}
