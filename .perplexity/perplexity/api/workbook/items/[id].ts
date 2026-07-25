import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAdmin } from "../../_lib/auth.js";
import { applyCorsHeaders } from "../../_lib/cors.js";
import { sendJson } from "../../_lib/response.js";
import { WorkbookItemPatchSchema } from "../../../shared/workbook/schemas.js";
import { updateWorkbookItem } from "../../../server/workbook/workbook-repository.js";

function routeParam(value: string | string[] | undefined): string {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved?.trim()) {
    throw new Error("Missing workbook item id.");
  }

  return resolved.trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["PATCH", "OPTIONS"],
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
    if (req.method !== "PATCH") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const itemId = routeParam(req.query.id);
    const input = WorkbookItemPatchSchema.parse(req.body ?? {});
    const item = await updateWorkbookItem(itemId, input);
    sendJson(res, 200, { item });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Workbook item update failed.",
    });
  }
}
