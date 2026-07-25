import { evaluateGateCompatibility } from "../../config/gateCompatibility.js";
import {
  gateOperatorPackBySlug,
  gateSourceBundleBySlug,
  gateThemePresetById,
  gateTierCatalogById,
} from "../../config/gateCatalog.js";
import { quoteGatePackage } from "../../config/gatePricing.js";
import { gateUseCaseBySlug } from "../../config/gateUseCases.js";
import {
  defaultPackageConfigDraftInput,
  GateSidekickStateSchema,
  type DataBackend,
  type DeliverySurface,
  type GateDraftAnalysis,
  type GateRecommendations,
  type PackageConfigDraft,
  type PackageConfigDraftInput,
} from "./schemas.js";

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function sortByScore(entries: Array<[string, number]>): string[] {
  return entries
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([slug]) => slug);
}

export function buildDefaultGateDraftInput(
  overrides: Partial<PackageConfigDraftInput> = {}
): PackageConfigDraftInput {
  return {
    ...defaultPackageConfigDraftInput,
    ...overrides,
    deliverySurfaces: unique(
      overrides.deliverySurfaces ?? defaultPackageConfigDraftInput.deliverySurfaces
    ),
    operatorPackSlugs: unique(
      overrides.operatorPackSlugs ?? defaultPackageConfigDraftInput.operatorPackSlugs
    ),
    sourceBundleSlugs: unique(
      overrides.sourceBundleSlugs ?? defaultPackageConfigDraftInput.sourceBundleSlugs
    ),
  };
}

export function applyUseCaseDefaults(
  currentDraft: PackageConfigDraftInput,
  useCaseSlug: string
): PackageConfigDraftInput {
  const useCase = gateUseCaseBySlug[useCaseSlug];
  if (!useCase) {
    return currentDraft;
  }

  const tier = gateTierCatalogById[useCase.recommendedTier];

  return {
    ...currentDraft,
    useCaseSlug: useCase.slug,
    tier: useCase.recommendedTier,
    seatsRequested:
      tier.maxSeats === "unlimited"
        ? currentDraft.seatsRequested
        : Math.min(currentDraft.seatsRequested, tier.includedSeats),
    backend: useCase.defaultBackend,
    deliverySurfaces: unique(useCase.defaultSurfaces),
    operatorPackSlugs: unique(currentDraft.operatorPackSlugs),
    sourceBundleSlugs: unique(currentDraft.sourceBundleSlugs),
    themePresetId: useCase.defaultThemePresetId,
  };
}

export function recommendGatePackage(
  draft: PackageConfigDraftInput
): GateRecommendations {
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const operatorPackScores = new Map<string, number>();
  const sourceBundleScores = new Map<string, number>();
  const surfaceScores = new Map<DeliverySurface, number>();

  for (const slug of useCase?.recommendedOperatorPackSlugs ?? []) {
    operatorPackScores.set(slug, (operatorPackScores.get(slug) ?? 0) + 5);
  }
  for (const slug of useCase?.recommendedSourceBundleSlugs ?? []) {
    sourceBundleScores.set(slug, (sourceBundleScores.get(slug) ?? 0) + 5);
  }
  for (const surface of Object.keys(
    useCase?.surfaceAffinities ?? {}
  ) as DeliverySurface[]) {
    surfaceScores.set(
      surface,
      (surfaceScores.get(surface) ?? 0) + (useCase?.surfaceAffinities[surface] ?? 0)
    );
  }

  const backend = draft.backend as DataBackend;
  if (backend === "supabase") {
    operatorPackScores.set(
      "persistent-memory-foundation",
      (operatorPackScores.get("persistent-memory-foundation") ?? 0) + 2
    );
  }
  if (draft.deliverySurfaces.includes("cli")) {
    operatorPackScores.set(
      "devops-terminal-pack",
      (operatorPackScores.get("devops-terminal-pack") ?? 0) + 3
    );
  }
  if (draft.deliverySurfaces.includes("windows")) {
    surfaceScores.set("windows", (surfaceScores.get("windows") ?? 0) + 2);
  }
  if (draft.deliverySurfaces.includes("web")) {
    sourceBundleScores.set(
      "product-ops-bundle",
      (sourceBundleScores.get("product-ops-bundle") ?? 0) + 2
    );
  }

  const operatorPackSlugs = sortByScore([...operatorPackScores.entries()]).slice(
    0,
    3
  );
  const sourceBundleSlugs = sortByScore([...sourceBundleScores.entries()]).slice(
    0,
    3
  );
  const suggestedSurfaces = sortByScore(
    [...surfaceScores.entries()] as Array<[string, number]>
  )
    .slice(0, 3)
    .map((surface) => surface as DeliverySurface);

  return {
    operatorPackSlugs,
    sourceBundleSlugs,
    suggestedSurfaces,
    themePresetId:
      useCase?.defaultThemePresetId ??
      draft.themePresetId ??
      defaultPackageConfigDraftInput.themePresetId,
    notes: [
      ...(useCase?.notes ?? []),
      `Recommended packs bias toward ${backend.toUpperCase()} delivery characteristics.`,
    ],
  };
}

export function buildGateDeliverablesPreview(
  draft: PackageConfigDraftInput
): string[] {
  const theme = gateThemePresetById[draft.themePresetId];
  return [
    "package.manifest.json",
    "config/backend.env.template",
    "config/theme.tokens.json",
    "config/operator-packs.json",
    "config/source-bundles.json",
    "docs/README.md",
    "docs/ONBOARDING.md",
    "docs/ARCHITECTURE_SUMMARY.md",
    "docs/DELIVERABLES.md",
    "docs/SUPPORT.md",
    "install.sh",
    "install.ps1",
    ...(theme ? [`branding/${theme.id}.json`] : []),
  ];
}

export function analyzeGateDraft(
  draft: PackageConfigDraft
): GateDraftAnalysis {
  const compatibility = evaluateGateCompatibility(draft);
  const quote = quoteGatePackage(draft);
  const recommendations = recommendGatePackage(draft);

  return {
    draft: {
      ...draft,
      priceSnapshotCents: quote.totalCents,
    },
    compatibility,
    quote,
    recommendations,
    deliverables: buildGateDeliverablesPreview(draft),
    sidekick: GateSidekickStateSchema.parse({}),
  };
}

export function sanitizeSelection<T extends string>(
  values: T[],
  allowed: Record<string, unknown>
): T[] {
  return unique(values.filter((value) => allowed[value]));
}

export function resolvePackTitles(slugs: string[]): string[] {
  return slugs
    .map((slug) => gateOperatorPackBySlug[slug]?.title)
    .filter((value): value is string => Boolean(value));
}

export function resolveBundleTitles(slugs: string[]): string[] {
  return slugs
    .map((slug) => gateSourceBundleBySlug[slug]?.title)
    .filter((value): value is string => Boolean(value));
}
