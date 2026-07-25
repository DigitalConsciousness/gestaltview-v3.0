import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { getInnerWorldSupabaseAdmin } from "../_lib/inner-world.js";

function normalizeContent(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function fetchLatestJournal(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("journals")
    .select("id,source_ref,user_id,content,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

function buildJournalPayload(row: {
  id: string;
  source_ref?: string | null;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.source_ref ?? row.id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      const journal = await fetchLatestJournal(supabase, auth.id);
      sendJson(res, 200, {
        journal: journal
          ? {
              ...buildJournalPayload(journal),
            }
          : null,
      });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Failed to load journal.",
      });
    }
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    journalId?: unknown;
    content?: unknown;
  };

  const content = normalizeContent(body.content);
  const sourceRef =
    typeof body.journalId === "string" && body.journalId.trim()
      ? body.journalId.trim()
      : `sanctuary-journal:${auth.id}`;

  try {
    const { data, error } = await supabase
      .from("journals")
      .upsert(
        {
          user_id: auth.id,
          source_ref: sourceRef,
          content,
        },
        { onConflict: "source_ref" },
      )
      .select("id,source_ref,user_id,content,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save journal." });
      return;
    }

    sendJson(res, 200, {
      journal: buildJournalPayload(data),
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to save journal.",
    });
  }
}
