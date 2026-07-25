import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAdmin } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import {
  WorkbookItemUpsertSchema,
  WorkbookSheetNameSchema,
} from "../../shared/workbook/schemas.js";
import {
  listWorkbookItems,
  recordWorkbookSyncRun,
  upsertWorkbookItems,
} from "../../server/workbook/workbook-repository.js";

function slugifyWorkbookKey(sheetName: string, label: string): string {
  const base = `${sheetName}-${label}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `${sheetName.toLowerCase()}-item`;
}

function queryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "OPTIONS"],
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
    if (req.method === "GET") {
      const sheet = queryValue(req.query.sheet) ?? queryValue(req.query.sheetName);
      const status = queryValue(req.query.status);
      const priority = queryValue(req.query.priority);
      const phase = queryValue(req.query.phase);

      if (sheet) {
        const parsedSheet = WorkbookSheetNameSchema.safeParse(sheet);
        if (!parsedSheet.success) {
          sendJson(res, 400, { error: "Invalid workbook sheet filter." });
          return;
        }
      }

      const items = await listWorkbookItems({
        sheetName: sheet,
        status,
        priority,
        phase,
      });
      sendJson(res, 200, { items });
      return;
    }

    if (req.method === "POST") {
      const body = (req.body ?? {}) as {
        item?: unknown;
        items?: unknown[];
        sourceFile?: string;
        triggeredBy?: string;
      };
      const rawItems = Array.isArray(body.items)
        ? body.items
        : body.item !== undefined
          ? [body.item]
          : Array.isArray(req.body)
            ? (req.body as unknown[])
            : [];

      if (rawItems.length === 0) {
        sendJson(res, 400, { error: "At least one workbook item is required." });
        return;
      }

      const validItems: Array<{
        sheetName: string;
        rowKey: string;
        label: string;
        category?: string | null;
        status?: string | null;
        priority?: string | null;
        phase?: string | null;
        owner?: string | null;
        targetStart?: string | null;
        targetEnd?: string | null;
        notes?: string | null;
        linkRef?: string | null;
        meta?: Record<string, unknown>;
      }> = [];
      const errors: Array<Record<string, unknown>> = [];

      rawItems.forEach((rawItem, index) => {
        const parsed = WorkbookItemUpsertSchema.safeParse(rawItem);
        if (!parsed.success) {
          errors.push({
            index,
            message: parsed.error.issues.map((issue) => issue.message).join("; "),
          });
          return;
        }

        const item = parsed.data;
        validItems.push({
          ...item,
          rowKey: item.rowKey ?? slugifyWorkbookKey(item.sheetName, item.label),
        });
      });

      const items = validItems.length > 0 ? await upsertWorkbookItems(validItems) : [];
      const syncRun =
        body.sourceFile || body.triggeredBy || errors.length > 0
          ? await recordWorkbookSyncRun({
              triggeredBy: body.triggeredBy ?? "manual",
              sourceFile: body.sourceFile ?? null,
              rowsUpserted: items.length,
              rowsSkipped: errors.length,
              errors,
              status:
                items.length > 0 && errors.length === 0
                  ? "success"
                  : items.length > 0
                    ? "partial"
                    : "failed",
            })
          : null;

      sendJson(res, items.length > 0 ? 200 : 400, {
        items,
        syncRun,
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Workbook request failed.",
    });
  }
}
