export type MindMapNodeKind = "root" | "heading" | "bullet" | "text";

export type MindMapNode = {
  id: string;
  title: string;
  depth: number;
  parentId: string | null;
  kind: MindMapNodeKind;
};

export type MindMapModel = {
  root: MindMapNode;
  nodes: MindMapNode[];
};

export type MindMapLayoutNode = MindMapNode & {
  x: number;
  y: number;
};

type ParsedLine = {
  title: string;
  depth: number;
  kind: MindMapNodeKind;
};

function stripMarkdown(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .trim();
}

function parseLine(rawLine: string): ParsedLine | null {
  const line = rawLine.replace(/\t/g, "  ");
  const trimmed = line.trim();

  if (!trimmed || /^```/.test(trimmed)) {
    return null;
  }

  const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (heading) {
    return {
      title: stripMarkdown(heading[2]),
      depth: heading[1].length - 1,
      kind: heading[1].length === 1 ? "root" : "heading",
    };
  }

  const bullet = line.match(/^(\s*)(?:[-*+]\s+|\d+\.\s+)(.+)$/);
  if (bullet) {
      return {
      title: stripMarkdown(bullet[2]),
      depth: Math.floor(bullet[1].length / 2) + 2,
      kind: "bullet",
    };
  }

  return {
    title: stripMarkdown(trimmed),
    depth: 1,
    kind: "text",
  };
}

function createNode(index: number, line: ParsedLine, parentId: string | null): MindMapNode {
  return {
    id: `node-${index}`,
    title: line.title || "Untitled",
    depth: line.depth,
    parentId,
    kind: line.kind,
  };
}

function nearestParent(depthStack: Map<number, MindMapNode>, depth: number, root: MindMapNode): MindMapNode {
  for (let candidateDepth = depth - 1; candidateDepth >= 0; candidateDepth -= 1) {
    const parent = depthStack.get(candidateDepth);
    if (parent) {
      return parent;
    }
  }

  return root;
}

export function buildMindMapModel(source: string): MindMapModel {
  const parsedLines = source.split(/\r?\n/).map(parseLine).filter((line): line is ParsedLine => Boolean(line));
  const firstRootIndex = parsedLines.findIndex((line) => line.kind === "root");
  const nodes: MindMapNode[] = [];
  const depthStack = new Map<number, MindMapNode>();

  if (firstRootIndex >= 0) {
    const rootLine = parsedLines[firstRootIndex];
    const root = createNode(0, { ...rootLine, depth: 0, kind: "root" }, null);
    nodes.push(root);
    depthStack.set(0, root);

    parsedLines.forEach((line, parsedIndex) => {
      if (parsedIndex === firstRootIndex) {
        return;
      }

      const depth = Math.max(1, line.depth);
      const parent = nearestParent(depthStack, depth, root);
      const node = createNode(nodes.length, { ...line, depth }, parent.id);
      nodes.push(node);
      depthStack.set(depth, node);
      Array.from(depthStack.keys()).filter((key) => key > depth).forEach((key) => depthStack.delete(key));
    });

    return { root, nodes };
  }

  const root = createNode(0, { title: "Mind Map", depth: 0, kind: "root" }, null);
  nodes.push(root);
  depthStack.set(0, root);

  parsedLines.forEach((line) => {
    const depth = Math.max(1, line.depth);
    const parent = nearestParent(depthStack, depth, root);
    const node = createNode(nodes.length, { ...line, depth }, parent.id);
    nodes.push(node);
    depthStack.set(depth, node);
    Array.from(depthStack.keys()).filter((key) => key > depth).forEach((key) => depthStack.delete(key));
  });

  return { root, nodes };
}

export function layoutMindMapNodes(nodes: MindMapNode[]): MindMapLayoutNode[] {
  const depthCounts = new Map<number, number>();

  return nodes.map((node) => {
    const siblingIndex = depthCounts.get(node.depth) ?? 0;
    depthCounts.set(node.depth, siblingIndex + 1);

    return {
      ...node,
      x: 80 + node.depth * 220,
      y: 120 + siblingIndex * 104,
    };
  });
}
