import type { VercelRequest, VercelResponse } from "@vercel/node";

import { synthesizePersonalityProfile, type NormalizedSource } from "../_lib/profileIngestion.js";
import { buildProfilePortrait } from "../../shared/profilePortrait.js";
import { sendJson } from "../_lib/response.js";
import type { DynamicInnerWorldArtifact, DynamicInnerWorldResponse } from "../../shared/profileIngestion.js";
import { loadLatestPortraitForUser } from "../_lib/profilePortrait.js";

function getQueryValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function buildStarterArtifacts(profile = synthesizePersonalityProfile("dynamic-inner-world-preview", [
  {
    sourceType: "lived_experience",
    sourceId: null,
    sourceBucket: "dynamic_inner_world",
    rawText:
      "The user builds by turning journals, resumes, transcripts, music, and lived experience into artifacts that can be inspected without flattening the source language.",
    processingNotes: "Starter profile seed for empty Dynamic Inner World state.",
  },
] satisfies NormalizedSource[])): DynamicInnerWorldArtifact[] {
  const now = new Date().toISOString();

  return profile.dimensions.map((dimension) => ({
    id: `profile-${dimension.dimensionKey}`,
    type: "personality",
    title: dimension.dimensionLabel,
    summary: dimension.dimensionValue.summary,
    content: [
      dimension.dimensionValue.summary,
      "",
      ...dimension.evidenceFragments.map((fragment) => `Evidence: ${fragment}`),
    ].join("\n"),
    metadata: {
      confidence: dimension.confidence,
      mutationClass: dimension.mutationClass,
      traits: dimension.dimensionValue.traits,
    },
    salience: dimension.salience,
    sourceId: dimension.dimensionId,
    updatedAt: now,
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const userId = getQueryValue(req.query.userId)?.trim() || "demo";
  const profile = synthesizePersonalityProfile(`diw-${userId}`, [
    {
      sourceType: "lived_experience",
      sourceId: null,
      sourceBucket: "dynamic_inner_world",
      rawText:
        "The Dynamic Inner World currently combines profile dimensions, PLK fragments, resume highlights, skills, and finished documents into one artifact exploration surface.",
      processingNotes: "Live endpoint preview seed.",
    },
  ] satisfies NormalizedSource[]);
  const artifacts = buildStarterArtifacts(profile);
  const persistedPortrait = await loadLatestPortraitForUser(userId);
  const portrait = persistedPortrait ?? buildProfilePortrait({
    userId,
    profile,
    inferenceTriggeredBy: "manual",
    inferenceRunId: `diw-${userId}`,
    evidence: {
      memoryEntries: [],
      bucketDrops: [
        {
          content:
            "The dynamic inner world preview keeps the portrait aligned with the same profile evidence that the room already renders.",
          raw_text:
            "The dynamic inner world preview keeps the portrait aligned with the same profile evidence that the room already renders.",
          created_at: new Date().toISOString(),
          intensity: 3,
          stage: "preview",
          tags: ["dynamic-inner-world", "portrait-preview"],
        },
      ],
      gravityReports: [],
      founderContext: null,
    },
  });
  const response: DynamicInnerWorldResponse = {
    artifacts,
    profile,
    portrait,
    stats: {
      totalArtifacts: artifacts.length,
      skillGrowth: 0,
      recentUpdates: artifacts.length,
      plkFragmentCount: profile.dimensions.length,
    },
    curatorPersonality: "curator",
  };

  sendJson(res, 200, {
    response,
    provider: "internal",
    timestamp: new Date().toISOString(),
  });
}
