// api/billy-bucket-drop.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Lightning capture endpoint — zero friction, zero judgment.
// "Got it. That's in the bucket."
//
// POST /api/billy-bucket-drop
// Body: { content: string, tags?: string[], captureContext?: object }

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson, envelope }                 from "./_lib/response.js";
import { getUserId }                          from "./_lib/user.js";
import { insertRow }                          from "./_lib/supabase.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body    = (req.body ?? {}) as Record<string, unknown>;
  const userId  = getUserId(req, body);
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    sendJson(res, 400, { error: "content is required" });
    return;
  }

  const tags           = Array.isArray(body.tags) ? body.tags as string[] : [];
  const captureContext = (body.captureContext as Record<string, unknown>) ?? {};

  try {
    await insertRow("bucket_drops", {
      user_id:         userId,
      content,
      raw_text:        content,
      capture_context: {
        ...captureContext,
        tags,
        captured_at: new Date().toISOString(),
        source:      "api",
      },
    });

    sendJson(res, 200, envelope(
      "Got it. That's in the bucket. We'll weave that in later. Keep going. 🪣",
      "bucket-drop",
      { captured: true, userId, tags }
    ));
  } catch (err) {
    console.error("[BucketDrop] Insert failed:", err);
    sendJson(res, 500, { error: "Failed to capture bucket drop" });
  }
}

