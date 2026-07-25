// api/cron/profile-portrait-cadence.ts
// Profile Portrait Monthly Cadence Cron — GestaltView v2
//
// First-of-month sweep that enqueues cadence refreshes for users whose latest
// validated/rendered portrait predates the current month.

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { listMonthlyPortraitCadenceCandidates } from "../_lib/profilePortraitPersistence.js";
import { invokeRpc } from "../_lib/supabase.js";

const BATCH_SIZE = 1_000;

type CadenceResult = {
  userId: string;
  portraitId: string;
  version: number;
  createdAt: string;
  outcome: "queued" | "skipped" | "failed";
  error?: string;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status);
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function isAuthorized(req: VercelRequest): boolean {
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "unauthorized" });
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    sendJson(res, 500, { error: "supabase_config_missing" });
    return;
  }

  const startedAt = Date.now();
  const monthFloor = new Date();
  monthFloor.setUTCDate(1);
  monthFloor.setUTCHours(0, 0, 0, 0);
  const seenUsers = new Set<string>();
  const results: CadenceResult[] = [];

  try {
    const candidates = await listMonthlyPortraitCadenceCandidates(BATCH_SIZE);

    if (candidates.length === 0) {
      sendJson(res, 200, { status: "idle", queued: 0, skipped: 0, results: [] });
      return;
    }

    for (const candidate of candidates) {
      if (seenUsers.has(candidate.user_id)) {
        continue;
      }

      seenUsers.add(candidate.user_id);

      if (new Date(candidate.created_at) >= monthFloor) {
        results.push({
          userId: candidate.user_id,
          portraitId: candidate.id,
          version: candidate.version,
          createdAt: candidate.created_at,
          outcome: "skipped",
        });
        continue;
      }

      try {
        const queued = await invokeRpc<boolean>("maybe_queue_portrait_cadence", {
          p_user_id: candidate.user_id,
          p_priority: 1,
        });

        results.push({
          userId: candidate.user_id,
          portraitId: candidate.id,
          version: candidate.version,
          createdAt: candidate.created_at,
          outcome: queued ? "queued" : "skipped",
        });
      } catch (error) {
        results.push({
          userId: candidate.user_id,
          portraitId: candidate.id,
          version: candidate.version,
          createdAt: candidate.created_at,
          outcome: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    sendJson(res, 200, {
      status: "scheduled",
      queued: results.filter((result) => result.outcome === "queued").length,
      skipped: results.filter((result) => result.outcome === "skipped").length,
      failed: results.filter((result) => result.outcome === "failed").length,
      durationMs: Date.now() - startedAt,
      results,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "profile_portrait_cadence_failed",
      detail: error instanceof Error ? error.message : String(error),
      queued: 0,
      skipped: 0,
      results,
    });
  }
}
