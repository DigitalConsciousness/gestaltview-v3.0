import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { getInnerWorldSupabaseAdmin } from "../_lib/inner-world.js";

type BlueprintOutput = {
  markdown?: unknown;
  html?: unknown;
  code?: unknown;
  agentPrompt?: unknown;
  imagePrompt?: unknown;
  marketingCopy?: unknown;
  shareCard?: unknown;
  pdfHtml?: unknown;
};

type BlueprintContent = {
  summary?: unknown;
  sourceOrbIds?: unknown;
  captureCount?: unknown;
  tags?: unknown;
  outputs?: unknown;
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

function asOutputs(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {
      markdown: "",
      html: "",
      code: "",
      agentPrompt: "",
      imagePrompt: "",
      marketingCopy: "",
      shareCard: "",
      pdfHtml: "",
    };
  }

  const record = value as BlueprintOutput;
  return {
    markdown: typeof record.markdown === "string" ? record.markdown : "",
    html: typeof record.html === "string" ? record.html : "",
    code: typeof record.code === "string" ? record.code : "",
    agentPrompt: typeof record.agentPrompt === "string" ? record.agentPrompt : "",
    imagePrompt: typeof record.imagePrompt === "string" ? record.imagePrompt : "",
    marketingCopy: typeof record.marketingCopy === "string" ? record.marketingCopy : "",
    shareCard: typeof record.shareCard === "string" ? record.shareCard : "",
    pdfHtml: typeof record.pdfHtml === "string" ? record.pdfHtml : "",
  };
}

function resolveStatus(value: unknown): "draft" | "ready" | "exported" {
  return value === "ready" || value === "exported" ? value : "draft";
}

function normalizeBlueprintContent(value: unknown, fallbackCreatedAt: string): {
  summary: string;
  sourceOrbIds: string[];
  captureCount: number;
  tags: string[];
  outputs: Record<string, string>;
  createdAt: string;
  updatedAt: string;
} {
  const content = value && typeof value === "object" ? (value as BlueprintContent) : {};
  const sourceOrbIds = asStringArray(content.sourceOrbIds);
  const createdAt =
    typeof content.createdAt === "string" && content.createdAt.trim().length > 0
      ? content.createdAt
      : fallbackCreatedAt;
  const updatedAt =
    typeof content.updatedAt === "string" && content.updatedAt.trim().length > 0
      ? content.updatedAt
      : createdAt;

  return {
    summary: typeof content.summary === "string" ? content.summary : "",
    sourceOrbIds,
    captureCount:
      typeof content.captureCount === "number" && Number.isFinite(content.captureCount)
        ? Math.max(0, Math.floor(content.captureCount))
        : sourceOrbIds.length,
    tags: asStringArray(content.tags),
    outputs: asOutputs(content.outputs),
    createdAt,
    updatedAt,
  };
}

function buildBlueprintPayload(row: {
  id: string;
  user_id: string;
  title: string;
  status: string;
  content: unknown;
  created_at: string;
  updated_at: string;
}): Record<string, unknown> {
  const content = normalizeBlueprintContent(row.content, row.created_at);
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: resolveStatus(row.status),
    content: {
      ...content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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
      .from("blueprints")
      .select("id,user_id,title,status,content,created_at,updated_at")
      .eq("user_id", auth.id)
      .order("updated_at", { ascending: false })
      .limit(180);

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load blueprints." });
      return;
    }

    const blueprints = (data ?? []).map((row: any) => buildBlueprintPayload(row));
    sendJson(res, 200, { blueprints });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as {
    operation?: string;
    blueprintId?: string;
    blueprint?: {
      id?: string;
      title?: string;
      summary?: string;
      sourceOrbIds?: string[];
      captureCount?: number;
      tags?: string[];
      status?: string;
      createdAt?: string;
      updatedAt?: string;
      outputs?: BlueprintOutput;
    };
  };

  if (body.operation === "delete") {
    if (!body.blueprintId) {
      sendJson(res, 400, { error: "Missing blueprint id." });
      return;
    }

    const { error } = await supabase.from("blueprints").delete().eq("user_id", auth.id).eq("id", body.blueprintId);
    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to delete blueprint." });
      return;
    }

    sendJson(res, 200, { deletedId: body.blueprintId });
    return;
  }

  const blueprint = body.blueprint;
  if (!blueprint?.id || !blueprint.title) {
    sendJson(res, 400, { error: "Missing blueprint metadata." });
    return;
  }

  const fallbackCreatedAt = blueprint.createdAt?.trim() || new Date().toISOString();
  const normalizedContent = normalizeBlueprintContent(
    {
      summary: blueprint.summary ?? "",
      sourceOrbIds: blueprint.sourceOrbIds ?? [],
      captureCount: blueprint.captureCount ?? 0,
      tags: blueprint.tags ?? [],
      outputs: blueprint.outputs ?? {},
      createdAt: fallbackCreatedAt,
      updatedAt: blueprint.updatedAt?.trim() || fallbackCreatedAt,
    },
    fallbackCreatedAt,
  );

  try {
    const { data, error } = await supabase
      .from("blueprints")
      .upsert(
        {
          id: blueprint.id,
          user_id: auth.id,
          title: blueprint.title,
          content: normalizedContent,
          status: resolveStatus(blueprint.status),
          created_at: normalizedContent.createdAt,
          updated_at: normalizedContent.updatedAt,
        },
        { onConflict: "id" },
      )
      .select("id,user_id,title,status,content,created_at,updated_at")
      .single();

    if (error || !data) {
      sendJson(res, 500, { error: error?.message ?? "Failed to save blueprint." });
      return;
    }

    sendJson(res, 200, { blueprint: buildBlueprintPayload(data) });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to create blueprint.",
    });
  }
}
