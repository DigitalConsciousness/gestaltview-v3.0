import { createHash } from "node:crypto";

import { decideIdentityWrite } from "../../shared/identityPolicy.js";
import { insertRow } from "./supabase.js";

export type IdentityMemorySubject = "billy" | "embodiment_profile";

export type IdentityMemoryTranscriptTurn = {
  role: "user" | "assistant";
  content: string;
};

function truncate(value: string, max = 320): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, max - 1))}…`;
}

function buildChecksum(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function buildTranscriptText(transcript: IdentityMemoryTranscriptTurn[]): string {
  return transcript
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content.trim()}`)
    .join("\n");
}

function sentenceSplit(value: string): string[] {
  return value
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractTopics(text: string): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "have",
    "your",
    "about",
    "what",
    "when",
    "where",
    "there",
    "their",
    "been",
    "were",
    "they",
    "them",
    "into",
    "over",
    "your",
    "just",
    "like",
    "then",
    "than",
    "will",
    "would",
    "could",
    "should",
    "because",
    "really",
    "very",
    "also",
    "more",
    "some",
    "such",
    "into",
    "here",
    "there",
  ]);

  const words =
    text
      .toLowerCase()
      .match(/[a-z][a-z0-9_-]{2,}/g)
      ?.filter((word) => !stopWords.has(word)) ?? [];

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function buildIdentityMemorySummary(params: {
  subject: IdentityMemorySubject;
  source: string;
  transcript: IdentityMemoryTranscriptTurn[];
}): string {
  const text = buildTranscriptText(params.transcript);
  const userTurns = params.transcript
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content.trim())
    .filter(Boolean);
  const assistantTurns = params.transcript
    .filter((turn) => turn.role === "assistant")
    .map((turn) => turn.content.trim())
    .filter(Boolean);
  const topics = extractTopics(text);

  const subjectLabel = params.subject === "billy" ? "Billy" : "the embodiment profile";
  const sourceLabel = truncate(params.source, 120);
  const topicText = topics.length > 0 ? ` around ${topics.join(", ")}` : "";
  const userLead = userTurns[0] ? `The user said ${truncate(userTurns[0], 120)}. ` : "";
  const assistantLead = assistantTurns[0] ? `Self-response: ${truncate(assistantTurns[0], 140)}. ` : "";

  return truncate(
    `${subjectLabel} recorded a memory turn from ${sourceLabel}${topicText}. ${userLead}${assistantLead}`.trim(),
    400
  );
}

function buildIdentityMemoryTitle(params: {
  subject: IdentityMemorySubject;
  source: string;
  transcript: IdentityMemoryTranscriptTurn[];
}): string {
  const text = buildTranscriptText(params.transcript);
  const topics = extractTopics(text);
  const subjectLabel = params.subject === "billy" ? "Billy" : "Embodiment profile";
  const topicText = topics.length > 0 ? `: ${topics.join(", ")}` : "";
  return truncate(`${subjectLabel} turn from ${params.source}${topicText}`, 120);
}

export async function recordIdentityMemoryTurn(params: {
  subject: IdentityMemorySubject;
  agentId: string;
  userId: string;
  source: string;
  transcript: IdentityMemoryTranscriptTurn[];
  insertRow?: typeof insertRow;
}): Promise<{
  agentId: string;
  recordCount: number;
  summaryWritten: boolean;
}> {
  const insert = params.insertRow ?? insertRow;

  if (
    !params.agentId ||
    !params.userId ||
    params.userId === "guest-user" ||
    params.transcript.length === 0
  ) {
    return {
      agentId: params.agentId || "",
      recordCount: 0,
      summaryWritten: false,
    };
  }

  const writeDecision = decideIdentityWrite({
    subject: params.subject,
    kind: "internal_dialogue",
  });

  if (writeDecision.action !== "allow") {
    throw new Error("Identity memory writes must stay on the memory lane.");
  }

  const transcriptText = buildTranscriptText(params.transcript);
  const summary = buildIdentityMemorySummary(params);
  const title = buildIdentityMemoryTitle(params);
  const recordChecksum = buildChecksum(`${params.subject}:${params.source}:${transcriptText}`);
  const detailPayload = {
    subject: params.subject,
    source: params.source,
    transcript: params.transcript,
    checksum: recordChecksum,
  };

  const recordWrite = await insert("agent_memory_records", {
    agent_id: params.agentId,
    version_id: null,
    source_asset_id: null,
    owner_scope: "PRIVATE_SELF",
    memory_kind: "procedural",
    mutation_class: "EVIDENCE_PROMOTABLE",
    title,
    summary,
    detail: truncate(transcriptText, 4000),
    tags: [params.subject, "internal-dialogue", params.source].filter(Boolean),
    related_entity_ids: [],
    emotional_valence: null,
    salience: 0.7,
    confidence: 0.88,
    evidence_count: params.transcript.length,
    review_status: "NOT_REQUIRED",
    last_affirmed_at: null,
    last_accessed_at: null,
    promotion_threshold: 0.75,
    decay_days: null,
    archive_policy: "archive",
    rollback_eligible: true,
    consent_required_for_sharing: true,
    provenance: detailPayload,
  });

  let summaryWritten = false;
  try {
    summaryWritten = await insert("agent_memories", {
      agent_id: params.agentId,
      source_asset_id: null,
      memory_type: "internal_dialogue",
      summary,
      detail_payload: detailPayload,
      salience: 0.6,
      retention_policy: "review_required",
    });
  } catch (error) {
    console.error("[identity-memory] agent_memories write failed:", error);
  }

  return {
    agentId: params.agentId,
    recordCount: recordWrite ? 1 : 0,
    summaryWritten,
  };
}
