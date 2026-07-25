// api/_lib/memory.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Persistent memory helpers: sanitization, deduplication, and retrieval.

import { createHash } from "node:crypto";

import { embedTextForRetrieval, type EmbedBackend } from "./embeddings.js";
import {
  listMemoryEntries,
  matchMemoryEntries,
  searchMemoryEntries,
  upsertMemoryEntry,
  type MemoryEntryRow,
  type MatchMemoryEntryRow,
  type SearchMemoryEntryRow,
} from "./supabase.js";
import type { RetrievedMemoryEntry } from "../../shared/billy/types.js";

export const MEMORY_KINDS = [
  "identity",
  "preference",
  "goal",
  "project",
  "relationship",
  "constraint",
  "insight",
  "note",
] as const;

export type MemoryKind = (typeof MEMORY_KINDS)[number];

export const MEMORY_SCOPES = ["personal", "session", "shared"] as const;

export type MemoryScope = (typeof MEMORY_SCOPES)[number];

export interface MemorySearchResult {
  memories: RetrievedMemoryEntry[];
  retrievalMode: "semantic" | "text" | "text-only" | "none";
  embedBackend: EmbedBackend;
  embedModel: string | null;
}

export interface BillyMemoryCandidate {
  kind: MemoryKind;
  scope: MemoryScope;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  importance: number;
  metadata: Record<string, unknown>;
}

export interface CollaborationMemoryInput {
  userId: string;
  content: string;
  title?: string | null;
  summary?: string | null;
  kind?: MemoryKind;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importance?: number;
  pinned?: boolean;
  sourceRef?: string | null;
}

const AUTO_MEMORY_MAX_CANDIDATES = 2;
const AUTO_MEMORY_MIN_CHARS = 24;
const AUTO_MEMORY_MAX_CHARS = 480;
const QUESTION_START_RE =
  /^(what|why|how|when|where|who|can|could|would|should|do|does|did|is|are|am|will|won't|please|help)\b/i;
const VOLATILE_SUPPORT_RE =
  /\b(can you|could you|would you|please|help me|fix this|debug this|what should we|how do we)\b/i;

const MEMORY_CAPTURE_RULES: Array<{
  kind: MemoryKind;
  importance: number;
  tags: string[];
  patterns: RegExp[];
}> = [
  {
    kind: "goal",
    importance: 5,
    tags: ["goal"],
    patterns: [
      /\b(my goal is|i want to|i need to|i'm trying to|i am trying to|i plan to|i hope to|i'm aiming to|i am aiming to)\b/i,
    ],
  },
  {
    kind: "project",
    importance: 4,
    tags: ["project"],
    patterns: [
      /\b(i'm building|i am building|i'm working on|i am working on|we're building|we are building|my project|i'm creating|i am creating|i'm launching|i am launching)\b/i,
    ],
  },
  {
    kind: "constraint",
    importance: 4,
    tags: ["constraint"],
    patterns: [
      /\b(i struggle with|i get overwhelmed|it'?s hard for me|it is hard for me|i have trouble|i lose focus|i can't focus|i cannot focus|i freeze when|i shut down when|i get stuck when)\b/i,
    ],
  },
  {
    kind: "preference",
    importance: 4,
    tags: ["preference"],
    patterns: [
      /\b(i prefer|i like|i love|i enjoy|i hate|i don't like|i do not like|i work best when|for me the best)\b/i,
    ],
  },
  {
    kind: "relationship",
    importance: 4,
    tags: ["relationship"],
    patterns: [/\bmy (wife|husband|partner|boyfriend|girlfriend|son|daughter|kid|kids|mom|mother|dad|father|friend|team|client|family|therapist)\b/i],
  },
  {
    kind: "identity",
    importance: 4,
    tags: ["identity"],
    patterns: [/\b(my name is|i'm a |i am a |i'm an |i am an |i'm someone who|i am someone who)\b/i],
  },
  {
    kind: "insight",
    importance: 3,
    tags: ["insight"],
    patterns: [/\b(i realized|i noticed|i learned|it turns out for me|i keep finding that)\b/i],
  },
];

export function trimOptionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : "";
}

export function normalizeMemoryContent(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function hashMemoryContent(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

export function deriveMemoryTitle(content: string): string {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  const basis = firstLine || content.trim() || "Untitled memory";
  return basis.slice(0, 120);
}

export function sanitizeMemoryTags(value: unknown, maxTags = 12): string[] {
  if (!Array.isArray(value)) return [];

  const deduped = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim().toLowerCase().slice(0, 48);
    if (!trimmed) continue;
    deduped.add(trimmed);
    if (deduped.size >= maxTags) break;
  }

  return [...deduped];
}

export function sanitizeMemoryMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

export function normalizeMemoryKind(value: unknown): MemoryKind {
  if (typeof value === "string" && MEMORY_KINDS.includes(value as MemoryKind)) {
    return value as MemoryKind;
  }
  return "note";
}

export function normalizeMemoryScope(value: unknown): MemoryScope {
  if (typeof value === "string" && MEMORY_SCOPES.includes(value as MemoryScope)) {
    return value as MemoryScope;
  }
  return "personal";
}

export function normalizeMemoryImportance(value: unknown): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numeric)) return 3;
  return Math.max(1, Math.min(5, Math.round(numeric)));
}

function splitMemorySentences(value: string): string[] {
  return value
    .replace(/\r\n/g, "\n")
    .split(/(?:[.!?]+\s+)|(?:\n+)/)
    .map((part) =>
      part
        .replace(/^[-*•]\s*/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);
}

function isQuestionLikeSentence(value: string): boolean {
  return value.endsWith("?") || QUESTION_START_RE.test(value);
}

function isVolatileSupportRequest(value: string): boolean {
  return VOLATILE_SUPPORT_RE.test(value);
}

function inferMemoryCandidateKind(value: string): {
  kind: MemoryKind;
  importance: number;
  tags: string[];
} | null {
  for (const rule of MEMORY_CAPTURE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(value))) {
      return {
        kind: rule.kind,
        importance: rule.importance,
        tags: rule.tags,
      };
    }
  }

  return null;
}

function buildMemorySummary(kind: MemoryKind, value: string): string {
  const labelByKind: Record<MemoryKind, string> = {
    identity: "Identity signal",
    preference: "Preference",
    goal: "Goal",
    project: "Project thread",
    relationship: "Relationship context",
    constraint: "Constraint",
    insight: "Insight",
    note: "Note",
  };

  return `${labelByKind[kind]}: ${value}`.slice(0, 280);
}

function buildMemoryTags(params: {
  kind: MemoryKind;
  section?: string;
  conversationMode?: "synthesis" | "chat";
  ruleTags?: string[];
}): string[] {
  return sanitizeMemoryTags([
    "billy-auto",
    params.kind,
    ...(params.ruleTags ?? []),
    params.section ? `section-${params.section}` : "",
    params.conversationMode ? `mode-${params.conversationMode}` : "",
  ]);
}

function buildCollaborationTags(kind: MemoryKind, tags: string[] = []): string[] {
  return sanitizeMemoryTags(["collaboration", "codex", kind, ...tags]);
}

export function isCollaborationMemoryEntry(value: {
  scope?: string | null;
  source?: string | null;
  tags?: string[] | null;
}): boolean {
  if (value.scope !== "shared") {
    return false;
  }

  if (typeof value.source === "string" && value.source.startsWith("codex-")) {
    return true;
  }

  return (value.tags ?? []).some((tag) => tag === "collaboration" || tag === "codex");
}

export function extractBillyMemoryCandidates(params: {
  userMessage: string;
  assistantResponse?: string;
  section?: string;
  conversationMode?: "synthesis" | "chat";
}): BillyMemoryCandidate[] {
  const { userMessage, assistantResponse, section, conversationMode } = params;
  const candidates: BillyMemoryCandidate[] = [];
  const seenHashes = new Set<string>();

  for (const sentence of splitMemorySentences(userMessage)) {
    if (sentence.length < AUTO_MEMORY_MIN_CHARS) continue;
    if (isQuestionLikeSentence(sentence)) continue;
    if (isVolatileSupportRequest(sentence)) continue;

    const inferred = inferMemoryCandidateKind(sentence);
    if (!inferred) continue;

    const content = normalizeMemoryContent(sentence).slice(0, AUTO_MEMORY_MAX_CHARS);
    if (!content) continue;

    const contentHash = hashMemoryContent(content);
    if (seenHashes.has(contentHash)) continue;
    seenHashes.add(contentHash);

    candidates.push({
      kind: inferred.kind,
      scope: "personal",
      title: deriveMemoryTitle(content),
      summary: buildMemorySummary(inferred.kind, content),
      content,
      tags: buildMemoryTags({
        kind: inferred.kind,
        section,
        conversationMode,
        ruleTags: inferred.tags,
      }),
      importance: inferred.importance,
      metadata: sanitizeMemoryMetadata({
        capture: "billy-auto-v1",
        section: section || null,
        conversationMode: conversationMode || null,
        assistantResponseExcerpt: trimOptionalText(assistantResponse, 240) || null,
      }),
    });

    if (candidates.length >= AUTO_MEMORY_MAX_CANDIDATES) {
      break;
    }
  }

  return candidates;
}

function mapSemanticRows(rows: MatchMemoryEntryRow[]): RetrievedMemoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? null,
    summary: row.summary ?? null,
    content: row.content,
    kind: row.kind,
    scope: row.scope,
    importance: row.importance,
    pinned: row.pinned,
    tags: row.tags ?? [],
    score: row.similarity,
  }));
}

function mapTextRows(rows: SearchMemoryEntryRow[]): RetrievedMemoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? null,
    summary: row.summary ?? null,
    content: row.content,
    kind: row.kind,
    scope: row.scope,
    importance: row.importance,
    pinned: row.pinned,
    tags: row.tags ?? [],
    score: row.rank,
  }));
}

function mapStoredRows(rows: MemoryEntryRow[]): RetrievedMemoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? null,
    summary: row.summary ?? null,
    content: row.content,
    kind: row.kind,
    scope: row.scope,
    importance: row.importance,
    pinned: row.pinned,
    tags: row.tags ?? [],
    score: row.pinned ? 1 + row.importance * 0.01 : 0.4 + row.importance * 0.01,
  }));
}

function mergeMemoryRows(
  semanticRows: RetrievedMemoryEntry[],
  textRows: RetrievedMemoryEntry[],
  topK: number,
  k = 40
): RetrievedMemoryEntry[] {
  const scores = new Map<string, number>();
  const byId = new Map<string, RetrievedMemoryEntry>();

  const rank = (rows: RetrievedMemoryEntry[], weight: number) => {
    rows.forEach((row, index) => {
      const score =
        weight / (k + index + 1) +
        row.importance * 0.01 +
        (row.pinned ? 0.08 : 0);
      scores.set(row.id, (scores.get(row.id) ?? 0) + score);
      if (!byId.has(row.id)) {
        byId.set(row.id, row);
      }
    });
  };

  rank(semanticRows, 1.2);
  rank(textRows, 1.0);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([id, score]) => ({
      ...byId.get(id)!,
      score,
    }));
}

export async function retrieveMemoryEntries(params: {
  userId: string;
  query: string;
  topK?: number;
  scope?: MemoryScope | null;
  kind?: MemoryKind | null;
  queryEmbedding?: number[] | null;
  textOnly?: boolean;
  embedBackend?: EmbedBackend;
  embedModel?: string | null;
}): Promise<MemorySearchResult> {
  const {
    userId,
    query,
    topK = 4,
    scope = null,
    kind = null,
    queryEmbedding = null,
    textOnly = false,
    embedBackend: suppliedBackend = null,
    embedModel: suppliedModel = null,
  } = params;

  if (!userId || userId === "guest-user" || !query.trim()) {
    return {
      memories: [],
      retrievalMode: "none",
      embedBackend: suppliedBackend,
      embedModel: suppliedModel,
    };
  }

  let embedding = queryEmbedding;
  let embedBackend = suppliedBackend;
  let embedModel = suppliedModel;

  if (!embedding && !textOnly) {
    const embedResult = await embedTextForRetrieval(query);
    embedding = embedResult.embedding;
    embedBackend = embedResult.backend;
    embedModel = embedResult.model;
  }

  if (embedding && embedding.length > 0) {
    const [semanticRows, textRows] = await Promise.all([
      matchMemoryEntries({
        userId,
        queryEmbedding: embedding,
        topK,
        scope,
        kind,
      }),
      searchMemoryEntries({
        userId,
        query,
        topK,
        scope,
        kind,
      }),
    ]);

    const semantic = mapSemanticRows(semanticRows);
    const text = mapTextRows(textRows);

    return {
      memories: mergeMemoryRows(semantic, text, topK),
      retrievalMode:
        semantic.length > 0 ? "semantic" : text.length > 0 ? "text" : "none",
      embedBackend,
      embedModel,
    };
  }

  const textRows = await searchMemoryEntries({
    userId,
    query,
    topK,
    scope,
    kind,
  });

  const text = mapTextRows(textRows);
  return {
    memories: text.slice(0, topK),
    retrievalMode: text.length > 0 ? "text-only" : "none",
    embedBackend,
    embedModel,
  };
}

export async function captureBillyMemories(params: {
  userId: string;
  userMessage: string;
  assistantResponse: string;
  section?: string;
  conversationMode?: "synthesis" | "chat";
}): Promise<{ candidates: number; stored: number }> {
  const { userId, userMessage, assistantResponse, section, conversationMode } = params;

  if (!userId || userId === "guest-user" || !userMessage.trim()) {
    return { candidates: 0, stored: 0 };
  }

  const candidates = extractBillyMemoryCandidates({
    userMessage,
    assistantResponse,
    section,
    conversationMode,
  });

  if (candidates.length === 0) {
    return { candidates: 0, stored: 0 };
  }

  const saved = await Promise.all(
    candidates.map(async (candidate) => {
      const embedInput = [candidate.title, candidate.summary, candidate.content]
        .filter(Boolean)
        .join("\n\n");

      let embedding: number[] | null = null;
      try {
        const embedResult = await embedTextForRetrieval(embedInput);
        if (Array.isArray(embedResult.embedding) && embedResult.embedding.length > 0) {
          embedding = embedResult.embedding;
        }
      } catch (error) {
        console.error("[memory] Billy auto-capture embedding failed:", error);
      }

      try {
        const row = await upsertMemoryEntry(userId, {
          scope: candidate.scope,
          kind: candidate.kind,
          title: candidate.title,
          summary: candidate.summary,
          content: candidate.content,
          content_hash: hashMemoryContent(candidate.content),
          embedding,
          source: "billy-auto",
          source_ref: section ? `billy:${section}` : "billy:chat",
          tags: candidate.tags,
          metadata: candidate.metadata,
          importance: candidate.importance,
          pinned: candidate.importance >= 5,
        });

        return Boolean(row);
      } catch (error) {
        console.error("[memory] Billy auto-capture persistence failed:", error);
        return false;
      }
    })
  );

  return {
    candidates: candidates.length,
    stored: saved.filter(Boolean).length,
  };
}

export async function storeCollaborationMemory(
  input: CollaborationMemoryInput
): Promise<{ stored: boolean }> {
  const content = normalizeMemoryContent(input.content).slice(0, 12000);
  if (!input.userId || input.userId === "guest-user" || !content) {
    return { stored: false };
  }

  const title =
    input.title === undefined ? deriveMemoryTitle(content) : trimOptionalText(input.title, 160) || null;
  const summary =
    input.summary === undefined
      ? buildMemorySummary(input.kind ?? "note", content)
      : trimOptionalText(input.summary, 400) || null;
  const kind = input.kind ?? "note";
  const tags = buildCollaborationTags(kind, input.tags ?? []);
  const metadata = sanitizeMemoryMetadata({
    ...(input.metadata ?? {}),
    capture: "codex-memory-v1",
  });
  const embedInput = [title || "", summary || "", content].filter(Boolean).join("\n\n");

  let embedding: number[] | null = null;
  try {
    const embedResult = await embedTextForRetrieval(embedInput);
    if (Array.isArray(embedResult.embedding) && embedResult.embedding.length > 0) {
      embedding = embedResult.embedding;
    }
  } catch (error) {
    console.error("[memory] Collaboration memory embedding failed:", error);
  }

  const row = await upsertMemoryEntry(input.userId, {
    scope: "shared",
    kind,
    title,
    summary,
    content,
    content_hash: hashMemoryContent(content),
    embedding,
    source: "codex-manual",
    source_ref: input.sourceRef ?? "codex:session",
    tags,
    metadata,
    importance: normalizeMemoryImportance(input.importance ?? 4),
    pinned: Boolean(input.pinned ?? false),
  });

  return { stored: Boolean(row) };
}

export async function retrieveCollaborationMemories(params: {
  userId: string;
  query: string;
  topK?: number;
}): Promise<MemorySearchResult> {
  const topK = params.topK ?? 4;
  const searchResult = await retrieveMemoryEntries({
    userId: params.userId,
    query: params.query,
    topK,
    scope: "shared",
  });

  if (!params.userId || params.userId === "guest-user") {
    return searchResult;
  }

  const pinnedShared = mapStoredRows(
    await listMemoryEntries({
      userId: params.userId,
      limit: topK,
      scope: "shared",
      pinnedOnly: true,
    })
  );

  if (pinnedShared.length === 0) {
    return searchResult;
  }

  const merged = [...pinnedShared];
  const seen = new Set(merged.map((memory) => memory.id));

  for (const memory of searchResult.memories) {
    if (seen.has(memory.id)) {
      continue;
    }
    merged.push(memory);
    seen.add(memory.id);
    if (merged.length >= topK) {
      break;
    }
  }

  return {
    ...searchResult,
    memories: merged.slice(0, topK),
    retrievalMode:
      searchResult.retrievalMode === "none" && merged.length > 0
        ? "text-only"
        : searchResult.retrievalMode,
  };
}
