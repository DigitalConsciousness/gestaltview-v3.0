import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import { handleTrainerOptions, requireTrainerAdmin } from "../_helpers.js";
import { listTrainerStudySources } from "../../../server/agent-trainer/study-sources.js";

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
    const studySources = await listTrainerStudySources();
    sendJson(res, 200, { ok: true, degraded: false, studySources });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      degraded: true,
      reason: "trainer_study_sources_unavailable",
      error: error instanceof Error ? error.message : "Failed to list trainer study sources.",
    });
  }
}
