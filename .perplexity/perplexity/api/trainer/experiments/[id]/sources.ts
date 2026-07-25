import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../../_helpers.js";
import {
  attachTrainerExperimentSource,
} from "../../../../server/trainer/experiment-repository.js";
import {
  AttachTrainerExperimentSourceRequestSchema,
} from "../../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["POST"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const experimentId = extractRouteParam(req.query.id, "id");
    const input = AttachTrainerExperimentSourceRequestSchema.parse(req.body ?? {});
    const experiment = await attachTrainerExperimentSource(experimentId, input);
    sendJson(res, 200, { experiment });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to attach experiment source.",
    });
  }
}
