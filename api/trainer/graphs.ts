import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { handleTrainerOptions, requireTrainerGovernanceAdmin } from "./_helpers.js";
import {
  getTrainerExperimentGraph,
  upsertTrainerExperimentGraph,
} from "../../server/trainer/hyperagent-repository.js";
import { TrainerExperimentGraphSchema } from "../../shared/agent-trainer/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET", "POST"])) return;

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) return;

  try {
    if (req.method === "GET") {
      const experimentId = typeof req.query.experimentId === "string" ? req.query.experimentId : "";
      if (!experimentId) {
        sendJson(res, 400, { error: "experimentId is required" });
        return;
      }

      const graph = await getTrainerExperimentGraph(experimentId);
      sendJson(res, 200, { graph });
      return;
    }

    if (req.method === "POST") {
      const input = TrainerExperimentGraphSchema.parse(req.body ?? {});
      const graph = await upsertTrainerExperimentGraph(input);
      sendJson(res, 200, { graph });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Trainer graph request failed.",
    });
  }
}
