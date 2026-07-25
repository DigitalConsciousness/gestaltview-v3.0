import { describe, expect, it } from "vitest";

import { buildInnerWorldArtifactDownloadPayload } from "@/lib/dynamicInnerWorldDownloads";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

const record: InnerWorldArtifactRecord = {
  id: "artifact-1",
  userId: "user-1",
  title: "Living Draft",
  summary: "A rendered artifact.",
  sourceFileId: "file-1",
  html: "<article><h1>Living Draft</h1><p>Rendered content.</p></article>",
  createdAt: "2026-06-18T00:00:00.000Z",
  updatedAt: "2026-06-18T00:00:00.000Z",
  originRoom: "creation_corner",
  evidenceNodeIds: ["capture-1"],
  tags: ["html", "artifact"],
};

describe("Dynamic Inner World downloads", () => {
  it("builds HTML, text, and JSON payloads for artifact downloads", () => {
    const html = buildInnerWorldArtifactDownloadPayload(record, "html");
    const text = buildInnerWorldArtifactDownloadPayload(record, "txt");
    const json = buildInnerWorldArtifactDownloadPayload(record, "json");

    expect(html.fileName).toBe("living-draft.html");
    expect(html.mimeType).toBe("text/html;charset=utf-8");
    expect(html.content).toContain("<!doctype html>");
    expect(html.content).toContain("Rendered content.");

    expect(text.fileName).toBe("living-draft.txt");
    expect(text.mimeType).toBe("text/plain;charset=utf-8");
    expect(text.content).toContain("Title: Living Draft");
    expect(text.content).toContain("Rendered content.");

    expect(json.fileName).toBe("living-draft.json");
    expect(json.mimeType).toBe("application/json;charset=utf-8");
    expect(JSON.parse(json.content)).toMatchObject({
      title: "Living Draft",
      originRoom: "creation_corner",
      tags: ["html", "artifact"],
    });
  });
});
