// api/cron/codex-drain.ts
// Codex Job Drain Cron — GestaltView v2
//
// Runs every 2 minutes via Vercel cron.
// Finds up to BATCH_SIZE codex_jobs rows with status='pending' and calls
// runCodexExportJob() on each. This is the "lighter first-ship lane" the
// GenEngine SPEC describes (Layer 5, "Fallback path") — sufficient for HTML
// and JSON exports. Upgrade to Temporal workflows when audio/spatial ship.
//
// Security contract:
//   Server-originated only. Uses SUPABASE_SERVICE_ROLE_KEY via the
//   _persistence.ts module. Never accepts client input. The runner's storage
//   adapter writes to the CODEX_EXPORT_BUCKET bucket (private by default;
//   signed URLs are issued by api/codex/artifacts/[artifactId]/exports.ts).
//
// Idempotency:
//   Each call to runCodexExportJob() transitions a single job pending→running
//   →ready (or →failed). Re-running a 'ready' job is harmless because the
//   storage path is keyed on (artifactId, jobId), and Supabase Storage upload
//   uses upsert:false so a second write would fail cleanly without overwriting.
//   This cron filters to status='pending' so already-running or completed
//   jobs are skipped.
//
// Observability:
//   Returns a JSON summary listing each job processed with status, format,
//   and any error. Vercel function logs preserve the full per-job trace.

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { runCodexExportJob } from "../../workers/codex/runner.js";

const BATCH_SIZE = 5;
const MAX_DURATION_MS = 50_000; // Vercel function ceiling is 60s; leave headroom

function sbHeaders(key: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function isAuthorizedCronRequest(req: VercelRequest): boolean {
  const isCronHeader = req.headers["x-vercel-cron"] === "1";
  const cronSchedule = req.headers["x-vercel-cron-schedule"];
  const isCronSchedule = typeof cronSchedule === "string" && cronSchedule.length > 0;
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization;
  const isBearerMatch = cronSecret ? authHeader === `Bearer ${cronSecret}` : false;

  return isCronHeader || isCronSchedule || isBearerMatch || process.env.NODE_ENV !== "production";
}

type PendingJobRow = { id: string; artifact_id: string; format: string; created_at: string };

async function claimPendingJobs(url: string, key: string): Promise<PendingJobRow[]> {
  const res = await fetch(`${url}/rest/v1/rpc/claim_codex_jobs`, {
    method: "POST",
    headers: sbHeaders(key),
    body: JSON.stringify({ batch_size: BATCH_SIZE }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`claim codex_jobs pending failed: ${res.status} ${text}`);
  }
  return (await res.json()) as PendingJobRow[];
}

type DrainResult = {
  jobId: string;
  artifactId: string;
  format: string;
  outcome: "ready" | "failed" | "skipped_timeout";
  error?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Production cron is restricted to Vercel's cron caller or to an explicit
  // bearer secret for manual recovery invocations.
  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";
  if (!url || !key) {
    res.status(500).json({ error: "supabase_config_missing" });
    return;
  }

  const startedAt = Date.now();
  const results: DrainResult[] = [];

  try {
    const pending = await claimPendingJobs(url, key);
    if (pending.length === 0) {
      res.status(200).json({ status: "idle", processed: 0, results: [] });
      return;
    }

    for (const job of pending) {
      if (Date.now() - startedAt > MAX_DURATION_MS) {
        results.push({
          jobId: job.id,
          artifactId: job.artifact_id,
          format: job.format,
          outcome: "skipped_timeout",
        });
        continue;
      }

      try {
        const out = await runCodexExportJob(job.id);
        results.push({
          jobId: out.job.id,
          artifactId: out.artifactId,
          format: out.manifestItem.format,
          outcome: "ready",
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({
          jobId: job.id,
          artifactId: job.artifact_id,
          format: job.format,
          outcome: "failed",
          error: message,
        });
      }
    }

    const summary = {
      status: "drained",
      processed: results.length,
      ready: results.filter((r) => r.outcome === "ready").length,
      failed: results.filter((r) => r.outcome === "failed").length,
      skipped: results.filter((r) => r.outcome === "skipped_timeout").length,
      durationMs: Date.now() - startedAt,
      results,
    };
    res.status(200).json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "codex_drain_failed", detail: message, processed: results.length, results });
  }
}
