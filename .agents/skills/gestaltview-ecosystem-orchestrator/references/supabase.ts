// api/_lib/supabase.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Supabase REST helper — zero external SDK dependency.
// All RPCs now use the canonical 4-param signatures (overload conflict fixed).

const SUPABASE_URL      = process.env.SUPABASE_URL             || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY       || "";

// ─── Row types ─────────────────────────────────────────────────────────────

export interface MatchKnowledgeFragmentRow {
  id:            string;
  content:       string;
  source_file:   string;
  document_type: string;
  chunk_index:   number;
  tags:          string[] | null;
  similarity:    number;
}

export interface SearchKnowledgeFragmentRow {
  id:            string;
  content:       string;
  source_file:   string;
  document_type: string;
  chunk_index:   number;
  tags:          string[] | null;
  rank:          number;
}

export interface FounderContextRow {
  id:              string;
  user_id:         string;
  plk_snapshot:    Record<string, unknown> | null;
  current_state:   string | null;
  mode_preference: "synthesis" | "chat" | null;
  last_session_at: string | null;
  session_thread:  string | null;
  confirmed_adult: boolean | null;
  created_at:      string;
  updated_at:      string;
}

export interface FounderContextUpdate {
  plk_snapshot?:    Record<string, unknown> | null;
  current_state?:   string;
  mode_preference?: "synthesis" | "chat";
  last_session_at?: string;
  session_thread?:  string;
  confirmed_adult?: boolean;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function hasConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

async function request(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

// ─── Generic helpers ───────────────────────────────────────────────────────

export async function insertRow(
  table:   string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!hasConfig()) return false;

  const response = await request(`/rest/v1/${table}`, {
    method:  "POST",
    headers: { Prefer: "return=minimal" },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase insert failed (${table}): ${response.status} ${await response.text()}`
    );
  }
  return true;
}

export async function invokeRpc<T>(
  fn:      string,
  payload: Record<string, unknown>
): Promise<T> {
  if (!hasConfig()) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  const response = await request(`/rest/v1/rpc/${fn}`, {
    method: "POST",
    body:   JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase RPC failed (${fn}): ${response.status} ${await response.text()}`
    );
  }
  return (await response.json()) as T;
}

// ─── Knowledge fragment retrieval ──────────────────────────────────────────
// Both functions now use the canonical 4-param signatures.
// filter_package pushes the constraint server-side; JS-side tag guard is a
// secondary safety net for any edge cases.

export async function matchKnowledgeFragments(params: {
  queryEmbedding: number[];
  topK?:          number;
  packageFilter?: string | null;
}): Promise<MatchKnowledgeFragmentRow[]> {
  const { queryEmbedding, topK = 12, packageFilter = null } = params;

  const rows = await invokeRpc<MatchKnowledgeFragmentRow[]>(
    "match_knowledge_fragments",
    {
      query_embedding: queryEmbedding,
      match_count:     topK,
      filter_type:     null,          // type-level filter — unused for now
      filter_package:  packageFilter, // package-level filter — server-side
    }
  );

  if (!packageFilter) return rows ?? [];

  // JS-side guard (belt + suspenders)
  const tag = `package:${packageFilter}`;
  return (rows ?? []).filter(
    (r) =>
      (r.tags ?? []).includes(packageFilter) ||
      (r.tags ?? []).includes(tag) ||
      r.document_type === packageFilter
  );
}

export async function searchKnowledgeFragments(params: {
  query:          string;
  topK?:          number;
  packageFilter?: string | null;
}): Promise<SearchKnowledgeFragmentRow[]> {
  const { query, topK = 12, packageFilter = null } = params;

  const rows = await invokeRpc<SearchKnowledgeFragmentRow[]>(
    "search_knowledge_fragments",
    {
      query_text:      query,
      match_count:     topK,
      filter_type:     null,
      filter_package:  packageFilter,
    }
  );

  if (!packageFilter) return rows ?? [];

  const tag = `package:${packageFilter}`;
  return (rows ?? []).filter(
    (r) =>
      (r.tags ?? []).includes(packageFilter) ||
      (r.tags ?? []).includes(tag) ||
      r.document_type === packageFilter
  );
}

// ─── Founder context ───────────────────────────────────────────────────────

export async function getFounderContext(
  userId: string
): Promise<FounderContextRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request(
    `/rest/v1/founder_context?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    { method: "GET" }
  );

  if (!response.ok) return null;

  const rows = (await response.json()) as FounderContextRow[];
  return rows[0] ?? null;
}

export async function upsertFounderContext(
  userId:  string,
  payload: FounderContextUpdate
): Promise<boolean> {
  if (!hasConfig() || !userId) return false;

  const response = await request("/rest/v1/founder_context", {
    method:  "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body:    JSON.stringify({
      user_id:    userId,
      ...payload,
      updated_at: new Date().toISOString(),
    }),
  });

  return response.ok;
}

// ─── Pipeline health ───────────────────────────────────────────────────────

export async function checkPipelineHealth(): Promise<{
  ok:      boolean;
  details: string[];
}> {
  if (!hasConfig()) {
    return { ok: false, details: ["Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"] };
  }

  const tables = [
    "knowledge_fragments",
    "bucket_drops",
    "musical_dna_analyses",
    "tribunal_sessions",
    "billy_sessions",
  ];
  const failures: string[] = [];

  await Promise.all(
    tables.map(async (table) => {
      const r = await request(
        `/rest/v1/${table}?select=id&limit=1`,
        { method: "GET" }
      );
      if (!r.ok) failures.push(`${table}: ${r.status}`);
    })
  );

  return { ok: failures.length === 0, details: failures };
}

