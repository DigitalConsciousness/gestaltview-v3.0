// GestaltView v2 — Bucket Drop persistence helpers
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest } from "@vercel/node";
import { getUserId } from "./user.js";

export interface BucketDropCreateRequest {
  id?: string;
  userId?: string;
  content?: string;
  rawText?: string;
  captureContext?: Record<string, unknown>;
  emotionalIntensity?: number;
  cognitiveLoad?: number;
  significanceScore?: number;
  attentionState?: string;
  hyperfocusIndicator?: boolean;
  executiveFunction?: string;
  energyLevel?: number;
  connectedDrops?: string[];
  tapestryWeight?: number;
}

type BucketDropContext = {
  recipient: string;
  releaseDate?: string;
  releaseTrigger?: string;
  isSealed: boolean;
  contentType?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBucketDropContext(value: unknown): BucketDropContext {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const nested =
    record.bucketDrop && typeof record.bucketDrop === "object"
      ? (record.bucketDrop as Record<string, unknown>)
      : record;

  return {
    recipient: readString(nested.recipient) ?? "Future self",
    releaseDate: readString(nested.releaseDate) ?? undefined,
    releaseTrigger: readString(nested.releaseTrigger) ?? undefined,
    isSealed: readBoolean(nested.isSealed) ?? true,
    contentType: readString(nested.contentType) ?? undefined,
  };
}

function deriveIntensity(content: string, input: BucketDropCreateRequest, context: BucketDropContext): number {
  const explicit =
    readNumber(input.emotionalIntensity) ??
    readNumber((input.captureContext as Record<string, unknown> | undefined)?.emotionalIntensity) ??
    readNumber((input.captureContext as Record<string, unknown> | undefined)?.energyLevel);

  if (explicit != null) {
    return clamp(Math.round(explicit), 1, 10);
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const base = wordCount <= 8 ? 4 : wordCount <= 20 ? 5 : wordCount <= 40 ? 6 : wordCount <= 80 ? 7 : 8;
  return clamp(base + (context.isSealed ? 1 : 0), 1, 10);
}

function deriveResonanceScore(content: string, input: BucketDropCreateRequest): number {
  const explicit =
    readNumber(input.significanceScore) ??
    readNumber((input.captureContext as Record<string, unknown> | undefined)?.significanceScore) ??
    readNumber(input.tapestryWeight) ??
    readNumber((input.captureContext as Record<string, unknown> | undefined)?.tapestryWeight);

  if (explicit != null) {
    return clamp(Number(explicit.toFixed(3)), 0, 1);
  }

  const normalized = clamp(content.trim().length / 240, 0.18, 0.93);
  return Number(normalized.toFixed(3));
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];
}

export function buildBucketDropPersistencePayload(
  req: VercelRequest,
  input: BucketDropCreateRequest,
  options: {
    userId?: string;
  } = {},
): {
  userId: string;
  persist: Record<string, unknown>;
  response: Record<string, unknown>;
} {
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const captureContext = input.captureContext && typeof input.captureContext === "object"
    ? { ...input.captureContext }
    : {};
  const context = readBucketDropContext(captureContext);
  const now = new Date().toISOString();
  const userId =
    typeof options.userId === "string" && options.userId.trim()
      ? options.userId.trim()
      : getUserId(req, input as Record<string, unknown>);
  const intensity = deriveIntensity(content, input, context);
  const plkResonanceScore = deriveResonanceScore(content, input);
  const tags = normalizeStringArray((captureContext as Record<string, unknown>).tags);
  const specializedApps = normalizeStringArray((captureContext as Record<string, unknown>).specializedApps);
  const stage = readString((captureContext as Record<string, unknown>).stage) ?? (context.isSealed ? "captured" : "queued");
  const subjectId = readString((captureContext as Record<string, unknown>).subjectId) ?? null;
  const moduleKey = readString((captureContext as Record<string, unknown>).moduleKey) ?? null;
  const promotedMemoryId = readString((captureContext as Record<string, unknown>).promotedMemoryId) ?? null;
  const scoredAt = readString((captureContext as Record<string, unknown>).scoredAt) ?? null;
  const promotedAt = readString((captureContext as Record<string, unknown>).promotedAt) ?? null;
  const id = readString(input.id) ?? undefined;

  const normalizedCaptureContext = {
    ...captureContext,
    bucketDrop: {
      ...context,
      contentType: context.contentType ?? readString((captureContext as Record<string, unknown>).contentType) ?? "text",
      capturedAt: now,
    },
    tags,
    source: readString((captureContext as Record<string, unknown>).source) ?? "api",
    captured_at: now,
  };

  const persist: Record<string, unknown> = {
    ...(id ? { id } : {}),
    user_id: userId,
    content,
    raw_text: typeof input.rawText === "string" ? input.rawText.trim() : content,
    capture_context: normalizedCaptureContext,
    intensity,
    plk_resonance_score: plkResonanceScore,
    specialized_apps: specializedApps,
    tags,
    stage,
    ...(subjectId ? { subject_id: subjectId } : {}),
    ...(moduleKey ? { module_key: moduleKey } : {}),
    ...(promotedMemoryId ? { promoted_memory_id: promotedMemoryId } : {}),
    ...(scoredAt ? { scored_at: scoredAt } : {}),
    ...(promotedAt ? { promoted_at: promotedAt } : {}),
  };

  return {
    userId,
    persist,
    response: {
      id: id ?? null,
      userId,
      content,
      rawText: typeof input.rawText === "string" ? input.rawText.trim() : content,
      captureContext: normalizedCaptureContext,
      createdAt: now,
      intensity,
      plkResonanceScore,
      specializedApps,
      tags,
      stage,
    },
  };
}
