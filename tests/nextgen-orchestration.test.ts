import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { GestaltRenderEngine } from "../shared/rendering/engine/adapters/orchestration.js";
import type {
  RenderBackend,
  RenderJob,
  RenderResult,
} from "../shared/rendering/engine/core/types.js";

const cleanup: string[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

const successBackend: RenderBackend = {
  capability: {
    id: "test-document",
    kind: "document",
    displayName: "Test document",
    supportedNodeTypes: ["Document"],
    supportedFormats: ["html"],
    executionMode: "in-process",
    sourceProjects: [],
    strengths: [],
  },
  canRender: () => true,
  async render(job: RenderJob): Promise<RenderResult> {
    return {
      ok: true,
      jobId: job.jobId,
      artifacts: [
        {
          uri: "memory://document.html",
          format: "html",
          backend: "test-document",
        },
      ],
      diagnostics: [],
      manifest: {},
    };
  },
};

const failingBackend: RenderBackend = {
  capability: {
    id: "test-diagram",
    kind: "diagram",
    displayName: "Test diagram",
    supportedNodeTypes: ["Document"],
    supportedFormats: ["svg"],
    executionMode: "in-process",
    sourceProjects: [],
    strengths: [],
  },
  canRender: () => true,
  async render(): Promise<RenderResult> {
    throw new Error("synthetic diagram failure");
  },
};

async function run(requiredSvg: boolean) {
  const outputDirectory = await mkdtemp(join(tmpdir(), "gv-orchestrator-test-"));
  cleanup.push(outputDirectory);
  return new GestaltRenderEngine([successBackend, failingBackend]).render({
    jobId: "11111111-1111-4111-8111-111111111111",
    outputDirectory,
    graph: {
      schema: "nextgen.scene-graph.v1",
      graphId: "failure-isolation",
      nodes: [{ id: "document", type: "Document", props: { title: "Test" } }],
      edges: [],
    },
    targets: [
      { format: "html", uri: "sink://html", required: true },
      { format: "svg", uri: "sink://svg", required: requiredSvg },
    ],
  });
}

describe("backend failure isolation", () => {
  it("preserves successful siblings when a failed target is optional", async () => {
    const result = await run(false);
    expect(result.ok).toBe(true);
    expect(result.artifacts.some((artifact) => artifact.format === "html")).toBe(true);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "BACKEND_RENDER_FAILED", severity: "retryable" }),
        expect.objectContaining({ code: "TARGET_NOT_PRODUCED", severity: "warning" }),
      ]),
    );
  });

  it("preserves successful siblings but fails when the missing target is required", async () => {
    const result = await run(true);
    expect(result.ok).toBe(false);
    expect(result.artifacts.some((artifact) => artifact.format === "html")).toBe(true);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TARGET_NOT_PRODUCED", severity: "fatal" }),
      ]),
    );
  });
});
