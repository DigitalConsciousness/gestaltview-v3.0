import type { SceneGraph } from "../engine/browser.js";

/**
 * Converts a CodexArtifact into a canonical scene graph.
 * Pure, deterministic, covered by fixture tests.
 */
export function codexArtifactToSceneGraph(params: {
  artifactId: string;
  title?: string;
  content?: string;
  artifactKind?: string;
  metadata?: Record<string, unknown>;
}): SceneGraph {
  const graphId = `codex_artifact:${params.artifactId}`;
  const title = params.title ?? params.artifactId;
  const kind = params.artifactKind ?? "unknown";

  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: `cx-doc-${params.artifactId}`,
        type: "Document",
        name: title,
        props: { title, artifactKind: kind },
      },
      {
        id: `cx-content-${params.artifactId}`,
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
        id: `cx-contains-${params.artifactId}`,
        type: "contains",
        from: `cx-doc-${params.artifactId}`,
        to: `cx-content-${params.artifactId}`,
        props: {},
      },
    ],
  };
}
