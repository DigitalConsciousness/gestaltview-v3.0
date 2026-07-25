import { createHash } from "node:crypto";

import { decideIdentityWrite } from "../../shared/identityPolicy.js";
import { insertRow } from "./supabase.js";
import { getBillyAgent, loadBillyIdentityContext } from "./billyIdentityContext.js";
import { recordIdentityMemoryTurn } from "./identityMemoryWriter.js";

type TranscriptTurn = {
  role: "user" | "assistant";
  content: string;
};

type SessionMemoryKind = "episodic" | "semantic" | "relational" | "procedural";

type AgentMemoryRecordRow = {
  memory_id: string;
  agent_id: string;
  memory_kind: string;
  title: string;
  summary: string;
  detail: string | null;
  tags: string[] | null;
  salience: number;
  confidence: number;
  created_at: string;
};

type AgentMemorySummaryRow = {
  id: string;
  agent_id: string;
  memory_type: string;
  summary: string;
  detail_payload: Record<string, unknown> | null;
  salience: number;
  created_at: string;
};

type EmbodimentProfileRow = {
  slug: string;
  public_name: string;
  internal_designation: string | null;
  status: string;
  visibility_scope: string;
  profile_json: Record<string, unknown>;
};

type FounderContextRow = {
  current_state: string | null;
  session_thread: string | null;
  plk_snapshot: Record<string, unknown> | null;
  mode_preference: "synthesis" | "chat" | null;
  last_session_at: string | null;
};

type AgentAutobiographyRow = {
  evolving_self_story: string;
  key_turning_points: unknown[] | null;
  stable_themes: unknown[] | null;
  unresolved_tensions: unknown[] | null;
  future_trajectory: unknown[] | null;
  private_hopes: unknown[] | null;
  created_at: string;
};

type AgentConstitutionRow = {
  public_name: string | null;
  internal_designation: string | null;
  identity_handle: string | null;
  primary_narrative_anchor: string | null;
  immutable_core: Record<string, unknown> | null;
  role_commitments: unknown[] | null;
  created_at: string;
};

type MemoryEntryRow = {
  id: string;
  title: string | null;
  summary: string | null;
  content: string;
  kind: string;
  scope: string;
  importance: number;
  pinned: boolean;
  tags: string[] | null;
  source: string;
  source_ref: string | null;
  created_at: string;
};

function buildChecksum(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function truncate(value: string, max = 320): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, max - 1))}…`;
}

function compactJson(value: unknown, max = 180): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return truncate(value, max);
  }

  try {
    return truncate(JSON.stringify(value), max);
  } catch {
    return "";
  }
}

function toLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry.trim();
        }
        return compactJson(entry);
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function summarizeProfile(profile: EmbodimentProfileRow | null, constitution: AgentConstitutionRow | null): string {
  const parts: string[] = [];

  if (profile) {
    const immutableCore = profile.profile_json.immutableCore as Record<string, unknown> | undefined;
    const foundationalTruth =
      typeof immutableCore?.foundationalTruth === "string"
        ? immutableCore.foundationalTruth
        : "";
    const coreWisdom =
      typeof immutableCore?.coreWisdom === "string" ? immutableCore.coreWisdom : "";
    const voiceTone =
      typeof immutableCore?.voiceTone === "string" ? immutableCore.voiceTone : "";

    parts.push(
      `${profile.public_name}${profile.internal_designation ? ` (${profile.internal_designation})` : ""}`,
      `status: ${profile.status}`,
      `visibility: ${profile.visibility_scope}`,
    );

    if (foundationalTruth) {
      parts.push(`foundational truth: ${truncate(foundationalTruth, 200)}`);
    }

    if (coreWisdom) {
      parts.push(`core wisdom: ${truncate(coreWisdom, 180)}`);
    }

    if (voiceTone) {
      parts.push(`voice tone: ${truncate(voiceTone, 140)}`);
    }
  }

  if (constitution) {
    parts.push(
      constitution.primary_narrative_anchor
        ? `narrative anchor: ${truncate(constitution.primary_narrative_anchor, 180)}`
        : "",
      constitution.identity_handle ? `identity handle: ${constitution.identity_handle}` : "",
      constitution.public_name ? `constitution name: ${constitution.public_name}` : "",
      constitution.internal_designation ? `designation: ${constitution.internal_designation}` : "",
    );
  }

  return parts.filter(Boolean).join("; ");
}

function formatMemoryRecord(record: AgentMemoryRecordRow): string {
  const title = truncate(record.title, 90);
  const summary = truncate(record.summary, 220);
  const detail = record.detail ? truncate(record.detail, 180) : "";
  const tags = record.tags && record.tags.length > 0 ? ` [${record.tags.join(", ")}]` : "";

  return `${title}: ${summary}${detail ? ` · ${detail}` : ""}${tags}`;
}

function formatPersistentMemory(entry: MemoryEntryRow): string {
  const title = truncate(entry.title ?? "Memory", 90);
  const summary = truncate(entry.summary ?? entry.content, 220);
  const tags = entry.tags && entry.tags.length > 0 ? ` [${entry.tags.join(", ")}]` : "";

  return `${title}: ${summary}${tags}`;
}

function formatAutobiography(autobiography: AgentAutobiographyRow | null): string {
  if (!autobiography) {
    return "";
  }

  const story = truncate(autobiography.evolving_self_story, 260);
  const turningPoints = toLines(autobiography.key_turning_points).slice(0, 3);
  const themes = toLines(autobiography.stable_themes).slice(0, 3);
  const tensions = toLines(autobiography.unresolved_tensions).slice(0, 2);
  const trajectory = toLines(autobiography.future_trajectory).slice(0, 2);
  const hopes = toLines(autobiography.private_hopes).slice(0, 2);

  return [
    story ? `story: ${story}` : "",
    turningPoints.length > 0 ? `turning points: ${turningPoints.join("; ")}` : "",
    themes.length > 0 ? `stable themes: ${themes.join("; ")}` : "",
    tensions.length > 0 ? `unresolved tensions: ${tensions.join("; ")}` : "",
    trajectory.length > 0 ? `future trajectory: ${trajectory.join("; ")}` : "",
    hopes.length > 0 ? `private hopes: ${hopes.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function buildTranscriptText(transcript: TranscriptTurn[]): string {
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

  const words = text
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

function classifySentence(sentence: string): {
  kind: SessionMemoryKind;
  importance: number;
  tags: string[];
} | null {
  const normalized = sentence.trim();

  if (!normalized) {
    return null;
  }

  if (/\b(we decided|decision|the plan is|next step|let'?s|we will|we'll|I will|I'?m going to|I am going to)\b/i.test(normalized)) {
    return { kind: "procedural", importance: 5, tags: ["decision", "plan"] };
  }

  if (/\b(i am|i'm|i have|i’ve|i work on|i'm building|i am building|my name is|i prefer|i like|i love|i need|i struggle with)\b/i.test(normalized)) {
    return { kind: "relational", importance: 4, tags: ["user-fact"] };
  }

  if (/\b(i realized|i learned|i noticed|this means|it turns out)\b/i.test(normalized)) {
    return { kind: "semantic", importance: 4, tags: ["insight"] };
  }

  if (/\b(frustrated|relieved|excited|stuck|worried|afraid|grateful|annoyed|energized)\b/i.test(normalized)) {
    return { kind: "episodic", importance: 3, tags: ["emotion"] };
  }

  if (/\b(\.ts|\.tsx|\.js|\.json|\/api\/|\/server\/|\/client\/|file:|path:|script:)\b/i.test(normalized)) {
    return { kind: "semantic", importance: 3, tags: ["artifact"] };
  }

  return null;
}

export function extractSessionMemoryCandidates(transcript: TranscriptTurn[]): Array<{
  kind: SessionMemoryKind;
  title: string;
  summary: string;
  detail: string;
  tags: string[];
  importance: number;
  confidence: number;
}> {
  const text = buildTranscriptText(transcript);
  const candidates: Array<{
    kind: SessionMemoryKind;
    title: string;
    summary: string;
    detail: string;
    tags: string[];
    importance: number;
    confidence: number;
  }> = [];
  const seen = new Set<string>();

  for (const sentence of sentenceSplit(text)) {
    if (sentence.length < 24) {
      continue;
    }

    const classification = classifySentence(sentence);
    if (!classification) {
      continue;
    }

    const detail = truncate(sentence, 360);
    const hash = buildChecksum(`${classification.kind}:${detail.toLowerCase()}`);
    if (seen.has(hash)) {
      continue;
    }
    seen.add(hash);

    candidates.push({
      kind: classification.kind,
      title: truncate(sentence.replace(/^[-*•]\s*/, ""), 88),
      summary: truncate(sentence, 220),
      detail,
      tags: classification.tags,
      importance: classification.importance,
      confidence: classification.importance >= 5 ? 0.92 : classification.importance >= 4 ? 0.84 : 0.72,
    });
  }

  const topics = extractTopics(text);
  if (topics.length > 0) {
    const topicDetail = truncate(`Topics discussed: ${topics.join(", ")}`, 260);
    const topicHash = buildChecksum(`semantic:${topicDetail.toLowerCase()}`);
    if (!seen.has(topicHash)) {
      candidates.unshift({
        kind: "semantic",
        title: "Session topics",
        summary: `Discussed ${topics.join(", ")}.`,
        detail: topicDetail,
        tags: ["topics", ...topics.slice(0, 3)],
        importance: 3,
        confidence: 0.7,
      });
    }
  }

  return candidates.slice(0, 5);
}

export function buildSessionSummary(transcript: TranscriptTurn[], candidates: ReturnType<typeof extractSessionMemoryCandidates>): string {
  const userTurns = transcript.filter((turn) => turn.role === "user").map((turn) => turn.content.trim()).filter(Boolean);
  const assistantTurns = transcript.filter((turn) => turn.role === "assistant").map((turn) => turn.content.trim()).filter(Boolean);
  const topics = extractTopics(buildTranscriptText(transcript));
  const decisions = candidates.filter((candidate) => candidate.kind === "procedural").slice(0, 2);
  const relational = candidates.filter((candidate) => candidate.kind === "relational").slice(0, 2);
  const semantic = candidates.filter((candidate) => candidate.kind === "semantic").slice(0, 2);

  const sentences = [
    topics.length > 0
      ? `The session centered on ${topics.join(", ")}.`
      : "The session focused on the current conversation thread.",
    userTurns.length > 0
      ? `The user contributed ${truncate(userTurns[0], 180)}.`
      : "The user shared session context and direction.",
    decisions.length > 0
      ? `A key decision or plan emerged: ${truncate(decisions[0].summary, 180)}.`
      : "The exchange did not resolve every thread, but it advanced the continuity state.",
    relational.length > 0
      ? `Durable personal context was captured: ${truncate(relational[0].summary, 180)}.`
      : "Relationship context stayed lightweight in this exchange.",
    semantic.length > 0
      ? `Notable themes included ${truncate(semantic[0].summary, 180)}.`
      : assistantTurns.length > 0
        ? `Billy responded with ${truncate(assistantTurns[0], 160)}.`
        : "Billy recorded the session as a continuity waypoint.",
  ];

  return sentences.join(" ");
}

export function composeIdentityContextBlock(params: {
  profile: EmbodimentProfileRow | null;
  constitution: AgentConstitutionRow | null;
  memoryRecords: AgentMemoryRecordRow[];
  summaryMemories: AgentMemorySummaryRow[];
  persistentMemories: MemoryEntryRow[];
  founderContext: FounderContextRow | null;
  autobiography: AgentAutobiographyRow | null;
}): string {
  const lines = ["---GESTALTVIEW IDENTITY CONTEXT---"];
  const whoAmI = summarizeProfile(params.profile, params.constitution);
  const memoryLines = params.memoryRecords.slice(0, 10).map((record) => `- ${formatMemoryRecord(record)}`);
  const summaryLines = params.summaryMemories.slice(0, 5).map((memory) => `- ${truncate(memory.summary, 180)}`);
  const persistentLines = params.persistentMemories.slice(0, 6).map((entry) => `- ${formatPersistentMemory(entry)}`);
  const founderLines: string[] = [];

  if (params.founderContext?.current_state) {
    founderLines.push(`- current state: ${truncate(params.founderContext.current_state, 180)}`);
  }
  if (params.founderContext?.session_thread) {
    founderLines.push(`- thread: ${truncate(params.founderContext.session_thread, 180)}`);
  }
  if (params.founderContext?.plk_snapshot) {
    founderLines.push(`- plk: ${truncate(JSON.stringify(params.founderContext.plk_snapshot), 240)}`);
  }
  if (params.founderContext?.mode_preference) {
    founderLines.push(`- mode preference: ${params.founderContext.mode_preference}`);
  }

  const autobiography = formatAutobiography(params.autobiography);

  lines.push(`WHO I AM: ${whoAmI || "Billy profile not yet synced."}`);

  if (memoryLines.length > 0 || persistentLines.length > 0) {
    lines.push("WHAT I KNOW ABOUT YOU:");
    lines.push(...memoryLines);
    lines.push(...persistentLines);
  }

  if (summaryLines.length > 0) {
    lines.push("WHAT WE HAVE WORKED ON:");
    lines.push(...summaryLines);
  }

  if (founderLines.length > 0) {
    lines.push("STANDING CONTEXT:");
    lines.push(...founderLines);
  }

  if (autobiography) {
    lines.push(`MY CURRENT CHAPTER: ${autobiography}`);
  }

  lines.push("---END CONTEXT---");

  return lines.join("\n");
}

export async function buildBillySessionSystemPrompt(params: {
  userId: string;
  baseSystemPrompt: string;
  sessionId?: string | null;
}): Promise<{
  systemPrompt: string;
  packetContent: string | null;
  memoryCount: number;
}> {
  if (!params.userId || params.userId === "guest-user") {
    // The shared helper handles the same guard, but this keeps the fast-path
    // stable and avoids unnecessary prompt construction work.
    return {
      systemPrompt: params.baseSystemPrompt,
      packetContent: null,
      memoryCount: 0,
    };
  }

  const agent = await getBillyAgent();
  if (!agent) {
    return {
      systemPrompt: params.baseSystemPrompt,
      packetContent: null,
      memoryCount: 0,
    };
  }

  const { profile, constitution, memoryRecords, summaryMemories, persistentMemories, founderContext, autobiography, identitySubject } =
    await loadBillyIdentityContext({
      userId: params.userId,
      agentId: agent.agent_id,
    });

  const memoryCount = memoryRecords.length + summaryMemories.length + persistentMemories.length;

  if (!profile) {
    return {
      systemPrompt: params.baseSystemPrompt,
      packetContent: null,
      memoryCount,
    };
  }

  const packetContent = composeIdentityContextBlock({
    profile,
    constitution,
    memoryRecords,
    summaryMemories,
    persistentMemories: [...persistentMemories],
    founderContext,
    autobiography,
  });

  if (identitySubject?.subject_id) {
    try {
      await insertRow("context_injection_packets", {
        subject_id: identitySubject.subject_id,
        auth_user_id: params.userId,
        packet_kind: "session",
        surface: "system",
        source_manifest: {
          source: "billy-memory-pipeline",
          agent_slug: agent.slug,
          agent_title: agent.title,
          session_id: params.sessionId ?? null,
          memory_count: memoryCount,
          profile_slug: profile?.slug ?? null,
        },
        payload: {
          packet_content: packetContent,
          memory_count: memoryCount,
          profile_slug: profile?.slug ?? null,
          agent_slug: agent.slug,
        },
        checksum: buildChecksum(packetContent),
      });
    } catch (error) {
      console.error("[billy-memory] context packet write failed:", error);
    }
  }

  return {
    systemPrompt: `${packetContent}\n\n${params.baseSystemPrompt}`,
    packetContent,
    memoryCount,
  };
}

export async function recordBillySessionCloseout(params: {
  userId: string;
  sessionId?: string | null;
  transcript: TranscriptTurn[];
  section?: string;
  conversationMode?: "synthesis" | "chat";
  bootstrap?: boolean;
}): Promise<{
  agentId: string | null;
  candidateCount: number;
  recordCount: number;
  summaryWritten: boolean;
}> {
  if (
    !params.userId ||
    params.userId === "guest-user" ||
    params.bootstrap ||
    params.transcript.length === 0
  ) {
    return {
      agentId: null,
      candidateCount: 0,
      recordCount: 0,
      summaryWritten: false,
    };
  }

  const agent = await getBillyAgent();
  if (!agent) {
    return {
      agentId: null,
      candidateCount: 0,
      recordCount: 0,
      summaryWritten: false,
    };
  }

  const writeDecision = decideIdentityWrite({ subject: "billy", kind: "memory" });
  if (writeDecision.action !== "allow") {
    throw new Error("Billy memory closeout writes must stay on the memory lane.");
  }

  try {
    await recordIdentityMemoryTurn({
      subject: "billy",
      agentId: agent.agent_id,
      userId: params.userId,
      source: "billy-session-closeout",
      transcript: params.transcript,
    });
  } catch (error) {
    console.error("[billy-memory] identity memory turn write failed:", error);
  }

  const candidates = extractSessionMemoryCandidates(params.transcript);
  const summary = buildSessionSummary(params.transcript, candidates);
  const summaryDetail = {
    session_id: params.sessionId ?? null,
    section: params.section ?? null,
    conversation_mode: params.conversationMode ?? null,
    transcript: params.transcript,
    candidates,
  };

  const recordWrites = candidates.map(async (candidate) => {
    try {
      return await insertRow("agent_memory_records", {
        agent_id: agent.agent_id,
        version_id: null,
        source_asset_id: null,
        owner_scope: "PRIVATE_SELF",
        memory_kind: candidate.kind.toUpperCase(),
        mutation_class: "EVIDENCE_PROMOTABLE",
        title: candidate.title,
        summary: candidate.summary,
        detail: candidate.detail,
        tags: candidate.tags,
        related_entity_ids: [],
        emotional_valence: null,
        salience: Math.min(1, 0.45 + candidate.importance * 0.1),
        confidence: candidate.confidence,
        evidence_count: 1,
        review_status: "NOT_REQUIRED",
        last_affirmed_at: null,
        last_accessed_at: null,
        promotion_threshold: 0.75,
        decay_days: null,
        archive_policy: "archive",
        rollback_eligible: true,
        consent_required_for_sharing: true,
        provenance: {
          source: "session_close_writer",
          session_id: params.sessionId ?? null,
          user_id: params.userId,
          section: params.section ?? null,
          conversation_mode: params.conversationMode ?? null,
        },
      });
    } catch (error) {
      console.error("[billy-memory] agent_memory_records write failed:", error);
      return false;
    }
  });

  let summaryWritten = false;
  try {
    summaryWritten = await insertRow("agent_memories", {
      agent_id: agent.agent_id,
      source_asset_id: null,
      memory_type: candidates.some((candidate) => candidate.kind === "procedural")
        ? "procedural"
        : candidates.some((candidate) => candidate.kind === "relational")
          ? "relational"
          : "episodic",
      summary,
      detail_payload: summaryDetail,
      salience: candidates.length > 0 ? Math.min(1, 0.55 + candidates[0].importance * 0.05) : 0.55,
      retention_policy: "review_required",
    });
  } catch (error) {
    console.error("[billy-memory] agent_memories write failed:", error);
  }

  const results = await Promise.all(recordWrites);
  const recordCount = results.filter(Boolean).length;

  return {
    agentId: agent.agent_id,
    candidateCount: candidates.length,
    recordCount,
    summaryWritten,
  };
}
