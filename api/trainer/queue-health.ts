import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { handleTrainerOptions, requireTrainerAdmin } from "./_helpers.js";
import { getTrainerQueueHealth } from "../../server/agent-trainer/persistence.js";

const QUEUE_HEALTH_TIMEOUT_MS = Number.parseInt(
  process.env.TRAINER_QUEUE_HEALTH_TIMEOUT_MS ?? "5000",
  10
);

function buildEmptyTrainerQueueHealth() {
  return {
    queuedCount: 0,
    leasedCount: 0,
    retryWaitCount: 0,
    failedCount: 0,
    awaitingReviewCount: 0,
    staleLeaseCount: 0,
    onlineWorkerCount: 0,
    offlineWorkerCount: 0,
    oldestQueuedAt: null,
    oldestQueuedAgeMs: null,
    workers: [],
    staleJobs: [],
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timer: NodeJS.Timeout | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("trainer_queue_health_timeout"));
        }, timeoutMs);
        timer.unref?.();
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleTrainerOptions(req, res, ["GET"])) {
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const admin = await requireTrainerAdmin(req, res);
  if (!admin) {
    return;
  }

  try {
    const queueHealth = await withTimeout(getTrainerQueueHealth(), QUEUE_HEALTH_TIMEOUT_MS);
    sendJson(res, 200, { queueHealth });
  } catch (error) {
    if (error instanceof Error && error.message === "trainer_queue_health_timeout") {
      sendJson(res, 200, { queueHealth: buildEmptyTrainerQueueHealth() });
      return;
    }

    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load trainer queue health.",
    });
  }
}
