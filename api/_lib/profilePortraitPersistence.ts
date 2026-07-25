import { randomUUID } from "node:crypto";

import type { ProfilePortrait } from "../../shared/profilePortrait.js";

type PortraitStatus = "pending" | "validated" | "rendered" | "archived";

type PersistedPortraitRow = {
  id: string;
  user_id: string;
  version: number;
  portrait_title: string;
  tagline: string;
  overall_confidence: number;
  source_window_start: string;
  source_window_end: string;
  total_source_records: number;
  plk_resonance_score: number | null;
  delta_from_previous: string | null;
  inference_triggered_by: ProfilePortrait["inferenceTriggeredBy"];
  inference_run_id: string;
  status: PortraitStatus;
  room_slug: string | null;
  validated_at: string | null;
  rendered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PersistedPortraitRecord = {
  id: string;
  portrait: ProfilePortrait;
};

type PersistedPortraitDimensionRow = {
  id: string;
  portrait_id: string;
  user_id: string;
  kind: string;
  label: string;
  summary: string;
  confidence: number;
  evidence_count: number;
  signal_sources: string[] | null;
  metaphor_family: string[] | null;
  raw_quotes: string[] | null;
  delta: string | null;
  created_at: string;
};

export type PortraitQueueRow = {
  id: string;
  user_id: string;
  triggered_by: ProfilePortrait["inferenceTriggeredBy"];
  priority: number;
  status: "queued" | "processing" | "completed" | "failed" | "skipped";
  queued_at: string;
  picked_up_at: string | null;
  completed_at: string | null;
  run_id: string | null;
};

export type PortraitCadenceCandidateRow = {
  id: string;
  user_id: string;
  version: number;
  created_at: string;
  status: "validated" | "rendered";
};

export type PortraitInferenceRunRow = {
  id: string;
  user_id: string;
  triggered_by: ProfilePortrait["inferenceTriggeredBy"];
  status: "running" | "completed" | "failed" | "insufficient_data" | "cooldown_blocked";
  portrait_id: string | null;
  input_record_count: number;
  input_window_start: string | null;
  input_window_end: string | null;
  llm_provider_used: string | null;
  llm_model_used: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  validation_passed: boolean | null;
  validation_errors: Record<string, unknown> | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
};

function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  return { url, key };
}

function hasSupabaseConfig(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

function sbHeaders(key: string, prefer?: string): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function sbRequest(path: string, init: RequestInit, prefer?: string): Promise<Response> {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error("supabase_config_missing");
  }

  return fetch(`${url}/rest/v1${path}`, {
    ...init,
    headers: {
      ...sbHeaders(key, prefer),
      ...(init.headers ?? {}),
    },
  });
}

function hydratePortrait(
  row: PersistedPortraitRow,
  dimensions: PersistedPortraitDimensionRow[]
): ProfilePortrait {
  return {
    userId: row.user_id,
    version: row.version,
    portraitTitle: row.portrait_title,
    tagline: row.tagline,
    dimensions: dimensions.map((dimension) => ({
      kind: dimension.kind as ProfilePortrait["dimensions"][number]["kind"],
      label: dimension.label,
      summary: dimension.summary,
      confidence: dimension.confidence,
      evidenceCount: dimension.evidence_count,
      signalSources: dimension.signal_sources ?? [],
      metaphorFamily: dimension.metaphor_family ?? undefined,
      rawQuotes: dimension.raw_quotes ?? undefined,
      delta: dimension.delta ?? undefined,
    })),
    overallConfidence: row.overall_confidence,
    sourceWindowStart: row.source_window_start,
    sourceWindowEnd: row.source_window_end,
    totalSourceRecords: row.total_source_records,
    plkResonanceScore: row.plk_resonance_score ?? undefined,
    deltaFromPrevious: row.delta_from_previous ?? undefined,
    inferenceTriggeredBy: row.inference_triggered_by,
    inferenceRunId: row.inference_run_id,
  };
}

export async function loadLatestPersistedPortraitRecord(userId: string): Promise<PersistedPortraitRecord | null> {
  if (!userId || userId === "demo") {
    return null;
  }

  if (!hasSupabaseConfig()) {
    return null;
  }

  const rowResponse = await sbRequest(
    `/profile_portraits?user_id=eq.${encodeURIComponent(userId)}&status=in.(validated,rendered)&select=id,user_id,version,portrait_title,tagline,overall_confidence,source_window_start,source_window_end,total_source_records,plk_resonance_score,delta_from_previous,inference_triggered_by,inference_run_id,status,room_slug,validated_at,rendered_at,created_at,updated_at&order=version.desc&limit=1`,
    { method: "GET" },
  );

  if (!rowResponse.ok) {
    return null;
  }

  const rows = (await rowResponse.json()) as PersistedPortraitRow[];
  const row = rows[0];
  if (!row) {
    return null;
  }

  const dimensionResponse = await sbRequest(
    `/portrait_dimensions?portrait_id=eq.${encodeURIComponent(row.id)}&select=id,portrait_id,user_id,kind,label,summary,confidence,evidence_count,signal_sources,metaphor_family,raw_quotes,delta,created_at&order=created_at.asc`,
    { method: "GET" },
  );

  if (!dimensionResponse.ok) {
    return {
      id: row.id,
      portrait: hydratePortrait(row, []),
    };
  }

  const dimensions = (await dimensionResponse.json()) as PersistedPortraitDimensionRow[];
  return {
    id: row.id,
    portrait: hydratePortrait(row, dimensions),
  };
}

export async function loadLatestPersistedPortrait(userId: string): Promise<ProfilePortrait | null> {
  const record = await loadLatestPersistedPortraitRecord(userId);
  return record?.portrait ?? null;
}

export async function listMonthlyPortraitCadenceCandidates(limit = 1000): Promise<PortraitCadenceCandidateRow[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 2_000) : 1_000;
  const response = await sbRequest(
    `/profile_portraits?status=in.(validated,rendered)&select=id,user_id,version,created_at,status&order=user_id.asc,version.desc,created_at.desc&limit=${safeLimit}`,
    { method: "GET" },
  );

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as PortraitCadenceCandidateRow[];
}

export async function listQueuedPortraitJobs(limit = 5): Promise<PortraitQueueRow[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 25) : 5;
  const response = await sbRequest(
    `/portrait_inference_queue?status=eq.queued&select=id,user_id,triggered_by,priority,status,queued_at,picked_up_at,completed_at,run_id&order=priority.desc,queued_at.asc&limit=${safeLimit}`,
    { method: "GET" },
  );

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as PortraitQueueRow[];
}

export async function claimPortraitQueueJob(jobId: string): Promise<PortraitQueueRow | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const response = await sbRequest(
    `/portrait_inference_queue?id=eq.${encodeURIComponent(jobId)}&status=eq.queued&select=id,user_id,triggered_by,priority,status,queued_at,picked_up_at,completed_at,run_id`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "processing",
        picked_up_at: new Date().toISOString(),
      }),
    },
    "return=representation",
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as PortraitQueueRow[];
  return rows[0] ?? null;
}

export async function updatePortraitQueueJob(
  jobId: string,
  patch: Partial<Pick<PortraitQueueRow, "status" | "picked_up_at" | "completed_at" | "run_id">>,
): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return false;
  }

  const response = await sbRequest(
    `/portrait_inference_queue?id=eq.${encodeURIComponent(jobId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
    "return=minimal",
  );

  return response.ok;
}

export async function createPortraitInferenceRun(
  row: Omit<PortraitInferenceRunRow, "created_at" | "completed_at"> & Partial<Pick<PortraitInferenceRunRow, "created_at" | "completed_at">>,
): Promise<PortraitInferenceRunRow | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const response = await sbRequest(
    "/portrait_inference_runs?select=id,user_id,triggered_by,status,portrait_id,input_record_count,input_window_start,input_window_end,llm_provider_used,llm_model_used,prompt_tokens,completion_tokens,validation_passed,validation_errors,error_message,duration_ms,created_at,completed_at",
    {
      method: "POST",
      body: JSON.stringify(row),
    },
    "return=representation",
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as PortraitInferenceRunRow[];
  return rows[0] ?? null;
}

export async function updatePortraitInferenceRun(
  runId: string,
  patch: Partial<PortraitInferenceRunRow>,
): Promise<boolean> {
  if (!hasSupabaseConfig()) {
    return false;
  }

  const response = await sbRequest(
    `/portrait_inference_runs?id=eq.${encodeURIComponent(runId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
    "return=minimal",
  );

  return response.ok;
}

export async function persistPortraitArtifact(portrait: ProfilePortrait): Promise<PersistedPortraitRow | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const portraitId = randomUUID();
  const portraitPayload = {
    id: portraitId,
    user_id: portrait.userId,
    version: portrait.version,
    portrait_title: portrait.portraitTitle,
    tagline: portrait.tagline,
    overall_confidence: portrait.overallConfidence,
    source_window_start: portrait.sourceWindowStart,
    source_window_end: portrait.sourceWindowEnd,
    total_source_records: portrait.totalSourceRecords,
    plk_resonance_score: portrait.plkResonanceScore ?? null,
    delta_from_previous: portrait.deltaFromPrevious ?? null,
    inference_triggered_by: portrait.inferenceTriggeredBy,
    inference_run_id: portrait.inferenceRunId,
    status: "validated",
    room_slug: null,
    validated_at: new Date().toISOString(),
    rendered_at: null,
  };

  const portraitResponse = await sbRequest(
    "/profile_portraits?select=id,user_id,version,portrait_title,tagline,overall_confidence,source_window_start,source_window_end,total_source_records,plk_resonance_score,delta_from_previous,inference_triggered_by,inference_run_id,status,room_slug,validated_at,rendered_at,created_at,updated_at",
    {
      method: "POST",
      body: JSON.stringify(portraitPayload),
    },
    "return=representation",
  );

  if (!portraitResponse.ok) {
    return null;
  }

  const portraitRows = (await portraitResponse.json()) as PersistedPortraitRow[];
  const insertedPortrait = portraitRows[0] ?? null;
  if (!insertedPortrait) {
    return null;
  }

  const dimensionResponse = await sbRequest(
    "/portrait_dimensions?select=id,portrait_id,user_id,kind,label,summary,confidence,evidence_count,signal_sources,metaphor_family,raw_quotes,delta,created_at",
    {
      method: "POST",
      body: JSON.stringify(
        portrait.dimensions.map((dimension) => ({
          portrait_id: insertedPortrait.id,
          user_id: portrait.userId,
          kind: dimension.kind,
          label: dimension.label,
          summary: dimension.summary,
          confidence: dimension.confidence,
          evidence_count: dimension.evidenceCount,
          signal_sources: dimension.signalSources,
          metaphor_family: dimension.metaphorFamily ?? [],
          raw_quotes: dimension.rawQuotes ?? [],
          delta: dimension.delta ?? null,
        })),
      ),
    },
    "return=representation",
  );

  if (!dimensionResponse.ok) {
    await sbRequest(
      `/profile_portraits?id=eq.${encodeURIComponent(insertedPortrait.id)}`,
      { method: "DELETE" },
      "return=minimal",
    ).catch(() => undefined);
    return null;
  }

  return insertedPortrait;
}

type PortraitRenderEventRow = {
  id: string;
  user_id: string;
  portrait_id: string;
  event_type: "view" | "share" | "export" | "delta_view";
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function recordPortraitRenderEvent(
  userId: string,
  portraitId: string,
  eventType: PortraitRenderEventRow["event_type"] = "view",
  metadata: Record<string, unknown> | null = null,
): Promise<boolean> {
  if (!hasSupabaseConfig() || !userId || !portraitId) {
    return false;
  }

  const response = await sbRequest(
    "/portrait_render_events?select=id,user_id,portrait_id,event_type,metadata,created_at",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        portrait_id: portraitId,
        event_type: eventType,
        metadata,
      }),
    },
    "return=representation",
  );

  if (!response.ok) {
    return false;
  }

  const rows = (await response.json()) as PortraitRenderEventRow[];
  return Boolean(rows[0]?.id);
}

export function makePortraitInferenceRunId(): string {
  return randomUUID();
}
