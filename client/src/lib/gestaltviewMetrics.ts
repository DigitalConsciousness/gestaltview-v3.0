export type MetricsTone = "neutral" | "success" | "warning";

export interface MetricsSnapshotTrainerInput {
  trackedRuns: number;
  queuedRuns: number;
  awaitingReviewRuns: number;
  failedRuns: number;
  stalledRuns: number;
}

export interface CountedMetricItem {
  label: string;
  count: number;
}

export interface OrchestrationDecisionInput {
  trigger: string;
  destination: string;
  content_kind: string;
  support_level: string;
  should_forge_artifact: boolean;
  should_persist_signal: boolean;
  should_update_profile: boolean;
  should_update_scaffold: boolean;
  confidence: number | string;
  triggered_at?: string;
}

export interface OrchestrationAnalyticsSummary {
  totalDecisions: number;
  artifactRate: number;
  persistenceRate: number;
  profileRate: number;
  scaffoldRate: number;
  averageConfidence: number;
  elevatedSupportRate: number;
  supportBreakdown: Record<string, number>;
  topTrigger: CountedMetricItem | null;
  topDestination: CountedMetricItem | null;
  topContentKind: CountedMetricItem | null;
  latestDecisionAt: string | null;
}

export interface MetricsSnapshotOrchestrationInput extends OrchestrationAnalyticsSummary {
}

export interface TribunalTranscriptSummary {
  totalTurns: number;
  userTurns: number;
  agentTurns: number;
  cleanAgentTurns: number;
  cannedAgentTurns: number;
  uniqueVoices: number;
  addressedTurns: number;
  autoReplyTurns: number;
  maxReplyDepth: number;
  savedExcerpts: number;
}

export interface MetricsSnapshotInput {
  generatedAt: string;
  trainer: MetricsSnapshotTrainerInput;
  orchestration: MetricsSnapshotOrchestrationInput;
  tribunal: TribunalTranscriptSummary;
}

export interface MetricsCard {
  key: string;
  label: string;
  title?: string;
  value: string;
  detail: string;
  tone: MetricsTone;
}

export interface GestaltViewMetricsSnapshot {
  generatedAt: string;
  overviewCards: MetricsCard[];
  familyCards: MetricsCard[];
  liveSignals: string[];
}

export interface StoredTribunalMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  agentSlug?: string;
  agentLabel?: string;
  addressedTo?: string[];
  isAutoReply?: boolean;
  replyDepth?: number;
}

export interface StoredTribunalExcerpt {
  id: string;
  content?: string;
  title?: string;
  createdAt?: string;
}

const TRIBUNAL_STORAGE_KEY = "gv.tribunal.messages.v1";
const LEGACY_TRIBUNAL_STORAGE_KEY = "gv.agentcouncil.messages.v1";
const ROUNDTABLE_SAVED_STORAGE_KEY = "gv.roundtable.saved.v1";

function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toPositiveInt(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function asPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatCountedItem(item: CountedMetricItem | null): string {
  return item ? `${item.label} (${item.count})` : "none yet";
}

function isBlockedTranscriptTurn(turn: StoredTribunalMessage): boolean {
  return /canned fallback detected|temporarily offline|response blocked/i.test(turn.content);
}

function countUniqueVoices(messages: StoredTribunalMessage[]): number {
  return new Set(
    messages
      .filter((turn) => turn.role === "agent" && Boolean(turn.agentSlug))
      .map((turn) => turn.agentSlug as string),
  ).size;
}

export function readStoredTribunalMessages(): StoredTribunalMessage[] {
  const primary = readJsonStorage<StoredTribunalMessage[] | null>(TRIBUNAL_STORAGE_KEY, null);
  if (primary && primary.length > 0) {
    return primary;
  }

  const legacy = readJsonStorage<StoredTribunalMessage[] | null>(LEGACY_TRIBUNAL_STORAGE_KEY, null);
  return legacy ?? [];
}

export function readSavedTribunalExcerpts(): StoredTribunalExcerpt[] {
  return readJsonStorage<StoredTribunalExcerpt[]>(ROUNDTABLE_SAVED_STORAGE_KEY, []);
}

export function createEmptyOrchestrationAnalyticsSummary(): OrchestrationAnalyticsSummary {
  return {
    totalDecisions: 0,
    artifactRate: 0,
    persistenceRate: 0,
    profileRate: 0,
    scaffoldRate: 0,
    averageConfidence: 0,
    elevatedSupportRate: 0,
    supportBreakdown: {},
    topTrigger: null,
    topDestination: null,
    topContentKind: null,
    latestDecisionAt: null,
  };
}

export function buildTribunalTranscriptSummary(
  messages: StoredTribunalMessage[],
  savedExcerpts: StoredTribunalExcerpt[],
): TribunalTranscriptSummary {
  const agentTurns = messages.filter((turn) => turn.role === "agent");
  return {
    totalTurns: messages.length,
    userTurns: messages.filter((turn) => turn.role === "user").length,
    agentTurns: agentTurns.length,
    cleanAgentTurns: agentTurns.filter((turn) => !isBlockedTranscriptTurn(turn)).length,
    cannedAgentTurns: agentTurns.filter((turn) => isBlockedTranscriptTurn(turn)).length,
    uniqueVoices: countUniqueVoices(messages),
    addressedTurns: messages.filter((turn) => Array.isArray(turn.addressedTo) && turn.addressedTo.length > 0).length,
    autoReplyTurns: messages.filter((turn) => Boolean(turn.isAutoReply)).length,
    maxReplyDepth: messages.reduce((max, turn) => Math.max(max, toPositiveInt(turn.replyDepth ?? 0)), 0),
    savedExcerpts: savedExcerpts.length,
  };
}

function countBy<T>(rows: T[], selector: (row: T) => string): CountedMetricItem[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = selector(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function topItem(
  rows: OrchestrationDecisionInput[],
  selector: (row: OrchestrationDecisionInput) => string,
): CountedMetricItem | null {
  const counts = countBy(rows, selector);
  return counts[0] ?? null;
}

export function buildOrchestrationAnalyticsSummary(
  rows: OrchestrationDecisionInput[],
): OrchestrationAnalyticsSummary {
  const totalDecisions = rows.length;
  const confidenceTotal = rows.reduce((sum, row) => sum + Number(row.confidence ?? 0), 0);
  const supportBreakdown = rows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.support_level] = (accumulator[row.support_level] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totalDecisions,
    artifactRate: totalDecisions > 0 ? rows.filter((row) => row.should_forge_artifact).length / totalDecisions : 0,
    persistenceRate: totalDecisions > 0 ? rows.filter((row) => row.should_persist_signal).length / totalDecisions : 0,
    profileRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_profile).length / totalDecisions : 0,
    scaffoldRate: totalDecisions > 0 ? rows.filter((row) => row.should_update_scaffold).length / totalDecisions : 0,
    elevatedSupportRate:
      totalDecisions > 0
        ? rows.filter((row) => row.support_level === "elevated" || row.support_level === "immediate").length / totalDecisions
        : 0,
    averageConfidence: totalDecisions > 0 ? confidenceTotal / totalDecisions : 0,
    supportBreakdown,
    topTrigger: topItem(rows, (row) => row.trigger),
    topDestination: topItem(rows, (row) => row.destination),
    topContentKind: topItem(rows, (row) => row.content_kind),
    latestDecisionAt: rows[0]?.triggered_at ?? null,
  };
}

function buildEmpathyCard(input: MetricsSnapshotInput): MetricsCard {
  const ratio = input.tribunal.agentTurns > 0 ? input.tribunal.cleanAgentTurns / input.tribunal.agentTurns : 0;
  return {
    key: "empathy_actualization",
    label: "Live proxy",
    title: "Empathy Resonance Index",
    value: asPercent(ratio),
    detail: "Clean Tribunal turns versus canned or offline turns.",
    tone: ratio >= 0.85 ? "success" : "warning",
  };
}

function buildIdentityShiftCard(input: MetricsSnapshotInput): MetricsCard {
  const score = Math.max(input.tribunal.maxReplyDepth, input.tribunal.autoReplyTurns);
  return {
    key: "transformational_change",
    label: "Live proxy",
    title: "Identity Shift Velocity",
    value: `${score} turns`,
    detail: "Follow-up depth and auto-reply activity in the live room.",
    tone: score >= 2 ? "success" : "neutral",
  };
}

function buildCollectiveIntelligenceCard(input: MetricsSnapshotInput): MetricsCard {
  return {
    key: "collective_intelligence",
    label: "Live proxy",
    title: "Collective Breakthrough Density",
    value: `${input.tribunal.uniqueVoices} voices`,
    detail: "Distinct Tribunal voices that have actually spoken.",
    tone: input.tribunal.uniqueVoices >= 4 ? "success" : "neutral",
  };
}

function buildAuthenticSelfCard(input: MetricsSnapshotInput): MetricsCard {
  const ratio = input.tribunal.totalTurns > 0 ? input.tribunal.addressedTurns / input.tribunal.totalTurns : 0;
  return {
    key: "authentic_self_discovery",
    label: "Live proxy",
    title: "Authentic Self Coherence Index",
    value: asPercent(ratio),
    detail: "How often the room is responding directly to named voices.",
    tone: ratio >= 0.5 ? "success" : "warning",
  };
}

function buildNarrativeCard(input: MetricsSnapshotInput): MetricsCard {
  return {
    key: "narrative_change",
    label: "Live proxy",
    title: "Narrative Evolution Index",
    value: `${input.tribunal.savedExcerpts} saves`,
    detail: "Saved Tribunal excerpts and creation handoff activity.",
    tone: input.tribunal.savedExcerpts > 0 ? "success" : "neutral",
  };
}

export function buildGestaltViewMetricsSnapshot(
  input: MetricsSnapshotInput,
): GestaltViewMetricsSnapshot {
  const operationalTone = input.trainer.stalledRuns > 0 ? "warning" : "success";
  const confidencePercent = asPercent(input.orchestration.averageConfidence);
  const elevatedSupportPercent = asPercent(input.orchestration.elevatedSupportRate);

  return {
    generatedAt: input.generatedAt,
    overviewCards: [
      {
        key: "trainer_health",
        label: "Operational health",
        value: input.trainer.stalledRuns > 0 ? `${input.trainer.stalledRuns} stalled` : "Clear",
        detail: `${input.trainer.queuedRuns} queued, ${input.trainer.awaitingReviewRuns} awaiting review, ${input.trainer.failedRuns} failed.`,
        tone: operationalTone,
      },
      {
        key: "orchestration_health",
        label: "Orchestration coverage",
        value: String(input.orchestration.totalDecisions),
        detail: `${confidencePercent} average confidence, ${elevatedSupportPercent} elevated support, ${asPercent(input.orchestration.artifactRate)} artifact-ready.`,
        tone: input.orchestration.totalDecisions > 0 ? "success" : "neutral",
      },
    ],
    familyCards: [
      buildEmpathyCard(input),
      buildIdentityShiftCard(input),
      buildCollectiveIntelligenceCard(input),
      buildAuthenticSelfCard(input),
      buildNarrativeCard(input),
    ],
    liveSignals: [
      `Trainer queue: ${input.trainer.queuedRuns} queued / ${input.trainer.stalledRuns} stalled`,
      `Council health: ${input.tribunal.cleanAgentTurns} clean turns / ${input.tribunal.cannedAgentTurns} canned`,
      `Decision spine: ${input.orchestration.totalDecisions} decisions at ${Math.round(input.orchestration.elevatedSupportRate * 100)}% elevated support`,
      `Artifact cadence: ${asPercent(input.orchestration.artifactRate)} artifact-ready / ${asPercent(input.orchestration.persistenceRate)} persisted / ${asPercent(input.orchestration.profileRate)} profile updates / ${asPercent(input.orchestration.scaffoldRate)} scaffold updates`,
      `Routing focus: trigger ${formatCountedItem(input.orchestration.topTrigger)} → destination ${formatCountedItem(input.orchestration.topDestination)}`,
      `Content mix: ${formatCountedItem(input.orchestration.topContentKind)} | latest decision ${input.orchestration.latestDecisionAt ? new Date(input.orchestration.latestDecisionAt).toLocaleString() : "not yet"}`,
    ],
  };
}
