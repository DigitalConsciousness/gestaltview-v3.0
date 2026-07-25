import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { handleTrainerOptions, requireTrainerAdmin } from "./_helpers.js";
import { listTrainerAgents } from "../../server/agent-trainer/persistence.js";

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
    const agents = await listTrainerAgents();
    sendJson(res, 200, { agents });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Failed to list agents." });
  }
}
