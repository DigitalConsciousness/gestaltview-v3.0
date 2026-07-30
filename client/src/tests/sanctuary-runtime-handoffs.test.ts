import { beforeEach, describe, expect, it, vi } from "vitest";

const getRuntimeHandoffMock = vi.fn();
const transitionRuntimeHandoffMock = vi.fn();

vi.mock("@/lib/runtimeHandoffClient", () => ({
  getRuntimeHandoff: getRuntimeHandoffMock,
  transitionRuntimeHandoff: transitionRuntimeHandoffMock,
}));

describe("Sanctuary runtime handoffs", () => {
  beforeEach(() => {
    getRuntimeHandoffMock.mockReset();
    transitionRuntimeHandoffMock.mockReset();
  });

  it("durably acknowledges an offered Transcriptory source", async () => {
    getRuntimeHandoffMock.mockResolvedValue({
      handoffId: "handoff-1",
      state: "offered",
      source: { room: "transcriptory" },
      destination: { room: "sanctuary" },
      receipt: null,
    });
    transitionRuntimeHandoffMock.mockResolvedValue({ state: "accepted" });
    const { acceptTranscriptoryHandoffInSanctuary } =
      await import("@/lib/sanctuaryRuntimeHandoffs");

    await acceptTranscriptoryHandoffInSanctuary({
      handoffId: "handoff-1",
      captureId: "capture-1",
    });

    expect(transitionRuntimeHandoffMock).toHaveBeenCalledWith(
      "handoff-1",
      expect.objectContaining({
        state: "accepted",
        receipt: expect.objectContaining({
          destinationEntityRef: "sanctuary-source:capture-1",
        }),
      }),
    );
  });

  it("rejects a handoff intended for another room", async () => {
    getRuntimeHandoffMock.mockResolvedValue({
      state: "offered",
      source: { room: "transcriptory" },
      destination: { room: "blackboard" },
    });
    const { acceptTranscriptoryHandoffInSanctuary } =
      await import("@/lib/sanctuaryRuntimeHandoffs");

    await expect(
      acceptTranscriptoryHandoffInSanctuary({
        handoffId: "handoff-1",
        captureId: "capture-1",
      }),
    ).rejects.toThrow(/not a Transcriptory handoff for Sanctuary/);
    expect(transitionRuntimeHandoffMock).not.toHaveBeenCalled();
  });
});
