import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import {
  handleTrainerOptions,
  requireTrainerGovernanceAdmin,
} from "./_helpers.js";
import {
  createTrainerExperiment,
  listTrainerExperiments,
} from "../../server/trainer/experiment-repository.js";
import {
  CreateTrainerExperimentRequestSchema,
} from "../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "POST"])) {
    return;
  }

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    if (req.method === "GET") {
      const experiments = await listTrainerExperiments();
      sendJson(res, 200, { experiments });
      return;
    }

    if (req.method === "POST") {
      const input = CreateTrainerExperimentRequestSchema.parse(req.body ?? {});
      const experiment = await createTrainerExperiment(input, admin.email || "Keith");
      sendJson(res, 201, { experiment });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Trainer experiments request failed.",
    });
  }
}
