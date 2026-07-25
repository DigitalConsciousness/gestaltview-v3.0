import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  buildTranscriptorySessionPayload,
  getTranscriptorySupabaseAdmin,
  TRANSCRIPTORY_SESSION_SELECT,
} from "../_lib/transcriptory.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const supabase: any = getTranscriptorySupabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("transcriptory_sessions")
      .select(TRANSCRIPTORY_SESSION_SELECT)
      .eq("user_id", auth.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load Transcriptory sessions." });
      return;
    }

    sendJson(res, 200, { sessions: (data ?? []).map((row: any) => buildTranscriptorySessionPayload(row)) });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    title?: string;
    description?: string;
    origin?: string;
  };
  const title = body.title?.trim() || "Untitled Transcriptory session";

  const { data, error } = await supabase
    .from("transcriptory_sessions")
    .insert({
      user_id: auth.id,
      title,
      description: body.description?.trim() || null,
      origin: body.origin?.trim() || "transcriptory",
      status: "active",
    })
    .select(TRANSCRIPTORY_SESSION_SELECT)
    .single();

  if (error || !data) {
    sendJson(res, 500, { error: error?.message ?? "Failed to create Transcriptory session." });
    return;
  }

  sendJson(res, 201, { session: buildTranscriptorySessionPayload(data) });
}
