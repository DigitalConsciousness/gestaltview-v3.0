import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import { prepareJsonRoute } from "../../../gen-engine/_shared.js";
import { runCodexExportJob } from "../../../../workers/codex/runner.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  try {
    const jobId = String(req.query.jobId ?? "");
    const result = await runCodexExportJob(jobId);

    sendJson(res, 200, {
      status: "ready",
      job: result.job,
      manifestItem: result.manifestItem,
      artifactId: result.artifactId,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Codex export failed.";
    const status = detail === "codex_job_not_found" || detail === "codex_artifact_not_found" ? 404 : 422;
    sendJson(res, status, {
      error: status === 404 ? detail : "codex_export_failed",
      detail,
    });
  }
}
