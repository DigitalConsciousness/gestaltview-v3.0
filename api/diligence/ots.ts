/**
 * GET /api/diligence/ots
 *
 * Reads diligence/exports/ots_index.csv and returns a structured JSON
 * payload of OTS blockchain-timestamp records.
 *
 * Caching: 5-minute in-memory TTL, invalidated via ?refresh=1 or
 * the X-Diligence-Refresh: 1 header (matches existing /api/diligence pattern).
 *
 * Degradation: if the CSV is missing, returns { entries: [], warnings: [...] }
 * rather than a 500 — the UI handles empty state gracefully.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs/promises";
import path from "node:path";
import type { OTSEntry, OTSIndexData } from "../../client/src/components/DiligenceExplorer/types";

// ---------------------------------------------------------------------------
// CSV parser (identical approach to /api/diligence.ts)
// ---------------------------------------------------------------------------
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') { current += '"'; i += 1; }
      else { inQuotes = !inQuotes; }
      continue;
    }
    if (char === "," && !inQuotes) { row.push(current); current = ""; continue; }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = []; current = "";
      continue;
    }
    current += char;
  }
  if (current.length > 0 || row.length > 0) { row.push(current); rows.push(row); }

  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((r) => {
    const item: Record<string, string> = {};
    header.forEach((key, idx) => { item[key.trim()] = (r[idx] || "").trim(); });
    return item;
  });
}

// ---------------------------------------------------------------------------
// Row mapper: CSV column names → OTSEntry (camelCase)
// Column names match the OTS Index sheet headers in the workbook:
//   otsid, otsfilename, proofsizebytes, proofsha256, zipmodifiedutc,
//   originalfilename, originaltitle, targetextension, topicbucket,
//   inferreddate, datetextfound, iscopyvariant, canonicalkey,
//   manifestmatchtype, manifestmatchcount, manifestpackages,
//   manifestpathssample, bundlecompanionpresent, bundlecompanionfiles,
//   indexnote, canonicalgroupcount
// ---------------------------------------------------------------------------
function rowToEntry(r: Record<string, string>): OTSEntry {
  return {
    otsId:                r.otsid                  ?? "",
    otsFilename:          r.otsfilename             ?? "",
    proofSizeBytes:       parseInt(r.proofsizebytes  ?? "0", 10) || 0,
    proofSha256:          r.proofsha256             ?? "",
    zipModifiedUtc:       r.zipmodifiedutc          ?? "",
    originalFilename:     r.originalfilename        ?? "",
    originalTitle:        r.originaltitle           ?? "",
    targetExtension:      r.targetextension         ?? "",
    topicBucket:          r.topicbucket             ?? "",
    inferredDate:         r.inferreddate            ?? "",
    dateTextFound:        r.datetextfound           ?? "",
    isCopyVariant:        r.iscopyvariant?.toUpperCase() === "TRUE",
    canonicalKey:         r.canonicalkey            ?? "",
    manifestMatchType:    (r.manifestmatchtype as OTSEntry["manifestMatchType"]) || "none",
    manifestMatchCount:   parseInt(r.manifestmatchcount ?? "0", 10) || 0,
    manifestPackages:     r.manifestpackages        ?? "",
    manifestPathsSample:  r.manifestpathssample     ?? "",
    bundleCompanionPresent: r.bundlecompanionpresent?.toUpperCase() === "TRUE",
    bundleCompanionFiles: r.bundlecompanionfiles    ?? "",
    indexNote:            r.indexnote               ?? "",
    canonicalGroupCount:  parseInt(r.canonicalgroupcount ?? "1", 10) || 1,
  };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { expiresAt: number; data: OTSIndexData } | null = null;

async function getOTSData(): Promise<OTSIndexData> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const warnings: string[] = [];
  // Path: <repo-root>/diligence/exports/ots_index.csv
  const csvPath = path.resolve(process.cwd(), "diligence", "exports", "ots_index.csv");

  let entries: OTSEntry[] = [];
  try {
    const text = await fs.readFile(csvPath, "utf-8");
    const rows = parseCsv(text);
    // Skip placeholder rows (the seeded CSV has a note row as first data row)
    entries = rows
      .filter((r) => r.otsid && r.otsid.startsWith("OTS-"))
      .map(rowToEntry);
  } catch {
    warnings.push("ots_index.csv not found. Export the OTS Index sheet from GestaltView_Diligence_Workbook_OTS_Indexed.xlsx and place it at diligence/exports/ots_index.csv");
  }

  const result: OTSIndexData = {
    entries,
    total: entries.length,
    last_updated: new Date().toISOString(),
    warnings: warnings.length > 0 ? warnings : undefined,
  };

  cache = { data: result, expiresAt: Date.now() + CACHE_TTL_MS };
  return result;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
function json(res: VercelResponse, body: unknown): void {
  res.status(200).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).setHeader("Allow", "GET");
    json(res, { warnings: ["Method not allowed. Use GET."] });
    return;
  }

  const invalidate = req.query.refresh === "1" || req.headers["x-diligence-refresh"] === "1";
  if (invalidate) cache = null;

  const data = await getOTSData();
  json(res, data);
}
