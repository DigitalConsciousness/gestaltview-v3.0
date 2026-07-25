import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  buildInnerWorldArtifactPayload,
  getInnerWorldSupabaseAdmin,
} from "../_lib/inner-world.js";

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

  const supabase: any = getInnerWorldSupabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("inner_world_artifacts")
      .select("id,source_ref,user_id,title,summary,source_file_id,source_file_ref,html,thumbnail_url,origin_room,evidence_node_ids,tags,created_at,updated_at")
      .eq("user_id", auth.id)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load artifacts." });
      return;
    }

    const artifacts = (data ?? []).map((row: any) => buildInnerWorldArtifactPayload(row));
    sendJson(res, 200, { artifacts });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    artifact?: {
      id?: string;
      name?: string;
      title?: string;
      summary?: string;
      html?: string;
      sourceFileId?: string | null;
      roomOrigin?: string;
      originRoom?: string;
      tags?: string[];
      previewUrl?: string | null;
      thumbnailUrl?: string | null;
      evidenceNodeIds?: string[];
    };
  };

  const artifact = body.artifact;
  if (!artifact?.id || !artifact.title) {
    sendJson(res, 400, { error: "Missing artifact metadata." });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("inner_world_artifacts")
      .upsert(
        {
          user_id: auth.id,
          source_ref: artifact.id,
          title: artifact.title,
          summary: artifact.summary ?? "",
          source_file_ref: artifact.sourceFileId ?? null,
          source_file_id: null,
          html: artifact.html ?? "",
          thumbnail_url: artifact.thumbnailUrl ?? null,
          origin_room: artifact.originRoom ?? artifact.roomOrigin ?? "dynamic_inner_world",
          evidence_node_ids: artifact.evidenceNodeIds ?? [],
          tags: artifact.tags ?? [],
        },
        { onConflict: "source_ref" },
      )
      .select("id,source_ref,user_id,title,summary,source_file_id,source_file_ref,html,thumbnail_url,origin_room,evidence_node_ids,tags,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save artifact." });
      return;
    }

    sendJson(res, 200, { artifact: buildInnerWorldArtifactPayload(data) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to create artifact.",
    });
  }
}
