import { createHash, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  INSIGHT_BOT_SCHEMA_VERSION,
  parseInsightExecutionRequest,
  type InsightExecutionReceipt,
} from "../../shared/insight-bot/contracts.js";
import {
  getInsightBotRuntimeEvent,
  insertRow,
} from "../_lib/supabase.js";

function secureEqual(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

function authorized(req: VercelRequest): boolean {
  const expected = process.env.GESTALTVIEW_RUNTIME_TOKEN?.trim();
  if (!expected) return process.env.NODE_ENV === "test";
  const header = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization;
  return Boolean(header?.startsWith("Bearer ")) &&
    secureEqual(header!.slice(7), expected);
}

function stableUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function receiptFromRow(
  row: Awaited<ReturnType<typeof getInsightBotRuntimeEvent>>,
  replay: boolean,
): InsightExecutionReceipt {
  if (!row) throw new Error("Execution receipt was not found");
  const action = row.event_kind.endsWith("artifact") ? "artifact" : "capture";
  return {
    schemaVersion: INSIGHT_BOT_SCHEMA_VERSION,
    receiptId: row.id,
    requestId: row.request_id,
    action,
    status: "persisted",
    persistedAt: row.created_at,
    idempotentReplay: replay,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!authorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let input;
  try {
    input = parseInsightExecutionRequest(req.body);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid execution request",
    });
    return;
  }

  const receiptId = stableUuid(
    `${input.installationKey}:${input.requestId}:${input.action}:${input.actionIndex}`,
  );
  const existing = await getInsightBotRuntimeEvent(receiptId);
  if (existing) {
    res.status(200).json(receiptFromRow(existing, true));
    return;
  }

  let persisted = false;
  try {
    persisted = await insertRow("insight_bot_runtime_events", {
      id: receiptId,
      request_id: input.requestId,
      event_kind: `approved_${input.action}`,
      payload: {
        schemaVersion: input.schemaVersion,
        installationKey: input.installationKey,
        source: input.source,
        actionIndex: input.actionIndex,
        approvedContent: input.approvedContent,
        consent: input.consent,
        retentionState: "retained_by_explicit_approval",
        publicationState: "not_attempted",
      },
    });
  } catch (error) {
    const raced = await getInsightBotRuntimeEvent(receiptId);
    if (raced) {
      res.status(200).json(receiptFromRow(raced, true));
      return;
    }
    console.error("[insight-bot] execution persistence failed", {
      requestId: input.requestId,
      receiptId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  if (!persisted) {
    res.status(503).json({
      error: "Execution persistence is not configured",
      requestId: input.requestId,
      retryable: true,
    });
    return;
  }

  const stored = await getInsightBotRuntimeEvent(receiptId);
  if (!stored) {
    res.status(503).json({
      error: "Execution could not be confirmed",
      requestId: input.requestId,
      retryable: true,
    });
    return;
  }
  res.status(200).json(receiptFromRow(stored, false));
}
