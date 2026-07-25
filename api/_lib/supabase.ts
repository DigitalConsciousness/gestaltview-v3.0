// api/_lib/supabase.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Supabase REST helper — zero external SDK dependency.
// Supports knowledge fragments, skill fragments, persistent memory,
// founder context, session rate limits, and pipeline health checks.

import { createHash } from "node:crypto";

const SUPABASE_URL = normalizeSupabaseUrl(
  process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
);

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";
const FOUNDER_CONTEXT_CACHE_TTL_MS = 30_000;
const SUPABASE_REQUEST_TIMEOUT_MS = Number.parseInt(process.env.SUPABASE_REQUEST_TIMEOUT_MS ?? "12000", 10);
const founderContextCache = new Map<
  string,
  {
    value: FounderContextRow | null;
    expiresAt: number;
  }
>();

// ─── Row types ─────────────────────────────────────────────────────────────

export interface MatchKnowledgeFragmentRow {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  chunk_index: number;
  tags: string[] | null;
  similarity: number;
}

export interface SearchKnowledgeFragmentRow {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  chunk_index: number;
  tags: string[] | null;
  rank: number;
}

export interface MatchSkillFragmentRow {
  id: string;
  content: string;
  source_file: string;
  skill_name: string | null;
  chunk_index: number;
  tags: string[] | null;
  similarity: number;
}

export interface SearchSkillFragmentRow {
  id: string;
  content: string;
  source_file: string;
  skill_name: string | null;
  chunk_index: number;
  tags: string[] | null;
  rank: number;
}

export interface MatchMemoryEntryRow {
  id: string;
  title: string | null;
  summary: string | null;
  content: string;
  kind: string;
  scope: string;
  importance: number;
  pinned: boolean;
  tags: string[] | null;
  similarity: number;
}

export interface SearchMemoryEntryRow {
  id: string;
  title: string | null;
  summary: string | null;
  content: string;
  kind: string;
  scope: string;
  importance: number;
  pinned: boolean;
  tags: string[] | null;
  rank: number;
}

export interface MemoryEntryRow {
  id: string;
  user_id: string;
  scope: string;
  kind: string;
  title: string | null;
  summary: string | null;
  content: string;
  content_hash: string;
  source: string;
  source_ref: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  importance: number;
  pinned: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntryUpsert {
  scope?: string;
  kind?: string;
  title?: string | null;
  summary?: string | null;
  content: string;
  content_hash: string;
  embedding?: number[] | null;
  source?: string;
  source_ref?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importance?: number;
  pinned?: boolean;
  archived_at?: string | null;
}

export interface MemoryEntryUpdate {
  scope?: string;
  kind?: string;
  title?: string | null;
  summary?: string | null;
  content?: string;
  content_hash?: string;
  embedding?: number[] | null;
  source?: string;
  source_ref?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importance?: number;
  pinned?: boolean;
  archived_at?: string | null;
}

export interface FounderContextRow {
  id: string;
  user_id: string;
  plk_snapshot: Record<string, unknown> | null;
  current_state: string | null;
  mode_preference: "synthesis" | "chat" | null;
  last_session_at: string | null;
  session_thread: string | null;
  confirmed_adult: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface FounderContextUpdate {
  plk_snapshot?: Record<string, unknown> | null;
  current_state?: string;
  mode_preference?: "synthesis" | "chat";
  last_session_at?: string;
  session_thread?: string;
  confirmed_adult?: boolean;
}

export interface GravityReportRow {
  id: string;
  user_id: string;
  source_title: string;
  source_uri: string | null;
  source_type: string | null;
  source_kind: string | null;
  source_fingerprint: string;
  surface_map: Record<string, unknown>;
  gravity_report: Record<string, unknown>;
  signal_weight: number;
  confidence: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GravityReportFragmentRow {
  id: string;
  user_id: string;
  gravity_report_id: string;
  knowledge_fragment_id: string;
  chunk_index: number;
  priority_rank: number;
  signal_weight: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BucketDropRow {
  id: string;
  user_id: string;
  content: string;
  raw_text: string | null;
  capture_context: Record<string, unknown>;
  created_at: string;
  subject_id: string | null;
  module_key: string | null;
  intensity: number;
  plk_resonance_score: number | string;
  specialized_apps: string[];
  tags: string[];
  stage: string;
  promoted_memory_id: string | null;
  scored_at: string | null;
  promoted_at: string | null;
}

export interface OrchestrationDecisionRow {
  id: string;
  decision_id: string;
  triggered_at: string;
  user_id: string | null;
  trigger: string;
  source_room: string;
  detected_state: string;
  support_level: string;
  content_kind: string;
  destination: string;
  artifact_target_type: string | null;
  artifact_destination: string | null;
  synthesis_style: string;
  processors: string[];
  export_formats: string[];
  next_action: string;
  should_forge_artifact: boolean;
  should_persist_signal: boolean;
  should_update_profile: boolean;
  should_update_scaffold: boolean;
  confidence: number | string;
  user_facing_summary: string;
  markers: string[] | null;
  context_clues: string[] | null;
  has_image: boolean;
  has_audio: boolean;
  has_video: boolean;
  has_file: boolean;
  input_payload: Record<string, unknown> | null;
  decision_payload: Record<string, unknown> | null;
  internal_diagnostics: string[] | null;
  created_at: string;
}

export interface UserAccountRow {
  id: string;
  email: string;
  tier: "free" | "core" | "pro" | "enterprise";
  subscription_status: "active" | "inactive" | "past_due" | "canceled" | "trialing" | null;
  billing_period_start: string | null;
  billy_query_count: number;
  is_admin: boolean;
  grace_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAccountUpdate {
  email?: string;
  tier?: UserAccountRow["tier"];
  subscription_status?: UserAccountRow["subscription_status"];
  billing_period_start?: string | null;
  billy_query_count?: number;
  is_admin?: boolean;
  grace_until?: string | null;
}

export interface VoiceProfileRow {
  id: string;
  profile_slug: string;
  display_name: string;
  provider_preference: "local" | "hf" | "elevenlabs" | "browser" | "deepgram";
  tts_model: string | null;
  stt_model: string | null;
  speaker_id: string | null;
  style_preset: Record<string, unknown>;
  fallback_text_only: boolean;
  consent_notes: string | null;
  provider_config: Record<string, unknown>;
  review_status: "proposed" | "auditioned" | "approved" | "rejected";
  last_auditioned_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceProfileUpdate {
  profile_slug?: string;
  display_name?: string;
  provider_preference?: VoiceProfileRow["provider_preference"];
  tts_model?: string | null;
  stt_model?: string | null;
  speaker_id?: string | null;
  style_preset?: Record<string, unknown>;
  fallback_text_only?: boolean;
  consent_notes?: string | null;
  provider_config?: Record<string, unknown>;
  review_status?: VoiceProfileRow["review_status"];
  last_auditioned_at?: string | null;
  approved_at?: string | null;
}

export interface WorkspaceRoomRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  member_count: number;
  recent_activity: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceRoomUpsert {
  name: string;
  description?: string | null;
  role?: WorkspaceRoomRow["role"];
  member_count?: number;
  recent_activity?: string;
}

export interface WorkspaceRoomUpdate {
  name?: string;
  description?: string | null;
  role?: WorkspaceRoomRow["role"];
  member_count?: number;
  recent_activity?: string;
}

export interface WorkspaceDocumentRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  filename: string;
  file_size_bytes: number;
  file_type: string;
  raw_text: string | null;
  analysis_status: "pending" | "processing" | "completed" | "failed";
  analysis_summary: string;
  key_points: Array<string | Record<string, unknown>>;
  topics: string[];
  sentiment: string;
  word_count: number;
  reading_time_minutes: number;
  analysis_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDocumentUpsert {
  workspace_id?: string | null;
  filename: string;
  file_size_bytes?: number;
  file_type?: string;
  raw_text?: string | null;
  analysis_status?: WorkspaceDocumentRow["analysis_status"];
  analysis_summary?: string;
  key_points?: Array<string | Record<string, unknown>>;
  topics?: string[];
  sentiment?: string;
  word_count?: number;
  reading_time_minutes?: number;
  analysis_payload?: Record<string, unknown>;
}

export interface WorkspaceDocumentUpdate {
  workspace_id?: string | null;
  filename?: string;
  file_size_bytes?: number;
  file_type?: string;
  raw_text?: string | null;
  analysis_status?: WorkspaceDocumentRow["analysis_status"];
  analysis_summary?: string;
  key_points?: Array<string | Record<string, unknown>>;
  topics?: string[];
  sentiment?: string;
  word_count?: number;
  reading_time_minutes?: number;
  analysis_payload?: Record<string, unknown>;
}

export interface CorpusDocumentSyncInput {
  workspaceDocumentId: string;
  userId: string;
  workspaceId?: string | null;
  filename: string;
  fileSizeBytes?: number;
  fileType?: string;
  rawText?: string | null;
  analysisSummary?: string;
  keyPoints?: Array<string | Record<string, unknown>>;
  topics?: string[];
  sentiment?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
  analysisPayload?: Record<string, unknown>;
}

export interface OrchestrationRunRow {
  id: string;
  run_id: string;
  decision_id: string;
  user_id: string | null;
  trigger: string;
  source_room: string;
  content_kind: string;
  spawn_mode: string;
  gate_state: string;
  worker_count: number;
  run_status: string;
  input_payload: Record<string, unknown>;
  decision_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrchestrationWorkerRunRow {
  id: string;
  run_id: string;
  worker_id: string;
  label: string;
  status: string;
  summary: string;
  depends_on: string[];
  result_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const USER_ACCOUNT_SELECT =
  "id,email,tier,subscription_status,billing_period_start,billy_query_count,is_admin,grace_until,created_at,updated_at";

const MEMORY_ENTRY_SELECT =
  "id,user_id,scope,kind,title,summary,content,content_hash,source,source_ref,tags,metadata,importance,pinned,archived_at,created_at,updated_at";

const WORKSPACE_ROOM_SELECT =
  "id,user_id,name,description,role,member_count,recent_activity,created_at,updated_at";

const WORKSPACE_DOCUMENT_SELECT =
  "id,user_id,workspace_id,filename,file_size_bytes,file_type,raw_text,analysis_status,analysis_summary,key_points,topics,sentiment,word_count,reading_time_minutes,analysis_payload,created_at,updated_at";

const DOCS_PIPELINE_PROCESSING_SELECT =
  "run_id,tenant_id,status,model,corpus_root,documents_count,chunks_count,created_by,created_at,updated_at";

const DOCS_PIPELINE_DOCUMENT_SELECT =
  "document_id,run_id,tenant_id,path,filename,hash,chunk_index,total_chunks,file_size_bytes,content,mime_type,extracted_metadata,provenance,created_by,created_at";

const DOCS_PIPELINE_FRAGMENT_SELECT =
  "id,content,content_hash,source_file,document_type,chunk_index,total_chunks,char_count,tags,created_at";

const ORCHESTRATION_DECISION_SELECT =
  "id,decision_id,triggered_at,user_id,trigger,source_room,detected_state,support_level,content_kind,destination,artifact_target_type,artifact_destination,synthesis_style,processors,export_formats,next_action,should_forge_artifact,should_persist_signal,should_update_profile,should_update_scaffold,confidence,user_facing_summary,markers,context_clues,has_image,has_audio,has_video,has_file,input_payload,decision_payload,internal_diagnostics,created_at";

const ORCHESTRATION_RUN_SELECT =
  "id,run_id,decision_id,user_id,trigger,source_room,content_kind,spawn_mode,gate_state,worker_count,run_status,input_payload,decision_payload,created_at,updated_at";

const ORCHESTRATION_WORKER_RUN_SELECT =
  "id,run_id,worker_id,label,status,summary,depends_on,result_payload,created_at,updated_at";

// ─── Internal helpers ──────────────────────────────────────────────────────

function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.startsWith("://")) {
    return `https${withoutTrailingSlash}`;
  }

  if (withoutTrailingSlash.startsWith("//")) {
    return `https:${withoutTrailingSlash}`;
  }

  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function hasConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);
}

function stableUuidFromText(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function normalizeCorpusText(value: string | null | undefined): string {
  return (value ?? "").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

function hashCorpusText(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

type SupabaseRequestInit = RequestInit & {
  accessToken?: string | null;
};

async function request(path: string, init: SupabaseRequestInit): Promise<Response> {
  const { accessToken, ...requestInit } = init;
  const controller = new AbortController();
  const timer =
    Number.isFinite(SUPABASE_REQUEST_TIMEOUT_MS) && SUPABASE_REQUEST_TIMEOUT_MS > 0
      ? setTimeout(() => controller.abort("supabase_request_timeout"), SUPABASE_REQUEST_TIMEOUT_MS)
      : null;
  timer?.unref?.();

  try {
    return await fetch(`${SUPABASE_URL}${path}`, {
      ...requestInit,
      signal: requestInit.signal ?? controller.signal,
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${(accessToken ?? "").trim() || SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(requestInit.headers ?? {}),
      },
    });
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function readCachedFounderContext(userId: string): FounderContextRow | null | undefined {
  const entry = founderContextCache.get(userId);
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    return undefined;
  }

  return entry.value;
}

function readStaleCachedFounderContext(userId: string): FounderContextRow | null | undefined {
  return founderContextCache.get(userId)?.value;
}

function writeCachedFounderContext(userId: string, value: FounderContextRow | null): void {
  founderContextCache.set(userId, {
    value,
    expiresAt: Date.now() + FOUNDER_CONTEXT_CACHE_TTL_MS,
  });
}

function filterRowsByPackage<T extends { tags: string[] | null }>(
  rows: T[] | null | undefined,
  packageFilter: string | null
): T[] {
  if (!packageFilter) return rows ?? [];

  const tag = `package:${packageFilter}`;
  return (rows ?? []).filter(
    (row) =>
      (row.tags ?? []).includes(packageFilter) ||
      (row.tags ?? []).includes(tag)
  );
}

function filterSkillRows<T extends { skill_name: string | null; tags: string[] | null }>(
  rows: T[] | null | undefined,
  skillFilter: string | null
): T[] {
  if (!skillFilter) return rows ?? [];
  return (rows ?? []).filter(
    (row) =>
      row.skill_name === skillFilter ||
      (row.tags ?? []).includes(skillFilter)
  );
}

// ─── Generic helpers ───────────────────────────────────────────────────────

export async function insertRow(
  table: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!hasConfig()) return false;

  const response = await request(`/rest/v1/${table}`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase insert failed (${table}): ${response.status} ${await response.text()}`
    );
  }

  return true;
}

export async function listBucketDrops(userId: string, limit = 100): Promise<BucketDropRow[]> {
  if (!hasConfig() || !userId) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 250)
    : 100;

  const response = await request(
    `/rest/v1/bucket_drops?user_id=eq.${encodeURIComponent(userId)}&select=id,user_id,content,raw_text,capture_context,created_at,subject_id,module_key,intensity,plk_resonance_score,specialized_apps,tags,stage,promoted_memory_id,scored_at,promoted_at&order=created_at.desc&limit=${safeLimit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as BucketDropRow[];
}

export async function listOrchestrationDecisions(limit = 100): Promise<OrchestrationDecisionRow[]> {
  if (!hasConfig()) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 250)
    : 100;

  const response = await request(
    `/rest/v1/orchestration_decisions?select=${encodeURIComponent(ORCHESTRATION_DECISION_SELECT)}&order=triggered_at.desc&limit=${safeLimit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as OrchestrationDecisionRow[];
}

export async function listOrchestrationRuns(limit = 100): Promise<OrchestrationRunRow[]> {
  if (!hasConfig()) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 250)
    : 100;

  const response = await request(
    `/rest/v1/orchestration_runs?select=${encodeURIComponent(ORCHESTRATION_RUN_SELECT)}&order=created_at.desc&limit=${safeLimit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as OrchestrationRunRow[];
}

export async function listOrchestrationWorkerRuns(runId: string): Promise<OrchestrationWorkerRunRow[]> {
  if (!hasConfig() || !runId) return [];

  const response = await request(
    `/rest/v1/orchestration_worker_runs?run_id=eq.${encodeURIComponent(runId)}&select=${encodeURIComponent(ORCHESTRATION_WORKER_RUN_SELECT)}&order=created_at.asc`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as OrchestrationWorkerRunRow[];
}

export async function invokeRpc<T>(
  fn: string,
  payload: Record<string, unknown>
): Promise<T> {
  if (!hasConfig()) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  const response = await request(`/rest/v1/rpc/${fn}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase RPC failed (${fn}): ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()) as T;
}

// ─── Knowledge fragment retrieval ──────────────────────────────────────────

export async function matchKnowledgeFragments(params: {
  queryEmbedding: number[];
  topK?: number;
  packageFilter?: string | null;
}): Promise<MatchKnowledgeFragmentRow[]> {
  const { queryEmbedding, topK = 12, packageFilter = null } = params;

  const payload = {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_type: packageFilter,
    filter_package: packageFilter,
  };

  const initialRows = await invokeRpc<MatchKnowledgeFragmentRow[]>(
    "match_knowledge_fragments",
    payload
  );

  const filteredRows = filterRowsByPackage(initialRows, packageFilter);
  if (!packageFilter || filteredRows.length > 0) {
    return filteredRows;
  }

  const fallbackRows = await invokeRpc<MatchKnowledgeFragmentRow[]>(
    "match_knowledge_fragments",
    {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_type: null,
      filter_package: null,
    }
  );

  return filterRowsByPackage(fallbackRows, packageFilter);
}

export async function searchKnowledgeFragments(params: {
  query: string;
  topK?: number;
  packageFilter?: string | null;
}): Promise<SearchKnowledgeFragmentRow[]> {
  const { query, topK = 12, packageFilter = null } = params;

  const payload = {
    query_text: query,
    match_count: topK,
    filter_type: packageFilter,
    filter_package: packageFilter,
  };

  const initialRows = await invokeRpc<SearchKnowledgeFragmentRow[]>(
    "search_knowledge_fragments",
    payload
  );

  const filteredRows = filterRowsByPackage(initialRows, packageFilter);
  if (!packageFilter || filteredRows.length > 0) {
    return filteredRows;
  }

  const fallbackRows = await invokeRpc<SearchKnowledgeFragmentRow[]>(
    "search_knowledge_fragments",
    {
      query_text: query,
      match_count: topK,
      filter_type: null,
      filter_package: null,
    }
  );

  return filterRowsByPackage(fallbackRows, packageFilter);
}

// ─── Skill fragment retrieval ───────────────────────────────────────────────

export async function matchSkillFragments(params: {
  queryEmbedding: number[];
  topK?: number;
  skillFilter?: string | null;
}): Promise<MatchSkillFragmentRow[]> {
  const { queryEmbedding, topK = 8, skillFilter = null } = params;

  const payload = {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_skill: skillFilter,
  };

  try {
    const rows = await invokeRpc<MatchSkillFragmentRow[]>(
      "match_skill_fragments",
      payload
    );
    const filteredRows = filterSkillRows(rows, skillFilter);
    if (!skillFilter || filteredRows.length > 0) return filteredRows;
    // fallback: no filter
    const fallback = await invokeRpc<MatchSkillFragmentRow[]>("match_skill_fragments", {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_skill: null,
    });
    return filterSkillRows(fallback, skillFilter);
  } catch {
    // skill_fragments table may be empty during early ingestion — degrade silently
    return [];
  }
}

export async function searchSkillFragments(params: {
  query: string;
  topK?: number;
  skillFilter?: string | null;
}): Promise<SearchSkillFragmentRow[]> {
  const { query, topK = 8, skillFilter = null } = params;

  const payload = {
    query_text: query,
    match_count: topK,
    filter_skill: skillFilter,
  };

  try {
    const rows = await invokeRpc<SearchSkillFragmentRow[]>(
      "search_skill_fragments",
      payload
    );
    const filteredRows = filterSkillRows(rows, skillFilter);
    if (!skillFilter || filteredRows.length > 0) return filteredRows;
    const fallback = await invokeRpc<SearchSkillFragmentRow[]>("search_skill_fragments", {
      query_text: query,
      match_count: topK,
      filter_skill: null,
    });
    return filterSkillRows(fallback, skillFilter);
  } catch {
    return [];
  }
}

// ─── Persistent memory retrieval ───────────────────────────────────────────

export async function matchMemoryEntries(params: {
  userId: string;
  queryEmbedding: number[];
  topK?: number;
  scope?: string | null;
  kind?: string | null;
}): Promise<MatchMemoryEntryRow[]> {
  const {
    userId,
    queryEmbedding,
    topK = 4,
    scope = null,
    kind = null,
  } = params;

  if (!userId) return [];

  try {
    return await invokeRpc<MatchMemoryEntryRow[]>("match_memory_entries", {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_user_id: userId,
      filter_scope: scope,
      filter_kind: kind,
    });
  } catch {
    return [];
  }
}

export async function searchMemoryEntries(params: {
  userId: string;
  query: string;
  topK?: number;
  scope?: string | null;
  kind?: string | null;
}): Promise<SearchMemoryEntryRow[]> {
  const {
    userId,
    query,
    topK = 4,
    scope = null,
    kind = null,
  } = params;

  if (!userId || !query.trim()) return [];

  try {
    return await invokeRpc<SearchMemoryEntryRow[]>("search_memory_entries", {
      query_text: query,
      match_count: topK,
      filter_user_id: userId,
      filter_scope: scope,
      filter_kind: kind,
    });
  } catch {
    return [];
  }
}

export async function listMemoryEntries(params: {
  userId: string;
  limit?: number;
  scope?: string | null;
  kind?: string | null;
  pinnedOnly?: boolean;
  includeArchived?: boolean;
  accessToken?: string | null;
}): Promise<MemoryEntryRow[]> {
  const {
    userId,
    limit = 20,
    scope = null,
    kind = null,
    pinnedOnly = false,
    includeArchived = false,
    accessToken = null,
  } = params;

  if (!hasConfig() || !userId) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 50)
    : 20;

  const filters = [
    `user_id=eq.${encodeURIComponent(userId)}`,
    `select=${MEMORY_ENTRY_SELECT}`,
    "order=pinned.desc,importance.desc,updated_at.desc",
    `limit=${safeLimit}`,
  ];

  if (scope) {
    filters.push(`scope=eq.${encodeURIComponent(scope)}`);
  }

  if (kind) {
    filters.push(`kind=eq.${encodeURIComponent(kind)}`);
  }

  if (pinnedOnly) {
    filters.push("pinned=is.true");
  }

  if (!includeArchived) {
    filters.push("archived_at=is.null");
  }

  const response = await request(`/rest/v1/memory_entries?${filters.join("&")}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    accessToken,
  });

  if (!response.ok) return [];

  return (await response.json()) as MemoryEntryRow[];
}

export async function upsertMemoryEntry(
  userId: string,
  payload: MemoryEntryUpsert,
  accessToken?: string | null
): Promise<MemoryEntryRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request("/rest/v1/memory_entries?on_conflict=user_id,content_hash", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    }),
    accessToken,
  });

  if (!response.ok) return null;

  const rows = (await response.json()) as MemoryEntryRow[];
  return rows[0] ?? null;
}

export async function deleteMemoryEntry(
  userId: string,
  memoryId: string,
  accessToken?: string | null
): Promise<boolean> {
  if (!hasConfig() || !userId || !memoryId) return false;

  const response = await request(
    `/rest/v1/memory_entries?id=eq.${encodeURIComponent(memoryId)}&user_id=eq.${encodeURIComponent(userId)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" }, accessToken }
  );

  return response.ok;
}

export async function updateMemoryEntry(
  userId: string,
  memoryId: string,
  payload: MemoryEntryUpdate,
  accessToken?: string | null
): Promise<MemoryEntryRow | null> {
  if (!hasConfig() || !userId || !memoryId) return null;

  const response = await request(
    `/rest/v1/memory_entries?id=eq.${encodeURIComponent(memoryId)}&user_id=eq.${encodeURIComponent(userId)}&select=${MEMORY_ENTRY_SELECT}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...payload,
        updated_at: new Date().toISOString(),
      }),
      accessToken,
    }
  );

  if (!response.ok) return null;

  const rows = (await response.json()) as MemoryEntryRow[];
  return rows[0] ?? null;
}

// ─── Founder context ───────────────────────────────────────────────────────

export async function getFounderContext(
  userId: string,
  accessToken?: string | null
): Promise<FounderContextRow | null> {
  if (!hasConfig() || !userId || userId === "guest-user") return null;

  const cached = readCachedFounderContext(userId);
  if (cached !== undefined) {
    return cached;
  }

  let response: Response;
  try {
    response = await request(
      `/rest/v1/founder_context?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      { method: "GET", headers: { Accept: "application/json" }, accessToken }
    );
  } catch (error) {
    const stale = readStaleCachedFounderContext(userId);
    if (stale !== undefined) {
      return stale;
    }

    throw error;
  }

  if (!response.ok) {
    const stale = readStaleCachedFounderContext(userId);
    if (stale !== undefined) {
      return stale;
    }

    writeCachedFounderContext(userId, null);
    return null;
  }

  const rows = (await response.json()) as FounderContextRow[];
  const row = rows[0] ?? null;
  writeCachedFounderContext(userId, row);
  return row;
}

export async function upsertFounderContext(
  userId: string,
  payload: FounderContextUpdate,
  accessToken?: string | null
): Promise<boolean> {
  if (!hasConfig() || !userId) return false;

  const response = await request("/rest/v1/founder_context", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    }),
    accessToken,
  });

  founderContextCache.delete(userId);
  return response.ok;
}

// ─── Voice profiles ─────────────────────────────────────────────────────────

export async function getVoiceProfile(
  profileSlug: string,
  accessToken?: string | null
): Promise<VoiceProfileRow | null> {
  if (!hasConfig() || !profileSlug) return null;

  const response = await request(
    `/rest/v1/voice_profiles?profile_slug=eq.${encodeURIComponent(profileSlug)}&select=*&limit=1`,
    { method: "GET", headers: { Accept: "application/json" }, accessToken }
  );

  if (!response.ok) return null;

  const rows = (await response.json()) as VoiceProfileRow[];
  return rows[0] ?? null;
}

export async function upsertVoiceProfile(
  payload: VoiceProfileUpdate,
  accessToken?: string | null
): Promise<boolean> {
  if (!hasConfig() || !payload.profile_slug) return false;

  const response = await request("/rest/v1/voice_profiles", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      ...payload,
      updated_at: new Date().toISOString(),
    }),
    accessToken,
  });

  return response.ok;
}

// ─── Gravity protocol persistence ──────────────────────────────────────────

export async function listGravityReports(
  userId: string,
  limit = 25
): Promise<GravityReportRow[]> {
  if (!hasConfig() || !userId) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 50)
    : 25;

  const response = await request(
    `/rest/v1/gravity_reports?user_id=eq.${encodeURIComponent(userId)}&deleted_at=is.null&select=*&order=created_at.desc&limit=${safeLimit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as GravityReportRow[];
}

export async function listGravityReportFragments(
  userId: string,
  reportIds?: string[],
  limit = 200
): Promise<GravityReportFragmentRow[]> {
  if (!hasConfig() || !userId) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 500)
    : 200;

  const filters = [
    `user_id=eq.${encodeURIComponent(userId)}`,
    "deleted_at=is.null",
    "select=*",
    "order=priority_rank.asc,signal_weight.desc,created_at.asc",
    `limit=${safeLimit}`,
  ];

  if (reportIds && reportIds.length > 0) {
    const uniqueReportIds = [...new Set(reportIds)].filter(Boolean);
    if (uniqueReportIds.length > 0) {
      filters.push(
        `gravity_report_id=in.(${uniqueReportIds.map((id) => encodeURIComponent(id)).join(",")})`
      );
    }
  }

  const response = await request(`/rest/v1/gravity_report_fragments?${filters.join("&")}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return [];

  return (await response.json()) as GravityReportFragmentRow[];
}

// ─── Authenticated user account rows ───────────────────────────────────────

export async function getUserAccount(
  userId: string,
  accessToken?: string | null
): Promise<UserAccountRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request(
    `/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=${USER_ACCOUNT_SELECT}&limit=1`,
    { method: "GET", headers: { Accept: "application/json" }, accessToken }
  );

  if (!response.ok) return null;

  const rows = (await response.json()) as UserAccountRow[];
  return rows[0] ?? null;
}

export async function listUserAccounts(limit = 50): Promise<UserAccountRow[]> {
  if (!hasConfig()) return [];

  const safeLimit = Number.isInteger(limit)
    ? Math.min(Math.max(limit, 1), 200)
    : 50;

  const response = await request(
    `/rest/v1/users?select=${USER_ACCOUNT_SELECT}&order=updated_at.desc&limit=${safeLimit}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as UserAccountRow[];
}

export async function upsertUserAccount(
  userId: string,
  payload: UserAccountUpdate,
  accessToken?: string | null
): Promise<UserAccountRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request("/rest/v1/users", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    }),
    accessToken,
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as UserAccountRow[];
  return rows[0] ?? null;
}

// ─── Workspace surfaces ───────────────────────────────────────────────────

export async function listWorkspaceRooms(userId: string): Promise<WorkspaceRoomRow[]> {
  if (!hasConfig() || !userId) return [];

  const response = await request(
    `/rest/v1/workspace_rooms?user_id=eq.${encodeURIComponent(userId)}&select=${WORKSPACE_ROOM_SELECT}&order=updated_at.desc`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return [];

  return (await response.json()) as WorkspaceRoomRow[];
}

export async function createWorkspaceRoom(
  userId: string,
  payload: WorkspaceRoomUpsert
): Promise<WorkspaceRoomRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request("/rest/v1/workspace_rooms?select=" + WORKSPACE_ROOM_SELECT, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      name: payload.name,
      description: payload.description ?? null,
      role: payload.role ?? "owner",
      member_count: payload.member_count ?? 1,
      recent_activity: payload.recent_activity ?? "Workspace created.",
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as WorkspaceRoomRow[];
  return rows[0] ?? null;
}

export async function updateWorkspaceRoom(
  userId: string,
  workspaceId: string,
  payload: WorkspaceRoomUpdate
): Promise<WorkspaceRoomRow | null> {
  if (!hasConfig() || !userId || !workspaceId) return null;

  const response = await request(
    `/rest/v1/workspace_rooms?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}&select=${WORKSPACE_ROOM_SELECT}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.role !== undefined ? { role: payload.role } : {}),
        ...(payload.member_count !== undefined ? { member_count: payload.member_count } : {}),
        ...(payload.recent_activity !== undefined
          ? { recent_activity: payload.recent_activity }
          : {}),
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as WorkspaceRoomRow[];
  return rows[0] ?? null;
}

export async function deleteWorkspaceRoom(userId: string, workspaceId: string): Promise<boolean> {
  if (!hasConfig() || !userId || !workspaceId) return false;

  const response = await request(
    `/rest/v1/workspace_rooms?id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }
  );

  return response.ok;
}

export async function listWorkspaceDocuments(
  userId: string,
  workspaceId?: string | null
): Promise<WorkspaceDocumentRow[]> {
  if (!hasConfig() || !userId) return [];

  const filters = [
    `user_id=eq.${encodeURIComponent(userId)}`,
    `select=${WORKSPACE_DOCUMENT_SELECT}`,
    "order=created_at.desc",
  ];

  if (workspaceId) {
    filters.push(`workspace_id=eq.${encodeURIComponent(workspaceId)}`);
  }

  const response = await request(`/rest/v1/workspace_documents?${filters.join("&")}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return [];

  return (await response.json()) as WorkspaceDocumentRow[];
}

export async function createWorkspaceDocument(
  userId: string,
  payload: WorkspaceDocumentUpsert
): Promise<WorkspaceDocumentRow | null> {
  if (!hasConfig() || !userId) return null;

  const response = await request("/rest/v1/workspace_documents?select=" + WORKSPACE_DOCUMENT_SELECT, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      workspace_id: payload.workspace_id ?? null,
      filename: payload.filename,
      file_size_bytes: payload.file_size_bytes ?? 0,
      file_type: payload.file_type ?? "",
      raw_text: payload.raw_text ?? null,
      analysis_status: payload.analysis_status ?? "completed",
      analysis_summary: payload.analysis_summary ?? "",
      key_points: payload.key_points ?? [],
      topics: payload.topics ?? [],
      sentiment: payload.sentiment ?? "unknown",
      word_count: payload.word_count ?? 0,
      reading_time_minutes: payload.reading_time_minutes ?? 0,
      analysis_payload: payload.analysis_payload ?? {},
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as WorkspaceDocumentRow[];
  return rows[0] ?? null;
}

export async function updateWorkspaceDocument(
  userId: string,
  documentId: string,
  payload: WorkspaceDocumentUpdate
): Promise<WorkspaceDocumentRow | null> {
  if (!hasConfig() || !userId || !documentId) return null;

  const response = await request(
    `/rest/v1/workspace_documents?id=eq.${encodeURIComponent(documentId)}&user_id=eq.${encodeURIComponent(userId)}&select=${WORKSPACE_DOCUMENT_SELECT}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...(payload.workspace_id !== undefined ? { workspace_id: payload.workspace_id } : {}),
        ...(payload.filename !== undefined ? { filename: payload.filename } : {}),
        ...(payload.file_size_bytes !== undefined ? { file_size_bytes: payload.file_size_bytes } : {}),
        ...(payload.file_type !== undefined ? { file_type: payload.file_type } : {}),
        ...(payload.raw_text !== undefined ? { raw_text: payload.raw_text } : {}),
        ...(payload.analysis_status !== undefined ? { analysis_status: payload.analysis_status } : {}),
        ...(payload.analysis_summary !== undefined
          ? { analysis_summary: payload.analysis_summary }
          : {}),
        ...(payload.key_points !== undefined ? { key_points: payload.key_points } : {}),
        ...(payload.topics !== undefined ? { topics: payload.topics } : {}),
        ...(payload.sentiment !== undefined ? { sentiment: payload.sentiment } : {}),
        ...(payload.word_count !== undefined ? { word_count: payload.word_count } : {}),
        ...(payload.reading_time_minutes !== undefined
          ? { reading_time_minutes: payload.reading_time_minutes }
          : {}),
        ...(payload.analysis_payload !== undefined
          ? { analysis_payload: payload.analysis_payload }
          : {}),
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as WorkspaceDocumentRow[];
  return rows[0] ?? null;
}

export async function deleteWorkspaceDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  if (!hasConfig() || !userId || !documentId) return false;

  const response = await request(
    `/rest/v1/workspace_documents?id=eq.${encodeURIComponent(documentId)}&user_id=eq.${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }
  );

  return response.ok;
}

export async function syncWorkspaceDocumentToCorpus(
  input: CorpusDocumentSyncInput
): Promise<boolean> {
  if (!hasConfig() || !input.userId || !input.workspaceDocumentId) return false;

  const stableTenantId = stableUuidFromText(input.userId);
  const workspaceSegment = input.workspaceId ? input.workspaceId : input.userId;
  const normalizedContent =
    normalizeCorpusText(input.rawText) ||
    normalizeCorpusText(input.analysisSummary) ||
    input.filename;
  const contentHash = hashCorpusText(
    [
      input.workspaceDocumentId,
      input.userId,
      input.workspaceId ?? "",
      input.filename,
      normalizedContent,
    ].join("|")
  );
  const path = `workspace-documents/${workspaceSegment}/${input.workspaceDocumentId}`;
  const sourceFile = `${path}.txt`;
  const extractedMetadata = {
    workspace_document_id: input.workspaceDocumentId,
    workspace_id: input.workspaceId ?? null,
    user_id: input.userId,
    analysis_summary: input.analysisSummary ?? "",
    key_points: input.keyPoints ?? [],
    topics: input.topics ?? [],
    sentiment: input.sentiment ?? "unknown",
    word_count: input.wordCount ?? 0,
    reading_time_minutes: input.readingTimeMinutes ?? 0,
    analysis_payload: input.analysisPayload ?? {},
  };
  const provenance = {
    source: "workspace_documents",
    workspace_document_id: input.workspaceDocumentId,
    workspace_id: input.workspaceId ?? null,
    user_id: input.userId,
  };

  const runResponse = await request("/rest/v1/processing_runs?select=" + DOCS_PIPELINE_PROCESSING_SELECT, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      tenant_id: stableTenantId,
      status: "completed",
      model: "workspace-document-sync",
      corpus_root: path,
      documents_count: 1,
      chunks_count: 1,
      created_by: stableTenantId,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!runResponse.ok) {
    return false;
  }

  const runRows = (await runResponse.json()) as Array<{ run_id: string }>;
  const run = runRows[0];
  if (!run?.run_id) {
    return false;
  }

  const documentResponse = await request("/rest/v1/documents?select=" + DOCS_PIPELINE_DOCUMENT_SELECT, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      run_id: run.run_id,
      tenant_id: stableTenantId,
      path,
      filename: input.filename,
      hash: contentHash,
      chunk_index: 0,
      total_chunks: 1,
      file_size_bytes: input.fileSizeBytes ?? 0,
      content: normalizedContent,
      mime_type: input.fileType ?? "",
      extracted_metadata: extractedMetadata,
      provenance,
      created_by: stableTenantId,
    }),
  });

  if (!documentResponse.ok) {
    return false;
  }

  const fragmentResponse = await request("/rest/v1/knowledge_fragments?select=" + DOCS_PIPELINE_FRAGMENT_SELECT, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      content: normalizedContent,
      content_hash: contentHash,
      source_file: sourceFile,
      document_type: "WorkspaceDocument",
      chunk_index: 0,
      total_chunks: 1,
      char_count: normalizedContent.length,
      tags: [
        "workspace-document",
        `user:${input.userId}`,
        ...(input.workspaceId ? [`workspace:${input.workspaceId}`] : []),
      ],
      created_at: new Date().toISOString(),
    }),
  });

  return fragmentResponse.ok;
}

export async function deleteWorkspaceDocumentCorpusRows(input: {
  userId: string;
  workspaceId?: string | null;
  workspaceDocumentId: string;
}): Promise<boolean> {
  if (!hasConfig() || !input.userId || !input.workspaceDocumentId) {
    return false;
  }

  const workspaceSegment = input.workspaceId ? input.workspaceId : input.userId;
  const path = `workspace-documents/${workspaceSegment}/${input.workspaceDocumentId}`;

  const fragmentDelete = await request(
    `/rest/v1/knowledge_fragments?source_file=eq.${encodeURIComponent(`${path}.txt`)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }
  );

  const documentDelete = await request(
    `/rest/v1/documents?path=eq.${encodeURIComponent(path)}&tenant_id=eq.${encodeURIComponent(stableUuidFromText(input.userId))}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    }
  );

  return fragmentDelete.ok && documentDelete.ok;
}

// ─── Session rate limits ───────────────────────────────────────────────────

export async function checkRateLimit(sessionId: string): Promise<{
  allowed: boolean;
  queryCount: number;
  windowStart: string;
}> {
  if (!hasConfig() || !sessionId) return { allowed: true, queryCount: 0, windowStart: new Date().toISOString() };

  const response = await request(
    `/rest/v1/session_rate_limits?session_id=eq.${encodeURIComponent(sessionId)}&select=query_count,window_start&limit=1`,
    { method: "GET", headers: { Accept: "application/json" } }
  );

  if (!response.ok) return { allowed: true, queryCount: 0, windowStart: new Date().toISOString() };

  const rows = (await response.json()) as { query_count: number; window_start: string }[];
  const row = rows[0];
  if (!row) return { allowed: true, queryCount: 0, windowStart: new Date().toISOString() };

  const windowAgeMs = Date.now() - new Date(row.window_start).getTime();
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
  const MAX_QUERIES = 100;

  if (windowAgeMs > WINDOW_MS) {
    // Window expired — reset
    await request("/rest/v1/session_rate_limits", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        session_id: sessionId,
        query_count: 1,
        window_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    return { allowed: true, queryCount: 1, windowStart: new Date().toISOString() };
  }

  const newCount = row.query_count + 1;
  await request("/rest/v1/session_rate_limits", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      session_id: sessionId,
      query_count: newCount,
      window_start: row.window_start,
      updated_at: new Date().toISOString(),
    }),
  });

  return {
    allowed: newCount <= MAX_QUERIES,
    queryCount: newCount,
    windowStart: row.window_start,
  };
}

// ─── Pipeline health ───────────────────────────────────────────────────────

export async function checkPipelineHealth(): Promise<{
  ok: boolean;
  details: string[];
}> {
  if (!hasConfig()) {
    return { ok: false, details: ["Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"] };
  }

  const tables = [
    "knowledge_fragments",
    "skill_fragments",
    "memory_entries",
    "gravity_reports",
    "gravity_report_fragments",
    "bucket_drops",
    "musical_dna_analyses",
    "tribunal_sessions",
    "billy_sessions",
  ];

  const failures: string[] = [];

  await Promise.all(
    tables.map(async (table) => {
      const response = await request(
        `/rest/v1/${table}?select=id&limit=1`,
        { method: "GET", headers: { Accept: "application/json" } }
      );
      if (!response.ok) {
        failures.push(`${table}: ${response.status}`);
      }
    })
  );

  // Check ingestion freshness: warn if no completed run in the last 7 days
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const runsResp = await request(
      `/rest/v1/processing_runs?status=in.(complete,completed,completed_with_errors)&updated_at=gte.${sevenDaysAgo}&select=run_id&limit=1`,
      { method: "GET", headers: { Accept: "application/json" } }
    );
    if (runsResp.ok) {
      const runs = (await runsResp.json()) as { run_id: string }[];
      if (runs.length === 0) {
        failures.push("processing_runs: no completed run in the last 7 days");
      }
    }
  } catch {
    failures.push("processing_runs: freshness check failed");
  }

  return { ok: failures.length === 0, details: failures };
}
