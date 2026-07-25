/**
 * tests/gate-compatibility.test.ts
 * =================================
 * Unit tests for the GATE compatibility rule engine.
 * Covers all rules including the Constitutional Invariant guards added in v1.0.
 *
 * Run with: pnpm vitest run tests/gate-compatibility.test.ts
 */
import { describe, expect, it } from "vitest";
import { evaluateGateCompatibility } from "../config/gateCompatibility.js";
import { defaultPackageConfigDraftInput } from "../shared/gate/schemas.js";
import type { PackageConfigDraftInput } from "../shared/gate/schemas.js";

function makeDraft(overrides: Partial<PackageConfigDraftInput> = {}): PackageConfigDraftInput {
  return {
    ...defaultPackageConfigDraftInput,
    useCaseSlug: "general-assistant",
    tier: "SOLO_SPARK",
    seatsRequested: 1,
    backend: "supabase",
    deliverySurfaces: ["web"],
    themePresetId: "default",
    ...overrides,
  };
}

// ── Existing rules ────────────────────────────────────────────────────────────

describe("mobile-surfaces-need-web-note", () => {
  it("warns when mobile surfaces are selected without web", () => {
    const result = evaluateGateCompatibility(makeDraft({ deliverySurfaces: ["ios"] }));
    expect(result.findings.some((f) => f.id === "mobile-surfaces-need-web-note")).toBe(true);
  });

  it("does not warn when web is included alongside mobile", () => {
    const result = evaluateGateCompatibility(makeDraft({ deliverySurfaces: ["ios", "web"] }));
    expect(result.findings.some((f) => f.id === "mobile-surfaces-need-web-note")).toBe(false);
  });
});

describe("seat-cap", () => {
  it("blocks when seats exceed tier maximum", () => {
    const result = evaluateGateCompatibility(makeDraft({ tier: "SOLO_SPARK", seatsRequested: 5 }));
    expect(result.blocking).toBe(true);
    expect(result.findings.some((f) => f.id === "seat-cap" && f.severity === "error")).toBe(true);
  });

  it("passes when seats are within tier maximum", () => {
    const result = evaluateGateCompatibility(makeDraft({ tier: "STUDIO", seatsRequested: 5 }));
    expect(result.findings.some((f) => f.id === "seat-cap")).toBe(false);
  });
});

// ── Constitutional Invariant Guards ──────────────────────────────────────────

describe("di_identity_export_violation (Constitutional Invariant DI-4)", () => {
  it("blocks when customNotes mentions 'living di'", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "I want to export a living di identity for my product." })
    );
    const finding = result.findings.find((f) => f.id === "di_identity_export_violation");
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("error");
    expect(result.blocking).toBe(true);
  });

  it("blocks when customNotes mentions 'persistent di'", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Need a persistent di that remembers everything." })
    );
    expect(result.findings.some((f) => f.id === "di_identity_export_violation")).toBe(true);
  });

  it("blocks when customNotes mentions 'di identity'", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Package the di identity for transfer." })
    );
    expect(result.findings.some((f) => f.id === "di_identity_export_violation")).toBe(true);
  });

  it("does not trigger for normal package notes", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "We need a customer support assistant for our SaaS product." })
    );
    expect(result.findings.some((f) => f.id === "di_identity_export_violation")).toBe(false);
  });

  it("does not trigger when customNotes is undefined", () => {
    const result = evaluateGateCompatibility(makeDraft({ customNotes: undefined }));
    expect(result.findings.some((f) => f.id === "di_identity_export_violation")).toBe(false);
  });
});

describe("missing_provenance_receipt (Constitutional Invariant DI-2, DI-3)", () => {
  it("blocks when notes mention embodiment without provenance", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Include an embodiment profile for the agent." })
    );
    const finding = result.findings.find((f) => f.id === "missing_provenance_receipt");
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("error");
  });

  it("does not block when notes mention embodiment with provenance", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Include an embodiment profile with a provenance receipt attached." })
    );
    expect(result.findings.some((f) => f.id === "missing_provenance_receipt")).toBe(false);
  });

  it("blocks when notes mention identity claim without provenance", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Package includes an identity claim for the agent." })
    );
    expect(result.findings.some((f) => f.id === "missing_provenance_receipt")).toBe(true);
  });
});

describe("missing_embodiment_compile_run", () => {
  it("warns when notes mention embodiment without a compile run reference", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Include an embodiment profile with provenance." })
    );
    const finding = result.findings.find((f) => f.id === "missing_embodiment_compile_run");
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe("warning");
  });

  it("does not warn when notes include a pipeline run reference", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Include an embodiment profile. Pipeline run: pipeline_run_id=abc123. Provenance attached." })
    );
    expect(result.findings.some((f) => f.id === "missing_embodiment_compile_run")).toBe(false);
  });
});

describe("legacy_table_dependency", () => {
  it("warns when notes reference a legacy table", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Read from bucket_drops table for initial data." })
    );
    expect(result.findings.some((f) => f.id === "legacy_table_dependency")).toBe(true);
  });

  it("does not warn for canonical table references", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Read from capture_events and artifacts tables." })
    );
    expect(result.findings.some((f) => f.id === "legacy_table_dependency")).toBe(false);
  });
});

// ── Checkout mode ─────────────────────────────────────────────────────────────

describe("checkoutMode", () => {
  it("returns pay_now for a clean draft", () => {
    const result = evaluateGateCompatibility(makeDraft());
    expect(result.checkoutMode).toBe("pay_now");
    expect(result.blocking).toBe(false);
  });

  it("returns request_review when a blocking rule fires", () => {
    const result = evaluateGateCompatibility(
      makeDraft({ customNotes: "Export living di identity." })
    );
    expect(result.checkoutMode).toBe("request_review");
  });
});
