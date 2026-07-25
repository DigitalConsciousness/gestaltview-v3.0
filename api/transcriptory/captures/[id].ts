import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import {
  buildTranscriptoryCapturePayload,
  buildTranscriptorySessionPayload,
  getQueryValue,
  getTranscriptorySupabaseAdmin,
  TRANSCRIPTORY_CAPTURE_SELECT,
  TRANSCRIPTORY_SESSION_SELECT,
  TRANSCRIPTORY_SOURCE_SELECT,
} from "../../_lib/transcriptory.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    if (req.method !== "DELETE") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const captureId = getQueryValue(req.query.id);
  if (!captureId) {
    sendJson(res, 400, { error: "capture_id_required" });
    return;
  }

  const supabase: any = getTranscriptorySupabaseAdmin();
  const { data: capture, error } = await supabase
    .from("transcriptory_captures")
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .eq("id", captureId)
    .eq("user_id", auth.id)
    .is("archived_at", null)
    .single();

  if (error || !capture) {
    if (req.method === "DELETE") {
      sendJson(res, error?.code === "PGRST116" ? 404 : 500, {
        error: error?.message ?? "Transcriptory capture not found.",
      });
      return;
    }
    sendJson(res, error?.code === "PGRST116" ? 404 : 500, {
      error: error?.message ?? "Transcriptory capture not found.",
    });
    return;
  }

  if (req.method === "DELETE") {
    const archivedAt = new Date().toISOString();
    const { error: archiveError } = await supabase
      .from("transcriptory_captures")
      .update({
        archived_at: archivedAt,
        updated_at: archivedAt,
      })
      .eq("id", captureId)
      .eq("user_id", auth.id)
      .is("archived_at", null);

    if (archiveError) {
      sendJson(res, 500, { error: archiveError.message ?? "Failed to delete transcriptory capture." });
      return;
    }

    await supabase
      .from("transcriptory_sources")
      .delete()
      .eq("capture_id", captureId)
      .eq("user_id", auth.id);

    sendJson(res, 200, { deleted: true, captureId, archivedAt });
    return;
  }

  await supabase
    .from("transcriptory_captures")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", captureId)
    .eq("user_id", auth.id)
    .is("archived_at", null);

  const { data: sources } = await supabase
    .from("transcriptory_sources")
    .select(TRANSCRIPTORY_SOURCE_SELECT)
    .eq("user_id", auth.id)
    .eq("capture_id", captureId)
    .order("created_at", { ascending: false })
    .limit(50);

  let session = null;
  if (capture.session_id) {
    const { data: sessionRow } = await supabase
      .from("transcriptory_sessions")
      .select(TRANSCRIPTORY_SESSION_SELECT)
      .eq("id", capture.session_id)
      .eq("user_id", auth.id)
      .single();
    session = sessionRow ? buildTranscriptorySessionPayload(sessionRow) : null;
  }

  sendJson(res, 200, {
    capture: buildTranscriptoryCapturePayload(capture),
    sources: sources ?? [],
    session,
    linkedCaptures: capture.linked_captures ?? [],
  });
}
