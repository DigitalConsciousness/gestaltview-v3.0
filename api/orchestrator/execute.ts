import type { VercelRequest, VercelResponse } from "@vercel/node";

import {
  buildWorkerPlan,
  decideOrchestration,
  executeOrchestration,
  type OrchestrationInput,
  type OrchestrationTrigger,
} from "../../shared/orchestration/index.js";
import { insertRow } from "../_lib/supabase.js";
import { prepareJsonRoute, readBody } from "../gen-engine/_shared.js";
import { sendJson } from "../_lib/response.js";

type OrchestratorExecuteBody = Partial<OrchestrationInput> & {
  autoSpawn?: boolean;
  gateState?: "auto" | "approval";
};

type OrchestratorExecuteInput = OrchestrationInput & {
  autoSpawn?: boolean;
  gateState?: "auto" | "approval";
};

function trimPreview(value: string, maxLength = 220): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  );
}

function validateInput(body: OrchestratorExecuteBody): OrchestratorExecuteInput {
  if (!body.trigger) {
    throw new Error("Missing required field: trigger");
  }

  if (!body.sourceRoom) {
    throw new Error("Missing required field: sourceRoom");
  }

  return {
    ...body,
    trigger: body.trigger as OrchestrationTrigger,
    sourceRoom: body.sourceRoom,
    contextClues: Array.isArray(body.contextClues) ? body.contextClues : [],
    sourceCaptureIds: Array.isArray(body.sourceCaptureIds) ? body.sourceCaptureIds : [],
    sourceArtifactIds: Array.isArray(body.sourceArtifactIds) ? body.sourceArtifactIds : [],
  };
}

function buildInputSnapshot(input: OrchestratorExecuteInput): Record<string, unknown> {
  return {
    trigger: input.trigger,
    sourceRoom: input.sourceRoom,
    title: input.title ?? null,
    textExcerpt: input.text ? trimPreview(input.text) : null,
    artifactIntent: input.artifactIntent ?? null,
    energyLevel: typeof input.energyLevel === "number" ? input.energyLevel : null,
    contextClues: input.contextClues ?? [],
    sourceCaptureIds: input.sourceCaptureIds ?? [],
    sourceArtifactIds: input.sourceArtifactIds ?? [],
    hasImage: Boolean(input.hasImage),
    hasAudio: Boolean(input.hasAudio),
    hasVideo: Boolean(input.hasVideo),
    hasFile: Boolean(input.hasFile),
    consent: input.consent ?? null,
    metaKeys: Object.keys(input.meta ?? {}),
    autoSpawn: typeof input.autoSpawn === "boolean" ? input.autoSpawn : null,
    gateState: input.gateState ?? null,
  };
}

async function persistExecution(
  runId: string,
  input: OrchestratorExecuteInput,
  decision: ReturnType<typeof decideOrchestration>,
  spawnMode: "auto" | "approval",
  execution: ReturnType<typeof executeOrchestration>,
): Promise<boolean> {
  const startedAt = execution.receipts[0]?.startedAt ?? new Date().toISOString();
  const completedAt = execution.receipts.at(-1)?.completedAt ?? startedAt;
  const failedReceipts = execution.receipts.filter(
    (receipt) => receipt.status === "failed" || receipt.status === "skipped",
  );

  await insertRow("orchestration_runs", {
    run_id: runId,
    decision_id: decision.decisionId,
    user_id: isUuid(input.userId) ? input.userId : null,
    trigger: decision.trigger,
    source_room: decision.sourceRoom,
    content_kind: decision.contentKind,
    spawn_mode: spawnMode,
    gate_state: spawnMode,
    worker_count: execution.receipts.length,
    run_status: execution.status,
    input_payload: buildInputSnapshot(input),
    decision_payload: decision,
    execution_payload: {
      presentation: execution.presentation,
      output: execution.output,
    },
    error_summary:
      failedReceipts.length > 0
        ? failedReceipts.map((receipt) => `${receipt.label}: ${receipt.error ?? receipt.status}`).join(" | ")
        : null,
    started_at: startedAt,
    completed_at: completedAt,
    updated_at: completedAt,
  });

  for (const receipt of execution.receipts) {
    await insertRow("orchestration_worker_runs", {
      run_id: runId,
      worker_id: receipt.workerId,
      label: receipt.label,
      status: receipt.status,
      summary: receipt.summary,
      depends_on: receipt.dependsOn,
      result_payload: receipt.result,
      error_summary: receipt.error ?? null,
      started_at: receipt.startedAt,
      completed_at: receipt.completedAt,
      duration_ms: receipt.durationMs,
      updated_at: receipt.completedAt,
    });
  }

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  try {
    const body = readBody<OrchestratorExecuteBody>(req);
    const input = validateInput(body);
    const decision = decideOrchestration(input);
    const workerPlan = buildWorkerPlan({
      sourceRoom: input.sourceRoom,
      trigger: input.trigger,
      contentKind: decision.contentKind,
      autoSpawn: input.autoSpawn,
      gateState: input.gateState,
      shouldForgeArtifact: decision.shouldForgeArtifact,
      shouldUpdateProfile: decision.shouldUpdateProfile,
      shouldUpdateScaffold: decision.shouldUpdateScaffold,
    });
    const execution = executeOrchestration({ input, decision, plan: workerPlan });
    const runId = `orch-run-${decision.decisionId}`;
    const persisted = await persistExecution(runId, input, decision, workerPlan.spawnMode, execution);

    sendJson(res, execution.status === "failed" ? 422 : 200, {
      runId,
      decision,
      spawnMode: workerPlan.spawnMode,
      workers: execution.receipts,
      status: execution.status,
      presentation: execution.presentation,
      output: execution.output,
      diagnostics: {
        route: "/api/orchestrator/execute",
        deterministic: true,
        llmCalled: false,
        persisted,
        presentationAllowed: execution.presentation.allowed,
      },
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid orchestration execution request",
    });
  }
}
