import { useCallback, useMemo, useState } from "react";

import {
  requestOrchestrationExecution,
  type OrchestratorExecutionResponse,
} from "@/lib/orchestratorClient";

type CreationCornerOrchestrationInput = {
  sourceText: string;
  title?: string;
  autoSpawn?: boolean;
};

export function useCreationCornerOrchestration() {
  const [gateState, setGateState] = useState<"auto" | "approval">("auto");
  const [lastRun, setLastRun] = useState<OrchestratorExecutionResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workers = useMemo(() => lastRun?.workers ?? [], [lastRun]);

  const runOrchestration = useCallback(
    async (input: CreationCornerOrchestrationInput) => {
      setIsRunning(true);
      setError(null);

      try {
        const response = await requestOrchestrationExecution({
          trigger: "manual_synthesize",
          sourceRoom: "creation-corner",
          text: input.sourceText,
          title: input.title,
          autoSpawn: input.autoSpawn ?? gateState === "auto",
          gateState,
        });

        setLastRun(response);
        setGateState(response.spawnMode);
        return response;
      } catch (nextError) {
        const message = nextError instanceof Error ? nextError.message : "Orchestration failed.";
        setError(message);
        throw nextError;
      } finally {
        setIsRunning(false);
      }
    },
    [gateState],
  );

  return {
    gateState,
    setGateState,
    workers,
    lastRun,
    isRunning,
    error,
    runOrchestration,
  };
}
