import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getBearerToken, requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { embedTextForRetrieval } from "../_lib/embeddings.js";
import {
  deriveMemoryTitle,
  hashMemoryContent,
  normalizeMemoryContent,
  normalizeMemoryImportance,
  normalizeMemoryKind,
  normalizeMemoryScope,
  sanitizeMemoryMetadata,
  sanitizeMemoryTags,
  trimOptionalText,
  retrieveMemoryEntries,
} from "../_lib/memory.js";
import { sendJson } from "../_lib/response.js";
import {
  deleteMemoryEntry,
  listMemoryEntries,
  updateMemoryEntry,
  upsertMemoryEntry,
} from "../_lib/supabase.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 40;
const MAX_TITLE_CHARS = 160;
const MAX_SUMMARY_CHARS = 400;
const MAX_CONTENT_CHARS = 12000;
const MAX_SOURCE_CHARS = 80;
const MAX_SOURCE_REF_CHARS = 240;

function getQueryValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim());
    return typeof first === "string" ? first.trim() : null;
  }

  return null;
}

function parseLimit(value: unknown, fallback = DEFAULT_LIMIT): number {
  const raw = getQueryValue(value);
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(parsed)));
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const raw = getQueryValue(value);
  return raw === "1" || raw === "true" || raw === "yes";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const auth = await requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }
  const accessToken = getBearerToken(req);

  if (req.method === "GET") {
    const query = getQueryValue(req.query.q) || getQueryValue(req.query.query);
    const limit = parseLimit(req.query.limit);

    if (query) {
      const result = await retrieveMemoryEntries({
        userId: auth.id,
        query,
        topK: limit,
      });

      sendJson(res, 200, {
        memories: result.memories,
        retrievalMode: result.retrievalMode,
        embedBackend: result.embedBackend,
        embedModel: result.embedModel,
      });
      return;
    }

    const memories = await listMemoryEntries({
      userId: auth.id,
      limit,
      scope: getQueryValue(req.query.scope),
      kind: getQueryValue(req.query.kind),
      pinnedOnly: parseBoolean(req.query.pinned),
      includeArchived: parseBoolean(req.query.archived),
      accessToken,
    });

    sendJson(res, 200, { memories });
    return;
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const memoryId = typeof body.id === "string" ? body.id.trim() : "";
    const rawContent = typeof body.content === "string" ? body.content : "";
    const content = normalizeMemoryContent(rawContent).slice(0, MAX_CONTENT_CHARS);

    if (!content) {
      sendJson(res, 400, { error: "content is required" });
      return;
    }

    const title = trimOptionalText(body.title, MAX_TITLE_CHARS);
    const summary = trimOptionalText(body.summary, MAX_SUMMARY_CHARS);
    const source = trimOptionalText(body.source, MAX_SOURCE_CHARS) || "manual";
    const sourceRef = trimOptionalText(body.sourceRef ?? body.source_ref, MAX_SOURCE_REF_CHARS);
    const tags = sanitizeMemoryTags(body.tags);
    const metadata = sanitizeMemoryMetadata(body.metadata);
    const memoryTitle = title === undefined ? deriveMemoryTitle(content) : title || null;
    const memorySummary = summary === undefined ? null : summary || null;
    const embedInput = [memoryTitle || "", memorySummary || "", content]
      .filter(Boolean)
      .join("\n\n");
    const embedResult = await embedTextForRetrieval(embedInput);

    const payload = {
      scope: normalizeMemoryScope(body.scope),
      kind: normalizeMemoryKind(body.kind),
      title: memoryTitle,
      summary: memorySummary,
      content,
      content_hash: hashMemoryContent(content),
      embedding: embedResult.embedding,
      source,
      source_ref: sourceRef === undefined ? null : sourceRef || null,
      tags,
      metadata,
      importance: normalizeMemoryImportance(body.importance),
      pinned: parseBoolean(body.pinned),
    };

    const memory = memoryId
      ? await updateMemoryEntry(auth.id, memoryId, payload, accessToken)
      : await upsertMemoryEntry(auth.id, payload, accessToken);

    if (!memory) {
      sendJson(res, 500, { error: memoryId ? "Failed to update memory entry" : "Failed to store memory entry" });
      return;
    }

    sendJson(res, 200, {
      memory,
      embedBackend: embedResult.backend,
      embedModel: embedResult.model,
    });
    return;
  }

  if (req.method === "DELETE") {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const memoryId =
      getQueryValue(req.query.id) ||
      (typeof body.id === "string" ? body.id.trim() : "");

    if (!memoryId) {
      sendJson(res, 400, { error: "id is required" });
      return;
    }

    const deleted = await deleteMemoryEntry(auth.id, memoryId, accessToken);
    sendJson(res, 200, { deleted });
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
}
