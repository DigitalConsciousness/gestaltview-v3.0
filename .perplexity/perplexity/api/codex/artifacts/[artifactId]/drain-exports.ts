import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import { prepareJsonRoute } from "../../../gen-engine/_shared.js";
import { getCodexArtifact, listCodexJobsForArtifact } from "../../_persistence.js";
import { runCodexExportJob } from "../../../../workers/codex/runner.js";

const DRAINABLE_FORMATS = new Set(["html", "json"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const artifactId = String(req.query.artifactId ?? "");
  const record = await getCodexArtifact(artifactId);

  if (!record) {
    sendJson(res, 404, { error: "codex_artifact_not_found" });
    return;
  }

  const jobs = await listCodexJobsForArtifact(artifactId);
  const runnable = jobs.filter(
    (job) =>
      DRAINABLE_FORMATS.has(job.format) &&
      (job.status === "pending" || job.status === "pending_retry" || job.status === "failed"),
  );
  const results = [];

  for (const job of runnable) {
    try {
      results.push(await runCodexExportJob(job.id));
    } catch (error) {
      results.push({
        job: {
          ...job,
          status: "failed",
          error: error instanceof Error ? error.message : "Codex export failed.",
        },
        artifactId,
      });
    }
  }

  const refreshed = await getCodexArtifact(artifactId);
  sendJson(res, 200, {
    status: results.some((result) => result.job.status === "failed") ? "partial" : "drained",
    artifact: refreshed?.artifact ?? record.artifact,
    manifest: refreshed?.artifact.exports ?? record.artifact.exports,
    jobs: await listCodexJobsForArtifact(artifactId),
    results,
  });
}
