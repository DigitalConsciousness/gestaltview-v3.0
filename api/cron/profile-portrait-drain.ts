// api/cron/profile-portrait-drain.ts
// Profile Portrait Drain Cron — GestaltView v2
//
// Drains portrait_inference_queue rows, builds the next portrait version from
// live evidence, and persists the validated portrait + dimensions rows.

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { loadProfilePortraitForUser, loadLatestPortraitForUser } from "../_lib/profilePortrait.js";
import {
  claimPortraitQueueJob,
  createPortraitInferenceRun,
  listQueuedPortraitJobs,
  makePortraitInferenceRunId,
  persistPortraitArtifact,
  updatePortraitInferenceRun,
  updatePortraitQueueJob,
} from "../_lib/profilePortraitPersistence.js";
import { invokeRpc } from "../_lib/supabase.js";

const BATCH_SIZE = 5;
const MAX_DURATION_MS = 50_000;

type PortraitSignalCountRow = {
  memory_entry_count: number;
  bucket_drop_count: number;
  fragment_count: number;
  gravity_report_count: number;
  agent_memory_count: number;
  total_count: number;
};

type DrainResult = {
  jobId: string;
  userId: string;
  triggeredBy: "cadence" | "threshold" | "manual";
  outcome: "completed" | "failed" | "skipped_timeout" | "skipped_claimed" | "insufficient_data";
  portraitId?: string;
  portraitVersion?: number;
  runId?: string;
  error?: string;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status);
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function isAuthorized(req: VercelRequest): boolean {
  const isCronHeader = req.headers["x-vercel-cron"] === "1";
  const cronSchedule = req.headers["x-vercel-cron-schedule"];
  const isCronSchedule = typeof cronSchedule === "string" && cronSchedule.length > 0;
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization;
  const isBearerMatch = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;
  return isCronHeader || isCronSchedule || isBearerMatch || process.env.NODE_ENV !== "production";
}

function emptySignalCounts(): PortraitSignalCountRow {
  return {
    memory_entry_count: 0,
    bucket_drop_count: 0,
    fragment_count: 0,
    gravity_report_count: 0,
    agent_memory_count: 0,
    total_count: 0,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "unauthorized" });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    sendJson(res, 500, { error: "supabase_config_missing" });
    return;
  }

  const startedAt = Date.now();
  const results: DrainResult[] = [];

  try {
    const queuedJobs = await listQueuedPortraitJobs(BATCH_SIZE);

    if (queuedJobs.length === 0) {
      sendJson(res, 200, { status: "idle", processed: 0, results: [] });
      return;
    }

    for (const job of queuedJobs) {
      if (Date.now() - startedAt > MAX_DURATION_MS) {
        results.push({
          jobId: job.id,
          userId: job.user_id,
          triggeredBy: job.triggered_by,
          outcome: "skipped_timeout",
        });
        continue;
      }

      const claimed = await claimPortraitQueueJob(job.id);
      if (!claimed) {
        results.push({
          jobId: job.id,
          userId: job.user_id,
          triggeredBy: job.triggered_by,
          outcome: "skipped_claimed",
        });
        continue;
      }

      const runId = makePortraitInferenceRunId();
      const runStartedAt = Date.now();
      const runCreated = await createPortraitInferenceRun({
        id: runId,
        user_id: claimed.user_id,
        triggered_by: claimed.triggered_by,
        status: "running",
        portrait_id: null,
        input_record_count: 0,
        input_window_start: null,
        input_window_end: null,
        llm_provider_used: "local-deterministic",
        llm_model_used: "profile-portrait-v1",
        prompt_tokens: null,
        completion_tokens: null,
        validation_passed: null,
        validation_errors: {},
        error_message: null,
        duration_ms: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });

      if (!runCreated) {
        await updatePortraitQueueJob(claimed.id, {
          status: "failed",
          completed_at: new Date().toISOString(),
          run_id: runId,
        });
        results.push({
          jobId: claimed.id,
          userId: claimed.user_id,
          triggeredBy: claimed.triggered_by,
          runId,
          outcome: "failed",
          error: "run_insert_failed",
        });
        continue;
      }

      await updatePortraitQueueJob(claimed.id, { run_id: runId });

      const countRows = await invokeRpc<PortraitSignalCountRow[]>("get_portrait_signal_count", {
        p_user_id: claimed.user_id,
      }).catch(() => []);
      const signalCounts = countRows[0] ?? emptySignalCounts();
      const completedAt = new Date().toISOString();

      if (signalCounts.total_count < 15 || signalCounts.bucket_drop_count < 1) {
        await updatePortraitInferenceRun(runId, {
          status: "insufficient_data",
          input_record_count: signalCounts.total_count,
          validation_passed: false,
          validation_errors: {
            reason: "insufficient_data",
            minimum_required: 15,
            current: signalCounts.total_count,
            bucket_drop_count: signalCounts.bucket_drop_count,
          },
          error_message: "Portrait inference skipped because the signal threshold was not met.",
          duration_ms: Date.now() - runStartedAt,
          completed_at: completedAt,
        });
        await updatePortraitQueueJob(claimed.id, {
          status: "skipped",
          completed_at: completedAt,
          run_id: runId,
        });
        results.push({
          jobId: claimed.id,
          userId: claimed.user_id,
          triggeredBy: claimed.triggered_by,
          runId,
          outcome: "insufficient_data",
        });
        continue;
      }

      const previousPortrait = await loadLatestPortraitForUser(claimed.user_id);
      const portrait = await loadProfilePortraitForUser(
        claimed.user_id,
        undefined,
        claimed.triggered_by,
        previousPortrait,
        runId,
      );

      const persistedPortrait = await persistPortraitArtifact({
        ...portrait,
        inferenceRunId: runId,
        inferenceTriggeredBy: claimed.triggered_by,
      });

      if (!persistedPortrait) {
        await updatePortraitInferenceRun(runId, {
          status: "failed",
          input_record_count: signalCounts.total_count,
          input_window_start: portrait.sourceWindowStart,
          input_window_end: portrait.sourceWindowEnd,
          validation_passed: false,
          validation_errors: { reason: "persist_failed" },
          error_message: "Portrait persistence failed.",
          duration_ms: Date.now() - runStartedAt,
          completed_at: completedAt,
        });
        await updatePortraitQueueJob(claimed.id, {
          status: "failed",
          completed_at: completedAt,
          run_id: runId,
        });
        results.push({
          jobId: claimed.id,
          userId: claimed.user_id,
          triggeredBy: claimed.triggered_by,
          runId,
          outcome: "failed",
          error: "persist_failed",
        });
        continue;
      }

      await updatePortraitInferenceRun(runId, {
        status: "completed",
        portrait_id: persistedPortrait.id,
        input_record_count: signalCounts.total_count,
        input_window_start: portrait.sourceWindowStart,
        input_window_end: portrait.sourceWindowEnd,
        validation_passed: true,
        validation_errors: {},
        error_message: null,
        duration_ms: Date.now() - runStartedAt,
        completed_at: completedAt,
      });
      await updatePortraitQueueJob(claimed.id, {
        status: "completed",
        completed_at: completedAt,
        run_id: runId,
      });

      results.push({
        jobId: claimed.id,
        userId: claimed.user_id,
        triggeredBy: claimed.triggered_by,
        runId,
        portraitId: persistedPortrait.id,
        portraitVersion: persistedPortrait.version,
        outcome: "completed",
      });
    }

    sendJson(res, 200, {
      status: "drained",
      processed: results.length,
      completed: results.filter((result) => result.outcome === "completed").length,
      insufficientData: results.filter((result) => result.outcome === "insufficient_data").length,
      failed: results.filter((result) => result.outcome === "failed").length,
      skipped: results.filter((result) => result.outcome === "skipped_timeout" || result.outcome === "skipped_claimed").length,
      durationMs: Date.now() - startedAt,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendJson(res, 500, {
      error: "profile_portrait_drain_failed",
      detail: message,
      processed: results.length,
      results,
    });
  }
}
