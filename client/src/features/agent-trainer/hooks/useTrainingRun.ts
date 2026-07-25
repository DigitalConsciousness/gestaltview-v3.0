import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import type {
  AgentSummary,
  ScenarioSetSummary,
  SubmitTrainingRunRequest,
  TrainerMutationReceipt,
  TrainerPersonhoodSnapshot,
  TrainerQueueHealth,
  TrainerStudySourceRecommendation,
  TrainingRunBlocker,
  TrainingRunDetail,
  TrainingRunEvent,
  TrainingRunSummary,
  TrainerStudySourceSummary,
} from "@shared/agent-trainer/schemas";

import {
  buildLocalStudySourceRecommendations,
  buildManualStudySourceSummaries,
  type ManualStudySource,
} from "../lib/manualStudyPacket";

import {
  approveTrainingRun,
  createTrainingRun,
  deleteTrainingRun,
  deployTrainingRun,
  executeTrainingRun,
  extractTrainerRequestDiagnostics,
  getTrainerPersonhoodSnapshot,
  getTrainerQueueHealth,
  getTrainingRun,
  listTrainerAgents,
  listTrainerScenarioSets,
  listTrainingRunEvents,
  listTrainingRuns,
  parseTrainingRunMutationResponse,
  rejectTrainingRun,
  requestTrainingRunCancel,
  retryTrainerJob,
  TrainerApiError,
  type TrainerRequestDiagnostics,
} from "../lib/trainerApi";

interface UseTrainingRunOptions {
  authHeaders: Record<string, string>;
  enabled: boolean;
  manualStudySources: ManualStudySource[];
}

// Blocker shape as returned by TrainingRunMutationResponse — intentionally
// looser than TrainingRunBlocker so we don't drop valid server payloads.
type MutationBlocker = { reason: string; detail?: string } | null;
export type TrainerRuntimeState =
  | "healthy"
  | "degraded_recommendations_only"
  | "degraded_backend_timeout"
  | "saved_locally_pending_sync"
  | "auth_unavailable_but_fail_open";

const POLLABLE_STATUSES = new Set(["queued", "running", "awaiting_review"]);
type TrainingRunListItem = TrainingRunSummary | TrainingRunDetail;

let lastGoodRecommendationResponse: {
  recommendations: TrainerStudySourceRecommendation[];
  retrievalQuery: string;
  sourceFiles: string[];
} | null = null;

function dedupeRuns<T extends { runId: string; createdAt: string }>(runs: readonly T[]): T[] {
  const byId = new Map<string, T>();

  for (const run of runs) {
    if (!run?.runId) {
      continue;
    }

    byId.set(run.runId, run);
  }

  return Array.from(byId.values()).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function upsertRun(previous: readonly TrainingRunListItem[], nextRun: TrainingRunDetail): TrainingRunListItem[] {
  if (!nextRun?.runId) {
    return dedupeRuns(previous);
  }

  const remaining = previous.filter((run) => run?.runId && run.runId !== nextRun.runId);
  return dedupeRuns([nextRun, ...remaining]);
}

function removeRun(previous: readonly TrainingRunListItem[], runId: string): TrainingRunListItem[] {
  return dedupeRuns(previous.filter((run) => run.runId !== runId));
}

function pickNextRunId(previousRunId: string | null, runs: readonly TrainingRunListItem[]) {
  if (runs.length === 0) {
    return null;
  }

  if (!previousRunId) {
    return runs[0]?.runId ?? null;
  }

  return runs.find((run) => run.runId === previousRunId)?.runId ?? runs[0]?.runId ?? null;
}

export function useTrainingRun(options: UseTrainingRunOptions) {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [scenarioSets, setScenarioSets] = useState<ScenarioSetSummary[]>([]);
  const [studySources, setStudySources] = useState<TrainerStudySourceSummary[]>([]);
  const [studyRecommendations, setStudyRecommendations] = useState<TrainerStudySourceRecommendation[]>(
    []
  );
  const [recommendationQuery, setRecommendationQuery] = useState("");
  const [personhood, setPersonhood] = useState<TrainerPersonhoodSnapshot | null>(null);
  const [queueHealth, setQueueHealth] = useState<TrainerQueueHealth | null>(null);
  const [runs, setRuns] = useState<TrainingRunListItem[]>([]);
  const [currentRun, setCurrentRunState] = useState<TrainingRunDetail | null>(null);
  const [runEvents, setRunEvents] = useState<TrainingRunEvent[]>([]);
  const [lastReceipt, setLastReceipt] = useState<TrainerMutationReceipt | null>(null);
  const [submitBlocker, setSubmitBlocker] = useState<MutationBlocker>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<TrainerRequestDiagnostics | null>(null);
  const [runtimeState, setRuntimeState] = useState<TrainerRuntimeState>("healthy");
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const applyErrorState = useEffectEvent((caughtError: unknown, fallbackMessage: string): string => {
    const message = caughtError instanceof Error ? caughtError.message : fallbackMessage;
    const nextDiagnostic =
      caughtError instanceof TrainerApiError
        ? extractTrainerRequestDiagnostics(caughtError.payload)
        : null;

    startTransition(() => {
      setError((current) => (current === message ? current : message));
      setDiagnostic(nextDiagnostic);
    });

    return message;
  });

  const loadQueue = useEffectEvent(async () => {
    if (!options.enabled) {
      startTransition(() => {
        setQueueHealth(null);
        setDiagnostic(null);
      });
      return null;
    }

    try {
      const response = await getTrainerQueueHealth(options.authHeaders);
      startTransition(() => {
        setQueueHealth(response.queueHealth);
        setError(null);
        setDiagnostic(null);
      });
      return response.queueHealth;
    } catch (caughtError) {
      applyErrorState(caughtError, "Failed to load trainer queue health.");
      return null;
    }
  });

  const loadRunEvents = useEffectEvent(async (runId: string | null | undefined) => {
    if (!runId || !options.enabled) {
      startTransition(() => {
        setRunEvents([]);
      });
      return [];
    }

    try {
      const response = await listTrainingRunEvents(runId, options.authHeaders);
      startTransition(() => {
        setRunEvents(response.events);
      });
      return response.events;
    } catch (caughtError) {
      applyErrorState(caughtError, "Failed to load trainer events.");
      return [];
    }
  });

  const loadRecommendations = useEffectEvent(async (payload: SubmitTrainingRunRequest) => {
    if (!options.enabled) {
      startTransition(() => {
        setStudyRecommendations([]);
        setRecommendationQuery("");
        setRecommendationsError(null);
        setRuntimeState("healthy");
      });
      return null;
    }

    const response = buildLocalStudySourceRecommendations(options.manualStudySources, payload);
    const summaries = buildManualStudySourceSummaries(options.manualStudySources);
    lastGoodRecommendationResponse = response;

    startTransition(() => {
      setStudyRecommendations(response.recommendations);
      setRecommendationQuery(response.retrievalQuery);
      setStudySources(summaries);
      setRecommendationsError(
        options.manualStudySources.length === 0
          ? "Add manual study sources to generate local recommendations."
          : null
      );
      setRuntimeState(options.manualStudySources.length === 0 ? "saved_locally_pending_sync" : "healthy");
      setDiagnostic(null);
    });

    return response;
  });

  const loadBootstrappedData = useEffectEvent(async () => {
    if (!options.enabled) {
      startTransition(() => {
        setAgents([]);
        setScenarioSets([]);
        setStudySources([]);
        setPersonhood(null);
        setQueueHealth(null);
        setRuns([]);
        setCurrentRunState(null);
        setRunEvents([]);
        setLastReceipt(null);
        setSubmitBlocker(null);
        setError(null);
        setDiagnostic(null);
      });
      return;
    }

    setIsBootstrapping(true);
    setError(null);

    try {
      const [
        agentResponse,
        scenarioResponse,
        personhoodResponse,
        runsResponse,
        queueHealthResponse,
      ] = await Promise.all([
        listTrainerAgents(options.authHeaders),
        listTrainerScenarioSets(options.authHeaders),
        getTrainerPersonhoodSnapshot(options.authHeaders).catch((caughtError) => {
          applyErrorState(caughtError, "Failed to load trainer personhood state.");
          return null;
        }),
        listTrainingRuns(options.authHeaders),
        getTrainerQueueHealth(options.authHeaders).catch((caughtError) => {
          applyErrorState(caughtError, "Failed to load trainer queue health.");
          return null;
        }),
      ]);

      let nextRuns = dedupeRuns(runsResponse.runs);
      const nextRunId = pickNextRunId(currentRun?.runId ?? null, nextRuns);
      let nextCurrentRun: TrainingRunDetail | null = null;

      if (nextRunId) {
        try {
          const detailResponse = await getTrainingRun(nextRunId, options.authHeaders);
          nextCurrentRun = detailResponse.run;
          nextRuns = upsertRun(nextRuns, detailResponse.run);
        } catch (caughtError) {
          applyErrorState(caughtError, "Failed to load selected run details.");
        }
      }

      startTransition(() => {
        setAgents(agentResponse.agents);
        setScenarioSets(scenarioResponse.scenarioSets);
        setStudySources(buildManualStudySourceSummaries(options.manualStudySources));
        setPersonhood(personhoodResponse?.personhood ?? null);
        setQueueHealth(queueHealthResponse?.queueHealth ?? null);
        setRuns(nextRuns);
        setCurrentRunState(nextCurrentRun);
        setError(null);
        setDiagnostic(null);
        setRuntimeState((current) =>
          current === "degraded_recommendations_only" || current === "degraded_backend_timeout"
            ? current
            : "healthy"
        );
      });

      await loadRunEvents(nextCurrentRun?.runId ?? null);
    } catch (caughtError) {
      applyErrorState(caughtError, "Failed to load trainer data.");
    } finally {
      setIsBootstrapping(false);
    }
  });

  const refreshRun = useEffectEvent(async (runId: string) => {
    if (!runId) {
      return;
    }

    try {
      const response = await getTrainingRun(runId, options.authHeaders);
      startTransition(() => {
        setCurrentRunState(response.run);
        setRuns((previous) => upsertRun(previous, response.run));
        setError(null);
        setDiagnostic(null);
      });

      await Promise.all([loadQueue(), loadRunEvents(runId)]);
    } catch (caughtError) {
      applyErrorState(caughtError, "Failed to refresh run.");
    }
  });

  useEffect(() => {
    void loadBootstrappedData();
  }, [loadBootstrappedData]);

  useEffect(() => {
    if (!currentRun?.runId || !POLLABLE_STATUSES.has(currentRun.status)) {
      return;
    }

    const interval = window.setInterval(() => {
      void Promise.all([refreshRun(currentRun.runId), loadQueue()]);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [currentRun, loadQueue, refreshRun]);

  useEffect(() => {
    if (!currentRun?.runId) {
      return;
    }

    void loadRunEvents(currentRun.runId);
  }, [currentRun?.runId, loadRunEvents]);

  const applyMutationState = useEffectEvent(
    async (
      response: ReturnType<typeof parseTrainingRunMutationResponse>,
      options: {
        removedRunId?: string | null;
      } = {}
    ) => {
      startTransition(() => {
        if (response.receipt) setLastReceipt(response.receipt);
        setSubmitBlocker(response.blocker ?? null);
        setRuns((previous) => {
          if (options.removedRunId) {
            const nextRuns = removeRun(previous, options.removedRunId);
            setCurrentRunState((selected) => {
              const nextRunId = pickNextRunId(
                selected?.runId === options.removedRunId ? null : selected?.runId ?? null,
                nextRuns
              );
              return nextRunId && selected?.runId === nextRunId ? selected : null;
            });
            return nextRuns;
          }

          if (response.run) {
            const nextRuns = upsertRun(previous, response.run);
            setCurrentRunState(response.run);
            return nextRuns;
          }

          return previous;
        });
      });

      await loadQueue();
      if (response.run?.runId) {
        await loadRunEvents(response.run.runId);
      } else if (options.removedRunId) {
        await loadRunEvents(null);
      }
    }
  );

  const handleMutationError = useEffectEvent(
    (caughtError: unknown, fallbackMessage: string): never => {
      if (caughtError instanceof TrainerApiError) {
        if (caughtError.status === 409) {
          try {
            const parsed = parseTrainingRunMutationResponse(caughtError.payload);
            startTransition(() => {
              if (parsed.receipt) setLastReceipt(parsed.receipt);
              setSubmitBlocker(parsed.blocker ?? null);
            });
          } catch {
            // Fall through to generic error handling.
          }
        }

        applyErrorState(caughtError, fallbackMessage);
        throw caughtError;
      }

      const message = applyErrorState(caughtError, fallbackMessage);
      throw caughtError instanceof Error ? caughtError : new Error(message);
    }
  );

  const submitRun = useEffectEvent(async (payload: SubmitTrainingRunRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createTrainingRun(payload, options.authHeaders);
      await applyMutationState(response);
      return response;
    } catch (caughtError) {
      return handleMutationError(caughtError, "Failed to submit training run.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const runMutation = useEffectEvent(
    async <T extends ReturnType<typeof parseTrainingRunMutationResponse>>(
      action: () => Promise<T>,
      fallbackMessage: string,
      options: {
        removedRunId?: string | null;
      } = {}
    ) => {
      setIsMutating(true);
      setError(null);

      try {
        const response = await action();
        await applyMutationState(response, options);
        return response;
      } catch (caughtError) {
        return handleMutationError(caughtError, fallbackMessage);
      } finally {
        setIsMutating(false);
      }
    }
  );

  const runMap = useMemo(
    () => Object.fromEntries(dedupeRuns(runs).map((run) => [run.runId, run])),
    [runs]
  );

  const setCurrentRun = useEffectEvent((run: TrainingRunListItem | TrainingRunDetail | null) => {
    if (!run?.runId) {
      setCurrentRunState(null);
      return;
    }
    void refreshRun(run.runId);
  });

  return {
    agents,
    scenarioSets,
    studySources,
    studyRecommendations,
    recommendationQuery,
    personhood,
    queueHealth,
    runs,
    runMap,
    currentRun,
    runEvents,
    lastReceipt,
    submitBlocker,
    error,
    diagnostic,
    runtimeState,
    recommendationsError,
    isBootstrapping,
    isSubmitting,
    isMutating,
    setCurrentRun,
    submitRun,
    refreshRun,
    approveRun: (runId: string, versionId: string, notes?: string) =>
      runMutation(
        async () =>
          approveTrainingRun({
            runId,
            versionId,
            notes,
            authHeaders: options.authHeaders,
          }),
        "Failed to approve run."
      ),
    rejectRun: (runId: string, versionId: string, notes?: string) =>
      runMutation(
        async () =>
          rejectTrainingRun({
            runId,
            versionId,
            notes,
            authHeaders: options.authHeaders,
          }),
        "Failed to reject run."
      ),
    deployRun: (runId: string, versionId: string, storagePath?: string) =>
      runMutation(
        async () =>
          deployTrainingRun({
            runId,
            versionId,
            storagePath,
            authHeaders: options.authHeaders,
          }),
        "Failed to deploy run."
      ),
    runNow: (runId: string) =>
      runMutation(
        async () =>
          executeTrainingRun({
            runId,
            authHeaders: options.authHeaders,
          }),
        "Failed to start queued run."
      ),
    cancelRun: (runId: string) =>
      runMutation(
        async () =>
          deleteTrainingRun({
            runId,
            mode: "delete",
            authHeaders: options.authHeaders,
          }),
        "Failed to delete run."
      ),
    requestCancelRun: (runId: string) =>
      runMutation(
        async () =>
          requestTrainingRunCancel({
            runId,
            authHeaders: options.authHeaders,
          }),
        "Failed to request run cancellation."
      ),
    purgeRun: (runId: string) =>
      runMutation(
        async () =>
          deleteTrainingRun({
            runId,
            mode: "purge",
            authHeaders: options.authHeaders,
          }),
        "Failed to purge run.",
        { removedRunId: runId }
      ),
    retryJob: (jobId: string) =>
      runMutation(
        async () =>
          retryTrainerJob({
            jobId,
            authHeaders: options.authHeaders,
          }),
        "Failed to retry trainer job."
      ),
    loadRecommendations,
    loadQueue,
    loadRunEvents,
    clearReceipt: () => setLastReceipt(null),
    reload: loadBootstrappedData,
  };
}
