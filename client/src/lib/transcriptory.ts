import {
  RUNTIME_HANDOFF_CONTRACT_VERSION,
  type RuntimeHandoff,
} from "@shared/handoffs/contracts";

import {
  prepareRuntimeHandoff,
  transitionRuntimeHandoff,
} from "@/lib/runtimeHandoffClient";

export type TranscriptoryCapture = {
  id: string;
  userId?: string;
  title: string;
  sessionId?: string;
  durationSeconds?: number;
  hasAudio?: boolean;
  audioStoragePath?: string;
  rawTranscript: string;
  transcriptText?: string;
  transcriptLanguage?: string;
  summary: string;
  themes: string[];
  linkedCaptures: string[];
  sourceKind?: string;
  sourceLabel?: string;
  processingProvider?: string;
  transcriptStatus?: "pending" | "processing" | "ready" | "failed" | string;
  errorMessage?: string;
  tokenEstimate?: number;
  lastAccessedAt?: string;
  archivedAt?: string;
  metadata?: Record<string, unknown>;
  status: "pending" | "processing" | "ready" | "failed" | string;
  createdAt: string;
  updatedAt: string;
};

export type TranscriptorySession = {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  origin?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TranscriptorySource = {
  id: string;
  user_id?: string;
  capture_id?: string;
  source_type: string;
  source_ref?: string | null;
  source_page?: string | null;
  source_payload?: Record<string, unknown>;
  created_at?: string;
};

export type TranscriptoryHandoffTarget =
  "creation_corner" | "blackboard_room" | "sanctuary";

export type TranscriptoryHandoffPayload = {
  target: TranscriptoryHandoffTarget;
  captureId: string;
  title: string;
  summary: string;
  themes: string[];
  markdown: string;
  source?: Record<string, unknown>;
};

export const TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY =
  "gestaltview.transcriptory.blackboardHandoff.v1";
export const TRANSCRIPTORY_CREATION_HANDOFF_KEY =
  "gestaltview.transcriptory.creationHandoff.v1";
export const TRANSCRIPTORY_LOCAL_CAPTURES_KEY =
  "gestaltview.transcriptory.localCaptures.v1";

export function buildTranscriptoryHandoffText(
  capture: TranscriptoryCapture,
): string {
  const transcript = capture.transcriptText || capture.rawTranscript;
  return [
    `Transcriptory capture: ${capture.title}`,
    capture.themes.length > 0 ? `Themes: ${capture.themes.join(", ")}` : "",
    capture.summary ? `Summary:\n${capture.summary}` : "",
    transcript ? `Raw transcript:\n${transcript}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatTranscriptoryFailureMessage(
  error: unknown,
  fallback = "Transcriptory capture failed.",
): string {
  if (error instanceof Error) {
    return error.message.trim() || fallback;
  }

  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
}

export function writeTranscriptoryHandoff(
  destination: "blackboard" | "creation",
  capture: TranscriptoryCapture,
): void {
  if (typeof window === "undefined") return;
  const key =
    destination === "blackboard"
      ? TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY
      : TRANSCRIPTORY_CREATION_HANDOFF_KEY;
  window.sessionStorage.setItem(
    key,
    JSON.stringify({
      captureId: capture.id,
      title: capture.title,
      text: buildTranscriptoryHandoffText(capture),
      createdAt: new Date().toISOString(),
    }),
  );
}

function buildQuery(
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && `${value}`.trim()) search.set(key, `${value}`);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function listTranscriptoryCaptures(filters?: {
  sessionId?: string;
  q?: string;
  theme?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<TranscriptoryCapture[]> {
  const response = await fetch(
    `/api/transcriptory/captures${buildQuery(filters)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to load Transcriptory captures."
        : "Failed to load Transcriptory captures.",
    );
  }

  const data = (await response.json()) as { captures?: TranscriptoryCapture[] };
  return data.captures ?? [];
}

export async function getTranscriptoryCapture(captureId: string): Promise<{
  capture: TranscriptoryCapture;
  sources: TranscriptorySource[];
  session: TranscriptorySession | null;
  linkedCaptures: string[];
}> {
  const response = await fetch(
    `/api/transcriptory/captures/${encodeURIComponent(captureId)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to load Transcriptory capture details."
        : "Failed to load Transcriptory capture.",
    );
  }

  const data = (await response.json()) as {
    capture?: TranscriptoryCapture;
    sources?: TranscriptorySource[];
    session?: TranscriptorySession | null;
    linkedCaptures?: string[];
  };
  if (!data.capture) {
    throw new Error("Transcriptory capture detail response was empty.");
  }
  return {
    capture: data.capture,
    sources: data.sources ?? [],
    session: data.session ?? null,
    linkedCaptures: data.linkedCaptures ?? [],
  };
}

export async function deleteTranscriptoryCapture(
  captureId: string,
): Promise<void> {
  const response = await fetch(
    `/api/transcriptory/captures/${encodeURIComponent(captureId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to delete Transcriptory captures."
        : "Failed to delete Transcriptory capture.",
    );
  }
}

export async function createTranscriptoryCapture(input: {
  title: string;
  sessionId?: string;
  audioStoragePath?: string;
  rawTranscript?: string;
  summary?: string;
  themes?: string[];
  status?: TranscriptoryCapture["status"];
  sourceKind?: string;
  sourceLabel?: string;
}): Promise<TranscriptoryCapture> {
  const response = await fetch("/api/transcriptory/captures", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to save Transcriptory captures."
        : "Failed to save Transcriptory capture.",
    );
  }

  const data = (await response.json()) as { capture?: TranscriptoryCapture };
  if (!data.capture) {
    throw new Error("Transcriptory capture response was empty.");
  }

  return data.capture;
}

export async function createTranscriptorySession(input: {
  title: string;
  description?: string;
  origin?: string;
}): Promise<TranscriptorySession> {
  const response = await fetch("/api/transcriptory/sessions", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to create Transcriptory sessions."
        : "Failed to create Transcriptory session.",
    );
  }

  const data = (await response.json()) as { session?: TranscriptorySession };
  if (!data.session) {
    throw new Error("Transcriptory session response was empty.");
  }
  return data.session;
}

export async function listTranscriptorySessions(): Promise<
  TranscriptorySession[]
> {
  const response = await fetch("/api/transcriptory/sessions", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Sign in to load Transcriptory sessions."
        : "Failed to load Transcriptory sessions.",
    );
  }

  const data = (await response.json()) as { sessions?: TranscriptorySession[] };
  return data.sessions ?? [];
}

const transcriptoryDestination: Record<
  TranscriptoryHandoffTarget,
  {
    room: "blackboard" | "creation_corner" | "sanctuary";
    requestedAction: string;
    intent: "continue" | "review" | "synthesize";
  }
> = {
  blackboard_room: {
    room: "blackboard",
    requestedAction: "use_as_cited_context",
    intent: "continue",
  },
  creation_corner: {
    room: "creation_corner",
    requestedAction: "use_as_source_material",
    intent: "synthesize",
  },
  sanctuary: {
    room: "sanctuary",
    requestedAction: "reference_preserved_capture",
    intent: "review",
  },
};

export async function requestTranscriptoryHandoff(input: {
  capture: TranscriptoryCapture;
  target: TranscriptoryHandoffTarget;
}): Promise<RuntimeHandoff> {
  const { capture, target } = input;
  if (!capture.userId) {
    throw new Error(
      "Persist this local Transcriptory capture before offering a durable handoff.",
    );
  }

  const destination = transcriptoryDestination[target];
  const sourceRef = `transcriptory-capture:${capture.id}`;
  const prepared = await prepareRuntimeHandoff({
    contractVersion: RUNTIME_HANDOFF_CONTRACT_VERSION,
    source: {
      room: "transcriptory",
      entityType: "transcriptory_capture",
      entityId: capture.id,
      revision: capture.updatedAt,
      immutableRef: sourceRef,
    },
    destination: {
      room: destination.room,
      requestedAction: destination.requestedAction,
    },
    payload: {
      context: {
        title: capture.title,
        sourceKind: capture.sourceKind ?? "unknown",
        transcriptStatus: capture.transcriptStatus ?? capture.status,
      },
      references: [
        {
          type: "transcriptory_capture",
          ref: sourceRef,
          label: capture.title,
        },
        ...(capture.transcriptStatus === "ready"
          ? [
              {
                type: "transcriptory_transcription",
                ref: `transcriptory-transcription:${capture.id}`,
                label: `${capture.title} transcription`,
              },
            ]
          : []),
      ],
    },
    selectedEmbodiments: [],
    intent: destination.intent,
    idempotencyKey: `transcriptory:${capture.id}:${target}:v1`,
    provenance: {
      actorType: "user",
      actorId: capture.userId,
      originatingRoute: "/transcriptory",
      consentScope: [`offer:${destination.room}`],
    },
  });

  if (prepared.state === "prepared") {
    return transitionRuntimeHandoff(prepared.handoffId, { state: "offered" });
  }
  return prepared;
}

export async function transcribeTranscriptoryAudio(input: {
  captureId: string;
  file: File;
}): Promise<{
  transcript: string;
  durationSeconds?: number;
  provider: string;
  capture?: TranscriptoryCapture;
}> {
  const response = await fetch("/api/transcriptory/transcribe", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": input.file.type || "application/octet-stream",
      "X-Capture-Id": input.captureId,
      "X-Filename": input.file.name,
    },
    body: input.file,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new Error(
      data.message ?? data.error ?? "Failed to transcribe audio.",
    );
  }

  const data = (await response.json()) as {
    transcript?: string;
    duration_seconds?: number;
    provider?: string;
    capture?: TranscriptoryCapture;
  };
  return {
    transcript: data.transcript ?? "",
    durationSeconds: data.duration_seconds,
    provider: data.provider ?? "assemblyai",
    capture: data.capture,
  };
}

export function createLocalTranscriptoryCapture(input: {
  title: string;
  rawTranscript?: string;
  audioStoragePath?: string;
  status?: TranscriptoryCapture["status"];
}): TranscriptoryCapture {
  const now = new Date().toISOString();
  const capture: TranscriptoryCapture = {
    id: `local-transcript-${Date.now().toString(36)}`,
    title: input.title,
    rawTranscript: input.rawTranscript ?? "",
    transcriptText: input.rawTranscript ?? "",
    summary: input.rawTranscript
      ? "Transcript text saved locally. Server summary generation is pending."
      : "",
    themes: [],
    linkedCaptures: [],
    audioStoragePath: input.audioStoragePath,
    sourceKind: input.rawTranscript ? "text" : "audio",
    sourceLabel: "Local-only Transcriptory source",
    metadata: {
      persistence: "local_only",
      localCaptureId: "",
    },
    status: input.status ?? (input.rawTranscript ? "ready" : "pending"),
    createdAt: now,
    updatedAt: now,
  };
  capture.metadata = {
    ...capture.metadata,
    localCaptureId: capture.id,
  };
  persistLocalTranscriptoryCaptures([
    capture,
    ...listLocalTranscriptoryCaptures().filter(
      (item) => item.id !== capture.id,
    ),
  ]);
  return capture;
}

function persistLocalTranscriptoryCaptures(
  captures: TranscriptoryCapture[],
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TRANSCRIPTORY_LOCAL_CAPTURES_KEY,
    JSON.stringify(captures),
  );
}

export function listLocalTranscriptoryCaptures(): TranscriptoryCapture[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(TRANSCRIPTORY_LOCAL_CAPTURES_KEY) ?? "[]",
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TranscriptoryCapture =>
      Boolean(
        item &&
        typeof item === "object" &&
        typeof (item as TranscriptoryCapture).id === "string" &&
        (item as TranscriptoryCapture).id.startsWith("local-transcript-") &&
        typeof (item as TranscriptoryCapture).title === "string",
      ),
    );
  } catch {
    return [];
  }
}

export function removeLocalTranscriptoryCapture(captureId: string): void {
  persistLocalTranscriptoryCaptures(
    listLocalTranscriptoryCaptures().filter(
      (capture) => capture.id !== captureId,
    ),
  );
}
