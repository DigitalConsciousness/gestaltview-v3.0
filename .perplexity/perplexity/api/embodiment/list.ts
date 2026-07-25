import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { getServiceClient, isFounderStudioEnabled } from "./_shared.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isFounderStudioEnabled()) {
    sendJson(res, 403, { error: "Founder studio is not enabled." });
    return;
  }

  try {
    const supabase = getServiceClient() as any;
    const { data, error } = await supabase
      .from("embodiment_profiles")
      .select("id, slug, public_name, status, visibility_scope, readiness_score, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      sendJson(res, 500, { error: error.message });
      return;
    }

    sendJson(res, 200, { profiles: data ?? [] });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error.",
    });
  }
}
