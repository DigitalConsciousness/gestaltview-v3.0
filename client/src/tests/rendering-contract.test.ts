import { describe, expect, it } from "vitest";

import { resolveFormat } from "@/lib/rendering/dispatch";
import { artifactViewModelFromArtifact } from "@/lib/rendering/fromArtifacts";
import type { RenderableArtifact } from "@/lib/rendering/types";

describe("rendering contract", () => {
  it("prefers the generated contentFormat before sniffing content", () => {
    const artifact = {
      content: "<html><body>not actually html</body></html>",
      contentFormat: "json",
    } as RenderableArtifact;

    expect(resolveFormat(artifact)).toBe("json");
  });

  it("maps scene graph export artifacts to json_scene_graph instead of markdown fallback", () => {
    const result = artifactViewModelFromArtifact({
      id: "artifact-1",
      title: "Graph",
      format: "json",
      data: { schema: "nextgen.scene-graph.v1", nodes: [] },
    });

    expect(result.kind).toBe("json_scene_graph");
  });
});
