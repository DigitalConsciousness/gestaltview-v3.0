/**
 * POWERHOUSE VALIDATION
 *
 * Validates PowerhouseSceneGraph against gsvw-render.v1 contract.
 * Additive to existing validateSceneGraph — does not replace it.
 */

import type { RenderDiagnostic } from './types.js';
import type {
  ArtifactClass,
  OutputFormat,
  PowerhouseEdge,
  PowerhouseNode,
  PowerhouseSceneGraph,
} from './types-powerhouse.js';

const ARTIFACT_CLASSES: ReadonlySet<ArtifactClass> = new Set([
  'document', 'slide', 'chart', 'mindmap', 'image', 'video', 'audio',
  'wiki', 'app', 'component', 'agent-studio', 'storybook', 'canvas',
  'pitch', 'brand', 'prompt', 'table',
]);

const OUTPUT_FORMATS: ReadonlySet<OutputFormat> = new Set([
  'html', 'markdown', 'json', 'txt', 'yaml',
  'png', 'jpg', 'webp', 'svg',
  'pdf', 'pptx', 'docx', 'xlsx', 'csv',
  'mp4', 'webm', 'mp3', 'wav', 'm4a',
  'react', 'deployed-url',
]);

const NODE_TYPES: ReadonlySet<string> = new Set([
  'Document', 'Markdown', 'Diagram', 'Chart',
  'Slide', 'MindMap', 'Image', 'Video', 'Audio',
  'Wiki', 'App', 'Component', 'AgentStudio',
  'Storybook', 'Canvas', 'Pitch', 'Brand', 'Prompt', 'Table',
]);

const EDGE_TYPES: ReadonlySet<string> = new Set([
  'slides', 'contains', 'references', 'derives', 'links', 'sequences',
]);

function diag(
  code: string,
  message: string,
  stage = 'validate',
  details: Record<string, unknown> = {},
): RenderDiagnostic {
  return { code, message, severity: 'fatal', stage, details };
}

export function validatePowerhouseSceneGraph(
  graph: PowerhouseSceneGraph,
): RenderDiagnostic[] {
  const diagnostics: RenderDiagnostic[] = [];

  // Schema
  if (graph.schema !== 'gsvw-render.v1') {
    diagnostics.push(diag('PH_SCHEMA_INVALID', 'Powerhouse scene graph schema must be gsvw-render.v1.'));
  }

  // Artifact class
  if (!ARTIFACT_CLASSES.has(graph.artifactClass)) {
    diagnostics.push(diag('PH_ARTIFACT_CLASS_INVALID', `Unknown artifact class: ${graph.artifactClass}`));
  }

  // Title
  if (!graph.title || !graph.title.trim()) {
    diagnostics.push(diag('PH_TITLE_MISSING', 'Powerhouse scene graph requires a title.'));
  }

  // Nodes
  if (!Array.isArray(graph.nodes)) {
    diagnostics.push(diag('PH_NODES_INVALID', 'Powerhouse scene graph nodes must be an array.'));
    return diagnostics;
  }

  // Edges
  if (!Array.isArray(graph.edges)) {
    diagnostics.push(diag('PH_EDGES_INVALID', 'Powerhouse scene graph edges must be an array.'));
    return diagnostics;
  }

  // Config
  if (!graph.config) {
    diagnostics.push(diag('PH_CONFIG_MISSING', 'Powerhouse scene graph requires config.'));
  } else {
    if (!Array.isArray(graph.config.targets) || graph.config.targets.length === 0) {
      diagnostics.push(diag('PH_CONFIG_TARGETS_MISSING', 'Render config requires at least one target format.'));
    } else {
      for (const target of graph.config.targets) {
        if (!OUTPUT_FORMATS.has(target)) {
          diagnostics.push(diag('PH_CONFIG_TARGET_INVALID', `Unknown output format: ${target}`, 'validate', { target }));
        }
      }
    }
    if (!graph.config.storageBucket) {
      diagnostics.push(diag('PH_CONFIG_BUCKET_MISSING', 'Render config requires a storageBucket.'));
    }
  }

  // Provenance
  if (!graph.provenance) {
    diagnostics.push(diag('PH_PROVENANCE_MISSING', 'Powerhouse scene graph requires provenance envelope.'));
  } else {
    if (!graph.provenance.sourceType) {
      diagnostics.push(diag('PH_PROVENANCE_SOURCE_TYPE_MISSING', 'Provenance requires sourceType.'));
    }
    if (!Array.isArray(graph.provenance.sourceIds) || graph.provenance.sourceIds.length === 0) {
      diagnostics.push(diag('PH_PROVENANCE_SOURCE_IDS_MISSING', 'Provenance requires at least one sourceId.'));
    }
    if (!graph.provenance.consent) {
      diagnostics.push(diag('PH_PROVENANCE_CONSENT_MISSING', 'Provenance requires consent record.'));
    }
  }

  if (diagnostics.some(d => d.severity === 'fatal')) return diagnostics;

  // Node ID uniqueness
  const ids = new Set<string>();
  for (const node of graph.nodes) {
    if (!node.id) {
      diagnostics.push(diag('PH_NODE_ID_MISSING', 'Every powerhouse node requires an id.'));
      continue;
    }
    if (ids.has(node.id)) {
      diagnostics.push(diag('PH_NODE_ID_DUPLICATE', `Duplicate node id: ${node.id}`, 'validate', { nodeId: node.id }));
    }
    ids.add(node.id);

    if (!NODE_TYPES.has(node.type)) {
      diagnostics.push(diag('PH_NODE_TYPE_UNKNOWN', `Unknown powerhouse node type: ${node.type}`, 'validate', { nodeId: node.id, nodeType: node.type }));
    }

    if (typeof node.props !== 'object' || node.props === null) {
      diagnostics.push(diag('PH_NODE_PROPS_INVALID', `Node ${node.id} props must be an object.`));
    }
  }

  // Edge validation
  for (const edge of graph.edges) {
    if (!edge.id) {
      diagnostics.push(diag('PH_EDGE_ID_MISSING', 'Every powerhouse edge requires an id.'));
      continue;
    }
    if (!EDGE_TYPES.has(edge.type)) {
      diagnostics.push(diag('PH_EDGE_TYPE_UNKNOWN', `Unknown powerhouse edge type: ${edge.type}`, 'validate', { edgeId: edge.id }));
    }
    if (!ids.has(edge.from)) {
      diagnostics.push(diag('PH_EDGE_FROM_MISSING', `Edge ${edge.id} points from missing node ${edge.from}.`));
    }
    if (!ids.has(edge.to)) {
      diagnostics.push(diag('PH_EDGE_TO_MISSING', `Edge ${edge.id} points to missing node ${edge.to}.`));
    }
  }

  // Per-artifact-class node validation
  validateArtifactClassNodes(graph, diagnostics);

  return diagnostics;
}

function validateArtifactClassNodes(
  graph: PowerhouseSceneGraph,
  diagnostics: RenderDiagnostic[],
): void {
  switch (graph.artifactClass) {
    case 'slide':
    case 'pitch': {
      const slideNodes = graph.nodes.filter(n => n.type === 'Slide');
      if (slideNodes.length === 0) {
        diagnostics.push(diag('PH_SLIDE_NODES_MISSING', `${graph.artifactClass} requires at least one Slide node.`));
      }
      break;
    }
    case 'chart': {
      const chartNodes = graph.nodes.filter(n => n.type === 'Chart');
      if (chartNodes.length === 0) {
        diagnostics.push(diag('PH_CHART_NODES_MISSING', 'chart artifact requires at least one Chart node.'));
      }
      for (const node of chartNodes) {
        if (!('chartType' in node.props)) {
          diagnostics.push(diag('PH_CHART_TYPE_MISSING', `Chart node ${node.id} requires chartType.`));
        }
        if (!('data' in node.props)) {
          diagnostics.push(diag('PH_CHART_DATA_MISSING', `Chart node ${node.id} requires data.`));
        }
      }
      break;
    }
    case 'mindmap': {
      const mindmapNodes = graph.nodes.filter(n => n.type === 'MindMap');
      if (mindmapNodes.length === 0) {
        diagnostics.push(diag('PH_MINDMAP_NODES_MISSING', 'mindmap artifact requires at least one MindMap node.'));
      }
      break;
    }
    case 'image': {
      const imageNodes = graph.nodes.filter(n => n.type === 'Image');
      if (imageNodes.length === 0) {
        diagnostics.push(diag('PH_IMAGE_NODES_MISSING', 'image artifact requires at least one Image node.'));
      }
      break;
    }
    case 'video': {
      const videoNodes = graph.nodes.filter(n => n.type === 'Video');
      if (videoNodes.length === 0) {
        diagnostics.push(diag('PH_VIDEO_NODES_MISSING', 'video artifact requires at least one Video node.'));
      }
      break;
    }
    case 'audio': {
      const audioNodes = graph.nodes.filter(n => n.type === 'Audio');
      if (audioNodes.length === 0) {
        diagnostics.push(diag('PH_AUDIO_NODES_MISSING', 'audio artifact requires at least one Audio node.'));
      }
      break;
    }
    case 'document':
    case 'wiki':
    case 'prompt': {
      const docNodes = graph.nodes.filter(n => n.type === 'Document' || n.type === 'Markdown');
      if (docNodes.length === 0) {
        diagnostics.push(diag('PH_DOC_NODES_MISSING', `${graph.artifactClass} artifact requires at least one Document or Markdown node.`));
      }
      break;
    }
    case 'table': {
      const tableNodes = graph.nodes.filter(n => n.type === 'Table');
      if (tableNodes.length === 0) {
        diagnostics.push(diag('PH_TABLE_NODES_MISSING', 'table artifact requires at least one Table node.'));
      }
      break;
    }
    case 'app':
    case 'component': {
      const appNodes = graph.nodes.filter(n => n.type === 'App' || n.type === 'Component');
      if (appNodes.length === 0) {
        diagnostics.push(diag('PH_APP_NODES_MISSING', `${graph.artifactClass} artifact requires at least one App or Component node.`));
      }
      break;
    }
    case 'agent-studio': {
      const studioNodes = graph.nodes.filter(n => n.type === 'AgentStudio');
      if (studioNodes.length === 0) {
        diagnostics.push(diag('PH_STUDIO_NODES_MISSING', 'agent-studio artifact requires at least one AgentStudio node.'));
      }
      break;
    }
    case 'storybook': {
      const storyNodes = graph.nodes.filter(n => n.type === 'Storybook');
      if (storyNodes.length === 0) {
        diagnostics.push(diag('PH_STORYBOOK_NODES_MISSING', 'storybook artifact requires at least one Storybook node.'));
      }
      break;
    }
    case 'canvas': {
      const canvasNodes = graph.nodes.filter(n => n.type === 'Canvas');
      if (canvasNodes.length === 0) {
        diagnostics.push(diag('PH_CANVAS_NODES_MISSING', 'canvas artifact requires at least one Canvas node.'));
      }
      break;
    }
    case 'brand': {
      const brandNodes = graph.nodes.filter(n => n.type === 'Brand');
      if (brandNodes.length === 0) {
        diagnostics.push(diag('PH_BRAND_NODES_MISSING', 'brand artifact requires at least one Brand node.'));
      }
      break;
    }
  }
}

/**
 * Build a minimal valid PowerhouseSceneGraph for a given artifact class.
 * Useful for testing and as a template for the orchestrator.
 */
export function buildPowerhouseSceneGraph(
  artifactClass: ArtifactClass,
  title: string,
  nodes: PowerhouseNode[],
  edges: PowerhouseEdge[],
  targets: OutputFormat[],
  provenance: PowerhouseSceneGraph['provenance'],
): PowerhouseSceneGraph {
  return {
    schema: 'gsvw-render.v1',
    artifactClass,
    title,
    description: '',
    nodes,
    edges,
    templates: [],
    assets: [],
    config: {
      targets,
      syncTimeout: 30000,
      asyncQueue: targets.some(t => ['pdf', 'pptx', 'png', 'svg', 'mp4', 'mp3', 'webm'].includes(t)),
      providerCascade: ['gemini-flash', 'claude-sonnet'],
      storageBucket: 'codex-exports',
    },
    provenance,
  };
}
