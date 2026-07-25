import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireFounderOrAdmin } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import { getAgentManifestBySlug } from "../../../server/agent-trainer/personhood.js";

function extractSlug(value: string | string[] | undefined): string {
  const slug = Array.isArray(value) ? value[0] : value;
  if (!slug?.trim()) {
    throw new Error("Missing agent slug.");
  }

  return slug.trim();
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

  try {
    const manifest = await getAgentManifestBySlug(extractSlug(req.query.slug));

    if (!manifest) {
      sendJson(res, 404, { error: "No active manifest found for this agent." });
      return;
    }

    sendJson(res, 200, { manifest });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load agent manifest.",
    });
  }
}
