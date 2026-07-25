import React, { useMemo } from "react";
import type { RenderProps } from "../types";
import { buildGraphModel, layoutGraphNodes } from "../graph/graphModel";

export function GraphRenderer({ artifact, height }: RenderProps) {
  const title = artifact.title ?? "Artifact graph";
  const layout = useMemo(() => layoutGraphNodes(buildGraphModel(artifact.content)), [artifact.content]);
  const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));

  return (
    <section
      className="gv-renderer gv-renderer--graph overflow-hidden rounded-2xl border border-white/10 bg-slate-950/72 shadow-[0_24px_90px_rgba(2,6,23,0.35)]"
      style={{ height }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/62">Artifact graph</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <span className="rounded-full border border-cyan-100/15 bg-cyan-100/10 px-3 py-2 text-xs text-cyan-50/72">
          {layout.nodes.length} nodes / {layout.edges.length} edges
        </span>
      </div>

      <div className="overflow-auto">
        <svg role="img" aria-label={`${title} graph`} width={layout.width} height={layout.height} className="block min-h-[320px]">
          <defs>
            <marker id="gv-graph-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="rgba(103,232,249,0.68)" />
            </marker>
            <linearGradient id="gv-graph-node" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
              <stop offset="100%" stopColor="rgba(244,114,182,0.16)" />
            </linearGradient>
          </defs>
          {layout.edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;
            const startX = source.x + 180;
            const startY = source.y + 32;
            const endX = target.x;
            const endY = target.y + 32;
            const midX = startX + Math.max(48, (endX - startX) / 2);

            return (
              <g key={edge.id}>
                <path
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX - 10} ${endY}`}
                  fill="none"
                  stroke="rgba(103,232,249,0.45)"
                  strokeWidth="2"
                  markerEnd="url(#gv-graph-arrow)"
                />
                {edge.label ? (
                  <text x={(startX + endX) / 2} y={(startY + endY) / 2 - 10} fill="rgba(224,242,254,0.72)" fontSize="11">
                    {edge.label}
                  </text>
                ) : null}
              </g>
            );
          })}
          {layout.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect width="180" height="64" rx="14" fill="url(#gv-graph-node)" stroke="rgba(255,255,255,0.16)" />
              <text x="16" y="28" fill="white" fontSize="14" fontWeight="600">
                {node.label.slice(0, 24)}
              </text>
              <text x="16" y="48" fill="rgba(203,213,225,0.68)" fontSize="10">
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

