import { describe, expect, it, vi } from "vitest";

import {
  buildDynamicInnerWorldResonanceLinks,
  enrichBlackboardCaptureWithResonance,
} from "@/lib/genEngineRoomWiring";
import type { CaptureOrb } from "@/components/Scaffold";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

function capture(overrides: Partial<CaptureOrb> = {}): CaptureOrb {
  return {
    id: "orb-1",
    label: "Capture",
    title: "Capture",
    text: "A source thread about resonance and artifact memory.",
    source: "typed",
    type: "context",
    tags: ["resonance", "artifact"],
    resonance: 80,
    color: "#12d6ff",
    createdAt: "2026-05-26T00:00:00.000Z",
    status: "saved",
    metadata: {
      createdAt: "2026-05-26T00:00:00.000Z",
    },
    ...overrides,
  };
}

function artifact(overrides: Partial<InnerWorldArtifactRecord> = {}): InnerWorldArtifactRecord {
  return {
    id: "artifact-1",
    userId: "user-1",
    title: "Artifact",
    summary: "A related artifact about memory resonance.",
    sourceFileId: null,
    html: "<p>A related artifact about memory resonance.</p>",
    createdAt: "2026-05-26T00:00:00.000Z",
    updatedAt: "2026-05-26T00:00:00.000Z",
    originRoom: "dynamic_inner_world",
    evidenceNodeIds: [],
    tags: ["memory"],
    ...overrides,
  };
}

describe("gen-engine room wiring", () => {
  it("enriches a Blackboard capture with fusion and normalized resonance metadata", async () => {
    const createCaptureSignal = vi.fn(async () => ({
      success: true,
      captureId: "orb-1",
      fusedText: "A source thread about resonance and artifact memory.",
      signals: [],
      metadata: {},
      warnings: ["local fallback"],
    }));
    const scoreResonance = vi.fn(async () => ({
      score: 84,
      metaphorsMatched: ["resonance", "memory"],
      energyBoost: 2,
      triggerPenalty: 0,
      warnings: [],
    }));

    const enriched = await enrichBlackboardCaptureWithResonance({
      capture: capture(),
      previousCaptures: [capture({ id: "orb-previous", text: "Earlier memory artifact." })],
      userId: "user-1",
      createCaptureSignal,
      scoreResonance,
    });

    expect(createCaptureSignal).toHaveBeenCalledWith(expect.objectContaining({
      captureId: "orb-1",
      sourceRoom: "blackboard-room",
      userId: "user-1",
    }));
    expect(scoreResonance).toHaveBeenCalled();
    expect(enriched.metadata.genEngine?.resonanceScore).toBe(0.84);
    expect(enriched.metadata.genEngine?.metaphorsMatched).toEqual(["resonance", "memory"]);
    expect(enriched.metadata.genEngine?.warnings).toEqual(["local fallback"]);
  });

  it("builds at most three Dynamic Inner World resonance links sorted by score", async () => {
    const scoreResonance = vi.fn(async ({ text }: { text: string }) => ({
      score: text.includes("High") ? 92 : text.includes("Medium") ? 74 : 41,
      metaphorsMatched: [],
      energyBoost: 1,
      triggerPenalty: 0,
      warnings: [],
    }));

    const links = await buildDynamicInnerWorldResonanceLinks({
      selectedArtifact: artifact({ id: "selected", title: "Selected", summary: "Selected source memory." }),
      artifacts: [
        artifact({ id: "low", title: "Low", summary: "Low adjacent note." }),
        artifact({ id: "high", title: "High", summary: "High resonance note." }),
        artifact({ id: "medium", title: "Medium", summary: "Medium resonance note." }),
        artifact({ id: "extra", title: "High extra", summary: "High extra resonance note." }),
      ],
      scoreResonance,
    });

    expect(links).toHaveLength(3);
    expect(links.map((link) => link.artifactId)).toEqual(["high", "extra", "medium"]);
    expect(links[0]?.score).toBe(0.92);
  });
});
