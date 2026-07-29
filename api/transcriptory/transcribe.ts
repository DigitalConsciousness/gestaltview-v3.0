import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { routeLlm } from "../_lib/llmRouter.js";
import { sendJson } from "../_lib/response.js";
import {
  buildTranscriptoryCapturePayload,
  getTranscriptorySupabaseAdmin,
  TRANSCRIPTORY_CAPTURE_SELECT,
} from "../_lib/transcriptory.js";
import {
  buildEntitlementBlock,
  getTranscriptoryAudioUploadLimitBytes,
  isOverEntitlementLimit,
} from "../../shared/entitlements.js";

export const config = { api: { bodyParser: false } };

const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com";
const ASSEMBLYAI_SPEECH_MODELS = ["universal-3-pro", "universal-2"];
const TRANSCRIPTORY_AUDIO_BUCKET = "transcriptory_audio_files";
const MAX_POLL_ATTEMPTS = 8;

type AssemblyAITranscript = {
  id: string;
  status: "queued" | "processing" | "completed" | "error" | string;
  text?: string;
  error?: string;
  audio_duration?: number;
};

type TranscriptoryErrorCode =
  | "assemblyai_transcription_failed"
  | "capture_claim_failed"
  | "capture_update_failed";

function hasServerTranscriptionProvider(): boolean {
  return Boolean(
    process.env.ASSEMBLYAI_API_KEY?.trim() ||
    process.env.BILLY_TRANSCRIPTION_URL?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim() ||
    process.env.HF_API_TOKEN?.trim(),
  );
}

function getHeader(req: VercelRequest, name: string): string {
  const lowerName = name.toLowerCase();
  const matchedKey = Object.keys(req.headers).find(
    (key) => key.toLowerCase() === lowerName,
  );
  const value = matchedKey ? req.headers[matchedKey] : undefined;
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

function getContentLength(req: VercelRequest): number | null {
  const value = getHeader(req, "content-length").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function safeFileName(name: string): string {
  const trimmed = name.trim() || "transcriptory-audio.webm";
  const parts = trimmed.split(".");
  const extension =
    parts.length > 1
      ? `.${
          parts
            .pop()
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "") || "webm"
        }`
      : ".webm";
  const base = parts.join(".") || "transcriptory-audio";
  const safeBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "transcriptory-audio";
  return `${safeBase}${extension}`;
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function storagePathForTranscriptoryAudio(input: {
  userId: string;
  captureId: string;
  fileName: string;
}): string {
  return `${input.userId}/${input.captureId}/${Date.now()}-${safeFileName(input.fileName)}`;
}

function isSafeCaptureId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value);
}

function getCaptureId(req: VercelRequest): string {
  const fromHeader = getHeader(req, "x-capture-id").trim();
  if (fromHeader) return fromHeader;

  const queryValue = req.query.capture_id ?? req.query.captureId;
  if (Array.isArray(queryValue)) return queryValue[0]?.trim() ?? "";
  return typeof queryValue === "string" ? queryValue.trim() : "";
}

function safeDiagnosticMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "AssemblyAI transcription failed.";
  return (
    message.replace(/\s+/g, " ").trim().slice(0, 500) ||
    "AssemblyAI transcription failed."
  );
}

async function readRequestBody(req: VercelRequest): Promise<Buffer> {
  const body = req.body as unknown;
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (typeof body === "string") return Buffer.from(body);
  if (body && typeof body === "object")
    return Buffer.from(JSON.stringify(body));

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function readAssemblyAIError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };
    return data.error ?? data.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function uploadAudioToAssemblyAI(input: {
  apiKey: string;
  audio: Buffer;
  contentType: string;
}): Promise<string> {
  const audioBody = bufferToArrayBuffer(input.audio);
  const response = await fetch(`${ASSEMBLYAI_BASE_URL}/v2/upload`, {
    method: "POST",
    headers: {
      Authorization: input.apiKey,
      "Content-Type": input.contentType || "application/octet-stream",
    },
    body: audioBody,
  });

  if (!response.ok) {
    throw new Error(
      `AssemblyAI upload failed: ${await readAssemblyAIError(response)}`,
    );
  }

  const data = (await response.json()) as { upload_url?: string };
  if (!data.upload_url) {
    throw new Error("AssemblyAI upload response did not include upload_url.");
  }
  return data.upload_url;
}

async function ensureTranscriptoryAudioBucket(supabase: any): Promise<void> {
  const { error } = await supabase.storage.createBucket(
    TRANSCRIPTORY_AUDIO_BUCKET,
    { public: false },
  );
  if (error) {
    const message = `${error.message ?? error}`.toLowerCase();
    if (
      !message.includes("already exists") &&
      !message.includes("duplicate") &&
      !message.includes("conflict")
    ) {
      throw new Error(
        `Failed to ensure storage bucket "${TRANSCRIPTORY_AUDIO_BUCKET}": ${error.message ?? error}`,
      );
    }
  }
}

async function persistTranscriptoryAudio(input: {
  supabase: any;
  userId: string;
  captureId: string;
  fileName: string;
  contentType: string;
  audio: Buffer;
}): Promise<string> {
  await ensureTranscriptoryAudioBucket(input.supabase);
  const storagePath = storagePathForTranscriptoryAudio({
    userId: input.userId,
    captureId: input.captureId,
    fileName: input.fileName,
  });
  const { error } = await input.supabase.storage
    .from(TRANSCRIPTORY_AUDIO_BUCKET)
    .upload(storagePath, bufferToArrayBuffer(input.audio), {
      contentType: input.contentType || "application/octet-stream",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(
      `Failed to persist Transcriptory audio: ${error.message ?? error}`,
    );
  }

  return storagePath;
}

async function submitAssemblyAITranscript(input: {
  apiKey: string;
  audioUrl: string;
}): Promise<string> {
  const response = await fetch(`${ASSEMBLYAI_BASE_URL}/v2/transcript`, {
    method: "POST",
    headers: {
      Authorization: input.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: input.audioUrl,
      speech_models: ASSEMBLYAI_SPEECH_MODELS,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `AssemblyAI transcript submit failed: ${await readAssemblyAIError(response)}`,
    );
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) {
    throw new Error("AssemblyAI transcript response did not include id.");
  }
  return data.id;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollAssemblyAITranscript(input: {
  apiKey: string;
  transcriptId: string;
}): Promise<AssemblyAITranscript> {
  const pollDelayMs = process.env.NODE_ENV === "test" ? 0 : 2500;

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(
      `${ASSEMBLYAI_BASE_URL}/v2/transcript/${input.transcriptId}`,
      {
        method: "GET",
        headers: { Authorization: input.apiKey },
      },
    );

    if (!response.ok) {
      throw new Error(
        `AssemblyAI transcript poll failed: ${await readAssemblyAIError(response)}`,
      );
    }

    const transcript = (await response.json()) as AssemblyAITranscript;
    if (transcript.status === "completed") return transcript;
    if (transcript.status === "error") {
      throw new Error(transcript.error || "AssemblyAI transcription failed.");
    }
    if (pollDelayMs > 0) await delay(pollDelayMs);
  }

  throw new Error("AssemblyAI transcription timed out.");
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const direct = JSON.parse(text) as unknown;
    return direct && typeof direct === "object" && !Array.isArray(direct)
      ? (direct as Record<string, unknown>)
      : null;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const extracted = JSON.parse(match[0]) as unknown;
      return extracted &&
        typeof extracted === "object" &&
        !Array.isArray(extracted)
        ? (extracted as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
}

function normalizeThemes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8),
    ),
  );
}

function tokenizeForSimilarity(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 4)
      .slice(0, 500),
  );
}

function overlapCount(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const item of a) {
    if (b.has(item)) count += 1;
  }
  return count;
}

async function findLinkedTranscriptoryCaptures(input: {
  captureId: string;
  userId: string;
  transcriptText: string;
  summary: string;
  themes: string[];
}): Promise<string[]> {
  if (!input.captureId) return [];

  const supabase = getTranscriptorySupabaseAdmin();
  const { data, error } = await supabase
    .from("transcriptory_captures")
    .select("id,title,raw_transcript,summary,themes,status,created_at")
    .eq("user_id", input.userId)
    .eq("status", "ready")
    .neq("id", input.captureId)
    .limit(30);

  if (error || !Array.isArray(data)) return [];

  const inputThemes = new Set(input.themes.map((theme) => theme.toLowerCase()));
  const inputTokens = tokenizeForSimilarity(
    `${input.summary}\n${input.transcriptText}`,
  );

  return data
    .map((row: any) => {
      const rowThemes = new Set<string>(
        (Array.isArray(row.themes) ? (row.themes as unknown[]) : [])
          .filter(
            (theme: unknown): theme is string => typeof theme === "string",
          )
          .map((theme) => theme.toLowerCase()),
      );
      const rowTokens = tokenizeForSimilarity(
        `${row.title ?? ""}\n${row.summary ?? ""}\n${row.raw_transcript ?? ""}`,
      );
      const score =
        overlapCount(inputThemes, rowThemes) * 3 +
        overlapCount(inputTokens, rowTokens);
      return { id: String(row.id), score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.id);
}

async function claimTranscriptoryCapture(input: {
  supabase: any;
  captureId: string;
  userId: string;
  provider: string;
}): Promise<Record<string, unknown> | null> {
  const claimPayload = {
    status: "processing",
    transcript_status: "processing",
    processing_provider: input.provider,
    processing_started_at: new Date().toISOString(),
    processing_completed_at: null,
    error_code: null,
    error_message: null,
  };
  const primary = await input.supabase
    .from("transcriptory_captures")
    .update(claimPayload)
    .eq("id", input.captureId)
    .eq("user_id", input.userId)
    .in("status", ["pending", "failed"])
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();

  if (primary.data) {
    return primary.data ?? null;
  }

  if (primary.error) {
    const code =
      typeof primary.error.code === "string" ? primary.error.code : "";
    const message = `${primary.error.message ?? primary.error}`.toLowerCase();
    if (
      code === "PGRST116" ||
      message.includes("0 rows") ||
      message.includes("no rows")
    ) {
      return null;
    }

    throw new Error(
      primary.error.message ?? "Failed to claim Transcriptory capture.",
    );
  }

  const fallback = await input.supabase
    .from("transcriptory_captures")
    .update(claimPayload)
    .eq("id", input.captureId)
    .eq("user_id", input.userId)
    .eq("status", "processing")
    .is("processing_started_at", null)
    .is("raw_transcript", null)
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();

  if (fallback.error) {
    const code =
      typeof fallback.error.code === "string" ? fallback.error.code : "";
    const message = `${fallback.error.message ?? fallback.error}`.toLowerCase();
    if (
      code === "PGRST116" ||
      message.includes("0 rows") ||
      message.includes("no rows")
    ) {
      return null;
    }

    throw new Error(
      fallback.error.message ?? "Failed to reclaim Transcriptory capture.",
    );
  }

  return fallback.data ?? null;
}

async function markTranscriptoryCaptureFailed(input: {
  supabase: any;
  captureId: string;
  userId: string;
  error: unknown;
  errorCode?: TranscriptoryErrorCode;
  audioStoragePath?: string;
}): Promise<void> {
  await input.supabase
    .from("transcriptory_captures")
    .update({
      transcript_status: "failed",
      status: "failed",
      ...(input.audioStoragePath
        ? { audio_storage_path: input.audioStoragePath }
        : {}),
      error_code: input.errorCode ?? "assemblyai_transcription_failed",
      error_message: safeDiagnosticMessage(input.error),
      processing_completed_at: new Date().toISOString(),
    })
    .eq("id", input.captureId)
    .eq("user_id", input.userId);
}

async function summarizeTranscriptoryCapture(input: {
  transcriptText: string;
  userId: string;
}): Promise<{ summary: string; themes: string[] }> {
  const transcriptText = input.transcriptText.trim();
  if (!transcriptText) return { summary: "", themes: [] };

  const excerpt = transcriptText.slice(0, 32_000);
  const result = await routeLlm(
    [
      "Summarize this Transcriptory voice capture without sanitizing or editorializing the user's raw language.",
      'Return strict JSON only with shape: {"summary":"2-4 sentence thematic summary","themes":["Theme"]}.',
      "",
      "Raw transcript:",
      excerpt,
    ].join("\n"),
    {
      mode: "transcriptory-summary",
      userId: input.userId,
      systemPrompt:
        "You extract concise summaries and theme tags for GestaltView Transcriptory captures. Preserve the user's meaning and never rewrite the transcript.",
    },
  );

  const parsed = parseJsonObject(result.response);
  const summary =
    typeof parsed?.summary === "string" ? parsed.summary.trim() : "";
  const themes = normalizeThemes(parsed?.themes);
  return { summary, themes };
}

async function updateCaptureWithTranscript(input: {
  captureId: string;
  userId: string;
  transcript: AssemblyAITranscript;
  audioStoragePath?: string;
  summary: string;
  themes: string[];
  linkedCaptureIds: string[];
}) {
  if (!input.captureId) return undefined;

  const admin = getTranscriptorySupabaseAdmin();
  const { data, error } = await admin
    .from("transcriptory_captures")
    .update({
      raw_transcript: input.transcript.text ?? "",
      transcript_text: input.transcript.text ?? "",
      duration_seconds:
        Math.round(input.transcript.audio_duration ?? 0) || null,
      audio_storage_path: input.audioStoragePath ?? null,
      summary: input.summary || null,
      themes: input.themes,
      linked_captures: input.linkedCaptureIds,
      processing_provider: "assemblyai",
      transcript_status: "ready",
      status: "ready",
      error_code: null,
      error_message: null,
      processing_completed_at: new Date().toISOString(),
    })
    .eq("id", input.captureId)
    .eq("user_id", input.userId)
    .select(TRANSCRIPTORY_CAPTURE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to update Transcriptory capture.");
  }

  return data ? buildTranscriptoryCapturePayload(data) : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Capture-Id",
      "X-Filename",
    ],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  if (!hasServerTranscriptionProvider()) {
    sendJson(res, 501, {
      error: "transcription_provider_not_configured",
      browserSpeechRecognitionUsed: false,
      message:
        "Transcriptory will not fall back to browser SpeechRecognition. Configure the Billy transcription adapter, Groq, or HuggingFace.",
    });
    return;
  }

  const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY?.trim();
  if (!assemblyApiKey) {
    sendJson(res, 501, {
      error: "transcription_adapter_not_wired",
      browserSpeechRecognitionUsed: false,
      message:
        "AssemblyAI is not configured; non-AssemblyAI provider execution is not wired in this slice.",
    });
    return;
  }

  const uploadLimitBytes = getTranscriptoryAudioUploadLimitBytes(auth.tier);
  if (isOverEntitlementLimit(getContentLength(req), uploadLimitBytes)) {
    sendJson(
      res,
      413,
      buildEntitlementBlock(
        "transcriptory_audio_upload",
        "Core unlocks longer Transcriptory audio uploads.",
      ),
    );
    return;
  }

  const captureId = getCaptureId(req);
  if (captureId && !isSafeCaptureId(captureId)) {
    sendJson(res, 400, {
      error: "invalid_capture_id",
      message: "Transcriptory capture id must be a safe capture token.",
    });
    return;
  }

  const supabase = captureId ? getTranscriptorySupabaseAdmin() : null;
  let captureClaimed = false;
  let preservedAudioStoragePath: string | undefined;

  try {
    const audio = await readRequestBody(req);
    if (!audio.length) {
      sendJson(res, 400, {
        error: "audio_required",
        message: "Upload an audio file body to transcribe.",
      });
      return;
    }

    if (isOverEntitlementLimit(audio.length, uploadLimitBytes)) {
      sendJson(
        res,
        413,
        buildEntitlementBlock(
          "transcriptory_audio_upload",
          "Core unlocks longer Transcriptory audio uploads.",
        ),
      );
      return;
    }

    if (captureId && supabase) {
      const claimed = await claimTranscriptoryCapture({
        supabase,
        captureId,
        userId: auth.id,
        provider: "assemblyai",
      });
      if (!claimed) {
        sendJson(res, 409, {
          error: "capture_already_processing",
          message:
            "This Transcriptory capture is already processing or is not available for transcription.",
        });
        return;
      }
      captureClaimed = true;
    }

    const contentType =
      getHeader(req, "content-type") || "application/octet-stream";
    const fileName = getHeader(req, "x-filename") || "transcriptory-audio.webm";
    const audioStoragePath = captureId
      ? await persistTranscriptoryAudio({
          supabase,
          userId: auth.id,
          captureId,
          fileName,
          contentType,
          audio,
        })
      : undefined;
    preservedAudioStoragePath = audioStoragePath;
    const audioUrl = await uploadAudioToAssemblyAI({
      apiKey: assemblyApiKey,
      audio,
      contentType,
    });
    const transcriptId = await submitAssemblyAITranscript({
      apiKey: assemblyApiKey,
      audioUrl,
    });
    const transcript = await pollAssemblyAITranscript({
      apiKey: assemblyApiKey,
      transcriptId,
    });
    const enrichment = await summarizeTranscriptoryCapture({
      transcriptText: transcript.text ?? "",
      userId: auth.id,
    });
    const linkedCaptureIds = await findLinkedTranscriptoryCaptures({
      captureId,
      userId: auth.id,
      transcriptText: transcript.text ?? "",
      summary: enrichment.summary,
      themes: enrichment.themes,
    });
    const capture = await updateCaptureWithTranscript({
      captureId,
      userId: auth.id,
      transcript,
      audioStoragePath,
      summary: enrichment.summary,
      themes: enrichment.themes,
      linkedCaptureIds,
    });

    sendJson(res, 200, {
      transcript: transcript.text ?? "",
      duration_seconds: Math.round(transcript.audio_duration ?? 0) || undefined,
      summary: enrichment.summary,
      themes: enrichment.themes,
      provider: "assemblyai",
      assemblyai_transcript_id: transcript.id,
      browserSpeechRecognitionUsed: false,
      ...(capture ? { capture } : {}),
    });
  } catch (error) {
    if (captureId && supabase && captureClaimed) {
      await markTranscriptoryCaptureFailed({
        supabase,
        captureId,
        userId: auth.id,
        error,
        audioStoragePath: preservedAudioStoragePath,
      });
    }
    sendJson(res, 502, {
      error: "assemblyai_transcription_failed",
      browserSpeechRecognitionUsed: false,
      message:
        error instanceof Error
          ? error.message
          : "AssemblyAI transcription failed.",
    });
  }
}
