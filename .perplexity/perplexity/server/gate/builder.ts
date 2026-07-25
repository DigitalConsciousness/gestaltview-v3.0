import { randomUUID, createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  gateOperatorPackBySlug,
  gateSourceBundleBySlug,
  gateThemePresetById,
  gateTierCatalogById,
} from "../../config/gateCatalog.js";
import { gateUseCaseBySlug } from "../../config/gateUseCases.js";
import {
  buildGateDeliverablesPreview,
  resolveBundleTitles,
  resolvePackTitles,
} from "../../shared/gate/engine.js";
import type {
  CompatibilityResult,
  GateArtifact,
  GateBuildJob,
  GateBuyer,
  GateBuildLogEntry,
  GateOrder,
  GatePackageBuildManifest,
  GateSidekickState,
  PackageConfigDraft,
  PriceQuote,
} from "../../shared/gate/schemas.js";
import { gateArtifactsDir, gateBuildsDir } from "./store.js";
import { uploadGateArtifactToStorage } from "./repository.js";
import { hasGateSupabaseConfig } from "./supabase.js";
import { createZipFromDirectory } from "./zip.js";
import {
  GATE_LOCAL_STORAGE_BUCKET,
  GATE_STORAGE_PATH_PREFIX,
} from "./constants.js";

function nowIso(): string {
  return new Date().toISOString();
}

function toCurrency(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function bulletList(items: string[], fallback: string): string {
  if (items.length === 0) {
    return `- ${fallback}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function replaceTemplate(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

async function loadTemplate(name: string): Promise<string> {
  const templatePath = path.resolve(
    process.cwd(),
    "templates",
    "gate",
    name
  );
  return fs.readFile(templatePath, "utf8");
}

function buildEnvTemplate(draft: PackageConfigDraft): string {
  if (draft.backend === "supabase") {
    return [
      "SUPABASE_URL=",
      "SUPABASE_ANON_KEY=",
      "SUPABASE_SERVICE_ROLE_KEY=",
      "GATE_RUNTIME_SURFACES=" + draft.deliverySurfaces.join(","),
    ].join("\n");
  }

  if (draft.backend === "redis") {
    return [
      "REDIS_URL=",
      "REDIS_PASSWORD=",
      "GATE_RUNTIME_SURFACES=" + draft.deliverySurfaces.join(","),
    ].join("\n");
  }

  return [
    "MONGODB_URI=",
    "MONGODB_DB_NAME=",
    "GATE_RUNTIME_SURFACES=" + draft.deliverySurfaces.join(","),
  ].join("\n");
}

function outputPathForAsset(sourcePath: string, themePresetId: string): string {
  if (sourcePath.startsWith("templates/gate/")) {
    return `docs/${path.basename(sourcePath, ".tpl")}`;
  }

  if (sourcePath === "generated/config/backend.env.template") {
    return "config/backend.env.template";
  }

  if (sourcePath === "generated/config/theme.tokens.json") {
    return "config/theme.tokens.json";
  }

  if (sourcePath === "generated/config/operator-packs.json") {
    return "config/operator-packs.json";
  }

  if (sourcePath === "generated/config/source-bundles.json") {
    return "config/source-bundles.json";
  }

  if (sourcePath === "generated/branding/theme-preset.json") {
    return `branding/${themePresetId}.json`;
  }

  if (sourcePath === "generated/install.sh") {
    return "install.sh";
  }

  if (sourcePath === "generated/install.ps1") {
    return "install.ps1";
  }

  return sourcePath;
}

function buildManifest(params: {
  buildJobId: string;
  buyer: GateBuyer | null;
  draft: PackageConfigDraft;
  order: GateOrder;
  compatibility: CompatibilityResult;
  quote: PriceQuote;
  sidekick: GateSidekickState | null;
  storagePath: string;
}) {
  const { buildJobId, buyer, draft, order, compatibility, quote, sidekick, storagePath } =
    params;
  const tier = gateTierCatalogById[draft.tier];
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const theme = gateThemePresetById[draft.themePresetId];
  const selectedAssets = (sidekick?.assetSelections ?? [])
    .filter((asset) => asset.included)
    .map((asset) => ({
      documentId: asset.documentId,
      sourcePath: asset.sourcePath,
      version: asset.versionLabel ?? draft.configHash,
      includedAs: outputPathForAsset(asset.sourcePath, draft.themePresetId),
      riskClass: asset.riskClass,
    }));
  const transformations = (sidekick?.transformations ?? [])
    .filter((transformation) =>
      selectedAssets.some((asset) => asset.documentId === transformation.documentId)
    )
    .map((transformation) => ({
      type: transformation.transformationType,
      documentId: transformation.documentId,
      sourcePath: transformation.sourcePath,
      approved: !transformation.requiresApproval,
      riskClass: transformation.riskClass,
      diffSummary: transformation.diffSummary,
    }));
  const deliverables =
    selectedAssets.length > 0
      ? selectedAssets.map((asset) => asset.includedAs)
      : buildGateDeliverablesPreview(draft);

  return {
    schemaVersion: 1,
    generatedAt: nowIso(),
    orderId: order.id,
    buildJobId,
    draftId: draft.id,
    configHash: draft.configHash,
    buyerProfile: {
      companyName: buyer?.companyName ?? draft.companyName ?? null,
      industry: draft.buyerContext.industry ?? null,
      audience: draft.buyerContext.audience ?? null,
      preferredChannels: draft.buyerContext.preferredChannels,
      requestedOutcomes: draft.buyerContext.requestedOutcomes,
      deploymentConstraints: draft.buyerContext.deploymentConstraints ?? null,
      brandingInputs: draft.buyerContext.brandingInputs ?? null,
      embodimentProfileSlug: draft.embodimentProfileSlug,
    },
    buyer: {
      email: buyer?.email ?? draft.buyerEmail ?? null,
      companyName: buyer?.companyName ?? draft.companyName ?? null,
    },
    configuration: {
      useCase: {
        slug: draft.useCaseSlug,
        label: useCase?.label ?? draft.useCaseSlug,
      },
      tier: {
        id: draft.tier,
        label: tier.label,
      },
      seatsRequested: draft.seatsRequested,
      backend: draft.backend,
      deliverySurfaces: draft.deliverySurfaces,
      operatorPacks: draft.operatorPackSlugs.map((slug) => ({
        slug,
        title: gateOperatorPackBySlug[slug]?.title ?? slug,
      })),
      sourceBundles: draft.sourceBundleSlugs.map((slug) => ({
        slug,
        title: gateSourceBundleBySlug[slug]?.title ?? slug,
      })),
      themePreset: theme
        ? {
            id: theme.id,
            label: theme.label,
            accentColor: theme.accentColor,
          }
        : null,
      branding: {
        brandColor: draft.brandColor ?? null,
        logoAssetPath: draft.logoAssetPath ?? null,
      },
      wantsNativeInstaller: draft.wantsNativeInstaller,
      customNotes: draft.customNotes ?? null,
    },
    compatibility,
    quote,
    deliverables,
    selectedAssets,
    transformations,
    outputs: [
      {
        artifactType: "zip",
        storagePath,
      },
    ],
    sidekick: sidekick?.session
      ? {
          embodimentProfileSlug: sidekick.session.embodimentProfileSlug,
          summary: sidekick.session.summary,
        }
      : null,
  };
}

export async function composeGatePackageArtifact(params: {
  buyer: GateBuyer | null;
  draft: PackageConfigDraft;
  order: GateOrder;
  buildJob: GateBuildJob;
  compatibility: CompatibilityResult;
  quote: PriceQuote;
  sidekick?: GateSidekickState | null;
}): Promise<{
  artifact: GateArtifact;
  buildLog: GateBuildLogEntry[];
  manifest: GatePackageBuildManifest;
}> {
  const { buyer, draft, order, buildJob, compatibility, quote, sidekick = null } = params;
  const buildRoot = path.join(gateBuildsDir(), buildJob.id);
  const stagingDir = path.join(buildRoot, "staging");
  const docsDir = path.join(stagingDir, "docs");
  const configDir = path.join(stagingDir, "config");
  const brandingDir = path.join(stagingDir, "branding");
  const artifactDir = path.join(gateArtifactsDir(), order.id);
  const packageName = `gestaltview-gate-package-${order.id.slice(0, 8)}.zip`;
  const packagePath = path.join(artifactDir, packageName);
  const storagePath = `${GATE_STORAGE_PATH_PREFIX}/${order.id}/${packageName}`;
  const useCase = gateUseCaseBySlug[draft.useCaseSlug];
  const theme = gateThemePresetById[draft.themePresetId];
  const buildLog: GateBuildLogEntry[] = [];
  const includedAssetIds = new Set(
    (sidekick?.assetSelections ?? [])
      .filter((asset) => asset.included)
      .map((asset) => asset.documentId)
  );
  const isIncluded = (documentId: string, fallback = true) =>
    includedAssetIds.size === 0 ? fallback : includedAssetIds.has(documentId);

  const log = (step: string, detail: string, status: GateBuildLogEntry["status"]) => {
    buildLog.push({
      at: nowIso(),
      step,
      detail,
      status,
    });
  };

  await fs.rm(buildRoot, { recursive: true, force: true });
  await fs.mkdir(docsDir, { recursive: true });
  await fs.mkdir(configDir, { recursive: true });
  await fs.mkdir(brandingDir, { recursive: true });
  await fs.mkdir(artifactDir, { recursive: true });
  log("stage", "Created staging directories.", "completed");

  const manifest = buildManifest({
    buildJobId: buildJob.id,
    buyer,
    draft,
    order,
    compatibility,
    quote,
    sidekick,
    storagePath,
  });
  const manifestRecord: GatePackageBuildManifest = {
    id: randomUUID(),
    buildJobId: buildJob.id,
    manifestVersion: 1,
    manifestJson: manifest,
    configHash: draft.configHash,
    createdAt: nowIso(),
  };

  await fs.writeFile(
    path.join(stagingDir, "package.manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
  if (isIncluded("asset-backend-config")) {
    await fs.writeFile(
      path.join(configDir, "backend.env.template"),
      buildEnvTemplate(draft),
      "utf8"
    );
  }
  if (isIncluded("asset-theme-config")) {
    await fs.writeFile(
      path.join(configDir, "theme.tokens.json"),
      JSON.stringify(theme?.tokens ?? null, null, 2),
      "utf8"
    );
  }
  if (isIncluded("asset-pack-config")) {
    await fs.writeFile(
      path.join(configDir, "operator-packs.json"),
      JSON.stringify(
        draft.operatorPackSlugs.map((slug) => gateOperatorPackBySlug[slug]).filter(Boolean),
        null,
        2
      ),
      "utf8"
    );
  }
  if (isIncluded("asset-bundle-config")) {
    await fs.writeFile(
      path.join(configDir, "source-bundles.json"),
      JSON.stringify(
        draft.sourceBundleSlugs.map((slug) => gateSourceBundleBySlug[slug]).filter(Boolean),
        null,
        2
      ),
      "utf8"
    );
  }
  if (isIncluded("asset-branding-export", Boolean(draft.brandColor || draft.logoAssetPath))) {
    await fs.writeFile(
      path.join(brandingDir, `${draft.themePresetId}.json`),
      JSON.stringify(
        {
          themePresetId: draft.themePresetId,
          themeLabel: theme?.label ?? draft.themePresetId,
          accentColor: theme?.accentColor ?? draft.brandColor ?? null,
          brandColor: draft.brandColor ?? null,
          logoAssetPath: draft.logoAssetPath ?? null,
        },
        null,
        2
      ),
      "utf8"
    );
  }
  log("compose", "Wrote manifest and selected config files.", "completed");

  const replacements = {
    companyName:
      buyer?.companyName ?? draft.companyName ?? "your team",
    buyerEmail: buyer?.email ?? draft.buyerEmail ?? "replace-with-email",
    useCaseLabel: useCase?.label ?? draft.useCaseSlug,
    useCaseSummary: useCase?.summary ?? "Bespoke package",
    tierLabel: gateTierCatalogById[draft.tier].label,
    seatsRequested: String(draft.seatsRequested),
    backend: draft.backend,
    surfaces: draft.deliverySurfaces.join(", "),
    operatorPacks: bulletList(
      resolvePackTitles(draft.operatorPackSlugs),
      "No operator packs selected."
    ),
    sourceBundles: bulletList(
      resolveBundleTitles(draft.sourceBundleSlugs),
      "No source bundles selected."
    ),
    enabledFeatures: bulletList(
      compatibility.enabledFeatures,
      "No additional enabled features recorded."
    ),
    excludedFeatures: bulletList(
      compatibility.excludedFeatures,
      "No exclusions recorded."
    ),
    deliverables: bulletList(
      manifest.deliverables,
      "Manifest only."
    ),
    compatibilityWarnings: bulletList(
      compatibility.findings.map((finding) => {
        const resolution = finding.resolution
          ? ` Resolution: ${finding.resolution}`
          : "";
        return `[${finding.severity.toUpperCase()}] ${finding.message}${resolution}`;
      }),
      "No compatibility warnings."
    ),
    totalPrice: toCurrency(quote.totalCents),
    nextActions: bulletList(
      [
        "Fill the environment template with your infrastructure credentials.",
        "Review the onboarding guide before inviting operators.",
        "Replace starter source bundles with buyer-owned material.",
        draft.wantsNativeInstaller
          ? "Validate the installer stub on your target Windows or CLI environment."
          : "Follow the manual install instructions in the README.",
      ],
      "Review the README first."
    ),
    supportPath:
      compatibility.requiresManualReview || compatibility.blocking
        ? "This package includes review notes. Reply with the order ID and any clarifications needed."
        : "If you need additional tailoring, reply with the order ID and your requested delta.",
    customNotes: draft.customNotes?.trim() || "None supplied.",
    themeLabel: theme?.label ?? draft.themePresetId,
    themeDescription:
      theme?.description ?? "Selected theme preset.",
  };

  const docTemplates = [
    "README.md.tpl",
    "ONBOARDING.md.tpl",
    "ARCHITECTURE_SUMMARY.md.tpl",
    "DELIVERABLES.md.tpl",
    "SUPPORT.md.tpl",
  ];
  const docAssetIds: Record<string, string> = {
    "README.md.tpl": "asset-readme-template",
    "ONBOARDING.md.tpl": "asset-onboarding-template",
    "ARCHITECTURE_SUMMARY.md.tpl": "asset-architecture-template",
    "DELIVERABLES.md.tpl": "asset-deliverables-template",
    "SUPPORT.md.tpl": "asset-support-template",
  };

  for (const templateName of docTemplates) {
    const documentId = docAssetIds[templateName];
    if (!isIncluded(documentId)) {
      continue;
    }
    const template = await loadTemplate(templateName);
    const targetName = templateName.replace(/\.tpl$/, "");
    await fs.writeFile(
      path.join(docsDir, targetName),
      replaceTemplate(template, replacements),
      "utf8"
    );
  }
  log("docs", "Generated tailored onboarding and support docs.", "completed");

  if (isIncluded("asset-install-shell", draft.deliverySurfaces.includes("cli"))) {
    await fs.writeFile(
      path.join(stagingDir, "install.sh"),
      [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "",
        "echo \"GestaltView GATE package bootstrap\"",
        "echo \"1. Copy config/backend.env.template to .env\"",
        "echo \"2. Fill in your runtime credentials\"",
        "echo \"3. Review docs/ONBOARDING.md before enabling operators\"",
        draft.wantsNativeInstaller
          ? "echo \"4. Validate the installer stub for your Windows or CLI target\""
          : "echo \"4. Follow the manual setup path in docs/README.md\"",
        "",
      ].join("\n"),
      "utf8"
    );
  }
  if (isIncluded("asset-install-powershell", draft.deliverySurfaces.includes("windows"))) {
    await fs.writeFile(
      path.join(stagingDir, "install.ps1"),
      [
        "$ErrorActionPreference = \"Stop\"",
        "Write-Host \"GestaltView GATE package bootstrap\"",
        "Write-Host \"1. Copy config/backend.env.template to .env\"",
        "Write-Host \"2. Fill in your runtime credentials\"",
        "Write-Host \"3. Review docs/ONBOARDING.md before enabling operators\"",
        draft.wantsNativeInstaller
          ? "Write-Host \"4. Validate the installer stub for your Windows or CLI target\""
          : "Write-Host \"4. Follow the manual setup path in docs/README.md\"",
        "",
      ].join("\n"),
      "utf8"
    );
  }
  log("scripts", "Generated install scripts.", "completed");

  await fs.rm(packagePath, { force: true });
  try {
    await createZipFromDirectory(stagingDir, packagePath);
  } catch (error) {
    log("zip", "Failed to create ZIP artifact.", "failed");
    throw error;
  }
  log("zip", "Created ZIP artifact.", "completed");

  const archive = await fs.readFile(packagePath);
  const checksum = createHash("sha256").update(archive).digest("hex");
  const useSupabaseStorage = hasGateSupabaseConfig();

  let storageBucket = GATE_LOCAL_STORAGE_BUCKET;
  if (useSupabaseStorage) {
    storageBucket = await uploadGateArtifactToStorage(storagePath, archive);
    log(
      "upload",
      `Uploaded package artifact to Supabase Storage bucket "${storageBucket}".`,
      "completed"
    );
  }

  const artifact: GateArtifact = {
    id: randomUUID(),
    buildJobId: buildJob.id,
    artifactType: "zip",
    storageBucket: useSupabaseStorage ? storageBucket : GATE_LOCAL_STORAGE_BUCKET,
    storagePath,
    localPath: packagePath,
    signedUrlExpiresAt: useSupabaseStorage
      ? null
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    checksumSha256: checksum,
    byteSize: archive.byteLength,
    createdAt: nowIso(),
    downloadToken: randomUUID().replace(/-/g, ""),
  };

  log("finalize", "Artifact checksum and delivery token recorded.", "completed");

  return {
    artifact,
    buildLog,
    manifest: manifestRecord,
  };
}
