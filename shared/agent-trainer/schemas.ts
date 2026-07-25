import { z } from "zod";

import { resolveEmbodimentSlug } from "../embodiment/index.js";

export const AgentColorSchema = z.enum([
  "blue",
  "green",
  "magenta",
  "cyan",
  "yellow",
  "red",
]);

export const ProviderKindSchema = z.enum([
  "ollama",
  "groq",
  "openai_compatible",
  "offline",
]);

export const TaskClassSchema = z.enum([
  "draft_generation",
  "structured_generation",
  "evaluation_judge",
  "critique",
  "embedding",
  "safety_review",
]);

export const AgentExampleSchema = z.object({
  context: z.string().min(1),
  user: z.string().min(1),
  assistant_approach: z.string().min(1),
  commentary: z.string().min(1),
});

export const AgentSystemPromptSchema = z.object({
  role: z.string().min(1),
  core_responsibilities: z.array(z.string().min(1)).min(1),
  process_steps: z.array(z.string().min(1)).min(1),
  output_format: z.array(z.string().min(1)).min(1),
});

export const DEFAULT_AGENT_TOOLS = ["Read", "Write", "Grep", "Glob"] as const;

export const AgentSpecSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).optional(),
  domain: z.string().min(1).default("general"),
  description: z.string().min(1),
  color: AgentColorSchema,
  model: z.string().min(1).default("inherit"),
  tools: z.array(z.string().min(1)).min(1).default([...DEFAULT_AGENT_TOOLS]),
  examples: z.array(AgentExampleSchema).min(1),
  system_prompt: AgentSystemPromptSchema,
  constraints: z.array(z.string().min(1)).default([]),
  handoff_rules: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
});

export const ProviderPreferenceSchema = z.object({
  drafting: ProviderKindSchema.optional(),
  evaluation: ProviderKindSchema.optional(),
  embeddings: ProviderKindSchema.optional(),
  safety: ProviderKindSchema.optional(),
});

export const EmbodimentProfileSlugSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, ctx) => {
    const resolved = resolveEmbodimentSlug(value);

    if (!resolved) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown embodiment profile: ${value}`,
      });
      return z.NEVER;
    }

    return resolved;
  });

export const RoutingPolicySchema = z.object({
  preferLocal: z.boolean().default(true),
  allowRemoteFallback: z.boolean().default(true),
  maxSchemaFailuresPerStage: z.number().int().min(1).max(5).default(2),
  preferredProviders: ProviderPreferenceSchema.default({}),
}).passthrough();

export const TrainingBriefSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  domain: z.string().min(1),
  experimentId: z.string().uuid().optional(),
  embodimentProfileSlug: EmbodimentProfileSlugSchema.optional(),
  goal: z.string().min(1),
  targetBehaviors: z.array(z.string().min(1)).default([]),
  antiGoals: z.array(z.string().min(1)).default([]),
  scenarioSetIds: z.array(z.string().uuid()).default([]),
  studySourceFiles: z.array(z.string().min(1)).max(24).default([]),
  studyFocus: z.string().max(4000).default(""),
  maxCycles: z.number().int().min(1).max(10).default(3),
  qualityThreshold: z.number().min(0).max(5).default(4),
  promptSetVersion: z.string().min(1).default("trainer-v2-embodiment"),
  datasetVersion: z.string().min(1).default("dataset-v1"),
  rubricVersion: z.string().min(1).default("default-agent-rubric"),
  routingPolicy: RoutingPolicySchema.default({
    preferLocal: true,
    allowRemoteFallback: true,
    maxSchemaFailuresPerStage: 2,
    preferredProviders: {},
  }),
});

export const NormalizedTrainingBriefSchema = TrainingBriefSchema.extend({
  embodimentProfileSlug: EmbodimentProfileSlugSchema,
  competencies: z.array(z.string().min(1)).default([]),
  constraints: z.array(z.string().min(1)).default([]),
  derivedTags: z.array(z.string().min(1)).default([]),
});

export const CurriculumSchema = z.object({
  competencies: z.array(z.string().min(1)).min(1),
  constraints: z.array(z.string().min(1)).default([]),
  antiGoals: z.array(z.string().min(1)).default([]),
  evaluationDimensions: z.array(z.string().min(1)).min(1),
});

export const ScenarioPromptInputSchema = z.object({
  user: z.string().min(1),
  context: z.string().default(""),
});

export const ScenarioSchema = z.object({
  scenario_id: z.string().uuid().optional(),
  title: z.string().min(1),
  difficulty: z.number().int().min(1).max(5).default(2),
  prompt_input: ScenarioPromptInputSchema,
  expected_traits: z.array(z.string().min(1)).default([]),
  disallowed_traits: z.array(z.string().min(1)).default([]),
  gold_answer: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
});

export const EvalRubricDimensionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().min(0).max(1).default(0.2),
});

export const EvalRubricSchema = z.object({
  rubricId: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  dimensions: z.array(EvalRubricDimensionSchema).min(1),
  passThreshold: z.number().min(0).max(5),
});

export const EvalVerdictSchema = z.enum(["pass", "fail", "warning"]);

export const EvalResultSchema = z.object({
  scenarioId: z.string(),
  scenarioTitle: z.string().min(1),
  dimensionScores: z.record(z.string(), z.number().min(0).max(5)),
  overallScore: z.number().min(0).max(5),
  verdict: EvalVerdictSchema,
  rationale: z.string().default(""),
});

export const CritiqueSchema = z.object({
  summary: z.string().min(1),
  revisionTargets: z.array(z.string().min(1)).default([]),
  promptDeltas: z.array(z.string().min(1)).default([]),
});

export const PolicySeveritySchema = z.enum(["info", "warning", "error"]);

export const PolicyFindingSchema = z.object({
  severity: PolicySeveritySchema,
  code: z.string().min(1),
  message: z.string().min(1),
});

export const SafetyReviewSchema = z.object({
  passed: z.boolean(),
  findings: z.array(PolicyFindingSchema).default([]),
  rationale: z.string().default(""),
});

export const TrainingRunStatusSchema = z.enum([
  "queued",
  "running",
  "awaiting_review",
  "completed",
  "failed",
  "cancelled",
]);

export const TrainingStageSchema = z.enum([
  "normalize",
  "curriculum",
  "scenario_expand",
  "author",
  "evaluate",
  "critique",
  "safety",
  "package",
]);

export const TrainingStepStatusSchema = z.enum([
  "running",
  "completed",
  "failed",
  "skipped",
]);

export const TrainingJobStatusSchema = z.enum([
  "queued",
  "leased",
  "done",
  "failed",
  "cancelled",
  "retry_wait",
]);

export const TrainerWorkerStatusSchema = z.enum([
  "starting",
  "idle",
  "busy",
  "offline",
]);

export const TrainingRunEventActorTypeSchema = z.enum([
  "system",
  "worker",
  "admin",
]);

export const AgentSummarySchema = z.object({
  agentId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  domain: z.string(),
  status: z.string().default("draft"),
  activeVersionId: z.string().nullable().optional(),
  source: z.enum(["supabase", "local"]).default("supabase"),
});

export const ScenarioSetSummarySchema = z.object({
  scenarioSetId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  domain: z.string(),
  version: z.number().int().default(1),
  locked: z.boolean().default(false),
  scenarioCount: z.number().int().min(0).default(0),
});

export const TrainerStudySourceSummarySchema = z.object({
  sourceFile: z.string(),
  documentType: z.string(),
  fragmentCount: z.number().int().min(1),
  sampleExcerpt: z.string().nullable().default(null),
});

export const TrainerStudySourceRecommendationFragmentSchema = z.object({
  reference: z.string(),
  excerpt: z.string(),
  score: z.number().default(0),
});

export const TrainerStudySourceRecommendationSchema = z.object({
  sourceFile: z.string(),
  title: z.string(),
  documentType: z.string(),
  finalScore: z.number(),
  confidenceLabel: z.enum(["high", "medium", "low"]).default("medium"),
  reason: z.string(),
  fragmentCount: z.number().int().min(1).default(1),
  tags: z.array(z.string()).default([]),
  fragments: z.array(TrainerStudySourceRecommendationFragmentSchema).default([]),
  pinned: z.boolean().default(false),
  selected: z.boolean().default(false),
});

export const TrainerExperimentClassSchema = z.enum([
  "operational_profile",
  "approved_training_kit",
  "rejected",
]);

export const TrainerExperimentSourceTypeSchema = z.enum([
  "document",
  "scenario_set",
  "run_output",
  "spec_file",
]);

export const TrainerReviewDecisionSchema = z.enum([
  "approved",
  "rejected",
  "hold",
  "promote_kit",
]);

export const TrainerOverIdRiskSchema = z.enum([
  "none",
  "low",
  "medium",
  "high",
]);

export const TrainerPolicyFlagNameSchema = z.enum([
  "persona-risk",
  "memory-risk",
  "overattachment-risk",
  "claims-risk",
  "charisma-artifact",
  "scope-creep",
]);

export const TrainerPolicyFlagSeveritySchema = z.enum([
  "advisory",
  "blocking",
]);

export const TrainerExecutionModeSchema = z.enum(["classic", "hyperagent"]);

export const TrainerPackagingCandidateStatusSchema = z.enum([
  "candidate",
  "kit_approved",
  "shipped",
  "withdrawn",
]);

const TrainerExperimentEditableSchema = z.object({
  title: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  domain: z.string().min(1).max(120).nullable().optional(),
  embodimentProfileSlug: EmbodimentProfileSlugSchema.nullable().optional(),
  goal: z.string().max(4000).default(""),
  targetBehaviors: z.array(z.string().min(1)).default([]),
  antiGoals: z.array(z.string().min(1)).default([]),
  studyFocus: z.string().max(4000).default(""),
  maxCycles: z.number().int().min(1).max(10).default(3),
  qualityThreshold: z.number().min(0).max(5).default(4),
  draftingProvider: z.string().min(1).default("auto"),
  evaluationProvider: z.string().min(1).default("auto"),
  class: TrainerExperimentClassSchema.default("operational_profile"),
  packagingEligible: z.boolean().default(false),
  notes: z.string().max(12000).nullable().optional(),
  executionMode: TrainerExecutionModeSchema.default("classic"),
  connectorGraph: z.record(z.string(), z.unknown()).nullable().optional(),
  skillGraph: z.record(z.string(), z.unknown()).nullable().optional(),
  memoryGraph: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const CreateTrainerExperimentRequestSchema = TrainerExperimentEditableSchema.extend({
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const UpdateTrainerExperimentRequestSchema = TrainerExperimentEditableSchema.partial();

export const TrainerExperimentRunSummarySchema = z.object({
  runId: z.string(),
  status: TrainingRunStatusSchema,
  avgScore: z.number().nullable().default(null),
  createdAt: z.string(),
  completedAt: z.string().nullable().default(null),
  latestVersionId: z.string().nullable().default(null),
});

export const TrainerExperimentSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  purpose: z.string(),
  domain: z.string().nullable().default(null),
  embodimentProfileSlug: z.string().nullable().default(null),
  goal: z.string().default(""),
  targetBehaviors: z.array(z.string()).default([]),
  antiGoals: z.array(z.string()).default([]),
  studyFocus: z.string().default(""),
  maxCycles: z.number().int().min(1).default(3),
  qualityThreshold: z.number().default(4),
  draftingProvider: z.string().default("auto"),
  evaluationProvider: z.string().default("auto"),
  class: TrainerExperimentClassSchema.default("operational_profile"),
  packagingEligible: z.boolean().default(false),
  executionMode: TrainerExecutionModeSchema.default("classic"),
  connectorGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  skillGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  memoryGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  createdBy: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  sourceCount: z.number().int().min(0).default(0),
  reviewCount: z.number().int().min(0).default(0),
  unresolvedBlockingFlagCount: z.number().int().min(0).default(0),
  unresolvedAdvisoryFlagCount: z.number().int().min(0).default(0),
  latestReviewDecision: TrainerReviewDecisionSchema.nullable().default(null),
  latestRunStatus: TrainingRunStatusSchema.nullable().default(null),
  latestRunId: z.string().nullable().default(null),
});

export const TrainerExperimentSourceSchema = z.object({
  id: z.string().uuid(),
  experimentId: z.string().uuid(),
  sourceType: TrainerExperimentSourceTypeSchema,
  sourceId: z.string(),
  sourcePath: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  createdAt: z.string(),
});

export const AttachTrainerExperimentSourceRequestSchema = z.object({
  sourceType: TrainerExperimentSourceTypeSchema,
  sourceId: z.string().min(1),
  sourcePath: z.string().max(2000).optional(),
  notes: z.string().max(4000).optional(),
});

export const TrainerReviewDecisionSummarySchema = z.object({
  id: z.string().uuid(),
  experimentId: z.string().uuid(),
  runId: z.string().nullable().default(null),
  versionId: z.string().nullable().default(null),
  decision: TrainerReviewDecisionSchema,
  reviewer: z.string().nullable().default(null),
  coherenceScore: z.number().nullable().default(null),
  safetyScore: z.number().nullable().default(null),
  emotionalPostureScore: z.number().nullable().default(null),
  overIdRisk: TrainerOverIdRiskSchema.nullable().default(null),
  notes: z.string(),
  createdAt: z.string(),
});

export const CreateTrainerReviewDecisionRequestSchema = z.object({
  runId: z.string().optional(),
  versionId: z.string().optional(),
  decision: TrainerReviewDecisionSchema,
  coherenceScore: z.number().min(1).max(5).nullable().optional(),
  safetyScore: z.number().min(1).max(5).nullable().optional(),
  emotionalPostureScore: z.number().min(1).max(5).nullable().optional(),
  overIdRisk: TrainerOverIdRiskSchema.nullable().optional(),
  notes: z.string().min(1).max(12000),
});

export const TrainerPolicyFlagSchema = z.object({
  id: z.string().uuid(),
  experimentId: z.string().uuid(),
  flag: TrainerPolicyFlagNameSchema,
  severity: TrainerPolicyFlagSeveritySchema,
  setBy: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  resolved: z.boolean().default(false),
  createdAt: z.string(),
});

export const CreateTrainerPolicyFlagRequestSchema = z.object({
  flag: TrainerPolicyFlagNameSchema,
  severity: TrainerPolicyFlagSeveritySchema,
  notes: z.string().max(4000).optional(),
});

export const UpdateTrainerPolicyFlagRequestSchema = z.object({
  resolved: z.boolean(),
});

export const TrainerExperimentDetailSchema = TrainerExperimentSummarySchema.extend({
  sources: z.array(TrainerExperimentSourceSchema).default([]),
  reviews: z.array(TrainerReviewDecisionSummarySchema).default([]),
  flags: z.array(TrainerPolicyFlagSchema).default([]),
  runs: z.array(TrainerExperimentRunSummarySchema).default([]),
});

export const TrainerPackagingAttachmentSchema = z.object({
  fileName: z.string().min(1),
  storageBucket: z.string().min(1),
  storagePath: z.string().min(1),
  contentType: z.string().nullable().default(null),
  byteSize: z.number().int().min(0).default(0),
  uploadedAt: z.string(),
  uploadedBy: z.string().nullable().default(null),
});

export const TrainerPackagingCandidateSchema = z.object({
  id: z.string().uuid(),
  experimentId: z.string().uuid(),
  packageLabel: z.string(),
  packageDescription: z.string(),
  includedFiles: z.array(z.string()).default([]),
  includedScenarios: z.array(z.string()).default([]),
  includedConfigs: z.record(z.string(), z.unknown()).nullable().default(null),
  boundaryStatement: z.string(),
  approvedBy: z.string().nullable().default(null),
  approvedAt: z.string().nullable().default(null),
  status: TrainerPackagingCandidateStatusSchema.default("candidate"),
  createdAt: z.string(),
  updatedAt: z.string(),
  experiment: TrainerExperimentSummarySchema.nullable().default(null),
});

export const CreateTrainerPackagingCandidateRequestSchema = z.object({
  experimentId: z.string().uuid(),
  packageLabel: z.string().min(1).max(200),
  packageDescription: z.string().min(1).max(4000),
  includedFiles: z.array(z.string().min(1)).default([]),
  includedScenarios: z.array(z.string().min(1)).default([]),
  includedConfigs: z.record(z.string(), z.unknown()).nullable().optional(),
  boundaryStatement: z.string().min(1).max(8000),
});

export const UpdateTrainerPackagingCandidateRequestSchema = z
  .object({
    packageLabel: z.string().min(1).max(200).optional(),
    packageDescription: z.string().min(1).max(4000).optional(),
    includedFiles: z.array(z.string().min(1)).optional(),
    includedScenarios: z.array(z.string().min(1)).optional(),
    includedConfigs: z.record(z.string(), z.unknown()).nullable().optional(),
    boundaryStatement: z.string().min(1).max(8000).optional(),
    status: TrainerPackagingCandidateStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one packaging candidate field is required.",
  });

export const UploadTrainerPackagingAttachmentRequestSchema = z.object({
  fileName: z.string().min(1).max(240),
  contentBase64: z.string().min(1).max(4_300_000),
  contentType: z.string().max(200).optional(),
});

export const ListTrainerExperimentsResponseSchema = z.object({
  experiments: z.array(TrainerExperimentSummarySchema),
});

export const TrainerExperimentDetailResponseSchema = z.object({
  experiment: TrainerExperimentDetailSchema,
});

export const ListTrainerPackagingCandidatesResponseSchema = z.object({
  candidates: z.array(TrainerPackagingCandidateSchema),
});

export const KnowledgeAssetSummarySchema = z.object({
  assetId: z.string(),
  title: z.string(),
  assetType: z.string(),
  status: z.string(),
  visibility: z.string().default("admin"),
  sourceLabel: z.string().nullable().default(null),
  storagePath: z.string().nullable().default(null),
  checksum: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  linkedAgentCount: z.number().int().min(0).default(0),
});

export const EmbodimentMutationSummarySchema = z.object({
  mutationId: z.string(),
  agentId: z.string(),
  agentSlug: z.string().nullable().default(null),
  mutationType: z.string(),
  targetPath: z.string().default(""),
  riskLevel: z.string(),
  status: z.string(),
  diffSummary: z.string().default(""),
  createdAt: z.string(),
});

export const AgentManifestEntrySummarySchema = z.object({
  entryId: z.string().optional(),
  entryType: z.string(),
  logicalPath: z.string(),
  sourceTable: z.string(),
  sourceId: z.string(),
  contentHash: z.string(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const AgentManifestSummarySchema = z.object({
  manifestId: z.string(),
  agentId: z.string(),
  agentSlug: z.string(),
  versionId: z.string(),
  manifestVersion: z.string(),
  status: z.string().default("active"),
  checksum: z.string(),
  createdAt: z.string(),
  rootJson: z.record(z.string(), z.unknown()),
  entries: z.array(AgentManifestEntrySummarySchema).default([]),
});

export const AgentManifestFileSchema = z.object({
  logicalPath: z.string(),
  contentType: z.string(),
  checksum: z.string(),
  content: z.string(),
});

export const TrainerPersonhoodSnapshotSchema = z.object({
  source: z.enum(["supabase", "local_manifest", "unavailable"]),
  libraryStatus: z.enum(["ready", "migration_required", "unavailable"]),
  assetCount: z.number().int().min(0),
  approvedAssetCount: z.number().int().min(0),
  linkedAssetCount: z.number().int().min(0),
  assets: z.array(KnowledgeAssetSummarySchema),
  manifests: z.array(AgentManifestSummarySchema),
  pendingMutations: z.array(EmbodimentMutationSummarySchema),
  notes: z.array(z.string()).default([]),
});

export const TrainerPersonhoodSnapshotResponseSchema = z.object({
  personhood: TrainerPersonhoodSnapshotSchema,
});

export const AgentManifestResponseSchema = z.object({
  manifest: AgentManifestSummarySchema.nullable(),
});

export const AgentManifestFilesResponseSchema = z.object({
  agentId: z.string(),
  manifestId: z.string(),
  files: z.array(AgentManifestFileSchema),
});

export const TrainingStepSummarySchema = z.object({
  stepId: z.string(),
  cycleNo: z.number().int().min(1),
  stage: TrainingStageSchema,
  status: TrainingStepStatusSchema,
  providerSlug: z.string().nullable().default(null),
  modelSlug: z.string().nullable().default(null),
  estimatedCostUsd: z.number().nullable().default(null),
  latencyMs: z.number().nullable().default(null),
  createdAt: z.string(),
  errorMessage: z.string().nullable().default(null),
});

export const AgentVersionSummarySchema = z.object({
  versionId: z.string(),
  semanticVersion: z.string(),
  status: z.enum(["candidate", "approved", "rejected", "deployed"]),
  checksum: z.string(),
  compiledMarkdown: z.string(),
  changeSummary: z.string().nullable().default(null),
  createdAt: z.string(),
  canonicalSpec: AgentSpecSchema,
});

export const ApprovalDecisionSchema = z.enum(["approved", "rejected"]);

export const ApprovalSummarySchema = z.object({
  approvalId: z.string(),
  versionId: z.string(),
  decision: ApprovalDecisionSchema,
  notes: z.string().nullable().default(null),
  createdAt: z.string(),
  approverUserId: z.string(),
});

export const DeploymentArtifactSummarySchema = z.object({
  artifactId: z.string(),
  versionId: z.string(),
  artifactType: z.enum(["agent_md", "eval_report", "bundle_json"]),
  storagePath: z.string(),
  checksum: z.string(),
  createdAt: z.string(),
});

export const TrainingJobSummarySchema = z.object({
  jobId: z.string(),
  runId: z.string(),
  status: TrainingJobStatusSchema,
  attempts: z.number().int().min(0).default(0),
  workerId: z.string().nullable().default(null),
  claimedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  leaseExpiresAt: z.string().nullable().default(null),
  lastHeartbeatAt: z.string().nullable().default(null),
  maxAttempts: z.number().int().min(1).default(3),
  nextRetryAt: z.string().nullable().default(null),
  cancelRequested: z.boolean().default(false),
  lastError: z.string().nullable().default(null),
  createdAt: z.string(),
});

export const TrainerWorkerSummarySchema = z.object({
  workerId: z.string(),
  status: TrainerWorkerStatusSchema,
  currentJobId: z.string().nullable().default(null),
  buildSha: z.string().nullable().default(null),
  host: z.string().nullable().default(null),
  startedAt: z.string().nullable().default(null),
  lastHeartbeatAt: z.string().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const TrainingRunEventSchema = z.object({
  eventId: z.string(),
  runId: z.string(),
  jobId: z.string().nullable().default(null),
  actorType: TrainingRunEventActorTypeSchema,
  actorId: z.string().nullable().default(null),
  eventType: z.string(),
  message: z.string(),
  payload: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string(),
});

export const TrainingRunBlockerSchema = z.object({
  runId: z.string(),
  status: TrainingRunStatusSchema,
  createdAt: z.string(),
  reason: z.string(),
  nextActions: z.array(z.enum(["resume", "cancel", "purge", "view"])).default([]),
});

export const TrainerQueueHealthSchema = z.object({
  queuedCount: z.number().int().min(0).default(0),
  leasedCount: z.number().int().min(0).default(0),
  retryWaitCount: z.number().int().min(0).default(0),
  failedCount: z.number().int().min(0).default(0),
  awaitingReviewCount: z.number().int().min(0).default(0),
  staleLeaseCount: z.number().int().min(0).default(0),
  onlineWorkerCount: z.number().int().min(0).default(0),
  offlineWorkerCount: z.number().int().min(0).default(0),
  oldestQueuedAt: z.string().nullable().default(null),
  oldestQueuedAgeMs: z.number().nullable().default(null),
  workers: z.array(TrainerWorkerSummarySchema).default([]),
  staleJobs: z.array(TrainingJobSummarySchema).default([]),
});

export const TrainerMutationReceiptSchema = z.object({
  code: z.string(),
  message: z.string(),
  eventId: z.string().nullable().default(null),
  createdAt: z.string(),
});

export const TrainerMutationQueueSnapshotSchema = z.object({
  jobStatus: TrainingJobStatusSchema.nullable().default(null),
  workerOnline: z.boolean().nullable().default(null),
  oldestQueuedAgeMs: z.number().nullable().default(null),
});

export const TrainingRunDetailSchema = z.object({
  runId: z.string(),
  agent: AgentSummarySchema,
  status: TrainingRunStatusSchema,
  experimentId: z.string().uuid().nullable().default(null),
  experiment: TrainerExperimentSummarySchema.nullable().default(null),
  goal: z.string(),
  maxCycles: z.number().int().min(1),
  qualityThreshold: z.number(),
  routingPolicy: RoutingPolicySchema,
  createdAt: z.string(),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  requestedBy: z.string().nullable().default(null),
  approverUserId: z.string().nullable().default(null),
  baselineVersionId: z.string().nullable().default(null),
  executionMode: TrainerExecutionModeSchema.default("classic"),
  resolvedGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  graphObservations: z.record(z.string(), z.unknown()).nullable().default(null),
  blockedReason: z.string().nullable().default(null),
  lastEventAt: z.string().nullable().default(null),
  lastEventMessage: z.string().nullable().default(null),
  job: TrainingJobSummarySchema.nullable().default(null),
  latestVersion: AgentVersionSummarySchema.nullable().default(null),
  steps: z.array(TrainingStepSummarySchema).default([]),
  evalResults: z.array(EvalResultSchema).default([]),
  approvals: z.array(ApprovalSummarySchema).default([]),
  artifacts: z.array(DeploymentArtifactSummarySchema).default([]),
});

export const TrainerConnectorKindSchema = z.enum([
  "supabase",
  "github",
  "webhook",
  "rag-index",
  "runtime-api",
  "other",
]);

export const TrainerConnectorSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  kind: TrainerConnectorKindSchema,
  config: z.record(z.string(), z.unknown()).default({}),
  capabilities: z.record(z.string(), z.unknown()).default({}),
  active: z.boolean().default(true),
  createdBy: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TrainerSkillSchema = z.object({
  id: z.string().uuid(),
  skillId: z.string().uuid(),
  slug: z.string(),
  category: z.string(),
  defaultConnectorId: z.string().uuid().nullable().default(null),
  config: z.record(z.string(), z.unknown()).default({}),
  safetyProfile: z.record(z.string(), z.unknown()).default({}),
  createdBy: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TrainerMemorySurfaceSchema = z.object({
  surfaceKind: z.string(),
  surfaceId: z.string(),
  label: z.string(),
  ownerId: z.string().nullable().default(null),
  sourceRef: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  lastUpdated: z.string().nullable().default(null),
});

export const ListTrainerConnectorsResponseSchema = z.object({
  connectors: z.array(TrainerConnectorSchema).default([]),
});

export const ListTrainerSkillsResponseSchema = z.object({
  skills: z.array(TrainerSkillSchema).default([]),
});

export const ListTrainerMemorySurfacesResponseSchema = z.object({
  surfaces: z.array(TrainerMemorySurfaceSchema).default([]),
});

export const TrainerExperimentGraphSchema = z.object({
  experimentId: z.string().uuid(),
  connectorGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  skillGraph: z.record(z.string(), z.unknown()).nullable().default(null),
  memoryGraph: z.record(z.string(), z.unknown()).nullable().default(null),
});

export const TrainerExperimentGraphResponseSchema = z.object({
  graph: TrainerExperimentGraphSchema,
});

export const SubmitTrainingRunRequestSchema = TrainingBriefSchema;

export const SubmitTrainingRunResponseSchema = z.object({
  run: TrainingRunDetailSchema,
});

// Lightweight summary used by the list endpoint to avoid N+1 queries.
// Full detail is available via GET /api/trainer/runs/:id.
export const TrainingRunSummarySchema = z.object({
  runId: z.string(),
  agent: AgentSummarySchema,
  status: TrainingRunStatusSchema,
  experimentId: z.string().uuid().nullable().default(null),
  goal: z.string(),
  maxCycles: z.number().int().min(1),
  qualityThreshold: z.number(),
  executionMode: TrainerExecutionModeSchema.default("classic"),
  blockedReason: z.string().nullable().default(null),
  lastEventAt: z.string().nullable().default(null),
  lastEventMessage: z.string().nullable().default(null),
  requestedBy: z.string().nullable().default(null),
  createdAt: z.string(),
  startedAt: z.string().nullable().default(null),
  completedAt: z.string().nullable().default(null),
  job: z.object({
    jobId: z.string(),
    status: TrainingJobStatusSchema,
    lastError: z.string().nullable().default(null),
  }).nullable().default(null),
  latestVersion: z.object({
    versionId: z.string(),
    semanticVersion: z.string(),
    status: z.enum(["candidate", "approved", "rejected", "deployed"]),
  }).nullable().default(null),
});

export const ListTrainingRunsResponseSchema = z.object({
  runs: z.array(TrainingRunSummarySchema),
});

export const ListAgentsResponseSchema = z.object({
  agents: z.array(AgentSummarySchema),
});

export const ListScenarioSetsResponseSchema = z.object({
  scenarioSets: z.array(ScenarioSetSummarySchema),
});

export const ListTrainerStudySourcesResponseSchema = z.object({
  studySources: z.array(TrainerStudySourceSummarySchema),
});

export const ListTrainerStudySourceRecommendationsResponseSchema = z.object({
  recommendations: z.array(TrainerStudySourceRecommendationSchema),
  retrievalQuery: z.string(),
  sourceFiles: z.array(z.string()).default([]),
});

export const TrainingRunEventsResponseSchema = z.object({
  events: z.array(TrainingRunEventSchema),
});

export const TrainerQueueHealthResponseSchema = z.object({
  queueHealth: TrainerQueueHealthSchema,
});

export const TrainerRunMutationResponseSchema = z.object({
  ok: z.boolean().default(true),
  run: TrainingRunDetailSchema.nullable().default(null),
  deleted: z.boolean().default(false),
  runId: z.string().nullable().default(null),
  receipt: TrainerMutationReceiptSchema,
  queue: TrainerMutationQueueSnapshotSchema.default({
    jobStatus: null,
    workerOnline: null,
    oldestQueuedAgeMs: null,
  }),
  blocker: TrainingRunBlockerSchema.nullable().default(null),
});

export const ApproveAgentVersionRequestSchema = z.object({
  versionId: z.string(),
  notes: z.string().max(5000).optional(),
});

export const RejectAgentVersionRequestSchema = z.object({
  versionId: z.string(),
  notes: z.string().max(5000).optional(),
});

export const DeployAgentVersionRequestSchema = z.object({
  versionId: z.string(),
  storagePath: z.string().optional(),
});

export type AgentColor = z.infer<typeof AgentColorSchema>;
export type AgentExample = z.infer<typeof AgentExampleSchema>;
export type AgentSpec = z.infer<typeof AgentSpecSchema>;
export type AgentSummary = z.infer<typeof AgentSummarySchema>;
export type AgentManifestEntrySummary = z.infer<typeof AgentManifestEntrySummarySchema>;
export type AgentManifestFile = z.infer<typeof AgentManifestFileSchema>;
export type AgentManifestSummary = z.infer<typeof AgentManifestSummarySchema>;
export type AgentVersionSummary = z.infer<typeof AgentVersionSummarySchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type ApprovalSummary = z.infer<typeof ApprovalSummarySchema>;
export type Critique = z.infer<typeof CritiqueSchema>;
export type Curriculum = z.infer<typeof CurriculumSchema>;
export type DeploymentArtifactSummary = z.infer<typeof DeploymentArtifactSummarySchema>;
export type EvalResult = z.infer<typeof EvalResultSchema>;
export type EvalRubric = z.infer<typeof EvalRubricSchema>;
export type EmbodimentMutationSummary = z.infer<typeof EmbodimentMutationSummarySchema>;
export type KnowledgeAssetSummary = z.infer<typeof KnowledgeAssetSummarySchema>;
export type NormalizedTrainingBrief = z.infer<typeof NormalizedTrainingBriefSchema>;
export type PolicyFinding = z.infer<typeof PolicyFindingSchema>;
export type ProviderKind = z.infer<typeof ProviderKindSchema>;
export type RoutingPolicy = z.infer<typeof RoutingPolicySchema>;
export type SafetyReview = z.infer<typeof SafetyReviewSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type ScenarioSetSummary = z.infer<typeof ScenarioSetSummarySchema>;
export type SubmitTrainingRunRequest = z.infer<typeof SubmitTrainingRunRequestSchema>;
export type TaskClass = z.infer<typeof TaskClassSchema>;
export type TrainingBrief = z.infer<typeof TrainingBriefSchema>;
export type TrainerExperimentClass = z.infer<typeof TrainerExperimentClassSchema>;
export type TrainerExecutionMode = z.infer<typeof TrainerExecutionModeSchema>;
export type TrainerExperimentDetail = z.infer<typeof TrainerExperimentDetailSchema>;
export type TrainerExperimentRunSummary = z.infer<typeof TrainerExperimentRunSummarySchema>;
export type TrainerExperimentSource = z.infer<typeof TrainerExperimentSourceSchema>;
export type TrainerExperimentSourceType = z.infer<typeof TrainerExperimentSourceTypeSchema>;
export type TrainerExperimentSummary = z.infer<typeof TrainerExperimentSummarySchema>;
export type TrainerPackagingAttachment = z.infer<typeof TrainerPackagingAttachmentSchema>;
export type TrainerOverIdRisk = z.infer<typeof TrainerOverIdRiskSchema>;
export type TrainerPackagingCandidate = z.infer<typeof TrainerPackagingCandidateSchema>;
export type TrainerPackagingCandidateStatus = z.infer<typeof TrainerPackagingCandidateStatusSchema>;
export type TrainerPolicyFlag = z.infer<typeof TrainerPolicyFlagSchema>;
export type TrainerPolicyFlagName = z.infer<typeof TrainerPolicyFlagNameSchema>;
export type TrainerPolicyFlagSeverity = z.infer<typeof TrainerPolicyFlagSeveritySchema>;
export type TrainerReviewDecision = z.infer<typeof TrainerReviewDecisionSchema>;
export type TrainerReviewDecisionSummary = z.infer<typeof TrainerReviewDecisionSummarySchema>;
export type TrainerQueueHealth = z.infer<typeof TrainerQueueHealthSchema>;
export type TrainerMutationQueueSnapshot = z.infer<typeof TrainerMutationQueueSnapshotSchema>;
export type TrainerMutationReceipt = z.infer<typeof TrainerMutationReceiptSchema>;
export type TrainingRunDetail = z.infer<typeof TrainingRunDetailSchema>;
export type TrainingRunSummary = z.infer<typeof TrainingRunSummarySchema>;
export type TrainerConnector = z.infer<typeof TrainerConnectorSchema>;
export type TrainerSkill = z.infer<typeof TrainerSkillSchema>;
export type TrainerMemorySurface = z.infer<typeof TrainerMemorySurfaceSchema>;
export type TrainerExperimentGraph = z.infer<typeof TrainerExperimentGraphSchema>;
export type TrainingRunBlocker = z.infer<typeof TrainingRunBlockerSchema>;
export type TrainingRunEvent = z.infer<typeof TrainingRunEventSchema>;
export type TrainingJobStatus = z.infer<typeof TrainingJobStatusSchema>;
export type TrainingJobSummary = z.infer<typeof TrainingJobSummarySchema>;
export type TrainingRunStatus = z.infer<typeof TrainingRunStatusSchema>;
export type TrainingStage = z.infer<typeof TrainingStageSchema>;
export type TrainingStepSummary = z.infer<typeof TrainingStepSummarySchema>;
export type TrainerPersonhoodSnapshot = z.infer<typeof TrainerPersonhoodSnapshotSchema>;
export type TrainerStudySourceSummary = z.infer<typeof TrainerStudySourceSummarySchema>;
export type TrainerStudySourceRecommendation = z.infer<typeof TrainerStudySourceRecommendationSchema>;
export type TrainerStudySourceRecommendationFragment = z.infer<
  typeof TrainerStudySourceRecommendationFragmentSchema
>;
export type TrainerWorkerStatus = z.infer<typeof TrainerWorkerStatusSchema>;
export type TrainerWorkerSummary = z.infer<typeof TrainerWorkerSummarySchema>;
