import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerAdmin,
} from "../../_helpers.js";
import {
  getTrainerQueueSnapshot,
  requestTrainingRunCancel,
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
    const runId = extractRouteParam(req.query.id, "id");
    const run = await requestTrainingRunCancel(runId, admin.id);
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
        code: run.status === "cancelled" ? "run_cancelled" : "run_cancel_requested",
        message:
          run.status === "cancelled"
            ? "Run cancelled before worker execution started."
            : "Cancel requested. Worker will stop after the current stage.",
        eventId: null,
        createdAt: new Date().toISOString(),
      },
      queue,
      blocker: null,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to request trainer run cancellation.",
    });
  }
}
