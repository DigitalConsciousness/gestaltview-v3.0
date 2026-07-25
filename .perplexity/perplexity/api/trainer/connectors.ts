import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { handleTrainerOptions, requireTrainerGovernanceAdmin } from "./_helpers.js";
import { listTrainerConnectors } from "../../server/trainer/hyperagent-repository.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET"])) return;

  const admin = await requireTrainerGovernanceAdmin(req, res);
  if (!admin) return;

  try {
    if (req.method === "GET") {
      const connectors = await listTrainerConnectors();
      sendJson(res, 200, { connectors });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Trainer connectors request failed.",
    });
  }
}
