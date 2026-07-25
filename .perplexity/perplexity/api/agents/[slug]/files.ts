import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireFounderOrAdmin } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import { listAgentManifestFilesBySlug } from "../../../server/agent-trainer/personhood.js";

function extractSingle(value: string | string[] | undefined): string | null {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved?.trim() || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = await requireFounderOrAdmin(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const slug = extractSingle(req.query.slug);
  if (!slug) {
    sendJson(res, 400, { error: "Missing agent slug." });
    return;
  }

  try {
    const { manifest, files } = await listAgentManifestFilesBySlug({
      slug,
      type: extractSingle(req.query.type),
      logicalPath: extractSingle(req.query.path),
    });

    if (!manifest) {
      sendJson(res, 404, { error: "No active manifest found for this agent." });
      return;
    }

    sendJson(res, 200, {
      agentId: manifest.agentId,
      manifestId: manifest.manifestId,
      files,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load agent manifest files.",
    });
  }
}
