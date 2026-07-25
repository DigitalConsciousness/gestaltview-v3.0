import { appFetchJson } from "@/lib/appFetch";
import type { InsightOrbModel, OrbType } from "@/components/InsightOrb";

export type ArchivedInsightStatus = "active" | "hidden" | "archived" | "draft";

export type ArchivedInsightRecord = {
  id: string;
  userId: string;
  sourceRef: string;
  type: OrbType;
  title: string;
  preview: string;
  contentRef?: string | null;
  sessionOrigin?: string | null;
  highlightedText?: string | null;
  linkedOrbIds: string[];
  significanceScore: number;
  status: ArchivedInsightStatus;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const ARCHIVED_STORAGE_KEY = "gv.externalScaffold.archived.v1";
export const ARCHIVED_INSIGHT_EVENT = "gestaltview:external-scaffold-archived-updated";

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasBrowserStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function emit(name: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function parseTimestamp(value: string | null | undefined): number {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? time : 0;
}

function resolveOrbType(value: unknown): OrbType {
  return value === "memory" ||
    value === "connection" ||
    value === "insight" ||
    value === "pattern" ||
    value === "skill" ||
    value === "emotion"
    ? value
    : "pattern";
}

function normalizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as Record<string, unknown>;
}

function resolveStatus(value: unknown): ArchivedInsightStatus {
  return value === "active" || value === "hidden" || value === "archived" || value === "draft" ? value : "archived";
}

function clampScore(value: unknown, fallback = 0.5): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

export function emitArchivedInsightsUpdated(): void {
  emit(ARCHIVED_INSIGHT_EVENT);
}

export function readArchivedInsights(): InsightOrbModel[] {
  return readJson<InsightOrbModel[]>(ARCHIVED_STORAGE_KEY, []);
}

export function writeArchivedInsights(orbs: InsightOrbModel[]): void {
  writeJson(ARCHIVED_STORAGE_KEY, orbs);
  emitArchivedInsightsUpdated();
}

export function mergeArchivedInsights(
  localOrbs: InsightOrbModel[],
  remoteOrbs: InsightOrbModel[],
): InsightOrbModel[] {
  const merged = new Map<string, InsightOrbModel>();

  for (const orb of [...remoteOrbs, ...localOrbs]) {
    const existing = merged.get(orb.id);
    if (!existing || parseTimestamp(orb.updatedAt) >= parseTimestamp(existing.updatedAt)) {
      merged.set(orb.id, orb);
    }
  }

  return [...merged.values()].sort((a, b) => {
    const updatedDelta = parseTimestamp(b.updatedAt) - parseTimestamp(a.updatedAt);
    if (updatedDelta !== 0) {
      return updatedDelta;
    }

    return parseTimestamp(b.createdAt) - parseTimestamp(a.createdAt);
  });
}

export function materializeArchivedInsight(record: ArchivedInsightRecord): InsightOrbModel {
  const payload = normalizePayload(record.payload);

  return {
    id: record.sourceRef || record.id,
    type: resolveOrbType(payload.type ?? record.type),
    title: typeof payload.title === "string" ? payload.title : record.title,
    preview: typeof payload.preview === "string" ? payload.preview : record.preview,
    contentRef: typeof payload.contentRef === "string" ? payload.contentRef : record.contentRef ?? null,
    sessionOrigin:
      typeof payload.sessionOrigin === "string" ? payload.sessionOrigin : record.sessionOrigin ?? null,
    createdAt:
      typeof payload.createdAt === "string" && payload.createdAt.trim().length > 0
        ? payload.createdAt
        : record.createdAt,
    highlightedText:
      typeof payload.highlightedText === "string" ? payload.highlightedText : record.highlightedText ?? null,
    linkedTo: asStringArray(payload.linkedTo ?? record.linkedOrbIds),
    updatedAt:
      typeof payload.updatedAt === "string" && payload.updatedAt.trim().length > 0
        ? payload.updatedAt
        : record.updatedAt,
    resonance: clampScore(payload.resonance ?? record.significanceScore, record.significanceScore),
  };
}

export async function loadArchivedInsightsFromServer(): Promise<ArchivedInsightRecord[] | null> {
  const result = await appFetchJson<{ insights: ArchivedInsightRecord[] }>("/api/insights", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.insights ?? [];
}

export async function saveArchivedInsightToServer(input: {
  orb: InsightOrbModel;
}): Promise<ArchivedInsightRecord | null> {
  const result = await appFetchJson<{ insight: ArchivedInsightRecord | null }>("/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      insight: input.orb,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.insight ?? null;
}
