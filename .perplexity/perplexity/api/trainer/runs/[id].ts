import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

import { sendJson } from "../../_lib/response.js";
import { extractRouteParam, handleTrainerOptions, requireTrainerAdmin } from "../_helpers.js";
import {
  cancelTrainingRun,
  getTrainerQueueSnapshot,
  getTrainingRunDetail,
  purgeTrainingRun,
} from "../../../server/agent-trainer/persistence.js";

const DeleteTrainingRunRequestSchema = z.object({
  mode: z.enum(["delete", "purge"]).default("delete"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "DELETE"])) {
    return;
  }

  if (req.method !== "GET" && req.method !== "DELETE") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const runId = extractRouteParam(req.query.id, "id");

    if (req.method === "GET") {
      const run = await getTrainingRunDetail(runId);
      sendJson(res, 200, { run });
      return;
    }

    const input = DeleteTrainingRunRequestSchema.parse(req.body ?? {});
    if (input.mode === "purge") {
      await purgeTrainingRun(runId);
      sendJson(res, 200, {
        ok: true,
        run: null,
        deleted: true,
        runId,
        receipt: {
          code: "run_purged",
          message: "Run purged and removed from the current queue view.",
          eventId: null,
          createdAt: new Date().toISOString(),
        },
        queue: {
          jobStatus: null,
          workerOnline: null,
          oldestQueuedAgeMs: null,
        },
        blocker: null,
      });
      return;
    }

    const run = await cancelTrainingRun(runId);
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
        code: "run_cancelled",
        message: "Run cancelled and moved out of the active queue.",
        eventId: null,
        createdAt: new Date().toISOString(),
      },
      queue,
      blocker: null,
    });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Failed to load run." });
  }
}
