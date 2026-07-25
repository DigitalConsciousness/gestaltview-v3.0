import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import {
  buildTranscriptorySessionPayload,
  getQueryValue,
  getTranscriptorySupabaseAdmin,
  TRANSCRIPTORY_SESSION_SELECT,
} from "../../_lib/transcriptory.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "PATCH") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const sessionId = getQueryValue(req.query.id);
  if (!sessionId) {
    sendJson(res, 400, { error: "session_id_required" });
    return;
  }

  const body = (req.body ?? {}) as {
    title?: string;
    description?: string;
    status?: "active" | "archived" | "merged";
    endedAt?: string | null;
  };
  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title.trim() || "Untitled Transcriptory session";
  if (body.description !== undefined) patch.description = body.description.trim() || null;
  if (body.status && ["active", "archived", "merged"].includes(body.status)) patch.status = body.status;
  if (body.endedAt !== undefined) patch.ended_at = body.endedAt;

  if (Object.keys(patch).length === 0) {
    sendJson(res, 400, { error: "session_patch_required" });
    return;
  }

  const supabase: any = getTranscriptorySupabaseAdmin();
  const { data, error } = await supabase
    .from("transcriptory_sessions")
    .update(patch)
    .eq("id", sessionId)
    .eq("user_id", auth.id)
    .select(TRANSCRIPTORY_SESSION_SELECT)
    .single();

  if (error || !data) {
    sendJson(res, error?.code === "PGRST116" ? 404 : 500, {
      error: error?.message ?? "Transcriptory session not found.",
    });
    return;
  }

  sendJson(res, 200, { session: buildTranscriptorySessionPayload(data) });
}
