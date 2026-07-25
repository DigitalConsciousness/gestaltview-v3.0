import {
  type CodexArtifact,
  type ExportManifestItem,
} from "../../shared/codex/contracts.js";
import { mergeManifestItem, sha256Hex, type CodexJob } from "../../shared/codex/manifest.js";
import { storeExport } from "../../shared/codex/storage.js";
import {
  getCodexArtifact,
  getCodexJob,
  updateCodexArtifact,
  updateCodexJob,
} from "../../api/codex/_persistence.js";
import {
  getInnerWorldSupabaseAdmin,
  hasInnerWorldSupabaseConfig,
} from "../../api/_lib/inner-world.js";
import { renderCodexExport } from "./activities.js";

export type CodexExportRunResult = {
  job: CodexJob;
  manifestItem: ExportManifestItem;
  artifactId: string;
  innerWorldMirrored: boolean;
};

const ANONYMOUS_CODEX_USER_ID = "00000000-0000-4000-8000-000000000000";

function extensionForFormat(format: string): string {
  return format === "html" ? "html" : format === "json" ? "json" : format;
}

function storagePathForJob(job: CodexJob): string {
  return `codex/${job.artifactId}/${job.id}.${extensionForFormat(job.format)}`;
}

async function tryStoreExport(params: {
  path: string;
  bytes: Buffer;
  contentType: string;
  isPublic: boolean;
}): Promise<string> {
  const bucket = process.env.CODEX_EXPORT_BUCKET || "";
  if (!bucket) {
    return `memory://${params.path}`;
  }

  await storeExport({
    bucket,
    path: params.path,
    bytes: params.bytes,
    contentType: params.contentType,
    isPublic: params.isPublic,
  });
  return params.path;
}

function summarizeCodexBody(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const maybeSummary = (body as { summary?: unknown }).summary;
  if (typeof maybeSummary === "string") {
    return maybeSummary.slice(0, 1200);
  }

  const maybeHeadline = (body as { headline?: unknown }).headline;
  if (typeof maybeHeadline === "string") {
    return maybeHeadline.slice(0, 1200);
  }

  return "";
}

async function mirrorHtmlExportToInnerWorld(params: {
  artifact: CodexArtifact;
  html: string;
}): Promise<boolean> {
  const userId = params.artifact.userId;
  if (!hasInnerWorldSupabaseConfig() || !userId || userId === ANONYMOUS_CODEX_USER_ID) {
    return false;
  }

  const supabase: any = getInnerWorldSupabaseAdmin();
  const { error } = await supabase.from("inner_world_artifacts").upsert(
    {
      user_id: userId,
      source_ref: params.artifact.id,
      title: params.artifact.title,
      summary: summarizeCodexBody(params.artifact.body),
      source_file_ref: null,
      source_file_id: null,
      html: params.html,
      thumbnail_url: null,
      origin_room: "creation_corner",
      evidence_node_ids: params.artifact.sourceIds ?? [],
      tags: [
        "codex",
        params.artifact.kind,
        params.artifact.templateKey,
      ].filter(Boolean),
    },
    { onConflict: "source_ref" },
  );

  if (error) {
    throw new Error(`inner_world_mirror_failed: ${error.message ?? error}`);
  }

  return true;
}

export async function runCodexExportJob(jobId: string): Promise<CodexExportRunResult> {
  const job = await getCodexJob(jobId);
  if (!job) {
    throw new Error("codex_job_not_found");
  }

  const record = await getCodexArtifact(job.artifactId);
  if (!record) {
    throw new Error("codex_artifact_not_found");
  }

  await updateCodexJob({ ...job, status: "running" });

  try {
    const rendered = await renderCodexExport({
      artifact: record.artifact,
      format: job.format,
    });
    const storagePath = await tryStoreExport({
      path: storagePathForJob(job),
      bytes: rendered.bytes,
      contentType: rendered.contentType,
      isPublic: record.artifact.securityClass === "public",
    });
    const manifestItem: ExportManifestItem = {
      format: job.format,
      status: "ready",
      storagePath,
      mimeType: rendered.contentType,
      bytes: rendered.bytes.byteLength,
      sha256: sha256Hex(rendered.bytes),
    };
    const artifact = mergeManifestItem(record.artifact, manifestItem);
    let innerWorldMirrored = false;
    if (job.format === "html" && manifestItem.status === "ready") {
      innerWorldMirrored = await mirrorHtmlExportToInnerWorld({
        artifact,
        html: rendered.bytes.toString("utf8"),
      });
    }
    const updatedJob: CodexJob = {
      ...job,
      status: "ready",
      storagePath,
      error: undefined,
      updatedAt: new Date().toISOString(),
    };

    await updateCodexArtifact(artifact, record.status);
    await updateCodexJob(updatedJob);

    return {
      job: updatedJob,
      manifestItem,
      artifactId: artifact.id,
      innerWorldMirrored,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Codex export failed.";
    const failedJob: CodexJob = {
      ...job,
      status: "failed",
      error: message,
      retryCount: job.retryCount + 1,
      updatedAt: new Date().toISOString(),
    };
    const artifact = mergeManifestItem(record.artifact, {
      format: job.format,
      status: "failed",
    });

    await updateCodexArtifact(artifact, record.status);
    await updateCodexJob(failedJob);
    throw new Error(message);
  }
}
