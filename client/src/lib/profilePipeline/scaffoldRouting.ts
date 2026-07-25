import {
  appendApprovedOrb as defaultAppendApprovedOrb,
  removeScaffoldQueueOrb as defaultRemoveScaffoldQueueOrb,
  approveOrb,
  rejectOrb,
  type CaptureOrb,
} from "@/components/Scaffold";

import {
  approveScaffoldNode,
  denyScaffoldNode,
  releaseCaptureToScaffold,
} from "./client";
import type { ProfilePipelineStore, ScaffoldNodeRecord } from "./types";

type ScaffoldOrbPipelineInput = {
  orb: CaptureOrb;
  store?: ProfilePipelineStore;
  appendApprovedOrb?: (orb: CaptureOrb) => unknown;
  removeScaffoldQueueOrb?: (orbId: string) => unknown;
};

type ScaffoldOrbPipelineResult = {
  orb: CaptureOrb;
  scaffoldNode?: ScaffoldNodeRecord;
};

export async function approveScaffoldOrbThroughPipeline(
  input: ScaffoldOrbPipelineInput,
): Promise<ScaffoldOrbPipelineResult> {
  const scaffoldNode = await updateCanonicalNode(input.orb, input.store, "approved");
  const approved = approveOrb(input.orb);
  (input.removeScaffoldQueueOrb ?? defaultRemoveScaffoldQueueOrb)(input.orb.id);
  (input.appendApprovedOrb ?? defaultAppendApprovedOrb)(approved);
  return { orb: approved, scaffoldNode };
}

export async function denyScaffoldOrbThroughPipeline(
  input: Omit<ScaffoldOrbPipelineInput, "appendApprovedOrb">,
): Promise<ScaffoldOrbPipelineResult> {
  const scaffoldNode = await updateCanonicalNode(input.orb, input.store, "denied");
  const denied = rejectOrb(input.orb);
  (input.removeScaffoldQueueOrb ?? defaultRemoveScaffoldQueueOrb)(input.orb.id);
  return { orb: denied, scaffoldNode };
}

async function updateCanonicalNode(
  orb: CaptureOrb,
  store: ProfilePipelineStore | undefined,
  reviewState: "approved" | "denied",
): Promise<ScaffoldNodeRecord | undefined> {
  const nodeId = orb.metadata.profilePipeline?.scaffoldNodeId;
  if (!nodeId) {
    return undefined;
  }

  return reviewState === "approved"
    ? approveScaffoldNode(nodeId, { store })
    : denyScaffoldNode(nodeId, { store });
}

export { releaseCaptureToScaffold };
