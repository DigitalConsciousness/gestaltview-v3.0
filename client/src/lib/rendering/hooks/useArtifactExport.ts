import { useEffect, useState } from "react";

import type { ExportFormat } from "@shared/codex/contracts";

import {
  buildArtifactExportEndpoint,
  buildCodexJobEndpoint,
  CODEX_EXPORT_POLL_INTERVAL_MS,
  resolveArtifactExportRetrievalMode,
  type ArtifactExportRetrievalMode,
} from "../artifactExport";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type ExportJobResponse = {
  job?: {
    status?: string;
  };
};

type ArtifactExportResponse = {
  status?: string;
  jobId?: string;
  signedUrl?: string;
  expiresAt?: string;
  expiresInSeconds?: number;
  storagePath?: string;
  message?: string;
  artifactId?: string;
  format?: string;
  kind?: string;
  title?: string;
};

export type ArtifactExportState =
  | {
      status: "idle" | "loading";
      artifactId: string;
      format: ExportFormat;
      retrievalMode: ArtifactExportRetrievalMode;
      endpointUrl: string;
    }
  | {
      status: "pending";
      artifactId: string;
      format: ExportFormat;
      retrievalMode: ArtifactExportRetrievalMode;
      endpointUrl: string;
      jobId: string;
      jobStatus: string;
      message?: string;
    }
  | {
      status: "ready";
      artifactId: string;
      format: ExportFormat;
      retrievalMode: ArtifactExportRetrievalMode;
      endpointUrl: string;
      signedUrl?: string;
      html?: string;
      expiresAt?: string;
      expiresInSeconds?: number;
      storagePath?: string;
      message?: string;
      isEphemeral?: boolean;
    }
  | {
      status: "error";
      artifactId: string;
      format: ExportFormat;
      retrievalMode: ArtifactExportRetrievalMode;
      endpointUrl: string;
      error: string;
    };

type UseArtifactExportOptions = {
  artifactId: string;
  format: ExportFormat;
  retrievalMode?: ArtifactExportRetrievalMode;
  enabled?: boolean;
};

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    };

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function pollCodexJob(jobId: string, signal: AbortSignal): Promise<void> {
  while (!signal.aborted) {
    await sleep(CODEX_EXPORT_POLL_INTERVAL_MS, signal);
    if (signal.aborted) {
      return;
    }

    const response = await fetch(buildCodexJobEndpoint(API_BASE, jobId), { signal });
    if (!response.ok) {
      throw new Error(`Job polling failed with ${response.status}`);
    }

    const payload = (await readJson<ExportJobResponse>(response)) ?? {};
    const status = payload.job?.status ?? "pending";

    if (status === "ready") {
      return;
    }

    if (status === "failed") {
      throw new Error("Export job failed.");
    }
  }
}

export function useArtifactExport({
  artifactId,
  format,
  retrievalMode = "preview",
  enabled = true,
}: UseArtifactExportOptions) {
  const resolvedMode = resolveArtifactExportRetrievalMode(retrievalMode, format);
  const endpointUrl = buildArtifactExportEndpoint(API_BASE, artifactId, format, resolvedMode);
  const [refreshToken, setRefreshToken] = useState(0);
  const [state, setState] = useState<ArtifactExportState>({
    status: enabled ? "loading" : "idle",
    artifactId,
    format,
    retrievalMode: resolvedMode,
    endpointUrl,
  });

  useEffect(() => {
    if (!enabled || !artifactId || !format) {
      setState({
        status: "idle",
        artifactId,
        format,
        retrievalMode: resolvedMode,
        endpointUrl,
      });
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setState({
        status: "loading",
        artifactId,
        format,
        retrievalMode: resolvedMode,
        endpointUrl,
      });

      try {
        while (!controller.signal.aborted) {
          const response = await fetch(endpointUrl, {
            signal: controller.signal,
            headers: {
              Accept: resolvedMode === "persistent" ? "text/html,application/json;q=0.9,*/*;q=0.8" : "application/json, text/plain;q=0.9,*/*;q=0.8",
            },
          });

          if (response.status === 202) {
            const payload = (await readJson<ArtifactExportResponse>(response)) ?? {};
            const jobId = String(payload.jobId ?? "");
            setState({
              status: "pending",
              artifactId,
              format,
              retrievalMode: resolvedMode,
              endpointUrl,
              jobId,
              jobStatus: payload.status ?? "pending",
              message: payload.message,
            });

            if (jobId) {
              await pollCodexJob(jobId, controller.signal);
              continue;
            }

            throw new Error("Export job is pending but no job id was returned.");
          }

          if (!response.ok) {
            const payload = (await readJson<{ error?: string; detail?: string }>(response)) ?? {};
            throw new Error(payload.detail ?? payload.error ?? `Export retrieval failed with ${response.status}`);
          }

          if (resolvedMode === "persistent" && format === "html") {
            const html = await response.text();
            setState({
              status: "ready",
              artifactId,
              format,
              retrievalMode: resolvedMode,
              endpointUrl,
              html,
            });
            return;
          }

          const payload = (await readJson<ArtifactExportResponse>(response)) ?? {};
          setState({
            status: "ready",
            artifactId,
            format,
            retrievalMode: resolvedMode,
            endpointUrl,
            signedUrl: payload.signedUrl,
            expiresAt: payload.expiresAt,
            expiresInSeconds: payload.expiresInSeconds,
            storagePath: payload.storagePath,
            message: payload.message,
            isEphemeral: payload.status === "ephemeral",
          });
          return;
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load export.";
        setState({
          status: "error",
          artifactId,
          format,
          retrievalMode: resolvedMode,
          endpointUrl,
          error: message,
        });
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [artifactId, enabled, endpointUrl, format, refreshToken, resolvedMode]);

  const refresh = () => {
    setRefreshToken((current) => current + 1);
  };

  return {
    state,
    refresh,
  };
}
