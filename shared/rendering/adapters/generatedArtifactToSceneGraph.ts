import type { SceneGraph } from "../engine/browser.js";

/**
 * Converts a GeneratedArtifact into a canonical scene graph.
 * Pure, deterministic, covered by fixture tests.
 * Translates format and layout. Does NOT rewrite meaning or discard source language.
 */
export function generatedArtifactToSceneGraph(params: {
  artifactId: string;
  title?: string;
  content?: string;
  format?: string;
  metadata?: Record<string, unknown>;
}): SceneGraph {
  const graphId = `generated_artifact:${params.artifactId}`;
  const title = params.title ?? params.artifactId;

  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: `ga-doc-${params.artifactId}`,
        type: "Document",
        name: title,
        props: { title, format: params.format ?? "unknown" },
      },
      {
        id: `ga-content-${params.artifactId}`,
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
        id: `ga-contains-${params.artifactId}`,
        type: "contains",
        from: `ga-doc-${params.artifactId}`,
        to: `ga-content-${params.artifactId}`,
        props: {},
      },
    ],
  };
}
