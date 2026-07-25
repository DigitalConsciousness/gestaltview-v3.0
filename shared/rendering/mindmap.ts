import { Renderer, RenderedArtifact } from './types';

// Define a simple mind map data structure.  Nodes have a label and an
// optional array of children.  More advanced mind maps could include
// metadata such as shape, color or links.
export interface MindMapNode {
  label: string;
  children?: MindMapNode[];
}

type MindMapEdge = {
  from: string;
  to: string;
  label?: string;
};

type MindMapBodyLike = {
  summary?: string;
  nodes?: Array<{
    id: string;
    label: string;
    parentId?: string;
  }>;
  edges?: MindMapEdge[];
};

type MindMapArtifactLike = {
  body?: MindMapBodyLike;
};

export type MindMapInput = MindMapNode | MindMapBodyLike | MindMapArtifactLike;

/**
 * ReactFlowNode / ReactFlowEdge shapes expected by the front‑end
 * React Flow component.  Export them so the client can import the types
 * without adding a react-flow peer dependency to the shared package.
 */
export type ReactFlowNode = {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
};

export type ReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type ReactFlowGraph = {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
};

function sanitizeMermaidLabel(value: string): string {
  const normalized = value
    .replace(/[\r\n]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[\[\]{}()<>`|;:#\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "Untitled";
}

/**
 * MindMapRenderer converts a node tree into:
 *  - html   : self-contained Mermaid.js CDN page (live rendered diagram)
 *  - mermaid: raw Mermaid mindmap syntax
 *  - json   : raw JSON of the input
 *  - react-flow: { nodes, edges } JSON ready for React Flow
 */
export class MindMapRenderer implements Renderer<MindMapInput> {
  public readonly kind = 'mindmap';

  public formats(): string[] {
    return ['html', 'mermaid', 'json', 'react-flow'];
  }

  public async render(input: MindMapInput, format: string): Promise<RenderedArtifact> {
    if (format === 'json') {
      return { format: 'json', data: JSON.stringify(input, null, 2) };
    }

    if (format === 'mermaid') {
      return { format: 'mermaid', data: this.buildMermaid(input) };
    }

    if (format === 'react-flow') {
      const graph = this.buildReactFlowGraph(input);
      return { format: 'json', data: JSON.stringify(graph, null, 2) };
    }

    if (format === 'html') {
      const mermaidSyntax = this.buildMermaid(input);
      return {
        format: 'html',
        data: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mind Map</title>
  <style>
    body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f0f11; font-family: system-ui, sans-serif; }
    .mermaid { max-width: 100%; }
    .mermaid svg { width: 100%; height: auto; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      mindmap: { padding: 20 }
    });
  </script>
</head>
<body>
  <div class="mermaid">
${mermaidSyntax}
  </div>
</body>
</html>`,
      };
    }

    throw new Error(`MindMapRenderer does not support format: ${format}`);
  }

  // ─── Mermaid builder ───────────────────────────────────────────────────────

  private buildMermaid(input: MindMapInput): string {
    const body = 'body' in input ? input.body : input;

    if (body && 'nodes' in body && Array.isArray(body.nodes) && body.nodes.length > 0) {
      const lines = ['mindmap'];
      const rootNodes = body.nodes.filter((node) => !node.parentId);
      const root = rootNodes[0] ?? body.nodes[0];
      lines.push(`  root((${sanitizeMermaidLabel(root.label)}))`);
      const seen = new Set([root.id]);
      for (const node of rootNodes) {
        if (node.id !== root.id) {
          lines.push(`    ${sanitizeMermaidLabel(node.label)}`);
          seen.add(node.id);
        }
        this.serializeGraphChildren(node.id, body, 2, lines, seen);
      }
      return lines.join('\n');
    }

    const lines: string[] = ['mindmap'];
    const node = 'body' in input ? undefined : (input as MindMapNode);
    if (node) {
      lines.push(`  root((${sanitizeMermaidLabel(node.label)}))`);
      for (const child of node.children ?? []) {
        this.serializeNode(child, 2, lines);
      }
    }
    return lines.join('\n');
  }

  private serializeGraphChildren(
    nodeId: string,
    input: MindMapBodyLike,
    depth: number,
    lines: string[],
    seen: Set<string>,
  ): void {
    const children = input.nodes?.filter((candidate) => candidate.parentId === nodeId) ?? [];
    for (const child of children) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      lines.push(`${'  '.repeat(depth)}${sanitizeMermaidLabel(child.label)}`);
      this.serializeGraphChildren(child.id, input, depth + 1, lines, seen);
    }
  }

  private serializeNode(node: MindMapNode, indent: number, lines: string[]): void {
    const indentStr = '  '.repeat(indent);
    lines.push(`${indentStr}${sanitizeMermaidLabel(node.label)}`);
    if (node.children) {
      for (const child of node.children) {
        this.serializeNode(child, indent + 1, lines);
      }
    }
  }

  // ─── React Flow graph builder ──────────────────────────────────────────────

  private buildReactFlowGraph(input: MindMapInput): ReactFlowGraph {
    const rfNodes: ReactFlowNode[] = [];
    const rfEdges: ReactFlowEdge[] = [];

    const body = 'body' in input ? input.body : undefined;
    const bodyLike = body ?? ('nodes' in input ? (input as MindMapBodyLike) : undefined);

    if (bodyLike?.nodes?.length) {
      const COLUMN_WIDTH = 220;
      const ROW_HEIGHT = 80;
      const levelCounters: Record<number, number> = {};

      for (const node of bodyLike.nodes) {
        const level = this.getNodeDepth(node.id, bodyLike);
        levelCounters[level] = (levelCounters[level] ?? 0) + 1;
        rfNodes.push({
          id: node.id,
          data: { label: node.label },
          position: { x: level * COLUMN_WIDTH, y: (levelCounters[level] - 1) * ROW_HEIGHT },
        });
        if (node.parentId) {
          rfEdges.push({
            id: `${node.parentId}->${node.id}`,
            source: node.parentId,
            target: node.id,
          });
        }
      }

      for (const edge of bodyLike.edges ?? []) {
        rfEdges.push({ id: `${edge.from}->${edge.to}`, source: edge.from, target: edge.to, label: edge.label });
      }

      return { nodes: rfNodes, edges: rfEdges };
    }

    // Fallback: recursive MindMapNode tree
    const treeNode = 'body' in input ? undefined : (input as MindMapNode);
    if (treeNode) {
      let counter = 0;
      const walk = (n: MindMapNode, parentId: string | null, depth: number) => {
        const id = `node-${counter++}`;
        rfNodes.push({ id, data: { label: n.label }, position: { x: depth * 220, y: counter * 80 } });
        if (parentId) rfEdges.push({ id: `${parentId}->${id}`, source: parentId, target: id });
        for (const child of n.children ?? []) {
          walk(child, id, depth + 1);
        }
      };
      walk(treeNode, null, 0);
    }

    return { nodes: rfNodes, edges: rfEdges };
  }

  private getNodeDepth(nodeId: string, body: MindMapBodyLike): number {
    let depth = 0;
    let current = body.nodes?.find((n) => n.id === nodeId);
    while (current?.parentId) {
      depth++;
      current = body.nodes?.find((n) => n.id === current!.parentId);
    }
    return depth;
  }
}
