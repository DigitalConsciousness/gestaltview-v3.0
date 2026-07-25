import type { ExportFormat, ExportManifestItem } from "@shared/codex/contracts";

export type ArtifactExportRetrievalMode = "preview" | "persistent";

export const CODEX_EXPORT_POLL_INTERVAL_MS = 2_000;
export const CODEX_EXPORT_DEFAULT_HEIGHT = 520;

function normalizeApiBase(apiBase: string): string {
  const trimmed = apiBase.trim();
  if (!trimmed) {
    return "/api";
  }

  return trimmed.replace(/\/+$/, "") || "/api";
}

export function resolveArtifactExportRetrievalMode(
  requestedMode: ArtifactExportRetrievalMode | undefined,
  format: ExportFormat,
): ArtifactExportRetrievalMode {
  if (requestedMode === "persistent" && format === "html") {
    return "persistent";
  }

  return "preview";
}

export function buildArtifactExportEndpoint(
  apiBase: string,
  artifactId: string,
  format: ExportFormat,
  mode: ArtifactExportRetrievalMode,
): string {
  const root = normalizeApiBase(apiBase);
  return `${root}/codex/artifacts/${artifactId}/exports/${format}?mode=${mode}`;
}

export function buildCodexJobEndpoint(apiBase: string, jobId: string): string {
  const root = normalizeApiBase(apiBase);
  return `${root}/codex/jobs/${jobId}`;
}

export function pickInitialArtifactExportFormat(
  exports: Array<Pick<ExportManifestItem, "format" | "status">>,
  defaultFormat?: ExportFormat,
): ExportFormat {
  if (defaultFormat && exports.some((item) => item.format === defaultFormat)) {
    return defaultFormat;
  }

  const ready = exports.find((item) => item.status === "ready");
  if (ready) {
    return ready.format;
  }

  return exports[0]?.format ?? "html";
}

export function shouldShowCodexRerunExportButton(
  exports: Array<Pick<ExportManifestItem, "status">>,
): boolean {
  const hasReadyExport = exports.some((item) => item.status === "ready");
  const hasRetryableExport = exports.some((item) => item.status === "pending" || item.status === "failed");
  return !hasReadyExport && hasRetryableExport;
}

export function getCodexExportFilename(title: string, format: ExportFormat): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "codex-artifact";

  return `${slug}.${format}`;
}
