import { describe, expect, it } from "vitest";

import { applyUseCaseDefaults } from "@shared/gate/engine";
import { defaultPackageConfigDraftInput } from "@shared/gate/schemas";

describe("GATE package defaults", () => {
  it("starts without forced pack or bundle selections", () => {
    expect(defaultPackageConfigDraftInput.operatorPackSlugs).toEqual([]);
    expect(defaultPackageConfigDraftInput.sourceBundleSlugs).toEqual([]);
  });

  it("updates use-case defaults without auto-selecting recommendations", () => {
    const nextDraft = applyUseCaseDefaults(
      {
        ...defaultPackageConfigDraftInput,
        operatorPackSlugs: ["custom-pack"],
        sourceBundleSlugs: ["custom-bundle"],
      },
      "developer-tools-assistant"
    );

    expect(nextDraft.useCaseSlug).toBe("developer-tools-assistant");
    expect(nextDraft.operatorPackSlugs).toEqual(["custom-pack"]);
    expect(nextDraft.sourceBundleSlugs).toEqual(["custom-bundle"]);
  });
});
