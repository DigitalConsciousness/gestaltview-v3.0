import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import { prepareJsonRoute } from "../../gen-engine/_shared.js";
import { getCodexJob } from "../_persistence.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["GET"])) {
    return;
  }

  const jobId = String(req.query.jobId ?? "");
  const job = await getCodexJob(jobId);

  if (!job) {
    sendJson(res, 404, { error: "codex_job_not_found" });
    return;
  }

  sendJson(res, 200, { job });
}
