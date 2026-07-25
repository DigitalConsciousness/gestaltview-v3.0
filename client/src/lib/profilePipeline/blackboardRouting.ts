import {
  appendInnerWorldCapture as defaultAppendInnerWorldCapture,
  appendSavedCapture as defaultAppendSavedCapture,
  appendScaffoldQueue as defaultAppendScaffoldQueue,
  type CaptureAction,
  type CaptureOrb,
} from "@/components/Scaffold";

import {
  createArtifact,
  recordCapture,
  releaseCaptureToScaffold,
} from "./client";
import type {
  ArtifactRecord,
  CaptureEventRecord,
  ProfilePipelineStore,
  ScaffoldNodeRecord,
} from "./types";

type BlackboardPipelineMetadata = {
  captureId: string;
  artifactId?: string;
  scaffoldNodeId?: string;
  provenanceHash?: string;
};

type RouteBlackboardCaptureInput = {
  orb: CaptureOrb;
  action: CaptureAction;
  ownerUserId?: string;
  store?: ProfilePipelineStore;
  appendSavedCapture?: (orb: CaptureOrb) => unknown;
  appendInnerWorldCapture?: (orb: CaptureOrb) => unknown;
  appendScaffoldQueue?: (orb: CaptureOrb) => unknown;
};

type RouteBlackboardCaptureResult = {
  orb: CaptureOrb;
  canonicalCapture: CaptureEventRecord;
  artifact?: ArtifactRecord;
  scaffoldNode?: ScaffoldNodeRecord;
};

export async function routeBlackboardCaptureThroughPipeline(
  input: RouteBlackboardCaptureInput,
): Promise<RouteBlackboardCaptureResult> {
  const canonicalCapture = await recordCapture(
    {
      ownerUserId: input.ownerUserId,
      room: "blackboard-room",
      sourceType: sourceTypeForOrb(input.orb),
      originalText: input.orb.text,
      consentTier: input.action === "save" ? "room_local" : "cross_room_allowed",
      consentState: {
        action: input.action,
        legacyOrbId: input.orb.id,
      },
    },
    { store: input.store },
  );

  let artifact: ArtifactRecord | undefined;
  let scaffoldNode: ScaffoldNodeRecord | undefined;

  if (input.action === "send-to-dynamic-inner-world") {
    artifact = await createArtifact(
      {
        ownerUserId: input.ownerUserId,
        title: input.orb.title,
        body: input.orb.text,
        artifactType: artifactTypeForOrb(input.orb),
        sourceCaptureIds: [canonicalCapture.captureId],
        consentTier: "cross_room_allowed",
        operations: ["capture.sent_to_inner_world"],
      },
      { store: input.store },
    );
  }

  if (input.action === "send-to-external-scaffold") {
    scaffoldNode = await releaseCaptureToScaffold(
      {
        captureId: canonicalCapture.captureId,
        actorType: "user",
        title: input.orb.title,
        body: input.orb.text,
      },
      { store: input.store },
    );
  }

  const routedOrb = withPipelineMetadata(input.orb, input.action, {
    captureId: canonicalCapture.captureId,
    artifactId: artifact?.artifactId,
    scaffoldNodeId: scaffoldNode?.nodeId,
    provenanceHash: artifact?.provenance.contentHash,
  });

  if (input.action === "send-to-external-scaffold") {
    (input.appendScaffoldQueue ?? defaultAppendScaffoldQueue)(routedOrb);
  } else if (input.action === "send-to-dynamic-inner-world") {
    (input.appendInnerWorldCapture ?? defaultAppendInnerWorldCapture)(routedOrb);
  } else {
    (input.appendSavedCapture ?? defaultAppendSavedCapture)(routedOrb);
  }

  return {
    orb: routedOrb,
    canonicalCapture,
    artifact,
    scaffoldNode,
  };
}

function withPipelineMetadata(
  orb: CaptureOrb,
  action: CaptureAction,
  profilePipeline: BlackboardPipelineMetadata,
): CaptureOrb {
  return {
    ...orb,
    status: action === "send-to-external-scaffold" ? "pending" : "saved",
    metadata: {
      ...orb.metadata,
      originalAction: action,
      updatedAt: new Date().toISOString(),
      profilePipeline,
    },
  };
}

function sourceTypeForOrb(orb: CaptureOrb) {
  if (orb.source === "voice") return "voice";
  if (orb.source === "upload") return orb.attachment?.kind ?? "file";
  return "text";
}

function artifactTypeForOrb(orb: CaptureOrb): "markdown" | "html" | "code" | "json" | "image_prompt" | "file" {
  if (orb.type === "code") return "code";
  if (orb.type === "image") return "image_prompt";
  if (orb.attachment) return "file";
  return "markdown";
}
