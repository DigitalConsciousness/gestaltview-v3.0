import { describe, expect, it } from "vitest";
import { buildMemoryInsert } from "../../api/memory";

describe("memory helpers", () => {
  it("applies a default importance score", () => {
    const insert = buildMemoryInsert({
      userId: "user-1",
      sessionId: "session-1",
      key: "tone",
      value: {
        preference: "direct"
      }
    });

    expect(insert).toMatchObject({
      importance: 2,
      session_id: "session-1"
    });
  });
});
