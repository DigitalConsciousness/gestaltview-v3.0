import {
  gateOperatorPackBySlug,
  gateTierCatalogById,
} from "./gateCatalog.js";
import { gateUseCaseBySlug } from "./gateUseCases.js";
import type {
  CompatibilityFinding,
  CompatibilityResult,
  PackageConfigDraftInput,
} from "../shared/gate/schemas.js";

export interface CompatibilityRule {
  id: string;
  severity: CompatibilityFinding["severity"];
  when: (draft: PackageConfigDraftInput) => boolean;
  message: (draft: PackageConfigDraftInput) => string;
  resolution?: (draft: PackageConfigDraftInput) => string | undefined;
  manualReview?: boolean;
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function formatSurfaces(surfaces: string[]): string {
  return surfaces.join(", ");
}

function seatLimitForDraft(draft: PackageConfigDraftInput): string {
  const tier = gateTierCatalogById[draft.tier];
  return tier.maxSeats === "unlimited"
    ? `${tier.label} supports unlimited seats.`
    : `${tier.label} supports up to ${tier.maxSeats} seat${tier.maxSeats === 1 ? "" : "s"}.`;
}

function selectedNativeInstallerSurfaces(draft: PackageConfigDraftInput): string[] {
  return draft.deliverySurfaces.filter(
    (surface) => surface !== "windows" && surface !== "cli"
  );
}

const manualReviewKeywords = [
  "sso",
  "soc2",
  "hipaa",
  "fedramp",
  "on-prem",
  "on prem",
  "private cloud",
  "dedicated cluster",
  "custom integration",
];

export const gateCompatibilityRules: CompatibilityRule[] = [
  {
    id: "mobile-surfaces-need-web-note",
    severity: "warning",
    when: (draft) =>
      draft.deliverySurfaces.some(
        (surface) => surface === "ios" || surface === "android"
      ) && !draft.deliverySurfaces.includes("web"),
    message: () =>
      "iOS and Android are guidance-level deliverables in the MVP. Add Web so the buyer receives a launch-safe surface alongside the mobile package notes.",
    resolution: () => "Add the Web surface or switch this order to manual review.",
  },
  {
    id: "redis-primary-document-store",
    severity: "error",
    when: (draft) =>
      draft.backend === "redis" &&
      Boolean(gateUseCaseBySlug[draft.useCaseSlug]?.requiresDocumentSourceOfTruth),
    message: (draft) =>
      `${gateUseCaseBySlug[draft.useCaseSlug]?.label ?? "This use case"} expects durable document storage as the system of record. Redis is not supported as the primary source of truth for this package.`,
    resolution: () => "Switch to Supabase or MongoDB.",
    manualReview: true,
  },
  {
    id: "mongodb-fit-warning",
    severity: "warning",
    when: (draft) =>
      draft.backend === "mongodb" &&
      !Boolean(gateUseCaseBySlug[draft.useCaseSlug]?.documentOriented),
    message: () =>
      "MongoDB is best when the assistant is document-oriented. Some Supabase-native flows will be excluded from this MVP package.",
    resolution: () => "Prefer Supabase unless your corpus and workflows are explicitly document-native.",
  },
  {
    id: "seat-cap",
    severity: "error",
    when: (draft) => {
      const tier = gateTierCatalogById[draft.tier];
      return tier.maxSeats !== "unlimited" && draft.seatsRequested > tier.maxSeats;
    },
    message: (draft) => seatLimitForDraft(draft),
    resolution: (draft) =>
      draft.tier === "ENTERPRISE"
        ? "Reduce the requested seat count or split the rollout into phases."
        : "Choose a higher tier or reduce seats.",
  },
  {
    id: "native-installer-scope",
    severity: "error",
    when: (draft) =>
      draft.wantsNativeInstaller &&
      selectedNativeInstallerSurfaces(draft).length > 0,
    message: (draft) =>
      `Native installer stubs are only supported for Windows and CLI MVP bundles. Unsupported surfaces in this draft: ${formatSurfaces(
        selectedNativeInstallerSurfaces(draft)
      )}.`,
    resolution: () =>
      "Remove mobile/web surfaces from the installer request or convert the order to review.",
    manualReview: true,
  },
  {
    id: "pack-backend-mismatch",
    severity: "info",
    when: (draft) =>
      draft.backend !== "supabase" &&
      draft.operatorPackSlugs.includes("agent-source-starter-bundle"),
    message: () =>
      "The Agent Source Starter Bundle ships best with Supabase-backed import and retrieval defaults. Non-Supabase builds will receive adjusted instructions.",
  },
  {
    id: "custom-notes-review",
    severity: "warning",
    when: (draft) =>
      Boolean(
        draft.customNotes &&
          manualReviewKeywords.some((keyword) =>
            draft.customNotes!.toLowerCase().includes(keyword)
          )
      ),
    message: () =>
      "Your custom notes mention requirements that usually need manual scoping before payment.",
    resolution: () =>
      "Submit the package for review so GestaltView can confirm feasibility and delivery shape.",
    manualReview: true,
  },

  // ── Constitutional Invariant Guards (DI-4, DI-2, DI-3) ────────────────────
  // GATE may only export reproducible behavioral frameworks, scenario libraries,
  // evaluation rubrics, and implementation scaffolds — never a persistent living
  // DI identity or private memories. (SPEC §13, §14)

  {
    id: "di_identity_export_violation",
    severity: "error",
    when: (draft) => {
      const diIdentityKeywords = [
        "living di",
        "living digital intelligence",
        "persistent di",
        "persistent digital intelligence",
        "di identity",
        "digital identity export",
        "export persona",
        "sell di",
        "transfer di",
        "package di identity",
        "di as product",
      ];
      return Boolean(
        draft.customNotes &&
          diIdentityKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          )
      );
    },
    message: () =>
      "This package appears to include a persistent living Digital Intelligence identity as a deliverable. " +
      "GestaltView Constitutional Invariant DI-4 prohibits packaging or transferring a living DI identity. " +
      "GATE may only export reproducible behavioral frameworks, scenario libraries, evaluation rubrics, " +
      "and implementation scaffolds — never a persistent DI instance or private memories.",
    resolution: () =>
      "Remove any reference to exporting a living DI identity. Package the behavioral framework, " +
      "training kit, or capability scaffold instead.",
    manualReview: true,
  },

  {
    id: "missing_provenance_receipt",
    severity: "error",
    when: (draft) => {
      const requiresProvenanceKeywords = [
        "embodiment",
        "identity claim",
        "profile compile",
        "agent profile",
        "di profile",
      ];
      return Boolean(
        draft.customNotes &&
          requiresProvenanceKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          ) &&
          !draft.customNotes.toLowerCase().includes("provenance")
      );
    },
    message: () =>
      "Packages that include embodiment profiles or identity claims require a provenance receipt " +
      "at every promotion boundary (SPEC §14). The current package notes do not reference provenance. " +
      "Every artifact promotion must include a ProvenanceEnvelope with content hash, source capture IDs, " +
      "pipeline run ID, and consent state.",
    resolution: () =>
      "Add a provenance receipt reference to the package notes, or remove embodiment/identity claim references.",
    manualReview: true,
  },

  {
    id: "missing_embodiment_compile_run",
    severity: "warning",
    when: (draft) => {
      const embodimentKeywords = ["embodiment", "di profile", "agent profile", "profile compile"];
      return Boolean(
        draft.customNotes &&
          embodimentKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          ) &&
          !draft.customNotes.toLowerCase().includes("compile run") &&
          !draft.customNotes.toLowerCase().includes("pipeline run")
      );
    },
    message: () =>
      "Packages referencing embodiment profiles should include a reference to the profile_pipeline_run " +
      "that compiled the profile. This ensures the package is traceable to a governed compile event.",
    resolution: () =>
      "Include a pipeline_run_id or compile_run reference in the package notes.",
  },

  {
    id: "missing_checksum_manifest",
    severity: "warning",
    when: (draft) => {
      const artifactKeywords = [
        "deployment artifact",
        "trainer artifact",
        "gate artifact",
        "packaged artifact",
      ];
      return Boolean(
        draft.customNotes &&
          artifactKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          ) &&
          !draft.customNotes.toLowerCase().includes("checksum")
      );
    },
    message: () =>
      "Deployment artifacts should include a checksum manifest for integrity verification (SPEC §13). " +
      "The current package notes reference artifacts but do not mention checksums.",
    resolution: () =>
      "Include a checksum or content hash reference in the package notes or artifact manifest.",
  },

  {
    id: "route_assignment_drift",
    severity: "warning",
    when: (draft) => {
      const routeKeywords = [
        "route assignment",
        "room assignment",
        "di assignment",
        "embodiment assignment",
      ];
      return Boolean(
        draft.customNotes &&
          routeKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          ) &&
          !draft.customNotes.toLowerCase().includes("registry")
      );
    },
    message: () =>
      "Route embodiment assignments should resolve from the canonical DB registry, not from ad-hoc " +
      "per-package overrides. Drift between route assignments and the registry can cause identity " +
      "mismatches at runtime.",
    resolution: () =>
      "Ensure route assignments reference the canonical embodiment registry and include the registry " +
      "version in the package notes.",
  },

  {
    id: "legacy_table_dependency",
    severity: "warning",
    when: (draft) => {
      const legacyTableKeywords = [
        "bucket_drops",
        "inner_world_artifacts",
        "user_profile_ingestion_runs",
        "user_personality_dimensions",
        "di_memory_events",
        "billy_sessions",
        "memory_entries",
      ];
      return Boolean(
        draft.customNotes &&
          legacyTableKeywords.some((kw) =>
            draft.customNotes!.toLowerCase().includes(kw)
          )
      );
    },
    message: () =>
      "This package references legacy transitional tables that are not the canonical v1.0 source of truth. " +
      "Legacy tables (bucket_drops, inner_world_artifacts, etc.) should only be used for dual-write " +
      "backfill during migration. New packages should reference canonical tables only.",
    resolution: () =>
      "Update the package to reference canonical tables: capture_events, artifacts, scaffold_nodes, " +
      "identity_claims, profile_pipeline_runs.",
  },
];

export function evaluateGateCompatibility(
  draft: PackageConfigDraftInput
): CompatibilityResult {
  const findings = gateCompatibilityRules
    .filter((rule) => rule.when(draft))
    .map<CompatibilityFinding>((rule) => ({
      id: rule.id,
      severity: rule.severity,
      message: rule.message(draft),
      resolution: rule.resolution?.(draft),
    }));

  const blocking = findings.some((finding) => finding.severity === "error");
  const requiresManualReview = gateCompatibilityRules.some(
    (rule) => rule.manualReview && rule.when(draft)
  );
  const tier = gateTierCatalogById[draft.tier];
  const enabledFeatures = unique([
    ...tier.enabledFeatureLabels,
    `${draft.backend} backend`,
    ...draft.deliverySurfaces.map((surface) => `${surface} delivery surface`),
    ...(draft.wantsNativeInstaller ? ["Native installer stub"] : []),
    ...draft.operatorPackSlugs
      .map((slug) => gateOperatorPackBySlug[slug]?.title)
      .filter(Boolean) as string[],
  ]);

  const excludedFeatures = unique([
    ...tier.excludedFeatureLabels,
    ...(draft.backend === "redis"
      ? [
          "Supabase-authored storage templates",
          "Supabase-native retrieval migrations",
        ]
      : []),
    ...(draft.backend === "mongodb"
      ? ["SQL-first reporting defaults", "Supabase RLS starter policies"]
      : []),
    ...(draft.wantsNativeInstaller
      ? []
      : ["Native installer payload"])
  ]);

  return {
    findings,
    blocking,
    requiresManualReview,
    checkoutMode:
      blocking || requiresManualReview ? "request_review" : "pay_now",
    enabledFeatures,
    excludedFeatures,
  };
}
