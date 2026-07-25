import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DocumentBackend } from "../shared/rendering/engine/adapters/document.js";

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("document renderer", () => {
  it("renders Markdown semantics instead of showing raw Markdown in a pre block", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "gv-render-test-"));
    cleanup.push(outputDirectory);
    const result = await new DocumentBackend().render({
      jobId: "11111111-1111-4111-8111-111111111111",
      outputDirectory,
      graph: {
        schema: "nextgen.scene-graph.v1",
        graphId: "markdown-test",
        nodes: [
          { id: "document", type: "Document", props: { title: "Test" } },
          {
            id: "body",
            type: "Markdown",
            props: { source: "# Heading\n\nA paragraph with **weight**." },
          },
        ],
        edges: [
          {
            id: "contains",
            type: "contains",
            from: "document",
            to: "body",
            props: {},
          },
        ],
      },
      targets: [{ format: "html", uri: "sink://html" }],
    });

    expect(result.ok).toBe(true);
    const htmlArtifact = result.artifacts.find((artifact) => artifact.format === "html");
    expect(htmlArtifact).toBeDefined();
    const html = await readFile(htmlArtifact?.uri ?? "", "utf8");
    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<strong>weight</strong>");
    expect(html).not.toContain("<pre># Heading");
  });
});
