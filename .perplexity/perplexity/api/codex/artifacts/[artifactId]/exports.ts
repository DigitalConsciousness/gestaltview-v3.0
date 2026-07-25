import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ExportFormatSchema } from "../../../../shared/codex/contracts.js";
import { createManifestItem, mergeManifestItem } from "../../../../shared/codex/manifest.js";
import { assertExportAllowed } from "../../../../shared/codex/router.js";
import { sendJson } from "../../../_lib/response.js";
import { prepareJsonRoute, readBody } from "../../../gen-engine/_shared.js";
import { enqueueCodexExportJob, getCodexArtifact, updateCodexArtifact } from "../../_persistence.js";

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

  try {
    const body = readBody<{ format?: unknown }>(req);
    const format = ExportFormatSchema.parse(body.format);
    assertExportAllowed(record.artifact, format);
    const artifact = mergeManifestItem(record.artifact, createManifestItem(format));
    await updateCodexArtifact(artifact, record.status);
    const job = await enqueueCodexExportJob(artifact.id, format);

    sendJson(res, 202, { status: "accepted", artifact, job });
  } catch (error) {
    sendJson(res, 422, {
      error: "codex_export_invalid",
      detail: error instanceof Error ? error.message : "Unsupported export request.",
    });
  }
}
