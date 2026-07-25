// api/gravity.ts — GestaltView v2
// Gravity inspector endpoint for stored Two-Pass Gravity protocol artifacts.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "./_lib/cors.js";
import { getAuthUser } from "./_lib/auth.js";
import { sendJson } from "./_lib/response.js";
import {
  listGravityReportFragments,
  listGravityReports,
  type GravityReportFragmentRow,
  type GravityReportRow,
} from "./_lib/supabase.js";

type GravityReportWithFragments = GravityReportRow & {
  fragments: GravityReportFragmentRow[];
};

function normalizeLimit(value: unknown, fallback = 12): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(50, Math.max(1, Math.floor(parsed)));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const authUser = await getAuthUser(req);
  if (!authUser) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  const limit = normalizeLimit(req.query.limit, 12);
  const reports = await listGravityReports(authUser.id, limit);
  const reportIds = reports.map((report) => report.id);
  const fragments = reportIds.length > 0
    ? await listGravityReportFragments(authUser.id, reportIds, limit * 10)
    : [];

  const fragmentsByReportId = new Map<string, GravityReportFragmentRow[]>();
  for (const fragment of fragments) {
    const current = fragmentsByReportId.get(fragment.gravity_report_id) ?? [];
    current.push(fragment);
    fragmentsByReportId.set(fragment.gravity_report_id, current);
  }

  const reportsWithFragments: GravityReportWithFragments[] = reports.map((report) => ({
    ...report,
    fragments: (fragmentsByReportId.get(report.id) ?? []).sort(
      (a, b) =>
        a.priority_rank - b.priority_rank ||
        b.signal_weight - a.signal_weight ||
        a.chunk_index - b.chunk_index
    ),
  }));

  const strongestReport = reportsWithFragments.reduce<GravityReportWithFragments | null>(
    (current, report) => {
      if (!current) {
        return report;
      }

      return report.signal_weight > current.signal_weight ? report : current;
    },
    null
  );

  sendJson(res, 200, {
    ok: true,
    timestamp: new Date().toISOString(),
    reportCount: reportsWithFragments.length,
    fragmentCount: fragments.length,
    strongestReport: strongestReport
      ? {
          id: strongestReport.id,
          sourceTitle: strongestReport.source_title,
          signalWeight: strongestReport.signal_weight,
          confidence: strongestReport.confidence,
        }
      : null,
    reports: reportsWithFragments,
  });
}
