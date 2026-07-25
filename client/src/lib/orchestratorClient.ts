import type {
  OrchestrationDecisionWithSkill,
  OrchestrationInput,
} from "@shared/orchestration";
import type {
  OrchestrationExtractionInput,
  OrchestrationExtractionResult,
} from "@shared/orchestration/extraction";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type OrchestratorDecisionResponse = {
  decision: OrchestrationDecisionWithSkill;
  diagnostics: {
    route: string;
    deterministic: boolean;
    triggeredOnly: boolean;
    llmCalled: boolean;
    persisted: boolean;
  };
};

export type OrchestratorExtractionResponse = {
  extraction: OrchestrationExtractionResult;
  diagnostics: {
    route: string;
    deterministic: boolean;
    llmCalled: boolean;
  };
};

export type OrchestratorPresentationGate = {
  allowed: boolean;
  reasons: string[];
  checks: {
    hasContent: boolean;
    isFullHtmlWhenHtmlProvided: boolean;
    isNotRawJson: boolean;
    isNotMetadataDump: boolean;
    repetitionRatio: number;
  };
};

export type OrchestratorExecutionResponse = {
  runId: string;
  decision: OrchestrationDecisionWithSkill;
  spawnMode: "auto" | "approval";
  status: "completed" | "failed" | "awaiting_approval";
  presentation: OrchestratorPresentationGate;
  output: Record<string, unknown>;
  workers: Array<{
    workerId: string;
    label: string;
    status: string;
    startedAt: string;
    completedAt: string;
    durationMs: number;
    summary: string;
    dependsOn: string[];
    result: Record<string, unknown>;
    error?: string;
  }>;
  diagnostics: {
    route: string;
    deterministic: boolean;
    llmCalled: boolean;
    persisted: boolean;
    presentationAllowed: boolean;
  };
};

export async function requestOrchestrationDecision(
  input: OrchestrationInput,
): Promise<OrchestratorDecisionResponse> {
  const response = await fetch(`${API_BASE}/orchestrator/decide`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Orchestrator returned ${response.status}`);
  }

  return response.json() as Promise<OrchestratorDecisionResponse>;
}

export async function requestOrchestrationExtraction(
  input: OrchestrationExtractionInput,
): Promise<OrchestratorExtractionResponse> {
  const response = await fetch(`${API_BASE}/orchestrator/extract`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Orchestrator returned ${response.status}`);
  }

  return response.json() as Promise<OrchestratorExtractionResponse>;
}

export async function requestOrchestrationExecution(
  input: OrchestrationInput & {
    autoSpawn?: boolean;
    gateState?: "auto" | "approval";
  },
): Promise<OrchestratorExecutionResponse> {
  const response = await fetch(`${API_BASE}/orchestrator/execute`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok && !payload?.presentation) {
    throw new Error(payload?.error ?? `Orchestrator returned ${response.status}`);
  }

  return payload as OrchestratorExecutionResponse;
}
