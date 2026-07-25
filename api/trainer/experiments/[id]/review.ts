import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import {
  extractRouteParam,
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "../../_helpers.js";
import {
  createTrainerReviewDecision,
  getTrainerExperimentDetail,
} from "../../../../server/trainer/experiment-repository.js";
import {
  CreateTrainerReviewDecisionRequestSchema,
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
    const input = CreateTrainerReviewDecisionRequestSchema.parse(req.body ?? {});
    const experiment = await getTrainerExperimentDetail(experimentId);
    const unresolvedBlockingFlags = experiment.flags.filter(
      (flag) => flag.severity === "blocking" && !flag.resolved
    );

    if (
      (input.decision === "approved" || input.decision === "promote_kit") &&
      unresolvedBlockingFlags.length > 0
    ) {
      sendJson(res, 409, {
        error: "Blocking policy flags must be resolved before approve or promote_kit decisions.",
        unresolvedFlags: unresolvedBlockingFlags,
      });
      return;
    }

    const updated = await createTrainerReviewDecision(
      experimentId,
      input,
      admin.email || "Keith"
    );
    sendJson(res, 200, { experiment: updated });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to record trainer review decision.",
    });
  }
}
