import { describe, expect, it } from "vitest";

process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_codex";

const checkoutModulePromise = import("../stripe/agent-trainer-checkout");

describe("agent trainer checkout helpers", () => {
  it("normalizes legacy underscore consulting identifiers", async () => {
    const { normalizeOffering } = await checkoutModulePromise;

    expect(normalizeOffering("custom_exhibit")).toBe("custom-exhibit");
    expect(normalizeOffering("knowledge_curation")).toBe("knowledge-curation");
    expect(normalizeOffering("full_deployment")).toBe("full-deployment");
  });

  it("maps subscription offerings to app tiers", async () => {
    const { offeringToTier } = await checkoutModulePromise;

    expect(offeringToTier("solo")).toBe("core");
    expect(offeringToTier("business")).toBe("pro");
    expect(offeringToTier("enterprise")).toBe("enterprise");
    expect(offeringToTier("scaffold")).toBeNull();
  });
});
