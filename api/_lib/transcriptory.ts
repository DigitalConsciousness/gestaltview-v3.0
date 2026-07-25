import { createClient } from "@supabase/supabase-js";

type TranscriptoryCaptureRow = {
  id: string;
  user_id: string;
  title: string | null;
  session_id?: string | null;
  duration_seconds: number | null;
  audio_storage_path: string | null;
  raw_transcript: string | null;
  transcript_text?: string | null;
  transcript_language?: string | null;
  summary: string | null;
  themes: string[] | null;
  linked_captures: string[] | null;
  linked_blackboard_session: string | null;
  linked_creation_corner_artifact: string | null;
  context_weight: number | null;
  source_kind?: string | null;
  source_label?: string | null;
  processing_provider?: string | null;
  transcript_status?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  token_estimate?: number | null;
  last_accessed_at?: string | null;
  archived_at?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type TranscriptorySessionRow = {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  origin: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TranscriptoryHandoffTarget = "creation_corner" | "blackboard_room" | "universal_capture";

export const TRANSCRIPTORY_CAPTURE_SELECT = [
  "id",
  "user_id",
  "session_id",
  "title",
  "duration_seconds",
  "audio_storage_path",
  "raw_transcript",
  "transcript_text",
  "transcript_language",
  "summary",
  "themes",
  "linked_captures",
  "linked_blackboard_session",
  "linked_creation_corner_artifact",
  "context_weight",
  "source_kind",
  "source_label",
  "processing_provider",
  "transcript_status",
  "error_code",
  "error_message",
  "processing_started_at",
  "processing_completed_at",
  "token_estimate",
  "last_accessed_at",
  "archived_at",
  "metadata",
  "status",
  "created_at",
  "updated_at",
].join(",");

export const TRANSCRIPTORY_SESSION_SELECT =
  "id,user_id,title,description,origin,status,started_at,ended_at,created_at,updated_at";

export const TRANSCRIPTORY_SOURCE_SELECT =
  "id,user_id,capture_id,source_type,source_ref,source_page,source_payload,created_at";

let cachedClient: any = null;

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

export function getTranscriptorySupabaseAdmin(): any {
  if (cachedClient) {
    return cachedClient;
  }

  const url = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");
  if (!url || !key) {
    throw new Error("Supabase is not configured for Transcriptory persistence.");
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function buildTranscriptoryCapturePayload(row: TranscriptoryCaptureRow): Record<string, unknown> {
  const transcriptText = row.transcript_text ?? row.raw_transcript ?? "";
  const transcriptStatus = row.transcript_status ?? (row.status === "ready" ? "ready" : row.status === "error" ? "failed" : "pending");
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "Untitled transcript",
    sessionId: row.session_id ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    hasAudio: Boolean(row.audio_storage_path),
    audioStoragePath: row.audio_storage_path ?? undefined,
    rawTranscript: row.raw_transcript ?? "",
    transcriptText,
    transcriptLanguage: row.transcript_language ?? undefined,
    summary: row.summary ?? "",
    themes: row.themes ?? [],
    linkedCaptures: row.linked_captures ?? [],
    linkedBlackboardSession: row.linked_blackboard_session ?? undefined,
    linkedCreationCornerArtifact: row.linked_creation_corner_artifact ?? undefined,
    contextWeight: row.context_weight ?? 1,
    sourceKind: row.source_kind ?? "audio",
    sourceLabel: row.source_label ?? undefined,
    processingProvider: row.processing_provider ?? undefined,
    transcriptStatus,
    errorCode: row.error_code ?? undefined,
    errorMessage: row.error_message ?? undefined,
    processingStartedAt: row.processing_started_at ?? undefined,
    processingCompletedAt: row.processing_completed_at ?? undefined,
    tokenEstimate: row.token_estimate ?? undefined,
    lastAccessedAt: row.last_accessed_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    metadata: row.metadata ?? {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildTranscriptorySessionPayload(row: TranscriptorySessionRow): Record<string, unknown> {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "Untitled session",
    description: row.description ?? "",
    origin: row.origin,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0]?.trim() ?? "" : typeof value === "string" ? value.trim() : "";
}

export function getPaginationValue(value: string | string[] | undefined, fallback: number): number {
  const parsed = Number.parseInt(getQueryValue(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function normalizeTranscriptoryStatus(status: string | undefined): string {
  const value = status?.trim();
  if (value === "transcribing") return "processing";
  if (value === "error") return "failed";
  if (value === "ready" || value === "processing" || value === "pending" || value === "failed") return value;
  return "pending";
}

export function normalizeHandoffTarget(value: unknown): TranscriptoryHandoffTarget | null {
  if (value === "creation_corner" || value === "blackboard_room" || value === "universal_capture") {
    return value;
  }
  return null;
}

export function handoffSourceForTarget(target: TranscriptoryHandoffTarget): { sourceType: string; sourcePage: string } {
  if (target === "creation_corner") return { sourceType: "creation_corner_seed", sourcePage: "creation_corner" };
  if (target === "blackboard_room") return { sourceType: "blackboard_handoff", sourcePage: "blackboard_room" };
  return { sourceType: "universal_capture", sourcePage: "universal_capture" };
}

export function buildTranscriptoryHandoffPayload(
  capture: TranscriptoryCaptureRow,
  target: TranscriptoryHandoffTarget,
): Record<string, unknown> {
  const title = capture.title ?? "Untitled transcript";
  const themes = capture.themes ?? [];
  const transcriptText = capture.transcript_text ?? capture.raw_transcript ?? "";
  const markdown = [
    `# Transcriptory capture: ${title}`,
    capture.summary ? `Summary:\n${capture.summary}` : "",
    themes.length > 0 ? `Themes: ${themes.join(", ")}` : "",
    transcriptText ? `Raw transcript:\n${transcriptText}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    target,
    captureId: capture.id,
    title,
    summary: capture.summary ?? "",
    themes,
    markdown,
    source: {
      kind: "transcriptory_capture",
      id: capture.id,
      sessionId: capture.session_id ?? undefined,
    },
  };
}
