import { z } from "zod";

export const GateTierSchema = z.enum([
  "SOLO_SPARK",
  "STUDIO",
  "GROWTH",
  "ENTERPRISE",
]);

export const DataBackendSchema = z.enum(["supabase", "redis", "mongodb"]);
export const DeliverySurfaceSchema = z.enum([
  "ios",
  "android",
  "windows",
  "cli",
  "web",
]);

export const CompatibilitySeveritySchema = z.enum(["error", "warning", "info"]);

export const GateCheckoutModeSchema = z.enum(["pay_now", "request_review"]);

export const GateDraftStatusSchema = z.enum([
  "draft",
  "saved",
  "awaiting_payment",
  "paid",
  "provisioning",
  "packaged",
  "delivered",
  "failed",
  "review_requested",
]);

export const GatePaymentStatusSchema = z.enum([
  "draft",
  "awaiting_payment",
  "paid",
  "review_requested",
  "failed",
]);

export const GateOrderStatusSchema = z.enum([
  "draft",
  "awaiting_payment",
  "paid",
  "provisioning",
  "packaged",
  "delivered",
  "failed",
  "review_requested",
]);

export const GateBuildStatusSchema = z.enum([
  "queued",
  "running",
  "packaged",
  "delivered",
  "failed",
]);

export const GateSidekickActorSchema = z.enum(["user", "sidekick", "system"]);
export const GateSidekickSessionStatusSchema = z.enum(["active", "closed"]);
export const GateSidekickActionTypeSchema = z.enum([
  "suggest_field_update",
  "suggest_package_component",
  "suggest_asset_inclusion",
  "propose_safe_transformation",
  "approval_required",
]);
export const GateSidekickActionStatusSchema = z.enum([
  "proposed",
  "accepted",
  "rejected",
  "approval_required",
  "applied",
]);
export const GateSidekickTargetTypeSchema = z.enum([
  "field",
  "artifact",
  "snippet",
  "manifest",
  "package_component",
]);
export const GateAssetRiskClassSchema = z.enum([
  "safe_content",
  "safe_config",
  "review_required",
  "logic_protected",
]);
export const GateTransformationTypeSchema = z.enum([
  "variable_insertion",
  "section_rewrite",
  "tone_adjustment",
  "branding",
  "pack_merge",
]);

export const GateBuyerContextSchema = z.object({
  industry: z.string().trim().max(120).optional(),
  companyStage: z.string().trim().max(120).optional(),
  audience: z.string().trim().max(240).optional(),
  preferredChannels: z
    .array(z.string().trim().min(1).max(80))
    .max(8)
    .default([]),
  brandingInputs: z.string().trim().max(2000).optional(),
  deploymentConstraints: z.string().trim().max(2000).optional(),
  requestedOutcomes: z
    .array(z.string().trim().min(1).max(240))
    .max(8)
    .default([]),
  businessContext: z.string().trim().max(2000).optional(),
});

export const GateSidekickRecommendationSnapshotSchema = z.object({
  tier: GateTierSchema,
  operatorPackSlugs: z.array(z.string()).default([]),
  sourceBundleSlugs: z.array(z.string()).default([]),
  deliverySurfaces: z.array(DeliverySurfaceSchema).default([]),
  themePresetId: z.string(),
  assetIds: z.array(z.string()).default([]),
  confidenceNotes: z.array(z.string()).default([]),
});

export const GateSidekickStructuredStateSchema = z.object({
  buyerContext: GateBuyerContextSchema.default({
    preferredChannels: [],
    requestedOutcomes: [],
  }),
  recommendations: GateSidekickRecommendationSnapshotSchema.default({
    tier: "SOLO_SPARK",
    operatorPackSlugs: [],
    sourceBundleSlugs: [],
    deliverySurfaces: ["web"],
    themePresetId: "lagoon-glass",
    assetIds: [],
    confidenceNotes: [],
  }),
  pendingClarifications: z.array(z.string()).default([]),
});

export const DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG = "gate-keeper" as const;
export const DEFAULT_GATE_SIDEKICK_PERSONA_MODE =
  "gate-package-builder-sidekick" as const;

export const GateSidekickToolCallSchema = z.object({
  name: z.string(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const GateSidekickSessionSchema = z.object({
  id: z.string(),
  packageDraftId: z.string(),
  buyerId: z.string().nullable().default(null),
  embodimentProfileSlug: z.string().default(DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG),
  embodimentVersion: z.string().default("1.0.0"),
  personaMode: z.string().default(DEFAULT_GATE_SIDEKICK_PERSONA_MODE),
  voiceTone: z.string().default("wry-precise-custodial"),
  status: GateSidekickSessionStatusSchema.default("active"),
  systemPrompt: z.string().default(""),
  summary: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GateSidekickTurnSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  actor: GateSidekickActorSchema,
  messageText: z.string(),
  structuredState: GateSidekickStructuredStateSchema,
  toolCalls: z.array(GateSidekickToolCallSchema).default([]),
  createdAt: z.string(),
});

export const GatePackageCompositionActionSchema = z.object({
  id: z.string(),
  packageDraftId: z.string(),
  actionType: GateSidekickActionTypeSchema,
  status: GateSidekickActionStatusSchema,
  targetType: GateSidekickTargetTypeSchema,
  targetRef: z.string(),
  title: z.string(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  createdBy: z.string(),
  approvedBy: z.string().nullable().default(null),
  proposedValue: z.unknown().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
});

export const GatePackageAssetSelectionSchema = z.object({
  id: z.string(),
  packageDraftId: z.string(),
  documentId: z.string(),
  documentTitle: z.string(),
  sourcePath: z.string(),
  documentType: z.string(),
  riskClass: GateAssetRiskClassSchema,
  selectionReason: z.string(),
  selectionScore: z.number().min(0).max(1),
  included: z.boolean().default(true),
  versionLabel: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export const GatePackageTransformationSchema = z.object({
  id: z.string(),
  packageDraftId: z.string(),
  documentId: z.string(),
  sourcePath: z.string(),
  transformationType: GateTransformationTypeSchema,
  inputSnapshot: z.unknown(),
  outputSnapshot: z.unknown().nullable().default(null),
  diffSummary: z.string(),
  riskClass: GateAssetRiskClassSchema,
  requiresApproval: z.boolean().default(false),
  approvedBy: z.string().nullable().default(null),
  createdAt: z.string(),
});

export const GatePackageBuildManifestSchema = z.object({
  id: z.string(),
  buildJobId: z.string(),
  manifestVersion: z.number().int().min(1),
  manifestJson: z.record(z.string(), z.unknown()),
  configHash: z.string(),
  createdAt: z.string(),
});

export const GateSidekickStateSchema = z.object({
  session: GateSidekickSessionSchema.nullable().default(null),
  turns: z.array(GateSidekickTurnSchema).default([]),
  actions: z.array(GatePackageCompositionActionSchema).default([]),
  assetSelections: z.array(GatePackageAssetSelectionSchema).default([]),
  transformations: z.array(GatePackageTransformationSchema).default([]),
  manifestHistory: z.array(GatePackageBuildManifestSchema).default([]),
});

export const GateOrderItemKindSchema = z.enum([
  "base",
  "seat_overage",
  "backend",
  "surface",
  "addon",
  "installer",
  "discount",
]);

export const ThemeTokenSchema = z.object({
  color: z.object({
    bgBase: z.string(),
    bgElevated: z.string(),
    panelGlass: z.string(),
    panelGlassStrong: z.string(),
    borderSoft: z.string(),
    borderStrong: z.string(),
    textPrimary: z.string(),
    textSecondary: z.string(),
    accentPrimary: z.string(),
    accentSecondary: z.string(),
    success: z.string(),
    warning: z.string(),
    danger: z.string(),
  }),
  gradient: z.object({
    heroA: z.string(),
    heroB: z.string(),
    heroC: z.string(),
    meshOpacity: z.number(),
  }),
  glass: z.object({
    blurSm: z.string(),
    blurMd: z.string(),
    blurLg: z.string(),
    saturation: z.string(),
    opacitySoft: z.number(),
    opacityStrong: z.number(),
  }),
  radius: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    pill: z.string(),
  }),
  shadow: z.object({
    soft: z.string(),
    medium: z.string(),
    floating: z.string(),
  }),
  motion: z.object({
    fast: z.string(),
    base: z.string(),
    slow: z.string(),
    enabled: z.boolean(),
  }),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
  density: z.enum(["compact", "comfortable", "airy"]),
});

export const GateTierCatalogEntrySchema = z.object({
  id: GateTierSchema,
  label: z.string(),
  includedSeats: z.number().int().min(1),
  maxSeats: z.union([z.number().int().min(1), z.literal("unlimited")]),
  basePriceCents: z.number().int().min(0),
  seatOveragePriceCents: z.number().int().min(0),
  packagingModel: z.string(),
  onboardingMode: z.enum(["guided", "assisted", "governed"]),
  headlinePromise: z.string(),
  dashboardEmphasis: z.string(),
  featureFlags: z.record(z.string(), z.boolean()),
  enabledFeatureLabels: z.array(z.string()),
  excludedFeatureLabels: z.array(z.string()),
});

export const GateOperatorPackSchema = z.object({
  slug: z.string(),
  title: z.string(),
  kind: z.string(),
  summary: z.string(),
  includes: z.array(z.string()),
  bestFor: z.string(),
  premiumCents: z.number().int().min(0),
});

export const GateSourceBundleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  lane: z.string(),
  summary: z.string(),
  includes: z.array(z.string()),
  bestFor: z.string(),
  premiumCents: z.number().int().min(0),
});

export const GateThemePresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  accentColor: z.string(),
  bestFor: z.array(z.string()),
  tokens: ThemeTokenSchema,
});

export const GateUseCaseSchema = z.object({
  slug: z.string(),
  label: z.string(),
  summary: z.string(),
  description: z.string(),
  recommendedTier: GateTierSchema,
  defaultBackend: DataBackendSchema,
  defaultSurfaces: z.array(DeliverySurfaceSchema).min(1),
  defaultThemePresetId: z.string(),
  recommendedOperatorPackSlugs: z.array(z.string()),
  recommendedSourceBundleSlugs: z.array(z.string()),
  backendAffinities: z.record(DataBackendSchema, z.number().int().min(0).max(5)),
  surfaceAffinities: z.record(DeliverySurfaceSchema, z.number().int().min(0).max(5)),
  requiresDocumentSourceOfTruth: z.boolean().default(false),
  documentOriented: z.boolean().default(false),
  notes: z.array(z.string()).default([]),
});

export const PackageConfigDraftInputSchema = z.object({
  buyerEmail: z.string().trim().max(320).optional(),
  companyName: z.string().trim().max(160).optional(),
  embodimentProfileSlug: z
    .string()
    .trim()
    .max(80)
    .default(DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG),
  buyerContext: GateBuyerContextSchema.default({
    preferredChannels: [],
    requestedOutcomes: [],
  }),
  useCaseSlug: z.string().min(1),
  tier: GateTierSchema,
  seatsRequested: z.number().int().min(1).max(999),
  backend: DataBackendSchema,
  deliverySurfaces: z.array(DeliverySurfaceSchema).min(1),
  operatorPackSlugs: z.array(z.string()).default([]),
  sourceBundleSlugs: z.array(z.string()).default([]),
  themePresetId: z.string().min(1),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoAssetPath: z.string().trim().max(260).optional(),
  customNotes: z.string().trim().max(4000).optional(),
  wantsNativeInstaller: z.boolean().default(false),
});

export const PackageConfigDraftPatchSchema = PackageConfigDraftInputSchema.partial();

export const PackageConfigDraftSchema = PackageConfigDraftInputSchema.extend({
  id: z.string(),
  status: GateDraftStatusSchema.default("draft"),
  priceSnapshotCents: z.number().int().min(0).default(0),
  configHash: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CompatibilityFindingSchema = z.object({
  id: z.string(),
  severity: CompatibilitySeveritySchema,
  message: z.string(),
  resolution: z.string().optional(),
});

export const CompatibilityResultSchema = z.object({
  findings: z.array(CompatibilityFindingSchema).default([]),
  blocking: z.boolean().default(false),
  requiresManualReview: z.boolean().default(false),
  checkoutMode: GateCheckoutModeSchema.default("pay_now"),
  enabledFeatures: z.array(z.string()).default([]),
  excludedFeatures: z.array(z.string()).default([]),
});

export const PriceBreakdownItemSchema = z.object({
  code: z.string(),
  label: z.string(),
  amountCents: z.number().int(),
  quantity: z.number().int().min(1).default(1),
  kind: GateOrderItemKindSchema,
});

export const PriceQuoteSchema = z.object({
  currency: z.string().default("usd"),
  subtotalCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  breakdown: z.array(PriceBreakdownItemSchema),
  notes: z.array(z.string()).default([]),
});

export const GateRecommendationsSchema = z.object({
  operatorPackSlugs: z.array(z.string()).default([]),
  sourceBundleSlugs: z.array(z.string()).default([]),
  suggestedSurfaces: z.array(DeliverySurfaceSchema).default([]),
  themePresetId: z.string(),
  notes: z.array(z.string()).default([]),
});

export const GateDraftAnalysisSchema = z.object({
  draft: PackageConfigDraftSchema,
  compatibility: CompatibilityResultSchema,
  quote: PriceQuoteSchema,
  recommendations: GateRecommendationsSchema,
  deliverables: z.array(z.string()).default([]),
  sidekick: GateSidekickStateSchema.default({
    session: null,
    turns: [],
    actions: [],
    assetSelections: [],
    transformations: [],
    manifestHistory: [],
  }),
});

export const GateBuyerSchema = z.object({
  id: z.string(),
  email: z.string(),
  companyName: z.string().optional(),
  createdAt: z.string(),
});

export const GateOrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  itemType: GateOrderItemKindSchema,
  itemRef: z.string().nullable().default(null),
  label: z.string(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const GateBuildLogEntrySchema = z.object({
  at: z.string(),
  step: z.string(),
  status: z.enum(["running", "completed", "failed"]),
  detail: z.string(),
});

export const GateBuildJobSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  packageDraftId: z.string(),
  buildVersion: z.number().int().min(1),
  status: GateBuildStatusSchema,
  startedAt: z.string().nullable().default(null),
  finishedAt: z.string().nullable().default(null),
  errorCode: z.string().nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  retryCount: z.number().int().min(0).default(0),
  buildLog: z.array(GateBuildLogEntrySchema).default([]),
});

export const GateArtifactSchema = z.object({
  id: z.string(),
  buildJobId: z.string(),
  artifactType: z.string(),
  storageBucket: z.string(),
  storagePath: z.string(),
  localPath: z.string().default(""),
  signedUrlExpiresAt: z.string().nullable().default(null),
  checksumSha256: z.string().nullable().default(null),
  byteSize: z.number().int().min(0).nullable().default(null),
  createdAt: z.string(),
  downloadToken: z.string().default(""),
});

export const GateSupportRequestSchema = z.object({
  id: z.string(),
  packageDraftId: z.string().nullable().default(null),
  orderId: z.string().nullable().default(null),
  requestType: z.string(),
  summary: z.string(),
  detail: z.string().nullable().default(null),
  status: z.string().default("open"),
  createdAt: z.string(),
});

export const GateOrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  packageDraftId: z.string(),
  stripeCheckoutSessionId: z.string().nullable().default(null),
  stripePaymentIntentId: z.string().nullable().default(null),
  currency: z.string().default("usd"),
  subtotalCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  paymentStatus: GatePaymentStatusSchema,
  orderStatus: GateOrderStatusSchema,
  paidAt: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  configHash: z.string(),
});

export const GateOrderDetailSchema = z.object({
  order: GateOrderSchema,
  buyer: GateBuyerSchema.nullable(),
  draft: PackageConfigDraftSchema,
  compatibility: CompatibilityResultSchema,
  quote: PriceQuoteSchema,
  recommendations: GateRecommendationsSchema,
  deliverables: z.array(z.string()).default([]),
  items: z.array(GateOrderItemSchema).default([]),
  buildJobs: z.array(GateBuildJobSchema).default([]),
  artifacts: z.array(
    GateArtifactSchema.omit({
      localPath: true,
      downloadToken: true,
    }).extend({
      accessKey: z.string().nullable().default(null),
      accessKeyHint: z.string().nullable().default(null),
      downloadUrl: z.string().nullable().default(null),
    })
  ),
  supportRequests: z.array(GateSupportRequestSchema).default([]),
});

export const GateCheckoutRequestSchema = z.object({
  draftId: z.string().min(1),
  buyerEmail: z.string().trim().min(3).max(320).optional(),
  companyName: z.string().trim().max(160).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  mockPayment: z.boolean().optional(),
});

export const GateCheckoutResponseSchema = z.object({
  mode: z.enum(["stripe", "simulated", "manual_review"]),
  orderId: z.string(),
  url: z.string().url().nullable().default(null),
  sessionId: z.string().nullable().default(null),
  redirectUrl: z.string().nullable().default(null),
});

export const GateRedeemAccessRequestSchema = z.object({
  key: z.string().trim().min(8),
});

export const GateRedeemAccessResponseSchema = z.object({
  artifactId: z.string(),
  artifactType: z.string(),
  downloadUrl: z.string().url(),
  expiresAt: z.string().nullable().default(null),
});

export const GateSidekickMessageRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const GatePersistedStateSchema = z.object({
  version: z.literal(1),
  buyers: z.array(GateBuyerSchema).default([]),
  drafts: z.array(PackageConfigDraftSchema).default([]),
  sidekickByDraftId: z.record(z.string(), GateSidekickStateSchema).default({}),
  orders: z.array(GateOrderSchema).default([]),
  orderItems: z.array(GateOrderItemSchema).default([]),
  buildJobs: z.array(GateBuildJobSchema).default([]),
  artifacts: z.array(GateArtifactSchema).default([]),
  supportRequests: z.array(GateSupportRequestSchema).default([]),
});

export type GateTier = z.infer<typeof GateTierSchema>;
export type DataBackend = z.infer<typeof DataBackendSchema>;
export type DeliverySurface = z.infer<typeof DeliverySurfaceSchema>;
export type GateDraftStatus = z.infer<typeof GateDraftStatusSchema>;
export type GateOrderStatus = z.infer<typeof GateOrderStatusSchema>;
export type GateBuildStatus = z.infer<typeof GateBuildStatusSchema>;
export type GateBuyerContext = z.infer<typeof GateBuyerContextSchema>;
export type GateSidekickActor = z.infer<typeof GateSidekickActorSchema>;
export type GateSidekickSessionStatus = z.infer<
  typeof GateSidekickSessionStatusSchema
>;
export type GateSidekickActionType = z.infer<
  typeof GateSidekickActionTypeSchema
>;
export type GateSidekickActionStatus = z.infer<
  typeof GateSidekickActionStatusSchema
>;
export type GateSidekickTargetType = z.infer<
  typeof GateSidekickTargetTypeSchema
>;
export type GateAssetRiskClass = z.infer<typeof GateAssetRiskClassSchema>;
export type GateTransformationType = z.infer<
  typeof GateTransformationTypeSchema
>;
export type GateTierCatalogEntry = z.infer<typeof GateTierCatalogEntrySchema>;
export type GateOperatorPack = z.infer<typeof GateOperatorPackSchema>;
export type GateSourceBundle = z.infer<typeof GateSourceBundleSchema>;
export type GateThemePreset = z.infer<typeof GateThemePresetSchema>;
export type GateUseCase = z.infer<typeof GateUseCaseSchema>;
export type GateSidekickRecommendationSnapshot = z.infer<
  typeof GateSidekickRecommendationSnapshotSchema
>;
export type GateSidekickStructuredState = z.infer<
  typeof GateSidekickStructuredStateSchema
>;
export type GateSidekickToolCall = z.infer<typeof GateSidekickToolCallSchema>;
export type GateSidekickSession = z.infer<typeof GateSidekickSessionSchema>;
export type GateSidekickTurn = z.infer<typeof GateSidekickTurnSchema>;
export type GatePackageCompositionAction = z.infer<
  typeof GatePackageCompositionActionSchema
>;
export type GatePackageAssetSelection = z.infer<
  typeof GatePackageAssetSelectionSchema
>;
export type GatePackageTransformation = z.infer<
  typeof GatePackageTransformationSchema
>;
export type GatePackageBuildManifest = z.infer<
  typeof GatePackageBuildManifestSchema
>;
export type GateSidekickState = z.infer<typeof GateSidekickStateSchema>;
export type PackageConfigDraftInput = z.infer<typeof PackageConfigDraftInputSchema>;
export type PackageConfigDraftPatch = z.infer<typeof PackageConfigDraftPatchSchema>;
export type PackageConfigDraft = z.infer<typeof PackageConfigDraftSchema>;
export type CompatibilityFinding = z.infer<typeof CompatibilityFindingSchema>;
export type CompatibilityResult = z.infer<typeof CompatibilityResultSchema>;
export type PriceBreakdownItem = z.infer<typeof PriceBreakdownItemSchema>;
export type PriceQuote = z.infer<typeof PriceQuoteSchema>;
export type GateRecommendations = z.infer<typeof GateRecommendationsSchema>;
export type GateDraftAnalysis = z.infer<typeof GateDraftAnalysisSchema>;
export type GateBuyer = z.infer<typeof GateBuyerSchema>;
export type GateOrderItem = z.infer<typeof GateOrderItemSchema>;
export type GateBuildLogEntry = z.infer<typeof GateBuildLogEntrySchema>;
export type GateBuildJob = z.infer<typeof GateBuildJobSchema>;
export type GateArtifact = z.infer<typeof GateArtifactSchema>;
export type GateSupportRequest = z.infer<typeof GateSupportRequestSchema>;
export type GateOrder = z.infer<typeof GateOrderSchema>;
export type GateOrderDetail = z.infer<typeof GateOrderDetailSchema>;
export type GateCheckoutRequest = z.infer<typeof GateCheckoutRequestSchema>;
export type GateCheckoutResponse = z.infer<typeof GateCheckoutResponseSchema>;
export type GateRedeemAccessRequest = z.infer<typeof GateRedeemAccessRequestSchema>;
export type GateRedeemAccessResponse = z.infer<typeof GateRedeemAccessResponseSchema>;
export type GateSidekickMessageRequest = z.infer<
  typeof GateSidekickMessageRequestSchema
>;
export type GatePersistedState = z.infer<typeof GatePersistedStateSchema>;

export const defaultPackageConfigDraftInput: PackageConfigDraftInput = {
  embodimentProfileSlug: DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
  buyerContext: {
    preferredChannels: ["web", "cli"],
    requestedOutcomes: [],
  },
  useCaseSlug: "founder-operator-companion",
  tier: "SOLO_SPARK",
  seatsRequested: 1,
  backend: "supabase",
  deliverySurfaces: ["web", "cli"],
  operatorPackSlugs: [],
  sourceBundleSlugs: [],
  themePresetId: "lagoon-glass",
  wantsNativeInstaller: false,
};
