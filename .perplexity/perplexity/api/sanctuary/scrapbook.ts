import { randomUUID } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { buildInnerWorldFilePayload, getInnerWorldSupabaseAdmin } from "../_lib/inner-world.js";

type FileRow = {
  id: string;
  source_ref?: string | null;
  user_id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  room_origin: string;
  tags: string[] | null;
  preview_text: string | null;
  preview_html: string | null;
  created_at: string;
  updated_at: string;
};

type ScrapbookRow = {
  id: string;
  source_ref?: string | null;
  user_id: string;
  file_id: string | null;
  source_file_ref?: string | null;
  caption: string | null;
  created_at: string;
  updated_at?: string | null;
};

async function loadScrapbookItems(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("scrapbook_items")
    .select("id,source_ref,user_id,file_id,source_file_ref,caption,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ScrapbookRow[];
  const sourceFileRefs = Array.from(new Set(rows.map((row) => row.source_file_ref).filter((value): value is string => Boolean(value))));
  const fileIds = Array.from(new Set(rows.map((row) => row.file_id).filter((value): value is string => Boolean(value))));

  const fileMap = new Map<string, Awaited<ReturnType<typeof buildInnerWorldFilePayload>>>();
  if (sourceFileRefs.length > 0) {
    const { data: fileRows, error: fileError } = await supabase
      .from("user_files")
      .select("id,source_ref,user_id,name,mime_type,size_bytes,storage_path,room_origin,tags,preview_text,preview_html,created_at,updated_at")
      .eq("user_id", userId)
      .in("source_ref", sourceFileRefs);

    if (fileError) {
      throw fileError;
    }

    await Promise.all(
      ((fileRows ?? []) as FileRow[]).map(async (row) => {
        const payload = await buildInnerWorldFilePayload(row);
        fileMap.set(row.source_ref ?? row.id, payload);
        fileMap.set(row.id, payload);
      }),
    );
  }

  const missingFileIds = fileIds.filter((id) => !fileMap.has(id));
  if (missingFileIds.length > 0) {
    const { data: fileRows, error: fileError } = await supabase
      .from("user_files")
      .select("id,source_ref,user_id,name,mime_type,size_bytes,storage_path,room_origin,tags,preview_text,preview_html,created_at,updated_at")
      .eq("user_id", userId)
      .in("id", missingFileIds);

    if (fileError) {
      throw fileError;
    }

    await Promise.all(
      ((fileRows ?? []) as FileRow[]).map(async (row) => {
        const payload = await buildInnerWorldFilePayload(row);
        fileMap.set(row.source_ref ?? row.id, payload);
        fileMap.set(row.id, payload);
      }),
    );
  }

  return rows.map((row) => ({
    id: row.source_ref ?? row.id,
    userId: row.user_id,
    fileId: row.source_file_ref ?? row.file_id,
    caption: row.caption,
    createdAt: row.created_at,
    file: row.source_file_ref || row.file_id ? (fileMap.get(row.source_file_ref ?? row.file_id ?? "") ?? null) : null,
  }));
}

async function loadItemFile(supabase: any, userId: string, fileId: string) {
  const sourceRefResult = await supabase
    .from("user_files")
    .select("id,source_ref,user_id,name,mime_type,size_bytes,storage_path,room_origin,tags,preview_text,preview_html,created_at,updated_at")
    .eq("user_id", userId)
    .eq("source_ref", fileId)
    .maybeSingle();

  if (sourceRefResult.error) {
    throw sourceRefResult.error;
  }

  if (sourceRefResult.data) {
    return {
      row: sourceRefResult.data as FileRow,
      payload: await buildInnerWorldFilePayload(sourceRefResult.data as FileRow),
    };
  }

  const idResult = await supabase
    .from("user_files")
    .select("id,source_ref,user_id,name,mime_type,size_bytes,storage_path,room_origin,tags,preview_text,preview_html,created_at,updated_at")
    .eq("user_id", userId)
    .eq("id", fileId)
    .maybeSingle();

  if (idResult.error) {
    throw idResult.error;
  }

  if (!idResult.data) {
    return null;
  }

  return {
    row: idResult.data as FileRow,
    payload: await buildInnerWorldFilePayload(idResult.data as FileRow),
  };
}

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
    try {
      const items = await loadScrapbookItems(supabase, auth.id);
      sendJson(res, 200, { items });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Failed to load scrapbook items.",
      });
    }
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    itemId?: unknown;
    fileId?: unknown;
    caption?: unknown;
  };

  const itemId = typeof body.itemId === "string" && body.itemId.trim() ? body.itemId.trim() : randomUUID();
  const fileId = typeof body.fileId === "string" && body.fileId.trim() ? body.fileId.trim() : "";
  const caption = typeof body.caption === "string" ? body.caption.trim() : "";

  if (!fileId) {
    sendJson(res, 400, { error: "Missing file id." });
    return;
  }

  try {
    const file = await loadItemFile(supabase, auth.id, fileId);
    if (!file) {
      sendJson(res, 404, { error: "File not found." });
      return;
    }

    const { data, error } = await supabase
      .from("scrapbook_items")
      .upsert(
        {
          user_id: auth.id,
          source_ref: itemId,
          file_id: file.row.id,
          source_file_ref: file.row.source_ref ?? file.row.id,
          caption: caption || null,
        },
        { onConflict: "source_ref" },
      )
      .select("id,source_ref,user_id,file_id,source_file_ref,caption,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save scrapbook item." });
      return;
    }

    sendJson(res, 200, {
      item: {
        id: data.source_ref ?? data.id,
        userId: data.user_id,
        fileId: data.source_file_ref ?? data.file_id,
        caption: data.caption,
        createdAt: data.created_at,
        file: file.payload,
      },
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to save scrapbook item.",
    });
  }
}
