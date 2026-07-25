export const GESTALT_EVENT_TYPES = [
  "capture.created",
  "capture.sent_to_inner_world",
  "capture.sent_to_scaffold",
  "artifact.created",
  "artifact.sent_to_creation_corner",
  "scaffold.pending_created",
  "scaffold.approved",
  "scaffold.denied",
  "scaffold.dormancy_requested",
  "scaffold.released",
  "identity_claim.proposed",
  "identity_claim.approved",
  "identity_claim.rejected",
  "embodiment.compile_requested",
  "embodiment.compile_completed",
  "model_home.resonance_detected",
  "model_home.routing_selected",
  "trainer.package_gate_failed",
  "trainer.package_gate_passed",
] as const;

export type GestaltEventType = (typeof GESTALT_EVENT_TYPES)[number];

export type GestaltEventActorType =
  | "user"
  | "billy"
  | "system"
  | "trainer"
  | "migration";

export type GestaltEvent = {
  eventId: string;
  eventType: GestaltEventType;
  actorType: GestaltEventActorType;
  ownerUserId?: string;
  subjectType: string;
  subjectId: string;
  room?: string;
  pipelineRunId?: string;
  consentState?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  createdAt: string;
};

export function createGestaltEvent(
  input: Omit<GestaltEvent, "eventId" | "createdAt"> & {
    eventId?: string;
    createdAt?: string;
  },
): GestaltEvent {
  return {
    ...input,
    eventId: input.eventId ?? cryptoRandomId("evt"),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

function cryptoRandomId(prefix: string): string {
  const random =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${random}`;
}
