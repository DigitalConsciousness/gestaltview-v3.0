import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../_lib/response.js";
import { prepareJsonRoute } from "../../gen-engine/_shared.js";
import { getCodexArtifact } from "../_persistence.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["GET"])) {
    return;
  }

  const artifactId = String(req.query.artifactId ?? "");
  const record = await getCodexArtifact(artifactId);

  if (!record) {
    sendJson(res, 404, { error: "codex_artifact_not_found" });
    return;
  }

  sendJson(res, 200, {
    status: record.status,
    artifact: record.artifact,
    manifest: record.artifact.exports,
  });
}
