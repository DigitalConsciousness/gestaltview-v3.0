import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../../../_lib/response.js";
import { extractRouteParam, handleTrainerOptions, requireTrainerAdmin } from "../../_helpers.js";
import { listTrainingRunEvents } from "../../../../server/agent-trainer/persistence.js";

const LIST_EVENTS_TIMEOUT_MS = Number.parseInt(process.env.TRAINER_EVENTS_TIMEOUT_MS ?? "8000", 10);

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
          reject(new Error("trainer_events_timeout"));
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

function parseLimit(limit: string | string[] | undefined): number {
  const candidate = Array.isArray(limit) ? limit[0] : limit;
  const parsed = Number(candidate ?? 60);
  if (!Number.isFinite(parsed)) {
    return 60;
  }
  return Math.max(1, Math.min(parsed, 200));
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
    const runId = extractRouteParam(req.query.id, "id");
    const limit = parseLimit(req.query.limit);
    const events = await withTimeout(
      listTrainingRunEvents(runId, limit),
      LIST_EVENTS_TIMEOUT_MS
    );
    sendJson(res, 200, { events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load trainer run events.";
    if (message === "trainer_events_timeout") {
      sendJson(res, 504, {
        error: "Trainer run events request timed out before Supabase returned.",
      });
      return;
    }
    if (message.includes("Missing route parameter")) {
      sendJson(res, 400, {
        error: message,
      });
      return;
    }
    sendJson(res, 500, {
      error: message,
    });
  }
}
