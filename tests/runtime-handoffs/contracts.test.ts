import { describe, expect, it } from "vitest";

import {
  canTransitionRuntimeHandoff,
  createRuntimeHandoffSchema,
  runtimeHandoffSchema,
  transitionRuntimeHandoffSchema,
} from "../../shared/handoffs/contracts";

const UUID = "11111111-1111-4111-8111-111111111111";

function validCreate() {
  return {
    contractVersion: "gestaltview.runtime-handoff.v1",
    source: {
      room: "blackboard",
      entityType: "capture",
      entityId: "capture-1",
      revision: "rev-1",
      immutableRef: "capture-events:11111111-1111-4111-8111-111111111111",
    },
    destination: {
      room: "creation_corner",
      requestedAction: "continue-editing",
    },
    payload: {
      context: { summary: "Minimal derivative context" },
      references: [{ type: "capture_event", ref: "capture-events:source" }],
    },
    selectedEmbodiments: ["billy"],
    intent: "continue",
    idempotencyKey: "blackboard-capture-1-rev-1-creation",
    provenance: {
      actorType: "user",
      actorId: UUID,
      originatingRoute: "/blackboard",
      consentScope: ["creation_corner:read_source"],
    },
  } as const;
}

describe("runtime handoff v1 contract", () => {
  it("strictly validates a prepared source-preserving handoff", () => {
    const input = createRuntimeHandoffSchema.parse(validCreate());
    const envelope = runtimeHandoffSchema.parse({
      ...input,
      handoffId: UUID,
      ownerId: UUID,
      state: "prepared",
      provenance: {
        ...input.provenance,
        createdAt: "2026-07-27T20:00:00.000Z",
        updatedAt: "2026-07-27T20:00:00.000Z",
      },
      receipt: null,
    });
    expect(envelope.state).toBe("prepared");
    expect(envelope.receipt).toBeNull();
  });

  it("rejects browser-supplied ownership and invalid contract versions", () => {
    expect(() =>
      createRuntimeHandoffSchema.parse({
        ...validCreate(),
        ownerId: UUID,
        contractVersion: "gestaltview.runtime-handoff.v0",
      }),
    ).toThrow();
  });

  it("does not allow prepared to masquerade as accepted or completed", () => {
    expect(canTransitionRuntimeHandoff("prepared", "accepted")).toBe(false);
    expect(canTransitionRuntimeHandoff("prepared", "completed")).toBe(false);
    expect(canTransitionRuntimeHandoff("prepared", "offered")).toBe(true);
    expect(canTransitionRuntimeHandoff("processing", "completed")).toBe(true);
    expect(canTransitionRuntimeHandoff("failed", "processing")).toBe(false);
  });

  it("requires durable acknowledgement, completion, and failure receipts", () => {
    expect(() =>
      transitionRuntimeHandoffSchema.parse({ state: "accepted" }),
    ).toThrow();
    expect(() =>
      transitionRuntimeHandoffSchema.parse({ state: "completed" }),
    ).toThrow();
    expect(() =>
      transitionRuntimeHandoffSchema.parse({ state: "failed" }),
    ).toThrow();
    expect(
      transitionRuntimeHandoffSchema.parse({
        state: "accepted",
        receipt: { acknowledgedAt: "2026-07-27T20:01:00.000Z" },
      }).state,
    ).toBe("accepted");
  });
});
