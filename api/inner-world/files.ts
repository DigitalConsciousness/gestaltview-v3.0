import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  buildInnerWorldFilePayload,
  getInnerWorldSupabaseAdmin,
  storagePathForUserFile,
  uploadInnerWorldFileObject,
} from "../_lib/inner-world.js";
import {
  buildEntitlementBlock,
  getLargeFileImportLimitBytes,
  isOverEntitlementLimit,
} from "../../shared/entitlements.js";

const FILE_CAP = 300;

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
      .from("user_files")
      .select("id,source_ref,user_id,name,mime_type,size_bytes,storage_path,room_origin,tags,preview_text,preview_html,created_at,updated_at")
      .eq("user_id", auth.id)
      .order("created_at", { ascending: false })
      .limit(300);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load files." });
      return;
    }

    const files = await Promise.all((data ?? []).map((row: any) => buildInnerWorldFilePayload(row)));
    sendJson(res, 200, { files });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    file?: {
      id?: string;
      name?: string;
      mimeType?: string;
      sizeBytes?: number;
      roomOrigin?: string;
      tags?: string[];
      previewText?: string | null;
      previewHtml?: string | null;
    };
    content?: string | null;
    base64DataUrl?: string | null;
  };

  const file = body.file;
  if (!file?.id || !file.name) {
    sendJson(res, 400, { error: "Missing file metadata." });
    return;
  }

  const fileSizeBytes = file.sizeBytes ?? 0;
  const fileLimitBytes = getLargeFileImportLimitBytes(auth.tier);
  if (isOverEntitlementLimit(fileSizeBytes, fileLimitBytes)) {
    sendJson(
      res,
      413,
      buildEntitlementBlock(
        "large_file_import",
        "Core unlocks larger file imports for the shared library.",
      ),
    );
    return;
  }

  const storagePath = storagePathForUserFile(auth.id, file.id, file.name);
  const mimeType = file.mimeType?.trim() || "application/octet-stream";
  const content = file.previewHtml ?? file.previewText ?? body.content ?? null;

  try {
    const { count, error: fileCountError } = await supabase
      .from("user_files")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.id);

    if (fileCountError) {
      sendJson(res, 500, { error: fileCountError.message ?? "Failed to check file count." });
      return;
    }

    if ((count ?? 0) >= FILE_CAP) {
      sendJson(res, 400, {
        error:
          "You've reached your 300-file limit. Delete files to upload more, or upgrade your plan for additional storage.",
      });
      return;
    }

    await uploadInnerWorldFileObject({
      storagePath,
      contentType: mimeType,
      content,
      dataUrl: body.base64DataUrl ?? null,
    });

    const { data, error } = await supabase
      .from("user_files")
      .upsert(
        {
          user_id: auth.id,
          source_ref: file.id,
          name: file.name,
          filename: file.name,
          mime_type: mimeType,
          file_type: mimeType,
          size_bytes: file.sizeBytes ?? 0,
          file_size_bytes: file.sizeBytes ?? 0,
          storage_path: storagePath,
          room_origin: file.roomOrigin ?? "blackboard",
          tags: file.tags ?? [],
          preview_text: file.previewText ?? null,
          preview_html: file.previewHtml ?? null,
          uploaded_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("id,source_ref,user_id,name,filename,mime_type,file_type,size_bytes,file_size_bytes,storage_path,room_origin,tags,preview_text,preview_html,uploaded_at,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save file metadata." });
      return;
    }

    sendJson(res, 200, { file: await buildInnerWorldFilePayload(data) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to upload file.",
    });
  }
}
