import { describe, expect, it } from "vitest";

import { getRoomState, ROOM_STATES } from "@/lib/roomState";

describe("room state registry", () => {
  it("exposes the current room badges for the live headers", () => {
    expect(getRoomState("blackboard-room")?.stability).toBe("DIRECTION");
    expect(getRoomState("creation-corner")?.label).toBe("Creation Corner");
    expect(getRoomState("profile")?.stability).toBe("UNSTABLE");
    expect(ROOM_STATES["external-scaffold"]?.mobileChecked).toBe(false);
  });

  it("returns null for unknown rooms", () => {
    expect(getRoomState("missing-room")).toBeNull();
  });
});
