export type EmbodimentMutationRiskLevel = "low" | "medium" | "high";

export type EmbodimentMutationStatus =
  | "proposed"
  | "under_review"
  | "approved"
  | "rejected"
  | "applied"
  | "rolled_back";

export type EmbodimentReviewDecision = "approved" | "rejected" | "needs_changes" | "rolled_back";

export interface EmbodimentMutationProposalInput {
  agentSlug: string;
  targetPath: string;
  currentValue: unknown;
  proposedValue: unknown;
  mutationClass: string;
  riskLevel: EmbodimentMutationRiskLevel;
  status?: EmbodimentMutationStatus;
  submittedBy?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
}

export interface EmbodimentMutationProposalRecord extends EmbodimentMutationProposalInput {
  id: string;
  createdAt: string;
}

export interface EmbodimentReviewLogEntryInput {
  proposalId: string;
  agentSlug: string;
  reviewDecision: EmbodimentReviewDecision;
  reviewNotes?: string | null;
  reviewedBy?: string | null;
}

export interface EmbodimentReviewLogEntry extends EmbodimentReviewLogEntryInput {
  id: string;
  createdAt: string;
}

export interface EmbodimentReadinessScoreInput {
  agentSlug: string;
  readinessScore: number;
  readinessSource: string;
  readinessRationale?: string | null;
  recordedBy?: string | null;
}

export interface EmbodimentReadinessScoreRecord extends EmbodimentReadinessScoreInput {
  id: string;
  createdAt: string;
}

export interface EmbodimentPersistenceStatus {
  configured: boolean;
  remoteEnabled: boolean;
  localFallbackEnabled: boolean;
}

interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
}

interface EmbodimentMutationProposalRow {
  id: string;
  agent_slug: string;
  target_path: string;
  current_value: unknown;
  proposed_value: unknown;
  mutation_class: string;
  risk_level: EmbodimentMutationRiskLevel;
  status: EmbodimentMutationStatus;
  submitted_by: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface EmbodimentReviewLogRow {
  id: string;
  proposal_id: string;
  agent_slug: string;
  review_decision: EmbodimentReviewDecision;
  review_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
}

interface EmbodimentReadinessScoreRow {
  id: string;
  agent_slug: string;
  readiness_score: number;
  readiness_source: string;
  readiness_rationale: string | null;
  recorded_by: string | null;
  created_at: string;
}

const MUTATION_STORAGE_KEY = "gestaltview:embodiment:mutation-proposals:v1";
const REVIEW_LOG_STORAGE_KEY = "gestaltview:embodiment:review-log:v1";
const READINESS_STORAGE_KEY = "gestaltview:embodiment:readiness-scores:v1";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `embodiment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readJson<T>(storageKey: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJson<T>(storageKey: string, value: T[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Local fallback is best-effort.
  }
}

function getSupabaseConfig(): SupabaseConfig {
  return {
    url: import.meta.env.VITE_SUPABASE_URL?.trim() || null,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || null,
  };
}

function normalizeJsonValue(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  return value;
}

function buildAuthHeaders(accessToken?: string | null): Record<string, string> {
  const { anonKey } = getSupabaseConfig();
  const token = accessToken?.trim() || anonKey;

  if (!token) {
    return {};
  }

  return {
    apikey: token,
    Authorization: `Bearer ${token}`,
  };
}

function isRemotePersistenceConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

async function remoteFetch<T>(
  path: string,
  init: RequestInit,
  accessToken?: string | null
): Promise<T> {
  const { url } = getSupabaseConfig();

  if (!url) {
    throw new Error("Supabase persistence is not configured.");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Prefer: "return=representation",
      ...buildAuthHeaders(accessToken),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Supabase persistence request failed (${response.status}): ${message || response.statusText}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

function mapProposalInput(input: EmbodimentMutationProposalInput): EmbodimentMutationProposalRecord {
  return {
    id: createId(),
    ...input,
    currentValue: normalizeJsonValue(input.currentValue),
    proposedValue: normalizeJsonValue(input.proposedValue),
    status: input.status ?? "proposed",
    submittedBy: input.submittedBy ?? null,
    reviewedBy: input.reviewedBy ?? null,
    reviewNotes: input.reviewNotes ?? null,
    reviewedAt: input.reviewedAt ?? null,
    createdAt: new Date().toISOString(),
  };
}

function mapReviewInput(input: EmbodimentReviewLogEntryInput): EmbodimentReviewLogEntry {
  return {
    id: createId(),
    ...input,
    reviewNotes: input.reviewNotes ?? null,
    reviewedBy: input.reviewedBy ?? null,
    createdAt: new Date().toISOString(),
  };
}

function mapReadinessInput(input: EmbodimentReadinessScoreInput): EmbodimentReadinessScoreRecord {
  return {
    id: createId(),
    ...input,
    readinessRationale: input.readinessRationale ?? null,
    recordedBy: input.recordedBy ?? null,
    createdAt: new Date().toISOString(),
  };
}

function upsertLocalRecord<T extends { id: string }>(storageKey: string, record: T): T {
  const records = readJson<T>(storageKey);
  const next = [record, ...records.filter((entry) => entry.id !== record.id)];
  writeJson(storageKey, next);
  return record;
}

export function getEmbodimentPersistenceStatus(): EmbodimentPersistenceStatus {
  return {
    configured: isRemotePersistenceConfigured(),
    remoteEnabled: isRemotePersistenceConfigured(),
    localFallbackEnabled: true,
  };
}

export async function submitEmbodimentMutationProposal(
  input: EmbodimentMutationProposalInput,
  options?: { accessToken?: string | null }
): Promise<EmbodimentMutationProposalRecord> {
  const record = mapProposalInput(input);

  if (isRemotePersistenceConfigured()) {
    try {
      const [saved] = await remoteFetch<EmbodimentMutationProposalRow[]>(
        "/embodiment_mutation_proposals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_slug: record.agentSlug,
            target_path: record.targetPath,
            current_value: record.currentValue,
            proposed_value: record.proposedValue,
            mutation_class: record.mutationClass,
            risk_level: record.riskLevel,
            status: record.status,
            submitted_by: record.submittedBy,
            reviewed_by: record.reviewedBy,
            review_notes: record.reviewNotes,
            reviewed_at: record.reviewedAt,
          }),
        },
        options?.accessToken
      );

      return saved
        ? {
            id: saved.id ?? record.id,
            agentSlug: saved.agent_slug ?? record.agentSlug,
            targetPath: saved.target_path ?? record.targetPath,
            currentValue: saved.current_value ?? record.currentValue,
            proposedValue: saved.proposed_value ?? record.proposedValue,
            mutationClass: saved.mutation_class ?? record.mutationClass,
            riskLevel: saved.risk_level ?? record.riskLevel,
            status: saved.status ?? record.status,
            submittedBy: saved.submitted_by ?? record.submittedBy,
            reviewedBy: saved.reviewed_by ?? record.reviewedBy,
            reviewNotes: saved.review_notes ?? record.reviewNotes,
            reviewedAt: saved.reviewed_at ?? record.reviewedAt,
            createdAt: saved.created_at ?? record.createdAt,
          }
        : record;
    } catch {
      // Fall through to local fallback.
    }
  }

  return upsertLocalRecord(MUTATION_STORAGE_KEY, record);
}

export async function listEmbodimentMutationProposals(
  agentSlug?: string,
  options?: { accessToken?: string | null }
): Promise<EmbodimentMutationProposalRecord[]> {
  if (isRemotePersistenceConfigured()) {
    try {
      const filters = new URLSearchParams();
      filters.set("select", "*");
      if (agentSlug) {
        filters.set("agent_slug", `eq.${agentSlug}`);
      }

      const rows = await remoteFetch<EmbodimentMutationProposalRow[]>(
        `/embodiment_mutation_proposals?${filters.toString()}`,
        { method: "GET" },
        options?.accessToken
      );

      return rows.map((row) => ({
        id: row.id,
        agentSlug: row.agent_slug,
        targetPath: row.target_path,
        currentValue: row.current_value,
        proposedValue: row.proposed_value,
        mutationClass: row.mutation_class,
        riskLevel: row.risk_level,
        status: row.status,
        submittedBy: row.submitted_by,
        reviewedBy: row.reviewed_by,
        reviewNotes: row.review_notes,
        reviewedAt: row.reviewed_at,
        createdAt: row.created_at,
      }));
    } catch {
      // Fall through to local fallback.
    }
  }

  return readJson<EmbodimentMutationProposalRecord>(MUTATION_STORAGE_KEY)
    .filter((record) => (agentSlug ? record.agentSlug === agentSlug : true))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function recordEmbodimentReview(
  input: EmbodimentReviewLogEntryInput,
  options?: { accessToken?: string | null }
): Promise<EmbodimentReviewLogEntry> {
  const record = mapReviewInput(input);

  if (isRemotePersistenceConfigured()) {
    try {
      const [saved] = await remoteFetch<EmbodimentReviewLogRow[]>(
        "/embodiment_review_log",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposal_id: record.proposalId,
            agent_slug: record.agentSlug,
            review_decision: record.reviewDecision,
            review_notes: record.reviewNotes,
            reviewed_by: record.reviewedBy,
          }),
        },
        options?.accessToken
      );

      return saved
        ? {
            id: saved.id ?? record.id,
            proposalId: saved.proposal_id ?? record.proposalId,
            agentSlug: saved.agent_slug ?? record.agentSlug,
            reviewDecision: saved.review_decision ?? record.reviewDecision,
            reviewNotes: saved.review_notes ?? record.reviewNotes,
            reviewedBy: saved.reviewed_by ?? record.reviewedBy,
            createdAt: saved.created_at ?? record.createdAt,
          }
        : record;
    } catch {
      // Fall through to local fallback.
    }
  }

  return upsertLocalRecord(REVIEW_LOG_STORAGE_KEY, record);
}

export async function saveEmbodimentReadinessScore(
  input: EmbodimentReadinessScoreInput,
  options?: { accessToken?: string | null }
): Promise<EmbodimentReadinessScoreRecord> {
  const record = mapReadinessInput(input);

  if (isRemotePersistenceConfigured()) {
    try {
      const [saved] = await remoteFetch<EmbodimentReadinessScoreRow[]>(
        "/embodiment_readiness_scores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_slug: record.agentSlug,
            readiness_score: record.readinessScore,
            readiness_source: record.readinessSource,
            readiness_rationale: record.readinessRationale,
            recorded_by: record.recordedBy,
          }),
        },
        options?.accessToken
      );

      return saved
        ? {
            id: saved.id ?? record.id,
            agentSlug: saved.agent_slug ?? record.agentSlug,
            readinessScore: saved.readiness_score ?? record.readinessScore,
            readinessSource: saved.readiness_source ?? record.readinessSource,
            readinessRationale: saved.readiness_rationale ?? record.readinessRationale,
            recordedBy: saved.recorded_by ?? record.recordedBy,
            createdAt: saved.created_at ?? record.createdAt,
          }
        : record;
    } catch {
      // Fall through to local fallback.
    }
  }

  return upsertLocalRecord(READINESS_STORAGE_KEY, record);
}

export async function listEmbodimentReadinessScores(
  agentSlug?: string,
  options?: { accessToken?: string | null }
): Promise<EmbodimentReadinessScoreRecord[]> {
  if (isRemotePersistenceConfigured()) {
    try {
      const filters = new URLSearchParams();
      filters.set("select", "*");
      if (agentSlug) {
        filters.set("agent_slug", `eq.${agentSlug}`);
      }

      const rows = await remoteFetch<EmbodimentReadinessScoreRow[]>(
        `/embodiment_readiness_scores?${filters.toString()}`,
        { method: "GET" },
        options?.accessToken
      );

      return rows.map((row) => ({
        id: row.id,
        agentSlug: row.agent_slug,
        readinessScore: row.readiness_score,
        readinessSource: row.readiness_source,
        readinessRationale: row.readiness_rationale,
        recordedBy: row.recorded_by,
        createdAt: row.created_at,
      }));
    } catch {
      // Fall through to local fallback.
    }
  }

  return readJson<EmbodimentReadinessScoreRecord>(READINESS_STORAGE_KEY)
    .filter((record) => (agentSlug ? record.agentSlug === agentSlug : true))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
