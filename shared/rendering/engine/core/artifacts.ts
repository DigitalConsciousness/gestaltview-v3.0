import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  ArtifactSink,
  RenderArtifact,
  RenderDiagnostic,
  RenderJob,
  RenderResult,
  SinkMetadata,
} from "./types.js";

export function defaultOutputDirectory(job: RenderJob): string {
  return job.outputDirectory ?? "out/rendering-engine";
}

export async function writeTextArtifact(
  job: RenderJob,
  backend: string,
  filename: string,
  content: string,
  format: string,
  metadata: Record<string, unknown> = {},
): Promise<RenderArtifact> {
  const uri = join(defaultOutputDirectory(job), filename);
  await mkdir(dirname(uri), { recursive: true });
  await writeFile(uri, content, "utf8");
  return {
    uri,
    format,
    backend,
    bytes: Buffer.byteLength(content),
    mimeType: mimeTypeForFormat(format),
    metadata,
  };
}

export function result(
  job: RenderJob,
  backend: string,
  artifacts: RenderArtifact[],
  diagnostics: RenderDiagnostic[] = [],
  manifest: Record<string, unknown> = {},
): RenderResult {
  const fatal = diagnostics.some((item) => item.severity === "fatal");
  return {
    ok: !fatal,
    jobId: job.jobId,
    artifacts,
    diagnostics,
    manifest: {
      engine: "shared/rendering/engine",
      backend,
      graphId: job.graph.graphId,
      generatedAt: new Date().toISOString(),
      artifactCount: artifacts.length,
      ...manifest,
    },
  };
}

export function mimeTypeForFormat(format: string): string {
  const normalized = format.toLowerCase();
  const known: Record<string, string> = {
    html: "text/html; charset=utf-8",
    svg: "image/svg+xml",
    mmd: "text/plain; charset=utf-8",
    markdown: "text/markdown; charset=utf-8",
    md: "text/markdown; charset=utf-8",
    json: "application/json",
    txt: "text/plain; charset=utf-8",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return known[normalized] ?? "application/octet-stream";
}

function computeHash(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function toBuffer(bytes: Uint8Array | string): Buffer {
  return typeof bytes === "string" ? Buffer.from(bytes, "utf8") : Buffer.from(bytes);
}

function encodeStoragePath(path: string): string {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

export class MemoryArtifactSink implements ArtifactSink {
  readonly kind = "memory";
  readonly artifacts = new Map<string, RenderArtifact>();

  async store(bytes: Uint8Array | string, meta: SinkMetadata): Promise<RenderArtifact> {
    const content = toBuffer(bytes);
    const hash = computeHash(content);
    const key = `${meta.jobId}/${meta.filename}`;
    const artifact: RenderArtifact = {
      uri: `memory://${key}`,
      format: meta.format,
      mimeType: meta.mimeType,
      backend: meta.backend,
      bytes: content.length,
      hash,
      targetStatus: "success",
      metadata: meta.metadata ?? {},
    };
    this.artifacts.set(key, artifact);
    return artifact;
  }
}

export class FileArtifactSink implements ArtifactSink {
  readonly kind = "file";

  constructor(private readonly rootDir = "out/rendering-engine") {}

  async store(bytes: Uint8Array | string, meta: SinkMetadata): Promise<RenderArtifact> {
    const content = toBuffer(bytes);
    const hash = computeHash(content);
    const relPath = `rendered/${meta.userId}/${meta.jobId}/${meta.filename}`;
    const absPath = join(this.rootDir, relPath);
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, content);
    return {
      uri: absPath,
      format: meta.format,
      mimeType: meta.mimeType,
      backend: meta.backend,
      bytes: content.length,
      hash,
      targetStatus: "success",
      storageBucket: "local",
      storagePath: relPath,
      metadata: meta.metadata ?? {},
    };
  }
}

export class SupabaseArtifactSink implements ArtifactSink {
  readonly kind = "supabase";

  constructor(
    private readonly supabaseUrl: string,
    private readonly serviceKey: string,
    private readonly bucket = "codex-exports",
  ) {
    if (!supabaseUrl || !serviceKey) {
      throw new Error("SupabaseArtifactSink requires a URL and service-role key.");
    }
  }

  async store(bytes: Uint8Array | string, meta: SinkMetadata): Promise<RenderArtifact> {
    const content = toBuffer(bytes);
    const hash = computeHash(content);
    const storagePath = `rendered/${meta.userId}/${meta.jobId}/${meta.filename}`;
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${encodeURIComponent(
      this.bucket,
    )}/${encodeStoragePath(storagePath)}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceKey}`,
        apikey: this.serviceKey,
        "Content-Type": meta.mimeType,
        "x-upsert": "false",
      },
      body: content as BodyInit,
    });

    if (!response.ok) {
      throw new Error(`Supabase upload failed (${response.status}): ${await response.text()}`);
    }

    const uploaded = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const uploadId = String(uploaded.Id ?? uploaded.id ?? "");

    return {
      uri: `supabase://${this.bucket}/${storagePath}`,
      format: meta.format,
      mimeType: meta.mimeType,
      backend: meta.backend,
      bytes: content.length,
      hash,
      targetStatus: "success",
      storageBucket: this.bucket,
      storagePath,
      metadata: {
        ...(meta.metadata ?? {}),
        ...(uploadId ? { storageUploadId: uploadId } : {}),
      },
    };
  }
}
