import { appFetchJson } from "@/lib/appFetch";
import {
  createCaptureOrb,
  type ArtifactType,
  type CaptureOrb,
  type CaptureSource,
  readSavedCaptures,
  writeSavedCaptures,
} from "@/components/Scaffold";

export type BucketDropContentType = "text" | "audio" | "video";

export interface BucketDropMeta {
  recipient: string;
  releaseDate?: string;
  releaseTrigger?: string;
  isSealed: boolean;
  contentType?: BucketDropContentType;
}

export type BucketDropOrb = CaptureOrb & {
  metadata: CaptureOrb["metadata"] & { bucketDrop: BucketDropMeta };
};

export interface BucketDropServerRecord {
  id: string;
  userId: string;
  content: string;
  rawText: string | null;
  captureContext: Record<string, unknown>;
  createdAt: string;
  intensity: number;
  plkResonanceScore: number;
  specializedApps: string[];
  tags: string[];
  stage: string;
  subjectId: string | null;
  moduleKey: string | null;
  promotedMemoryId: string | null;
  scoredAt: string | null;
  promotedAt: string | null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readBucketDropContext(captureContext: Record<string, unknown>): BucketDropMeta {
  const nested =
    captureContext.bucketDrop && typeof captureContext.bucketDrop === "object"
      ? (captureContext.bucketDrop as Record<string, unknown>)
      : captureContext;

  const contentType = readString(nested.contentType);

  return {
    recipient: readString(nested.recipient) ?? "Future self",
    releaseDate: readString(nested.releaseDate) ?? undefined,
    releaseTrigger: readString(nested.releaseTrigger) ?? undefined,
    isSealed: readBoolean(nested.isSealed) ?? true,
    contentType:
      contentType === "audio" || contentType === "video" || contentType === "text"
        ? contentType
        : "text",
  };
}

function bucketDropArtifactType(contentType: BucketDropContentType | undefined): ArtifactType {
  if (contentType === "audio") return "audio";
  if (contentType === "video") return "context";
  return "memory";
}

function bucketDropSource(captureContext: Record<string, unknown>): CaptureSource {
  const source = readString(captureContext.source);
  if (source === "blackboard" || source === "voice" || source === "typed" || source === "upload" || source === "dynamic-inner-world" || source === "seed") {
    return source;
  }
  return "typed";
}

export function bucketDropRecordToOrb(record: BucketDropServerRecord): BucketDropOrb | null {
  const content = record.rawText?.trim() || record.content.trim();
  if (!content) {
    return null;
  }

  const bucketDrop = readBucketDropContext(record.captureContext);
  const base = createCaptureOrb({
    text: content,
    source: bucketDropSource(record.captureContext),
    type: bucketDropArtifactType(bucketDrop.contentType),
    action: "save",
    context: `For: ${bucketDrop.recipient}`,
    meaning: "Sealed message of love for the future",
    anchor: "bucket-drop",
  });

  if (!base) {
    return null;
  }

  return {
    ...base,
    id: record.id,
    text: content,
    createdAt: record.createdAt,
    tags: record.tags.length > 0 ? record.tags : base.tags,
    metadata: {
      ...base.metadata,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
      bucketDrop,
    },
  };
}

export function mergeBucketDropOrbs(
  captures: CaptureOrb[],
  bucketDrops: BucketDropOrb[],
): CaptureOrb[] {
  const remoteIds = new Set(bucketDrops.map((drop) => drop.id));
  const localBucketDrops = captures.filter((capture): capture is BucketDropOrb => Boolean(capture.metadata?.bucketDrop));
  const preservedLocalBucketDrops = localBucketDrops.filter((capture) => !remoteIds.has(capture.id));
  const otherCaptures = captures.filter((capture) => !capture.metadata?.bucketDrop);
  return [...bucketDrops, ...preservedLocalBucketDrops, ...otherCaptures];
}

export function readBucketDropOrbsFromStorage(): BucketDropOrb[] {
  return readSavedCaptures().filter((capture): capture is BucketDropOrb => Boolean(capture.metadata?.bucketDrop));
}

export function syncBucketDropOrbsToStorage(bucketDrops: BucketDropOrb[]): CaptureOrb[] {
  const merged = mergeBucketDropOrbs(readSavedCaptures(), bucketDrops);
  writeSavedCaptures(merged);
  return merged;
}

export function buildBucketDropCaptureContext(
  meta: BucketDropMeta,
  contentType: BucketDropContentType,
  id?: string,
): Record<string, unknown> {
  return {
    bucketDrop: {
      ...meta,
      contentType,
    },
    source: "typed",
    tags: [
      "bucket-drop",
      contentType,
      meta.isSealed ? "sealed" : "open",
    ],
    createdAt: new Date().toISOString(),
    ...(id ? { id } : {}),
  };
}

export async function loadBucketDropsFromServer(): Promise<BucketDropServerRecord[] | null> {
  const result = await appFetchJson<{ bucketDrops: BucketDropServerRecord[] }>("/api/billy-bucket-drop", {
    method: "GET",
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.bucketDrops ?? [];
}

export async function createBucketDropOnServer(input: {
  id: string;
  content: string;
  rawText?: string;
  captureContext: Record<string, unknown>;
}): Promise<boolean> {
  const result = await appFetchJson<{ response?: unknown }>("/api/actions/bucket-drops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: input.id,
      content: input.content,
      rawText: input.rawText ?? input.content,
      captureContext: input.captureContext,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  return result.ok;
}
