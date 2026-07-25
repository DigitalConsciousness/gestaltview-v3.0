import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  deleteWorkspaceDocument,
  deleteWorkspaceDocumentCorpusRows,
  createWorkspaceDocument,
  listWorkspaceDocuments,
  syncWorkspaceDocumentToCorpus,
  updateWorkspaceDocument,
} from "../_lib/supabase.js";
import {
  buildEntitlementBlock,
  getLargeFileImportLimitBytes,
  isOverEntitlementLimit,
} from "../../shared/entitlements.js";

function getQueryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
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

  try {
    if (req.method === "GET") {
      const workspaceId = getQueryValue(req.query.workspaceId);
      const documents = await listWorkspaceDocuments(auth.id, workspaceId ?? undefined);
      sendJson(res, 200, { documents });
      return;
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const filename = typeof body.filename === "string" ? body.filename.trim() : "";
      const keyPoints = normalizeStringArray(body.keyPoints ?? body.key_points);
      const topics = normalizeStringArray(body.topics);

      if (!filename) {
        sendJson(res, 400, { error: "filename is required" });
        return;
      }

      const fileSizeBytes =
        typeof body.fileSizeBytes === "number"
          ? body.fileSizeBytes
          : typeof body.file_size_bytes === "number"
            ? body.file_size_bytes
            : 0;
      const fileLimitBytes = auth.isAdmin ? Number.POSITIVE_INFINITY : getLargeFileImportLimitBytes(auth.tier);
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

      const document = await createWorkspaceDocument(auth.id, {
        workspace_id:
          typeof body.workspaceId === "string"
            ? body.workspaceId.trim() || null
            : typeof body.workspace_id === "string"
              ? body.workspace_id.trim() || null
              : null,
        filename,
        file_size_bytes: fileSizeBytes,
        file_type:
          typeof body.fileType === "string"
            ? body.fileType.trim()
            : typeof body.file_type === "string"
              ? body.file_type.trim()
              : "",
        raw_text:
          typeof body.rawText === "string"
            ? body.rawText
            : typeof body.raw_text === "string"
              ? body.raw_text
              : null,
        analysis_status:
          body.analysisStatus === "pending" ||
          body.analysisStatus === "processing" ||
          body.analysisStatus === "completed" ||
          body.analysisStatus === "failed"
            ? body.analysisStatus
            : body.analysis_status === "pending" ||
                body.analysis_status === "processing" ||
                body.analysis_status === "completed" ||
                body.analysis_status === "failed"
              ? body.analysis_status
              : "completed",
        analysis_summary:
          typeof body.analysisSummary === "string"
            ? body.analysisSummary
            : typeof body.analysis_summary === "string"
              ? body.analysis_summary
              : "",
        key_points: keyPoints,
        topics,
        sentiment:
          typeof body.sentiment === "string"
            ? body.sentiment.trim() || "unknown"
            : typeof body.analysis_sentiment === "string"
              ? body.analysis_sentiment.trim() || "unknown"
              : "unknown",
        word_count:
          typeof body.wordCount === "number"
            ? body.wordCount
            : typeof body.word_count === "number"
              ? body.word_count
              : 0,
        reading_time_minutes:
          typeof body.readingTimeMinutes === "number"
            ? body.readingTimeMinutes
            : typeof body.reading_time_minutes === "number"
              ? body.reading_time_minutes
              : 0,
        analysis_payload:
          typeof body.analysisPayload === "object" && body.analysisPayload && !Array.isArray(body.analysisPayload)
            ? (body.analysisPayload as Record<string, unknown>)
            : typeof body.analysis_payload === "object" && body.analysis_payload && !Array.isArray(body.analysis_payload)
              ? (body.analysis_payload as Record<string, unknown>)
              : {},
      });

      if (!document) {
        sendJson(res, 503, { error: "Document persistence is unavailable." });
        return;
      }

      await syncWorkspaceDocumentToCorpus({
        workspaceDocumentId: document.id,
        userId: auth.id,
        workspaceId: document.workspace_id,
        filename: document.filename,
        fileSizeBytes: document.file_size_bytes,
        fileType: document.file_type,
        rawText: document.raw_text,
        analysisSummary: document.analysis_summary,
        keyPoints: Array.isArray(document.key_points)
          ? document.key_points.filter((item): item is string => typeof item === "string")
          : [],
        topics: document.topics,
        sentiment: document.sentiment,
        wordCount: document.word_count,
        readingTimeMinutes: document.reading_time_minutes,
        analysisPayload: document.analysis_payload,
      });

      sendJson(res, 200, { document });
      return;
    }

    if (req.method === "PATCH") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const documentId =
        (typeof body.id === "string" ? body.id.trim() : "") ||
        (typeof body.documentId === "string" ? body.documentId.trim() : "") ||
        (typeof req.query.id === "string" ? req.query.id.trim() : "");

      if (!documentId) {
        sendJson(res, 400, { error: "document id is required" });
        return;
      }

      const updated = await updateWorkspaceDocument(auth.id, documentId, {
        workspace_id:
          typeof body.workspaceId === "string"
            ? body.workspaceId.trim() || null
            : typeof body.workspace_id === "string"
              ? body.workspace_id.trim() || null
              : body.workspaceId === null || body.workspace_id === null
                ? null
                : undefined,
        filename: typeof body.filename === "string" ? body.filename.trim() : undefined,
        file_size_bytes:
          typeof body.fileSizeBytes === "number"
            ? body.fileSizeBytes
            : typeof body.file_size_bytes === "number"
              ? body.file_size_bytes
              : undefined,
        file_type:
          typeof body.fileType === "string"
            ? body.fileType.trim()
            : typeof body.file_type === "string"
              ? body.file_type.trim()
              : undefined,
        raw_text:
          typeof body.rawText === "string"
            ? body.rawText
            : typeof body.raw_text === "string"
              ? body.raw_text
              : body.rawText === null || body.raw_text === null
                ? null
                : undefined,
        analysis_status:
          body.analysisStatus === "pending" ||
          body.analysisStatus === "processing" ||
          body.analysisStatus === "completed" ||
          body.analysisStatus === "failed"
            ? body.analysisStatus
            : body.analysis_status === "pending" ||
                body.analysis_status === "processing" ||
                body.analysis_status === "completed" ||
                body.analysis_status === "failed"
              ? body.analysis_status
              : undefined,
        analysis_summary:
          typeof body.analysisSummary === "string"
            ? body.analysisSummary
            : typeof body.analysis_summary === "string"
              ? body.analysis_summary
              : undefined,
        key_points:
          Array.isArray(body.keyPoints)
            ? normalizeStringArray(body.keyPoints)
            : Array.isArray(body.key_points)
              ? normalizeStringArray(body.key_points)
              : undefined,
        topics:
          Array.isArray(body.topics) ? normalizeStringArray(body.topics) : undefined,
        sentiment:
          typeof body.sentiment === "string"
            ? body.sentiment.trim() || "unknown"
            : typeof body.analysis_sentiment === "string"
              ? body.analysis_sentiment.trim() || "unknown"
              : undefined,
        word_count:
          typeof body.wordCount === "number"
            ? body.wordCount
            : typeof body.word_count === "number"
              ? body.word_count
              : undefined,
        reading_time_minutes:
          typeof body.readingTimeMinutes === "number"
            ? body.readingTimeMinutes
            : typeof body.reading_time_minutes === "number"
              ? body.reading_time_minutes
              : undefined,
        analysis_payload:
          typeof body.analysisPayload === "object" && body.analysisPayload && !Array.isArray(body.analysisPayload)
            ? (body.analysisPayload as Record<string, unknown>)
            : typeof body.analysis_payload === "object" && body.analysis_payload && !Array.isArray(body.analysis_payload)
              ? (body.analysis_payload as Record<string, unknown>)
              : undefined,
      });

      if (!updated) {
        sendJson(res, 404, { error: "Document not found." });
        return;
      }

      await syncWorkspaceDocumentToCorpus({
        workspaceDocumentId: updated.id,
        userId: auth.id,
        workspaceId: updated.workspace_id,
        filename: updated.filename,
        fileSizeBytes: updated.file_size_bytes,
        fileType: updated.file_type,
        rawText: updated.raw_text,
        analysisSummary: updated.analysis_summary,
        keyPoints: Array.isArray(updated.key_points)
          ? updated.key_points.filter((item): item is string => typeof item === "string")
          : [],
        topics: updated.topics,
        sentiment: updated.sentiment,
        wordCount: updated.word_count,
        readingTimeMinutes: updated.reading_time_minutes,
        analysisPayload: updated.analysis_payload,
      });

      sendJson(res, 200, { document: updated });
      return;
    }

    if (req.method === "DELETE") {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const documentId =
        (typeof body.id === "string" ? body.id.trim() : "") ||
        (typeof body.documentId === "string" ? body.documentId.trim() : "") ||
        (typeof req.query.id === "string" ? req.query.id.trim() : "");

      if (!documentId) {
        sendJson(res, 400, { error: "document id is required" });
        return;
      }

      let workspaceId =
        typeof body.workspaceId === "string"
          ? body.workspaceId.trim() || null
          : typeof body.workspace_id === "string"
            ? body.workspace_id.trim() || null
            : null;

      if (workspaceId === null) {
        const currentDocuments = await listWorkspaceDocuments(auth.id);
        workspaceId = currentDocuments.find((document) => document.id === documentId)?.workspace_id ?? null;
      }

      const corpusDeleted = await deleteWorkspaceDocumentCorpusRows({
        userId: auth.id,
        workspaceId,
        workspaceDocumentId: documentId,
      });
      const deleted = await deleteWorkspaceDocument(auth.id, documentId);

      sendJson(res, deleted ? 200 : 404, { deleted, corpusDeleted });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Document request failed.",
    });
  }
}
