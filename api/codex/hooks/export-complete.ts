import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ExportManifestItemSchema } from "../../../shared/codex/contracts.js";
import { mergeManifestItem } from "../../../shared/codex/manifest.js";
import { sendJson } from "../../_lib/response.js";
import { prepareJsonRoute, readBody } from "../../gen-engine/_shared.js";
import { getCodexArtifact, getCodexJob, updateCodexArtifact, updateCodexJob } from "../_persistence.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const body = readBody<{ jobId?: string; manifestItem?: unknown; error?: string }>(req);
  const job = body.jobId ? await getCodexJob(body.jobId) : null;

  if (!job) {
    sendJson(res, 404, { error: "codex_job_not_found" });
    return;
  }

  const record = await getCodexArtifact(job.artifactId);
  if (!record) {
    sendJson(res, 404, { error: "codex_artifact_not_found" });
    return;
  }

  const manifestItem = ExportManifestItemSchema.parse(body.manifestItem ?? {
    format: job.format,
    status: body.error ? "failed" : "ready",
  });
  const artifact = mergeManifestItem(record.artifact, manifestItem);

  await updateCodexArtifact(artifact, record.status);
  await updateCodexJob({
    ...job,
    status: manifestItem.status === "ready" ? "ready" : "failed",
    storagePath: manifestItem.storagePath,
    error: body.error,
  });

  sendJson(res, 200, { status: "recorded", artifact, manifest: artifact.exports });
}
