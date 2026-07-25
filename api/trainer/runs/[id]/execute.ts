import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerAdmin,
} from "../../_helpers.js";
import {
  getTrainerQueueSnapshot,
  getTrainingRunDetail,
  settleTrainerJobsForRun,
} from "../../../../server/agent-trainer/persistence.js";
import { runTraining } from "../../../../server/agent-trainer/orchestrator.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["POST"])) {
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  const runId = extractRouteParam(req.query.id, "id");

  try {
    const existingRun = await getTrainingRunDetail(runId);
    if (existingRun.status !== "queued") {
      sendJson(res, 200, {
        ok: true,
        run: existingRun,
        deleted: false,
        runId,
        receipt: {
          code: "run_already_started",
          message: "Run is no longer queued; showing the latest state.",
          eventId: null,
          createdAt: new Date().toISOString(),
        },
        queue: {
          jobStatus: existingRun.job?.status ?? null,
          workerOnline: null,
          oldestQueuedAgeMs: null,
        },
        blocker: null,
      });
      return;
    }

    const run = await runTraining(runId);
    await settleTrainerJobsForRun({
      runId,
      status: run.status === "cancelled" ? "cancelled" : "done",
    });
    const queue = await getTrainerQueueSnapshot(runId).catch(() => ({
      jobStatus: run.job?.status ?? null,
      workerOnline: null,
      oldestQueuedAgeMs: null,
    }));
    sendJson(res, 200, {
      ok: true,
      run,
      deleted: false,
      runId,
      receipt: {
        code: run.status === "cancelled" ? "run_cancelled" : "run_executed",
        message:
          run.status === "cancelled"
            ? "Run stopped after a cancel request."
            : "Queued run started immediately.",
        eventId: null,
        createdAt: new Date().toISOString(),
      },
      queue,
      blocker: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to execute queued run.";

    try {
      await settleTrainerJobsForRun({
        runId,
        status: "failed",
        errorMessage: message,
      });
    } catch (jobError) {
      console.error("[trainer][execute] could not update queued job", jobError);
    }

    sendJson(res, 500, { error: message });
  }
}
