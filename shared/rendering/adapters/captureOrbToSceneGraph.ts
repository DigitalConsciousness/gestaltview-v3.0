import type { SceneGraph } from "../engine/browser.js";

/**
 * Converts a Capture/Orb event into a canonical scene graph.
 * Pure, deterministic, covered by fixture tests.
 */
export function captureOrbToSceneGraph(params: {
  captureId: string;
  content: string;
  captureContext?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): SceneGraph {
  const graphId = `capture_orb:${params.captureId}`;

  return {
    schema: "nextgen.scene-graph.v1",
    graphId,
    nodes: [
      {
        id: `cp-doc-${params.captureId}`,
        type: "Document",
        name: `Capture ${params.captureId}`,
        props: {
          title: `Bucket Drop: ${params.captureId}`,
          captureContext: params.captureContext ?? {},
        },
      },
      {
        id: `cp-content-${params.captureId}`,
        type: "Markdown",
        name: "captured content",
        props: {
          source: params.content,
          ...(params.metadata ? { metadata: params.metadata } : {}),
        },
      },
    ],
    edges: [
      {
        id: `cp-contains-${params.captureId}`,
        type: "contains",
        from: `cp-doc-${params.captureId}`,
        to: `cp-content-${params.captureId}`,
        props: {},
      },
    ],
  };
}
