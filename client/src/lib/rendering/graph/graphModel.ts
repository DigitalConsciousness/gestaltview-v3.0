export type GraphNode = {
  id: string;
  label: string;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type GraphModel = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphLayoutNode = GraphNode & {
  x: number;
  y: number;
};

export type GraphLayout = {
  nodes: GraphLayoutNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
};

const NODE_WIDTH = 180;
const NODE_HEIGHT = 64;
const COLUMN_GAP = 260;
const ROW_GAP = 112;

export function buildGraphModel(content: string): GraphModel {
  const trimmed = content.trim();
  if (!trimmed) {
    return { nodes: [{ id: "graph", label: "Graph" }], edges: [] };
  }

  const parsed = parseJsonGraph(trimmed);
  if (parsed) return parsed;

  return parseArrowGraph(trimmed);
}

export function layoutGraphNodes(model: GraphModel): GraphLayout {
  const levels = computeLevels(model);
  const grouped = new Map<number, GraphNode[]>();

  model.nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    grouped.set(level, [...(grouped.get(level) ?? []), node]);
  });

  const layoutNodes = model.nodes.map((node) => {
    const level = levels.get(node.id) ?? 0;
    const siblings = grouped.get(level) ?? [];
    const index = Math.max(0, siblings.findIndex((candidate) => candidate.id === node.id));

    return {
      ...node,
      x: 80 + level * COLUMN_GAP,
      y: 100 + index * ROW_GAP,
    };
  });

  const maxX = Math.max(...layoutNodes.map((node) => node.x), 80);
  const maxY = Math.max(...layoutNodes.map((node) => node.y), 100);

  return {
    nodes: layoutNodes,
    edges: model.edges,
    width: maxX + NODE_WIDTH + 120,
    height: maxY + NODE_HEIGHT + 100,
  };
}

function parseJsonGraph(content: string): GraphModel | null {
  try {
    const parsed = JSON.parse(content) as {
      nodes?: Array<{ id?: unknown; label?: unknown }>;
      edges?: Array<{ id?: unknown; source?: unknown; target?: unknown; label?: unknown }>;
    };
    if (!Array.isArray(parsed.nodes)) return null;

    const nodes = parsed.nodes
      .map((node, index) => normalizeNode(node.id, node.label, index))
      .filter((node): node is GraphNode => Boolean(node));
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = Array.isArray(parsed.edges)
      ? parsed.edges
          .map((edge, index) => normalizeEdge(edge.source, edge.target, edge.label, edge.id, index))
          .filter((edge): edge is GraphEdge => Boolean(edge && nodeIds.has(edge.source) && nodeIds.has(edge.target)))
      : [];

    return { nodes, edges };
  } catch {
    return null;
  }
}

function parseArrowGraph(content: string): GraphModel {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^(.+?)\s*(?:->|-->|=>)\s*(.+?)(?:\s*:\s*(.+))?$/);
      if (!match) {
        const node = normalizeNode(undefined, line, nodes.size);
        if (node) nodes.set(node.id, node);
        return;
      }

      const source = ensureNode(nodes, match[1]);
      const target = ensureNode(nodes, match[2]);
      edges.push({
        id: `edge-${edges.length}`,
        source: source.id,
        target: target.id,
        ...(match[3] ? { label: match[3].trim() } : {}),
      });
    });

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
}

function computeLevels(model: GraphModel): Map<string, number> {
  const levels = new Map<string, number>();
  const incoming = new Map<string, number>();

  model.nodes.forEach((node) => incoming.set(node.id, 0));
  model.edges.forEach((edge) => incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1));
  const queue = model.nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0).map((node) => node.id);
  if (queue.length === 0 && model.nodes[0]) queue.push(model.nodes[0].id);

  queue.forEach((id) => levels.set(id, 0));
  while (queue.length > 0) {
    const current = queue.shift()!;
    const nextLevel = (levels.get(current) ?? 0) + 1;
    model.edges
      .filter((edge) => edge.source === current)
      .forEach((edge) => {
        if ((levels.get(edge.target) ?? -1) < nextLevel) {
          levels.set(edge.target, nextLevel);
          queue.push(edge.target);
        }
      });
  }

  model.nodes.forEach((node) => {
    if (!levels.has(node.id)) levels.set(node.id, 0);
  });

  return levels;
}

function ensureNode(nodes: Map<string, GraphNode>, label: string): GraphNode {
  const id = slugifyGraphId(label);
  const existing = nodes.get(id);
  if (existing) return existing;

  const node = { id, label: cleanLabel(label) };
  nodes.set(id, node);
  return node;
}

function normalizeNode(id: unknown, label: unknown, index: number): GraphNode | null {
  const resolvedLabel = cleanLabel(typeof label === "string" && label.trim() ? label : typeof id === "string" ? id : `Node ${index + 1}`);
  const resolvedId = typeof id === "string" && id.trim() ? slugifyGraphId(id) : slugifyGraphId(resolvedLabel);
  return resolvedId ? { id: resolvedId, label: resolvedLabel } : null;
}

function normalizeEdge(source: unknown, target: unknown, label: unknown, id: unknown, index: number): GraphEdge | null {
  if (typeof source !== "string" || typeof target !== "string") return null;
  const normalizedSource = slugifyGraphId(source);
  const normalizedTarget = slugifyGraphId(target);
  if (!normalizedSource || !normalizedTarget) return null;

  return {
    id: typeof id === "string" && id.trim() ? slugifyGraphId(id) : `edge-${index}`,
    source: normalizedSource,
    target: normalizedTarget,
    ...(typeof label === "string" && label.trim() ? { label: label.trim() } : {}),
  };
}

function cleanLabel(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function slugifyGraphId(value: string): string {
  return cleanLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "node";
}

