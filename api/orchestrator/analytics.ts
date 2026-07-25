import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAdmin } from "../_lib/auth.js";
import { sendJson } from "../_lib/response.js";
import { listOrchestrationDecisions, type OrchestrationDecisionRow } from "../_lib/supabase.js";

type CountedItem = {
  label: string;
  count: number;
};

type OrchestrationAnalyticsSummary = {
  totalDecisions: number;
  artifactRate: number;
  persistenceRate: number;
  profileRate: number;
  scaffoldRate: number;
  elevatedSupportRate: number;
  averageConfidence: number;
  supportBreakdown: Record<string, number>;
  topTrigger: CountedItem | null;
  topDestination: CountedItem | null;
  topContentKind: CountedItem | null;
  latestDecisionAt: string | null;
};

function parseLimit(value: unknown, fallback = 24): number {
  const numeric = typeof value === "string" ? Number.parseInt(value, 10) : Array.isArray(value) ? Number.parseInt(value[0] ?? "", 10) : Number.NaN;

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }

  return Math.min(Math.max(numeric, 1), 100);
}

function countBy<T>(rows: T[], selector: (row: T) => string): CountedItem[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = selector(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function topItem(rows: OrchestrationDecisionRow[], selector: (row: OrchestrationDecisionRow) => string): CountedItem | null {
  const counts = countBy(rows, selector);
  return counts[0] ?? null;
}

function summarizeDecisions(rows: OrchestrationDecisionRow[]): OrchestrationAnalyticsSummary {
  const totalDecisions = rows.length;
  const confidenceTotal = rows.reduce((sum, row) => sum + Number(row.confidence ?? 0), 0);
  const supportBreakdown = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.support_level] = (accumulator[row.support_level] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totalDecisions,
    artifactRate: totalDecisions > 0 ? rows.filter((row) => row.should_forge_artifact).length / totalDecisions : 0,
    persistenceRate: totalDecisions > 0 ? rows.filter((row) => row.should_persist_signal).length / totalDecisions : 0,
    profileRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_profile).length / totalDecisions : 0,
    scaffoldRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_scaffold).length / totalDecisions : 0,
    elevatedSupportRate:
      totalDecisions > 0
        ? rows.filter((row) => row.support_level === "elevated" || row.support_level === "immediate").length / totalDecisions
        : 0,
    averageConfidence: totalDecisions > 0 ? confidenceTotal / totalDecisions : 0,
    supportBreakdown,
    topTrigger: topItem(rows, (row) => row.trigger),
    topDestination: topItem(rows, (row) => row.destination),
    topContentKind: topItem(rows, (row) => row.content_kind),
    latestDecisionAt: rows[0]?.triggered_at ?? null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = await requireAdmin(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  const limit = parseLimit(req.query.limit, 24);
  try {
    const rows = await listOrchestrationDecisions(limit + 1);
    const decisions = rows.slice(0, limit);

    sendJson(res, 200, {
      summary: summarizeDecisions(decisions),
      decisions,
      limit,
      hasMore: rows.length > limit,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to load orchestration analytics.",
    });
  }
}
