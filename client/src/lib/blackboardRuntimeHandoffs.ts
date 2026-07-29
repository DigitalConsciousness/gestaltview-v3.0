import { RUNTIME_HANDOFF_CONTRACT_VERSION } from "@shared/handoffs/contracts";

import type { CaptureBlueprint } from "@/components/Scaffold";
import {
  getRuntimeHandoff,
  prepareRuntimeHandoff,
  transitionRuntimeHandoff,
} from "@/lib/runtimeHandoffClient";

export const BLACKBOARD_PROFILE_PROPOSALS_KEY =
  "gestaltview.blackboard.profileProposals.v1";

export type BlackboardProfileProposal = {
  proposalId: string;
  status: "proposed";
  target: "profile_memory";
  sourceRef: string;
  sourceCaptureIds: string[];
  selectedEmbodiments: string[];
  proposedMemory: string;
  createdAt: string;
};

export async function acceptTranscriptoryHandoffInBlackboard(input: {
  handoffId: string;
  destinationCitationId: string;
}): Promise<{ handoffId: string; sourceRef: string; sourceEntityId: string }> {
  const handoff = await getRuntimeHandoff(input.handoffId);
  if (
    handoff.destination.room !== "blackboard" ||
    handoff.source.room !== "transcriptory"
  ) {
    throw new Error(
      "This handoff is not an offered Transcriptory source for Blackboard.",
    );
  }

  const destinationEntityRef = `blackboard-citation:${input.destinationCitationId}`;
  if (handoff.state === "accepted") {
    if (handoff.receipt?.destinationEntityRef !== destinationEntityRef) {
      throw new Error(
        "This Transcriptory handoff is already accepted by a different Blackboard capture.",
      );
    }
  } else if (handoff.state === "offered") {
    await transitionRuntimeHandoff(input.handoffId, {
      state: "accepted",
      receipt: {
        acknowledgedAt: new Date().toISOString(),
        destinationEntityRef,
      },
    });
  } else {
    throw new Error(
      "This Transcriptory handoff is not available for Blackboard acceptance.",
    );
  }
  return {
    handoffId: input.handoffId,
    sourceRef: handoff.source.immutableRef,
    sourceEntityId: handoff.source.entityId,
  };
}

async function offerBlackboardBlueprintToRoom(input: {
  ownerId: string;
  blueprint: CaptureBlueprint;
  selectedEmbodiments: string[];
  originatingSourceRefs?: string[];
  destination: "creation_corner" | "external_scaffold";
}) {
  const requestedAction =
    input.destination === "creation_corner"
      ? "accept_blueprint_source"
      : "review_blueprint_for_scaffold";
  const sourceRef = `blackboard-blueprint:${input.blueprint.id}`;
  const originatingSourceRefs = [...new Set(input.originatingSourceRefs ?? [])];
  const prepared = await prepareRuntimeHandoff({
    contractVersion: RUNTIME_HANDOFF_CONTRACT_VERSION,
    source: {
      room: "blackboard",
      entityType: "capture_blueprint",
      entityId: input.blueprint.id,
      revision: input.blueprint.updatedAt,
      immutableRef: sourceRef,
    },
    destination: {
      room: input.destination,
      requestedAction,
    },
    payload: {
      context: {
        title: input.blueprint.title,
        captureCount: input.blueprint.captureCount,
        status: input.blueprint.status,
      },
      references: [
        {
          type: "blackboard_blueprint",
          ref: sourceRef,
          label: input.blueprint.title,
        },
        ...input.blueprint.sourceOrbIds.map((captureId) => ({
          type: "blackboard_capture",
          ref: `blackboard-capture:${captureId}`,
        })),
        ...originatingSourceRefs.map((ref) => ({
          type: "originating_source",
          ref,
          label: "Originating source",
        })),
      ],
    },
    selectedEmbodiments: input.selectedEmbodiments,
    intent: input.destination === "creation_corner" ? "synthesize" : "review",
    idempotencyKey: `blackboard:${input.blueprint.id}:${input.destination}:v1`,
    provenance: {
      actorType: "user",
      actorId: input.ownerId,
      originatingRoute: "/blackboard-room",
      consentScope: [`offer:${input.destination}`],
    },
  });

  return prepared.state === "prepared"
    ? transitionRuntimeHandoff(prepared.handoffId, { state: "offered" })
    : prepared;
}

export function offerBlackboardBlueprint(input: {
  ownerId: string;
  blueprint: CaptureBlueprint;
  selectedEmbodiments: string[];
  originatingSourceRefs?: string[];
}) {
  return offerBlackboardBlueprintToRoom({
    ...input,
    destination: "creation_corner",
  });
}

export function offerBlackboardBlueprintToScaffold(input: {
  ownerId: string;
  blueprint: CaptureBlueprint;
  selectedEmbodiments: string[];
  originatingSourceRefs?: string[];
}) {
  return offerBlackboardBlueprintToRoom({
    ...input,
    destination: "external_scaffold",
  });
}

export async function acceptBlackboardBlueprintInCreationCorner(input: {
  handoffId: string;
  blueprintId: string;
}) {
  return acceptRuntimeSourceInCreationCorner({
    handoffId: input.handoffId,
    destinationEntityRef: `creation-blueprint:${input.blueprintId}`,
    expectedSourceRoom: "blackboard",
  });
}

export async function acceptRuntimeSourceInCreationCorner(input: {
  handoffId: string;
  destinationEntityRef: string;
  expectedSourceRoom: "blackboard" | "transcriptory";
}) {
  const handoff = await getRuntimeHandoff(input.handoffId);
  if (
    handoff.destination.room !== "creation_corner" ||
    handoff.source.room !== input.expectedSourceRoom
  ) {
    throw new Error(
      "This handoff is not an offered source for Creation Corner.",
    );
  }
  if (handoff.state === "accepted") {
    if (handoff.receipt?.destinationEntityRef !== input.destinationEntityRef) {
      throw new Error(
        "This source is already accepted by a different Creation Corner record.",
      );
    }
    return handoff;
  }
  if (handoff.state !== "offered") {
    throw new Error(
      "This source is not available for Creation Corner acceptance.",
    );
  }
  return transitionRuntimeHandoff(input.handoffId, {
    state: "accepted",
    receipt: {
      acknowledgedAt: new Date().toISOString(),
      destinationEntityRef: input.destinationEntityRef,
    },
  });
}

export function buildBlackboardProfileProposal(input: {
  blueprintId: string;
  sourceCaptureIds: string[];
  selectedEmbodiments: string[];
  proposedMemory: string;
}): BlackboardProfileProposal {
  const createdAt = new Date().toISOString();
  return {
    proposalId: `blackboard-profile-proposal:${input.blueprintId}`,
    status: "proposed",
    target: "profile_memory",
    sourceRef: `blackboard-blueprint:${input.blueprintId}`,
    sourceCaptureIds: [...input.sourceCaptureIds],
    selectedEmbodiments: [...input.selectedEmbodiments],
    proposedMemory: input.proposedMemory.trim(),
    createdAt,
  };
}

export function appendBlackboardProfileProposal(
  proposal: BlackboardProfileProposal,
): BlackboardProfileProposal[] {
  if (typeof window === "undefined") return [proposal];
  let current: BlackboardProfileProposal[] = [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(BLACKBOARD_PROFILE_PROPOSALS_KEY) ?? "[]",
    ) as unknown;
    if (Array.isArray(parsed)) current = parsed as BlackboardProfileProposal[];
  } catch {
    current = [];
  }
  const next = [
    proposal,
    ...current.filter((item) => item.proposalId !== proposal.proposalId),
  ];
  window.localStorage.setItem(
    BLACKBOARD_PROFILE_PROPOSALS_KEY,
    JSON.stringify(next),
  );
  return next;
}
