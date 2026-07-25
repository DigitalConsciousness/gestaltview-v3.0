/**
 * shared/gate/index.ts
 * ====================
 * Public export barrel for the GATE shared module.
 * Consumers should import from this file, not from the individual modules.
 *
 * SPEC §13 — GATE packages may only export reproducible behavioral frameworks,
 * never persistent living DI identities.
 */

// ── Schemas (runtime values) ──────────────────────────────────────────────────
export {
  GateTierSchema,
  DataBackendSchema,
  DeliverySurfaceSchema,
  CompatibilitySeveritySchema,
  GateCheckoutModeSchema,
  GateDraftStatusSchema,
  GatePaymentStatusSchema,
  GateOrderStatusSchema,
  GateBuildStatusSchema,
  CompatibilityFindingSchema,
  CompatibilityResultSchema,
  PackageConfigDraftInputSchema,
  PackageConfigDraftPatchSchema,
  PackageConfigDraftSchema,
  GateCheckoutRequestSchema,
  GateCheckoutResponseSchema,
  defaultPackageConfigDraftInput,
  GateSidekickStateSchema,
} from "./schemas.js";

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  GateTier,
  DataBackend,
  DeliverySurface,
  GateDraftStatus,
  GateOrderStatus,
  GateBuildStatus,
  GateBuyerContext,
  CompatibilityFinding,
  CompatibilityResult,
  PackageConfigDraftInput,
  PackageConfigDraft,
  GateCheckoutRequest,
  GateCheckoutResponse,
  GateOperatorPack,
  GateSourceBundle,
  GateThemePreset,
  GateTierCatalogEntry,
  GateSidekickState,
  GateDraftAnalysis,
  GateRecommendations,
  GateOrder,
  GateOrderDetail,
  GateArtifact,
  GateBuildJob,
} from "./schemas.js";

// ── Engine helpers ────────────────────────────────────────────────────────────
export {
  buildDefaultGateDraftInput,
  applyUseCaseDefaults,
  recommendGatePackage,
  buildGateDeliverablesPreview,
  analyzeGateDraft,
  sanitizeSelection,
  resolvePackTitles,
  resolveBundleTitles,
} from "./engine.js";

// ── Sidekick helpers ──────────────────────────────────────────────────────────
export {
  buildGateSidekickSystemPrompt,
  createGateSidekickState,
  synchronizeGateSidekickState,
  extractGateBuyerContextPatchFromMessage,
  composeGateSidekickReply,
  applyGateSidekickActionToDraft,
} from "./sidekick.js";
