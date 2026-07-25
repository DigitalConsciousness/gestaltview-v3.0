import { describe, expect, it } from "vitest";

import {
  hasFounderTrainerControlPlaneAccess,
  hasHostedAgentTrainerAccess,
  resolveHostedAgentTrainerPlan,
} from "../lib/agentTrainerAccess";

describe("agent trainer access helpers", () => {
  it("allows the founder default email into the control plane", () => {
    expect(
      hasFounderTrainerControlPlaneAccess({
        email: "KeithSoyka@gmail.com",
      })
    ).toBe(true);
  });

  it("blocks non-admin subscriber emails from the control plane", () => {
    expect(
      hasFounderTrainerControlPlaneAccess({
        email: "subscriber@example.com",
        isAdmin: false,
      })
    ).toBe(false);
  });

  it("grants hosted runtime access to paid tiers and active subscriptions", () => {
    expect(
      hasHostedAgentTrainerAccess({
        tier: "pro",
        subscriptionStatus: "inactive",
      })
    ).toBe(true);

    expect(
      hasHostedAgentTrainerAccess({
        tier: "free",
        subscriptionStatus: "trialing",
      })
    ).toBe(true);
  });

  it("maps access state to the correct hosted runtime plan", () => {
    expect(
      resolveHostedAgentTrainerPlan({
        tier: "enterprise",
      })
    ).toMatchObject({
      runtimeTier: "ENTERPRISE",
      label: "Enterprise Track",
    });

    expect(
      resolveHostedAgentTrainerPlan({
        subscriptionStatus: "inactive",
      })
    ).toMatchObject({
      runtimeTier: "SOLO_SPARK",
      label: "Preview Mode",
    });
  });
});
