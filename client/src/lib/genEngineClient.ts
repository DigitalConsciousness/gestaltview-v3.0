import { appFetchJson } from "@/lib/appFetch";
import {
  buildCreationCornerOutputs as buildCreationCornerOutputsLocal,
  buildGenEngineHealth as buildGenEngineHealthLocal,
  buildLearnResponse as buildLearnResponseLocal,
  buildLightningResponse as buildLightningResponseLocal,
  buildPredictionFromRequest as buildPredictionFromRequestLocal,
  createArtifact as createArtifactLocal,
  createCaptureSignal as createCaptureSignalLocal,
  exportArtifact as exportArtifactLocal,
  getDefaultConsent,
  normalizeArtifactDestination,
  normalizeArtifactType,
  normalizeConsent,
  normalizeSourceRoom,
  normalizeSynthesisStyle,
  scanAmbientCoherence as scanAmbientCoherenceLocal,
  scoreResonance as scoreResonanceLocalFallback,
} from "@shared/gen-engine/index";
import type {
  AmbientScanRequest,
  AmbientScanResponse,
  ArtifactExportFormat,
  ArtifactExportResult,
  ArtifactSynthesisRequest,
  ArtifactSynthesisResponse,
  CreationCornerDraftInput,
  CreationCornerOutputFamily,
  FusionRequest,
  FusionResponse,
  GenEngineHealth,
  GeneratedArtifact,
  LearnRequest,
  LearnResponse,
  LightningRequest,
  LightningResponse,
  PredictionRequest,
  PredictionResponse,
  ResonanceRequest,
  ResonanceResponse,
} from "@shared/gen-engine/index";

function appendWarning<T extends { warnings?: string[] }>(value: T, warning: string): T {
  return {
    ...value,
    warnings: [...(value.warnings ?? []), warning],
  };
}

async function fetchRoute<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const result = await appFetchJson<T>(path, {
    ...options,
    timeoutMs: typeof options.signal === "undefined" ? 12_000 : undefined,
    retries: 0,
  });

  return result.ok ? result.data : null;
}

export async function getGenEngineHealth(): Promise<GenEngineHealth> {
  const remote = await fetchRoute<GenEngineHealth>("/api/gen-engine/health", { method: "GET" });
  return remote ?? buildGenEngineHealthLocal();
}

export async function createCaptureSignal(input: FusionRequest): Promise<FusionResponse> {
  const remote = await fetchRoute<FusionResponse>("/api/gen-engine/fusion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (remote) {
    return remote;
  }

  return appendWarning(
    createCaptureSignalLocal({
      ...input,
      sourceRoom: normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : undefined),
      consent: normalizeConsent(input.consent),
    }),
    "Used local capture fusion fallback because the gen-engine API was unavailable.",
  );
}

export async function scoreResonance(input: ResonanceRequest): Promise<ResonanceResponse> {
  const remote = await fetchRoute<ResonanceResponse>("/api/gen-engine/resonance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (remote) {
    return remote;
  }

  return appendWarning(
    scoreResonanceLocalFallback(input),
    "Used local resonance scoring fallback because the gen-engine API was unavailable.",
  );
}

export async function createArtifact(input: ArtifactSynthesisRequest): Promise<ArtifactSynthesisResponse> {
  const remote = await fetchRoute<ArtifactSynthesisResponse>("/api/gen-engine/artifacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (remote) {
    return remote;
  }

  return appendWarning(
    createArtifactLocal({
      ...input,
      sourceRoom: normalizeSourceRoom(typeof input.sourceRoom === "string" ? input.sourceRoom : undefined),
      targetType: normalizeArtifactType(input.targetType),
      destination: normalizeArtifactDestination(input.destination),
      synthesisStyle: normalizeSynthesisStyle(input.synthesisStyle),
      consent: input.consent ? normalizeConsent(input.consent) : getDefaultConsent(),
    }),
    "Used local synthesis fallback because the gen-engine API was unavailable.",
  );
}

export async function scanAmbientCoherence(input: AmbientScanRequest): Promise<AmbientScanResponse> {
  const remote = await fetchRoute<AmbientScanResponse>("/api/gen-engine/ambient-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return remote ?? scanAmbientCoherenceLocal(input);
}

export async function learnWithGenEngine(input: LearnRequest): Promise<LearnResponse> {
  const remote = await fetchRoute<LearnResponse>("/api/gen-engine/learn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (remote) {
    return remote;
  }

  const local = buildLearnResponseLocal(input);
  return {
    ...local,
    message: `${local.message} (local fallback)`,
  };
}

export async function predictNextMove(input: PredictionRequest): Promise<PredictionResponse> {
  const remote = await fetchRoute<PredictionResponse>("/api/gen-engine/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (remote) {
    return remote;
  }

  return buildPredictionFromRequestLocal(input);
}

export async function lightUpCapture(input: LightningRequest): Promise<LightningResponse> {
  const remote = await fetchRoute<LightningResponse>("/api/gen-engine/lightning", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return remote ?? buildLightningResponseLocal(input);
}

export function exportArtifact(artifact: GeneratedArtifact, format: ArtifactExportFormat = artifact.contentFormat): ArtifactExportResult {
  return exportArtifactLocal(artifact, format);
}

export function buildCreationCornerOutputs(input: CreationCornerDraftInput): CreationCornerOutputFamily {
  return buildCreationCornerOutputsLocal(input);
}

export {
  buildGenEngineHealthLocal as buildGenEngineHealth,
  buildLearnResponseLocal as buildLearnResponse,
  buildLightningResponseLocal as buildLightningResponse,
  buildPredictionFromRequestLocal as buildPredictionFromRequest,
  createArtifactLocal as createArtifactLocalFallback,
  createCaptureSignalLocal as createCaptureSignalLocalFallback,
  exportArtifactLocal as exportArtifactLocalFallback,
  getDefaultConsent,
  normalizeArtifactDestination,
  normalizeArtifactType,
  normalizeConsent,
  normalizeSourceRoom,
  normalizeSynthesisStyle,
  scanAmbientCoherenceLocal as scanAmbientCoherenceLocalFallback,
  scoreResonanceLocalFallback,
};
