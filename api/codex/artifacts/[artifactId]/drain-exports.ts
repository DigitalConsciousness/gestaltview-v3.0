import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import { prepareJsonRoute } from "../../../gen-engine/_shared.js";
import { ensureCodexExportJobsForArtifact, getCodexArtifact, listCodexJobsForArtifact } from "../../_persistence.js";
import { runCodexExportJob } from "../../../../workers/codex/runner.js";

const DRAINABLE_FORMATS = new Set(["html", "json"]);
const STALE_RUNNING_JOB_MS = Number(process.env.CODEX_STALE_RUNNING_JOB_MS ?? 15 * 60 * 1000);

function isRunnableJob(job: { format: string; status: string; updatedAt: string }): boolean {
  if (!DRAINABLE_FORMATS.has(job.format)) {
    return false;
  }

  if (job.status === "pending" || job.status === "pending_retry" || job.status === "failed") {
    return true;
  }

  if (job.status !== "running") {
    return false;
  }

  const updatedAtMs = Date.parse(job.updatedAt);
  return Number.isFinite(updatedAtMs) && Date.now() - updatedAtMs > STALE_RUNNING_JOB_MS;
}

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

  const repairedJobs = await ensureCodexExportJobsForArtifact(artifactId);
  const jobs = await listCodexJobsForArtifact(artifactId);
  const runnable = jobs.filter(isRunnableJob);
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
    repairedJobs,
    results,
  });
}
