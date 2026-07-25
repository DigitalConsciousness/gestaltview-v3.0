import type { SceneGraph } from "../engine/browser.js";

/**
 * Converts a Transcriptory output into a canonical scene graph.
 * Pure, deterministic, covered by fixture tests.
 */
export function transcriptoryArtifactToSceneGraph(params: {
  artifactId: string;
  title?: string;
  content?: string;
  transcriptFormat?: string;
  metadata?: Record<string, unknown>;
}): SceneGraph {
  const graphId = `transcriptory:${params.artifactId}`;
  const title = params.title ?? params.artifactId;

  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: `tr-doc-${params.artifactId}`,
        type: "Document",
        name: title,
        props: { title, transcriptFormat: params.transcriptFormat ?? "text" },
      },
      {
        id: `tr-content-${params.artifactId}`,
        type: "Markdown",
        name: `${title} transcript`,
        props: {
          source: params.content ?? "",
          ...(params.metadata ? { metadata: params.metadata } : {}),
        },
      },
    ],
    edges: [
      {
        id: `tr-contains-${params.artifactId}`,
        type: "contains",
        from: `tr-doc-${params.artifactId}`,
        to: `tr-content-${params.artifactId}`,
        props: {},
      },
    ],
  };
}
