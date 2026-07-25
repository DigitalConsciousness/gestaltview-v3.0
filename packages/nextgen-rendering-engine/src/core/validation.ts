import type { RenderDiagnostic, SceneGraph, SceneNode, NodeType, EdgeType } from './types.js';

const nodeTypes: ReadonlySet<NodeType> = new Set(['Scene3D','Mesh','Material','Light','Camera','Atmosphere','Document','Markdown','Diagram','Chart','DOMSnapshot','VideoTrack','AgentArtifact','ExportRequest']);
const edgeTypes: ReadonlySet<EdgeType> = new Set(['contains','referencesAsset','rendersTo','derivedFrom','controls','annotates','composes']);

function diagnostic(code: string, message: string, stage = 'validate', details: Record<string, unknown> = {}): RenderDiagnostic {
  return { code, message, severity: 'fatal', stage, details };
}

export function validateSceneGraph(graph: SceneGraph): RenderDiagnostic[] {
  const diagnostics: RenderDiagnostic[] = [];
  if (graph.schema !== 'nextgen.scene-graph.v1') diagnostics.push(diagnostic('SCENE_SCHEMA_INVALID', 'Scene graph schema must be nextgen.scene-graph.v1.'));
  if (!graph.graphId) diagnostics.push(diagnostic('SCENE_GRAPH_ID_MISSING', 'Scene graph requires a graphId.'));
  if (!Array.isArray(graph.nodes)) diagnostics.push(diagnostic('SCENE_NODES_INVALID', 'Scene graph nodes must be an array.'));
  if (!Array.isArray(graph.edges)) diagnostics.push(diagnostic('SCENE_EDGES_INVALID', 'Scene graph edges must be an array.'));
  if (diagnostics.length) return diagnostics;

  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (!node.id) diagnostics.push(diagnostic('SCENE_NODE_ID_MISSING', 'Every node requires an id.', 'validate', { node }));
    if (ids.has(node.id)) diagnostics.push(diagnostic('SCENE_NODE_ID_DUPLICATE', `Duplicate node id ${node.id}.`, 'validate', { nodeId: node.id }));
    ids.add(node.id);
    if (!nodeTypes.has(node.type)) diagnostics.push(diagnostic('SCENE_NODE_TYPE_UNKNOWN', `Unknown node type ${node.type}.`, 'validate', { nodeId: node.id, nodeType: node.type }));
    if (typeof node.props !== 'object' || node.props === null) diagnostics.push(diagnostic('SCENE_NODE_PROPS_INVALID', `Node ${node.id} props must be an object.`));
  }

  for (const edge of graph.edges) {
    if (!edge.id) diagnostics.push(diagnostic('SCENE_EDGE_ID_MISSING', 'Every edge requires an id.', 'validate', { edge }));
    if (!edgeTypes.has(edge.type)) diagnostics.push(diagnostic('SCENE_EDGE_TYPE_UNKNOWN', `Unknown edge type ${edge.type}.`, 'validate', { edgeId: edge.id, edgeType: edge.type }));
    if (!ids.has(edge.from)) diagnostics.push(diagnostic('SCENE_EDGE_FROM_MISSING', `Edge ${edge.id} points from missing node ${edge.from}.`));
    if (!ids.has(edge.to)) diagnostics.push(diagnostic('SCENE_EDGE_TO_MISSING', `Edge ${edge.id} points to missing node ${edge.to}.`));
  }

  for (const node of graph.nodes) validateNode(node, diagnostics);
  return diagnostics;
}

function validateNode(node: SceneNode, diagnostics: RenderDiagnostic[]): void {
  if (node.type === 'ExportRequest') {
    const roots = node.props.roots;
    const targets = node.props.targets;
    if (!Array.isArray(roots) || roots.length === 0) diagnostics.push(diagnostic('EXPORT_ROOTS_MISSING', `ExportRequest ${node.id} requires roots.`));
    if (!Array.isArray(targets) || targets.length === 0) diagnostics.push(diagnostic('EXPORT_TARGETS_MISSING', `ExportRequest ${node.id} requires targets.`));
  }
  if (node.type === 'Markdown' && !('source' in node.props) && !('assetRef' in node.props)) diagnostics.push(diagnostic('MARKDOWN_SOURCE_MISSING', `Markdown node ${node.id} requires source or assetRef.`));
  if (node.type === 'Diagram' && (!('diagramType' in node.props) || (!('source' in node.props) && !('assetRef' in node.props)))) diagnostics.push(diagnostic('DIAGRAM_SOURCE_MISSING', `Diagram node ${node.id} requires diagramType and source or assetRef.`));
  if (node.type === 'Chart' && (!('chartType' in node.props) || !('data' in node.props))) diagnostics.push(diagnostic('CHART_DATA_MISSING', `Chart node ${node.id} requires chartType and data.`));
}
