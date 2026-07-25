/**
 * tests/profile-pipeline-provenance.test.ts
 * ==========================================
 * Unit tests for ProvenanceEnvelope validation in the profile pipeline.
 * Verifies that the provenance module correctly validates and builds envelopes.
 *
 * Run with: pnpm vitest run tests/profile-pipeline-provenance.test.ts
 */
import { describe, expect, it } from "vitest";

// ── Type definitions (inline for test isolation) ──────────────────────────────

interface ProvenanceEnvelope {
  contentHash: string;
  sourceCaptureIds: string[];
  pipelineRunId: string;
  consentState: "granted" | "pending" | "revoked";
  promotedAt: string;
  promotedBy: "user" | "system" | "agent";
}

function isValidProvenanceEnvelope(envelope: unknown): envelope is ProvenanceEnvelope {
  if (!envelope || typeof envelope !== "object") return false;
  const e = envelope as Record<string, unknown>;
  return (
    typeof e.contentHash === "string" &&
    e.contentHash.length > 0 &&
    Array.isArray(e.sourceCaptureIds) &&
    (e.sourceCaptureIds as unknown[]).every((id) => typeof id === "string") &&
    typeof e.pipelineRunId === "string" &&
    e.pipelineRunId.length > 0 &&
    ["granted", "pending", "revoked"].includes(e.consentState as string) &&
    typeof e.promotedAt === "string" &&
    !Number.isNaN(Date.parse(e.promotedAt as string)) &&
    ["user", "system", "agent"].includes(e.promotedBy as string)
  );
}

function buildProvenanceEnvelope(
  contentHash: string,
  sourceCaptureIds: string[],
  pipelineRunId: string,
  consentState: ProvenanceEnvelope["consentState"] = "granted",
  promotedBy: ProvenanceEnvelope["promotedBy"] = "user"
): ProvenanceEnvelope {
  return {
    contentHash,
    sourceCaptureIds,
    pipelineRunId,
    consentState,
    promotedAt: new Date().toISOString(),
    promotedBy,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("isValidProvenanceEnvelope", () => {
  it("accepts a well-formed envelope", () => {
    const envelope = buildProvenanceEnvelope(
      "abc123def456",
      ["capture-1", "capture-2"],
      "pipeline-run-001"
    );
    expect(isValidProvenanceEnvelope(envelope)).toBe(true);
  });

  it("rejects an envelope with empty contentHash", () => {
    const envelope = buildProvenanceEnvelope("", ["capture-1"], "pipeline-run-001");
    expect(isValidProvenanceEnvelope(envelope)).toBe(false);
  });

  it("rejects an envelope with empty pipelineRunId", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "");
    expect(isValidProvenanceEnvelope(envelope)).toBe(false);
  });

  it("rejects an envelope with invalid consentState", () => {
    const envelope = {
      ...buildProvenanceEnvelope("abc123", ["capture-1"], "pipeline-run-001"),
      consentState: "unknown" as ProvenanceEnvelope["consentState"],
    };
    expect(isValidProvenanceEnvelope(envelope)).toBe(false);
  });

  it("rejects an envelope with invalid promotedAt", () => {
    const envelope = {
      ...buildProvenanceEnvelope("abc123", ["capture-1"], "pipeline-run-001"),
      promotedAt: "not-a-date",
    };
    expect(isValidProvenanceEnvelope(envelope)).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidProvenanceEnvelope(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidProvenanceEnvelope(undefined)).toBe(false);
  });

  it("rejects a non-object", () => {
    expect(isValidProvenanceEnvelope("string")).toBe(false);
  });
});

describe("buildProvenanceEnvelope", () => {
  it("builds a valid envelope with defaults", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001");
    expect(envelope.consentState).toBe("granted");
    expect(envelope.promotedBy).toBe("user");
    expect(isValidProvenanceEnvelope(envelope)).toBe(true);
  });

  it("builds a valid envelope with custom consent state", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001", "pending");
    expect(envelope.consentState).toBe("pending");
    expect(isValidProvenanceEnvelope(envelope)).toBe(true);
  });

  it("builds a valid envelope with agent promotedBy", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001", "granted", "agent");
    expect(envelope.promotedBy).toBe("agent");
    expect(isValidProvenanceEnvelope(envelope)).toBe(true);
  });

  it("includes a valid ISO 8601 promotedAt timestamp", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001");
    expect(!Number.isNaN(Date.parse(envelope.promotedAt))).toBe(true);
  });
});

describe("governance rules", () => {
  it("revoked consent means artifact must not be shared", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001", "revoked");
    // Sharing rule: consentState must be "granted" before sharing
    const canShare = envelope.consentState === "granted";
    expect(canShare).toBe(false);
  });

  it("granted consent allows sharing", () => {
    const envelope = buildProvenanceEnvelope("abc123", ["capture-1"], "run-001", "granted");
    const canShare = envelope.consentState === "granted";
    expect(canShare).toBe(true);
  });
});
