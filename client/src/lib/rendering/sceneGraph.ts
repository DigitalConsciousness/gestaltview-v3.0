/**
 * client/src/lib/rendering/sceneGraph.ts
 *
 * Browser-safe re-exports from the canonical rooted rendering engine.
 * No duplicated contracts. One source of truth.
 *
 * Migrated from the legacy GestaltSceneGraph types (2026-07-13).
 * All existing consumers that imported GestaltSceneGraph, GestaltSceneNode, etc.
 * now receive the canonical types with backward-compatible aliases.
 */

export type {
  NodeType as GestaltNodeType,
  EdgeType as GestaltEdgeType,
  Severity as GestaltSeverity,
  SceneNode as GestaltSceneNode,
  SceneEdge as GestaltSceneEdge,
  SceneGraph as GestaltSceneGraph,
  RenderDiagnostic as GestaltRenderDiagnostic,
} from "@shared/rendering/engine/browser";

export { validateSceneGraph as validateGestaltSceneGraph } from "@shared/rendering/engine/browser";

// Legacy helpers preserved for backward compatibility
import type { SceneGraph, SceneNode } from "@shared/rendering/engine/browser";

export function orderContainedNodes(
  graph: SceneGraph,
  rootId?: string,
): SceneNode[] {
  const contains = graph.edges.filter(
    (edge) => edge.type === "contains" && (!rootId || edge.from === rootId),
  );
  const orderedIds = contains
    .sort((a, b) => Number(a.props?.order ?? 0) - Number(b.props?.order ?? 0))
    .map((edge) => edge.to);
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const ordered = orderedIds
    .map((id) => byId.get(id))
    .filter(Boolean) as SceneNode[];
  const remaining = graph.nodes.filter(
    (node) => !orderedIds.includes(node.id) && node.type !== "ExportRequest",
  );
  return ordered.length
    ? [...ordered, ...remaining.filter((node) => !ordered.some((item) => item.id === node.id))]
    : remaining;
}
