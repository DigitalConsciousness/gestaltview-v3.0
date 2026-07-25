import { useEffect, useRef, useState } from "react";
import { ExternalLink, Download, Share2, RefreshCw, AlertTriangle, FileCode2 } from "lucide-react";
import { toast } from "sonner";

import type { CodexArtifact, ExportFormat } from "@shared/codex/contracts";
import { cn } from "@/lib/utils";

import HtmlArtifactRenderer from "./renderers/HtmlArtifactRenderer";
import {
  getCodexExportFilename,
  pickInitialArtifactExportFormat,
  shouldShowCodexRerunExportButton,
  type ArtifactExportRetrievalMode,
} from "./artifactExport";
import { useArtifactExport } from "./hooks/useArtifactExport";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type ArtifactExportViewerProps = {
  artifact: CodexArtifact;
  showToolbar?: boolean;
  defaultFormat?: ExportFormat;
  retrievalMode?: ArtifactExportRetrievalMode;
  mode?: "inline" | "fullscreen";
  className?: string;
  fallbackHtml?: string;
};

function exportFormatLabel(format: ExportFormat, status: string): string {
  return `${format} · ${status}`;
}

export function shouldToastExportReady(previousStatus?: string, currentStatus?: string): boolean {
  return previousStatus === "pending" && currentStatus === "ready";
}

export function resolveArtifactExportViewerHtml({
  selectedFormat,
  exportHtml,
  fallbackHtml,
}: {
  selectedFormat: ExportFormat;
  exportHtml?: string;
  fallbackHtml?: string;
}): string | undefined {
  if (selectedFormat !== "html") {
    return undefined;
  }

  return fallbackHtml ?? exportHtml;
}

export function ArtifactExportViewer({
  artifact,
  showToolbar = true,
  defaultFormat,
  retrievalMode = "preview",
  mode = "inline",
  className,
  fallbackHtml,
}: ArtifactExportViewerProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(() =>
    pickInitialArtifactExportFormat(artifact.exports, defaultFormat),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setSelectedFormat(pickInitialArtifactExportFormat(artifact.exports, defaultFormat));
  }, [artifact.id, artifact.exports.length, defaultFormat]);

  const selectedManifest = artifact.exports.find((item) => item.format === selectedFormat) ?? artifact.exports[0];
  const exportState = useArtifactExport({
    artifactId: artifact.id,
    format: selectedFormat,
    retrievalMode,
  });

  const resolvedOpenUrl = exportState.state.status === "ready" && exportState.state.signedUrl
    ? exportState.state.signedUrl
    : exportState.state.endpointUrl;

  const canShare = artifact.kind === "share_card" || artifact.securityClass === "public";
  const canRerun = shouldShowCodexRerunExportButton(artifact.exports);
  const selectedMimeType = selectedManifest?.mimeType?.toLowerCase() ?? "";
  const canOpenExport = exportState.state.status === "ready"
    && !exportState.state.isEphemeral
    && Boolean(exportState.state.signedUrl || exportState.state.html);
  const htmlSource = exportState.state.status === "ready" ? exportState.state.html : undefined;
  const viewerHtml = resolveArtifactExportViewerHtml({
    selectedFormat,
    exportHtml: htmlSource,
    fallbackHtml,
  });

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const currentStatus = exportState.state.status;
    previousStatusRef.current = currentStatus;

    if (shouldToastExportReady(previousStatus, currentStatus)) {
      toast.success("Export ready", {
        description: `${artifact.title} ${selectedFormat} is ready to open or download.`,
      });
    }
  }, [artifact.title, exportState.state.status, selectedFormat]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}.`);
    }
  };

  const handleOpen = () => {
    window.open(resolvedOpenUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async () => {
    const fileName = getCodexExportFilename(artifact.title, selectedFormat);
    if (exportState.state.status === "ready" && exportState.state.html) {
      const blob = new Blob([exportState.state.html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = resolvedOpenUrl;
    anchor.download = fileName;
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  const handleShare = async () => {
    await copyToClipboard(resolvedOpenUrl, "Export link");
  };

  const handleRerun = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`${API_BASE}/codex/artifacts/${artifact.id}/drain-exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Export drain failed with ${response.status}`);
      }

      toast.success("Export rendering restarted.");
      exportState.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export rendering failed.";
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section className={cn("overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm", className)}>
      {showToolbar ? (
        <header className="border-b border-white/10 bg-black/20 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-sky-200">
                  Codex export viewer
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-gv-text-secondary">
                  {artifact.kind}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-gv-text-secondary">
                  {artifact.securityClass}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">{artifact.title}</h3>
              <p className="max-w-3xl text-xs leading-6 text-gv-text-secondary">
                {artifact.templateKey} · {artifact.contractVersion} · retrieval {exportState.state.retrievalMode}
              </p>
              {exportState.state.status === "pending" && (
                <p className="text-xs text-amber-300">
                  {exportState.state.message ?? "Export is still rendering."} Polling job {exportState.state.jobId || "…"}.
                </p>
              )}
              {exportState.state.status === "error" && (
                <p className="flex items-center gap-2 text-xs text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {exportState.state.error}
                </p>
              )}
              {exportState.state.status === "ready" && exportState.state.isEphemeral && (
                <p className="text-xs text-amber-300">
                  {exportState.state.message ?? "This export is ephemeral and must be regenerated."}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpen}
                disabled={!canOpenExport}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!canOpenExport}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs text-sky-200 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!canOpenExport}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              )}
              {canRerun && (
                <button
                  type="button"
                  onClick={handleRerun}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                  Re-run export
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {artifact.exports.map((item) => (
              <button
                key={`${artifact.id}:${item.format}`}
                type="button"
                onClick={() => setSelectedFormat(item.format)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  selectedFormat === item.format
                    ? "border-sky-500/40 bg-sky-500/15 text-sky-100"
                    : "border-white/10 bg-white/[0.03] text-gv-text-secondary hover:border-white/20 hover:text-white",
                )}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                {exportFormatLabel(item.format, item.status)}
              </button>
            ))}
          </div>
        </header>
      ) : null}

      <div className={cn(mode === "fullscreen" ? "p-0" : "p-4 sm:p-5")}>
        {exportState.state.status === "loading" || exportState.state.status === "pending" ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-white">Loading export</p>
            <p className="mt-1 max-w-md text-xs leading-6 text-gv-text-secondary">
              {exportState.state.status === "pending"
                ? "The export job is still working. We will keep polling until it is ready."
                : "Retrieving the selected export from Codex."}
            </p>
          </div>
        ) : exportState.state.status === "error" && fallbackHtml ? (
          <div className="space-y-3">
            <div className="rounded-[1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Export retrieval failed, so we are showing the local fallback preview instead.
            </div>
            <HtmlArtifactRenderer
              title={artifact.title}
              html={fallbackHtml}
              retrievalMode="persistent"
              mode={mode}
              minHeight={560}
            />
          </div>
        ) : exportState.state.status === "ready" && selectedFormat === "html" && viewerHtml ? (
          <HtmlArtifactRenderer
            title={artifact.title}
            html={viewerHtml}
            retrievalMode="persistent"
            mode={mode}
            minHeight={560}
          />
        ) : exportState.state.status === "ready" && exportState.state.signedUrl && canOpenExport ? (
          <div className="space-y-3">
            <div className="rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3 text-xs text-gv-text-secondary">
              Selected format {selectedFormat} uses a signed URL. Open it in a new tab or download it to inspect the raw export.
            </div>
            {selectedMimeType.startsWith("image/") ? (
              <img
                src={exportState.state.signedUrl}
                alt={`${artifact.title} export`}
                className="max-h-[72vh] w-full rounded-[1rem] border border-white/10 object-contain"
              />
            ) : selectedMimeType.startsWith("audio/") ? (
              <audio controls src={exportState.state.signedUrl} className="w-full" />
            ) : selectedMimeType.startsWith("video/") ? (
              <video controls src={exportState.state.signedUrl} className="w-full rounded-[1rem] border border-white/10" />
            ) : selectedMimeType.includes("pdf") ? (
              <iframe
                title={`${artifact.title} pdf export`}
                src={exportState.state.signedUrl}
                className="min-h-[72vh] w-full rounded-[1rem] border border-white/10 bg-black"
              />
            ) : (
              <iframe
                title={`${artifact.title} export`}
                src={exportState.state.signedUrl}
                className="min-h-[72vh] w-full rounded-[1rem] border border-white/10 bg-black"
              />
            )}
          </div>
        ) : exportState.state.status === "ready" && exportState.state.html && canOpenExport ? (
          <HtmlArtifactRenderer
            title={artifact.title}
            html={exportState.state.html}
            retrievalMode="persistent"
            mode={mode}
            minHeight={560}
          />
        ) : fallbackHtml ? (
          <HtmlArtifactRenderer
            title={artifact.title}
            html={fallbackHtml}
            retrievalMode="persistent"
            mode={mode}
            minHeight={560}
          />
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-sm text-gv-text-secondary">
            {selectedFormat === "zip"
              ? "This export is packaged as a download. Open or download it from the toolbar."
              : "The selected export is not ready yet."}
          </div>
        )}
      </div>
    </section>
  );
}
