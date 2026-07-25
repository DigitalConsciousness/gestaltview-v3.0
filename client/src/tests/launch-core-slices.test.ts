import { describe, expect, it } from "vitest";

import type { EmbodimentProfile } from "@shared/embodiment/types";
import {
  buildMasterclassSessionOpening,
  buildOnboardingExplainerPrompt,
  buildProfileModuleLandscapeCopy,
  getBetaAnalyticsAccess,
  getLaunchVisibleProfiles,
} from "@/lib/launchCore";

function profile(slug: string, publicName = slug): EmbodimentProfile {
  return {
    slug,
    publicName,
    immutableCore: {
      archetype: `${publicName} archetype`,
      foundationalTruth: `${publicName} truth`,
      coreWisdom: `${publicName} wisdom`,
      voiceTone: `${publicName} tone`,
      ethicalBoundaries: {},
    },
  } as EmbodimentProfile;
}

describe("launch core slices 7-12", () => {
  it("keeps internal DI roles out of beta-facing Masterclass selectors", () => {
    const visible = getLaunchVisibleProfiles([
      profile("billy", "Billy"),
      profile("gate-keeper", "Gatekeeper"),
      profile("repo-scribe", "Repo Scribe"),
      profile("the-recursive-builder", "Recursive Builder"),
      profile("the-weird-digger", "Weird Digger"),
    ]);

    expect(visible.map((item) => item.slug)).toEqual(["billy", "the-weird-digger"]);
  });

  it("opens Masterclass sessions with Billy as support, not impersonation", () => {
    const opening = buildMasterclassSessionOpening(profile("the-weird-digger", "Weird Digger"));

    expect(opening).toContain("Weird Digger");
    expect(opening).toContain("Billy");
    expect(opening).not.toMatch(/greet me as|pretend|act as|as Weird Digger/i);
  });

  it("stores a clean original onboarding explainer prompt", () => {
    const prompt = buildOnboardingExplainerPrompt();

    expect(prompt).toContain("capture first, organize later");
    expect(prompt).toContain("Billy as guide not authority");
    expect(prompt).not.toMatch(/brand|logo|script/i);
  });

  it("describes the profile module landscape from the actual visible module count", () => {
    expect(buildProfileModuleLandscapeCopy(3)).toContain("3 user-facing modules");
  });

  it("hides beta analytics from ordinary free users", () => {
    expect(getBetaAnalyticsAccess({ tier: "free", isAdmin: false }).visible).toBe(false);
    expect(getBetaAnalyticsAccess({ tier: "core", isAdmin: false }).visible).toBe(true);
    expect(getBetaAnalyticsAccess({ tier: "free", isAdmin: true }).visible).toBe(true);
  });
});
