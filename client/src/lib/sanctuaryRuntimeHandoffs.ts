import {
  getRuntimeHandoff,
  transitionRuntimeHandoff,
} from "@/lib/runtimeHandoffClient";

export async function acceptTranscriptoryHandoffInSanctuary(input: {
  handoffId: string;
  captureId: string;
}) {
  const handoff = await getRuntimeHandoff(input.handoffId);
  if (
    handoff.source.room !== "transcriptory" ||
    handoff.destination.room !== "sanctuary"
  ) {
    throw new Error("This is not a Transcriptory handoff for Sanctuary.");
  }

  const destinationEntityRef = `sanctuary-source:${input.captureId}`;
  if (handoff.state === "accepted") {
    if (handoff.receipt?.destinationEntityRef !== destinationEntityRef) {
      throw new Error(
        "This source was accepted by a different Sanctuary record.",
      );
    }
    return handoff;
  }
  if (handoff.state !== "offered") {
    throw new Error(
      "This Transcriptory source is not available for acceptance.",
    );
  }

  return transitionRuntimeHandoff(input.handoffId, {
    state: "accepted",
    receipt: {
      acknowledgedAt: new Date().toISOString(),
      destinationEntityRef,
    },
  });
}
