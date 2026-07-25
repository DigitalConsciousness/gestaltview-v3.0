// api/keep-alive.ts — GestaltView v2
// Lightweight cron endpoint that keeps Supabase warm with a minimal REST read.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson } from "./_lib/response.js";
import { traceBraintrust } from "../instrument.js";
import {
  isNodeSentryEnabled,
  withSentryCronMonitor,
  withSentryVercelHandler,
} from "./_lib/sentry.js";

const DEFAULT_SUPABASE_TIMEOUT_MS = 4_000;
const MAX_SUPABASE_TIMEOUT_MS = 8_000;

function firstEnvValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeSupabaseUrl(value: string): string {
  const withoutTrailingSlash = value.trim().replace(/\/+$/, "");
  if (!withoutTrailingSlash) {
    return "";
  }

  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.startsWith("://")) {
    return `https${withoutTrailingSlash}`;
  }

  if (withoutTrailingSlash.startsWith("//")) {
    return `https:${withoutTrailingSlash}`;
  }

  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function resolveSupabaseConfig(): { url: string; key: string } {
  return {
    url: normalizeSupabaseUrl(
      firstEnvValue("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    ),
    key: firstEnvValue(
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    ),
  };
}

function resolveTimeoutMs(): number {
  const parsed = Number.parseInt(
    process.env.SUPABASE_REQUEST_TIMEOUT_MS ?? String(DEFAULT_SUPABASE_TIMEOUT_MS),
    10
  );

  const resolved = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SUPABASE_TIMEOUT_MS;
  return Math.min(resolved, MAX_SUPABASE_TIMEOUT_MS);
}

function describePingError(error: unknown, timeoutMs: number): string {
  if (error instanceof Error && error.name === "AbortError") {
    return `Supabase ping timed out after ${timeoutMs}ms`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

async function pingSupabase(url: string, key: string): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timeoutMs = resolveTimeoutMs();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();

  try {
    const response = await fetch(`${url}/rest/v1/documents?select=document_id&limit=1`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return { ok: true };
    }

    const body = await response.text();
    return {
      ok: false,
      error: `Supabase ping failed: ${response.status}${body ? ` ${body}` : ""}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: describePingError(error, timeoutMs),
    };
  } finally {
    clearTimeout(timer);
  }
}

function sendKeepAliveJson(
  req: VercelRequest,
  res: VercelResponse,
  status: number,
  body: Record<string, unknown>
): void {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "HEAD") {
    res.status(status).end();
    return;
  }

  sendJson(res, status, body);
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "HEAD", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendKeepAliveJson(req, res, 405, { error: "Method not allowed" });
    return;
  }

  return withSentryCronMonitor(
    "gestaltview-keep-alive",
    async () =>
      traceBraintrust(
        {
          name: "keep-alive cron",
          type: "task",
          metadata: {
            route: "/api/keep-alive",
            method: req.method,
          },
        },
        async (span: BraintrustSpan | null) => {
          const started = Date.now();
          const { url, key } = resolveSupabaseConfig();

          span?.log({
            metadata: {
              hasSupabaseUrl: Boolean(url),
              hasSupabaseKey: Boolean(key),
            },
          });

          if (!url || !key) {
            sendKeepAliveJson(req, res, 200, {
              status: "warm",
              note: "Supabase env vars not set; skipping DB ping",
              latency_ms: Date.now() - started,
              ts: new Date().toISOString(),
            });
            return;
          }

          try {
            const ping = await pingSupabase(url, key);

            span?.log({
              metadata: {
                pingOk: ping.ok,
                pingError: ping.error ?? null,
              },
            });

            if (!ping.ok) {
              console.warn("[keep-alive] Supabase ping returned error:", ping.error);
              sendKeepAliveJson(req, res, 200, {
                status: "degraded",
                error: ping.error,
                latency_ms: Date.now() - started,
                ts: new Date().toISOString(),
              });
              return;
            }

            sendKeepAliveJson(req, res, 200, {
              status: "warm",
              latency_ms: Date.now() - started,
              ts: new Date().toISOString(),
            });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("[keep-alive] Unexpected error:", msg);
            sendKeepAliveJson(req, res, 500, {
              status: "error",
              error: msg,
              latency_ms: Date.now() - started,
              ts: new Date().toISOString(),
            });

            if (isNodeSentryEnabled()) {
              throw err instanceof Error ? err : new Error(msg);
            }
          }
        }
      ),
    {
      schedule: { type: "crontab", value: "*/5 * * * *" },
      checkinMargin: 3,
      maxRuntime: 2,
      timezone: "Etc/UTC",
    },
  );
}

export default withSentryVercelHandler(handler, "/api/keep-alive", {
  captureHandledResponseErrors: false,
  runtime: "vercel-cron",
});
