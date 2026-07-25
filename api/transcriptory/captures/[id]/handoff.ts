import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../../_lib/auth.js";
import { applyCorsHeaders } from "../../../_lib/cors.js";
import { sendJson } from "../../../_lib/response.js";
import {
  buildTranscriptoryHandoffPayload,
  getQueryValue,
  getTranscriptorySupabaseAdmin,
  handoffSourceForTarget,
  normalizeHandoffTarget,
  TRANSCRIPTORY_CAPTURE_SELECT,
} from "../../../_lib/transcriptory.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const captureId = getQueryValue(req.query.id);
  const target = normalizeHandoffTarget((req.body as { target?: unknown } | undefined)?.target);
  if (!captureId || !target) {
    sendJson(res, 400, { error: "capture_id_and_valid_target_required" });
    return;
  }

  const supabase: any = getTranscriptorySupabaseAdmin();
  const { data: capture, error } = await supabase
    .from("transcriptory_captures")
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .eq("id", captureId)
    .eq("user_id", auth.id)
    .single();

  if (error || !capture) {
    sendJson(res, error?.code === "PGRST116" ? 404 : 500, {
      error: error?.message ?? "Transcriptory capture not found.",
    });
    return;
  }

  const handoff = buildTranscriptoryHandoffPayload(capture, target);
  const source = handoffSourceForTarget(target);
  await supabase.from("transcriptory_sources").insert({
    user_id: auth.id,
    capture_id: captureId,
    source_type: source.sourceType,
    source_page: source.sourcePage,
    source_payload: {
      target,
      title: capture.title ?? "Untitled transcript",
      summary: capture.summary ?? "",
      themes: capture.themes ?? [],
    },
  });

  sendJson(res, 200, { handoff });
}
