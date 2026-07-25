import { z } from "zod";

import {
  OpsWorkbookItemSchema,
  WorkbookItemPatchSchema,
  WorkbookItemsResponseSchema,
  WorkbookItemsUpsertResponseSchema,
  WorkbookItemUpsertSchema,
  WorkbookSyncRunsResponseSchema,
} from "@shared/workbook/schemas";

async function request<T>(
  path: string,
  init: RequestInit = {},
  authHeaders: Record<string, string> = {}
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Workbook API request failed: ${response.status}`);
  }

  return payload as T;
}

function parseWithSchema<T>(payload: unknown, schema: z.ZodType<T>, fallbackMessage: string): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  throw new Error(fallbackMessage);
}

export async function listWorkbookItems(
  filters: {
    sheet?: string;
    status?: string;
    priority?: string;
    phase?: string;
  },
  authHeaders: Record<string, string>
) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const payload = await request<unknown>(
    `/api/workbook/items${params.size > 0 ? `?${params.toString()}` : ""}`,
    {},
    authHeaders
  );
  return parseWithSchema(
    payload,
    WorkbookItemsResponseSchema,
    "Workbook API returned malformed items."
  );
}

export async function upsertWorkbookItems(
  items: unknown[],
  authHeaders: Record<string, string>,
  options: { sourceFile?: string; triggeredBy?: string } = {}
) {
  const normalizedItems = items.map((item) => WorkbookItemUpsertSchema.parse(item));
  const payload = await request<unknown>(
    "/api/workbook/items",
    {
      method: "POST",
      body: JSON.stringify({
        items: normalizedItems,
        sourceFile: options.sourceFile,
        triggeredBy: options.triggeredBy,
      }),
    },
    authHeaders
  );
  return parseWithSchema(
    payload,
    WorkbookItemsUpsertResponseSchema,
    "Workbook API returned malformed upsert response."
  );
}

export async function updateWorkbookItem(
  itemId: string,
  patch: unknown,
  authHeaders: Record<string, string>
) {
  const input = WorkbookItemPatchSchema.parse(patch);
  const payload = await request<unknown>(
    `/api/workbook/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    authHeaders
  );
  return parseWithSchema(
    payload,
    z.object({ item: OpsWorkbookItemSchema }),
    "Workbook API returned malformed item update response."
  );
}

export async function listWorkbookSyncRuns(
  authHeaders: Record<string, string>,
  limit = 12
) {
  const payload = await request<unknown>(
    `/api/workbook/sync-runs?limit=${limit}`,
    {},
    authHeaders
  );
  return parseWithSchema(
    payload,
    WorkbookSyncRunsResponseSchema,
    "Workbook API returned malformed sync audit data."
  );
}
