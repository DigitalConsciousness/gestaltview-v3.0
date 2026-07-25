import { describe, expect, it } from "vitest";

import { INNER_WORLD_SURFACES, type InnerWorldCapture } from "@/components/Scaffold";
import { groupInnerWorldCaptures, resolveInnerWorldPlacement } from "@/components/inner-world/innerWorldPlacement";

function capture(id: string, overrides: Partial<InnerWorldCapture> = {}): InnerWorldCapture {
  return {
    id,
    label: id,
    title: id,
    text: `Capture ${id}`,
    source: "blackboard",
    type: "memory",
    color: "#12D6FF",
    tags: [],
    resonance: 0.5,
    status: "saved",
    metadata: { createdAt: "2026-06-10T00:00:00.000Z" },
    surface: "forward",
    createdAt: "2026-06-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("inner world dynamic placement", () => {
  it("groups captures into every available room surface without placeholder records", () => {
    const grouped = groupInnerWorldCaptures([
      capture("a", { surface: "forward" }),
      capture("b", { surface: "left" }),
      capture("c", { surface: "missing" as InnerWorldCapture["surface"] }),
    ]);

    expect(Object.keys(grouped)).toEqual(INNER_WORLD_SURFACES.map((surface) => surface.id));
    expect(grouped.forward.map((item) => item.id)).toEqual(["a", "c"]);
    expect(grouped.left.map((item) => item.id)).toEqual(["b"]);
    expect(Object.values(grouped).flat()).toHaveLength(3);
  });

  it("derives stable placement from capture content and media hints", () => {
    const audio = resolveInnerWorldPlacement(capture("audio", { type: "audio", source: "voice" }), 0);
    const code = resolveInnerWorldPlacement(capture("code", { type: "code", text: "const answer = 42;" }), 1);
    const image = resolveInnerWorldPlacement(
      capture("image", {
        type: "image",
        metadata: {
          createdAt: "2026-06-10T00:00:00.000Z",
          display: { surface: "forward", x: 0.5, y: 0.5, thumbnailUrl: "/image.png" },
        },
      }),
      2,
    );

    expect(audio.displayMode).toBe("waveform");
    expect(code.displayMode).toBe("code-panel");
    expect(image.displayMode).toBe("photo");
    expect(resolveInnerWorldPlacement(capture("audio", { type: "audio", source: "voice" }), 0)).toEqual(audio);
  });
});
