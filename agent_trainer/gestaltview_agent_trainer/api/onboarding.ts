import { z } from "zod";
import onboardingTaskGraphJson from "../setup/onboarding-task-graph.json";
import {
  recommendBuyerSegment,
  type BuyerSegment,
  type SegmentRecommendationInput
} from "../config/segments";
import {
  buildThemeFromBrandColor,
  getThemePreset,
  validateThemeAccessibility
} from "../config/themeEngine";

export type OnboardingEntryMode = "web" | "cli";
export type OnboardingTaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type OnboardingSessionStatus = "in_progress" | "blocked" | "completed";

const onboardingTaskDefinitionSchema = z.object({
  task_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  entry_modes: z.array(z.enum(["web", "cli"])),
  segments: z.array(z.enum(["solo", "business", "enterprise"])),
  preconditions: z.array(z.string()),
  inputs: z.array(z.string()),
  actions: z.array(z.string()),
  outputs: z.array(z.string()),
  failure_modes: z.array(z.string()),
  next: z.array(z.string())
});

const onboardingTaskGraphSchema = z.object({
  version: z.string().min(1),
  defaultTaskOrder: z.array(z.string().min(1)),
  tracks: z.object({
    solo: z.array(z.string().min(1)),
    business: z.array(z.string().min(1)),
    enterprise: z.array(z.string().min(1))
  }),
  tasks: z.array(onboardingTaskDefinitionSchema)
});

export type OnboardingTaskDefinition = z.infer<typeof onboardingTaskDefinitionSchema>;
export type OnboardingTaskGraph = z.infer<typeof onboardingTaskGraphSchema>;

export interface OnboardingEvidence {
  kind: "summary" | "metric" | "check" | "artifact";
  label: string;
  value: string;
  metadata?: Record<string, unknown>;
}

export interface OnboardingTaskRecord {
  id: string;
  taskKey: string;
  status: OnboardingTaskStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  summary: string;
  error: Record<string, unknown> | null;
  evidence: OnboardingEvidence[];
  updatedAt: string;
}

export interface OnboardingSessionRecord {
  id: string;
  workspaceId: string | null;
  entryMode: OnboardingEntryMode;
  status: OnboardingSessionStatus;
  segmentRecommendation: BuyerSegment;
  metadata?: Record<string, unknown>;
  startedAt: string;
  completedAt: string | null;
  tasks: OnboardingTaskRecord[];
}

export interface CreateOnboardingSessionInput extends SegmentRecommendationInput {
  entryMode: OnboardingEntryMode;
  workspaceId?: string | null;
  segment?: BuyerSegment;
}

export interface OnboardingSessionProgress {
  completedTaskCount: number;
  blockedTaskCount: number;
  totalTaskCount: number;
  nextTaskKey: string | null;
  canPublish: boolean;
}

export interface OnboardingExecutionResult {
  session: OnboardingSessionRecord;
  task: OnboardingTaskRecord;
  nextTaskKeys: string[];
}

const onboardingTaskGraph = onboardingTaskGraphSchema.parse(onboardingTaskGraphJson);

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `onboarding-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildTaskRecord(taskKey: string): OnboardingTaskRecord {
  return {
    id: generateId(),
    taskKey,
    status: "pending",
    input: {},
    output: {},
    summary: "Not started.",
    error: null,
    evidence: [],
    updatedAt: nowIso()
  };
}

function makeSummary(label: string, detail: string): OnboardingEvidence {
  return {
    kind: "summary",
    label,
    value: detail
  };
}

function findTaskDefinition(taskKey: string): OnboardingTaskDefinition | null {
  return onboardingTaskGraph.tasks.find((task) => task.task_id === taskKey) ?? null;
}

function getTrackForSegment(segment: BuyerSegment): string[] {
  return onboardingTaskGraph.tracks[segment];
}

function arePreconditionsMet(
  session: OnboardingSessionRecord,
  taskDefinition: OnboardingTaskDefinition
): boolean {
  return taskDefinition.preconditions.every((precondition) =>
    session.tasks.some((task) => task.taskKey === precondition && task.status === "completed")
  );
}

function computeSessionStatus(session: OnboardingSessionRecord): OnboardingSessionStatus {
  if (session.tasks.some((task) => task.status === "blocked")) {
    return "blocked";
  }
  if (session.tasks.every((task) => task.status === "completed")) {
    return "completed";
  }
  return "in_progress";
}

function redactSecrets(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (
        key.toLowerCase().includes("key") ||
        key.toLowerCase().includes("secret") ||
        key.toLowerCase().includes("token")
      ) {
        return [key, value ? "[redacted]" : value];
      }
      return [key, value];
    })
  );
}

export function getOnboardingTaskGraph(): OnboardingTaskGraph {
  return onboardingTaskGraph;
}

export function getOnboardingTasksForSegment(segment: BuyerSegment): OnboardingTaskDefinition[] {
  const taskKeys = new Set(getTrackForSegment(segment));
  return onboardingTaskGraph.tasks.filter((task) => taskKeys.has(task.task_id));
}

export function createOnboardingSession(
  input: CreateOnboardingSessionInput
): OnboardingSessionRecord {
  const segmentRecommendation = input.segment ?? recommendBuyerSegment(input).segment;
  const track = getTrackForSegment(segmentRecommendation);
  const tasks: OnboardingTaskRecord[] = track.map((taskKey, index) => ({
    ...buildTaskRecord(taskKey),
    status: index === 0 ? "in_progress" : "pending",
    summary: index === 0 ? "Ready to start." : "Waiting on prerequisites."
  }));

  return {
    id: generateId(),
    workspaceId: input.workspaceId ?? null,
    entryMode: input.entryMode,
    status: "in_progress",
    segmentRecommendation,
    metadata: {},
    startedAt: nowIso(),
    completedAt: null,
    tasks
  };
}

export function getOnboardingProgress(
  session: OnboardingSessionRecord
): OnboardingSessionProgress {
  const completedTaskCount = session.tasks.filter((task) => task.status === "completed").length;
  const blockedTaskCount = session.tasks.filter((task) => task.status === "blocked").length;
  const nextTask =
    session.tasks.find((task) => task.status === "in_progress") ??
    session.tasks.find((task) => task.status === "pending");
  const publishTask = session.tasks.find((task) => task.taskKey === "publish_agent");

  return {
    completedTaskCount,
    blockedTaskCount,
    totalTaskCount: session.tasks.length,
    nextTaskKey: nextTask?.taskKey ?? null,
    canPublish: publishTask?.status === "completed"
  };
}

function promoteNextAvailableTask(session: OnboardingSessionRecord): OnboardingSessionRecord {
  const currentInProgress = session.tasks.some((task) => task.status === "in_progress");

  if (currentInProgress) {
    return session;
  }

  const nextTask = session.tasks.find((task) => {
    if (task.status !== "pending") {
      return false;
    }

    const definition = findTaskDefinition(task.taskKey);
    return definition ? arePreconditionsMet(session, definition) : false;
  });

  if (!nextTask) {
    return {
      ...session,
      status: computeSessionStatus(session),
      completedAt:
        session.tasks.every((task) => task.status === "completed") ? nowIso() : session.completedAt
    };
  }

  return {
    ...session,
    tasks: session.tasks.map((task) =>
      task.id === nextTask.id
        ? {
            ...task,
            status: "in_progress",
            summary: "Ready to start.",
            updatedAt: nowIso()
          }
        : task
    ),
    status: computeSessionStatus(session)
  };
}

function buildTaskOutcome(
  taskKey: string,
  input: Record<string, unknown>
): {
  status: OnboardingTaskStatus;
  output: Record<string, unknown>;
  summary: string;
  error: Record<string, unknown> | null;
  evidence: OnboardingEvidence[];
} {
  switch (taskKey) {
    case "recommend_segment": {
      const recommendation = recommendBuyerSegment(input as SegmentRecommendationInput);
      return {
        status: "completed",
        output: {
          segment_recommendation: recommendation.segment,
          segment_score: recommendation.score,
          breakdown: recommendation.breakdown
        },
        summary: `Recommended ${recommendation.segment} based on onboarding profile score ${recommendation.score}.`,
        error: null,
        evidence: [
          makeSummary("Segment", recommendation.segment),
          {
            kind: "metric",
            label: "Score",
            value: String(recommendation.score)
          }
        ]
      };
    }
    case "create_workspace": {
      const workspaceName = String(input.workspace_name ?? "");
      const agentName = String(input.agent_name ?? "");

      if (!workspaceName || !agentName) {
        return {
          status: "blocked",
          output: {},
          summary: "Workspace and agent names are required.",
          error: { code: "missing_workspace_or_agent_name" },
          evidence: [makeSummary("Blocker", "Provide both workspace and agent names.")]
        };
      }

      return {
        status: "completed",
        output: {
          workspace_status: "ready",
          agent_status: "ready",
          workspace_slug: workspaceName.toLowerCase().replace(/\s+/g, "-"),
          agent_slug: agentName.toLowerCase().replace(/\s+/g, "-"),
          next_recommended_step: "Create the repo and corpus container before importing files."
        },
        summary: `Workspace "${workspaceName}" and agent "${agentName}" are ready. Next create the repo and corpus container.`,
        error: null,
        evidence: [makeSummary("Workspace", workspaceName), makeSummary("Agent", agentName)]
      };
    }
    case "stage_corpus_container": {
      const repository = String(input.repository ?? "");
      const corpusContainer = String(input.corpus_container ?? "");
      const defaultBranch = String(input.default_branch ?? "main");
      const stagingMode = String(input.staging_mode ?? "guided");

      if (!repository || !corpusContainer) {
        return {
          status: "blocked",
          output: {},
          summary: "Repo and corpus staging needs both a repository reference and a container path.",
          error: { code: "missing_repo_container_inputs" },
          evidence: [
            makeSummary(
              "Blocker",
              "Provide the repository and the generated corpus container before moving on."
            )
          ]
        };
      }

      return {
        status: "completed",
        output: {
          container_status: "ready",
          manifest_template: `${corpusContainer.replace(/\/$/, "")}/manifests/import-manifest.template.json`,
          review_queue_status: "awaiting_source_triage",
          repository,
          default_branch: defaultBranch
        },
        summary: `Repo container created for ${repository}. The next step is connecting runtime services, then reviewing a small first batch.`,
        error: null,
        evidence: [
          makeSummary("Repository", repository),
          makeSummary("Container", corpusContainer),
          makeSummary("Mode", stagingMode),
          makeSummary("Branch", defaultBranch)
        ]
      };
    }
    case "connect_supabase": {
      const projectUrl = String(input.project_url ?? "");
      const anonKey = String(input.anon_key ?? "");
      const serviceRoleKey = String(input.service_role_key ?? "");

      if (!projectUrl || !anonKey || !serviceRoleKey) {
        return {
          status: "blocked",
          output: {},
          summary: "Supabase connection is incomplete.",
          error: { code: "missing_supabase_credentials" },
          evidence: [makeSummary("Blocker", "Project URL, anon key, and service role key are required.")]
        };
      }

      return {
        status: "completed",
        output: {
          connection_status: "configured",
          schema_status: "pending_verification",
          project_url: projectUrl,
          next_recommended_step: "Connect a provider and keep the first import in dry-run mode."
        },
        summary: "Supabase credentials are present and ready. The first live write should still wait until source review is complete.",
        error: null,
        evidence: [
          makeSummary("Project URL", projectUrl),
          { kind: "check", label: "Schema", value: "Pending live verification" }
        ]
      };
    }
    case "connect_provider": {
      const provider = String(input.provider ?? "");

      if (!provider) {
        return {
          status: "blocked",
          output: {},
          summary: "A provider selection is required.",
          error: { code: "missing_provider" },
          evidence: [makeSummary("Blocker", "Select at least one provider chain.")]
        };
      }

      return {
        status: "completed",
        output: {
          provider_status: "configured",
          provider_chain: [provider, String(input.model ?? "default")],
          next_recommended_step: "Review and batch sources before importing the first manifest."
        },
        summary: `Provider chain starts with ${provider}. Review and batch a small source set before import.`,
        error: null,
        evidence: [makeSummary("Provider", provider)]
      };
    }
    case "review_sources": {
      const reviewMode = String(input.review_mode ?? "");
      const sourceCount = Number(input.source_count ?? 0);
      const batchCount = Number(input.batch_count ?? 0);
      const oversizedSourceCount = Number(input.oversized_source_count ?? 0);
      const laneAssignments =
        input.lane_assignments && typeof input.lane_assignments === "object"
          ? (input.lane_assignments as Record<string, unknown>)
          : {};

      if (!reviewMode || sourceCount <= 0 || batchCount <= 0) {
        return {
          status: "blocked",
          output: {},
          summary: "Source review needs a review mode, at least one source, and a first batch plan.",
          error: { code: "missing_review_inputs" },
          evidence: [
            makeSummary(
              "Blocker",
              "Capture how sources were reviewed and how many batches the first import should use."
            )
          ]
        };
      }

      if (oversizedSourceCount > 0) {
        return {
          status: "blocked",
          output: {
            review_status: "needs_attention",
            oversized_source_count: oversizedSourceCount
          },
          summary: `${oversizedSourceCount} oversized or risky sources need review before import.`,
          error: { code: "oversized_sources_detected" },
          evidence: [
            { kind: "metric", label: "Oversized sources", value: String(oversizedSourceCount) },
            makeSummary("Blocker", "Remove or split risky files before the first ingest.")
          ]
        };
      }

      return {
        status: "completed",
        output: {
          review_status: "approved",
          seed_plan: {
            review_mode: reviewMode,
            batch_count: batchCount,
            source_count: sourceCount
          },
          safe_import_order: ["knowledge", "code", "product", "context"],
          lane_assignments: laneAssignments
        },
        summary: `Reviewed ${sourceCount} sources and planned ${batchCount} import batch${batchCount === 1 ? "" : "es"}.`,
        error: null,
        evidence: [
          makeSummary("Review mode", reviewMode),
          { kind: "metric", label: "Source count", value: String(sourceCount) },
          { kind: "metric", label: "Batch count", value: String(batchCount) }
        ]
      };
    }
    case "select_theme": {
      const presetId = input.preset_id ? String(input.preset_id) : null;
      const brandColor = input.brand_color ? String(input.brand_color) : null;
      const preset = presetId ? getThemePreset(presetId) : null;
      const theme = preset
        ? { name: preset.label, tokens: preset.tokens }
        : brandColor
          ? buildThemeFromBrandColor("Custom Brand", brandColor)
          : null;

      if (!theme) {
        return {
          status: "blocked",
          output: {},
          summary: "Pick a preset or provide a brand color.",
          error: { code: "missing_theme_input" },
          evidence: [makeSummary("Blocker", "Theme selection needs a preset or brand color.")]
        };
      }

      const accessibility = validateThemeAccessibility(theme.tokens);

      return {
        status: accessibility.passes ? "completed" : "blocked",
        output: {
          theme_status: accessibility.passes ? "ready" : "needs_attention",
          accessibility_status: accessibility.passes ? "pass" : "warn",
          theme_name: theme.name
        },
        summary: accessibility.passes
          ? `Theme "${theme.name}" is ready.`
          : `Theme "${theme.name}" needs accessibility adjustments.`,
        error: accessibility.passes ? null : { code: "theme_accessibility_warning" },
        evidence: [
          makeSummary("Theme", theme.name),
          ...accessibility.warnings.map((warning) => makeSummary("Accessibility", warning))
        ]
      };
    }
    case "import_corpus": {
      const importMode = String(input.import_mode ?? "");
      const sourceCount = Number(input.source_count ?? 0);
      const batchCount = Number(input.batch_count ?? 0);

      if (!importMode || sourceCount <= 0) {
        return {
          status: "blocked",
          output: {},
          summary: "Corpus import needs a source mode and a non-zero source count.",
          error: { code: "missing_import_inputs" },
          evidence: [makeSummary("Blocker", "Add a valid import mode and source count.")]
        };
      }

      return {
        status: "completed",
        output: {
          ingestion_status: "completed",
          lane_coverage: input.lane_assignments ?? {},
          source_count: sourceCount,
          batch_count: batchCount || 1,
          duplicate_report: "pending_followup"
        },
        summary: `Imported ${sourceCount} reviewed sources via ${importMode}${batchCount > 1 ? ` across ${batchCount} batches` : ""}.`,
        error: null,
        evidence: [
          makeSummary("Import mode", importMode),
          { kind: "metric", label: "Source count", value: String(sourceCount) },
          { kind: "metric", label: "Batch count", value: String(batchCount || 1) }
        ]
      };
    }
    case "choose_lane_focus": {
      const laneFocus = String(input.lane_focus ?? "");

      if (!laneFocus) {
        return {
          status: "blocked",
          output: {},
          summary: "Choose a lane before proceeding.",
          error: { code: "missing_lane_focus" },
          evidence: [makeSummary("Blocker", "Lane focus is required.")]
        };
      }

      return {
        status: "completed",
        output: {
          lane_status: "selected",
          next_best_action: `Deepen the ${laneFocus} lane before widening scope.`
        },
        summary: `The ${laneFocus} lane is the first production focus.`,
        error: null,
        evidence: [makeSummary("Lane focus", laneFocus)]
      };
    }
    case "run_evals": {
      const benchmarkCount = Number(input.benchmark_count ?? 0);
      const readinessScore = Number(input.workspace_readiness_score ?? 0);

      if (benchmarkCount <= 0) {
        return {
          status: "blocked",
          output: {},
          summary: "Run at least one benchmark prompt.",
          error: { code: "missing_benchmarks" },
          evidence: [makeSummary("Blocker", "Benchmark count must be greater than zero.")]
        };
      }

      return {
        status: readinessScore >= 60 ? "completed" : "blocked",
        output: {
          evaluation_status: readinessScore >= 60 ? "complete" : "needs_work",
          readiness_score: readinessScore,
          activation_milestones: input.activation_milestones ?? []
        },
        summary:
          readinessScore >= 60
            ? `Evaluations completed with readiness score ${readinessScore}.`
            : `Readiness score ${readinessScore} is below publish threshold.`,
        error: readinessScore >= 60 ? null : { code: "readiness_too_low" },
        evidence: [
          { kind: "metric", label: "Benchmarks", value: String(benchmarkCount) },
          { kind: "metric", label: "Readiness", value: String(readinessScore) }
        ]
      };
    }
    case "configure_governance": {
      const policyPack = String(input.policy_pack ?? "");
      const retentionRule = String(input.retention_rule ?? "");

      if (!policyPack || !retentionRule) {
        return {
          status: "blocked",
          output: {},
          summary: "Enterprise governance needs a policy pack and retention rule.",
          error: { code: "missing_governance_inputs" },
          evidence: [makeSummary("Blocker", "Set both policy and retention posture.")]
        };
      }

      return {
        status: "completed",
        output: {
          governance_status: "configured",
          policy_status: "active"
        },
        summary: "Governance controls are staged for rollout.",
        error: null,
        evidence: [makeSummary("Policy pack", policyPack), makeSummary("Retention", retentionRule)]
      };
    }
    case "publish_agent": {
      const readinessScore = Number(input.readiness_score ?? 0);
      const publishTarget = String(input.publish_target ?? "");

      if (!publishTarget) {
        return {
          status: "blocked",
          output: {},
          summary: "Choose a publish target before going live.",
          error: { code: "missing_publish_target" },
          evidence: [makeSummary("Blocker", "Publish target is required.")]
        };
      }

      if (readinessScore < 70) {
        return {
          status: "blocked",
          output: {
            publish_status: "blocked",
            readiness_score: readinessScore
          },
          summary: `Readiness score ${readinessScore} is below go-live threshold.`,
          error: { code: "publish_readiness_too_low" },
          evidence: [makeSummary("Blocker", "Raise readiness to at least 70 before publishing.")]
        };
      }

      return {
        status: "completed",
        output: {
          publish_status: "ready",
          go_live_summary: `Ready to publish to ${publishTarget}.`
        },
        summary: `Ready to publish to ${publishTarget}.`,
        error: null,
        evidence: [
          { kind: "metric", label: "Readiness", value: String(readinessScore) },
          makeSummary("Target", publishTarget)
        ]
      };
    }
    default:
      return {
        status: "completed",
        output: input,
        summary: "Task completed.",
        error: null,
        evidence: [makeSummary("Task", taskKey)]
      };
  }
}

export function executeOnboardingTask(
  session: OnboardingSessionRecord,
  taskKey: string,
  input: Record<string, unknown>
): OnboardingExecutionResult {
  const definition = findTaskDefinition(taskKey);

  if (!definition) {
    throw new Error(`Unknown onboarding task: ${taskKey}`);
  }

  if (!arePreconditionsMet(session, definition)) {
    throw new Error(`Task ${taskKey} cannot run before its preconditions are completed.`);
  }

  const outcome = buildTaskOutcome(taskKey, input);
  const updatedSession = promoteNextAvailableTask({
    ...session,
    tasks: session.tasks.map((task) =>
      task.taskKey === taskKey
        ? {
            ...task,
            status: outcome.status,
            input: redactSecrets(input),
            output: outcome.output,
            summary: outcome.summary,
            error: outcome.error,
            evidence: outcome.evidence,
            updatedAt: nowIso()
          }
        : task
    ),
    status: outcome.status === "blocked" ? "blocked" : session.status,
    completedAt: null
  });

  const task = updatedSession.tasks.find((entry) => entry.taskKey === taskKey);

  if (!task) {
    throw new Error(`Task ${taskKey} vanished during update.`);
  }

  return {
    session: {
      ...updatedSession,
      status: computeSessionStatus(updatedSession),
      completedAt:
        updatedSession.tasks.every((entry) => entry.status === "completed") ? nowIso() : null
    },
    task,
    nextTaskKeys: definition.next.filter((nextTaskKey) =>
      updatedSession.tasks.some((entry) => entry.taskKey === nextTaskKey)
    )
  };
}

export function resumeOnboardingSession(
  session: OnboardingSessionRecord
): OnboardingTaskRecord | null {
  return (
    session.tasks.find((task) => task.status === "in_progress") ??
    session.tasks.find((task) => task.status === "pending") ??
    null
  );
}

export function buildOnboardingSupportBundle(session: OnboardingSessionRecord): {
  sessionId: string;
  status: OnboardingSessionStatus;
  segmentRecommendation: BuyerSegment;
  blockers: Array<{ taskKey: string; summary: string; error: Record<string, unknown> | null }>;
  nextTask: string | null;
  tasks: OnboardingTaskRecord[];
} {
  return {
    sessionId: session.id,
    status: session.status,
    segmentRecommendation: session.segmentRecommendation,
    blockers: session.tasks
      .filter((task) => task.status === "blocked")
      .map((task) => ({
        taskKey: task.taskKey,
        summary: task.summary,
        error: task.error
      })),
    nextTask: resumeOnboardingSession(session)?.taskKey ?? null,
    tasks: session.tasks.map((task) => ({
      ...task,
      input: redactSecrets(task.input),
      output: redactSecrets(task.output)
    }))
  };
}
