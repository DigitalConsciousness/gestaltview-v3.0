// api/_lib/response.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

import type { VercelResponse } from "@vercel/node";
import { captureApiResponseError, initNodeSentry } from "./sentry.js";

initNodeSentry({ runtime: "vercel-api" });

export interface ApiEnvelope {
  response:   string;
  provider:   string;
  timestamp:  string;
  free?:      boolean;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?:  Record<string, unknown>;
}

export function sendJson(
  res:    VercelResponse,
  status: number,
  body:   unknown
): void {
  captureApiResponseError(status, body);
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function envelope(
  response: string,
  provider: string,
  options?: Record<string, unknown>
): ApiEnvelope {
  const free = options?.free as boolean | undefined;
  const tokensUsed = options?.tokensUsed as number | null | undefined;
  const processingTime = options?.processingTime as number | undefined;
  const metadata = options?.metadata as Record<string, unknown> | undefined;

  const rest = options
    ? Object.fromEntries(
        Object.entries(options).filter(
          ([k]) => !["free", "tokensUsed", "processingTime", "metadata"].includes(k)
        )
      )
    : undefined;

  const mergedMetadata =
    metadata || rest
      ? { ...(rest ?? {}), ...(metadata ?? {}) }
      : undefined;

  return {
    response,
    provider,
    timestamp: new Date().toISOString(),
    ...(free !== undefined && { free }),
    ...(tokensUsed !== undefined && { tokensUsed }),
    ...(processingTime !== undefined && { processingTime }),
    ...(mergedMetadata && { metadata: mergedMetadata }),
  };
}

export function createResponse<T>(
  response: T,
  provider: string,
  options?: Record<string, unknown>
): {
  response: T;
  provider: string;
  timestamp: string;
  free?: boolean;
  tokensUsed?: number | null;
  processingTime?: number;
  metadata?: Record<string, unknown>;
} {
  const base = envelope("", provider, options);
  return {
    ...base,
    response,
  };
}
