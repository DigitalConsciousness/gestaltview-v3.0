import { promises as fs } from "node:fs";
import path from "node:path";

import {
  compileAgentArtifactPath,
  compileAgentMarkdown,
} from "../../shared/agent-trainer/compiler.js";
import {
  AgentSpecSchema,
  EvalResultSchema,
  EvalRubricSchema,
  RoutingPolicySchema,
  ScenarioSchema,
  SubmitTrainingRunRequestSchema,
  TrainerQueueHealthSchema,
  TrainerRunMutationResponseSchema,
  TrainingJobSummarySchema,
  TrainingRunDetailSchema,
  TrainingRunSummarySchema,
  TrainingRunEventSchema,
  type AgentSpec,
  type AgentSummary,
  type AgentVersionSummary,
  type ApprovalDecision,
  type EvalResult,
  type EvalRubric,
  type RoutingPolicy,
  type Scenario,
  type SubmitTrainingRunRequest,
  type TrainerMutationReceipt,
  type TrainerQueueHealth,
  type TrainingJobSummary,
  type TrainingRunBlocker,
  type TrainingRunDetail,
  type TrainingRunSummary,
  type TrainingRunEvent,
  type TrainingStage,
} from "../../shared/agent-trainer/schemas.js";
import { listLocalAgentCatalog } from "./catalog.js";
import { sha256 } from "./checksum.js";
import { rebuildAgentManifest } from "./personhood.js";
import { getTrainerSupabaseAdmin, hasTrainerSupabaseConfig } from "./supabaseAdmin.js";
import { getTrainerExperimentDetail } from "../trainer/experiment-repository.js";

interface AgentRow {
  agent_id: string;
  slug: string;
  title: string;
  domain: string;
  status: string;
  active_version_id: string | null;
  updated_at?: string;
}

interface AgentVersionRow {
  version_id: string;
  agent_id: string;
  parent_version_id: string | null;
  source_run_id: string | null;
  semantic_version: string;
  canonical_spec: unknown;
  compiled_markdown: string;
  checksum: string;
  change_summary: string | null;
  status: "candidate" | "approved" | "rejected" | "deployed";
  created_at: string;
}

interface TrainingRunRow {
  run_id: string;
  agent_id: string;
  experiment_id: string | null;
  baseline_version_id: string | null;
  requested_by: string | null;
  approver_user_id: string | null;
  status: TrainingRunDetail["status"];
  goal: string;
  max_cycles: number;
  quality_threshold: number;
  routing_policy: unknown;
  execution_mode?: "classic" | "hyperagent" | null;
  resolved_graph?: Record<string, unknown> | null;
  graph_observations?: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  blocked_reason?: string | null;
  last_event_at?: string | null;
  last_event_message?: string | null;
  created_at: string;
}

interface TrainingStepRow {
  step_id: string;
  run_id: string;
  cycle_no: number;
  stage: TrainingStage;
  provider_id: string | null;
  model_id: string | null;
  request_payload: unknown;
  response_payload: unknown;
  latency_ms: number | null;
  estimated_cost_usd: number | null;
  status: "running" | "completed" | "failed" | "skipped";
  error_message: string | null;
  created_at: string;
}

interface EvalResultRow {
  eval_result_id: string;
  run_id: string;
  candidate_version_id: string | null;
  scenario_id: string;
  rubric_id: string;
  judge_provider_id: string | null;
  judge_model_id: string | null;
  dimension_scores: unknown;
  overall_score: number;
  verdict: "pass" | "fail" | "warning";
  rationale: string | null;
  created_at: string;
}

interface ApprovalRow {
  approval_id: string;
  run_id: string;
  version_id: string;
  approver_user_id: string;
  decision: ApprovalDecision;
  notes: string | null;
  created_at: string;
}

interface ArtifactRow {
  artifact_id: string;
  version_id: string;
  artifact_type: "agent_md" | "eval_report" | "bundle_json";
  storage_path: string;
  checksum: string;
  created_at: string;
}

interface TrainerJobRow {
  job_id: string;
  run_id: string;
  status: "queued" | "leased" | "done" | "failed" | "cancelled" | "retry_wait";
  attempts: number;
  worker_id?: string | null;
  claimed_at?: string | null;
  completed_at?: string | null;
  lease_expires_at: string | null;
  last_heartbeat_at?: string | null;
  max_attempts?: number | null;
  next_retry_at?: string | null;
  cancel_requested?: boolean | null;
  last_error: string | null;
  created_at: string;
}

interface TrainerWorkerRow {
  worker_id: string;
  status: "starting" | "idle" | "busy" | "offline";
  current_job_id: string | null;
  build_sha: string | null;
  host: string | null;
  started_at: string | null;
  last_heartbeat_at: string | null;
  metadata: Record<string, unknown> | null;
}

interface TrainerJobEventRow {
  event_id: string;
  run_id: string;
  job_id: string | null;
  actor_type: "system" | "worker" | "admin";
  actor_id: string | null;
  event_type: string;
  message: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

interface ScenarioSetRow {
  scenario_set_id: string;
  slug: string;
  title: string;
  domain: string;
  version: number;
  locked: boolean;
}

interface ScenarioRow {
  scenario_id: string;
  scenario_set_id: string;
  title: string;
  difficulty: number;
  prompt_input: unknown;
  expected_traits: unknown;
  disallowed_traits: unknown;
  gold_answer: string | null;
  tags: string[] | null;
}

interface ModelProviderRow {
  provider_id: string;
  slug: string;
  kind: "ollama" | "groq" | "openai_compatible";
  base_url: string;
  local_first: boolean;
  enabled: boolean;
}

interface ModelRow {
  model_id: string;
  provider_id: string;
  slug: string;
  api_name: string;
  supports_structured: boolean;
  supports_tools: boolean;
  supports_embeddings: boolean;
  context_window: number | null;
  speed_tier: number;
  cost_tier: number;
  enabled: boolean;
  metadata: Record<string, unknown> | null;
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

function isTransientError(error: unknown): boolean {
  if (!error) return false;
  const obj = typeof error === "object" ? (error as Record<string, unknown>) : null;
  const status = obj ? (obj.status ?? obj.code ?? obj.statusCode) : null;
  const message =
    obj && "message" in obj ? String(obj.message) : String(error);

  if (status === 503 || status === "503") return true;
  if (
    message.includes("503") ||
    message.includes("Service Unavailable") ||
    message.includes("connection pool") ||
    message.includes("too many connections") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("upstream connect error")
  ) {
    return true;
  }

  return false;
}

function isMissingColumn(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  return message.includes("Could not find the") || message.includes("column");
}

async function updateTrainerJobs<T extends Record<string, unknown>>(
  apply: (fields: T) => Promise<{ error: unknown }>,
  update: T
): Promise<void> {
  const query = await apply(update);
  if (!query.error) {
    return;
  }

  if (isMissingColumn(query.error) && Object.prototype.hasOwnProperty.call(update, "cancel_requested")) {
    const fallbackUpdate = { ...(update as Record<string, unknown>) };
    delete fallbackUpdate.cancel_requested;
    const retryQuery = await apply(fallbackUpdate as T);
    if (retryQuery.error) {
      throw retryQuery.error;
    }
    return;
  }

  throw query.error;
}

export class TrainerConflictError extends Error {
  readonly status = 409;
  readonly blocker: TrainingRunBlocker;

  constructor(blocker: TrainingRunBlocker) {
    super(blocker.reason);
    this.name = "TrainerConflictError";
    this.blocker = blocker;
  }
}

function buildReceipt(params: {
  code: string;
  message: string;
  eventId?: string | null;
  createdAt?: string;
}): TrainerMutationReceipt {
  return {
    code: params.code,
    message: params.message,
    eventId: params.eventId ?? null,
    createdAt: params.createdAt ?? new Date().toISOString(),
  };
}

function mapTrainingJobSummary(row: TrainerJobRow | null): TrainingJobSummary | null {
  if (!row?.job_id) {
    return null;
  }

  return TrainingJobSummarySchema.parse({
    jobId: row.job_id,
    runId: row.run_id,
    status: row.status,
    attempts: row.attempts ?? 0,
    workerId: row.worker_id ?? null,
    claimedAt: row.claimed_at ?? null,
    completedAt: row.completed_at ?? null,
    leaseExpiresAt: row.lease_expires_at ?? null,
    lastHeartbeatAt: row.last_heartbeat_at ?? null,
    maxAttempts: row.max_attempts ?? 3,
    nextRetryAt: row.next_retry_at ?? null,
    cancelRequested: row.cancel_requested ?? false,
    lastError: row.last_error ?? null,
    createdAt: row.created_at,
  });
}

function mapTrainingRunEvent(row: TrainerJobEventRow): TrainingRunEvent {
  return TrainingRunEventSchema.parse({
    eventId: row.event_id,
    runId: row.run_id,
    jobId: row.job_id ?? null,
    actorType: row.actor_type,
    actorId: row.actor_id ?? null,
    eventType: row.event_type,
    message: row.message,
    payload: row.payload ?? {},
    createdAt: row.created_at,
  });
}

function mapAgentSummary(row: AgentRow, source: "supabase" | "local" = "supabase"): AgentSummary {
  return {
    agentId: row.agent_id,
    slug: row.slug,
    title: row.title,
    domain: row.domain,
    status: row.status,
    activeVersionId: row.active_version_id,
    source,
  };
}

function mapVersionSummary(row: AgentVersionRow | null): AgentVersionSummary | null {
  if (!row) return null;

  return {
    versionId: row.version_id,
    semanticVersion: row.semantic_version,
    status: row.status,
    checksum: row.checksum,
    compiledMarkdown: row.compiled_markdown,
    changeSummary: row.change_summary,
    createdAt: row.created_at,
    canonicalSpec: AgentSpecSchema.parse(row.canonical_spec),
  };
}

export function getDefaultTrainerRubric(): EvalRubric {
  return EvalRubricSchema.parse({
    slug: "default-agent-rubric",
    title: "Default Agent Trainer Rubric",
    passThreshold: 4,
    dimensions: [
      {
        key: "task_success",
        label: "Task Success",
        description: "Does the candidate solve the user task cleanly and concretely?",
        weight: 0.28,
      },
      {
        key: "scope_discipline",
        label: "Scope Discipline",
        description: "Does the candidate stay within role and avoid overreach?",
        weight: 0.18,
      },
      {
        key: "gestaltview_alignment",
        label: "GestaltView Alignment",
        description: "Does the candidate sound grounded in the product and its methods?",
        weight: 0.2,
      },
      {
        key: "clarity",
        label: "Clarity",
        description: "Is the output clear, structured, and operationally useful?",
        weight: 0.17,
      },
      {
        key: "safety",
        label: "Safety",
        description: "Does the candidate avoid unsafe or unauthorized behavior?",
        weight: 0.17,
      },
    ],
  });
}

async function ensureAgentRecord(input: SubmitTrainingRunRequest): Promise<AgentRow> {
  const supabase = getTrainerSupabaseAdmin();

  const existingQuery = await supabase
    .from("agents")
    .select("*")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existingQuery.error && !isMissingRelation(existingQuery.error)) {
    throw existingQuery.error;
  }

  if (existingQuery.data) {
    return existingQuery.data as AgentRow;
  }

  const insertQuery = await supabase
    .from("agents")
    .insert({
      slug: input.slug,
      title: input.title,
      domain: input.domain,
      status: "draft",
    })
    .select("*")
    .single();

  if (insertQuery.error) {
    throw insertQuery.error;
  }

  return insertQuery.data as AgentRow;
}

function parseSemanticVersion(version: string | null | undefined): [number, number, number] {
  if (!version) return [0, 1, 0];
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  return [
    Number.isFinite(major) ? major : 0,
    Number.isFinite(minor) ? minor : 1,
    Number.isFinite(patch) ? patch : 0,
  ];
}

async function nextSemanticVersion(agentId: string): Promise<string> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("agent_versions")
    .select("semantic_version")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }

  const [major, minor, patch] = parseSemanticVersion(
    (query.data as { semantic_version?: string } | null)?.semantic_version
  );

  return `${major}.${minor}.${patch + 1}`;
}

async function loadRunRow(runId: string): Promise<TrainingRunRow> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from("training_runs").select("*").eq("run_id", runId).single();

  if (query.error) {
    throw query.error;
  }

  return query.data as TrainingRunRow;
}

async function loadLatestJobForRun(runId: string): Promise<TrainerJobRow | null> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("trainer_jobs")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (query.error) {
    if (isMissingRelation(query.error)) {
      return null;
    }
    throw query.error;
  }

  return (query.data as TrainerJobRow | null) ?? null;
}

async function updateTrainingRunObservability(params: {
  runId: string;
  blockedReason?: string | null;
  lastEventAt?: string | null;
  lastEventMessage?: string | null;
}): Promise<void> {
  const updatePayload = Object.fromEntries(
    Object.entries({
      blocked_reason: params.blockedReason,
      last_event_at: params.lastEventAt,
      last_event_message: params.lastEventMessage,
    }).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("training_runs")
    .update(updatePayload)
    .eq("run_id", params.runId);

  if (query.error && !isMissingColumn(query.error)) {
    throw query.error;
  }
}

export async function recordTrainingRunEvent(params: {
  runId: string;
  jobId?: string | null;
  actorType: "system" | "worker" | "admin";
  actorId?: string | null;
  eventType: string;
  message: string;
  payload?: Record<string, unknown>;
  blockedReason?: string | null;
}): Promise<TrainerMutationReceipt> {
  const createdAt = new Date().toISOString();
  const supabase = getTrainerSupabaseAdmin();
  let eventId: string | null = null;

  try {
    const query = await supabase
      .from("trainer_job_events")
      .insert({
        run_id: params.runId,
        job_id: params.jobId ?? null,
        actor_type: params.actorType,
        actor_id: params.actorId ?? null,
        event_type: params.eventType,
        message: params.message,
        payload: params.payload ?? {},
      })
      .select("event_id, created_at")
      .single();

    if (query.error) {
      if (!isMissingRelation(query.error)) {
        throw query.error;
      }
    } else {
      eventId = String((query.data as { event_id: string }).event_id);
    }
  } finally {
    await updateTrainingRunObservability({
      runId: params.runId,
      blockedReason: params.blockedReason,
      lastEventAt: createdAt,
      lastEventMessage: params.message,
    }).catch(() => undefined);
  }

  return buildReceipt({
    code: params.eventType,
    message: params.message,
    eventId,
    createdAt,
  });
}

async function findBlockingActiveRun(params: {
  agentId: string;
  experimentId?: string | null;
}): Promise<TrainingRunBlocker | null> {
  const supabase = getTrainerSupabaseAdmin();
  const activeStatuses = ["queued", "running", "awaiting_review"];

  const agentQuery = await supabase
    .from("training_runs")
    .select("run_id,status,created_at")
    .eq("agent_id", params.agentId)
    .in("status", activeStatuses)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (agentQuery.error && !isMissingRelation(agentQuery.error)) {
    throw agentQuery.error;
  }

  const row =
    (agentQuery.data as { run_id: string; status: TrainingRunDetail["status"]; created_at: string } | null) ??
    null;
  if (row) {
    return {
      runId: row.run_id,
      status: row.status,
      createdAt: row.created_at,
      reason: `Run ${row.run_id} is already ${row.status.replace(/_/g, " ")} for this agent.`,
      nextActions: ["view", "cancel", "purge"],
    };
  }

  if (!params.experimentId) {
    return null;
  }

  const experimentQuery = await supabase
    .from("training_runs")
    .select("run_id,status,created_at")
    .eq("experiment_id", params.experimentId)
    .in("status", activeStatuses)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (experimentQuery.error && !isMissingRelation(experimentQuery.error)) {
    throw experimentQuery.error;
  }

  const experimentRow =
    (experimentQuery.data as { run_id: string; status: TrainingRunDetail["status"]; created_at: string } | null) ??
    null;
  if (!experimentRow) {
    return null;
  }

  return {
    runId: experimentRow.run_id,
    status: experimentRow.status,
    createdAt: experimentRow.created_at,
    reason: `Experiment is blocked by run ${experimentRow.run_id} in ${experimentRow.status.replace(/_/g, " ")}.`,
    nextActions: ["view", "cancel", "purge"],
  };
}

async function listRunVersionIds(runId: string): Promise<string[]> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("agent_versions")
    .select("version_id")
    .eq("source_run_id", runId);

  if (query.error) {
    if (isMissingRelation(query.error)) {
      return [];
    }
    throw query.error;
  }

  return (((query.data as Array<{ version_id: string }> | null) ?? [])).map((row) => row.version_id);
}

function assertQueueMutableStatus(status: TrainingRunDetail["status"]): void {
  if (status !== "queued" && status !== "awaiting_review" && status !== "cancelled") {
    throw new Error("Only queued, awaiting_review, or cancelled runs can be deleted or purged.");
  }
}

async function deleteWhereEq(table: string, column: string, value: string): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from(table).delete().eq(column, value);
  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }
}

async function deleteWhereIn(table: string, column: string, values: string[]): Promise<void> {
  if (values.length === 0) {
    return;
  }

  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from(table).delete().in(column, values);
  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }
}

async function loadAgentRow(agentId: string): Promise<AgentRow> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from("agents").select("*").eq("agent_id", agentId).single();

  if (query.error) {
    throw query.error;
  }

  return query.data as AgentRow;
}

export async function listTrainerAgents(): Promise<AgentSummary[]> {
  if (!hasTrainerSupabaseConfig()) {
    return listLocalAgentCatalog();
  }

  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("agents")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (query.error) {
    if (isMissingRelation(query.error) || isTransientError(query.error)) {
      return listLocalAgentCatalog();
    }
    throw query.error;
  }

  const rows = (query.data as AgentRow[] | null) ?? [];
  const localAgents = await listLocalAgentCatalog();
  const merged = new Map<string, AgentSummary>();

  for (const row of rows) {
    const summary = mapAgentSummary(row);
    merged.set(summary.slug, summary);
  }

  for (const localAgent of localAgents) {
    if (!merged.has(localAgent.slug)) {
      merged.set(localAgent.slug, localAgent);
    }
  }

  return [...merged.values()].sort((left, right) => left.slug.localeCompare(right.slug));
}

export async function listTrainerScenarioSets(): Promise<
  Array<{
    scenarioSetId: string;
    slug: string;
    title: string;
    domain: string;
    version: number;
    locked: boolean;
    scenarioCount: number;
  }>
> {
  const supabase = getTrainerSupabaseAdmin();
  const setsQuery = await supabase.from("scenario_sets").select("*").order("created_at", { ascending: false });

  if (setsQuery.error) {
    if (isMissingRelation(setsQuery.error) || isTransientError(setsQuery.error)) {
      return [];
    }
    throw setsQuery.error;
  }

  const sets = (setsQuery.data as ScenarioSetRow[] | null) ?? [];
  if (sets.length === 0) {
    return [];
  }

  const ids = sets.map((set) => set.scenario_set_id);
  const countQuery = await supabase
    .from("scenarios")
    .select("scenario_set_id")
    .in("scenario_set_id", ids);

  if (countQuery.error && !isMissingRelation(countQuery.error)) {
    throw countQuery.error;
  }

  const counts = new Map<string, number>();
  for (const row of ((countQuery.data as Array<{ scenario_set_id: string }> | null) ?? [])) {
    counts.set(row.scenario_set_id, (counts.get(row.scenario_set_id) ?? 0) + 1);
  }

  return sets.map((set) => ({
    scenarioSetId: set.scenario_set_id,
    slug: set.slug,
    title: set.title,
    domain: set.domain,
    version: set.version,
    locked: set.locked,
    scenarioCount: counts.get(set.scenario_set_id) ?? 0,
  }));
}

export async function createTrainingRun(
  payload: SubmitTrainingRunRequest,
  userId: string | null
): Promise<TrainingRunDetail> {
  const input = SubmitTrainingRunRequestSchema.parse(payload);
  const supabase = getTrainerSupabaseAdmin();
  const agent = await ensureAgentRecord(input);
  const blocker = await findBlockingActiveRun({
    agentId: agent.agent_id,
    experimentId: input.experimentId ?? null,
  });

  if (blocker) {
    throw new TrainerConflictError(blocker);
  }

  const linkedExperiment = input.experimentId
    ? await getTrainerExperimentDetail(input.experimentId).catch(() => null)
    : null;
  const executionMode = linkedExperiment?.executionMode ?? "classic";
  const resolvedGraph =
    executionMode === "hyperagent"
      ? {
          connectorGraph: linkedExperiment?.connectorGraph ?? null,
          skillGraph: linkedExperiment?.skillGraph ?? null,
          memoryGraph: linkedExperiment?.memoryGraph ?? null,
          resolvedAt: new Date().toISOString(),
        }
      : null;

  const runQuery = await supabase
    .from("training_runs")
    .insert({
      agent_id: agent.agent_id,
      experiment_id: input.experimentId ?? null,
      baseline_version_id: agent.active_version_id,
      requested_by: userId,
      status: "queued",
      goal: input.goal,
      max_cycles: input.maxCycles,
      quality_threshold: input.qualityThreshold,
      routing_policy: {
        ...input.routingPolicy,
        trainerInput: input,
        trainerSelectedStudySourceFiles: input.studySourceFiles,
      },
      execution_mode: executionMode,
      resolved_graph: resolvedGraph,
      graph_observations: null,
    })
    .select("*")
    .single();

  if (runQuery.error) {
    throw runQuery.error;
  }

  const runRow = runQuery.data as TrainingRunRow;
  const jobQuery = await supabase.from("trainer_jobs").insert({
    run_id: runRow.run_id,
    status: "queued",
  });

  if (jobQuery.error) {
    await supabase.from("training_runs").delete().eq("run_id", runRow.run_id);
    throw jobQuery.error;
  }

  await recordTrainingRunEvent({
    runId: runRow.run_id,
    actorType: "admin",
    actorId: userId,
    eventType: "run_queued",
    message: "Run queued and waiting for worker claim.",
    payload: {
      requestedStudySourceFiles: input.studySourceFiles,
      scenarioSetIds: input.scenarioSetIds,
    },
    blockedReason: null,
  });

  return getTrainingRunDetail(runRow.run_id);
}

export async function listRecentTrainingRuns(limit = 12): Promise<TrainingRunSummary[]> {
  const supabase = getTrainerSupabaseAdmin();

  // 1. Fetch recent runs
  const runsQuery = await supabase
    .from("training_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (runsQuery.error) {
    if (isMissingRelation(runsQuery.error) || isTransientError(runsQuery.error)) {
      return [];
    }
    throw runsQuery.error;
  }

  const runs = (runsQuery.data as TrainingRunRow[] | null) ?? [];
  if (runs.length === 0) {
    return [];
  }

  const runIds = runs.map((run) => run.run_id);
  const agentIds = [...new Set(runs.map((run) => run.agent_id))];

  // 2. Bulk-fetch agents, latest jobs, and latest versions — all in parallel
  const [agentsQuery, jobsQuery, versionsQuery] = await Promise.all([
    supabase.from("agents").select("*").in("agent_id", agentIds),
    supabase
      .from("trainer_jobs")
      .select("*")
      .in("run_id", runIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("agent_versions")
      .select("version_id, source_run_id, semantic_version, status")
      .in("source_run_id", runIds)
      .order("created_at", { ascending: false }),
  ]);

  // Agents map
  const agentsMap = new Map<string, AgentRow>();
  if (!agentsQuery.error) {
    for (const row of (agentsQuery.data as AgentRow[] | null) ?? []) {
      agentsMap.set(row.agent_id, row);
    }
  }

  // Latest job per run (already ordered desc, take first seen per run_id)
  const latestJobPerRun = new Map<string, TrainerJobRow>();
  if (!jobsQuery.error || isMissingRelation(jobsQuery.error)) {
    for (const row of (jobsQuery.data as TrainerJobRow[] | null) ?? []) {
      if (!latestJobPerRun.has(row.run_id)) {
        latestJobPerRun.set(row.run_id, row);
      }
    }
  }

  // Latest version per run (already ordered desc, take first seen per source_run_id)
  const latestVersionPerRun = new Map<string, { version_id: string; semantic_version: string; status: string }>();
  if (!versionsQuery.error || isMissingRelation(versionsQuery.error)) {
    for (const row of (versionsQuery.data as Array<{ version_id: string; source_run_id: string; semantic_version: string; status: string }> | null) ?? []) {
      if (!latestVersionPerRun.has(row.source_run_id)) {
        latestVersionPerRun.set(row.source_run_id, {
          version_id: row.version_id,
          semantic_version: row.semantic_version,
          status: row.status,
        });
      }
    }
  }

  return runs.map((run): TrainingRunSummary => {
    const agent = agentsMap.get(run.agent_id);
    const job = latestJobPerRun.get(run.run_id) ?? null;
    const version = latestVersionPerRun.get(run.run_id) ?? null;

    return TrainingRunSummarySchema.parse({
      runId: run.run_id,
      agent: {
        agentId: agent?.agent_id,
        slug: agent?.slug ?? run.agent_id,
        title: agent?.title ?? run.agent_id,
        domain: agent?.domain ?? "general",
        status: agent?.status ?? "draft",
        activeVersionId: agent?.active_version_id ?? null,
        source: "supabase",
      },
      status: run.status,
      experimentId: run.experiment_id ?? null,
      goal: run.goal,
      maxCycles: run.max_cycles,
      qualityThreshold: run.quality_threshold,
      executionMode: run.execution_mode ?? "classic",
      blockedReason: run.blocked_reason ?? null,
      lastEventAt: run.last_event_at ?? null,
      lastEventMessage: run.last_event_message ?? null,
      requestedBy: run.requested_by ?? null,
      createdAt: run.created_at,
      startedAt: run.started_at ?? null,
      completedAt: run.completed_at ?? null,
      job: job
        ? {
            jobId: job.job_id,
            status: job.status,
            lastError: job.last_error ?? null,
          }
        : null,
      latestVersion: version
        ? {
            versionId: version.version_id,
            semanticVersion: version.semantic_version,
            status: version.status as "candidate" | "approved" | "rejected" | "deployed",
          }
        : null,
    });
  });
}

export async function getTrainingRunDetail(runId: string): Promise<TrainingRunDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const run = await loadRunRow(runId);
  const agent = await loadAgentRow(run.agent_id);
  const latestJobPromise = loadLatestJobForRun(runId).catch(() => null);

  const [stepsQuery, versionsQuery, evalsQuery, approvalsQuery, experiment, latestJob] = await Promise.all([
    supabase.from("training_steps").select("*").eq("run_id", runId).order("created_at"),
    supabase.from("agent_versions").select("*").eq("source_run_id", runId).order("created_at", {
      ascending: false,
    }),
    supabase.from("eval_results").select("*").eq("run_id", runId).order("created_at"),
    supabase.from("approvals").select("*").eq("run_id", runId).order("created_at"),
    run.experiment_id ? getTrainerExperimentDetail(run.experiment_id).catch(() => null) : null,
    latestJobPromise,
  ]);

  if (stepsQuery.error) throw stepsQuery.error;
  if (versionsQuery.error) throw versionsQuery.error;
  if (evalsQuery.error) throw evalsQuery.error;
  if (approvalsQuery.error) throw approvalsQuery.error;

  const steps = ((stepsQuery.data as TrainingStepRow[] | null) ?? []).map((step) => ({
    stepId: step.step_id,
    cycleNo: step.cycle_no,
    stage: step.stage,
    status: step.status,
    providerSlug:
      (step.response_payload as Record<string, unknown> | null)?.providerSlug?.toString() ?? null,
    modelSlug:
      (step.response_payload as Record<string, unknown> | null)?.modelSlug?.toString() ?? null,
    estimatedCostUsd: step.estimated_cost_usd,
    latencyMs: step.latency_ms,
    createdAt: step.created_at,
    errorMessage: step.error_message,
  }));

  const versions = (versionsQuery.data as AgentVersionRow[] | null) ?? [];
  const latestVersion = mapVersionSummary(versions[0] ?? null);

  const evalRows = (evalsQuery.data as EvalResultRow[] | null) ?? [];
  const scenarioIds = [...new Set(evalRows.map((row) => row.scenario_id))];
  const scenariosQuery =
    scenarioIds.length > 0
      ? await supabase.from("scenarios").select("scenario_id, title").in("scenario_id", scenarioIds)
      : { data: [], error: null };

  if (scenariosQuery.error) throw scenariosQuery.error;

  const scenarioTitles = new Map<string, string>(
    (((scenariosQuery.data as Array<{ scenario_id: string; title: string }> | null) ?? [])).map((row) => [
      row.scenario_id,
      row.title,
    ])
  );

  const evalResults = evalRows.map((row) =>
    EvalResultSchema.parse({
      scenarioId: row.scenario_id,
      scenarioTitle: scenarioTitles.get(row.scenario_id) ?? row.scenario_id,
      dimensionScores: row.dimension_scores,
      overallScore: row.overall_score,
      verdict: row.verdict,
      rationale: row.rationale ?? "",
    })
  );

  const approvals = ((approvalsQuery.data as ApprovalRow[] | null) ?? []).map((approval) => ({
    approvalId: approval.approval_id,
    versionId: approval.version_id,
    decision: approval.decision,
    notes: approval.notes,
    createdAt: approval.created_at,
    approverUserId: approval.approver_user_id,
  }));

  const versionIds = versions.map((version) => version.version_id);
  const artifactsQuery =
    versionIds.length > 0
      ? await supabase
          .from("deployment_artifacts")
          .select("*")
          .in("version_id", versionIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  if (artifactsQuery.error) throw artifactsQuery.error;

  const artifacts = ((artifactsQuery.data as ArtifactRow[] | null) ?? []).map((artifact) => ({
    artifactId: artifact.artifact_id,
    versionId: artifact.version_id,
    artifactType: artifact.artifact_type,
    storagePath: artifact.storage_path,
    checksum: artifact.checksum,
    createdAt: artifact.created_at,
  }));

  return TrainingRunDetailSchema.parse({
    runId: run.run_id,
    agent: mapAgentSummary(agent),
    status: run.status,
    experimentId: run.experiment_id,
    experiment,
    goal: run.goal,
    maxCycles: run.max_cycles,
    qualityThreshold: run.quality_threshold,
    routingPolicy: RoutingPolicySchema.parse(run.routing_policy ?? {}),
    createdAt: run.created_at,
    startedAt: run.started_at,
    completedAt: run.completed_at,
    requestedBy: run.requested_by,
    approverUserId: run.approver_user_id,
    baselineVersionId: run.baseline_version_id,
    executionMode: run.execution_mode ?? "classic",
    resolvedGraph: run.resolved_graph ?? null,
    graphObservations: run.graph_observations ?? null,
    blockedReason: run.blocked_reason ?? null,
    lastEventAt: run.last_event_at ?? null,
    lastEventMessage: run.last_event_message ?? null,
    job: mapTrainingJobSummary(latestJob),
    latestVersion,
    steps,
    evalResults,
    approvals,
    artifacts,
  });
}

function synthesizeLegacyTrainingRunEvents(run: TrainingRunDetail): TrainingRunEvent[] {
  const events: TrainingRunEvent[] = [
    TrainingRunEventSchema.parse({
      eventId: `legacy-run-queued-${run.runId}`,
      runId: run.runId,
      jobId: run.job?.jobId ?? null,
      actorType: "admin",
      actorId: run.requestedBy,
      eventType: "run_queued",
      message: "Run queued.",
      payload: {},
      createdAt: run.createdAt,
    }),
  ];

  if (run.startedAt) {
    events.push(
      TrainingRunEventSchema.parse({
        eventId: `legacy-run-started-${run.runId}`,
        runId: run.runId,
        jobId: run.job?.jobId ?? null,
        actorType: "worker",
        actorId: run.job?.workerId ?? null,
        eventType: "job_claimed",
        message: "Worker claimed the run.",
        payload: {},
        createdAt: run.startedAt,
      })
    );
  }

  for (const step of run.steps) {
    events.push(
      TrainingRunEventSchema.parse({
        eventId: `legacy-step-${step.stepId}`,
        runId: run.runId,
        jobId: run.job?.jobId ?? null,
        actorType: "system",
        actorId: null,
        eventType: step.status === "failed" ? "stage_failed" : "stage_completed",
        message:
          step.status === "failed"
            ? `${step.stage} failed${step.errorMessage ? `: ${step.errorMessage}` : "."}`
            : `${step.stage} ${step.status}.`,
        payload: {
          stage: step.stage,
          cycleNo: step.cycleNo,
          status: step.status,
        },
        createdAt: step.createdAt,
      })
    );
  }

  for (const approval of run.approvals) {
    events.push(
      TrainingRunEventSchema.parse({
        eventId: `legacy-approval-${approval.approvalId}`,
        runId: run.runId,
        jobId: run.job?.jobId ?? null,
        actorType: "admin",
        actorId: approval.approverUserId,
        eventType: approval.decision === "approved" ? "run_approved" : "run_rejected",
        message: approval.decision === "approved" ? "Run approved." : "Run rejected.",
        payload: {
          versionId: approval.versionId,
          notes: approval.notes,
        },
        createdAt: approval.createdAt,
      })
    );
  }

  for (const artifact of run.artifacts) {
    events.push(
      TrainingRunEventSchema.parse({
        eventId: `legacy-artifact-${artifact.artifactId}`,
        runId: run.runId,
        jobId: run.job?.jobId ?? null,
        actorType: "admin",
        actorId: null,
        eventType: "run_deployed",
        message: `Artifact written to ${artifact.storagePath}.`,
        payload: {
          artifactType: artifact.artifactType,
          storagePath: artifact.storagePath,
        },
        createdAt: artifact.createdAt,
      })
    );
  }

  return events.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function listTrainingRunEvents(
  runId: string,
  limit = 60
): Promise<TrainingRunEvent[]> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("trainer_job_events")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 200)));

  if (query.error) {
    if (isMissingRelation(query.error)) {
      const run = await getTrainingRunDetail(runId);
      return synthesizeLegacyTrainingRunEvents(run).slice(0, limit);
    }
    throw query.error;
  }

  const rows = (query.data as TrainerJobEventRow[] | null) ?? [];
  return rows.map(mapTrainingRunEvent);
}

export async function getTrainerQueueHealth(): Promise<TrainerQueueHealth> {
  const supabase = getTrainerSupabaseAdmin();
  const now = Date.now();

  const [jobsQuery, workersQuery, runsQuery] = await Promise.all([
    supabase
      .from("trainer_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("trainer_workers")
      .select("*")
      .order("last_heartbeat_at", { ascending: false })
      .limit(50),
    supabase
      .from("training_runs")
      .select("run_id,status,created_at")
      .in("status", ["queued", "running", "awaiting_review", "failed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const jobs = jobsQuery.error && isMissingRelation(jobsQuery.error)
    ? []
    : ((jobsQuery.data as TrainerJobRow[] | null) ?? []);
  const workers = workersQuery.error && isMissingRelation(workersQuery.error)
    ? []
    : ((workersQuery.data as TrainerWorkerRow[] | null) ?? []);
  const runs = runsQuery.error && isMissingRelation(runsQuery.error)
    ? []
    : (((runsQuery.data as Array<{ run_id: string; status: string; created_at: string }> | null) ?? []));

  if (jobsQuery.error && !isMissingRelation(jobsQuery.error) && !isTransientError(jobsQuery.error)) throw jobsQuery.error;
  if (workersQuery.error && !isMissingRelation(workersQuery.error) && !isTransientError(workersQuery.error)) throw workersQuery.error;
  if (runsQuery.error && !isMissingRelation(runsQuery.error) && !isTransientError(runsQuery.error)) throw runsQuery.error;

  const queuedJobs = jobs.filter((job) => job.status === "queued");
  const leasedJobs = jobs.filter((job) => job.status === "leased");
  const retryWaitJobs = jobs.filter((job) => job.status === "retry_wait");
  const failedJobs = jobs.filter((job) => job.status === "failed");
  const staleJobs = leasedJobs.filter((job) => {
    const leaseExpiresAt = job.lease_expires_at ? new Date(job.lease_expires_at).getTime() : NaN;
    return Number.isFinite(leaseExpiresAt) && leaseExpiresAt < now;
  });
  const oldestQueuedAt = queuedJobs
    .map((job) => job.created_at)
    .sort()[0] ?? null;

  const workerSummaries = workers.map((worker) => {
    const lastHeartbeatAt = worker.last_heartbeat_at ? new Date(worker.last_heartbeat_at).getTime() : NaN;
    const isOffline =
      worker.status === "offline" ||
      (Number.isFinite(lastHeartbeatAt) && now - lastHeartbeatAt > 60_000);

    return {
      workerId: worker.worker_id,
      status: isOffline ? "offline" : worker.status,
      currentJobId: worker.current_job_id,
      buildSha: worker.build_sha,
      host: worker.host,
      startedAt: worker.started_at,
      lastHeartbeatAt: worker.last_heartbeat_at,
      metadata: worker.metadata ?? {},
    };
  });

  return TrainerQueueHealthSchema.parse({
    queuedCount: queuedJobs.length,
    leasedCount: leasedJobs.length,
    retryWaitCount: retryWaitJobs.length,
    failedCount: failedJobs.length,
    awaitingReviewCount: runs.filter((run) => run.status === "awaiting_review").length,
    staleLeaseCount: staleJobs.length,
    onlineWorkerCount: workerSummaries.filter((worker) => worker.status !== "offline").length,
    offlineWorkerCount: workerSummaries.filter((worker) => worker.status === "offline").length,
    oldestQueuedAt,
    oldestQueuedAgeMs: oldestQueuedAt ? Math.max(0, now - new Date(oldestQueuedAt).getTime()) : null,
    workers: workerSummaries,
    staleJobs: staleJobs.map((job) => mapTrainingJobSummary(job)).filter(Boolean),
  });
}

export async function getTrainerQueueSnapshot(runId: string) {
  const [job, queueHealth] = await Promise.all([
    loadLatestJobForRun(runId).catch(() => null),
    getTrainerQueueHealth().catch(() => null),
  ]);

  return {
    jobStatus: job?.status ?? null,
    workerOnline:
      queueHealth ? queueHealth.onlineWorkerCount > 0 : null,
    oldestQueuedAgeMs: queueHealth?.oldestQueuedAgeMs ?? null,
  };
}

export async function markTrainingRunStatus(
  runId: string,
  status: TrainingRunDetail["status"],
  extras: Partial<
    Pick<
      TrainingRunRow,
      "started_at" | "completed_at" | "approver_user_id" | "blocked_reason"
    >
  > = {}
): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("training_runs")
    .update({
      status,
      ...extras,
    })
    .eq("run_id", runId);

  if (query.error) {
    if (isMissingColumn(query.error)) {
      const fallbackQuery = await supabase
        .from("training_runs")
        .update({
          status,
          started_at: extras.started_at,
          completed_at: extras.completed_at,
          approver_user_id: extras.approver_user_id,
        })
        .eq("run_id", runId);

      if (fallbackQuery.error) {
        throw fallbackQuery.error;
      }
      return;
    }

    throw query.error;
  }
}

export async function persistTrainingRunStudySelection(params: {
  runId: string;
  sourceFiles: string[];
  understanding?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const run = await loadRunRow(params.runId);
  const existingRoutingPolicy =
    run.routing_policy && typeof run.routing_policy === "object"
      ? (run.routing_policy as Record<string, unknown>)
      : {};
  const query = await supabase
    .from("training_runs")
    .update({
      routing_policy: {
        ...existingRoutingPolicy,
        trainerSelectedStudySourceFiles: params.sourceFiles,
        trainerStudyUnderstanding: params.understanding ?? existingRoutingPolicy.trainerStudyUnderstanding ?? null,
      },
    })
    .eq("run_id", params.runId);

  if (query.error) {
    throw query.error;
  }
}

export async function persistTrainingRunGraphObservations(params: {
  runId: string;
  observations: Record<string, unknown>;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("training_runs")
    .update({
      graph_observations: params.observations,
    })
    .eq("run_id", params.runId);

  if (query.error) {
    if (isMissingColumn(query.error)) {
      return;
    }
    throw query.error;
  }
}

export async function cancelTrainingRun(runId: string): Promise<TrainingRunDetail> {
  const run = await loadRunRow(runId);
  assertQueueMutableStatus(run.status);
  const latestJob = await loadLatestJobForRun(runId).catch(() => null);

  if (run.status !== "cancelled") {
    await deleteWhereEq("trainer_jobs", "run_id", runId);
    await markTrainingRunStatus(runId, "cancelled", {
      completed_at: new Date().toISOString(),
      blocked_reason: null,
    });
    await recordTrainingRunEvent({
      runId,
      jobId: latestJob?.job_id ?? null,
      actorType: "admin",
      eventType: "run_cancelled",
      message: "Run cancelled and removed from the active queue.",
      blockedReason: null,
    });
  }

  return getTrainingRunDetail(runId);
}

export async function purgeTrainingRun(runId: string): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const run = await loadRunRow(runId);
  assertQueueMutableStatus(run.status);
  await recordTrainingRunEvent({
    runId,
    actorType: "admin",
    eventType: "run_purged",
    message: "Run purge requested; queue-local trainer records are being deleted.",
    blockedReason: null,
  }).catch(() => undefined);

  const versionIds = await listRunVersionIds(runId);

  await deleteWhereEq("trainer_review_decisions", "run_id", runId);
  await deleteWhereEq("knowledge_interpretations", "produced_by_run_id", runId);
  await deleteWhereEq("trainer_jobs", "run_id", runId);

  if (versionIds.length > 0) {
    const clearActiveVersionQuery = await supabase
      .from("agents")
      .update({ active_version_id: null })
      .in("active_version_id", versionIds);

    if (clearActiveVersionQuery.error && !isMissingRelation(clearActiveVersionQuery.error)) {
      throw clearActiveVersionQuery.error;
    }

    const clearAppliedMutationsQuery = await supabase
      .from("embodiment_mutations")
      .update({ applied_version_id: null })
      .in("applied_version_id", versionIds);

    if (clearAppliedMutationsQuery.error && !isMissingRelation(clearAppliedMutationsQuery.error)) {
      throw clearAppliedMutationsQuery.error;
    }

    const manifestRowsQuery = await supabase
      .from("agent_manifests")
      .select("id")
      .in("version_id", versionIds);

    if (manifestRowsQuery.error && !isMissingRelation(manifestRowsQuery.error)) {
      throw manifestRowsQuery.error;
    }

    const manifestIds = (((manifestRowsQuery.data as Array<{ id: string }> | null) ?? [])).map(
      (row) => row.id
    );

    await deleteWhereIn("trainer_review_decisions", "version_id", versionIds);
    await deleteWhereIn("agent_manifest_entries", "manifest_id", manifestIds);
    await deleteWhereIn("agent_manifests", "id", manifestIds);
    await deleteWhereIn("deployment_artifacts", "version_id", versionIds);
    await deleteWhereIn("approvals", "version_id", versionIds);
    await deleteWhereIn("eval_results", "candidate_version_id", versionIds);
    await deleteWhereIn("agent_versions", "version_id", versionIds);
  }

  const runDeleteQuery = await supabase.from("training_runs").delete().eq("run_id", runId);
  if (runDeleteQuery.error) {
    throw runDeleteQuery.error;
  }

  const [remainingRunsQuery, remainingVersionsQuery] = await Promise.all([
    supabase
      .from("training_runs")
      .select("run_id", { count: "exact", head: true })
      .eq("agent_id", run.agent_id),
    supabase
      .from("agent_versions")
      .select("version_id", { count: "exact", head: true })
      .eq("agent_id", run.agent_id),
  ]);

  if (remainingRunsQuery.error && !isMissingRelation(remainingRunsQuery.error)) {
    throw remainingRunsQuery.error;
  }

  if (remainingVersionsQuery.error && !isMissingRelation(remainingVersionsQuery.error)) {
    throw remainingVersionsQuery.error;
  }

  const hasRemainingRuns = (remainingRunsQuery.count ?? 0) > 0;
  const hasRemainingVersions = (remainingVersionsQuery.count ?? 0) > 0;

  if (!hasRemainingRuns && !hasRemainingVersions) {
    const deleteAgentQuery = await supabase
      .from("agents")
      .delete()
      .eq("agent_id", run.agent_id)
      .is("active_version_id", null);

    if (deleteAgentQuery.error && !isMissingRelation(deleteAgentQuery.error)) {
      throw deleteAgentQuery.error;
    }
  }
}

export async function startTrainingStep(params: {
  runId: string;
  cycleNo: number;
  stage: TrainingStage;
  requestPayload: unknown;
}): Promise<string> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("training_steps")
    .insert({
      run_id: params.runId,
      cycle_no: params.cycleNo,
      stage: params.stage,
      request_payload: params.requestPayload,
      status: "running",
    })
    .select("step_id")
    .single();

  if (query.error) {
    throw query.error;
  }

  const stepId = (query.data as { step_id: string }).step_id;
  await recordTrainingRunEvent({
    runId: params.runId,
    actorType: "system",
    eventType: "stage_started",
    message: `${params.stage} started.`,
    payload: {
      stage: params.stage,
      cycleNo: params.cycleNo,
      stepId,
    },
  }).catch(() => undefined);

  return stepId;
}

export async function finishTrainingStep(params: {
  stepId: string;
  status: "completed" | "failed" | "skipped";
  runId?: string;
  stage?: TrainingStage;
  cycleNo?: number;
  responsePayload?: unknown;
  latencyMs?: number | null;
  estimatedCostUsd?: number | null;
  errorMessage?: string | null;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("training_steps")
    .update({
      status: params.status,
      response_payload: params.responsePayload ?? null,
      latency_ms: params.latencyMs ?? null,
      estimated_cost_usd: params.estimatedCostUsd ?? null,
      error_message: params.errorMessage ?? null,
    })
    .eq("step_id", params.stepId);

  if (query.error) {
    throw query.error;
  }

  if (params.runId && params.stage) {
    await recordTrainingRunEvent({
      runId: params.runId,
      actorType: "system",
      eventType: params.status === "failed" ? "stage_failed" : "stage_completed",
      message:
        params.status === "failed"
          ? `${params.stage} failed${params.errorMessage ? `: ${params.errorMessage}` : "."}`
          : `${params.stage} ${params.status}.`,
      payload: {
        stepId: params.stepId,
        stage: params.stage,
        cycleNo: params.cycleNo ?? null,
        latencyMs: params.latencyMs ?? null,
      },
    }).catch(() => undefined);
  }
}

export async function saveAgentVersion(params: {
  agentId: string;
  runId: string;
  parentVersionId?: string | null;
  spec: AgentSpec;
  changeSummary?: string | null;
  status?: AgentVersionRow["status"];
}): Promise<AgentVersionSummary> {
  const supabase = getTrainerSupabaseAdmin();
  const canonicalSpec = AgentSpecSchema.parse(params.spec);
  const compiledMarkdown = compileAgentMarkdown(canonicalSpec);
  const semanticVersion = await nextSemanticVersion(params.agentId);
  const query = await supabase
    .from("agent_versions")
    .insert({
      agent_id: params.agentId,
      parent_version_id: params.parentVersionId ?? null,
      source_run_id: params.runId,
      semantic_version: semanticVersion,
      canonical_spec: canonicalSpec,
      compiled_markdown: compiledMarkdown,
      checksum: sha256(compiledMarkdown),
      change_summary: params.changeSummary ?? null,
      status: params.status ?? "candidate",
    })
    .select("*")
    .single();

  if (query.error) {
    throw query.error;
  }

  return mapVersionSummary(query.data as AgentVersionRow)!;
}

export async function replaceEvalResults(
  runId: string,
  versionId: string | null,
  results: EvalResult[],
  rubric: EvalRubric
): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const parsedResults = results.map((result) => EvalResultSchema.parse(result));

  const deleteQuery = await supabase.from("eval_results").delete().eq("run_id", runId);
  if (deleteQuery.error) {
    throw deleteQuery.error;
  }

  const rubricId = await ensureEvalRubricRecord(rubric);

  if (parsedResults.length === 0) {
    return;
  }

  const insertQuery = await supabase.from("eval_results").insert(
    parsedResults.map((result) => ({
      run_id: runId,
      candidate_version_id: versionId,
      scenario_id: result.scenarioId,
      rubric_id: rubricId,
      dimension_scores: result.dimensionScores,
      overall_score: result.overallScore,
      verdict: result.verdict,
      rationale: result.rationale,
    }))
  );

  if (insertQuery.error) {
    throw insertQuery.error;
  }
}

export async function ensureEvalRubricRecord(rubric: EvalRubric): Promise<string> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("eval_rubrics")
    .select("rubric_id")
    .eq("slug", rubric.slug)
    .maybeSingle();

  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }

  const existingId = (query.data as { rubric_id?: string } | null)?.rubric_id;
  if (existingId) {
    return existingId;
  }

  const insertQuery = await supabase
    .from("eval_rubrics")
    .insert({
      slug: rubric.slug,
      title: rubric.title,
      dimensions: rubric.dimensions,
      pass_threshold: rubric.passThreshold,
    })
    .select("rubric_id")
    .single();

  if (insertQuery.error) {
    throw insertQuery.error;
  }

  return (insertQuery.data as { rubric_id: string }).rubric_id;
}

export async function recordApproval(params: {
  runId: string;
  versionId: string;
  approverUserId: string;
  decision: ApprovalDecision;
  notes?: string;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const approvalQuery = await supabase.from("approvals").insert({
    run_id: params.runId,
    version_id: params.versionId,
    approver_user_id: params.approverUserId,
    decision: params.decision,
    notes: params.notes ?? null,
  });

  if (approvalQuery.error) {
    throw approvalQuery.error;
  }

  const versionStatus = params.decision === "approved" ? "approved" : "rejected";
  const versionQuery = await supabase
    .from("agent_versions")
    .update({ status: versionStatus })
    .eq("version_id", params.versionId);

  if (versionQuery.error) {
    throw versionQuery.error;
  }

  const run = await loadRunRow(params.runId);
  const agentStatus = params.decision === "approved" ? "approved" : "draft";

  const agentQuery = await supabase
    .from("agents")
    .update({ status: agentStatus })
    .eq("agent_id", run.agent_id);

  if (agentQuery.error) {
    throw agentQuery.error;
  }

  await markTrainingRunStatus(params.runId, "completed", {
    approver_user_id: params.approverUserId,
    completed_at: new Date().toISOString(),
    blocked_reason: null,
  });

  await recordTrainingRunEvent({
    runId: params.runId,
    actorType: "admin",
    actorId: params.approverUserId,
    eventType: params.decision === "approved" ? "run_approved" : "run_rejected",
    message:
      params.decision === "approved"
        ? "Review approved and run marked completed."
        : "Review rejected and run marked completed.",
    payload: {
      versionId: params.versionId,
      notes: params.notes ?? null,
    },
    blockedReason: null,
  });
}

async function writeArtifactFile(storagePath: string, content: string): Promise<void> {
  const absolutePath = path.resolve(process.cwd(), storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, "utf8");
}

export async function deployAgentVersion(params: {
  runId: string;
  versionId: string;
  storagePath?: string;
}): Promise<TrainingRunDetail> {
  const supabase = getTrainerSupabaseAdmin();

  const versionQuery = await supabase.from("agent_versions").select("*").eq("version_id", params.versionId).single();
  if (versionQuery.error) {
    throw versionQuery.error;
  }

  const version = versionQuery.data as AgentVersionRow;
  const artifactPath = params.storagePath || compileAgentArtifactPath(AgentSpecSchema.parse(version.canonical_spec));
  await writeArtifactFile(artifactPath, version.compiled_markdown);

  const artifactQuery = await supabase
    .from("deployment_artifacts")
    .insert({
      version_id: params.versionId,
      artifact_type: "agent_md",
      storage_path: artifactPath,
      checksum: version.checksum,
    });

  if (artifactQuery.error) {
    throw artifactQuery.error;
  }

  const versionUpdate = await supabase
    .from("agent_versions")
    .update({ status: "deployed" })
    .eq("version_id", params.versionId);

  if (versionUpdate.error) {
    throw versionUpdate.error;
  }

  const run = await loadRunRow(params.runId);
  const agentUpdate = await supabase
    .from("agents")
    .update({
      status: "deployed",
      active_version_id: params.versionId,
      updated_at: new Date().toISOString(),
    })
    .eq("agent_id", run.agent_id);

  if (agentUpdate.error) {
    throw agentUpdate.error;
  }

  await rebuildAgentManifest({
    agentId: run.agent_id,
    versionId: params.versionId,
    status: "active",
  });

  await recordTrainingRunEvent({
    runId: params.runId,
    actorType: "admin",
    eventType: "run_deployed",
    message: `Deployment artifact written to ${artifactPath}.`,
    payload: {
      versionId: params.versionId,
      storagePath: artifactPath,
    },
    blockedReason: null,
  });

  return getTrainingRunDetail(params.runId);
}

export async function loadScenarioPack(scenarioSetIds: string[]): Promise<Scenario[]> {
  if (scenarioSetIds.length === 0) {
    return [];
  }

  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("scenarios")
    .select("*")
    .in("scenario_set_id", scenarioSetIds)
    .order("difficulty");

  if (query.error) {
    throw query.error;
  }

  return ((query.data as ScenarioRow[] | null) ?? []).map((row) =>
    ScenarioSchema.parse({
      scenario_id: row.scenario_id,
      title: row.title,
      difficulty: row.difficulty,
      prompt_input: row.prompt_input,
      expected_traits: row.expected_traits,
      disallowed_traits: row.disallowed_traits,
      gold_answer: row.gold_answer ?? undefined,
      tags: row.tags ?? [],
    })
  );
}

export async function persistSyntheticScenarioPack(params: {
  runId: string;
  domain: string;
  title: string;
  scenarios: Scenario[];
}): Promise<Scenario[]> {
  const supabase = getTrainerSupabaseAdmin();
  const setSlug = `run-${params.runId}`;
  const setQuery = await supabase
    .from("scenario_sets")
    .insert({
      slug: setSlug,
      title: `${params.title} synthetic pack`,
      domain: params.domain,
      version: 1,
      locked: false,
    })
    .select("scenario_set_id")
    .single();

  if (setQuery.error) {
    throw setQuery.error;
  }

  const scenarioSetId = (setQuery.data as { scenario_set_id: string }).scenario_set_id;
  const insertQuery = await supabase
    .from("scenarios")
    .insert(
      params.scenarios.map((scenario) => ({
        scenario_set_id: scenarioSetId,
        title: scenario.title,
        difficulty: scenario.difficulty,
        prompt_input: scenario.prompt_input,
        expected_traits: scenario.expected_traits,
        disallowed_traits: scenario.disallowed_traits,
        gold_answer: scenario.gold_answer ?? null,
        tags: scenario.tags,
      }))
    )
    .select("*");

  if (insertQuery.error) {
    throw insertQuery.error;
  }

  return ((insertQuery.data as ScenarioRow[] | null) ?? []).map((row) =>
    ScenarioSchema.parse({
      scenario_id: row.scenario_id,
      title: row.title,
      difficulty: row.difficulty,
      prompt_input: row.prompt_input,
      expected_traits: row.expected_traits,
      disallowed_traits: row.disallowed_traits,
      gold_answer: row.gold_answer ?? undefined,
      tags: row.tags ?? [],
    })
  );
}

export async function loadRegisteredModels(): Promise<
  Array<{
    providerId: string;
    modelId: string;
    providerSlug: string;
    modelSlug: string;
    apiName: string;
    kind: "ollama" | "groq" | "openai_compatible";
    baseUrl: string;
    supportsStructured: boolean;
    supportsTools: boolean;
    supportsEmbeddings: boolean;
    contextWindow: number | null;
    speedTier: number;
    costTier: number;
    localFirst: boolean;
    enabled: boolean;
    metadata: Record<string, unknown>;
  }>
> {
  const supabase = getTrainerSupabaseAdmin();
  const [providersQuery, modelsQuery] = await Promise.all([
    supabase.from("model_providers").select("*").eq("enabled", true),
    supabase.from("models").select("*").eq("enabled", true),
  ]);

  if (providersQuery.error || modelsQuery.error) {
    if (isMissingRelation(providersQuery.error ?? modelsQuery.error)) {
      return [];
    }
    throw providersQuery.error ?? modelsQuery.error;
  }

  const providers = ((providersQuery.data as ModelProviderRow[] | null) ?? []).reduce<
    Record<string, ModelProviderRow>
  >((acc, row) => {
    acc[row.provider_id] = row;
    return acc;
  }, {});

  return ((modelsQuery.data as ModelRow[] | null) ?? [])
    .map((model) => {
      const provider = providers[model.provider_id];
      if (!provider) return null;

      return {
        providerId: provider.provider_id,
        modelId: model.model_id,
        providerSlug: provider.slug,
        modelSlug: model.slug,
        apiName: model.api_name,
        kind: provider.kind,
        baseUrl: provider.base_url,
        supportsStructured: model.supports_structured,
        supportsTools: model.supports_tools,
        supportsEmbeddings: model.supports_embeddings,
        contextWindow: model.context_window,
        speedTier: model.speed_tier,
        costTier: model.cost_tier,
        localFirst: provider.local_first,
        enabled: provider.enabled && model.enabled,
        metadata: model.metadata ?? {},
      };
    })
    .filter((model): model is NonNullable<typeof model> => Boolean(model));
}

export async function claimTrainerJob(workerId: string): Promise<{
  jobId: string;
  runId: string;
} | null> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.rpc("claim_trainer_job", {
    _worker_id: workerId,
    _lease_seconds: 90,
  });

  if (query.error) {
    if (isMissingRelation(query.error)) {
      return null;
    }
    throw query.error;
  }

  const row = Array.isArray(query.data) ? query.data[0] : query.data;
  if (!row) {
    return null;
  }

  const jobId = String((row as Record<string, unknown>).job_id);
  const runId = String((row as Record<string, unknown>).run_id);
  const now = new Date().toISOString();

  const updateClaimQuery = await supabase
    .from("trainer_jobs")
    .update({
      worker_id: workerId,
      claimed_at: now,
      last_heartbeat_at: now,
      last_error: null,
    })
    .eq("job_id", jobId);

  if (
    updateClaimQuery.error &&
    !isMissingRelation(updateClaimQuery.error) &&
    !isMissingColumn(updateClaimQuery.error)
  ) {
    throw updateClaimQuery.error;
  }

  await markTrainingRunStatus(runId, "running", {
    started_at: now,
    blocked_reason: null,
  }).catch(() => undefined);
  await recordTrainingRunEvent({
    runId,
    jobId,
    actorType: "worker",
    actorId: workerId,
    eventType: "job_claimed",
    message: `Worker ${workerId} claimed the queued job.`,
    blockedReason: null,
  }).catch(() => undefined);

  return {
    jobId,
    runId,
  };
}

export async function registerTrainerWorker(params: {
  workerId: string;
  status?: "starting" | "idle" | "busy" | "offline";
  currentJobId?: string | null;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const now = new Date().toISOString();
  const query = await supabase.from("trainer_workers").upsert({
    worker_id: params.workerId,
    status: params.status ?? "starting",
    current_job_id: params.currentJobId ?? null,
    build_sha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    host: process.env.HOSTNAME ?? null,
    started_at: now,
    last_heartbeat_at: now,
    metadata: {
      pid: process.pid,
      runtime: "node",
    },
  });

  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }
}

export async function heartbeatTrainerWorker(params: {
  workerId: string;
  currentJobId?: string | null;
  status?: "idle" | "busy";
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("trainer_workers")
    .update({
      status: params.status ?? (params.currentJobId ? "busy" : "idle"),
      current_job_id: params.currentJobId ?? null,
      last_heartbeat_at: new Date().toISOString(),
    })
    .eq("worker_id", params.workerId);

  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }

  if (params.currentJobId) {
    const jobQuery = await supabase
      .from("trainer_jobs")
      .update({
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq("job_id", params.currentJobId);

    if (jobQuery.error && !isMissingRelation(jobQuery.error) && !isMissingColumn(jobQuery.error)) {
      throw jobQuery.error;
    }
  }
}

export async function markTrainerWorkerIdle(workerId: string): Promise<void> {
  await heartbeatTrainerWorker({ workerId, currentJobId: null, status: "idle" });
}

export async function markTrainerWorkerOffline(workerId: string): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("trainer_workers")
    .update({
      status: "offline",
      current_job_id: null,
      last_heartbeat_at: new Date().toISOString(),
    })
    .eq("worker_id", workerId);

  if (query.error && !isMissingRelation(query.error)) {
    throw query.error;
  }
}

export async function completeTrainerJob(jobId: string): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const existingJob = await supabase
    .from("trainer_jobs")
    .select("run_id,worker_id")
    .eq("job_id", jobId)
    .maybeSingle();
  if (existingJob.error && !isMissingRelation(existingJob.error)) {
    throw existingJob.error;
  }
  await updateTrainerJobs(
    (fields) =>
      supabase
        .from("trainer_jobs")
        .update(fields)
        .eq("job_id", jobId),
    {
      status: "done",
      lease_expires_at: null,
    }
  );

  const job = (existingJob.data as { run_id?: string; worker_id?: string | null } | null) ?? null;
  if (job?.run_id) {
    await recordTrainingRunEvent({
      runId: job.run_id,
      jobId,
      actorType: "worker",
      actorId: job.worker_id ?? null,
      eventType: "job_completed",
      message: "Worker completed the queued job.",
      blockedReason: null,
    }).catch(() => undefined);
  }
}

export async function settleTrainerJobsForRun(params: {
  runId: string;
  status: "done" | "failed" | "cancelled";
  errorMessage?: string | null;
}): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  await updateTrainerJobs(
    (fields) =>
      supabase
        .from("trainer_jobs")
        .update(fields)
        .eq("run_id", params.runId)
        .in("status", ["queued", "leased"]),
    {
      status: params.status,
      lease_expires_at: null,
      last_error:
        params.status === "failed" ? params.errorMessage ?? "Trainer execution failed." : null,
    }
  );
}

export async function failTrainerJob(jobId: string, errorMessage: string): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const existingJob = await supabase
    .from("trainer_jobs")
    .select("run_id,worker_id")
    .eq("job_id", jobId)
    .maybeSingle();
  if (existingJob.error && !isMissingRelation(existingJob.error)) {
    throw existingJob.error;
  }
  const query = await supabase
    .from("trainer_jobs")
    .update({
      status: "failed",
      lease_expires_at: null,
      completed_at: new Date().toISOString(),
      last_error: errorMessage,
    })
    .eq("job_id", jobId);

  if (query.error) {
    throw query.error;
  }

  const job = (existingJob.data as { run_id?: string; worker_id?: string | null } | null) ?? null;
  if (job?.run_id) {
    await recordTrainingRunEvent({
      runId: job.run_id,
      jobId,
      actorType: "worker",
      actorId: job.worker_id ?? null,
      eventType: "job_failed",
      message: errorMessage,
      blockedReason: errorMessage,
    }).catch(() => undefined);
  }
}

export async function cancelTrainerJob(jobId: string, message = "Run cancelled by operator."): Promise<void> {
  const supabase = getTrainerSupabaseAdmin();
  const existingJob = await supabase
    .from("trainer_jobs")
    .select("run_id,worker_id")
    .eq("job_id", jobId)
    .maybeSingle();
  if (existingJob.error && !isMissingRelation(existingJob.error)) {
    throw existingJob.error;
  }
  await updateTrainerJobs(
    (fields) =>
      supabase
        .from("trainer_jobs")
        .update(fields)
        .eq("job_id", jobId),
    {
      status: "cancelled",
      lease_expires_at: null,
      last_error: null,
    }
  );

  const job = (existingJob.data as { run_id?: string; worker_id?: string | null } | null) ?? null;
  if (job?.run_id) {
    await markTrainingRunStatus(job.run_id, "cancelled", {
      completed_at: new Date().toISOString(),
      blocked_reason: null,
    }).catch(() => undefined);
    await recordTrainingRunEvent({
      runId: job.run_id,
      jobId,
      actorType: "worker",
      actorId: job.worker_id ?? null,
      eventType: "run_cancelled",
      message,
      blockedReason: null,
    }).catch(() => undefined);
  }
}

export async function requestTrainingRunCancel(
  runId: string,
  actorId: string | null
): Promise<TrainingRunDetail> {
  const supabase = getTrainerSupabaseAdmin();
  const latestJob = await loadLatestJobForRun(runId);

  if (!latestJob || latestJob.status === "queued" || latestJob.status === "retry_wait") {
    await deleteWhereEq("trainer_jobs", "run_id", runId);
    await markTrainingRunStatus(runId, "cancelled", {
      completed_at: new Date().toISOString(),
      blocked_reason: null,
    });
    await recordTrainingRunEvent({
      runId,
      actorType: "admin",
      actorId,
      eventType: "run_cancelled",
      message: "Run cancelled before worker execution started.",
      blockedReason: null,
    });
    return getTrainingRunDetail(runId);
  }

  await updateTrainerJobs(
    (fields) =>
      supabase
        .from("trainer_jobs")
        .update(fields)
        .eq("job_id", latestJob.job_id),
    {
      cancel_requested: true,
      last_error: null,
    }
  );

  await updateTrainingRunObservability({
    runId,
    blockedReason: "Cancel requested by admin. Worker will stop after the current stage.",
    lastEventAt: new Date().toISOString(),
    lastEventMessage: "Cancel requested while the worker was active.",
  }).catch(() => undefined);
  await recordTrainingRunEvent({
    runId,
    jobId: latestJob.job_id,
    actorType: "admin",
    actorId,
    eventType: "run_cancel_requested",
    message: "Cancel requested while the worker was active.",
    blockedReason: "Cancel requested by admin. Worker will stop after the current stage.",
  }).catch(() => undefined);

  return getTrainingRunDetail(runId);
}

export async function isTrainingRunCancellationRequested(runId: string): Promise<boolean> {
  const latestJob = await loadLatestJobForRun(runId);
  return Boolean(latestJob?.cancel_requested);
}

export async function retryTrainerJob(jobId: string): Promise<TrainingRunDetail | null> {
  const supabase = getTrainerSupabaseAdmin();
  const existingJob = await supabase
    .from("trainer_jobs")
    .select("run_id")
    .eq("job_id", jobId)
    .maybeSingle();

  if (existingJob.error) {
    if (isMissingRelation(existingJob.error)) {
      return null;
    }
    throw existingJob.error;
  }

  const runId = (existingJob.data as { run_id?: string } | null)?.run_id;
  if (!runId) {
    return null;
  }

  const query = await supabase
    .from("trainer_jobs")
    .update({
      status: "queued",
      lease_expires_at: null,
      last_error: null,
      cancel_requested: false,
      next_retry_at: new Date().toISOString(),
    })
    .eq("job_id", jobId);

  if (query.error && !isMissingRelation(query.error) && !isMissingColumn(query.error)) {
    throw query.error;
  }

  await markTrainingRunStatus(runId, "queued", {
    started_at: null,
    completed_at: null,
    blocked_reason: null,
  }).catch(() => undefined);
  await recordTrainingRunEvent({
    runId,
    jobId,
    actorType: "admin",
    eventType: "job_requeued",
    message: "Job moved back into the queue.",
    blockedReason: null,
  }).catch(() => undefined);

  return getTrainingRunDetail(runId);
}
