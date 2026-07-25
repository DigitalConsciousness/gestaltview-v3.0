import type { VercelRequest, VercelResponse } from "@vercel/node";

import { createArtifact, getDefaultConsent, normalizeConsent, scoreResonance } from "../../shared/gen-engine/index.js";
import {
  buildCreationCornerCodexArtifact,
  mapCreationCornerArtifactType,
  mapCreationCornerDestination,
  mapCreationCornerStyle,
  type CreationCornerLegacyArtifactType as LegacyArtifactType,
  type CreationCornerLegacyDestination as LegacyDestination,
  type CreationCornerLegacySynthesisStyle as LegacySynthesisStyle,
} from "../../shared/codex/creationCorner.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "../gen-engine/_shared.js";

type CreationCornerSynthesizeBody = {
  user_id?: string;
  text?: string;
  artifact_type?: LegacyArtifactType;
  synthesis_style?: LegacySynthesisStyle;
  destination?: LegacyDestination;
  custom_title?: string;
  consent?: {
    allow_external_image_analysis?: boolean;
    allow_external_audio_analysis?: boolean;
    allow_data_persistence?: boolean;
  };
};

function titleFromText(value: string): string {
  const firstLine = value
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine?.slice(0, 72) || "Creation Corner Artifact";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  const startedAt = Date.now();
  const body = readBody<CreationCornerSynthesizeBody>(req);
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    sendJson(res, 400, { detail: "Add source text or select a blueprint before synthesizing." });
    return;
  }

  const targetType = mapCreationCornerArtifactType(body.artifact_type);
  const synthesisStyle = mapCreationCornerStyle(body.synthesis_style);
  const destination = mapCreationCornerDestination(body.destination);
  const title = body.custom_title?.trim() || titleFromText(text);
  const consent = normalizeConsent({
    ...getDefaultConsent(),
    analyzeText: true,
    analyzeImage: Boolean(body.consent?.allow_external_image_analysis),
    analyzeAudio: Boolean(body.consent?.allow_external_audio_analysis),
    storeDerivativeSignals: Boolean(body.consent?.allow_data_persistence),
  });

  const result = createArtifact({
    sourceCaptureIds: [],
    sourceArtifactIds: [],
    targetType,
    synthesisStyle,
    destination,
    userInstructions: `Creation Corner ${body.artifact_type ?? "markdown"} synthesis.`,
    preserveExactLanguage: body.synthesis_style === "preserve_voice",
    plkMode: "light-touch",
    title,
    summary: text.slice(0, 240),
    sourceText: text,
    sourceRoom: "creation-corner",
    consent,
    tags: [
      "creation-corner",
      body.artifact_type ?? "markdown",
      body.synthesis_style ?? "preserve_voice",
      body.destination ?? "download_only",
    ],
    userId: body.user_id,
  });
  const resonance = scoreResonance({
    text: [result.artifact.title, result.artifact.content].join("\n"),
    userId: body.user_id,
    plkContext: {
      sourceRoom: "creation-corner",
      synthesisStyle,
      destination,
    },
  });
  const warnings = [...result.warnings];
  const codexArtifact = buildCreationCornerCodexArtifact({
    legacyType: body.artifact_type,
    userId: body.user_id,
    title: result.artifact.title,
    content: result.artifact.content,
    sourceText: text,
  });

  if (body.artifact_type === "image") {
    warnings.push("Image generation is not configured here yet; returned a source-linked image prompt.");
  }

  if (body.artifact_type === "audio") {
    warnings.push("Audio generation is not configured here yet; returned a source-linked audio direction prompt.");
  }

  sendJson(res, 200, {
    id: result.artifact.id,
    title: result.artifact.title,
    artifact_type: body.artifact_type ?? "markdown",
    content: result.artifact.content,
    image_prompt: body.artifact_type === "image" || body.artifact_type === "image_prompt" ? result.artifact.content : undefined,
    audio_prompt: body.artifact_type === "audio" || body.artifact_type === "audio_prompt" ? result.artifact.content : undefined,
    plk_resonance_score: Math.max(0, Math.min(1, resonance.score / 100)),
    generation_mode: "gen-engine",
    fallback_used: false,
    warnings,
    latency_ms: Date.now() - startedAt,
    provenance: result.provenance,
    codex: {
      status: "draft",
      artifact: codexArtifact,
      manifest: codexArtifact.exports,
    },
    review_required: result.reviewRequired,
  });
}
