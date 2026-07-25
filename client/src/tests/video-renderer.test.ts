import { describe, expect, it } from "vitest";
import { describeVideoArtifact, resolveVideoSource } from "@/lib/rendering/renderers/videoHelpers";

describe("video renderer helpers", () => {
  it("keeps remote and data URLs intact", () => {
    expect(resolveVideoSource({ content: "https://example.com/reel.mp4" })).toBe("https://example.com/reel.mp4");
    expect(resolveVideoSource({ content: "data:video/mp4;base64,AAAA" })).toBe("data:video/mp4;base64,AAAA");
  });

  it("wraps bare payloads in a data URL using the declared mime type", () => {
    expect(resolveVideoSource({ content: "AAAA", mimeType: "video/webm" })).toBe("data:video/webm;base64,AAAA");
  });

  it("describes the moving picture with a readable label", () => {
    expect(describeVideoArtifact({ content: "AAAA", title: "Room Reel", mimeType: "video/mp4" })).toBe("Room Reel · video/mp4");
    expect(describeVideoArtifact({ content: "AAAA" })).toBe("Moving picture · video/mp4");
  });
});
