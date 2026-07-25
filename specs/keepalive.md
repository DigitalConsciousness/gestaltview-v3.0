## File 1 — `api/keep-alive.ts`

Implemented at `api/keep-alive.ts` in the repo root.

```typescript
// api/keep-alive.ts
// Lightweight cron endpoint that keeps Supabase warm with a minimal REST read.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./_lib/cors.js";
import { sendJson } from "./_lib/response.js";

const DEFAULT_SUPABASE_TIMEOUT_MS = 12_000;

function firstEnvValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function normalizeSupabaseUrl(value: string): string {
  const withoutTrailingSlash = value.trim().replace(/\/+$/, "");
  if (!withoutTrailingSlash) return "";
  if (/^https?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  if (withoutTrailingSlash.startsWith("://")) return `https${withoutTrailingSlash}`;
  if (withoutTrailingSlash.startsWith("//")) return `https:${withoutTrailingSlash}`;
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
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SUPABASE_TIMEOUT_MS;
}

async function pingSupabase(url: string, key: string): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), resolveTimeoutMs());
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

    if (response.ok) return { ok: true };

    const body = await response.text();
    return {
      ok: false,
      error: `Supabase ping failed: ${response.status}${body ? ` ${body}` : ""}`,
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
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

  const started = Date.now();
  const { url, key } = resolveSupabaseConfig();

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
  }
}
```

***

## File 2 — `vercel.json` (full swap)

The existing `vercel.json` keeps the repo's current build/install settings and rewrites. The critical addition is the `crons` array, plus an explicit function entry for `api/keep-alive.ts`.

```json
{
  "installCommand": "npm ci --include=dev --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": null,
  "functions": {
    "api/keep-alive.ts": {
      "includeFiles": "api/_lib/**"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

> **`"*/5 * * * *"` = every 5 minutes.** Supabase's free tier idles after roughly 5 minutes of inactivity, so this keeps it just inside that window. If you're on a paid Supabase plan with no idle cutoff, you can relax this to `"*/10 * * * *"` to save Vercel cron invocations.

***

## What this does and doesn't fix

**Does fix:** Supabase cold starts causing slow first Billy responses, trainer API timeouts, and the session dashboard hanging on load.  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_31e9a325-9c48-4ad3-8c45-da9bf15c1f65/7e034e4a-d6ac-49de-bdeb-7fa86ddf0e02/CurrentState.md)

**Doesn't fix:** The founder persistence failure — that's still the network response body we need to catch in DevTools. This is a separate issue. The keep-alive only warms the DB connection; it doesn't change auth or session write logic.

**One thing to verify after deploy:** Check Vercel's Functions tab → Cron Jobs. It should show `/api/keep-alive` running every 5 minutes. If it shows as skipped, confirm your Vercel plan supports cron jobs (Hobby plan supports 2 crons, Pro supports more).  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_31e9a325-9c48-4ad3-8c45-da9bf15c1f65/373e456d-bd74-4ede-8457-905a6998f1b0/README.md)
