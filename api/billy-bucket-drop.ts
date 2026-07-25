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
import { getAuthUser }                        from "./_lib/auth.js";
import { insertRow, listBucketDrops, type BucketDropRow } from "./_lib/supabase.js";
import { buildBucketDropPersistencePayload }  from "./_lib/bucketDrops.js";

function serializeBucketDropRow(row: BucketDropRow): Record<string, unknown> {
  return {
    id: row.id,
    userId: row.user_id,
    content: row.content,
    rawText: row.raw_text,
    captureContext: row.capture_context,
    createdAt: row.created_at,
    intensity: row.intensity,
    plkResonanceScore: Number(row.plk_resonance_score),
    specializedApps: row.specialized_apps,
    tags: row.tags,
    stage: row.stage,
    subjectId: row.subject_id,
    moduleKey: row.module_key,
    promotedMemoryId: row.promoted_memory_id,
    scoredAt: row.scored_at,
    promotedAt: row.promoted_at,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const authUser = await getAuthUser(req);

  if (req.method === "GET") {
    if (!authUser) {
      sendJson(res, 401, { error: "Authentication required" });
      return;
    }

    try {
      const bucketDrops = await listBucketDrops(authUser.id);
      sendJson(res, 200, { bucketDrops: bucketDrops.map(serializeBucketDropRow) });
    } catch (err) {
      console.error("[BucketDrop] List failed:", err);
      sendJson(res, 500, { error: "Failed to load bucket drops" });
    }
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!authUser) {
    sendJson(res, 401, { error: "Authentication required" });
    return;
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    sendJson(res, 400, { error: "content is required" });
    return;
  }

  const { persist, response } = buildBucketDropPersistencePayload(req, {
    id: typeof body.id === "string" ? body.id : undefined,
    content,
    rawText: typeof body.rawText === "string" ? body.rawText : content,
    captureContext: (body.captureContext as Record<string, unknown>) ?? {},
    emotionalIntensity: typeof body.emotionalIntensity === "number" ? body.emotionalIntensity : undefined,
    significanceScore: typeof body.significanceScore === "number" ? body.significanceScore : undefined,
    tapestryWeight: typeof body.tapestryWeight === "number" ? body.tapestryWeight : undefined,
  }, { userId: authUser.id });

  try {
    await insertRow("bucket_drops", persist);

    sendJson(res, 200, envelope(
      "Got it. That's in the bucket. We'll weave that in later. Keep going. 🪣",
      "bucket-drop",
      { captured: true, userId: response.userId, dropId: response.id ?? undefined }
    ));
  } catch (err) {
    console.error("[BucketDrop] Insert failed:", err);
    sendJson(res, 500, { error: "Failed to capture bucket drop" });
  }
}
