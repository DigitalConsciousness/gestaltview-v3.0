import {
  gateOperatorPackBySlug,
  gateSourceBundleBySlug,
  gateThemePresetById,
  gateTierCatalogById,
} from "../../config/gateCatalog.js";
import { gateUseCaseBySlug } from "../../config/gateUseCases.js";
import {
  buildEmbodimentSystemPrompt,
  requireEmbodimentProfile,
} from "../embodiment/index.js";
import {
  GateBuyerContextSchema,
  DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
  GatePackageAssetSelectionSchema,
  GatePackageCompositionActionSchema,
  GatePackageTransformationSchema,
  GateSidekickStateSchema,
  GateSidekickStructuredStateSchema,
  GateSidekickTurnSchema,
  type GateBuyerContext,
  type GatePackageAssetSelection,
  type GatePackageCompositionAction,
  type GateSidekickState,
  type GateSidekickStructuredState,
  type PackageConfigDraft,
} from "./schemas.js";

type GateApprovedAsset = {
  id: string;
  title: string;
  sourcePath: string;
  documentType: string;
  riskClass: GatePackageAssetSelection["riskClass"];
  summary: string;
  tags: string[];
  core: boolean;
};

const GATE_SIDEKICK_RESPONSE_CONTRACT = [
  "Keep the tone precise, warm, slightly eccentric, and commercially trustworthy.",
  "Recommend only bounded actions: suggest_field_update, suggest_package_component, suggest_asset_inclusion, propose_safe_transformation, or approval_required.",
  "Do not imply direct mutation of protected logic, billing paths, auth, permissions, or runtime execution.",
  "Prefer one sharp clarification over vague filler when the package context is still thin.",
  "Every turn should either tighten the brief, surface the active boundary, or name the next concrete move.",
];

const GATE_SIDEKICK_RUNTIME_DIRECTIVES = [
  "Operate as the package-builder sidekick, not a general-purpose chat assistant.",
  "Translate buyer context into deterministic package recommendations, approved assets, and safe transformation plans.",
  "Preserve traceability: every recommendation should point to a field, pack, bundle, asset, or transformation boundary.",
  "Do not feel like a static decoration layer. Sound like the gate is actively staffed.",
];

function getGateSidekickProfile(draft: PackageConfigDraft) {
  return requireEmbodimentProfile(
    draft.embodimentProfileSlug || DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG
  );
}

const GATE_SIDEKICK_APPROVED_ASSETS: readonly GateApprovedAsset[] = [
  {
    id: "asset-readme-template",
    title: "Launch README Template",
    sourcePath: "templates/gate/README.md.tpl",
    documentType: "template",
    riskClass: "safe_content",
    summary: "Primary package readme with buyer-specific setup framing.",
    tags: ["launch", "readme", "web", "cli", "windows", "founder", "operator"],
    core: true,
  },
  {
    id: "asset-onboarding-template",
    title: "Operator Onboarding Template",
    sourcePath: "templates/gate/ONBOARDING.md.tpl",
    documentType: "template",
    riskClass: "safe_content",
    summary: "Onboarding doc for operators, admins, and internal buyers.",
    tags: ["onboarding", "operator", "training", "knowledge", "support"],
    core: true,
  },
  {
    id: "asset-architecture-template",
    title: "Architecture Summary Template",
    sourcePath: "templates/gate/ARCHITECTURE_SUMMARY.md.tpl",
    documentType: "template",
    riskClass: "safe_content",
    summary: "Buyer-facing architecture summary with bounded technical detail.",
    tags: ["architecture", "technical", "developer", "compliance", "governance"],
    core: true,
  },
  {
    id: "asset-deliverables-template",
    title: "Deliverables Ledger Template",
    sourcePath: "templates/gate/DELIVERABLES.md.tpl",
    documentType: "template",
    riskClass: "safe_content",
    summary: "Traceable list of package deliverables and included assets.",
    tags: ["deliverables", "manifest", "audit", "review", "ops"],
    core: true,
  },
  {
    id: "asset-support-template",
    title: "Support Path Template",
    sourcePath: "templates/gate/SUPPORT.md.tpl",
    documentType: "template",
    riskClass: "safe_content",
    summary: "Support and escalation path for post-delivery handoff.",
    tags: ["support", "handoff", "enterprise", "review", "service"],
    core: true,
  },
  {
    id: "asset-backend-config",
    title: "Backend Environment Template",
    sourcePath: "generated/config/backend.env.template",
    documentType: "config",
    riskClass: "safe_config",
    summary: "Non-secret environment template aligned to the selected backend.",
    tags: ["config", "backend", "supabase", "redis", "mongodb", "deployment"],
    core: true,
  },
  {
    id: "asset-theme-config",
    title: "Theme Token Export",
    sourcePath: "generated/config/theme.tokens.json",
    documentType: "config",
    riskClass: "safe_config",
    summary: "Theme token bundle for branding and visual alignment.",
    tags: ["config", "theme", "branding", "design", "white-label"],
    core: true,
  },
  {
    id: "asset-pack-config",
    title: "Operator Pack Selection Export",
    sourcePath: "generated/config/operator-packs.json",
    documentType: "config",
    riskClass: "safe_config",
    summary: "Approved operator pack selection for the draft package.",
    tags: ["config", "packs", "operator", "ops", "manifest"],
    core: true,
  },
  {
    id: "asset-bundle-config",
    title: "Source Bundle Selection Export",
    sourcePath: "generated/config/source-bundles.json",
    documentType: "config",
    riskClass: "safe_config",
    summary: "Approved source bundle selection for the package build.",
    tags: ["config", "source", "bundles", "knowledge", "code", "product"],
    core: true,
  },
  {
    id: "asset-branding-export",
    title: "Branding Export",
    sourcePath: "generated/branding/theme-preset.json",
    documentType: "brand_asset",
    riskClass: "safe_config",
    summary: "Branding handoff with theme preset, accent color, and logo path.",
    tags: ["branding", "theme", "logo", "white-label", "presentation"],
    core: false,
  },
  {
    id: "asset-install-shell",
    title: "Shell Install Script",
    sourcePath: "generated/install.sh",
    documentType: "installer",
    riskClass: "safe_config",
    summary: "Install helper for CLI-oriented delivery paths.",
    tags: ["install", "cli", "developer", "ops", "terminal"],
    core: false,
  },
  {
    id: "asset-install-powershell",
    title: "PowerShell Install Script",
    sourcePath: "generated/install.ps1",
    documentType: "installer",
    riskClass: "safe_config",
    summary: "Install helper for Windows delivery paths.",
    tags: ["install", "windows", "ops", "support"],
    core: false,
  },
] as const;

const CHANNEL_KEYWORDS = [
  "web",
  "cli",
  "windows",
  "ios",
  "android",
  "mobile",
  "email",
  "sms",
  "discord",
  "slack",
] as const;

const PROTECTED_LOGIC_PATTERN =
  /\b(auth|authentication|authorization|billing|payment|permissions?|rbac|runtime|execute|deployment pipeline|production deploy|stripe|webhook|api key|sso|oauth)\b/i;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizeList(values: string[]): string[] {
  return unique(values.map((value) => value.trim()).filter(Boolean));
}

function headlineList(values: string[], fallback: string): string {
  if (values.length === 0) {
    return fallback;
  }

  if (values.length === 1) {
    return values[0]!;
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function capitalize(input: string): string {
  if (!input) {
    return input;
  }

  return `${input.charAt(0).toUpperCase()}${input.slice(1)}`;
}

function bodyText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function mergeBuyerContext(
  current: GateBuyerContext,
  patch: Partial<GateBuyerContext>
): GateBuyerContext {
  return GateBuyerContextSchema.parse({
    industry: patch.industry?.trim() || current.industry,
    companyStage: patch.companyStage?.trim() || current.companyStage,
    audience: patch.audience?.trim() || current.audience,
    preferredChannels: normalizeList([
      ...current.preferredChannels,
      ...(patch.preferredChannels ?? []),
    ]),
    brandingInputs: patch.brandingInputs?.trim() || current.brandingInputs,
    deploymentConstraints:
      patch.deploymentConstraints?.trim() || current.deploymentConstraints,
    requestedOutcomes: normalizeList([
      ...current.requestedOutcomes,
      ...(patch.requestedOutcomes ?? []),
    ]),
    businessContext: patch.businessContext?.trim() || current.businessContext,
  });
}

function collectContextTokens(draft: PackageConfigDraft): string[] {
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const buyerContext = draft.buyerContext;

  return unique([
    ...tokenize(draft.useCaseSlug),
    ...tokenize(useCase?.label ?? ""),
    ...tokenize(useCase?.summary ?? ""),
    ...tokenize(draft.backend),
    ...draft.deliverySurfaces.flatMap((surface) => tokenize(surface)),
    ...draft.operatorPackSlugs.flatMap((slug) => tokenize(slug)),
    ...draft.sourceBundleSlugs.flatMap((slug) => tokenize(slug)),
    ...tokenize(bodyText(draft.companyName)),
    ...tokenize(bodyText(buyerContext.industry)),
    ...tokenize(bodyText(buyerContext.companyStage)),
    ...tokenize(bodyText(buyerContext.audience)),
    ...buyerContext.preferredChannels.flatMap((channel) => tokenize(channel)),
    ...buyerContext.requestedOutcomes.flatMap((item) => tokenize(item)),
    ...tokenize(bodyText(buyerContext.brandingInputs)),
    ...tokenize(bodyText(buyerContext.businessContext)),
    ...tokenize(bodyText(buyerContext.deploymentConstraints)),
    ...tokenize(bodyText(draft.customNotes)),
  ]);
}

function deriveRecommendedTier(draft: PackageConfigDraft) {
  const currentTier = gateTierCatalogById[draft.tier];
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const text = [
    draft.buyerContext.industry,
    draft.buyerContext.deploymentConstraints,
    draft.customNotes,
    draft.buyerContext.businessContext,
  ]
    .filter(Boolean)
    .join(" ");
  const normalized = text.toLowerCase();
  const isComplianceHeavy =
    /\b(health|hipaa|compliance|regulated|audit|governance|soc 2|security)\b/i.test(
      normalized
    );
  const wantsWhiteLabel =
    /\b(white label|agency|client studio|multi workspace|reseller)\b/i.test(
      normalized
    );
  const wantsMobile = draft.deliverySurfaces.some(
    (surface) => surface === "ios" || surface === "android"
  );

  if (isComplianceHeavy) {
    return "ENTERPRISE" as const;
  }

  if (draft.seatsRequested >= 25 || wantsWhiteLabel || wantsMobile) {
    return "GROWTH" as const;
  }

  if (draft.seatsRequested >= 8 || useCase?.recommendedTier === "STUDIO") {
    return "STUDIO" as const;
  }

  return currentTier.id;
}

function deriveRecommendedUseCase(draft: PackageConfigDraft): string {
  const normalized = [
    draft.buyerContext.industry,
    draft.buyerContext.businessContext,
    draft.buyerContext.deploymentConstraints,
    draft.customNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(health|clinic|hospital|hipaa|compliance|regulated)\b/.test(normalized)) {
    return "healthcare-compliance-assistant";
  }

  if (/\b(agency|studio|white label|client workspaces?)\b/.test(normalized)) {
    return "white-label-client-studio";
  }

  return draft.useCaseSlug;
}

function deriveRecommendedTheme(draft: PackageConfigDraft): string {
  const normalized = [
    draft.buyerContext.brandingInputs,
    draft.buyerContext.industry,
    draft.customNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/\b(health|clinical|compliance|neutral|conservative)\b/.test(normalized)) {
    return "atlas-neutral";
  }

  if (/\b(agency|brand|presentation|white label|luxury)\b/.test(normalized)) {
    return "copper-signal";
  }

  const useCase = gateUseCaseBySlug[deriveRecommendedUseCase(draft)];
  return useCase?.defaultThemePresetId ?? draft.themePresetId;
}

function deriveRecommendedSurfaces(draft: PackageConfigDraft): PackageConfigDraft["deliverySurfaces"] {
  const surfaces = new Set(draft.deliverySurfaces);
  const preferred = draft.buyerContext.preferredChannels.map((value) => value.toLowerCase());
  if (preferred.includes("mobile")) {
    surfaces.add("ios");
    surfaces.add("android");
  }
  for (const surface of ["web", "cli", "windows", "ios", "android"] as const) {
    if (preferred.includes(surface)) {
      surfaces.add(surface);
    }
  }

  return [...surfaces];
}

function buildRecommendedSnapshot(draft: PackageConfigDraft) {
  const nextUseCase = gateUseCaseBySlug[deriveRecommendedUseCase(draft)];
  const tier = deriveRecommendedTier(draft);
  const deliverySurfaces = deriveRecommendedSurfaces({
    ...draft,
    useCaseSlug: nextUseCase?.slug ?? draft.useCaseSlug,
  });
  const recommendedPackSlugs = unique([
    ...(nextUseCase?.recommendedOperatorPackSlugs ?? []),
    ...draft.operatorPackSlugs,
  ]).slice(0, 4);
  const recommendedBundleSlugs = unique([
    ...(nextUseCase?.recommendedSourceBundleSlugs ?? []),
    ...draft.sourceBundleSlugs,
  ]).slice(0, 4);
  const confidenceNotes: string[] = [];

  if (!draft.buyerContext.industry) {
    confidenceNotes.push("Industry is still missing, so regulatory weighting is conservative.");
  }
  if (!draft.buyerContext.audience) {
    confidenceNotes.push("Audience shape is thin, so onboarding copy stays broad.");
  }
  if (draft.buyerContext.requestedOutcomes.length === 0) {
    confidenceNotes.push("Requested outcomes are light, so asset ranking favors the core delivery spine.");
  }

  return GateSidekickStructuredStateSchema.shape.recommendations.parse({
    tier,
    operatorPackSlugs: recommendedPackSlugs,
    sourceBundleSlugs: recommendedBundleSlugs,
    deliverySurfaces,
    themePresetId: deriveRecommendedTheme(draft),
    assetIds: [],
    confidenceNotes,
  });
}

function buildPendingClarifications(draft: PackageConfigDraft): string[] {
  const missing: string[] = [];
  const sidekickName = getGateSidekickProfile(draft).publicName;

  if (!draft.buyerContext.industry) {
    missing.push("Name the industry or operating context so the package can bias the right governance posture.");
  }
  if (!draft.buyerContext.audience) {
    missing.push(
      `Name the primary audience so ${sidekickName} can tighten onboarding and delivery surface choices.`
    );
  }
  if (draft.buyerContext.requestedOutcomes.length === 0) {
    missing.push("List the concrete outcomes you need from the package so the asset plan stops guessing.");
  }

  return missing.slice(0, 3);
}

function scoreAsset(draft: PackageConfigDraft, asset: GateApprovedAsset): number {
  const tokens = new Set(collectContextTokens(draft));
  const tagMatches = asset.tags.filter((tag) => tokens.has(tag)).length;
  const baseScore = asset.core ? 0.6 : 0.45;
  const matchScore = Math.min(0.28, tagMatches * 0.06);
  const brandingBoost =
    asset.tags.includes("branding") && (draft.brandColor || draft.logoAssetPath) ? 0.08 : 0;
  const installerBoost =
    draft.wantsNativeInstaller &&
    asset.documentType === "installer" &&
    draft.deliverySurfaces.some((surface) => surface === "windows" || surface === "cli")
      ? 0.1
      : 0;

  return Math.min(0.98, baseScore + matchScore + brandingBoost + installerBoost);
}

function buildAssetSelections(
  draft: PackageConfigDraft,
  currentState?: GateSidekickState | null
): GatePackageAssetSelection[] {
  const previousByDocumentId = new Map(
    (currentState?.assetSelections ?? []).map((asset) => [asset.documentId, asset])
  );

  return [...GATE_SIDEKICK_APPROVED_ASSETS]
    .map((asset) => {
      const previous = previousByDocumentId.get(asset.id);
      const selectionScore = scoreAsset(draft, asset);
      return GatePackageAssetSelectionSchema.parse({
        id: previous?.id ?? `selection-${draft.id}-${asset.id}`,
        packageDraftId: draft.id,
        documentId: asset.id,
        documentTitle: asset.title,
        sourcePath: asset.sourcePath,
        documentType: asset.documentType,
        riskClass: asset.riskClass,
        selectionReason:
          tagScoreReason(draft, asset) ??
          `${asset.title} stays in the build spine because it personalizes cleanly without touching protected logic.`,
        selectionScore,
        included: previous?.included ?? (selectionScore >= 0.55 || asset.core),
        versionLabel: draft.configHash,
        tags: asset.tags,
        createdAt: previous?.createdAt ?? draft.updatedAt,
      });
    })
    .sort((left, right) => right.selectionScore - left.selectionScore);
}

function tagScoreReason(draft: PackageConfigDraft, asset: GateApprovedAsset): string | null {
  const tokens = new Set(collectContextTokens(draft));
  const matches = asset.tags.filter((tag) => tokens.has(tag)).slice(0, 3);
  if (matches.length === 0) {
    return null;
  }

  return `${asset.title} matches the current brief through ${headlineList(
    matches,
    "the current package shape"
  )}.`;
}

function buildTransformations(
  draft: PackageConfigDraft,
  assets: GatePackageAssetSelection[],
  currentState?: GateSidekickState | null
) {
  const previousByDocumentId = new Map(
    (currentState?.transformations ?? []).map((item) => [item.documentId, item])
  );

  return assets
    .filter((asset) => asset.included)
    .map((asset) => {
      const previous = previousByDocumentId.get(asset.documentId);
      const transformationType = asset.sourcePath.includes("branding")
        ? "branding"
        : asset.sourcePath.includes("operator-packs") ||
            asset.sourcePath.includes("source-bundles")
          ? "pack_merge"
          : "variable_insertion";

      return GatePackageTransformationSchema.parse({
        id: previous?.id ?? `transformation-${draft.id}-${asset.documentId}`,
        packageDraftId: draft.id,
        documentId: asset.documentId,
        sourcePath: asset.sourcePath,
        transformationType,
        inputSnapshot: {
          companyName: draft.companyName ?? null,
          tier: draft.tier,
          useCaseSlug: draft.useCaseSlug,
          buyerContext: draft.buyerContext,
        },
        outputSnapshot: {
          themePresetId: draft.themePresetId,
          brandColor: draft.brandColor ?? null,
          logoAssetPath: draft.logoAssetPath ?? null,
          deliverySurfaces: draft.deliverySurfaces,
        },
        diffSummary: buildTransformationSummary(draft, asset),
        riskClass: asset.riskClass,
        requiresApproval: false,
        approvedBy: previous?.approvedBy ?? null,
        createdAt: previous?.createdAt ?? draft.updatedAt,
      });
    });
}

function buildTransformationSummary(
  draft: PackageConfigDraft,
  asset: GatePackageAssetSelection
): string {
  if (asset.documentType === "template") {
    return `Inject buyer variables, tier framing, and outcome-specific language into ${asset.documentTitle}.`;
  }

  if (asset.sourcePath.includes("branding")) {
    return `Apply brand color, logo path, and theme preset to ${asset.documentTitle}.`;
  }

  if (asset.sourcePath.includes("operator-packs")) {
    return `Merge selected operator packs into ${asset.documentTitle}.`;
  }

  if (asset.sourcePath.includes("source-bundles")) {
    return `Merge selected source bundles into ${asset.documentTitle}.`;
  }

  return `Fill ${asset.documentTitle} from the current package configuration.`;
}

function createActionId(draftId: string, targetRef: string): string {
  return `action-${draftId}-${slugify(targetRef)}`;
}

function buildSuggestedActions(
  draft: PackageConfigDraft,
  currentState: GateSidekickState,
  assetSelections: GatePackageAssetSelection[],
  structuredState: GateSidekickStructuredState
): GatePackageCompositionAction[] {
  const previousById = new Map(currentState.actions.map((action) => [action.id, action]));
  const generated: GatePackageCompositionAction[] = [];
  const createdBy = getGateSidekickProfile(draft).publicName;

  if (deriveRecommendedUseCase(draft) !== draft.useCaseSlug) {
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `use-case-${deriveRecommendedUseCase(draft)}`),
        packageDraftId: draft.id,
        actionType: "suggest_field_update",
        status: "proposed",
        targetType: "field",
        targetRef: "useCaseSlug",
        title: `Switch to ${gateUseCaseBySlug[deriveRecommendedUseCase(draft)]?.label ?? deriveRecommendedUseCase(draft)}`,
        rationale:
          "The buyer context is pulling the package toward a different operating shape than the current use case preset.",
        confidence: 0.82,
        createdBy,
        proposedValue: deriveRecommendedUseCase(draft),
        metadata: {
          field: "useCaseSlug",
          value: deriveRecommendedUseCase(draft),
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  if (structuredState.recommendations.tier !== draft.tier) {
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `tier-${structuredState.recommendations.tier}`),
        packageDraftId: draft.id,
        actionType: "suggest_field_update",
        status: "proposed",
        targetType: "field",
        targetRef: "tier",
        title: `Move to ${gateTierCatalogById[structuredState.recommendations.tier].label}`,
        rationale:
          "Current scope and governance pressure suggest a different tier boundary than the one currently selected.",
        confidence: 0.78,
        createdBy,
        proposedValue: structuredState.recommendations.tier,
        metadata: {
          field: "tier",
          value: structuredState.recommendations.tier,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  if (structuredState.recommendations.themePresetId !== draft.themePresetId) {
    const theme = gateThemePresetById[structuredState.recommendations.themePresetId];
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(
          draft.id,
          `theme-${structuredState.recommendations.themePresetId}`
        ),
        packageDraftId: draft.id,
        actionType: "suggest_field_update",
        status: "proposed",
        targetType: "field",
        targetRef: "themePresetId",
        title: `Use ${theme?.label ?? structuredState.recommendations.themePresetId}`,
        rationale:
          "Branding and industry cues point at a cleaner visual preset than the one currently loaded.",
        confidence: 0.71,
        createdBy,
        proposedValue: structuredState.recommendations.themePresetId,
        metadata: {
          field: "themePresetId",
          value: structuredState.recommendations.themePresetId,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  for (const slug of structuredState.recommendations.operatorPackSlugs) {
    if (draft.operatorPackSlugs.includes(slug)) {
      continue;
    }

    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `operator-pack-${slug}`),
        packageDraftId: draft.id,
        actionType: "suggest_package_component",
        status: "proposed",
        targetType: "package_component",
        targetRef: `operatorPack:${slug}`,
        title: `Add ${gateOperatorPackBySlug[slug]?.title ?? slug}`,
        rationale:
          "This pack improves package fit against the current use case, delivery surfaces, and buyer pressure.",
        confidence: 0.74,
        createdBy,
        proposedValue: slug,
        metadata: {
          kind: "operatorPack",
          slug,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  for (const slug of structuredState.recommendations.sourceBundleSlugs) {
    if (draft.sourceBundleSlugs.includes(slug)) {
      continue;
    }

    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `source-bundle-${slug}`),
        packageDraftId: draft.id,
        actionType: "suggest_package_component",
        status: "proposed",
        targetType: "package_component",
        targetRef: `sourceBundle:${slug}`,
        title: `Include ${gateSourceBundleBySlug[slug]?.title ?? slug}`,
        rationale:
          "This bundle improves the source-of-truth coverage for the current buyer context.",
        confidence: 0.72,
        createdBy,
        proposedValue: slug,
        metadata: {
          kind: "sourceBundle",
          slug,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  const recommendedSurfaces = structuredState.recommendations.deliverySurfaces.filter(
    (surface) => !draft.deliverySurfaces.includes(surface)
  );
  if (recommendedSurfaces.length > 0) {
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `surfaces-${recommendedSurfaces.join("-")}`),
        packageDraftId: draft.id,
        actionType: "suggest_package_component",
        status: "proposed",
        targetType: "field",
        targetRef: "deliverySurfaces",
        title: `Add ${headlineList(recommendedSurfaces, "recommended surfaces")}`,
        rationale:
          "The buyer's preferred channels suggest adding delivery surfaces that are not currently selected.",
        confidence: 0.69,
        createdBy,
        proposedValue: unique([...draft.deliverySurfaces, ...recommendedSurfaces]),
        metadata: {
          field: "deliverySurfaces",
          value: unique([...draft.deliverySurfaces, ...recommendedSurfaces]),
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  const topOptionalAsset = assetSelections.find(
    (asset) => !asset.included && asset.selectionScore >= 0.52
  );
  if (topOptionalAsset) {
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, `asset-${topOptionalAsset.documentId}`),
        packageDraftId: draft.id,
        actionType: "suggest_asset_inclusion",
        status: "proposed",
        targetType: "artifact",
        targetRef: topOptionalAsset.documentId,
        title: `Include ${topOptionalAsset.documentTitle}`,
        rationale: topOptionalAsset.selectionReason,
        confidence: topOptionalAsset.selectionScore,
        createdBy,
        proposedValue: topOptionalAsset.documentId,
        metadata: {
          kind: "assetSelection",
          documentId: topOptionalAsset.documentId,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  const protectedLogicText = [
    draft.customNotes,
    draft.buyerContext.deploymentConstraints,
    draft.buyerContext.businessContext,
  ]
    .filter(Boolean)
    .join(" ");
  if (PROTECTED_LOGIC_PATTERN.test(protectedLogicText)) {
    generated.push(
      createOrReuseAction(previousById, {
        id: createActionId(draft.id, "protected-logic-review"),
        packageDraftId: draft.id,
        actionType: "approval_required",
        status: "approval_required",
        targetType: "manifest",
        targetRef: "protected-logic-review",
        title: "Flag owner review for protected-logic requests",
        rationale:
          "The brief touches auth, billing, permissions, runtime execution, or deployment paths. That moves outside the auto-apply boundary.",
        confidence: 0.93,
        createdBy,
        proposedValue: null,
        metadata: {
          requiresApproval: true,
        },
        createdAt: draft.updatedAt,
      })
    );
  }

  const generatedIds = new Set(generated.map((action) => action.id));
  const history = currentState.actions.filter(
    (action) => action.status !== "proposed" && !generatedIds.has(action.id)
  );

  return [...history, ...generated];
}

type ProposedActionInput = Omit<GatePackageCompositionAction, "approvedBy"> & {
  approvedBy?: GatePackageCompositionAction["approvedBy"];
};

function createOrReuseAction(
  previousById: Map<string, GatePackageCompositionAction>,
  nextAction: ProposedActionInput
) {
  const previous = previousById.get(nextAction.id);
  if (!previous) {
    return GatePackageCompositionActionSchema.parse({
      approvedBy: null,
      ...nextAction,
    });
  }

  return GatePackageCompositionActionSchema.parse({
    ...nextAction,
    status:
      previous.status === "accepted" ||
      previous.status === "rejected" ||
      previous.status === "applied"
        ? previous.status
        : nextAction.status,
    approvedBy: previous.approvedBy,
    createdAt: previous.createdAt,
  });
}

function buildWelcomeMessage(
  draft: PackageConfigDraft,
  structuredState: GateSidekickStructuredState,
  assetSelections: GatePackageAssetSelection[]
): string {
  const sidekickName = getGateSidekickProfile(draft).publicName;
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const tier = gateTierCatalogById[structuredState.recommendations.tier];
  const topAssets = assetSelections
    .filter((asset) => asset.included)
    .slice(0, 3)
    .map((asset) => asset.documentTitle);
  const clarifications = structuredState.pendingClarifications;

  return [
    `${sidekickName} is awake in the builder. This draft already smells like a ${tier.label} ${useCase?.label ?? draft.useCaseSlug} package with ${headlineList(draft.deliverySurfaces, "the current delivery surfaces")}.`,
    `Top safe assets right now are ${headlineList(topAssets, "the core package spine")}, and the transformation boundary stays outside protected logic.`,
    clarifications.length > 0
      ? `Next useful move: ${clarifications[0]}`
      : "The brief is coherent enough to start tightening packs, bundles, and branded docs.",
  ].join(" ");
}

function buildSessionSummary(
  draft: PackageConfigDraft,
  structuredState: GateSidekickStructuredState,
  actions: GatePackageCompositionAction[]
) {
  const tier = gateTierCatalogById[structuredState.recommendations.tier];
  const activeActions = actions.filter((action) => action.status === "proposed");
  return `${tier.label} package bias with ${activeActions.length} active sidekick recommendations.`;
}

function buildStructuredState(
  draft: PackageConfigDraft,
  assetSelections: GatePackageAssetSelection[]
): GateSidekickStructuredState {
  const recommendations = buildRecommendedSnapshot(draft);

  return GateSidekickStructuredStateSchema.parse({
    buyerContext: draft.buyerContext,
    recommendations: {
      ...recommendations,
      assetIds: assetSelections.filter((asset) => asset.included).map((asset) => asset.documentId),
    },
    pendingClarifications: buildPendingClarifications(draft),
  });
}

export function buildGateSidekickSystemPrompt(draft: PackageConfigDraft): string {
  const profile = getGateSidekickProfile(draft);

  return buildEmbodimentSystemPrompt(profile, {
    role: "package-builder sidekick for GestaltView Agent Trainer",
    audience:
      "a buyer composing a tailored package through a structured wizard with live provenance",
    responseContract: GATE_SIDEKICK_RESPONSE_CONTRACT,
    runtimeDirectives: GATE_SIDEKICK_RUNTIME_DIRECTIVES,
    extraContext: [
      "This surface is constrained: recommend fields, package components, approved assets, and safe transformations only.",
      "Every recommendation must remain auditable and commercially defensible.",
    ],
  });
}

export function createGateSidekickState(draft: PackageConfigDraft): GateSidekickState {
  const profile = getGateSidekickProfile(draft);
  const assetSelections = buildAssetSelections(draft);
  const structuredState = buildStructuredState(draft, assetSelections);
  const sessionId = `gate-sidekick-${draft.id}`;
  const welcomeTurn = GateSidekickTurnSchema.parse({
    id: `gate-sidekick-welcome-${draft.id}`,
    sessionId,
    actor: "sidekick",
    messageText: buildWelcomeMessage(draft, structuredState, assetSelections),
    structuredState,
    toolCalls: [
      {
        name: "score_package_tier",
        payload: {
          tier: structuredState.recommendations.tier,
        },
      },
      {
        name: "select_assets",
        payload: {
          assetIds: structuredState.recommendations.assetIds,
        },
      },
    ],
    createdAt: draft.updatedAt,
  });

  const session = {
    id: sessionId,
    packageDraftId: draft.id,
    buyerId: null,
    embodimentProfileSlug: profile.slug,
    embodimentVersion: profile.embodimentVersion,
    personaMode: `${profile.slug}-package-builder-sidekick`,
    voiceTone: profile.immutableCore.voiceTone,
    status: "active" as const,
    systemPrompt: buildGateSidekickSystemPrompt(draft),
    summary: "",
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };

  const state = GateSidekickStateSchema.parse({
    session,
    turns: [welcomeTurn],
    actions: [],
    assetSelections,
    transformations: buildTransformations(draft, assetSelections),
    manifestHistory: [],
  });

  const actions = buildSuggestedActions(draft, state, assetSelections, structuredState);
  return GateSidekickStateSchema.parse({
    ...state,
    session: {
      ...state.session,
      summary: buildSessionSummary(draft, structuredState, actions),
    },
    actions,
  });
}

export function synchronizeGateSidekickState(
  draft: PackageConfigDraft,
  currentState?: GateSidekickState | null
): GateSidekickState {
  const profile = getGateSidekickProfile(draft);
  const base = currentState?.session ? currentState : createGateSidekickState(draft);
  const assetSelections = buildAssetSelections(draft, base);
  const structuredState = buildStructuredState(draft, assetSelections);
  const actions = buildSuggestedActions(draft, base, assetSelections, structuredState);
  const transformations = buildTransformations(draft, assetSelections, base);
  const turns =
    base.turns.length > 0
      ? base.turns
      : createGateSidekickState(draft).turns;

  return GateSidekickStateSchema.parse({
    ...base,
    session: {
      ...(base.session ?? createGateSidekickState(draft).session),
      embodimentProfileSlug: profile.slug,
      embodimentVersion: profile.embodimentVersion,
      personaMode: `${profile.slug}-package-builder-sidekick`,
      voiceTone: profile.immutableCore.voiceTone,
      systemPrompt: buildGateSidekickSystemPrompt(draft),
      summary: buildSessionSummary(draft, structuredState, actions),
      updatedAt: draft.updatedAt,
    },
    turns,
    actions,
    assetSelections,
    transformations,
  });
}

function captureOutcomeFragments(message: string): string[] {
  const fragments = message
    .split(/[.\n]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return fragments
    .filter((part) =>
      /\b(need|want|trying to|looking to|must|goal|outcome|launch|ship)\b/i.test(
        part
      )
    )
    .slice(0, 4);
}

export function extractGateBuyerContextPatchFromMessage(
  message: string
): Partial<GateBuyerContext> {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();
  const preferredChannels = CHANNEL_KEYWORDS.filter((channel) => lower.includes(channel));
  const requestedOutcomes = captureOutcomeFragments(normalized);
  const audienceMatch = normalized.match(/\bfor\s+([^.!?\n]+)/i);
  const deploymentConstraintLines = normalized
    .split(/[.\n]/)
    .map((part) => part.trim())
    .filter((part) =>
      /\b(must|cannot|can't|need to|deploy|self-host|on-prem|air-gapped|hipaa|soc 2|sso|windows-only|cli-first)\b/i.test(
        part
      )
    );

  let industry: string | undefined;
  if (/\b(health|clinic|hospital|hipaa|medical)\b/i.test(lower)) {
    industry = "healthcare";
  } else if (/\b(finance|fintech|bank|payments)\b/i.test(lower)) {
    industry = "finance";
  } else if (/\b(agency|studio|client work)\b/i.test(lower)) {
    industry = "agency";
  } else if (/\b(education|school|campus)\b/i.test(lower)) {
    industry = "education";
  } else if (/\b(developer|engineering|sdk|api|repo)\b/i.test(lower)) {
    industry = "developer tools";
  }

  return GateBuyerContextSchema.partial().parse({
    industry,
    audience: audienceMatch?.[1]?.trim(),
    preferredChannels,
    deploymentConstraints:
      deploymentConstraintLines.length > 0
        ? deploymentConstraintLines.join(" ")
        : undefined,
    requestedOutcomes,
    businessContext: normalized,
  });
}

export function composeGateSidekickReply(params: {
  draft: PackageConfigDraft;
  state: GateSidekickState;
  userMessage: string;
}) {
  const buyerContextPatch = extractGateBuyerContextPatchFromMessage(params.userMessage);
  const patchedDraft = {
    ...params.draft,
    buyerContext: mergeBuyerContext(params.draft.buyerContext, buyerContextPatch),
  };
  const nextState = synchronizeGateSidekickState(patchedDraft, params.state);
  const structuredState =
    nextState.turns.at(-1)?.structuredState ??
    buildStructuredState(patchedDraft, nextState.assetSelections);
  const topAssets = nextState.assetSelections
    .filter((asset) => asset.included)
    .slice(0, 3)
    .map((asset) => asset.documentTitle);
  const activeActions = nextState.actions.filter((action) => action.status === "proposed");
  const captured = [
    buyerContextPatch.industry ? `industry ${buyerContextPatch.industry}` : "",
    buyerContextPatch.audience ? `audience ${buyerContextPatch.audience}` : "",
    buyerContextPatch.preferredChannels?.length
      ? `channels ${headlineList(buyerContextPatch.preferredChannels, "")}`
      : "",
  ].filter(Boolean);

  const reply = [
    captured.length > 0
      ? `Noted: ${headlineList(captured, "the new context")}.`
      : "That adds texture, even if the brief is still a little feral around the edges.",
    `Package bias now points toward ${gateTierCatalogById[structuredState.recommendations.tier].label} with ${headlineList(
      structuredState.recommendations.operatorPackSlugs
        .map((slug) => gateOperatorPackBySlug[slug]?.title ?? slug)
        .slice(0, 2),
      "the current pack spine"
    )}.`,
    `Top safe assets are ${headlineList(topAssets, "the current asset spine")}, and ${activeActions.length} bounded actions are ready to apply.`,
  ].join(" ");

  return {
    buyerContextPatch,
    draft: patchedDraft,
    nextState,
    messageText: reply,
    structuredState,
    toolCalls: [
      {
        name: "update_buyer_profile",
        payload: buyerContextPatch,
      },
      {
        name: "select_assets",
        payload: {
          assetIds: nextState.assetSelections
            .filter((asset) => asset.included)
            .map((asset) => asset.documentId),
        },
      },
    ],
  };
}

export function applyGateSidekickActionToDraft(
  draft: PackageConfigDraft,
  action: GatePackageCompositionAction,
  currentState: GateSidekickState
): {
  draft: PackageConfigDraft;
  state: GateSidekickState;
} {
  let nextDraft = draft;

  if (action.targetType === "field" && action.metadata.field) {
    const field = String(action.metadata.field);
    const value = action.metadata.value ?? action.proposedValue;

    if (field === "tier" && typeof value === "string") {
      nextDraft = { ...nextDraft, tier: value as PackageConfigDraft["tier"] };
    } else if (field === "themePresetId" && typeof value === "string") {
      nextDraft = { ...nextDraft, themePresetId: value };
    } else if (field === "useCaseSlug" && typeof value === "string") {
      nextDraft = { ...nextDraft, useCaseSlug: value };
    } else if (field === "deliverySurfaces" && Array.isArray(value)) {
      nextDraft = {
        ...nextDraft,
        deliverySurfaces: unique(
          value.filter((item): item is string => typeof item === "string")
        ) as PackageConfigDraft["deliverySurfaces"],
      };
    }
  }

  if (action.targetType === "package_component" && action.metadata.kind) {
    const kind = String(action.metadata.kind);
    const slug =
      typeof action.metadata.slug === "string"
        ? action.metadata.slug
        : typeof action.proposedValue === "string"
          ? action.proposedValue
          : "";

    if (kind === "operatorPack" && slug) {
      nextDraft = {
        ...nextDraft,
        operatorPackSlugs: unique([...nextDraft.operatorPackSlugs, slug]),
      };
    } else if (kind === "sourceBundle" && slug) {
      nextDraft = {
        ...nextDraft,
        sourceBundleSlugs: unique([...nextDraft.sourceBundleSlugs, slug]),
      };
    }
  }

  const syncedState = synchronizeGateSidekickState(nextDraft, currentState);
  const nextState =
    action.actionType === "suggest_asset_inclusion"
      ? synchronizeGateSidekickState(nextDraft, {
          ...syncedState,
          assetSelections: syncedState.assetSelections.map((asset) =>
            asset.documentId === action.targetRef
              ? { ...asset, included: true }
              : asset
          ),
        })
      : syncedState;

  return {
    draft: nextDraft,
    state: GateSidekickStateSchema.parse({
      ...nextState,
      actions: nextState.actions.map((entry) =>
        entry.id === action.id
          ? {
              ...entry,
              status: "applied",
            }
          : entry
      ),
    }),
  };
}
