import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAdmin } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { listWorkbookSyncRuns } from "../../server/workbook/workbook-repository.js";

function queryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const admin = await requireAdmin(req);
  if ("status" in admin) {
    sendJson(res, admin.status, admin.body);
    return;
  }

  try {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const requestedLimit = Number.parseInt(queryValue(req.query.limit) ?? "12", 10);
    const syncRuns = await listWorkbookSyncRuns(
      Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 12
    );
    sendJson(res, 200, { syncRuns });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Workbook sync audit request failed.",
    });
  }
}
