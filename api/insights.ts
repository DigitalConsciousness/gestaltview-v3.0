import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "./_lib/auth.js";
import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson } from "./_lib/response.js";
import { getInnerWorldSupabaseAdmin } from "./_lib/inner-world.js";

type InsightPayload = {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  preview?: unknown;
  contentRef?: unknown;
  sessionOrigin?: unknown;
  highlightedText?: unknown;
  linkedTo?: unknown;
  resonance?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function resolveType(value: unknown): "memory" | "connection" | "insight" | "pattern" | "skill" | "emotion" {
  return value === "memory" ||
    value === "connection" ||
    value === "insight" ||
    value === "skill" ||
    value === "emotion"
    ? value
    : "pattern";
}

function resolveStatus(value: unknown): "active" | "hidden" | "archived" | "draft" {
  return value === "active" || value === "hidden" || value === "draft" ? value : "archived";
}

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as Record<string, unknown>;
}

function clampScore(value: unknown, fallback = 0.5): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

function buildInsightPayload(row: {
  id: string;
  user_id: string;
  source_ref: string | null;
  type: string;
  title: string;
  preview: string;
  session_origin: string | null;
  highlighted_text: string | null;
  linked_orb_ids: string[] | null;
  significance_score: number | null;
  status: string;
  payload: unknown;
  created_at: string;
  updated_at: string;
}): Record<string, unknown> {
  const payload = normalizePayload(row.payload);
  const sourceRef = row.source_ref ?? (typeof payload.id === "string" ? payload.id : row.id);

  return {
    id: row.id,
    userId: row.user_id,
    sourceRef,
    type: resolveType(payload.type ?? row.type),
    title: typeof payload.title === "string" ? payload.title : row.title,
    preview: typeof payload.preview === "string" ? payload.preview : row.preview,
    contentRef: typeof payload.contentRef === "string" ? payload.contentRef : undefined,
    sessionOrigin:
      typeof payload.sessionOrigin === "string" ? payload.sessionOrigin : row.session_origin ?? undefined,
    highlightedText:
      typeof payload.highlightedText === "string" ? payload.highlightedText : row.highlighted_text ?? undefined,
    linkedOrbIds: asStringArray(payload.linkedTo ?? row.linked_orb_ids),
    significanceScore: clampScore(payload.resonance ?? row.significance_score),
    status: resolveStatus(payload.status ?? row.status),
    payload: {
      ...payload,
      id: sourceRef,
      sourceRef,
      title: typeof payload.title === "string" ? payload.title : row.title,
      preview: typeof payload.preview === "string" ? payload.preview : row.preview,
      sessionOrigin:
        typeof payload.sessionOrigin === "string" ? payload.sessionOrigin : row.session_origin ?? undefined,
      highlightedText:
        typeof payload.highlightedText === "string" ? payload.highlightedText : row.highlighted_text ?? undefined,
      linkedTo: asStringArray(payload.linkedTo ?? row.linked_orb_ids),
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    },
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
    const { data, error } = await supabase
      .from("insights")
      .select("id,user_id,source_ref,type,title,preview,session_origin,highlighted_text,linked_orb_ids,significance_score,status,payload,created_at,updated_at")
      .eq("user_id", auth.id)
      .eq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(300);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load insights." });
      return;
    }

    const insights = (data ?? []).map((row: any) => buildInsightPayload(row));
    sendJson(res, 200, { insights });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    insight?: InsightPayload;
  };

  const insight = body.insight;
  const sourceRef = typeof insight?.id === "string" ? insight.id.trim() : "";
  if (!sourceRef) {
    sendJson(res, 400, { error: "Missing insight source id." });
    return;
  }

  const now = new Date().toISOString();
  const createdAt =
    typeof insight?.createdAt === "string" && insight.createdAt.trim().length > 0 ? insight.createdAt : now;
  const updatedAt =
    typeof insight?.updatedAt === "string" && insight.updatedAt.trim().length > 0 ? insight.updatedAt : now;
  const linkedOrbIds = asStringArray(insight?.linkedTo);
  const significanceScore = clampScore(
    typeof insight?.resonance === "number" ? insight.resonance / 100 : undefined,
  );
  const payload = {
    ...normalizePayload(insight),
    id: sourceRef,
    sourceRef,
    updatedAt,
    createdAt,
    linkedTo: linkedOrbIds,
  };

  try {
    const { data, error } = await supabase
      .from("insights")
      .upsert(
        {
          source_ref: sourceRef,
          user_id: auth.id,
          type: resolveType(insight?.type),
          title: typeof insight?.title === "string" ? insight.title : "",
          preview: typeof insight?.preview === "string" ? insight.preview : "",
          session_origin: typeof insight?.sessionOrigin === "string" ? insight.sessionOrigin : null,
          highlighted_text: typeof insight?.highlightedText === "string" ? insight.highlightedText : null,
          linked_orb_ids: linkedOrbIds,
          significance_score: significanceScore,
          status: "archived",
          payload,
          created_at: createdAt,
          updated_at: updatedAt,
        },
        { onConflict: "source_ref" },
      )
      .select("id,user_id,source_ref,type,title,preview,session_origin,highlighted_text,linked_orb_ids,significance_score,status,payload,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save insight." });
      return;
    }

    sendJson(res, 200, { insight: buildInsightPayload(data) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to archive insight.",
    });
  }
}
