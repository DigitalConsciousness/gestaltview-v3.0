import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import { extractRouteParam, handleTrainerOptions, requireTrainerAdmin } from "../../_helpers.js";
import {
  deployAgentVersion,
  getTrainerQueueSnapshot,
} from "../../../../server/agent-trainer/persistence.js";
import { DeployAgentVersionRequestSchema } from "../../../../shared/agent-trainer/schemas.js";

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
    const input = DeployAgentVersionRequestSchema.parse(req.body ?? {});
    const run = await deployAgentVersion({
      runId,
      versionId: input.versionId,
      storagePath: input.storagePath,
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
        code: "run_deployed",
        message: "Deployment artifact generated for the approved version.",
        eventId: null,
        createdAt: new Date().toISOString(),
      },
      queue,
      blocker: null,
    });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Failed to deploy version." });
  }
}
