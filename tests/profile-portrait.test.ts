import { describe, expect, it } from "vitest";

import { buildProfilePortrait } from "../shared/profilePortrait.js";
import type { PersonalityProfile } from "../shared/profileIngestion.js";

const profile: PersonalityProfile = {
  dimensions: [
    {
      dimensionId: "d-1",
      dimensionKey: "creative_expression",
      dimensionLabel: "Creative expression",
      dimensionValue: {
        summary: "Turns scattered notes into deliberately shaped artifacts.",
        traits: ["iterative", "artifact-driven"],
        sourceTypes: ["journal"],
      },
      evidenceFragments: ["Turns scattered notes into deliberately shaped artifacts."],
      salience: 0.82,
      mutationClass: "stable",
      confidence: 0.78,
    },
    {
      dimensionId: "d-2",
      dimensionKey: "collaboration_style",
      dimensionLabel: "Collaboration style",
      dimensionValue: {
        summary: "Needs clear context and concrete next steps.",
        traits: ["clear context", "concrete next steps"],
        sourceTypes: ["transcript"],
      },
      evidenceFragments: ["Needs clear context and concrete next steps."],
      salience: 0.74,
      mutationClass: "dynamic",
      confidence: 0.7,
    },
    {
      dimensionId: "d-3",
      dimensionKey: "resilience_pattern",
      dimensionLabel: "Resilience pattern",
      dimensionValue: {
        summary: "Keeps moving when the path is still incomplete.",
        traits: ["steady", "persistent"],
        sourceTypes: ["lived_experience"],
      },
      evidenceFragments: ["Keeps moving when the path is still incomplete."],
      salience: 0.71,
      mutationClass: "stable",
      confidence: 0.73,
    },
    {
      dimensionId: "d-4",
      dimensionKey: "learning_style",
      dimensionLabel: "Learning style",
      dimensionValue: {
        summary: "Learns by building and revisiting the material in context.",
        traits: ["building", "contextual"],
        sourceTypes: ["resume"],
      },
      evidenceFragments: ["Learns by building and revisiting the material in context."],
      salience: 0.68,
      mutationClass: "dynamic",
      confidence: 0.76,
    },
    {
      dimensionId: "d-5",
      dimensionKey: "conflict_resolution",
      dimensionLabel: "Conflict resolution",
      dimensionValue: {
        summary: "Prefers direct repair to vagueness.",
        traits: ["direct", "repair-oriented"],
        sourceTypes: ["transcript"],
      },
      evidenceFragments: ["Prefers direct repair to vagueness."],
      salience: 0.66,
      mutationClass: "dynamic",
      confidence: 0.65,
    },
    {
      dimensionId: "d-6",
      dimensionKey: "music_dna_resonance",
      dimensionLabel: "Music DNA resonance",
      dimensionValue: {
        summary: "Uses music as autobiographical memory.",
        traits: ["music-linked", "memory-linked"],
        sourceTypes: ["music_dna"],
      },
      evidenceFragments: ["Uses music as autobiographical memory."],
      salience: 0.63,
      mutationClass: "dynamic",
      confidence: 0.79,
    },
  ],
  keyThemes: ["creative work", "clear context"],
  unresolvedTensions: ["More long-form evidence would sharpen the portrait."],
  coreNarrative: "A builder who keeps the evidence close.",
};

describe("buildProfilePortrait", () => {
  it("builds a 10-dimension portrait with a stable run id", () => {
    const portrait = buildProfilePortrait({
      userId: "22222222-2222-4222-8222-222222222222",
      profile,
      evidence: {
        memoryEntries: [
          {
            title: "Draft one",
            summary: "Turns scraps into structured notes.",
            content: "Turns scraps into structured notes.",
            kind: "memory",
            created_at: "2026-06-01T00:00:00.000Z",
          },
        ],
        bucketDrops: [
          {
            content: "Keep the source language close.",
            raw_text: "Keep the source language close.",
            created_at: "2026-06-02T00:00:00.000Z",
            intensity: 6,
            stage: "saved",
          },
        ],
        gravityReports: [
          {
            source_title: "Signal note",
            confidence: 0.81,
            created_at: "2026-06-03T00:00:00.000Z",
          },
        ],
        founderContext: {
          current_state: "composing",
          session_thread: "Keep the thread intact.",
          plk_snapshot: { voice: "direct" },
          created_at: "2026-06-01T00:00:00.000Z",
          updated_at: "2026-06-03T00:00:00.000Z",
        },
      },
    });

    expect(portrait.dimensions).toHaveLength(10);
    expect(portrait.portraitTitle).toMatch(/Portrait|Architect|Thread|Keeper/);
    expect(portrait.inferenceRunId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(portrait.totalSourceRecords).toBeGreaterThan(0);
    expect(portrait.overallConfidence).toBeGreaterThan(0);
  });
});

