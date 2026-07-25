import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../../../_helpers.js";
import {
  updateTrainerPolicyFlag,
} from "../../../../../server/trainer/experiment-repository.js";
import {
  UpdateTrainerPolicyFlagRequestSchema,
} from "../../../../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["PATCH"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method !== "PATCH") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const experimentId = extractRouteParam(req.query.id, "id");
    const flagId = extractRouteParam(req.query.flagId, "flagId");
    const input = UpdateTrainerPolicyFlagRequestSchema.parse(req.body ?? {});
    const experiment = await updateTrainerPolicyFlag(experimentId, flagId, input);
    sendJson(res, 200, { experiment });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to update trainer policy flag.",
    });
  }
}
