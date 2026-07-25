import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import { getInnerWorldSupabaseAdmin } from "../../_lib/inner-world.js";

function readSingleString(value: string | string[] | undefined): string | null {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved?.trim() || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const artifactId = readSingleString(req.query.id);
  if (!artifactId) {
    sendJson(res, 400, { error: "Missing artifact id." });
    return;
  }

  const supabase: any = getInnerWorldSupabaseAdmin();
  const { error } = await supabase
    .from("inner_world_artifacts")
    .delete()
    .eq("source_ref", artifactId)
    .eq("user_id", auth.id);
  if (error) {
    sendJson(res, 500, { error: error.message ?? "Failed to delete artifact." });
    return;
  }

  sendJson(res, 200, { ok: true });
}
