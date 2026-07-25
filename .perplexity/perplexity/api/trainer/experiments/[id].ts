import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../_helpers.js";
import {
  getTrainerExperimentDetail,
  updateTrainerExperiment,
} from "../../../server/trainer/experiment-repository.js";
import { UpdateTrainerExperimentRequestSchema } from "../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "PATCH"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const experimentId = extractRouteParam(req.query.id, "id");

    if (req.method === "GET") {
      const experiment = await getTrainerExperimentDetail(experimentId);
      sendJson(res, 200, { experiment });
      return;
    }

    if (req.method === "PATCH") {
      const input = UpdateTrainerExperimentRequestSchema.parse(req.body ?? {});
      const experiment = await updateTrainerExperiment(experimentId, input);
      sendJson(res, 200, { experiment });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Trainer experiment request failed.",
    });
  }
}
