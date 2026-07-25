import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs/promises";
import path from "node:path";

interface Claim {
  claimid: string;
  claimtext: string;
  recommendedwording: string;
  status: string;
  lane: "Documented" | "Needs Translation" | "Aspirational";
  evidencefile1: string;
  evidencefile2?: string;
  ownernotes: string;
  evidenceTier: "Primary" | "Secondary" | "Tertiary";
  source: string;
  blockchainanchored?: boolean;
  bitcoinblock?: string;
}

interface ChronologyEntry {
  dateorperiod: string;
  eventorphase: string;
  evidencefile: string;
  package: string;
  confidence: "High" | "Medium" | "Low";
  status: string;
  notes: string;
  blockchainanchored?: boolean;
  bitcoinblock?: string;
}

interface SkepticismEntry {
  objectionid: string;
  objection: string;
  whyithits: string;
  rebuttal: string;
  status: "Resolved" | "Open" | "In Progress";
  neededartifact?: string;
}

interface EvidenceEntry {
  evidencefile: string;
  package: string;
  tier: "Primary" | "Secondary" | "Tertiary";
  claimscovered: string;
  notes: string;
}

interface ArchitectureEntry {
  component: string;
  function: string;
  evidencefile: string;
  evidencetype: string;
  skepticquestionanswered: string;
  status: string;
}

interface BundleSummary {
  createdutc: string;
  packagecount: number;
  totalfileslisted: number;
  duplicaterows: number;
  uniquefilehashes: number;
  otsreceipts?: number;
  packages: string[];
}

interface DiligenceData {
  claims: Claim[];
  chronology: ChronologyEntry[];
  skepticism: SkepticismEntry[];
  evidenceindex: EvidenceEntry[];
  architecturemap: ArchitectureEntry[];
  bundlesummary: BundleSummary;
  lastupdated: string;
  warnings?: string[];
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { expiresAt: number; data: DiligenceData } | null = null;

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim().length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];

  return body.map((r) => {
    const out: Record<string, string> = {};
    header.forEach((key, index) => {
      out[key.trim().toLowerCase()] = (r[index] || "").trim();
    });
    return out;
  });
}

function normalizeLane(lane: string | undefined): Claim["lane"] {
  const value = String(lane ?? "").toLowerCase();
  if (value.includes("needs") && value.includes("translation")) return "Needs Translation";
  if (value.includes("aspirational")) return "Aspirational";
  return "Documented";
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key.toLowerCase()];
    if (value) return value;
  }
  return "";
}

async function readCsv(basePath: string, filenames: string[], warnings: string[]): Promise<Record<string, string>[]> {
  for (const filename of filenames) {
    try {
      const content = await fs.readFile(path.join(basePath, filename), "utf-8");
      return parseCsv(content);
    } catch {
      // try next file
    }
  }

  warnings.push(`Missing data source: ${filenames.join(" or ")}`);
  return [];
}

async function readSummary(basePath: string, warnings: string[]): Promise<BundleSummary> {
  const fallback: BundleSummary = {
    createdutc: new Date().toISOString(),
    packagecount: 0,
    totalfileslisted: 0,
    duplicaterows: 0,
    uniquefilehashes: 0,
    packages: [],
  };

  for (const file of ["bundlesummary.json", "bundle_summary.json"]) {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(basePath, file), "utf-8")) as Record<string, unknown>;
      return {
        createdutc: String(raw.createdutc ?? raw.created_utc ?? fallback.createdutc),
        packagecount: Number(raw.packagecount ?? raw.package_count ?? 0),
        totalfileslisted: Number(raw.totalfileslisted ?? raw.total_files_listed ?? 0),
        duplicaterows: Number(raw.duplicaterows ?? raw.duplicate_rows ?? 0),
        uniquefilehashes: Number(raw.uniquefilehashes ?? raw.unique_file_hashes ?? 0),
        otsreceipts: raw.otsreceipts ? Number(raw.otsreceipts) : undefined,
        packages: Array.isArray(raw.packages) ? (raw.packages as string[]) : [],
      };
    } catch {
      // try next file
    }
  }

  warnings.push("Missing data source: bundlesummary.json");
  return fallback;
}

async function getDiligenceData(): Promise<DiligenceData> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const warnings: string[] = [];
  const candidatePaths = [path.resolve(process.cwd(), "DiligenceReports"), path.resolve(process.cwd(), "Diligence_Reports")];
  const basePath = candidatePaths[0];
  let resolvedPath = basePath;

  for (const p of candidatePaths) {
    try {
      await fs.access(p);
      resolvedPath = p;
      break;
    } catch {
      // continue
    }
  }

  const [claimRows, chronologyRows, skepticismRows, evidenceRows, architectureRows, bundlesummary] = await Promise.all([
    readCsv(resolvedPath, ["claimledger.csv", "claim_ledger.csv", "Claim_Ledger.csv"], warnings),
    readCsv(resolvedPath, ["chronology.csv", "Chronology.csv"], warnings),
    readCsv(resolvedPath, ["skepticismregister.csv", "skepticism_register.csv", "Skepticism_Register.csv"], warnings),
    readCsv(resolvedPath, ["evidenceindex.csv", "evidence_index.csv", "Evidence_Index.csv"], warnings),
    readCsv(resolvedPath, ["architecturemap.csv", "architecture_map.csv", "Architecture_Map.csv"], warnings),
    readSummary(resolvedPath, warnings),
  ]);

  const claims: Claim[] = claimRows.map((row) => {
    const claimtext = pick(row, "claimtext", "claim_text");
    const recommendedwording = pick(row, "recommendedwording", "recommended_wording");
    const ownernotes = pick(row, "ownernotes", "owner_notes");

    return {
      claimid: pick(row, "claimid", "claim_id"),
      claimtext,
      recommendedwording,
      status: pick(row, "status") || "Open",
      lane: normalizeLane(pick(row, "lane")),
      evidencefile1: pick(row, "evidencefile1", "evidence_file_1"),
      evidencefile2: pick(row, "evidencefile2", "evidence_file_2") || undefined,
      ownernotes,
      evidenceTier: "Primary",
      source: [pick(row, "evidencefile1", "evidence_file_1"), pick(row, "evidencefile2", "evidence_file_2")].filter(Boolean).join(" | "),
      blockchainanchored: /anchored|yes|bitcoin|block|blockchain/i.test(`${claimtext} ${recommendedwording} ${ownernotes}`),
      bitcoinblock: `${claimtext} ${ownernotes}`.match(/Block\s+(\d+)/i)?.[1],
    };
  });

  const chronology: ChronologyEntry[] = chronologyRows.map((row) => {
    const notes = pick(row, "notes");

    return {
      dateorperiod: pick(row, "dateorperiod", "date_or_period"),
      eventorphase: pick(row, "eventorphase", "event_or_phase"),
      evidencefile: pick(row, "evidencefile", "evidence_file"),
      package: pick(row, "package"),
      confidence: (pick(row, "confidence") as ChronologyEntry["confidence"]) || "Medium",
      status: pick(row, "status"),
      notes,
      blockchainanchored: /anchored|yes|bitcoin|block|blockchain/i.test(notes),
      bitcoinblock: notes.match(/Block\s+(\d+)/i)?.[1],
    };
  });

  const skepticism: SkepticismEntry[] = skepticismRows.map((row) => {
    const question = pick(row, "skepticquestion", "skeptic_question");
    const idMatch = question.match(/S-\d{3}/i)?.[0]?.toUpperCase() ?? "S-000";
    const objection = question.replace(/S-\d{3}\s*(Objection:)?\s*/i, "").trim();
    const priority = pick(row, "priority");

    let status: SkepticismEntry["status"] = "In Progress";
    if (/resolved/i.test(priority)) status = "Resolved";
    if (/open/i.test(priority)) status = "Open";

    return {
      objectionid: idMatch,
      objection,
      whyithits: pick(row, "whyithits", "why_it_hits"),
      rebuttal: pick(row, "bestresponsestrategy", "best_response_strategy"),
      status,
      neededartifact: pick(row, "neededartifact", "needed_artifact") || undefined,
    };
  });

  const evidenceindex: EvidenceEntry[] = evidenceRows.map((row) => ({
    evidencefile: pick(row, "evidencefile", "evidence_file", "file"),
    package: pick(row, "package"),
    tier: (pick(row, "primaryorsecondary", "primary_or_secondary", "evidence_tier") as EvidenceEntry["tier"]) || "Secondary",
    claimscovered: pick(row, "relevance", "claim_ids_covered"),
    notes: pick(row, "qualitynote", "quality_note", "notes"),
  }));

  const architecturemap: ArchitectureEntry[] = architectureRows.map((row) => ({
    component: pick(row, "component"),
    function: pick(row, "function"),
    evidencefile: pick(row, "evidencefile", "evidence_file"),
    evidencetype: pick(row, "evidencetype", "evidence_type"),
    skepticquestionanswered: pick(row, "skepticquestionanswered", "skeptic_question_answered"),
    status: pick(row, "status"),
  }));

  const result: DiligenceData = {
    claims,
    chronology,
    skepticism,
    evidenceindex,
    architecturemap,
    bundlesummary,
    lastupdated: bundlesummary.createdutc,
    warnings: warnings.length > 0 ? warnings : undefined,
  };

  cache = { expiresAt: Date.now() + CACHE_TTL_MS, data: result };
  return result;
}

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

  const data = await getDiligenceData();
  json(res, data);
}
