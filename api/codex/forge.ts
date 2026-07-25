import type { VercelRequest, VercelResponse } from "@vercel/node";

import {
  CodexArtifactJsonSchema,
  CodexArtifactSchema,
  type CodexArtifact,
} from "../../shared/codex/contracts.js";
import { createManifestItem, mergeManifestItem } from "../../shared/codex/manifest.js";
import { getAllowedExportFormats } from "../../shared/codex/router.js";
import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "../gen-engine/_shared.js";
import { enqueueCodexExportJob, persistCodexArtifact, updateCodexArtifact } from "./_persistence.js";

type ForgeBody = {
  prompt?: string;
  artifact?: unknown;
  exportFormats?: unknown;
};

function parseOpenAiOutputText(response: unknown): string {
  const outputText = (response as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") {
    return outputText;
  }

  throw new Error("OpenAI response did not include output_text.");
}

export async function forgeArtifact(prompt: string): Promise<CodexArtifact> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when forging from a prompt.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CODEX_FORGE_MODEL || "gpt-4o",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "codex_artifact",
          schema: CodexArtifactJsonSchema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI forge failed: ${response.status} ${await response.text()}`);
  }

  return CodexArtifactSchema.parse(JSON.parse(parseOpenAiOutputText(await response.json())));
}

async function acceptArtifact(artifact: CodexArtifact, requestedFormats: unknown): Promise<{
  artifact: CodexArtifact;
  jobs: Array<{ id: string; artifactId: string; format: string; status: string }>;
}> {
  const allowedFormats = getAllowedExportFormats(artifact.kind);
  const requested = Array.isArray(requestedFormats)
    ? requestedFormats.filter((format): format is typeof allowedFormats[number] => allowedFormats.includes(format as never))
    : allowedFormats;
  const formats = requested.length > 0 ? requested : allowedFormats;
  const withPendingManifest = formats.reduce(
    (draft, format) => mergeManifestItem(draft, createManifestItem(format)),
    artifact,
  );

  await persistCodexArtifact(withPendingManifest, "draft");
  const jobs = [];

  for (const format of formats) {
    jobs.push(await enqueueCodexExportJob(withPendingManifest.id, format));
  }

  await updateCodexArtifact(withPendingManifest, "draft");
  return {
    artifact: withPendingManifest,
    jobs: jobs.map((job) => ({
      id: job.id,
      artifactId: job.artifactId,
      format: job.format,
      status: job.status,
    })),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (prepareJsonRoute(req, res, ["POST"])) {
    return;
  }

  try {
    const body = readBody<ForgeBody>(req);
    const artifact = body.artifact
      ? CodexArtifactSchema.parse(body.artifact)
      : await forgeArtifact(String(body.prompt ?? ""));
    const accepted = await acceptArtifact(artifact, body.exportFormats);

    sendJson(res, 202, {
      status: "accepted",
      artifact: accepted.artifact,
      jobs: accepted.jobs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Artifact contract validation failed.";
    const isContractError = message.includes("Invalid") || message.includes("validation") || message.includes("uuid");
    sendJson(res, isContractError ? 422 : 500, {
      error: isContractError ? "artifact_contract_invalid" : "codex_forge_failed",
      detail: message,
    });
  }
}
