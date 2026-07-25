import { describe, expect, it } from "vitest";
import { renderIdempotencyKey } from "../../api/render/idempotency.js";

const base = {
  sourceFamily: "scene_graph",
  sourceId: "graph-one",
  targetFormats: ["html", "svg"],
  userId: "11111111-1111-4111-8111-111111111111",
  graphFingerprint: "abc",
};

describe("render idempotency", () => {
  it("normalizes target order and case", () => {
    const first = renderIdempotencyKey(base);
    const second = renderIdempotencyKey({
      ...base,
      targetFormats: ["SVG", "HTML"],
    });
    expect(first).toBe(second);
  });

  it("changes when the graph content changes", () => {
    expect(renderIdempotencyKey(base)).not.toBe(
      renderIdempotencyKey({ ...base, graphFingerprint: "def" }),
    );
  });

  it("changes across users", () => {
    expect(renderIdempotencyKey(base)).not.toBe(
      renderIdempotencyKey({
        ...base,
        userId: "22222222-2222-4222-8222-222222222222",
      }),
    );
  });
});
