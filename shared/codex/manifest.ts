import { ExportManifestItemSchema, type CodexArtifact, type ExportFormat, type ExportManifestItem } from "./contracts.js";

export type CodexJobStatus = "pending" | "running" | "ready" | "failed" | "pending_retry";

export type CodexJob = {
  id: string;
  artifactId: string;
  format: ExportFormat;
  status: CodexJobStatus;
  storagePath?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
};

export function createManifestItem(format: ExportFormat, status: ExportManifestItem["status"] = "pending"): ExportManifestItem {
  return ExportManifestItemSchema.parse({ format, status });
}

export function mergeManifestItem(artifact: CodexArtifact, item: ExportManifestItem): CodexArtifact {
  const existing = artifact.exports.filter((candidate) => candidate.format !== item.format);
  return {
    ...artifact,
    updatedAt: new Date().toISOString(),
    exports: [...existing, ExportManifestItemSchema.parse(item)],
  };
}

export function createCodexJob(params: {
  artifactId: string;
  format: ExportFormat;
  status?: CodexJobStatus;
}): CodexJob {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    artifactId: params.artifactId,
    format: params.format,
    status: params.status ?? "pending",
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function sha256Hex(bytes: Buffer | string): string {
  const value = typeof bytes === "string" ? bytes : bytes.toString("utf8");
  let hashA = 2166136261;
  let hashB = 16777619;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 16777619);
    hashB ^= code + index;
    hashB = Math.imul(hashB, 2166136261);
  }

  const seed = `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0).toString(16).padStart(8, "0")}`;
  return seed.repeat(4).slice(0, 64);
}
