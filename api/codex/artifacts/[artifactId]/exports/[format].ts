import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../../../../_lib/auth.js";
import { sendJson } from "../../../../_lib/response.js";
import { createCodexSignedUrl } from "../../../../../shared/codex/storage.js";
import { ExportFormatSchema } from "../../../../../shared/codex/contracts.js";
import { getCodexArtifact, listCodexJobsForArtifact } from "../../../_persistence.js";

type RetrievalMode = "preview" | "persistent";

function readSingleString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}

function getMode(value: string | string[] | undefined): RetrievalMode {
  const raw = readSingleString(value).toLowerCase();
  return raw === "persistent" ? "persistent" : "preview";
}

function getBucket(): string {
  return process.env.CODEX_EXPORT_BUCKET?.trim() ?? "";
}

function getReadableAuth(req: VercelRequest) {
  const auth = requireAuth(req);
  return "status" in auth ? null : auth;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const artifactId = readSingleString(req.query.artifactId);
  const format = ExportFormatSchema.parse(readSingleString(req.query.format));
  const mode = getMode(req.query.mode);

  const record = await getCodexArtifact(artifactId);
  if (!record) {
    sendJson(res, 404, { error: "codex_artifact_not_found" });
    return;
  }

  if (record.artifact.securityClass !== "public") {
    const auth = getReadableAuth(req);
    if (!auth) {
      sendJson(res, 401, { error: "Authentication required" });
      return;
    }

    if (auth.id !== record.artifact.userId) {
      sendJson(res, 403, { error: "forbidden" });
      return;
    }
  }

  const readyExport = record.artifact.exports.find(
    (item) => item.format === format && item.status === "ready" && Boolean(item.storagePath),
  );
  const matchingJob = (await listCodexJobsForArtifact(artifactId)).find((job) => job.format === format);

  if (!readyExport || !readyExport.storagePath) {
    if (matchingJob && (matchingJob.status === "pending" || matchingJob.status === "running" || matchingJob.status === "pending_retry")) {
      sendJson(res, 202, {
        status: matchingJob.status,
        artifactId: record.artifact.id,
        format,
        jobId: matchingJob.id,
      });
      return;
    }

    sendJson(res, 404, {
      error: "codex_export_not_found",
      artifactId: record.artifact.id,
      format,
    });
    return;
  }

  if (readyExport.storagePath.startsWith("memory://")) {
    sendJson(res, 200, {
      status: "ephemeral",
      message: "Export was not durably stored. Re-run export.",
      artifactId: record.artifact.id,
      format,
      kind: record.artifact.kind,
      title: record.artifact.title,
      storagePath: readyExport.storagePath,
    });
    return;
  }

  const bucket = getBucket();
  if (!bucket) {
    sendJson(res, 500, { error: "codex_storage_bucket_missing" });
    return;
  }

  const signedUrl = await createCodexSignedUrl(bucket, readyExport.storagePath, 60 * 60);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  if (mode === "preview") {
    sendJson(res, 200, {
      status: "ready",
      mode,
      artifactId: record.artifact.id,
      format,
      kind: record.artifact.kind,
      title: record.artifact.title,
      storagePath: readyExport.storagePath,
      signedUrl,
      expiresAt,
      expiresInSeconds: 60 * 60,
    });
    return;
  }

  if (format !== "html") {
    sendJson(res, 400, {
      error: "persistent_mode_requires_html",
      detail: "Persistent mode is only supported for html exports.",
    });
    return;
  }

  const response = await fetch(signedUrl);
  if (!response.ok) {
    sendJson(res, 500, {
      error: "codex_export_stream_failed",
      detail: `Storage stream failed with ${response.status}`,
    });
    return;
  }

  const html = await response.text();
  res.status(200);
  res.setHeader("Content-Type", "text/html;charset=utf-8");
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  res.end(html);
}
