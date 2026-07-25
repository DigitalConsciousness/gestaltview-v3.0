// api/cron/provenance-upgrade.ts
// Provenance Upgrade Cron — GestaltView v2
//
// Runs every 2 hours via Vercel cron.
// Finds all provenance_envelopes with ots_status='pending' older than
// 90 minutes (enough time for ~9 Bitcoin block confirmations) and attempts
// to upgrade each .ots receipt with a Bitcoin block attestation.
//
// Security contract:
//   Only digest hashes travel to OTS calendar nodes — never private content.
//   This handler uses SUPABASE_SERVICE_ROLE_KEY and is server-originated only.

import type { VercelRequest, VercelResponse } from "@vercel/node";

const CONFIRM_WINDOW_MS = 90 * 60 * 1000; // 90 minutes
const BATCH_SIZE = 20;

const OTS_CALENDARS = [
  "https://alice.btc.calendar.opentimestamps.org",
  "https://bob.btc.calendar.opentimestamps.org",
  "https://finney.calendar.eternitywall.com",
];

const STORAGE_BUCKET = "provenance-receipts";

// ── Supabase helpers ──────────────────────────────────────────────────────────

function sbHeaders(key: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function sbSelect(
  url: string,
  key: string,
  table: string,
  params: URLSearchParams
): Promise<unknown[]> {
  const res = await fetch(`${url}/rest/v1/${table}?${params.toString()}`, {
    headers: sbHeaders(key),
  });
  if (!res.ok) throw new Error(`Supabase select ${table} failed: ${res.status}`);
  return res.json() as Promise<unknown[]>;
}

async function sbPatch(
  url: string,
  key: string,
  table: string,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: sbHeaders(key),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase patch ${table}/${id} failed: ${res.status}`);
}

async function storageDownload(
  url: string,
  key: string,
  path: string
): Promise<ArrayBuffer> {
  const res = await fetch(
    `${url}/storage/v1/object/${STORAGE_BUCKET}/${path}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!res.ok) throw new Error(`Storage download failed: ${res.status} — ${path}`);
  return res.arrayBuffer();
}

async function storageUpload(
  url: string,
  key: string,
  path: string,
  data: ArrayBuffer
): Promise<void> {
  const res = await fetch(
    `${url}/storage/v1/object/${STORAGE_BUCKET}/${path}`,
    {
      method: "PUT",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
      },
      body: data,
    }
  );
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} — ${path}`);
}

// ── OTS upgrade attempt ───────────────────────────────────────────────────────

async function attemptOtsUpgrade(
  receiptBytes: ArrayBuffer
): Promise<{ upgraded: boolean; bytes?: ArrayBuffer; calendar?: string }> {
  for (const calendar of OTS_CALENDARS) {
    try {
      const res = await fetch(`${calendar}/timestamp/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: receiptBytes,
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) {
        const upgraded = await res.arrayBuffer();
        return { upgraded: true, bytes: upgraded, calendar };
      }
      console.warn(`[provenance-upgrade] ${calendar} returned ${res.status}`);
    } catch (err) {
      console.warn(`[provenance-upgrade] ${calendar} error:`, err);
    }
  }
  return { upgraded: false };
}

// ── Per-envelope upgrade ──────────────────────────────────────────────────────

type EnvelopeRow = {
  id: string;
  ots_receipt_path: string | null;
  envelope_json: Record<string, unknown>;
};

async function upgradeOne(
  sbUrl: string,
  sbKey: string,
  row: EnvelopeRow
): Promise<"upgraded" | "skipped" | "failed"> {
  const { id, ots_receipt_path, envelope_json } = row;

  if (!ots_receipt_path) {
    console.warn(`[provenance-upgrade] no receipt_path for ${id} — skipping`);
    return "skipped";
  }

  let receiptBytes: ArrayBuffer;
  try {
    receiptBytes = await storageDownload(sbUrl, sbKey, ots_receipt_path);
  } catch (err) {
    console.warn(`[provenance-upgrade] storage download failed for ${id}:`, err);
    return "failed";
  }

  const result = await attemptOtsUpgrade(receiptBytes);
  const now = new Date().toISOString();

  if (!result.upgraded || !result.bytes) {
    // Bitcoin not yet confirmed — update last_checked_at only
    const updatedEnvJson = {
      ...envelope_json,
      ots: {
        ...((envelope_json.ots as Record<string, unknown>) ?? {}),
        last_checked_at: now,
      },
    };
    await sbPatch(sbUrl, sbKey, "provenance_envelopes", id, {
      envelope_json: updatedEnvJson,
    }).catch((e) => console.warn(`[provenance-upgrade] last_checked update failed ${id}:`, e));
    return "skipped";
  }

  // Write upgraded receipt bytes back to storage
  try {
    await storageUpload(sbUrl, sbKey, ots_receipt_path, result.bytes);
  } catch (err) {
    console.error(`[provenance-upgrade] storage upload failed for ${id}:`, err);
    return "failed";
  }

  // Patch row to upgraded
  const bitcoinAttestation = {
    calendar: result.calendar,
    upgraded_at: now,
    receipt_size_bytes: result.bytes.byteLength,
  };
  const updatedEnvJson = {
    ...envelope_json,
    ots: {
      ...((envelope_json.ots as Record<string, unknown>) ?? {}),
      status: "upgraded",
      bitcoin_attestation: bitcoinAttestation,
      last_checked_at: now,
    },
  };

  await sbPatch(sbUrl, sbKey, "provenance_envelopes", id, {
    ots_status: "upgraded",
    upgraded_at: now,
    bitcoin_attestation: bitcoinAttestation,
    envelope_json: updatedEnvJson,
  });

  console.log(`[provenance-upgrade] ✓ upgraded ${id} via ${result.calendar}`);
  return "upgraded";
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sbUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sbUrl || !sbKey) {
    res.status(500).json({ error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured" });
    return;
  }

  const ranAt = new Date().toISOString();
  const cutoff = new Date(Date.now() - CONFIRM_WINDOW_MS).toISOString();

  let rows: EnvelopeRow[];
  try {
    const params = new URLSearchParams({
      select: "id,ots_receipt_path,envelope_json",
      ots_status: "eq.pending",
      created_at: `lt.${cutoff}`,
      limit: String(BATCH_SIZE),
      order: "created_at.asc",
    });
    rows = (await sbSelect(sbUrl, sbKey, "provenance_envelopes", params)) as EnvelopeRow[];
  } catch (err) {
    console.error("[provenance-upgrade] failed to query pending envelopes:", err);
    res.status(500).json({ error: String(err), ran_at: ranAt });
    return;
  }

  console.log(`[provenance-upgrade] ${rows.length} envelopes eligible (cutoff: ${cutoff})`);

  const counts = { upgraded: 0, skipped: 0, failed: 0 };
  const failedIds: string[] = [];

  for (const row of rows) {
    const outcome = await upgradeOne(sbUrl, sbKey, row).catch((err) => {
      console.error(`[provenance-upgrade] unhandled error for ${row.id}:`, err);
      return "failed" as const;
    });
    counts[outcome]++;
    if (outcome === "failed") failedIds.push(row.id);
  }

  const summary = {
    ran_at: ranAt,
    total: rows.length,
    ...counts,
    failed_ids: failedIds,
  };

  console.log("[provenance-upgrade] complete:", summary);
  res.status(200).json(summary);
}
