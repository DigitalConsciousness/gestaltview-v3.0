import { createGestaltEvent } from "@shared/events/gestaltEvents";

import { gestaltEventBus } from "../events/gestaltEventBus";
import { buildProvenanceEnvelope } from "./provenance";
import type {
  ArtifactRecord,
  CaptureEventRecord,
  CreateArtifactInput,
  IdentityClaimRecord,
  ProfilePipelineStore,
  RecordCaptureInput,
  ReleaseCaptureToScaffoldInput,
  ScaffoldNodeRecord,
} from "./types";

export function createInMemoryProfilePipelineStore(): ProfilePipelineStore {
  const captures = new Map<string, CaptureEventRecord>();
  const scaffoldNodes = new Map<string, ScaffoldNodeRecord>();
  const artifacts = new Map<string, ArtifactRecord>();
  const claims = new Map<string, IdentityClaimRecord>();

  return {
    async saveCapture(capture) {
      captures.set(capture.captureId, capture);
      return capture;
    },
    async getCapture(captureId) {
      return captures.get(captureId) ?? null;
    },
    async updateCapture(captureId, patch) {
      const existing = captures.get(captureId);
      if (!existing) {
        throw new Error(`Capture not found: ${captureId}`);
      }
      if (
        patch.preservationStatus === "deleted_by_user" &&
        patch.explicitUserAction !== true
      ) {
        throw new Error("Capture deletion requires explicit user action.");
      }
      const updated = {
        ...existing,
        ...patch,
        captureId: existing.captureId,
        originalText: existing.originalText,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      captures.set(captureId, updated);
      return updated;
    },
    async listScaffoldNodes() {
      return [...scaffoldNodes.values()];
    },
    async getScaffoldNode(nodeId) {
      return scaffoldNodes.get(nodeId) ?? null;
    },
    async updateScaffoldNode(nodeId, patch) {
      const existing = scaffoldNodes.get(nodeId);
      if (!existing) {
        throw new Error(`Scaffold node not found: ${nodeId}`);
      }
      const updated = {
        ...existing,
        ...patch,
        nodeId: existing.nodeId,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      validateScaffoldNode(updated);
      scaffoldNodes.set(nodeId, updated);
      return updated;
    },
    async saveScaffoldNode(node) {
      validateScaffoldNode(node);
      scaffoldNodes.set(node.nodeId, node);
      return node;
    },
    async saveArtifact(artifact) {
      artifacts.set(artifact.artifactId, artifact);
      return artifact;
    },
    async saveIdentityClaim(claim) {
      if (
        claim.reviewState === "approved" &&
        claim.evidenceArtifactIds.length === 0 &&
        claim.evidenceScaffoldNodeIds.length === 0
      ) {
        throw new Error("Identity claims require evidence before approval.");
      }
      claims.set(claim.claimId, claim);
      return claim;
    },
    publishEvent(event) {
      gestaltEventBus.publish(event);
    },
  };
}

const defaultStore = createInMemoryProfilePipelineStore();

export async function recordCapture(
  input: RecordCaptureInput,
  options: { store?: ProfilePipelineStore } = {},
): Promise<CaptureEventRecord> {
  const store = options.store ?? defaultStore;
  const now = new Date().toISOString();
  const capture: CaptureEventRecord = {
    captureId: createId("capture"),
    ownerUserId: input.ownerUserId,
    room: input.room,
    sourceType: input.sourceType,
    originalText: input.originalText,
    preservationStatus: "private",
    consentState: {
      tier: input.consentTier ?? "private_default",
      ...(input.consentState ?? {}),
    },
    createdAt: now,
    updatedAt: now,
  };

  const saved = await store.saveCapture(capture);
  store.publishEvent?.(
    createGestaltEvent({
      eventType: "capture.created",
      actorType: "user",
      ownerUserId: input.ownerUserId,
      subjectType: "capture_event",
      subjectId: saved.captureId,
      room: input.room,
      consentState: saved.consentState,
    }),
  );
  return saved;
}

export async function releaseCaptureToScaffold(
  input: ReleaseCaptureToScaffoldInput,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ScaffoldNodeRecord> {
  const store = options.store ?? defaultStore;
  const capture = await store.getCapture(input.captureId);
  if (!capture) {
    throw new Error(`Capture not found: ${input.captureId}`);
  }

  await store.updateCapture(capture.captureId, {
    preservationStatus: "released",
    explicitUserAction: input.actorType === "user",
  });

  const now = new Date().toISOString();
  const node: ScaffoldNodeRecord = {
    nodeId: createId("scaffold"),
    ownerUserId: capture.ownerUserId,
    sourceCaptureIds: [capture.captureId],
    sourceArtifactIds: [],
    title: input.title ?? "Released capture",
    body: input.body ?? capture.originalText,
    reviewState: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const saved = await store.saveScaffoldNode(node);
  store.publishEvent?.(
    createGestaltEvent({
      eventType: "scaffold.pending_created",
      actorType: input.actorType,
      ownerUserId: capture.ownerUserId,
      subjectType: "scaffold_node",
      subjectId: saved.nodeId,
      room: "external-scaffold",
      consentState: capture.consentState,
    }),
  );
  return saved;
}

export async function approveScaffoldNode(
  nodeId: string,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ScaffoldNodeRecord> {
  return setScaffoldReviewState(nodeId, "approved", options);
}

export async function denyScaffoldNode(
  nodeId: string,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ScaffoldNodeRecord> {
  return setScaffoldReviewState(nodeId, "denied", options);
}

export async function releaseScaffoldNode(
  nodeId: string,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ScaffoldNodeRecord> {
  return setScaffoldReviewState(nodeId, "released", options);
}

export async function restoreDormantNode(
  nodeId: string,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ScaffoldNodeRecord> {
  return setScaffoldReviewState(nodeId, "pending", options);
}

export async function createIdentityClaim(
  input: {
    ownerUserId?: string;
    claimText: string;
    evidenceArtifactIds?: string[];
    evidenceScaffoldNodeIds?: string[];
    reviewState?: IdentityClaimRecord["reviewState"];
  },
  options: { store?: ProfilePipelineStore } = {},
): Promise<IdentityClaimRecord> {
  const store = options.store ?? defaultStore;
  const now = new Date().toISOString();
  return store.saveIdentityClaim({
    claimId: createId("claim"),
    ownerUserId: input.ownerUserId,
    claimText: input.claimText,
    evidenceArtifactIds: input.evidenceArtifactIds ?? [],
    evidenceScaffoldNodeIds: input.evidenceScaffoldNodeIds ?? [],
    reviewState: input.reviewState ?? "proposed",
    createdAt: now,
    updatedAt: now,
  });
}

export async function linkPipelineObjects(input: {
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationship: string;
}): Promise<typeof input> {
  return input;
}

export async function createArtifact(
  input: CreateArtifactInput,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ArtifactRecord> {
  const store = options.store ?? defaultStore;
  const now = new Date().toISOString();
  const artifactId = createId("artifact");
  const provenance = await buildProvenanceEnvelope({
    subjectType: "artifact",
    subjectId: artifactId,
    content: {
      title: input.title,
      body: input.body,
      artifactType: input.artifactType,
    },
    artifactInput: input,
  });

  const artifact: ArtifactRecord = {
    artifactId,
    ownerUserId: input.ownerUserId,
    title: input.title,
    body: input.body,
    artifactType: input.artifactType,
    sourceCaptureIds: input.sourceCaptureIds ?? [],
    sourceScaffoldNodeIds: input.sourceScaffoldNodeIds ?? [],
    provenance,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await store.saveArtifact(artifact);
  store.publishEvent?.(
    createGestaltEvent({
      eventType: "artifact.created",
      actorType: "system",
      ownerUserId: input.ownerUserId,
      subjectType: "artifact",
      subjectId: saved.artifactId,
      consentState: provenance.consentState,
      provenance,
    }),
  );
  return saved;
}

function createId(prefix: string): string {
  const random =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}

async function setScaffoldReviewState(
  nodeId: string,
  reviewState: ScaffoldNodeRecord["reviewState"],
  options: { store?: ProfilePipelineStore },
): Promise<ScaffoldNodeRecord> {
  const store = options.store ?? defaultStore;
  if (!store.updateScaffoldNode) {
    throw new Error("Profile pipeline store does not support scaffold updates.");
  }
  return store.updateScaffoldNode(nodeId, { reviewState });
}

function validateScaffoldNode(node: ScaffoldNodeRecord): void {
  const metadata = node as ScaffoldNodeRecord & { metadata?: Record<string, unknown> };
  const kind = String(metadata.metadata?.kind ?? metadata.metadata?.persona ?? "").toLowerCase();
  if (kind === "billy" || /^billy$/i.test(node.title.trim())) {
    throw new Error("Billy cannot be represented as a scaffold node.");
  }
}

export async function sendCaptureToInnerWorld(
  captureId: string,
  options: { store?: ProfilePipelineStore } = {},
): Promise<ArtifactRecord> {
  const store = options.store ?? defaultStore;
  const capture = await store.getCapture(captureId);
  if (!capture) {
    throw new Error(`Capture not found: ${captureId}`);
  }
  return createArtifact(
    {
      ownerUserId: capture.ownerUserId,
      title: "Inner World artifact",
      body: capture.originalText,
      artifactType: "markdown",
      sourceCaptureIds: [capture.captureId],
      consentState: capture.consentState,
      operations: ["capture.sent_to_inner_world"],
    },
    { store },
  );
}

export { releaseCaptureToScaffold as sendCaptureToExternalScaffold };
