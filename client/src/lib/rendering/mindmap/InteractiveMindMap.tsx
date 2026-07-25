import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Focus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildMindMapModel, layoutMindMapNodes, type MindMapLayoutNode } from "./mindMapModel";

type InteractiveMindMapProps = {
  title: string;
  content: string;
  maxHeight?: number;
};

function descendantsFor(nodeId: string, nodes: MindMapLayoutNode[]): string[] {
  const children = nodes.filter((node) => node.parentId === nodeId);
  return children.flatMap((child) => [child.id, ...descendantsFor(child.id, nodes)]);
}

function isHidden(node: MindMapLayoutNode, collapsedIds: Set<string>, nodes: MindMapLayoutNode[]): boolean {
  let parentId = node.parentId;

  while (parentId) {
    if (collapsedIds.has(parentId)) {
      return true;
    }
    parentId = nodes.find((candidate) => candidate.id === parentId)?.parentId ?? null;
  }

  return false;
}

function nodeTone(node: MindMapLayoutNode, focused: boolean): string {
  if (focused) {
    return "border-cyan-200 bg-cyan-200/18 text-white shadow-[0_0_32px_rgba(103,232,249,0.28)]";
  }

  if (node.kind === "root") {
    return "border-fuchsia-200/50 bg-fuchsia-200/14 text-white";
  }

  if (node.kind === "heading") {
    return "border-cyan-200/35 bg-cyan-200/12 text-cyan-50";
  }

  return "border-white/12 bg-white/[0.055] text-slate-100";
}

export function InteractiveMindMap({ title, content, maxHeight }: InteractiveMindMapProps) {
  const model = useMemo(() => buildMindMapModel(content), [content]);
  const layoutNodes = useMemo(() => layoutMindMapNodes(model.nodes), [model.nodes]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  const [focusedId, setFocusedId] = useState(model.root.id);
  const visibleNodes = layoutNodes.filter((node) => !isHidden(node, collapsedIds, layoutNodes));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const edges = visibleNodes
    .filter((node) => node.parentId && visibleIds.has(node.parentId))
    .map((node) => ({
      child: node,
      parent: visibleNodes.find((candidate) => candidate.id === node.parentId)!,
    }));
  const width = Math.max(820, Math.max(...layoutNodes.map((node) => node.x)) + 260);
  const height = Math.max(440, Math.max(...visibleNodes.map((node) => node.y)) + 120);

  const toggleCollapse = (nodeId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const focusNode = (nodeId: string) => {
    setFocusedId(nodeId);
  };

  return (
    <section
      className="gv-renderer gv-renderer--mindmap overflow-hidden rounded-2xl border border-white/10 bg-slate-950/72 shadow-[0_24px_90px_rgba(2,6,23,0.35)]"
      style={{ maxHeight, overflowY: maxHeight ? "auto" : undefined }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/62">Interactive mind map</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCollapsedIds(new Set());
              setFocusedId(model.root.id);
            }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-cyan-50/78 transition hover:bg-white/[0.08]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <span className="rounded-full border border-cyan-100/15 bg-cyan-100/10 px-3 py-2 text-xs text-cyan-50/72">
            {visibleNodes.length}/{layoutNodes.length} visible
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="overflow-auto">
          <svg role="img" aria-label={`${title} interactive mind map`} width={width} height={height} className="block min-h-[440px]">
            <defs>
              <linearGradient id="mindmap-edge" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="rgba(103,232,249,0.28)" />
                <stop offset="100%" stopColor="rgba(244,114,182,0.42)" />
              </linearGradient>
            </defs>
            {edges.map(({ child, parent }) => (
              <path
                key={`${parent.id}-${child.id}`}
                d={`M ${parent.x + 190} ${parent.y + 28} C ${parent.x + 250} ${parent.y + 28}, ${child.x - 60} ${child.y + 28}, ${child.x} ${child.y + 28}`}
                fill="none"
                stroke="url(#mindmap-edge)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            {visibleNodes.map((node) => {
              const childCount = layoutNodes.filter((candidate) => candidate.parentId === node.id).length;
              const focused = node.id === focusedId;

              return (
                <foreignObject key={node.id} x={node.x} y={node.y} width="220" height="72">
                  <div
                    onDoubleClick={() => childCount > 0 && toggleCollapse(node.id)}
                    className={cn(
                      "flex h-[64px] w-[210px] items-start justify-between gap-2 rounded-xl border px-3 py-2 text-sm leading-tight transition",
                      nodeTone(node, focused),
                    )}
                  >
                    <button type="button" onClick={() => focusNode(node.id)} className="min-w-0 flex-1 text-left">
                      <span className="line-clamp-2">{node.title}</span>
                    </button>
                    {childCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleCollapse(node.id)}
                        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20"
                        aria-label={`${collapsedIds.has(node.id) ? "Expand" : "Collapse"} ${node.title}`}
                      >
                        {collapsedIds.has(node.id) ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    ) : null}
                  </div>
                </foreignObject>
              );
            })}
          </svg>
        </div>

        <aside className="border-t border-white/10 bg-black/18 p-4 lg:border-l lg:border-t-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/56">Focus</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-cyan-50">
              <Focus className="h-4 w-4" />
              <h3 className="text-sm font-semibold">{layoutNodes.find((node) => node.id === focusedId)?.title ?? model.root.title}</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300/78">
              Click a node to focus it. Use the small arrow control, or double-click a parent node, to collapse or expand branches.
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {layoutNodes.slice(0, 12).map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setFocusedId(node.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-xs transition",
                  focusedId === node.id ? "border-cyan-200/40 bg-cyan-200/12 text-white" : "border-white/8 bg-white/[0.03] text-slate-300/74 hover:bg-white/[0.06]",
                )}
              >
                {"  ".repeat(node.depth)}{node.title}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
