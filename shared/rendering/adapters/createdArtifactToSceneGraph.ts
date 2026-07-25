import type { SceneGraph } from "../engine/browser.js";

/**
 * Converts a CreatedArtifact into a canonical scene graph.
 * Pure, deterministic, covered by fixture tests.
 */
export function createdArtifactToSceneGraph(params: {
  artifactId: string;
  title?: string;
  content?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}): SceneGraph {
  const graphId = `created_artifact:${params.artifactId}`;
  const title = params.title ?? params.artifactId;

  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: `ca-doc-${params.artifactId}`,
        type: "Document",
        name: title,
        props: { title, contentFormat: params.contentType ?? "unknown" },
      },
      {
        id: `ca-content-${params.artifactId}`,
        type: "Markdown",
        name: `${title} content`,
        props: {
          source: params.content ?? "",
          ...(params.metadata ? { metadata: params.metadata } : {}),
        },
      },
    ],
    edges: [
      {
        id: `ca-contains-${params.artifactId}`,
        type: "contains",
        from: `ca-doc-${params.artifactId}`,
        to: `ca-content-${params.artifactId}`,
        props: {},
      },
    ],
  };
}
