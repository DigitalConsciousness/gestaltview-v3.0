import { z } from "zod";

import { appFetchJson, type AppFetchResult } from "@/lib/appFetch";


import type {
  AgentSummary,
  ScenarioSetSummary,
  SubmitTrainingRunRequest,
  TrainerExperimentDetail,
  TrainerExperimentSummary,
  TrainerMutationReceipt,
  TrainerPackagingCandidate,
  TrainerPersonhoodSnapshot,
  TrainerQueueHealth,
  TrainerConnector,
  TrainerExperimentGraph,
  TrainerMemorySurface,
  TrainerSkill,
  TrainerStudySourceRecommendation,
  TrainingRunBlocker,
  TrainingRunDetail,
  TrainingRunSummary,
  TrainingRunEvent,
  TrainerStudySourceSummary,
} from "@shared/agent-trainer/schemas";
import {
  CreateTrainerExperimentRequestSchema,
  CreateTrainerPackagingCandidateRequestSchema,
  CreateTrainerPolicyFlagRequestSchema,
  CreateTrainerReviewDecisionRequestSchema,
  ListTrainerExperimentsResponseSchema,
  ListTrainerPackagingCandidatesResponseSchema,
  ListAgentsResponseSchema,
  ListScenarioSetsResponseSchema,
  ListTrainerStudySourceRecommendationsResponseSchema,
  ListTrainerStudySourcesResponseSchema,
  ListTrainingRunsResponseSchema,
  TrainingRunSummarySchema,
  ListTrainerConnectorsResponseSchema,
  ListTrainerSkillsResponseSchema,
  ListTrainerMemorySurfacesResponseSchema,
  TrainerExperimentGraphResponseSchema,
  SubmitTrainingRunResponseSchema,
  TrainerExperimentDetailResponseSchema,
  TrainerPackagingCandidateSchema,
  TrainerPersonhoodSnapshotResponseSchema,
  TrainerQueueHealthResponseSchema,
  TrainerRunMutationResponseSchema,
  TrainingRunEventsResponseSchema,
  TrainingRunDetailSchema,
  TrainingRunBlockerSchema,
  UploadTrainerPackagingAttachmentRequestSchema,
  UpdateTrainerExperimentRequestSchema,
  UpdateTrainerPackagingCandidateRequestSchema,
  UpdateTrainerPolicyFlagRequestSchema,
  AttachTrainerExperimentSourceRequestSchema,
} from "@shared/agent-trainer/schemas";


export class TrainerApiError extends Error {
  status: number;
  payload: unknown;


  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "TrainerApiError";
    this.status = status;
    this.payload = payload;
  }
}


export interface TrainerRequestDiagnostics {
  requestPath: string;
  method: string;
  authHeaderPresent: boolean;
  online: boolean | null;
  visibilityState: string | null;
  locationPathname: string | null;
  timestamp: string;
  cause: string | null;
  status: number | null;
}

type TrainerResponsePayload = {
  error?: string;
  message?: string;
  ok?: boolean;
  degraded?: boolean;
  reason?: string;
  fallbackSource?: string;
  run?: TrainingRunDetail;
  runs?: TrainingRunSummary[];
  agents?: AgentSummary[];
  personhood?: TrainerPersonhoodSnapshot;
  scenarioSets?: ScenarioSetSummary[];
  studySources?: TrainerStudySourceSummary[];
  recommendations?: TrainerStudySourceRecommendation[];
  retrievalQuery?: string;
  sourceFiles?: string[];
  experiments?: TrainerExperimentSummary[];
  experiment?: TrainerExperimentDetail;
  candidates?: TrainerPackagingCandidate[];
  candidate?: TrainerPackagingCandidate;
  queueHealth?: TrainerQueueHealth;
  events?: TrainingRunEvent[];
  receipt?: TrainerMutationReceipt;
  blocker?: TrainingRunBlocker | null;
  diagnostics?: TrainerRequestDiagnostics;
};


function readOnlineState(): boolean | null {
  if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
    return null;
  }
  return navigator.onLine;
}


function readVisibilityState(): string | null {
  if (typeof document === "undefined" || typeof document.visibilityState !== "string") {
    return null;
  }
  return document.visibilityState;
}


function readLocationPathname(): string | null {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }
  return `${window.location.pathname}${window.location.search}`;
}


function buildRequestDiagnostics(
  path: string,
  init: RequestInit,
  authHeaders: Record<string, string>,
  cause?: unknown,
  status?: number | null
): TrainerRequestDiagnostics {
  return {
    requestPath: path,
    method: String(init.method ?? "GET").toUpperCase(),
    authHeaderPresent: Boolean(authHeaders.Authorization),
    online: readOnlineState(),
    visibilityState: readVisibilityState(),
    locationPathname: readLocationPathname(),
    timestamp: new Date().toISOString(),
    cause: cause instanceof Error ? cause.message : typeof cause === "string" ? cause : null,
    status: typeof status === "number" ? status : null,
  };
}


const TRAINER_API_BASE_URL_KEYS = [
  "VITE_API_BASE_URL",
  "VITE_API_PROXY_TARGET",
  "VITE_BILLY_API_URL",
] as const;

function normalizeApiBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.startsWith("//")) {
    return `https:${withoutTrailingSlash}`;
  }

  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function readConfiguredApiOrigins(): string[] {
  const origins = new Set<string>();

  for (const key of TRAINER_API_BASE_URL_KEYS) {
    const candidate = normalizeApiBaseUrl(String(import.meta.env[key] ?? ""));
    if (candidate) {
      origins.add(candidate);
    }
  }

  return [...origins];
}

function buildAbsoluteApiUrl(path: string, origin: string): string | null {
  if (!path.startsWith("/")) return null;
  if (!origin) return null;

  return `${origin}${path}`;
}

function buildRequestUrlCandidates(path: string): string[] {
  if (!path.startsWith("/")) {
    return [path];
  }

  const requestUrls = [path];
  const currentOrigin = typeof window !== "undefined" && window.location ? window.location.origin : "";

  for (const origin of readConfiguredApiOrigins()) {
    if (!origin || origin === currentOrigin) {
      continue;
    }

    const absoluteUrl = buildAbsoluteApiUrl(path, origin);
    if (absoluteUrl) {
      requestUrls.push(absoluteUrl);
    }
  }

  return requestUrls;
}


function buildNetworkErrorMessage(diagnostics: TrainerRequestDiagnostics): string {
  const hints: string[] = [];
  if (!diagnostics.authHeaderPresent) hints.push("auth header missing");
  if (diagnostics.online === false) hints.push("browser offline");
  return hints.length > 0
    ? `Unable to reach ${diagnostics.requestPath}. Check trainer auth, API routing, or recent migrations (${hints.join(", ")}).`
    : `Unable to reach ${diagnostics.requestPath}. Check trainer auth, API routing, or recent migrations.`;
}

const TRAINER_AUTH_FAILURE_COOLDOWN_MS = 60_000;

let trainerAuthFailureCircuit:
  | {
      tokenKey: string;
      openUntil: number;
      status: 401 | 403;
      message: string;
    }
  | null = null;

function isTrainerApiPath(path: string): boolean {
  return path.startsWith("/api/trainer") || path.includes("/api/trainer/");
}

function authTokenKey(authHeaders: Record<string, string>): string {
  const authorization = authHeaders.Authorization ?? "";
  return authorization ? authorization.slice(-24) : "missing";
}

function readTrainerAuthCircuitError(
  path: string,
  init: RequestInit,
  authHeaders: Record<string, string>
): TrainerApiError | null {
  if (!isTrainerApiPath(path) || !trainerAuthFailureCircuit) {
    return null;
  }

  if (Date.now() >= trainerAuthFailureCircuit.openUntil) {
    trainerAuthFailureCircuit = null;
    return null;
  }

  if (trainerAuthFailureCircuit.tokenKey !== authTokenKey(authHeaders)) {
    return null;
  }

  const diagnostics = buildRequestDiagnostics(
    path,
    init,
    authHeaders,
    "trainer_auth_circuit_open",
    trainerAuthFailureCircuit.status
  );

  return new TrainerApiError(trainerAuthFailureCircuit.message, trainerAuthFailureCircuit.status, {
    error: "trainer_auth_circuit_open",
    diagnostics,
  });
}

function openTrainerAuthCircuit(
  authHeaders: Record<string, string>,
  status: 401 | 403,
  message: string
): void {
  trainerAuthFailureCircuit = {
    tokenKey: authTokenKey(authHeaders),
    openUntil: Date.now() + TRAINER_AUTH_FAILURE_COOLDOWN_MS,
    status,
    message,
  };
}

function clearTrainerAuthCircuit(authHeaders: Record<string, string>): void {
  if (!trainerAuthFailureCircuit || trainerAuthFailureCircuit.tokenKey !== authTokenKey(authHeaders)) {
    return;
  }

  trainerAuthFailureCircuit = null;
}

export function resetTrainerAuthCircuitForTests(): void {
  trainerAuthFailureCircuit = null;
}

function requestTimeoutForPath(path: string): number {
  if (path.includes("/study-sources/recommendations")) {
    return 5_000;
  }

  return 8_000;
}

function requestRetriesForPath(path: string, method: string): number {
  if (path.includes("/study-sources/recommendations")) {
    return 1;
  }

  return method === "GET" ? 1 : 0;
}

function isPostSafeToRetry(path: string): boolean {
  return path.includes("/study-sources/recommendations");
}


export function extractTrainerRequestDiagnostics(payload: unknown): TrainerRequestDiagnostics | null {
  if (!payload || typeof payload !== "object" || !("diagnostics" in payload)) return null;
  const diagnostics = (payload as { diagnostics?: unknown }).diagnostics;
  if (!diagnostics || typeof diagnostics !== "object") return null;
  const candidate = diagnostics as Partial<TrainerRequestDiagnostics>;
  if (typeof candidate.requestPath !== "string" || typeof candidate.method !== "string") return null;
  return {
    requestPath: candidate.requestPath,
    method: candidate.method,
    authHeaderPresent: Boolean(candidate.authHeaderPresent),
    online: typeof candidate.online === "boolean" || candidate.online === null ? candidate.online : null,
    visibilityState: typeof candidate.visibilityState === "string" || candidate.visibilityState === null ? candidate.visibilityState : null,
    locationPathname: typeof candidate.locationPathname === "string" || candidate.locationPathname === null ? candidate.locationPathname : null,
    timestamp: typeof candidate.timestamp === "string" ? candidate.timestamp : new Date().toISOString(),
    cause: typeof candidate.cause === "string" || candidate.cause === null ? candidate.cause : null,
    status: typeof candidate.status === "number" || candidate.status === null ? candidate.status : null,
  };
}


// ─── Auth header resolution ───────────────────────────────────────────────────


async function getAuthHeaders(): Promise<Record<string, string>> {
  return {};
}


async function getRefreshedAuthHeaders(): Promise<Record<string, string>> {
  return {};
}


// ─── Core request function ────────────────────────────────────────────────────


async function request<T>(
  path: string,
  init: RequestInit = {},
  authHeaders: Record<string, string> = {}
): Promise<T> {
  let resolvedAuthHeaders =
    Object.keys(authHeaders).length > 0 ? authHeaders : await getAuthHeaders();
  const requestUrls = buildRequestUrlCandidates(path);
  let lastNetworkError: AppFetchResult<TrainerResponsePayload> | unknown = null;
  const method = String(init.method ?? "GET").toUpperCase();
  const circuitError = readTrainerAuthCircuitError(path, init, resolvedAuthHeaders);
  if (circuitError) {
    throw circuitError;
  }

  for (const requestUrl of requestUrls) {
    let result = await appFetchJson<TrainerResponsePayload>(requestUrl, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...resolvedAuthHeaders,
        ...(init.headers ?? {}),
      },
      timeoutMs: requestTimeoutForPath(path),
      retries: requestRetriesForPath(path, method),
      retryUnsafe: isPostSafeToRetry(path),
    });

    if (!result.ok && result.status === 401) {
      const previousAuthorization = resolvedAuthHeaders.Authorization ?? "";
      const refreshedAuthHeaders = await getRefreshedAuthHeaders();
      const refreshedAuthorization = refreshedAuthHeaders.Authorization ?? "";

      if (refreshedAuthorization && refreshedAuthorization !== previousAuthorization) {
        resolvedAuthHeaders = refreshedAuthHeaders;
        result = await appFetchJson<TrainerResponsePayload>(requestUrl, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...resolvedAuthHeaders,
            ...(init.headers ?? {}),
          },
          timeoutMs: requestTimeoutForPath(path),
          retries: 0,
        });
      }
    }

    if (!result.ok) {
      if (result.status === null) {
        lastNetworkError = result;
        continue;
      }

      const payload = (result.data ?? {}) as TrainerResponsePayload;
      const diagnostics = buildRequestDiagnostics(
        path,
        init,
        resolvedAuthHeaders,
        payload.error || result.message || result.code,
        result.status
      );
      const statusMessage =
        result.status === 401
          ? `Trainer auth expired or missing for ${path}. Sign in again or reload the control plane.`
          : result.status === 403
            ? `Trainer access denied for ${path}. Verify founder/admin permissions.`
            : payload.error || result.message || `Trainer API request failed: ${result.status}`;
      if (result.status === 401 || result.status === 403) {
        openTrainerAuthCircuit(resolvedAuthHeaders, result.status, statusMessage);
      }
      throw new TrainerApiError(statusMessage, result.status, { ...payload, diagnostics });
    }

    clearTrainerAuthCircuit(resolvedAuthHeaders);
    return result.data as T;
  }

  const diagnostics = buildRequestDiagnostics(
    path,
    init,
    resolvedAuthHeaders,
    lastNetworkError && typeof lastNetworkError === "object" && "ok" in lastNetworkError
      ? (lastNetworkError as Extract<AppFetchResult<TrainerResponsePayload>, { ok: false }>).message
      : lastNetworkError ?? "network_error"
  );
  throw new TrainerApiError(buildNetworkErrorMessage(diagnostics), 0, {
    error:
      lastNetworkError && typeof lastNetworkError === "object" && "ok" in lastNetworkError
        ? (lastNetworkError as Extract<AppFetchResult<TrainerResponsePayload>, { ok: false }>).code
        : diagnostics.cause ?? "network_error",
    diagnostics,
  });
}


function parseWithSchema<T>(payload: unknown, schema: z.ZodType<T>, fallbackMessage: string): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return parsed.data;
  throw new Error(fallbackMessage);
}


// ─── Response parsers ─────────────────────────────────────────────────────────


export function parseTrainingRunsResponse(payload: unknown): { runs: TrainingRunSummary[] } {
  const parsed = ListTrainingRunsResponseSchema.safeParse(payload);
  if (parsed.success) return parsed.data;
  const rawRuns =
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { runs?: unknown[] }).runs)
      ? (payload as { runs: unknown[] }).runs
      : [];
  const runs = rawRuns.flatMap((run) => {
    const parsedRun = TrainingRunSummarySchema.safeParse(run);
    return parsedRun.success ? [parsedRun.data] : [];
  });
  return { runs };
}


export function parseTrainingRunResponse(payload: unknown): { run: TrainingRunDetail } {
  const parsed = TrainingRunDetailSchema.safeParse(
    payload && typeof payload === "object" && "run" in payload
      ? (payload as { run: unknown }).run
      : payload
  );
  if (parsed.success) return { run: parsed.data };
  throw new Error("Trainer API returned a malformed run response.");
}


// receipt is optional here — cancel/delete/execute endpoints may not return
// one; callers that need it should check before using.
// blocker uses the full shared TrainingRunBlockerSchema so the UI can safely
// read .runId, .status, and .createdAt.
const TrainingRunMutationResponseSchema = z.object({
  ok: z.boolean().optional(),
  run: TrainingRunDetailSchema.optional().nullable(),
  deleted: z.boolean().optional(),
  runId: z.string().optional().nullable(),
  receipt: z.object({
    code: z.string(),
    message: z.string(),
    eventId: z.string().nullable(),
    createdAt: z.string(),
  }).optional().nullable(),
  queue: z.object({
    jobStatus: z.string(),
    workerOnline: z.boolean(),
    oldestQueuedAgeMs: z.number().optional().nullable(),
  }).optional().default({ jobStatus: "unknown", workerOnline: false }),
  blocker: TrainingRunBlockerSchema.nullable().optional(),
});


export type TrainingRunMutationResponse = z.infer<typeof TrainingRunMutationResponseSchema>;


export function parseTrainingRunMutationResponse(payload: unknown): TrainingRunMutationResponse {
  const parsed = TrainingRunMutationResponseSchema.safeParse(payload);
  if (parsed.success) return parsed.data;
  throw new Error("Trainer API returned a malformed mutation response.");
}


// ─── Public API functions ─────────────────────────────────────────────────────


export async function listTrainingRuns(
  authHeaders: Record<string, string> = {}
): Promise<{ runs: TrainingRunSummary[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/runs", { method: "GET" }, authHeaders);
  return parseTrainingRunsResponse(payload);
}


export async function getTrainingRun(
  runId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ run: TrainingRunDetail }> {
  void authHeaders;
  const payload = await request<{ run: TrainingRunDetail }>(
    `/api/trainer/runs/${runId}`,
    { method: "GET" },
    authHeaders
  );
  const run = parseWithSchema(payload.run, TrainingRunDetailSchema, `Invalid run detail for ${runId}`);
  return { run };
}


/** @deprecated Use getTrainingRun instead */
export async function getTrainingRunDetail(
  runId: string,
  authHeaders: Record<string, string> = {}
): Promise<TrainingRunDetail> {
  const result = await getTrainingRun(runId, authHeaders);
  return result.run;
}


export async function listTrainingRunEvents(
  runId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ events: TrainingRunEvent[] }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/runs/${runId}/events`, {
    method: "GET",
  }, authHeaders);
  return parseWithSchema(
    payload,
    TrainingRunEventsResponseSchema,
    `Invalid training run events response for ${runId}`
  );
}


/** @deprecated Use listTrainingRunEvents instead */
export async function getTrainingRunEvents(
  runId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ events: TrainingRunEvent[] }> {
  return listTrainingRunEvents(runId, authHeaders);
}


export async function getRunBlocker(
  runId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ blocker: TrainingRunBlocker | null }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/runs/${runId}/blocker`, {
    method: "GET",
  }, authHeaders);
  return parseWithSchema(
    payload,
    z.object({ blocker: TrainingRunBlockerSchema.nullable() }),
    `Invalid run blocker response for ${runId}`
  );
}


export async function createTrainingRun(
  body: SubmitTrainingRunRequest,
  authHeaders: Record<string, string> = {}
): Promise<TrainingRunMutationResponse> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/runs", {
    method: "POST",
    body: JSON.stringify(body),
  }, authHeaders);
  return parseTrainingRunMutationResponse(payload);
}


/** @deprecated Use createTrainingRun instead */
export async function submitTrainingRun(
  body: SubmitTrainingRunRequest,
  authHeaders: Record<string, string> = {}
): Promise<TrainingRunMutationResponse> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/runs", {
    method: "POST",
    body: JSON.stringify(body),
  }, authHeaders);
  return parseTrainingRunMutationResponse(payload);
}


export async function approveTrainingRun(args: {
  runId: string;
  versionId: string;
  notes?: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}/approve`, {
    method: "POST",
    body: JSON.stringify({ versionId: args.versionId, notes: args.notes }),
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function rejectTrainingRun(args: {
  runId: string;
  versionId: string;
  notes?: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}/reject`, {
    method: "POST",
    body: JSON.stringify({ versionId: args.versionId, notes: args.notes }),
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function deployTrainingRun(args: {
  runId: string;
  versionId: string;
  storagePath?: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}/deploy`, {
    method: "POST",
    body: JSON.stringify({ versionId: args.versionId, storagePath: args.storagePath }),
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function executeTrainingRun(args: {
  runId: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}/execute`, {
    method: "POST",
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function deleteTrainingRun(args: {
  runId: string;
  mode: "delete" | "purge";
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}`, {
    method: "DELETE",
    body: JSON.stringify({ mode: args.mode }),
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function requestTrainingRunCancel(args: {
  runId: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/runs/${args.runId}/cancel-request`, {
    method: "POST",
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function retryTrainerJob(args: {
  jobId: string;
  authHeaders?: Record<string, string>;
}): Promise<TrainingRunMutationResponse> {
  const payload = await request<unknown>(`/api/trainer/jobs/${args.jobId}/retry`, {
    method: "POST",
  }, args.authHeaders ?? {});
  return parseTrainingRunMutationResponse(payload);
}


export async function updateRunStatus(
  runId: string,
  status: string,
  authHeaders: Record<string, string> = {}
): Promise<{ receipt: TrainerMutationReceipt }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/runs/${runId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, authHeaders);
  return parseWithSchema(payload, TrainerRunMutationResponseSchema, "Invalid run status update response");
}


// ─── Agents / Scenario sets ───────────────────────────────────────────────────


export async function listAgents(
  authHeaders: Record<string, string> = {}
): Promise<{ agents: AgentSummary[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/agents", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListAgentsResponseSchema, "Invalid agents list response");
}


export const listTrainerAgents = listAgents;


export async function listScenarioSets(
  authHeaders: Record<string, string> = {}
): Promise<{ scenarioSets: ScenarioSetSummary[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/scenario-sets", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListScenarioSetsResponseSchema, "Invalid scenario sets response");
}


export const listTrainerScenarioSets = listScenarioSets;


// ─── Personhood / Queue health ────────────────────────────────────────────────


export async function getPersonhoodSnapshot(
  authHeaders: Record<string, string> = {}
): Promise<{ personhood: TrainerPersonhoodSnapshot }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/personhood", { method: "GET" }, authHeaders);
  return parseWithSchema(
    payload,
    TrainerPersonhoodSnapshotResponseSchema,
    "Invalid personhood snapshot response"
  );
}


export const getTrainerPersonhoodSnapshot = getPersonhoodSnapshot;


export async function getQueueHealth(
  authHeaders: Record<string, string> = {}
): Promise<{ queueHealth: TrainerQueueHealth }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/queue-health", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, TrainerQueueHealthResponseSchema, "Invalid queue health response");
}


export const getTrainerQueueHealth = getQueueHealth;


// ─── Study sources ────────────────────────────────────────────────────────────


export async function listStudySources(
  authHeaders: Record<string, string> = {}
): Promise<{ studySources: TrainerStudySourceSummary[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/study-sources", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListTrainerStudySourcesResponseSchema, "Invalid study sources response");
}


export const listTrainerStudySources = listStudySources;


export async function getTrainerStudySourceRecommendations(
  body: SubmitTrainingRunRequest,
  authHeaders: Record<string, string> = {}
): Promise<{
  recommendations: TrainerStudySourceRecommendation[];
  retrievalQuery: string;
  sourceFiles: string[];
  degraded?: boolean;
  reason?: string;
  fallbackSource?: string;
}> {
  void authHeaders;
  const payload = await request<unknown>(
    "/api/trainer/study-sources/recommendations",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    authHeaders
  );
  const parsed = ListTrainerStudySourceRecommendationsResponseSchema.safeParse(payload);
  if (parsed.success) {
    const envelope = payload && typeof payload === "object" ? (payload as TrainerResponsePayload) : {};
    return {
      recommendations: parsed.data.recommendations,
      retrievalQuery: (parsed.data as { retrievalQuery?: string }).retrievalQuery ?? "",
      sourceFiles: parsed.data.sourceFiles,
      degraded: envelope.degraded,
      reason: envelope.reason,
      fallbackSource: envelope.fallbackSource,
    };
  }
  return { recommendations: [], retrievalQuery: "", sourceFiles: [], degraded: true, reason: "malformed_response" };
}


/** @deprecated Use getTrainerStudySourceRecommendations instead */
export async function listStudySourceRecommendations(
  authHeaders: Record<string, string> = {}
): Promise<{ recommendations: TrainerStudySourceRecommendation[] }> {
  void authHeaders;
  const payload = await request<unknown>(
    "/api/trainer/study-sources/recommendations",
    { method: "GET" },
    authHeaders
  );
  return parseWithSchema(
    payload,
    ListTrainerStudySourceRecommendationsResponseSchema,
    "Invalid study source recommendations response"
  );
}


export async function createStudySource(
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ receipt: TrainerMutationReceipt }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/study-sources", {
    method: "POST",
    body: JSON.stringify(body),
  }, authHeaders);
  return parseWithSchema(payload, TrainerRunMutationResponseSchema, "Invalid create study source response");
}


export async function deleteStudySource(
  sourceId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ receipt: TrainerMutationReceipt }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/study-sources/${sourceId}`, {
    method: "DELETE",
  }, authHeaders);
  return parseWithSchema(payload, TrainerRunMutationResponseSchema, "Invalid delete study source response");
}


// ─── Experiments ──────────────────────────────────────────────────────────────


export async function listExperiments(
  authHeaders: Record<string, string> = {}
): Promise<{ experiments: TrainerExperimentSummary[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/experiments", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListTrainerExperimentsResponseSchema, "Invalid experiments list response");
}


export const listTrainerExperiments = listExperiments;


export async function getExperimentDetail(
  experimentId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}`, {
    method: "GET",
  }, authHeaders);
  return parseWithSchema(
    payload,
    TrainerExperimentDetailResponseSchema,
    `Invalid experiment detail for ${experimentId}`
  );
}


export const getTrainerExperiment = getExperimentDetail;


export async function createExperiment(
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const validated = CreateTrainerExperimentRequestSchema.parse(body);
  const payload = await request<unknown>("/api/trainer/experiments", {
    method: "POST",
    body: JSON.stringify(validated),
  }, authHeaders);
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export const createTrainerExperiment = createExperiment;


export async function updateExperiment(
  experimentId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const validated = UpdateTrainerExperimentRequestSchema.parse(body);
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}`, {
    method: "PATCH",
    body: JSON.stringify(validated),
  }, authHeaders);
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export const updateTrainerExperiment = updateExperiment;


export async function attachExperimentSource(
  experimentId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const validated = AttachTrainerExperimentSourceRequestSchema.parse(body);
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}/sources`, {
    method: "POST",
    body: JSON.stringify(validated),
  }, authHeaders);
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export const attachTrainerExperimentSource = attachExperimentSource;


export async function createTrainerExperimentReview(
  experimentId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}/review`, {
    method: "POST",
    body: JSON.stringify(body),
  }, authHeaders);
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export async function createTrainerPolicyFlag(
  experimentId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const validated = CreateTrainerPolicyFlagRequestSchema.parse(body);
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}/flag`, {
    method: "POST",
    body: JSON.stringify(validated),
  }, authHeaders);
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export async function updateTrainerPolicyFlag(
  experimentId: string,
  flagId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt }> {
  void authHeaders;
  const validated = UpdateTrainerPolicyFlagRequestSchema.parse(body);
  const payload = await request<unknown>(
    `/api/trainer/experiments/${experimentId}/flag/${flagId}`,
    {
      method: "PATCH",
      body: JSON.stringify(validated),
    },
    authHeaders
  );
  return payload as { experiment: TrainerExperimentDetail; receipt?: TrainerMutationReceipt };
}


export async function deleteExperiment(
  experimentId: string,
  authHeaders: Record<string, string> = {}
): Promise<{ receipt: TrainerMutationReceipt }> {
  void authHeaders;
  const payload = await request<unknown>(`/api/trainer/experiments/${experimentId}`, {
    method: "DELETE",
  }, authHeaders);
  return parseWithSchema(payload, TrainerRunMutationResponseSchema, "Invalid delete experiment response");
}


// ─── Packaging candidates ─────────────────────────────────────────────────────


export async function listPackagingCandidates(
  authHeaders: Record<string, string> = {}
): Promise<{ candidates: TrainerPackagingCandidate[] }> {
  void authHeaders;
  const payload = await request<unknown>("/api/trainer/packaging-candidates", { method: "GET" }, authHeaders);
  return parseWithSchema(
    payload,
    ListTrainerPackagingCandidatesResponseSchema,
    "Invalid packaging candidates response"
  );
}


export const listTrainerPackagingCandidates = listPackagingCandidates;


export async function getPackagingCandidate(
  candidateId: string,
  authHeaders: Record<string, string> = {}
): Promise<TrainerPackagingCandidate> {
  void authHeaders;
  const payload = await request<{ candidate: TrainerPackagingCandidate }>(
    `/api/trainer/packaging-candidates/${candidateId}`,
    { method: "GET" },
    authHeaders
  );
  return parseWithSchema(
    payload.candidate,
    TrainerPackagingCandidateSchema,
    `Invalid packaging candidate for ${candidateId}`
  );
}


export async function createPackagingCandidate(
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ candidate: TrainerPackagingCandidate }> {
  void authHeaders;
  const validated = CreateTrainerPackagingCandidateRequestSchema.parse(body);
  const payload = await request<unknown>("/api/trainer/packaging-candidates", {
    method: "POST",
    body: JSON.stringify(validated),
  }, authHeaders);
  return parseWithSchema(
    payload,
    z.object({ candidate: TrainerPackagingCandidateSchema }),
    "Invalid create packaging candidate response"
  );
}


export const createTrainerPackagingCandidate = createPackagingCandidate;


export async function updatePackagingCandidate(
  candidateId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ candidate: TrainerPackagingCandidate }> {
  void authHeaders;
  const validated = UpdateTrainerPackagingCandidateRequestSchema.parse(body);
  const payload = await request<unknown>(`/api/trainer/packaging-candidates/${candidateId}`, {
    method: "PATCH",
    body: JSON.stringify(validated),
  }, authHeaders);
  return parseWithSchema(
    payload,
    z.object({ candidate: TrainerPackagingCandidateSchema }),
    "Invalid update packaging candidate response"
  );
}


export const updateTrainerPackagingCandidate = updatePackagingCandidate;


export async function uploadPackagingAttachment(
  candidateId: string,
  body: unknown,
  authHeaders: Record<string, string> = {}
): Promise<{ candidate: TrainerPackagingCandidate }> {
  void authHeaders;
  const validated = UploadTrainerPackagingAttachmentRequestSchema.parse(body);
  const payload = await request<unknown>(`/api/trainer/packaging-candidates/${candidateId}/attachments`, {
    method: "POST",
    body: JSON.stringify(validated),
  }, authHeaders);
  return parseWithSchema(
    payload,
    z.object({ candidate: TrainerPackagingCandidateSchema }),
    "Invalid upload attachment response"
  );
}


export const uploadTrainerPackagingAttachment = uploadPackagingAttachment;

export async function listTrainerConnectors(authHeaders: Record<string, string> = {}): Promise<TrainerConnector[]> {
  const payload = await request<unknown>("/api/trainer/connectors", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListTrainerConnectorsResponseSchema, "Invalid trainer connectors response").connectors;
}

export async function listTrainerSkills(authHeaders: Record<string, string> = {}): Promise<TrainerSkill[]> {
  const payload = await request<unknown>("/api/trainer/skills", { method: "GET" }, authHeaders);
  return parseWithSchema(payload, ListTrainerSkillsResponseSchema, "Invalid trainer skills response").skills;
}

export async function listTrainerMemorySurfaces(
  authHeaders: Record<string, string> = {}
): Promise<TrainerMemorySurface[]> {
  const payload = await request<unknown>("/api/trainer/memory-surfaces", { method: "GET" }, authHeaders);
  return parseWithSchema(
    payload,
    ListTrainerMemorySurfacesResponseSchema,
    "Invalid trainer memory surfaces response"
  ).surfaces;
}

export async function getTrainerExperimentGraph(
  experimentId: string,
  authHeaders: Record<string, string> = {}
): Promise<TrainerExperimentGraph> {
  const payload = await request<unknown>(
    `/api/trainer/graphs?experimentId=${encodeURIComponent(experimentId)}`,
    { method: "GET" },
    authHeaders
  );
  return parseWithSchema(payload, TrainerExperimentGraphResponseSchema, "Invalid trainer graph response").graph;
}
