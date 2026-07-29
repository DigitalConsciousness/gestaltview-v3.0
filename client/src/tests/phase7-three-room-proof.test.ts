import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateRuntimeHandoff,
  RuntimeHandoff,
  TransitionRuntimeHandoff,
} from "@shared/handoffs/contracts";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
let currentOwnerId = OWNER_ID;
let nextHandoffNumber = 1;
const handoffs = new Map<string, RuntimeHandoff>();
const handoffIdsByIdempotencyKey = new Map<string, string>();

function now() {
  return "2026-07-29T04:00:00.000Z";
}

const prepareRuntimeHandoffMock = vi.fn(
  async (input: CreateRuntimeHandoff): Promise<RuntimeHandoff> => {
    const existingId = handoffIdsByIdempotencyKey.get(
      `${currentOwnerId}:${input.idempotencyKey}`,
    );
    if (existingId) return handoffs.get(existingId)!;

    const handoffId =
      nextHandoffNumber === 1
        ? "33333333-3333-4333-8333-333333333333"
        : "44444444-4444-4444-8444-444444444444";
    nextHandoffNumber += 1;
    const handoff: RuntimeHandoff = {
      ...input,
      handoffId,
      ownerId: currentOwnerId,
      state: "prepared",
      provenance: {
        ...input.provenance,
        createdAt: now(),
        updatedAt: now(),
      },
      receipt: null,
    };
    handoffs.set(handoffId, handoff);
    handoffIdsByIdempotencyKey.set(
      `${currentOwnerId}:${input.idempotencyKey}`,
      handoffId,
    );
    return handoff;
  },
);

const getRuntimeHandoffMock = vi.fn(
  async (handoffId: string): Promise<RuntimeHandoff> => {
    const handoff = handoffs.get(handoffId);
    if (!handoff || handoff.ownerId !== currentOwnerId) {
      throw new Error("Runtime handoff not found.");
    }
    return handoff;
  },
);

const transitionRuntimeHandoffMock = vi.fn(
  async (
    handoffId: string,
    transition: TransitionRuntimeHandoff,
  ): Promise<RuntimeHandoff> => {
    const current = await getRuntimeHandoffMock(handoffId);
    const updated = {
      ...current,
      state: transition.state,
      receipt: transition.receipt ?? current.receipt,
      provenance: { ...current.provenance, updatedAt: now() },
    } as RuntimeHandoff;
    handoffs.set(handoffId, updated);
    return updated;
  },
);

vi.mock("@/lib/runtimeHandoffClient", () => ({
  prepareRuntimeHandoff: prepareRuntimeHandoffMock,
  getRuntimeHandoff: getRuntimeHandoffMock,
  transitionRuntimeHandoff: transitionRuntimeHandoffMock,
}));

describe("Phase 7D three-room proof fixture", () => {
  beforeEach(() => {
    currentOwnerId = OWNER_ID;
    nextHandoffNumber = 1;
    handoffs.clear();
    handoffIdsByIdempotencyKey.clear();
    prepareRuntimeHandoffMock.mockClear();
    getRuntimeHandoffMock.mockClear();
    transitionRuntimeHandoffMock.mockClear();
  });

  it("preserves owner-scoped lineage through Transcriptory, Blackboard, and Creation Corner", async () => {
    const { requestTranscriptoryHandoff } = await import("@/lib/transcriptory");
    const {
      acceptBlackboardBlueprintInCreationCorner,
      acceptTranscriptoryHandoffInBlackboard,
      offerBlackboardBlueprint,
    } = await import("@/lib/blackboardRuntimeHandoffs");

    const sourceRecord = {
      id: "transcript-1",
      ownerId: OWNER_ID,
      immutableRef: "transcriptory-capture:transcript-1",
    };
    const derivativeRecord = {
      id: "transcription-1",
      sourceId: sourceRecord.id,
      immutableRef: "transcriptory-transcription:transcript-1",
    };
    const transcriptoryOffer = await requestTranscriptoryHandoff({
      capture: {
        id: sourceRecord.id,
        userId: OWNER_ID,
        title: "Harmless Phase 7 fixture",
        rawTranscript: "A harmless source sentence.",
        transcriptText: "A harmless source sentence.",
        summary: "A harmless fixture.",
        themes: ["proof"],
        linkedCaptures: [],
        sourceKind: "text",
        transcriptStatus: "ready",
        status: "ready",
        createdAt: now(),
        updatedAt: now(),
      },
      target: "blackboard_room",
    });
    const blackboardAcceptance = await acceptTranscriptoryHandoffInBlackboard({
      handoffId: transcriptoryOffer.handoffId,
      destinationCitationId: transcriptoryOffer.handoffId,
    });
    const collaborationRecord = {
      id: `blackboard-message:${transcriptoryOffer.handoffId}`,
      sourceRef: blackboardAcceptance.sourceRef,
    };
    const blueprintRecord = {
      id: "blueprint-1",
      sourceMessageId: collaborationRecord.id,
      sourceRef: "blackboard-blueprint:blueprint-1",
    };
    const creationOffer = await offerBlackboardBlueprint({
      ownerId: OWNER_ID,
      blueprint: {
        id: blueprintRecord.id,
        title: "Harmless fixture blueprint",
        summary: "A derivative summary.",
        sourceOrbIds: ["blackboard-capture-1"],
        captureCount: 1,
        tags: ["proof"],
        status: "ready",
        createdAt: now(),
        updatedAt: now(),
        outputs: {
          markdown: "# Harmless fixture",
          html: "",
          code: "",
          agentPrompt: "",
          imagePrompt: "",
          marketingCopy: "",
          shareCard: "",
          pdfHtml: "",
        },
      },
      selectedEmbodiments: ["billy"],
      originatingSourceRefs: [sourceRecord.immutableRef],
    });
    const destinationRecord = {
      id: "creation-blueprint:blueprint-1",
      sourceHandoffId: creationOffer.handoffId,
    };
    const creationAcceptance = await acceptBlackboardBlueprintInCreationCorner({
      handoffId: creationOffer.handoffId,
      blueprintId: blueprintRecord.id,
    });

    expect(transcriptoryOffer.state).toBe("offered");
    expect(blackboardAcceptance.sourceRef).toBe(sourceRecord.immutableRef);
    expect(creationOffer.payload.references).toContainEqual({
      type: "originating_source",
      ref: sourceRecord.immutableRef,
      label: "Originating source",
    });
    expect(creationAcceptance.receipt?.destinationEntityRef).toBe(
      destinationRecord.id,
    );
    expect(
      new Set([
        sourceRecord.id,
        derivativeRecord.id,
        collaborationRecord.id,
        blueprintRecord.id,
        transcriptoryOffer.handoffId,
        creationOffer.handoffId,
        destinationRecord.id,
      ]).size,
    ).toBe(7);

    const replayedTranscriptoryOffer = await requestTranscriptoryHandoff({
      capture: {
        id: sourceRecord.id,
        userId: OWNER_ID,
        title: "Harmless Phase 7 fixture",
        rawTranscript: "A harmless source sentence.",
        transcriptText: "A harmless source sentence.",
        summary: "A harmless fixture.",
        themes: ["proof"],
        linkedCaptures: [],
        sourceKind: "text",
        transcriptStatus: "ready",
        status: "ready",
        createdAt: now(),
        updatedAt: now(),
      },
      target: "blackboard_room",
    });
    const replayedCreationOffer = await offerBlackboardBlueprint({
      ownerId: OWNER_ID,
      blueprint: {
        id: blueprintRecord.id,
        title: "Harmless fixture blueprint",
        summary: "A derivative summary.",
        sourceOrbIds: ["blackboard-capture-1"],
        captureCount: 1,
        tags: ["proof"],
        status: "ready",
        createdAt: now(),
        updatedAt: now(),
        outputs: {
          markdown: "# Harmless fixture",
          html: "",
          code: "",
          agentPrompt: "",
          imagePrompt: "",
          marketingCopy: "",
          shareCard: "",
          pdfHtml: "",
        },
      },
      selectedEmbodiments: ["billy"],
      originatingSourceRefs: [sourceRecord.immutableRef],
    });
    expect(replayedTranscriptoryOffer.handoffId).toBe(
      transcriptoryOffer.handoffId,
    );
    expect(replayedCreationOffer.handoffId).toBe(creationOffer.handoffId);
    expect(handoffs).toHaveLength(2);

    currentOwnerId = OTHER_ID;
    await expect(
      getRuntimeHandoffMock(transcriptoryOffer.handoffId),
    ).rejects.toThrow("Runtime handoff not found.");
    await expect(
      getRuntimeHandoffMock(creationOffer.handoffId),
    ).rejects.toThrow("Runtime handoff not found.");
  });
});
