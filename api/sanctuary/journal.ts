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
    .select(
      "id,source_ref,user_id,content,source_kind,source_entity_ref,archived_at,revision,created_at,updated_at",
    )
    .eq("user_id", userId)
    .is("archived_at", null)
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
  source_kind?: string;
  source_entity_ref?: string | null;
  archived_at?: string | null;
  revision?: number;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.source_ref ?? row.id,
    userId: row.user_id,
    content: row.content,
    sourceKind: row.source_kind ?? "authored",
    sourceEntityRef: row.source_entity_ref ?? null,
    archivedAt: row.archived_at ?? null,
    revision: row.revision ?? 1,
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
        error:
          error instanceof Error ? error.message : "Failed to load journal.",
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
    expectedUpdatedAt?: unknown;
    sourceKind?: unknown;
    sourceEntityRef?: unknown;
  };

  const content = normalizeContent(body.content);
  const sourceRef =
    typeof body.journalId === "string" && body.journalId.trim()
      ? body.journalId.trim()
      : `sanctuary-journal:${auth.id}`;
  const expectedUpdatedAt =
    typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt.trim()
      : "";
  const sourceKind =
    body.sourceKind === "transcriptory" ||
    body.sourceKind === "imported" ||
    body.sourceKind === "conflict_recovery"
      ? body.sourceKind
      : "authored";
  const sourceEntityRef =
    typeof body.sourceEntityRef === "string" && body.sourceEntityRef.trim()
      ? body.sourceEntityRef.trim()
      : null;

  try {
    const existingResult = await supabase
      .from("journals")
      .select(
        "id,source_ref,user_id,content,source_kind,source_entity_ref,archived_at,revision,created_at,updated_at",
      )
      .eq("user_id", auth.id)
      .eq("source_ref", sourceRef)
      .maybeSingle();

    if (existingResult.error) throw existingResult.error;
    if (
      existingResult.data &&
      expectedUpdatedAt &&
      existingResult.data.updated_at !== expectedUpdatedAt &&
      existingResult.data.content !== content
    ) {
      await supabase.from("sanctuary_conflict_versions").insert({
        owner_id: auth.id,
        entity_kind: "journal",
        source_ref: sourceRef,
        local_payload: {
          content,
          expectedUpdatedAt,
          sourceKind,
          sourceEntityRef,
        },
        remote_payload: existingResult.data,
      });
      sendJson(res, 409, {
        error: "Journal changed elsewhere. Both versions were preserved.",
        conflict: {
          local: {
            id: sourceRef,
            content,
            updatedAt: expectedUpdatedAt,
          },
          remote: buildJournalPayload(existingResult.data),
        },
      });
      return;
    }

    const { data, error: writeError } = await supabase
      .from("journals")
      .upsert(
        {
          user_id: auth.id,
          source_ref: sourceRef,
          content,
          source_kind: sourceKind,
          source_entity_ref: sourceEntityRef,
        },
        { onConflict: "source_ref" },
      )
      .select(
        "id,source_ref,user_id,content,source_kind,source_entity_ref,archived_at,revision,created_at,updated_at",
      )
      .single();

    if (writeError || !data) {
      sendJson(res, 500, {
        error: writeError?.message ?? "Failed to save journal.",
      });
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
