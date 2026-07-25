import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import {
  handleTrainerOptions,
  requireTrainerAdmin,
  shouldInlineTrainerExecution,
} from "../_helpers.js";
import {
  createTrainingRun,
  getTrainerQueueSnapshot,
  listRecentTrainingRuns,
  settleTrainerJobsForRun,
  TrainerConflictError,
} from "../../../server/agent-trainer/persistence.js";
import { runTraining } from "../../../server/agent-trainer/orchestrator.js";
import { SubmitTrainingRunRequestSchema } from "../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "POST"])) {
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method === "GET") {
      const runs = await listRecentTrainingRuns();
      sendJson(res, 200, { runs });
      return;
    }

    if (req.method === "POST") {
      const input = SubmitTrainingRunRequestSchema.parse(req.body ?? {});
      let run;
      try {
        run = await createTrainingRun(input, admin.id);
      } catch (error) {
        if (error instanceof TrainerConflictError) {
          sendJson(res, 409, {
            ok: false,
            run: null,
            deleted: false,
            runId: null,
            receipt: {
              code: "run_blocked",
              message: error.blocker.reason,
              eventId: null,
              createdAt: new Date().toISOString(),
            },
            queue: {
              jobStatus: null,
              workerOnline: null,
              oldestQueuedAgeMs: null,
            },
            blocker: error.blocker,
          });
          return;
        }
        throw error;
      }
      const queue = await getTrainerQueueSnapshot(run.runId).catch(() => ({
        jobStatus: run.job?.status ?? "queued",
        workerOnline: null,
        oldestQueuedAgeMs: null,
      }));

      if (shouldInlineTrainerExecution()) {
        void runTraining(run.runId)
          .then(async (result) => {
            await settleTrainerJobsForRun({
              runId: run.runId,
              status: result.status === "cancelled" ? "cancelled" : "done",
            });
          })
          .catch(async (error) => {
            console.error("[trainer][inline-run] failed", error);

            try {
              await settleTrainerJobsForRun({
                runId: run.runId,
                status: "failed",
                errorMessage: error instanceof Error ? error.message : String(error),
              });
            } catch (jobError) {
              console.error("[trainer][inline-run] could not update queued job", jobError);
            }
          });
      }

      sendJson(res, 202, {
        ok: true,
        run,
        deleted: false,
        runId: run.runId,
        receipt: {
          code: "run_queued",
          message: "Run queued and waiting for worker claim.",
          eventId: null,
          createdAt: new Date().toISOString(),
        },
        queue,
        blocker: null,
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Trainer request failed." });
  }
}
