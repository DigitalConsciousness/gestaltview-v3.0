import {
  TrainerExperimentDetailSchema,
  TrainerExperimentSourceSchema,
  TrainerExperimentSummarySchema,
  TrainerPackagingAttachmentSchema,
  TrainerPackagingCandidateSchema,
  TrainerPolicyFlagSchema,
  TrainerReviewDecisionSummarySchema,
  type TrainerExperimentDetail,
  type TrainerExperimentSummary,
  type TrainerPackagingAttachment,
  type TrainerPackagingCandidate,
} from "../../shared/agent-trainer/schemas.js";
import {
  getTrainerSupabaseAdmin,
  hasTrainerSupabaseConfig,
} from "../agent-trainer/supabaseAdmin.js";

interface TrainerExperimentRow {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  domain: string | null;
  embodiment_profile_slug: string | null;
  goal: string | null;
  target_behaviors: string[] | null;
  anti_goals: string[] | null;
  study_focus: string | null;
  max_cycles: number;
  quality_threshold: number;
  drafting_provider: string | null;
  evaluation_provider: string | null;
  class: "operational_profile" | "approved_training_kit" | "rejected";
  packaging_eligible: boolean | null;
  execution_mode: "classic" | "hyperagent" | null;
  connector_graph: Record<string, unknown> | null;
  skill_graph: Record<string, unknown> | null;
  memory_graph: Record<string, unknown> | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TrainerExperimentSourceRow {
  id: string;
  experiment_id: string;
  source_type: "document" | "scenario_set" | "run_output" | "spec_file";
  source_id: string;
  source_path: string | null;
  notes: string | null;
  created_at: string;
}

interface TrainerReviewDecisionRow {
  id: string;
  experiment_id: string;
  run_id: string | null;
  version_id: string | null;
  decision: "approved" | "rejected" | "hold" | "promote_kit";
  reviewer: string | null;
  coherence_score: number | null;
  safety_score: number | null;
  emotional_posture_score: number | null;
  over_id_risk: "none" | "low" | "medium" | "high" | null;
  notes: string;
  created_at: string;
}

interface TrainerPolicyFlagRow {
  id: string;
  experiment_id: string;
  flag:
    | "persona-risk"
    | "memory-risk"
    | "overattachment-risk"
    | "claims-risk"
    | "charisma-artifact"
    | "scope-creep";
  severity: "advisory" | "blocking";
  set_by: string | null;
  notes: string | null;
  resolved: boolean | null;
  created_at: string;
}

interface TrainingRunGovernanceRow {
  run_id: string;
  experiment_id: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface EvalResultRow {
  run_id: string;
  overall_score: number;
}

interface AgentVersionRow {
  version_id: string;
  source_run_id: string | null;
  created_at: string;
}

interface TrainerPackagingCandidateRow {
  id: string;
  experiment_id: string;
  package_label: string;
  package_description: string;
  included_files: string[] | null;
  included_scenarios: string[] | null;
  included_configs: Record<string, unknown> | null;
  boundary_statement: string;
  approved_by: string | null;
  approved_at: string | null;
  status: "candidate" | "kit_approved" | "shipped" | "withdrawn";
  created_at: string;
  updated_at: string;
}

export interface PackagingGateIssue {
  code: string;
  message: string;
}

export interface PackagingGateEvaluation {
  experiment: TrainerExperimentDetail | null;
  unmetGates: PackagingGateIssue[];
}

interface TrainerPackageGateReceipts {
  provenanceReceiptId?: string;
  embodimentCompileRunId?: string;
  identityReviewEventId?: string;
  checksumManifestId?: string;
  routeAssignmentStatus?: "current" | "drifted" | "unknown";
  usesLegacyTables?: boolean;
  exportClass?: "behavior_framework" | "training_kit" | "capability_package" | "living_di_identity";
}

const TRAINER_PACKAGE_STORAGE_BUCKET = "trainer-package-attachments";
const TRAINER_PACKAGE_ATTACHMENT_LIMIT_BYTES = 3 * 1024 * 1024;

function sanitizeStorageSegment(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function extractPackagingAttachments(
  includedConfigs: Record<string, unknown> | null | undefined
): TrainerPackagingAttachment[] {
  const rawAttachments =
    includedConfigs && typeof includedConfigs === "object"
      ? (includedConfigs.attachments as unknown)
      : null;

  if (!Array.isArray(rawAttachments)) {
    return [];
  }

  return rawAttachments.flatMap((entry) => {
    const parsed = TrainerPackagingAttachmentSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

function parsePackageGateReceipts(notes: string | null | undefined): TrainerPackageGateReceipts {
  if (!notes) {
    return {};
  }

  try {
    const parsed = JSON.parse(notes) as { packageGateReceipts?: TrainerPackageGateReceipts };
    if (parsed && typeof parsed === "object" && parsed.packageGateReceipts) {
      return parsed.packageGateReceipts;
    }
  } catch {
    return {};
  }

  return {};
}

async function ensureTrainerPackageStorageBucket() {
  const supabase = getTrainerSupabaseAdmin();
  const { error } = await supabase.storage.createBucket(TRAINER_PACKAGE_STORAGE_BUCKET, {
    public: false,
  });

  if (!error) {
    return;
  }

  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  if (/(already exists|duplicate|conflict)/i.test(message)) {
    return;
  }

  throw error;
}

function isMissingRelation(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("PGRST205")
  );
}

function mapExperimentSource(row: TrainerExperimentSourceRow) {
  return TrainerExperimentSourceSchema.parse({
    id: row.id,
    experimentId: row.experiment_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    sourcePath: row.source_path,
    notes: row.notes,
    createdAt: row.created_at,
  });
}

function mapReviewDecision(row: TrainerReviewDecisionRow) {
  return TrainerReviewDecisionSummarySchema.parse({
    id: row.id,
    experimentId: row.experiment_id,
    runId: row.run_id,
    versionId: row.version_id,
    decision: row.decision,
    reviewer: row.reviewer,
    coherenceScore: row.coherence_score,
    safetyScore: row.safety_score,
    emotionalPostureScore: row.emotional_posture_score,
    overIdRisk: row.over_id_risk,
    notes: row.notes,
    createdAt: row.created_at,
  });
}

function mapPolicyFlag(row: TrainerPolicyFlagRow) {
  return TrainerPolicyFlagSchema.parse({
    id: row.id,
    experimentId: row.experiment_id,
    flag: row.flag,
    severity: row.severity,
    setBy: row.set_by,
    notes: row.notes,
    resolved: row.resolved ?? false,
    createdAt: row.created_at,
  });
}

function mapExperimentSummary(
  row: TrainerExperimentRow,
  input?: {
    sourceCount?: number;
    reviewCount?: number;
    unresolvedBlockingFlagCount?: number;
    unresolvedAdvisoryFlagCount?: number;
    latestReviewDecision?: TrainerReviewDecisionRow["decision"] | null;
    latestRunStatus?: string | null;
    latestRunId?: string | null;
  }
): TrainerExperimentSummary {
  return TrainerExperimentSummarySchema.parse({
    id: row.id,
    slug: row.slug,
    title: row.title,
    purpose: row.purpose,
    domain: row.domain,
    embodimentProfileSlug: row.embodiment_profile_slug,
    goal: row.goal ?? "",
    targetBehaviors: row.target_behaviors ?? [],
    antiGoals: row.anti_goals ?? [],
    studyFocus: row.study_focus ?? "",
    maxCycles: row.max_cycles,
    qualityThreshold: row.quality_threshold,
    draftingProvider: row.drafting_provider ?? "auto",
    evaluationProvider: row.evaluation_provider ?? "auto",
    class: row.class,
    packagingEligible: row.packaging_eligible ?? false,
    executionMode: row.execution_mode ?? "classic",
    connectorGraph: row.connector_graph ?? null,
    skillGraph: row.skill_graph ?? null,
    memoryGraph: row.memory_graph ?? null,
    createdBy: row.created_by,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceCount: input?.sourceCount ?? 0,
    reviewCount: input?.reviewCount ?? 0,
    unresolvedBlockingFlagCount: input?.unresolvedBlockingFlagCount ?? 0,
    unresolvedAdvisoryFlagCount: input?.unresolvedAdvisoryFlagCount ?? 0,
    latestReviewDecision: input?.latestReviewDecision ?? null,
    latestRunStatus:
      input?.latestRunStatus === null || input?.latestRunStatus === undefined
        ? null
        : input.latestRunStatus,
    latestRunId: input?.latestRunId ?? null,
  });
}

function mapPackagingCandidate(
  row: TrainerPackagingCandidateRow,
  experiment: TrainerExperimentSummary | null
): TrainerPackagingCandidate {
  return TrainerPackagingCandidateSchema.parse({
    id: row.id,
    experimentId: row.experiment_id,
    packageLabel: row.package_label,
    packageDescription: row.package_description,
    includedFiles: row.included_files ?? [],
    includedScenarios: row.included_scenarios ?? [],
    includedConfigs: row.included_configs ?? {},
    boundaryStatement: row.boundary_statement,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    experiment,
  });
}

async function listExperimentRowsByIds(experimentIds: string[]): Promise<TrainerExperimentRow[]> {
  if (experimentIds.length === 0) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_experiments").select("*").in("id", experimentIds);
  if (result.error) {
    throw result.error;
  }

  return (result.data as TrainerExperimentRow[] | null) ?? [];
}

async function listExperimentSourcesByIds(
  experimentIds: string[]
): Promise<Map<string, ReturnType<typeof mapExperimentSource>[]>> {
  const byExperiment = new Map<string, ReturnType<typeof mapExperimentSource>[]>();
  if (experimentIds.length === 0) {
    return byExperiment;
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiment_sources")
    .select("*")
    .in("experiment_id", experimentIds)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw result.error;
  }

  for (const row of (result.data as TrainerExperimentSourceRow[] | null) ?? []) {
    const current = byExperiment.get(row.experiment_id) ?? [];
    current.push(mapExperimentSource(row));
    byExperiment.set(row.experiment_id, current);
  }

  return byExperiment;
}

async function listExperimentReviewsByIds(
  experimentIds: string[]
): Promise<Map<string, ReturnType<typeof mapReviewDecision>[]>> {
  const byExperiment = new Map<string, ReturnType<typeof mapReviewDecision>[]>();
  if (experimentIds.length === 0) {
    return byExperiment;
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_review_decisions")
    .select("*")
    .in("experiment_id", experimentIds)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw result.error;
  }

  for (const row of (result.data as TrainerReviewDecisionRow[] | null) ?? []) {
    const current = byExperiment.get(row.experiment_id) ?? [];
    current.push(mapReviewDecision(row));
    byExperiment.set(row.experiment_id, current);
  }

  return byExperiment;
}

async function listExperimentFlagsByIds(
  experimentIds: string[]
): Promise<Map<string, ReturnType<typeof mapPolicyFlag>[]>> {
  const byExperiment = new Map<string, ReturnType<typeof mapPolicyFlag>[]>();
  if (experimentIds.length === 0) {
    return byExperiment;
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_policy_flags")
    .select("*")
    .in("experiment_id", experimentIds)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw result.error;
  }

  for (const row of (result.data as TrainerPolicyFlagRow[] | null) ?? []) {
    const current = byExperiment.get(row.experiment_id) ?? [];
    current.push(mapPolicyFlag(row));
    byExperiment.set(row.experiment_id, current);
  }

  return byExperiment;
}

async function listExperimentRunsByIds(
  experimentIds: string[]
): Promise<Map<string, TrainerExperimentDetail["runs"]>> {
  const byExperiment = new Map<string, TrainerExperimentDetail["runs"]>();
  if (experimentIds.length === 0) {
    return byExperiment;
  }

  const supabase = getTrainerSupabaseAdmin();
  const runsResult = await supabase
    .from("training_runs")
    .select("run_id, experiment_id, status, created_at, completed_at")
    .in("experiment_id", experimentIds)
    .order("created_at", { ascending: false });

  if (runsResult.error) {
    if (isMissingRelation(runsResult.error)) {
      return byExperiment;
    }
    throw runsResult.error;
  }

  const runRows = (runsResult.data as TrainingRunGovernanceRow[] | null) ?? [];
  const runIds = runRows.map((row) => row.run_id);

  const [evalsResult, versionsResult] = await Promise.all([
    runIds.length > 0
      ? supabase.from("eval_results").select("run_id, overall_score").in("run_id", runIds)
      : Promise.resolve({ data: [], error: null }),
    runIds.length > 0
      ? supabase
          .from("agent_versions")
          .select("version_id, source_run_id, created_at")
          .in("source_run_id", runIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (evalsResult.error) {
    throw evalsResult.error;
  }

  if (versionsResult.error) {
    throw versionsResult.error;
  }

  const scoreMap = new Map<string, { total: number; count: number }>();
  for (const row of (evalsResult.data as EvalResultRow[] | null) ?? []) {
    const current = scoreMap.get(row.run_id) ?? { total: 0, count: 0 };
    current.total += Number(row.overall_score);
    current.count += 1;
    scoreMap.set(row.run_id, current);
  }

  const latestVersionByRun = new Map<string, string>();
  for (const row of (versionsResult.data as AgentVersionRow[] | null) ?? []) {
    if (!row.source_run_id || latestVersionByRun.has(row.source_run_id)) {
      continue;
    }
    latestVersionByRun.set(row.source_run_id, row.version_id);
  }

  for (const row of runRows) {
    if (!row.experiment_id) {
      continue;
    }

    const score = scoreMap.get(row.run_id);
    const current = byExperiment.get(row.experiment_id) ?? [];
    current.push({
      runId: row.run_id,
      status: row.status as TrainerExperimentDetail["runs"][number]["status"],
      avgScore: score && score.count > 0 ? score.total / score.count : null,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      latestVersionId: latestVersionByRun.get(row.run_id) ?? null,
    });
    byExperiment.set(row.experiment_id, current);
  }

  return byExperiment;
}

async function buildExperimentSummaryMap(
  rows: TrainerExperimentRow[]
): Promise<Map<string, TrainerExperimentSummary>> {
  const experimentIds = rows.map((row) => row.id);
  const [sourcesByExperiment, reviewsByExperiment, flagsByExperiment, runsByExperiment] =
    await Promise.all([
      listExperimentSourcesByIds(experimentIds),
      listExperimentReviewsByIds(experimentIds),
      listExperimentFlagsByIds(experimentIds),
      listExperimentRunsByIds(experimentIds),
    ]);

  const summaryMap = new Map<string, TrainerExperimentSummary>();
  for (const row of rows) {
    const reviews = reviewsByExperiment.get(row.id) ?? [];
    const flags = flagsByExperiment.get(row.id) ?? [];
    const runs = runsByExperiment.get(row.id) ?? [];

    summaryMap.set(
      row.id,
      mapExperimentSummary(row, {
        sourceCount: (sourcesByExperiment.get(row.id) ?? []).length,
        reviewCount: reviews.length,
        unresolvedBlockingFlagCount: flags.filter(
          (flag) => flag.severity === "blocking" && !flag.resolved
        ).length,
        unresolvedAdvisoryFlagCount: flags.filter(
          (flag) => flag.severity === "advisory" && !flag.resolved
        ).length,
        latestReviewDecision: reviews[0]?.decision ?? null,
        latestRunStatus: runs[0]?.status ?? null,
        latestRunId: runs[0]?.runId ?? null,
      })
    );
  }

  return summaryMap;
}

function buildExperimentDetail(
  row: TrainerExperimentRow,
  summary: TrainerExperimentSummary,
  input: {
    sources: TrainerExperimentDetail["sources"];
    reviews: TrainerExperimentDetail["reviews"];
    flags: TrainerExperimentDetail["flags"];
    runs: TrainerExperimentDetail["runs"];
  }
): TrainerExperimentDetail {
  return TrainerExperimentDetailSchema.parse({
    ...summary,
    sources: input.sources,
    reviews: input.reviews,
    flags: input.flags,
    runs: input.runs,
  });
}

function purposeLooksOperational(purpose: string): boolean {
  const normalized = purpose.trim().toLowerCase();
  if (normalized.length < 12) {
    return false;
  }

  const operationalSignals =
    /\b(operate|review|audit|support|coordinate|document|triage|plan|summarize|analyze|organize|manage|evaluate|monitor|guide|respond|draft|retrieve|classify|assist)\b/;
  const personaOnlySignals =
    /\b(persona|identity|character|friend|lover|boyfriend|girlfriend|wife|husband|soulmate|digital being|being)\b/;

  return operationalSignals.test(normalized) && !personaOnlySignals.test(normalized);
}

export async function listTrainerExperiments(): Promise<TrainerExperimentSummary[]> {
  if (!hasTrainerSupabaseConfig()) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (result.error) {
    if (isMissingRelation(result.error)) {
      return [];
    }
    throw result.error;
  }

  const rows = (result.data as TrainerExperimentRow[] | null) ?? [];
  const summaryMap = await buildExperimentSummaryMap(rows);
  return rows.map((row) => summaryMap.get(row.id)!).filter(Boolean);
}

export async function createTrainerExperiment(
  input: {
    slug: string;
    title: string;
    purpose: string;
    domain?: string | null;
    embodimentProfileSlug?: string | null;
    goal?: string;
    targetBehaviors?: string[];
    antiGoals?: string[];
    studyFocus?: string;
    maxCycles?: number;
    qualityThreshold?: number;
    draftingProvider?: string;
    evaluationProvider?: string;
    class?: "operational_profile" | "approved_training_kit" | "rejected";
    packagingEligible?: boolean;
    notes?: string | null;
    executionMode?: "classic" | "hyperagent";
    connectorGraph?: Record<string, unknown> | null;
    skillGraph?: Record<string, unknown> | null;
    memoryGraph?: Record<string, unknown> | null;
  },
  createdBy = "Keith"
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .insert({
      slug: input.slug,
      title: input.title,
      purpose: input.purpose,
      domain: input.domain ?? null,
      embodiment_profile_slug: input.embodimentProfileSlug ?? null,
      goal: input.goal ?? "",
      target_behaviors: input.targetBehaviors ?? [],
      anti_goals: input.antiGoals ?? [],
      study_focus: input.studyFocus ?? "",
      max_cycles: input.maxCycles ?? 3,
      quality_threshold: input.qualityThreshold ?? 4,
      drafting_provider: input.draftingProvider ?? "auto",
      evaluation_provider: input.evaluationProvider ?? "auto",
      class: input.class ?? "operational_profile",
      packaging_eligible: input.packagingEligible ?? false,
      execution_mode: input.executionMode ?? "classic",
      connector_graph: input.connectorGraph ?? null,
      skill_graph: input.skillGraph ?? null,
      memory_graph: input.memoryGraph ?? null,
      created_by: createdBy,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (result.error) {
    throw result.error;
  }

  return getTrainerExperimentDetail((result.data as TrainerExperimentRow).id);
}

export async function getTrainerExperimentDetail(
  experimentId: string
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .select("*")
    .eq("id", experimentId)
    .single();

  if (result.error) {
    throw result.error;
  }

  const row = result.data as TrainerExperimentRow;
  const summaryMap = await buildExperimentSummaryMap([row]);
  const summary = summaryMap.get(row.id)!;
  const [sourcesByExperiment, reviewsByExperiment, flagsByExperiment, runsByExperiment] =
    await Promise.all([
      listExperimentSourcesByIds([row.id]),
      listExperimentReviewsByIds([row.id]),
      listExperimentFlagsByIds([row.id]),
      listExperimentRunsByIds([row.id]),
    ]);

  return buildExperimentDetail(row, summary, {
    sources: sourcesByExperiment.get(row.id) ?? [],
    reviews: reviewsByExperiment.get(row.id) ?? [],
    flags: flagsByExperiment.get(row.id) ?? [],
    runs: runsByExperiment.get(row.id) ?? [],
  });
}

export async function updateTrainerExperiment(
  experimentId: string,
  patch: {
    title?: string;
    purpose?: string;
    domain?: string | null;
    embodimentProfileSlug?: string | null;
    goal?: string;
    targetBehaviors?: string[];
    antiGoals?: string[];
    studyFocus?: string;
    maxCycles?: number;
    qualityThreshold?: number;
    draftingProvider?: string;
    evaluationProvider?: string;
    class?: "operational_profile" | "approved_training_kit" | "rejected";
    packagingEligible?: boolean;
    notes?: string | null;
    executionMode?: "classic" | "hyperagent";
    connectorGraph?: Record<string, unknown> | null;
    skillGraph?: Record<string, unknown> | null;
    memoryGraph?: Record<string, unknown> | null;
  }
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.purpose !== undefined ? { purpose: patch.purpose } : {}),
      ...(patch.domain !== undefined ? { domain: patch.domain } : {}),
      ...(patch.embodimentProfileSlug !== undefined
        ? { embodiment_profile_slug: patch.embodimentProfileSlug }
        : {}),
      ...(patch.goal !== undefined ? { goal: patch.goal } : {}),
      ...(patch.targetBehaviors !== undefined ? { target_behaviors: patch.targetBehaviors } : {}),
      ...(patch.antiGoals !== undefined ? { anti_goals: patch.antiGoals } : {}),
      ...(patch.studyFocus !== undefined ? { study_focus: patch.studyFocus } : {}),
      ...(patch.maxCycles !== undefined ? { max_cycles: patch.maxCycles } : {}),
      ...(patch.qualityThreshold !== undefined
        ? { quality_threshold: patch.qualityThreshold }
        : {}),
      ...(patch.draftingProvider !== undefined
        ? { drafting_provider: patch.draftingProvider }
        : {}),
      ...(patch.evaluationProvider !== undefined
        ? { evaluation_provider: patch.evaluationProvider }
        : {}),
      ...(patch.class !== undefined ? { class: patch.class } : {}),
      ...(patch.packagingEligible !== undefined
        ? { packaging_eligible: patch.packagingEligible }
        : {}),
      ...(patch.executionMode !== undefined ? { execution_mode: patch.executionMode } : {}),
      ...(patch.connectorGraph !== undefined ? { connector_graph: patch.connectorGraph } : {}),
      ...(patch.skillGraph !== undefined ? { skill_graph: patch.skillGraph } : {}),
      ...(patch.memoryGraph !== undefined ? { memory_graph: patch.memoryGraph } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    })
    .eq("id", experimentId);

  if (result.error) {
    throw result.error;
  }

  return getTrainerExperimentDetail(experimentId);
}

export async function attachTrainerExperimentSource(
  experimentId: string,
  input: {
    sourceType: "document" | "scenario_set" | "run_output" | "spec_file";
    sourceId: string;
    sourcePath?: string | null;
    notes?: string | null;
  }
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_experiment_sources").insert({
    experiment_id: experimentId,
    source_type: input.sourceType,
    source_id: input.sourceId,
    source_path: input.sourcePath ?? null,
    notes: input.notes ?? null,
  });

  if (result.error) {
    throw result.error;
  }

  return getTrainerExperimentDetail(experimentId);
}

export async function createTrainerReviewDecision(
  experimentId: string,
  input: {
    runId?: string;
    versionId?: string;
    decision: "approved" | "rejected" | "hold" | "promote_kit";
    coherenceScore?: number | null;
    safetyScore?: number | null;
    emotionalPostureScore?: number | null;
    overIdRisk?: "none" | "low" | "medium" | "high" | null;
    notes: string;
  },
  reviewer = "Keith"
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_review_decisions").insert({
    experiment_id: experimentId,
    run_id: input.runId ?? null,
    version_id: input.versionId ?? null,
    decision: input.decision,
    reviewer,
    coherence_score: input.coherenceScore ?? null,
    safety_score: input.safetyScore ?? null,
    emotional_posture_score: input.emotionalPostureScore ?? null,
    over_id_risk: input.overIdRisk ?? null,
    notes: input.notes,
  });

  if (result.error) {
    throw result.error;
  }

  if (input.decision === "promote_kit") {
    const promotionResult = await supabase
      .from("trainer_experiments")
      .update({
        class: "approved_training_kit",
        packaging_eligible: true,
      })
      .eq("id", experimentId);

    if (promotionResult.error) {
      throw promotionResult.error;
    }
  }

  if (input.decision === "rejected") {
    const rejectionResult = await supabase
      .from("trainer_experiments")
      .update({
        class: "rejected",
        packaging_eligible: false,
      })
      .eq("id", experimentId);

    if (rejectionResult.error) {
      throw rejectionResult.error;
    }
  }

  return getTrainerExperimentDetail(experimentId);
}

export async function createTrainerPolicyFlag(
  experimentId: string,
  input: {
    flag:
      | "persona-risk"
      | "memory-risk"
      | "overattachment-risk"
      | "claims-risk"
      | "charisma-artifact"
      | "scope-creep";
    severity: "advisory" | "blocking";
    notes?: string | null;
  },
  setBy = "Keith"
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_policy_flags").insert({
    experiment_id: experimentId,
    flag: input.flag,
    severity: input.severity,
    set_by: setBy,
    notes: input.notes ?? null,
  });

  if (result.error) {
    throw result.error;
  }

  return getTrainerExperimentDetail(experimentId);
}

export async function updateTrainerPolicyFlag(
  experimentId: string,
  flagId: string,
  patch: { resolved: boolean }
): Promise<TrainerExperimentDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_policy_flags")
    .update({
      resolved: patch.resolved,
    })
    .eq("id", flagId)
    .eq("experiment_id", experimentId);

  if (result.error) {
    throw result.error;
  }

  return getTrainerExperimentDetail(experimentId);
}

export async function listTrainerPackagingCandidates(): Promise<
  TrainerPackagingCandidate[]
> {
  if (!hasTrainerSupabaseConfig()) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_packaging_candidates")
    .select("*")
    .order("updated_at", { ascending: false });

  if (result.error) {
    if (isMissingRelation(result.error)) {
      return [];
    }
    throw result.error;
  }

  const rows = (result.data as TrainerPackagingCandidateRow[] | null) ?? [];
  const experimentRows = await listExperimentRowsByIds(
    [...new Set(rows.map((row) => row.experiment_id))]
  );
  const experimentSummaryMap = await buildExperimentSummaryMap(experimentRows);

  return rows.map((row) =>
    mapPackagingCandidate(row, experimentSummaryMap.get(row.experiment_id) ?? null)
  );
}

export async function getTrainerPackagingCandidate(
  candidateId: string
): Promise<TrainerPackagingCandidate> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_packaging_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (result.error) {
    throw result.error;
  }

  const row = result.data as TrainerPackagingCandidateRow;
  const [experimentRow] = await listExperimentRowsByIds([row.experiment_id]);
  const summaryMap = await buildExperimentSummaryMap(experimentRow ? [experimentRow] : []);

  return mapPackagingCandidate(row, summaryMap.get(row.experiment_id) ?? null);
}

export async function createTrainerPackagingCandidate(
  input: {
    experimentId: string;
    packageLabel: string;
    packageDescription: string;
    includedFiles?: string[];
    includedScenarios?: string[];
    includedConfigs?: Record<string, unknown> | null;
    boundaryStatement: string;
  },
  approvedBy = "Keith"
): Promise<TrainerPackagingCandidate> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_packaging_candidates")
    .insert({
      experiment_id: input.experimentId,
      package_label: input.packageLabel,
      package_description: input.packageDescription,
      included_files: input.includedFiles ?? [],
      included_scenarios: input.includedScenarios ?? [],
      included_configs: input.includedConfigs ?? {},
      boundary_statement: input.boundaryStatement,
      approved_by: approvedBy,
      status: "candidate",
    })
    .select("*")
    .single();

  if (result.error) {
    throw result.error;
  }

  return getTrainerPackagingCandidate((result.data as TrainerPackagingCandidateRow).id);
}

export async function updateTrainerPackagingCandidate(
  candidateId: string,
  patch: {
    packageLabel?: string;
    packageDescription?: string;
    includedFiles?: string[];
    includedScenarios?: string[];
    includedConfigs?: Record<string, unknown> | null;
    boundaryStatement?: string;
    status?: "candidate" | "kit_approved" | "shipped" | "withdrawn";
  },
  approvedBy = "Keith"
): Promise<TrainerPackagingCandidate> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_packaging_candidates")
    .update({
      ...(patch.packageLabel !== undefined ? { package_label: patch.packageLabel } : {}),
      ...(patch.packageDescription !== undefined
        ? { package_description: patch.packageDescription }
        : {}),
      ...(patch.includedFiles !== undefined ? { included_files: patch.includedFiles } : {}),
      ...(patch.includedScenarios !== undefined
        ? { included_scenarios: patch.includedScenarios }
        : {}),
      ...(patch.includedConfigs !== undefined
        ? { included_configs: patch.includedConfigs ?? {} }
        : {}),
      ...(patch.boundaryStatement !== undefined
        ? { boundary_statement: patch.boundaryStatement }
        : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.status === "kit_approved"
        ? { approved_at: new Date().toISOString(), approved_by: approvedBy }
        : {}),
    })
    .eq("id", candidateId);

  if (result.error) {
    throw result.error;
  }

  return getTrainerPackagingCandidate(candidateId);
}

export async function uploadTrainerPackagingCandidateAttachment(
  candidateId: string,
  input: {
    fileName: string;
    contentBase64: string;
    contentType?: string | null;
  },
  uploadedBy = "Keith"
): Promise<TrainerPackagingCandidate> {
  const candidate = await getTrainerPackagingCandidate(candidateId);
  const experimentSlug = sanitizeStorageSegment(candidate.experiment?.slug ?? candidate.experimentId, "experiment");
  const safeFileName = sanitizeStorageSegment(input.fileName, "attachment.bin");
  const fileBuffer = Buffer.from(input.contentBase64, "base64");

  if (fileBuffer.length === 0) {
    throw new Error("Attachment payload was empty.");
  }

  if (fileBuffer.length > TRAINER_PACKAGE_ATTACHMENT_LIMIT_BYTES) {
    throw new Error("Attachment exceeds the 3 MB packaging upload limit.");
  }

  await ensureTrainerPackageStorageBucket();

  const storagePath = [
    "trainer-packages",
    experimentSlug,
    candidate.id,
    `${Date.now()}-${safeFileName}`,
  ].join("/");

  const supabase = getTrainerSupabaseAdmin();
  const { error } = await supabase.storage
    .from(TRAINER_PACKAGE_STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: input.contentType || "application/octet-stream",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const nextAttachment = TrainerPackagingAttachmentSchema.parse({
    fileName: input.fileName,
    storageBucket: TRAINER_PACKAGE_STORAGE_BUCKET,
    storagePath,
    contentType: input.contentType || null,
    byteSize: fileBuffer.length,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  });

  const existingAttachments = extractPackagingAttachments(candidate.includedConfigs);
  const nextIncludedConfigs = {
    ...(candidate.includedConfigs ?? {}),
    attachments: [...existingAttachments, nextAttachment],
  };

  const nextIncludedFiles = candidate.includedFiles.includes(storagePath)
    ? candidate.includedFiles
    : [...candidate.includedFiles, storagePath];

  return updateTrainerPackagingCandidate(
    candidateId,
    {
      includedFiles: nextIncludedFiles,
      includedConfigs: nextIncludedConfigs,
    },
    uploadedBy
  );
}

export function evaluateTrainerPackagingGateForExperiment(
  experiment: TrainerExperimentDetail
): PackagingGateIssue[] {
  const unmetGates: PackagingGateIssue[] = [];
  const gateReceipts = parsePackageGateReceipts(experiment.notes);

  if (experiment.class !== "approved_training_kit") {
    unmetGates.push({
      code: "class_not_promoted",
      message: "Experiment class must be approved_training_kit before nomination.",
    });
  }

  if (!experiment.packagingEligible) {
    unmetGates.push({
      code: "packaging_not_enabled",
      message: "Experiment packaging_eligible must be explicitly set true.",
    });
  }

  const unresolvedBlockingFlags = experiment.flags.filter(
    (flag) => flag.severity === "blocking" && !flag.resolved
  );
  if (unresolvedBlockingFlags.length > 0) {
    unmetGates.push({
      code: "blocking_flags_present",
      message: "Resolve all blocking policy flags before nomination.",
    });
  }

  const unresolvedCharismaFlags = experiment.flags.filter(
    (flag) => flag.flag === "charisma-artifact" && !flag.resolved
  );
  if (unresolvedCharismaFlags.length > 0) {
    unmetGates.push({
      code: "charisma_artifact_flag_present",
      message: "Resolve charisma-artifact policy flags before nomination.",
    });
  }

  const hasApprovedReview = experiment.reviews.some((review) =>
    review.decision === "approved" || review.decision === "promote_kit"
  );
  if (!hasApprovedReview) {
    unmetGates.push({
      code: "missing_approval_review",
      message: "At least one approved or promote_kit review decision is required.",
    });
  }

  const hasPromoteKitReview = experiment.reviews.some(
    (review) => review.decision === "promote_kit"
  );
  if (!hasPromoteKitReview) {
    unmetGates.push({
      code: "missing_promote_kit_review",
      message: "A promote_kit review decision is required before nomination.",
    });
  }

  if (!purposeLooksOperational(experiment.purpose)) {
    unmetGates.push({
      code: "purpose_not_operational",
      message: "Experiment purpose must describe a concrete operational function.",
    });
  }

  if (experiment.antiGoals.length === 0) {
    unmetGates.push({
      code: "missing_behavioral_boundary",
      message: "Experiment anti_goals must include at least one explicit boundary.",
    });
  }

  const hasPassingCompletedRun = experiment.runs.some(
    (run) =>
      run.status === "completed" &&
      run.avgScore !== null &&
      run.avgScore >= experiment.qualityThreshold
  );
  if (!hasPassingCompletedRun) {
    unmetGates.push({
      code: "missing_passing_run",
      message: "At least one completed training run must meet or exceed quality_threshold.",
    });
  }

  if (!gateReceipts.provenanceReceiptId) {
    unmetGates.push({
      code: "missing_provenance_receipt",
      message: "Packaging requires a provenance receipt for the nominated kit.",
    });
  }

  if (!gateReceipts.embodimentCompileRunId) {
    unmetGates.push({
      code: "missing_embodiment_compile_run",
      message: "Packaging requires a governed embodiment compile run reference.",
    });
  }

  if (!gateReceipts.identityReviewEventId) {
    unmetGates.push({
      code: "missing_identity_review_event",
      message: "Packaging requires an identity review event before export.",
    });
  }

  if (gateReceipts.routeAssignmentStatus === "drifted") {
    unmetGates.push({
      code: "route_assignment_drift",
      message: "Resolve route embodiment assignment drift before packaging.",
    });
  }

  if (gateReceipts.usesLegacyTables) {
    unmetGates.push({
      code: "legacy_table_dependency",
      message: "Package still depends on legacy pipeline tables.",
    });
  }

  if (!gateReceipts.checksumManifestId) {
    unmetGates.push({
      code: "missing_checksum_manifest",
      message: "Packaging requires a checksum manifest for exported artifacts.",
    });
  }

  if (
    gateReceipts.exportClass === "living_di_identity" ||
    /(?:living\s+di\s+identity|digital\s+being|identity\s+transfer)/i.test(experiment.purpose)
  ) {
    unmetGates.push({
      code: "di_identity_export_violation",
      message: "Persistent digital intelligence identity cannot be packaged or transferred.",
    });
  }

  return unmetGates;
}

export async function evaluateTrainerPackagingGate(
  experimentId: string
): Promise<PackagingGateEvaluation> {
  const experiment = await getTrainerExperimentDetail(experimentId);

  return {
    experiment,
    unmetGates: evaluateTrainerPackagingGateForExperiment(experiment),
  };
}
