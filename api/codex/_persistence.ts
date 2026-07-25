import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CodexArtifact, ExportFormat } from "../../shared/codex/contracts.js";
import { createCodexJob, mergeManifestItem, type CodexJob } from "../../shared/codex/manifest.js";

type ArtifactRow = {
  id: string;
  contract_version: string;
  kind: string;
  title: string;
  slug: string;
  user_id: string;
  workspace_id: string | null;
  security_class: string;
  template_key: string;
  template_version: string;
  body: unknown;
  provenance: unknown;
  source_ids: unknown;
  exports: unknown;
  meta: unknown;
  status: string;
  created_at: string;
  updated_at: string;
};

const memoryArtifacts = new Map<string, { artifact: CodexArtifact; status: string }>();
const memoryJobs = new Map<string, CodexJob>();
const memoryArtifactIds = new Set<string>();
let cachedClient: SupabaseClient | null = null;
const ANONYMOUS_CODEX_USER_ID = "00000000-0000-4000-8000-000000000000";

function hasSupabaseConfig(): boolean {
  if (process.env.VITEST || process.env.NODE_ENV === "test" || process.env.CODEX_DISABLE_SUPABASE === "true") {
    return false;
  }

  return Boolean(
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
  );
}

function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "",
    { auth: { persistSession: false } },
  );
  return cachedClient;
}

function artifactToRow(artifact: CodexArtifact, status: string): Omit<ArtifactRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: artifact.id,
    contract_version: artifact.contractVersion,
    kind: artifact.kind,
    title: artifact.title,
    slug: artifact.slug,
    user_id: artifact.userId,
    workspace_id: artifact.workspaceId ?? null,
    security_class: artifact.securityClass,
    template_key: artifact.templateKey,
    template_version: artifact.templateVersion,
    body: artifact.body,
    provenance: artifact.provenance,
    source_ids: artifact.sourceIds,
    exports: artifact.exports,
    meta: artifact.meta,
    status,
    created_at: artifact.createdAt,
    updated_at: artifact.updatedAt,
  };
}

function rowToArtifact(row: ArtifactRow): CodexArtifact {
  return {
    id: row.id,
    contractVersion: "codex.v1",
    kind: row.kind,
    title: row.title,
    slug: row.slug,
    userId: row.user_id,
    workspaceId: row.workspace_id ?? undefined,
    securityClass: row.security_class,
    templateKey: row.template_key,
    templateVersion: row.template_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceIds: Array.isArray(row.source_ids) ? row.source_ids : [],
    provenance: Array.isArray(row.provenance) ? row.provenance : [],
    exports: Array.isArray(row.exports) ? row.exports : [],
    meta: typeof row.meta === "object" && row.meta !== null ? row.meta as Record<string, unknown> : {},
    body: row.body,
  } as CodexArtifact;
}

export async function persistCodexArtifact(artifact: CodexArtifact, status = "draft"): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase || artifact.userId === ANONYMOUS_CODEX_USER_ID) {
    memoryArtifacts.set(artifact.id, { artifact, status });
    memoryArtifactIds.add(artifact.id);
    return;
  }

  const { error } = await (supabase as any).from("codex_artifacts").insert(artifactToRow(artifact, status));
  if (error) {
    throw error;
  }
}

export async function getCodexArtifact(artifactId: string): Promise<{ artifact: CodexArtifact; status: string } | null> {
  if (memoryArtifactIds.has(artifactId)) {
    return memoryArtifacts.get(artifactId) ?? null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return memoryArtifacts.get(artifactId) ?? null;
  }

  const { data, error } = await (supabase as any)
    .from("codex_artifacts")
    .select("*")
    .eq("id", artifactId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? { artifact: rowToArtifact(data), status: data.status } : null;
}

export async function updateCodexArtifact(artifact: CodexArtifact, status?: string): Promise<void> {
  const supabase = getSupabaseClient();
  const existing = memoryArtifacts.get(artifact.id);

  if (!supabase || memoryArtifactIds.has(artifact.id) || artifact.userId === ANONYMOUS_CODEX_USER_ID) {
    memoryArtifacts.set(artifact.id, { artifact, status: status ?? existing?.status ?? "draft" });
    memoryArtifactIds.add(artifact.id);
    return;
  }

  const { error } = await (supabase as any)
    .from("codex_artifacts")
    .update(artifactToRow(artifact, status ?? existing?.status ?? "draft"))
    .eq("id", artifact.id);

  if (error) {
    throw error;
  }
}

export async function enqueueCodexExportJob(artifactId: string, format: ExportFormat): Promise<CodexJob> {
  const job = createCodexJob({ artifactId, format });
  const supabase = getSupabaseClient();

  if (!supabase || memoryArtifactIds.has(artifactId)) {
    memoryJobs.set(job.id, job);
    return job;
  }

  const { error } = await (supabase as any).from("codex_jobs").insert({
    id: job.id,
    artifact_id: job.artifactId,
    format: job.format,
    status: job.status,
    retry_count: job.retryCount,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  });

  if (error) {
    throw error;
  }

  return job;
}

export async function getCodexJob(jobId: string): Promise<CodexJob | null> {
  const memoryJob = memoryJobs.get(jobId);
  if (memoryJob) {
    return memoryJob;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await (supabase as any)
    .from("codex_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? {
        id: data.id,
        artifactId: data.artifact_id,
        format: data.format,
        status: data.status,
        storagePath: data.storage_path ?? undefined,
        error: data.error ?? undefined,
        retryCount: data.retry_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    : null;
}

export async function listCodexJobsForArtifact(artifactId: string): Promise<CodexJob[]> {
  const memoryMatches = Array.from(memoryJobs.values()).filter((job) => job.artifactId === artifactId);
  if (memoryArtifactIds.has(artifactId) || memoryMatches.length > 0) {
    return memoryMatches;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return memoryMatches;
  }

  const { data, error } = await (supabase as any)
    .from("codex_jobs")
    .select("*")
    .eq("artifact_id", artifactId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (Array.isArray(data) ? data : []).map((row) => ({
    id: row.id,
    artifactId: row.artifact_id,
    format: row.format,
    status: row.status,
    storagePath: row.storage_path ?? undefined,
    error: row.error ?? undefined,
    retryCount: row.retry_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function ensureCodexExportJobsForArtifact(artifactId: string): Promise<CodexJob[]> {
  const record = await getCodexArtifact(artifactId);
  if (!record) {
    return [];
  }

  const jobs = await listCodexJobsForArtifact(artifactId);
  const existingFormats = new Set(jobs.map((job) => job.format));
  const created: CodexJob[] = [];
  let artifact = record.artifact;

  for (const manifestItem of record.artifact.exports) {
    if (manifestItem.status !== "pending" || existingFormats.has(manifestItem.format)) {
      continue;
    }

    const job = await enqueueCodexExportJob(artifactId, manifestItem.format);
    created.push(job);
    existingFormats.add(job.format);
    artifact = mergeManifestItem(artifact, {
      format: manifestItem.format,
      status: "pending",
    });
  }

  if (created.length > 0) {
    await updateCodexArtifact(artifact, record.status);
  }

  return created;
}

export async function updateCodexJob(job: CodexJob): Promise<void> {
  const supabase = getSupabaseClient();
  const updated = { ...job, updatedAt: new Date().toISOString() };

  if (!supabase || memoryJobs.has(job.id) || memoryArtifactIds.has(job.artifactId)) {
    memoryJobs.set(updated.id, updated);
    return;
  }

  const { error } = await (supabase as any)
    .from("codex_jobs")
    .update({
      status: updated.status,
      storage_path: updated.storagePath ?? null,
      error: updated.error ?? null,
      retry_count: updated.retryCount,
      updated_at: updated.updatedAt,
    })
    .eq("id", updated.id);

  if (error) {
    throw error;
  }
}
