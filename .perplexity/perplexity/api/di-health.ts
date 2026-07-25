import type { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson } from "./_lib/response.js";
import { checkDIHealth } from "../shared/di/diagnostics.js";
import { getAllActiveDIProfiles } from "../shared/di/registry.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";

  if (!slug) {
    sendJson(res, 200, {
      profiles: getAllActiveDIProfiles().map((profile) => checkDIHealth(profile.slug)),
    });
    return;
  }

  sendJson(res, 200, checkDIHealth(slug));
}
