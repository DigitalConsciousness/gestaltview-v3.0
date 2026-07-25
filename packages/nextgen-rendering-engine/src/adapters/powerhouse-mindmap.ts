/**
 * POWERHOUSE MINDMAP BACKEND
 *
 * Renders mindmap artifacts: Mermaid + React Flow hybrid diagrams.
 * Supports sync HTML preview with interactive React Flow and async PNG/SVG export.
 */

import type { RenderDiagnostic } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';
import { PowerhouseBaseBackend } from './powerhouse-base.js';
import type {
  PowerhouseCapabilityManifest,
  PowerhouseRenderJob,
  PowerhouseRenderResult,
  TargetResult,
} from '../core/types-powerhouse.js';

interface MindMapNode {
  id: string;
  label: string;
  level?: number;
  color?: string;
  icon?: string;
}

interface MindMapEdge {
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layout?: 'hierarchical' | 'radial' | 'network';
  title?: string;
}

export class PowerhouseMindmapBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-mindmap',
    kind: 'mindmap',
    displayName: 'Powerhouse Mindmap Renderer',
    artifactClasses: ['mindmap'],
    supportedNodeTypes: ['MindMap'],
    supportedFormats: ['html', 'svg', 'png'],
    executionMode: 'in-process',
    sourceProjects: ['react-flow', 'mermaid'],
    strengths: ['React Flow interactive diagrams', 'Mermaid syntax support', 'Multiple layouts'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    // Collect mindmap data from nodes
    const mindmapNodes = graph.nodes.filter(n => n.type === 'MindMap');
    if (mindmapNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_MINDMAP_NODES',
          message: 'Mindmap artifact requires at least one MindMap node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No mindmap nodes found')),
      };
    }

    const mindmapData = mindmapNodes[0].props as unknown as MindMapData;

    // Render HTML (sync preview with React Flow)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, mindmapData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.mindmap.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, nodeCount: mindmapData.nodes.length },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('html', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('html', errorMessage));
        diagnostics.push({
          code: 'HTML_RENDER_FAILED',
          message: `HTML rendering failed: ${errorMessage}`,
          severity: 'fatal',
          stage: 'render',
        });
      }
    }

    // SVG export (async - requires Mermaid CLI)
    if (this.wantsTarget(job, 'svg')) {
      try {
        const mermaidSyntax = this.buildMermaidSyntax(mindmapData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.mindmap.mmd`,
          mermaidSyntax,
          'svg',
          { artifactClass: graph.artifactClass, format: 'mermaid' },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('svg', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('svg', errorMessage));
      }
    }

    // PNG export (async - requires Puppeteer)
    if (this.wantsTarget(job, 'png')) {
      targetResults.push(this.unsupportedTarget('png', 'PNG export requires Puppeteer (async path)'));
    }

    const fatal = diagnostics.some(d => d.severity === 'fatal');

    return {
      ok: !fatal,
      jobId: job.jobId,
      artifacts,
      diagnostics,
      manifest: {
        capability: this.capability,
        artifactClass: graph.artifactClass,
        nodeCount: mindmapData.nodes.length,
        edgeCount: mindmapData.edges.length,
        targetCount: targetResults.length,
      },
      powerhouseArtifacts: artifacts.map(a => ({
        ...a,
        artifactClass: graph.artifactClass,
        provenance: graph.provenance,
      })),
      targetResults,
    };
  }

  private renderToHtml(title: string, data: MindMapData): string {
    const escapedTitle = this.escapeHtml(title);
    const nodesJson = JSON.stringify(data.nodes, null, 2);
    const edgesJson = JSON.stringify(data.edges, null, 2);
    const layout = data.layout || 'hierarchical';

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@xyflow/react@12/dist/umd/index.min.js"></script>
  <style>
    :root {
      --gv-bg: #0f0f11;
      --gv-surface: #1a1a1e;
      --gv-border: #2e2e38;
      --gv-text: #e2e8f0;
      --gv-accent: #818cf8;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
    }
    h1 {
      color: var(--gv-accent);
      padding: 1rem 2rem;
      margin: 0;
      border-bottom: 2px solid var(--gv-border);
    }
    #root {
      width: 100vw;
      height: calc(100vh - 80px);
    }
    .react-flow__node {
      background: var(--gv-surface);
      border: 2px solid var(--gv-border);
      border-radius: 8px;
      padding: 1rem;
      color: var(--gv-text);
    }
    .react-flow__edge-path {
      stroke: var(--gv-accent);
      stroke-width: 2;
    }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div id="root"></div>
  <script type="module">
    const { ReactFlow, Background, Controls, MiniMap } = ReactFlow;
    
    const nodes = ${nodesJson}.map((node, idx) => ({
      id: node.id,
      position: this.calculatePosition(node, idx, ${JSON.stringify(layout)}),
      data: { label: node.label },
      style: {
        background: node.color || 'var(--gv-surface)',
        borderColor: node.color || 'var(--gv-border)',
      },
    }));
    
    const edges = ${edgesJson}.map((edge, idx) => ({
      id: \`e-\${idx}\`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
    }));
    
    function App() {
      return React.createElement(ReactFlow, {
        nodes,
        edges,
        fitView: true,
      },
        React.createElement(Background, { color: '#2e2e38', gap: 16 }),
        React.createElement(Controls),
        React.createElement(MiniMap)
      );
    }
    
    function calculatePosition(node, idx, layout) {
      if (layout === 'radial') {
        const angle = (idx / ${data.nodes.length}) * 2 * Math.PI;
        const radius = 200;
        return {
          x: Math.cos(angle) * radius + 400,
          y: Math.sin(angle) * radius + 300,
        };
      }
      // hierarchical layout
      const level = node.level || 0;
      const siblings = ${data.nodes.length};
      return {
        x: (idx % 3) * 250 + 100,
        y: level * 150 + 100,
      };
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
  }

  private buildMermaidSyntax(data: MindMapData): string {
    const lines: string[] = ['graph TD'];
    
    for (const node of data.nodes) {
      lines.push(`    ${node.id}["${node.label}"]`);
    }
    
    for (const edge of data.edges) {
      const label = edge.label ? `|${edge.label}|` : '';
      lines.push(`    ${edge.source} -->${label} ${edge.target}`);
    }
    
    return lines.join('\n');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
