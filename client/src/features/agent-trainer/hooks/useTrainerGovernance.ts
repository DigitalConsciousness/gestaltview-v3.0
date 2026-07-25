import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

import type {
  TrainerExperimentDetail,
  TrainerExperimentSummary,
  TrainerPackagingCandidate,
} from "@shared/agent-trainer/schemas";

import {
  attachTrainerExperimentSource,
  createTrainerExperiment,
  createTrainerExperimentReview,
  createTrainerPackagingCandidate,
  createTrainerPolicyFlag,
  getTrainerExperiment,
  listTrainerExperiments,
  listTrainerPackagingCandidates,
  uploadTrainerPackagingAttachment,
  updateTrainerExperiment,
  updateTrainerPackagingCandidate,
  updateTrainerPolicyFlag,
} from "../lib/trainerApi";

interface UseTrainerGovernanceOptions {
  authHeaders: Record<string, string>;
  enabled: boolean;
}

export function useTrainerGovernance(options: UseTrainerGovernanceOptions) {
  const [experiments, setExperiments] = useState<TrainerExperimentSummary[]>([]);
  const [selectedExperiment, setSelectedExperiment] =
    useState<TrainerExperimentDetail | null>(null);
  const [packagingCandidates, setPackagingCandidates] = useState<TrainerPackagingCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const loadLists = useEffectEvent(async () => {
    if (!options.enabled) {
      startTransition(() => {
        setExperiments([]);
        setPackagingCandidates([]);
        setSelectedExperiment(null);
        setError(null);
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [experimentsResponse, packagingResponse] = await Promise.all([
        listTrainerExperiments(options.authHeaders),
        listTrainerPackagingCandidates(options.authHeaders),
      ]);

      startTransition(() => {
        setExperiments(experimentsResponse.experiments);
        setPackagingCandidates(packagingResponse.candidates);
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load trainer governance state."
      );
    } finally {
      setIsLoading(false);
    }
  });

  const loadExperiment = useEffectEvent(async (experimentId: string | null | undefined) => {
    if (!experimentId || !options.enabled) {
      startTransition(() => {
        setSelectedExperiment(null);
      });
      return null;
    }

    setError(null);

    try {
      const response = await getTrainerExperiment(experimentId, options.authHeaders);
      startTransition(() => {
        setSelectedExperiment(response.experiment);
      });
      return response.experiment;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load experiment detail."
      );
      throw caughtError;
    }
  });

  const refreshAll = useEffectEvent(async (experimentId?: string | null) => {
    await loadLists();
    const targetExperimentId = experimentId ?? selectedExperiment?.id ?? null;
    if (targetExperimentId) {
      try {
        await loadExperiment(targetExperimentId);
      } catch {
        // Surface already handled through state.
      }
    }
  });

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  const runMutation = useEffectEvent(
    async <T>(
      action: () => Promise<T>,
      options: {
        experimentId?: string | null;
        onSuccess?: (value: T) => void;
      } = {}
    ): Promise<T> => {
      setIsMutating(true);
      setError(null);

      try {
        const result = await action();
        options.onSuccess?.(result);
        await refreshAll(options.experimentId);
        return result;
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Trainer governance mutation failed."
        );
        throw caughtError;
      } finally {
        setIsMutating(false);
      }
    }
  );

  return {
    experiments,
    selectedExperiment,
    packagingCandidates,
    error,
    isLoading,
    isMutating,
    setSelectedExperiment,
    reload: refreshAll,
    loadExperiment,
    createExperiment: (payload: unknown) =>
      runMutation(
        async () => createTrainerExperiment(payload, options.authHeaders),
        {
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    updateExperiment: (experimentId: string, payload: unknown) =>
      runMutation(
        async () => updateTrainerExperiment(experimentId, payload, options.authHeaders),
        {
          experimentId,
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    attachSource: (experimentId: string, payload: unknown) =>
      runMutation(
        async () => attachTrainerExperimentSource(experimentId, payload, options.authHeaders),
        {
          experimentId,
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    createReview: (experimentId: string, payload: unknown) =>
      runMutation(
        async () => createTrainerExperimentReview(experimentId, payload, options.authHeaders),
        {
          experimentId,
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    createFlag: (experimentId: string, payload: unknown) =>
      runMutation(
        async () => createTrainerPolicyFlag(experimentId, payload, options.authHeaders),
        {
          experimentId,
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    resolveFlag: (experimentId: string, flagId: string, resolved: boolean) =>
      runMutation(
        async () =>
          updateTrainerPolicyFlag(
            experimentId,
            flagId,
            { resolved },
            options.authHeaders
          ),
        {
          experimentId,
          onSuccess: (response) => {
            startTransition(() => {
              setSelectedExperiment(response.experiment);
            });
          },
        }
      ),
    nominatePackaging: (payload: unknown) =>
      runMutation(
        async () => createTrainerPackagingCandidate(payload, options.authHeaders)
      ),
    updatePackagingCandidate: (candidateId: string, payload: unknown) =>
      runMutation(
        async () =>
          updateTrainerPackagingCandidate(candidateId, payload, options.authHeaders)
      ),
    uploadPackagingAttachment: (candidateId: string, payload: unknown) =>
      runMutation(
        async () =>
          uploadTrainerPackagingAttachment(candidateId, payload, options.authHeaders)
      ),
  };
}
