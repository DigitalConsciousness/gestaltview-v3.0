import { describe, expect, it } from "vitest";

import { createFreshBlueprintFromText } from "@/components/BlueprintGenerativeWorkbench";

describe("creation corner freeform entry", () => {
  it("builds a fresh blueprint from raw text", () => {
    const blueprint = createFreshBlueprintFromText("A working title\nand the rest of the thought");

    expect(blueprint).not.toBeNull();
    expect(blueprint?.title).toBe("A working title");
    expect(blueprint?.summary).toContain("and the rest of the thought");
    expect(blueprint?.status).toBe("draft");
    expect(blueprint?.captureCount).toBe(1);
    expect(blueprint?.sourceOrbIds).toEqual([]);
    expect(blueprint?.outputs.markdown).toContain("A working title");
  });

  it("returns null for empty input", () => {
    expect(createFreshBlueprintFromText("   ")).toBeNull();
  });
});
