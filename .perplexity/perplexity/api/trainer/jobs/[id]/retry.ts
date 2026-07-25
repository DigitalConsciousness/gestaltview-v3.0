import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerAdmin,
} from "../../_helpers.js";
import {
  getTrainerQueueSnapshot,
  retryTrainerJob,
} from "../../../../server/agent-trainer/persistence.js";

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

  try {
    const jobId = extractRouteParam(req.query.id, "id");
    const run = await retryTrainerJob(jobId);
    if (!run) {
      sendJson(res, 404, { error: "Trainer job not found." });
      return;
    }

    const queue = await getTrainerQueueSnapshot(run.runId).catch(() => ({
      jobStatus: run.job?.status ?? null,
      workerOnline: null,
      oldestQueuedAgeMs: null,
    }));

    sendJson(res, 200, {
      ok: true,
      run,
      deleted: false,
      runId: run.runId,
      receipt: {
        code: "job_requeued",
        message: "Job moved back into the queue.",
        eventId: null,
        createdAt: new Date().toISOString(),
      },
      queue,
      blocker: null,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to retry trainer job.",
    });
  }
}
