import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildWorkerPlan, decideOrchestration, type OrchestrationInput } from "../../shared/orchestration/index.js";
import { prepareJsonRoute, readBody } from "../gen-engine/_shared.js";
import { sendJson } from "../_lib/response.js";
import { insertRow } from "../_lib/supabase.js";

function trimPreview(value: string, maxLength = 220): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function buildInputSnapshot(input: OrchestrationInput): Record<string, unknown> {
  return {
    trigger: input.trigger,
    sourceRoom: input.sourceRoom,
    title: input.title ?? null,
    textExcerpt: input.text ? trimPreview(input.text) : null,
    artifactIntent: input.artifactIntent ?? null,
    energyLevel: typeof input.energyLevel === "number" ? input.energyLevel : null,
    contextClues: input.contextClues ?? [],
    sourceCaptureIds: input.sourceCaptureIds ?? [],
    sourceArtifactIds: input.sourceArtifactIds ?? [],
    hasImage: Boolean(input.hasImage),
    hasAudio: Boolean(input.hasAudio),
    hasVideo: Boolean(input.hasVideo),
    hasFile: Boolean(input.hasFile),
    consent: input.consent ?? null,
    meta: input.meta ?? null,
  };
}

async function persistDecision(
  input: OrchestrationInput,
  decision: ReturnType<typeof decideOrchestration>
): Promise<boolean> {
  try {
    return await insertRow("orchestration_decisions", {
      decision_id: decision.decisionId,
      triggered_at: decision.triggeredAt,
      user_id: input.userId ?? null,
      trigger: decision.trigger,
      source_room: decision.sourceRoom,
      detected_state: decision.detectedState,
      support_level: decision.supportLevel,
      content_kind: decision.contentKind,
      destination: decision.destination,
      artifact_target_type: decision.artifactTargetType ?? null,
      artifact_destination: decision.artifactDestination ?? null,
      synthesis_style: decision.synthesisStyle,
      processors: decision.processors,
      export_formats: decision.exportFormats,
      next_action: decision.nextAction,
      should_forge_artifact: decision.shouldForgeArtifact,
      should_persist_signal: decision.shouldPersistSignal,
      should_update_profile: decision.shouldUpdateProfile,
      should_update_scaffold: decision.shouldUpdateScaffold,
      confidence: decision.confidence,
      user_facing_summary: decision.userFacingSummary,
      markers: [
        decision.detectedState,
        decision.supportLevel,
        decision.contentKind,
        ...decision.processors,
      ],
      context_clues: input.contextClues ?? [],
      has_image: Boolean(input.hasImage),
      has_audio: Boolean(input.hasAudio),
      has_video: Boolean(input.hasVideo),
      has_file: Boolean(input.hasFile),
      input_payload: buildInputSnapshot(input),
      decision_payload: decision,
      internal_diagnostics: decision.internalDiagnostics,
    });
  } catch (error) {
    console.warn("[orchestrator] failed to persist decision", error);
    return false;
  }
}

function validateInput(body: Partial<OrchestrationInput>): OrchestrationInput {
  if (!body.trigger) {
    throw new Error("Missing required field: trigger");
  }

  if (!body.sourceRoom) {
    throw new Error("Missing required field: sourceRoom");
  }

  return {
    trigger: body.trigger,
    sourceRoom: body.sourceRoom,
    text: body.text,
    title: body.title,
    artifactIntent: body.artifactIntent,
    energyLevel: body.energyLevel,
    contextClues: Array.isArray(body.contextClues) ? body.contextClues : [],
    userId: body.userId,
    sourceCaptureIds: Array.isArray(body.sourceCaptureIds) ? body.sourceCaptureIds : [],
    sourceArtifactIds: Array.isArray(body.sourceArtifactIds) ? body.sourceArtifactIds : [],
    hasImage: Boolean(body.hasImage),
    hasAudio: Boolean(body.hasAudio),
    hasVideo: Boolean(body.hasVideo),
    hasFile: Boolean(body.hasFile),
    consent: body.consent,
    meta: body.meta,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  try {
    const body = readBody<Partial<OrchestrationInput>>(req);
    const input = validateInput(body);
    const decision = decideOrchestration(input);
    const workerPlan = buildWorkerPlan({
      sourceRoom: input.sourceRoom,
      trigger: input.trigger,
      contentKind: decision.contentKind,
      autoSpawn: true,
    });
    const persisted = await persistDecision(input, decision);

    sendJson(res, 200, {
      decision,
      workerPlan,
      diagnostics: {
        route: "/api/orchestrator/decide",
        deterministic: true,
        triggeredOnly: true,
        llmCalled: false,
        persisted,
      },
    });
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Invalid orchestration request",
    });
  }
}
