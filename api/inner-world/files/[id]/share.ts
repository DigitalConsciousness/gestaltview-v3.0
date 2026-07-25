import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../../_lib/auth.js";
import { applyCorsHeaders } from "../../../_lib/cors.js";
import { sendJson } from "../../../_lib/response.js";
import { createInnerWorldSignedUrl, getInnerWorldSupabaseAdmin } from "../../../_lib/inner-world.js";

function readSingleString(value: string | string[] | undefined): string | null {
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

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const fileId = readSingleString(req.query.id);
  if (!fileId) {
    sendJson(res, 400, { error: "Missing file id." });
    return;
  }

  const supabase: any = getInnerWorldSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_files")
    .select("id,source_ref,storage_path")
    .eq("source_ref", fileId)
    .eq("user_id", auth.id)
    .maybeSingle();

  if (error) {
    sendJson(res, 500, { error: error.message ?? "Failed to load file." });
    return;
  }

  if (!data?.storage_path) {
    sendJson(res, 404, { error: "File not found." });
    return;
  }

  try {
    const signedUrl = await createInnerWorldSignedUrl(data.storage_path);
    if (!signedUrl) {
      sendJson(res, 500, { error: "Failed to generate share link." });
      return;
    }

    sendJson(res, 200, { signedUrl });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to generate share link.",
    });
  }
}
