import { createHash } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "";

export function renderIdempotencyKey(params: {
  sourceFamily: string;
  sourceId: string;
  targetFormats: string[];
  userId: string;
  graphFingerprint?: string;
  clientKey?: string;
}): string {
  const normalized = [
    "render-contract-v2",
    params.sourceFamily,
    params.sourceId,
    [...params.targetFormats].map((value) => value.toLowerCase()).sort().join(","),
    params.userId,
    params.graphFingerprint ?? "",
    params.clientKey ?? "",
  ].join("::");

  return `ik_${createHash("sha256").update(normalized).digest("hex")}`;
}

export interface ExistingRenderJob {
  id: string;
  status: string;
  graph_id: string;
  created_at: string;
  diagnostics?: unknown;
  manifest?: Record<string, unknown>;
}

export async function findExistingRenderJob(
  idempotencyKey: string,
  userId: string,
): Promise<ExistingRenderJob | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Render persistence is not configured.");
  }

  const query = new URLSearchParams({
    idempotency_key: `eq.${idempotencyKey}`,
    user_id: `eq.${userId}`,
    select: "id,status,graph_id,created_at,diagnostics,manifest",
    limit: "1",
    order: "created_at.desc",
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/render_jobs?${query}`, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Idempotency lookup failed (${response.status}): ${await response.text()}`);
  }

  const rows = (await response.json()) as ExistingRenderJob[];
  return rows[0] ?? null;
}

export function isJobTerminal(job: ExistingRenderJob): boolean {
  return ["ready", "failed", "cancelled"].includes(job.status);
}
