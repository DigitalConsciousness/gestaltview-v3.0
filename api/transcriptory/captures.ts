import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  buildTranscriptoryCapturePayload,
  getPaginationValue,
  getQueryValue,
  getTranscriptorySupabaseAdmin,
  normalizeTranscriptoryStatus,
  TRANSCRIPTORY_CAPTURE_SELECT,
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
    const queryParams = req.query ?? {};
    const limit = Math.min(getPaginationValue(queryParams.limit, 50), 100);
    const offset = getPaginationValue(queryParams.offset, 0);
    const sessionId = getQueryValue(queryParams.sessionId);
    const query = getQueryValue(queryParams.q);
    const theme = getQueryValue(queryParams.theme);
    const status = getQueryValue(queryParams.status);

    let builder = supabase
      .from("transcriptory_captures")
      .select(TRANSCRIPTORY_CAPTURE_SELECT)
      .eq("user_id", auth.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (sessionId) builder = builder.eq("session_id", sessionId);
    if (status) builder = builder.eq("transcript_status", normalizeTranscriptoryStatus(status));
    if (theme) builder = builder.contains("themes", [theme]);
    if (query) builder = builder.textSearch("search_document", query, { type: "websearch" });

    const { data, error } = await builder.range(offset, offset + limit - 1);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load transcriptory captures." });
      return;
    }

    sendJson(res, 200, {
      captures: (data ?? []).map((row: any) => buildTranscriptoryCapturePayload(row)),
    });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    title?: string;
    sessionId?: string;
    audioStoragePath?: string;
    rawTranscript?: string;
    summary?: string;
    themes?: string[];
    status?: string;
    sourceKind?: string;
    sourceLabel?: string;
    sourceType?: string;
    sourcePage?: string;
  };
  const title = body.title?.trim() || "Untitled transcript";
  const rawTranscript = body.rawTranscript?.trim() || null;
  const requestedStatus = body.status?.trim();
  const status = rawTranscript
    ? "ready"
    : requestedStatus === "failed"
      ? "failed"
      : "pending";
  const transcriptStatus = normalizeTranscriptoryStatus(status);
  const sourceKind = body.sourceKind?.trim() || (body.audioStoragePath ? "audio" : rawTranscript ? "text" : "audio");
  const sourceType = body.sourceType?.trim() || (sourceKind === "text" ? "manual_text" : "upload");

  const { data, error } = await supabase
    .from("transcriptory_captures")
    .insert({
      user_id: auth.id,
      session_id: body.sessionId?.trim() || null,
      title,
      audio_storage_path: body.audioStoragePath?.trim() || null,
      raw_transcript: rawTranscript,
      transcript_text: rawTranscript,
      summary: body.summary?.trim() || null,
      themes: Array.isArray(body.themes) ? body.themes : [],
      linked_captures: [],
      context_weight: 1,
      status,
      transcript_status: transcriptStatus,
      source_kind: sourceKind,
      source_label: body.sourceLabel?.trim() || null,
    })
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();

  if (error || !data) {
    sendJson(res, 500, { error: error?.message ?? "Failed to create transcriptory capture." });
    return;
  }

  await supabase.from("transcriptory_sources").insert({
    user_id: auth.id,
    capture_id: data.id,
    source_type: sourceType,
    source_page: body.sourcePage?.trim() || "transcriptory",
    source_payload: {
      title,
      sourceKind,
      sourceLabel: body.sourceLabel?.trim() || undefined,
    },
  });

  sendJson(res, 201, { capture: buildTranscriptoryCapturePayload(data) });
}
