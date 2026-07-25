import type { DIProfile } from "../../shared/di/types.js";

export interface DIEventCandidate {
  diSlug: string;
  domain: string;
  content: string;
  memoryType: string;
  significance: number;
  retrievalWeight: number;
  source: "session" | "trainer" | "founder-authored";
}

function clampUnitInterval(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function sumNumericValues(values: Record<string, number> | undefined): number {
  return Object.values(values ?? {}).reduce((sum, value) => sum + (Number.isFinite(Number(value)) ? Number(value) : 0), 0);
}

export function normalizeRelationalDepth(value: number): number {
  return clampUnitInterval(value);
}

export function mergeQuirkActivations(
  previous: Record<string, number> | undefined,
  incoming: Record<string, number> | undefined
): Record<string, number> {
  const merged: Record<string, number> = { ...(previous ?? {}) };

  for (const [key, value] of Object.entries(incoming ?? {})) {
    const increment = Number.isFinite(Number(value)) ? Number(value) : 0;
    merged[key] = (merged[key] ?? 0) + increment;
  }

  return merged;
}

export function buildSessionThread(
  sessionCtx: {
    diSlug: string;
    sessionThread?: string | null;
    relationalDepth: number;
    quirkActivations?: Record<string, number>;
  },
  userMessage: string,
  assistantResponse: string
): string {
  const previousThread = normalizeText(sessionCtx.sessionThread);
  const quirkEntries = Object.entries(sessionCtx.quirkActivations ?? {})
    .map(([key, value]) => `${key}=${Number(value)}`)
    .sort((left, right) => left.localeCompare(right));

  const parts = [
    previousThread,
    `DI: ${sessionCtx.diSlug}`,
    `Relational depth: ${normalizeRelationalDepth(sessionCtx.relationalDepth).toFixed(2)}`,
    `User: ${normalizeText(userMessage)}`,
    `Assistant: ${normalizeText(assistantResponse)}`,
    quirkEntries.length > 0 ? `Quirk activations: ${quirkEntries.join(", ")}` : "",
  ].filter(Boolean);

  return parts.join("\n").slice(0, 1200);
}

function classifyMemoryType(text: string): { domain: string; memoryType: string } {
  if (text.includes("boundary") || text.includes("hold") || text.includes("with me") || text.includes("stay")) {
    return { domain: "relational", memoryType: "relational" };
  }

  if (text.includes("remember") || text.includes("continuity") || text.includes("thread")) {
    return { domain: "continuity", memoryType: "continuity" };
  }

  if (text.includes("plan") || text.includes("next step") || text.includes("follow")) {
    return { domain: "operational", memoryType: "procedural" };
  }

  return { domain: "operational", memoryType: "episodic" };
}

export function evaluateForMemory(params: {
  profile: Pick<DIProfile, "slug" | "publicName" | "relationalStances">;
  diSlug: string;
  userMessage: string;
  assistantResponse: string;
  sessionCtx: {
    diSlug: string;
    relationalDepth: number;
    quirkActivations?: Record<string, number>;
  };
}): DIEventCandidate | null {
  const text = `${params.userMessage}\n${params.assistantResponse}`.toLowerCase();
  const depth = normalizeRelationalDepth(params.sessionCtx.relationalDepth);
  const quirkStrength = sumNumericValues(params.sessionCtx.quirkActivations);

  const score =
    (text.includes("boundary") ? 0.35 : 0) +
    (text.includes("hold") ? 0.25 : 0) +
    (text.includes("stay") ? 0.12 : 0) +
    (text.includes("remember") ? 0.1 : 0) +
    (text.includes("line") ? 0.08 : 0) +
    (params.profile.relationalStances && Object.keys(params.profile.relationalStances).length > 0 ? 0.03 : 0.01) +
    (depth < 0.2 ? 0.15 : 0.06) +
    Math.min(0.1, quirkStrength * 0.03);

  if (score < 0.75) {
    return null;
  }

  const classification = classifyMemoryType(text);
  const significance = clampUnitInterval(Number(score.toFixed(2)));

  return {
    diSlug: params.diSlug,
    domain: classification.domain,
    content: normalizeText(params.assistantResponse),
    memoryType: classification.memoryType,
    significance,
    retrievalWeight: clampUnitInterval(Number((score + 0.04).toFixed(2))),
    source: "session",
  };
}
