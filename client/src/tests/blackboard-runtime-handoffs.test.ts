import { beforeEach, describe, expect, it, vi } from "vitest";

const getRuntimeHandoffMock = vi.fn();
const prepareRuntimeHandoffMock = vi.fn();
const transitionRuntimeHandoffMock = vi.fn();

vi.mock("@/lib/runtimeHandoffClient", () => ({
  getRuntimeHandoff: getRuntimeHandoffMock,
  prepareRuntimeHandoff: prepareRuntimeHandoffMock,
  transitionRuntimeHandoff: transitionRuntimeHandoffMock,
}));

describe("Blackboard runtime handoff adapters", () => {
  beforeEach(() => {
    getRuntimeHandoffMock.mockReset();
    prepareRuntimeHandoffMock.mockReset();
    transitionRuntimeHandoffMock.mockReset();
  });

  it("accepts an offered Transcriptory source with a durable Blackboard citation", async () => {
    getRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-1",
      state: "offered",
      destination: { room: "blackboard" },
      source: {
        room: "transcriptory",
        entityId: "transcript-1",
        immutableRef: "transcriptory-capture:transcript-1",
      },
    });
    transitionRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-1",
      state: "accepted",
    });

    const { acceptTranscriptoryHandoffInBlackboard } =
      await import("@/lib/blackboardRuntimeHandoffs");
    const accepted = await acceptTranscriptoryHandoffInBlackboard({
      handoffId: "handoff-1",
      destinationCitationId: "handoff-1",
    });

    expect(transitionRuntimeHandoffMock).toHaveBeenCalledWith("handoff-1", {
      state: "accepted",
      receipt: {
        acknowledgedAt: expect.any(String),
        destinationEntityRef: "blackboard-citation:handoff-1",
      },
    });
    expect(accepted.sourceRef).toBe("transcriptory-capture:transcript-1");
  });

  it("reopens an already accepted Transcriptory handoff without a duplicate transition", async () => {
    getRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-1",
      state: "accepted",
      destination: { room: "blackboard" },
      source: {
        room: "transcriptory",
        entityId: "transcript-1",
        immutableRef: "transcriptory-capture:transcript-1",
      },
      receipt: {
        acknowledgedAt: "2026-07-29T00:00:00.000Z",
        destinationEntityRef: "blackboard-citation:handoff-1",
      },
    });

    const { acceptTranscriptoryHandoffInBlackboard } =
      await import("@/lib/blackboardRuntimeHandoffs");
    const accepted = await acceptTranscriptoryHandoffInBlackboard({
      handoffId: "handoff-1",
      destinationCitationId: "handoff-1",
    });

    expect(accepted.sourceEntityId).toBe("transcript-1");
    expect(transitionRuntimeHandoffMock).not.toHaveBeenCalled();
  });

  it("offers a Blackboard blueprint to Creation Corner without copying its body", async () => {
    prepareRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-2",
      state: "prepared",
    });
    transitionRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-2",
      state: "offered",
    });

    const { offerBlackboardBlueprint } =
      await import("@/lib/blackboardRuntimeHandoffs");
    const offered = await offerBlackboardBlueprint({
      ownerId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
      blueprint: {
        id: "blueprint-1",
        title: "Session blueprint",
        summary: "Private blueprint body",
        sourceOrbIds: ["capture-a"],
        captureCount: 1,
        tags: ["blackboard-room"],
        status: "ready",
        createdAt: "2026-07-29T00:00:00.000Z",
        updatedAt: "2026-07-29T00:00:00.000Z",
        outputs: {
          markdown: "Private blueprint body",
          html: "<p>Private blueprint body</p>",
          code: "",
          agentPrompt: "",
          imagePrompt: "",
          marketingCopy: "",
          shareCard: "",
          pdfHtml: "",
        },
      },
      selectedEmbodiments: ["billy", "the-architect"],
    });

    const input = prepareRuntimeHandoffMock.mock.calls[0][0];
    expect(input).toMatchObject({
      source: {
        room: "blackboard",
        entityType: "capture_blueprint",
        entityId: "blueprint-1",
        immutableRef: "blackboard-blueprint:blueprint-1",
      },
      destination: {
        room: "creation_corner",
        requestedAction: "accept_blueprint_source",
      },
      selectedEmbodiments: ["billy", "the-architect"],
      idempotencyKey: "blackboard:blueprint-1:creation_corner:v1",
    });
    expect(JSON.stringify(input)).not.toContain("Private blueprint body");
    expect(offered.state).toBe("offered");
  });

  it("requires an explicit durable offer before a blueprint enters External Scaffold", async () => {
    prepareRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-scaffold",
      state: "prepared",
    });
    transitionRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-scaffold",
      state: "offered",
    });
    const { offerBlackboardBlueprintToScaffold } =
      await import("@/lib/blackboardRuntimeHandoffs");
    await offerBlackboardBlueprintToScaffold({
      ownerId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
      blueprint: {
        id: "blueprint-1",
        title: "Session blueprint",
        summary: "Private blueprint body",
        sourceOrbIds: ["capture-a"],
        captureCount: 1,
        tags: ["blackboard-room"],
        status: "ready",
        createdAt: "2026-07-29T00:00:00.000Z",
        updatedAt: "2026-07-29T00:00:00.000Z",
        outputs: {
          markdown: "Private blueprint body",
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
    });

    expect(prepareRuntimeHandoffMock).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: {
          room: "external_scaffold",
          requestedAction: "review_blueprint_for_scaffold",
        },
      }),
    );
    expect(transitionRuntimeHandoffMock).toHaveBeenCalledWith(
      "handoff-scaffold",
      { state: "offered" },
    );
  });

  it("records Creation Corner acceptance against the offered Blackboard blueprint", async () => {
    getRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-2",
      state: "offered",
      destination: { room: "creation_corner" },
      source: {
        room: "blackboard",
        entityId: "blueprint-1",
        immutableRef: "blackboard-blueprint:blueprint-1",
      },
    });
    transitionRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-2",
      state: "accepted",
    });
    const { acceptRuntimeSourceInCreationCorner } =
      await import("@/lib/blackboardRuntimeHandoffs");
    await acceptRuntimeSourceInCreationCorner({
      handoffId: "handoff-2",
      destinationEntityRef: "creation-blueprint:blueprint-1",
      expectedSourceRoom: "blackboard",
    });

    expect(transitionRuntimeHandoffMock).toHaveBeenCalledWith("handoff-2", {
      state: "accepted",
      receipt: {
        acknowledgedAt: expect.any(String),
        destinationEntityRef: "creation-blueprint:blueprint-1",
      },
    });
  });

  it("builds a reviewable profile proposal instead of mutating profile state", async () => {
    const { buildBlackboardProfileProposal } =
      await import("@/lib/blackboardRuntimeHandoffs");
    const proposal = buildBlackboardProfileProposal({
      blueprintId: "blueprint-1",
      sourceCaptureIds: ["capture-a"],
      selectedEmbodiments: ["billy"],
      proposedMemory: "The user prefers visible provenance.",
    });

    expect(proposal).toMatchObject({
      status: "proposed",
      target: "profile_memory",
      sourceRef: "blackboard-blueprint:blueprint-1",
      sourceCaptureIds: ["capture-a"],
      selectedEmbodiments: ["billy"],
    });
    expect(proposal).not.toHaveProperty("approvedAt");
  });
});
