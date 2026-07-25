import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { handleTrainerOptions, requireTrainerAdmin } from "./_helpers.js";
import { listTrainerScenarioSets } from "../../server/agent-trainer/persistence.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET"])) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const scenarioSets = await listTrainerScenarioSets();
    sendJson(res, 200, { scenarioSets });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to list scenario sets.",
    });
  }
}
