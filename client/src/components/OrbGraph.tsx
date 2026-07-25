import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { InsightOrbModel, OrbType } from "./InsightOrb";

type GraphNode = InsightOrbModel & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
};

type GraphViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OrbGraphProps = {
  orbs: InsightOrbModel[];
  selectedOrbId?: string | null;
  linkMode?: boolean;
  onSelectOrb: (orb: InsightOrbModel) => void;
  onLinkOrbs: (sourceId: string, targetId: string) => void;
};

const TYPE_COLORS: Record<OrbType, string> = {
  memory: "var(--gv-aurora-cyan)",
  connection: "var(--gv-aurora-indigo)",
  insight: "var(--gv-aurora-emerald)",
  pattern: "var(--gv-primary)",
  skill: "var(--gv-aurora-amber)",
  emotion: "var(--gv-aurora-rose)",
};

const LEGEND_ITEMS: { type: OrbType; label: string }[] = [
  { type: "memory", label: "memory" },
  { type: "connection", label: "connection" },
  { type: "insight", label: "insight" },
  { type: "pattern", label: "pattern" },
  { type: "skill", label: "skill" },
  { type: "emotion", label: "emotion" },
];

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 700;
const MIN_VIEW_WIDTH = 380;
const MIN_VIEW_HEIGHT = 280;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createDefaultViewport(): GraphViewport {
  return { x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT };
}

function clampViewport(viewport: GraphViewport): GraphViewport {
  const width = clamp(viewport.width, MIN_VIEW_WIDTH, SVG_WIDTH);
  const height = clamp(viewport.height, MIN_VIEW_HEIGHT, SVG_HEIGHT);
  const maxX = Math.max(0, SVG_WIDTH - width);
  const maxY = Math.max(0, SVG_HEIGHT - height);

  return {
    x: clamp(viewport.x, 0, maxX),
    y: clamp(viewport.y, 0, maxY),
    width,
    height,
  };
}

function buildCenteredViewport(centerX: number, centerY: number, width: number, height: number): GraphViewport {
  return clampViewport({
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  });
}

function buildFitViewport(nodes: GraphNode[]): GraphViewport {
  if (nodes.length === 0) {
    return createDefaultViewport();
  }

  const padding = 88;
  const minX = Math.min(...nodes.map((node) => node.x)) - padding;
  const maxX = Math.max(...nodes.map((node) => node.x)) + padding;
  const minY = Math.min(...nodes.map((node) => node.y)) - padding;
  const maxY = Math.max(...nodes.map((node) => node.y)) + padding;
  const width = clamp(maxX - minX, MIN_VIEW_WIDTH, SVG_WIDTH);
  const height = clamp(maxY - minY, MIN_VIEW_HEIGHT, SVG_HEIGHT);

  return buildCenteredViewport((minX + maxX) / 2, (minY + maxY) / 2, width, height);
}

function randomizeNode(node: InsightOrbModel, index: number): GraphNode {
  const angle = (index / Math.max(1, 8)) * Math.PI * 2;
  const radius = 130 + (index % 5) * 34;
  return {
    ...node,
    x: SVG_WIDTH / 2 + Math.cos(angle) * radius,
    y: SVG_HEIGHT / 2 + Math.sin(angle) * radius,
    vx: 0,
    vy: 0,
    fx: null,
    fy: null,
  };
}

function nodeRadius(type: OrbType): number {
  switch (type) {
    case "memory":
      return 18;
    case "connection":
      return 14;
    case "insight":
      return 20;
    case "pattern":
      return 22;
    case "skill":
      return 16;
    case "emotion":
      return 18;
    default:
      return 16;
  }
}

export default function OrbGraph({ orbs, selectedOrbId, linkMode = false, onSelectOrb, onLinkOrbs }: OrbGraphProps) {
  const reducedMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showConnections, setShowConnections] = useState(() => orbs.length <= 15);
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(() => orbs.map(randomizeNode));
  const [viewport, setViewport] = useState<GraphViewport>(() => createDefaultViewport());
  const connectionsPreferenceLockedRef = useRef(false);

  useEffect(() => {
    setNodes(orbs.map(randomizeNode));
    setPendingLinkId(null);
    setDraggingId(null);
    setViewport(createDefaultViewport());
  }, [orbs]);

  useEffect(() => {
    if (!connectionsPreferenceLockedRef.current) {
      setShowConnections(orbs.length <= 15);
    }
  }, [orbs.length]);

  useEffect(() => {
    if (!linkMode) {
      setPendingLinkId(null);
    }
  }, [linkMode]);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(32, now - previous);
      previous = now;

      setNodes((current) => {
        if (current.length === 0) {
          return current;
        }

        const next = current.map((node) => ({ ...node }));

        for (let i = 0; i < next.length; i += 1) {
          const node = next[i];

          for (let j = i + 1; j < next.length; j += 1) {
            const other = next[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distanceSq = Math.max(900, dx * dx + dy * dy);
            const force = 3200 / distanceSq;
            const nx = dx * force;
            const ny = dy * force;
            node.vx += nx * 0.5;
            node.vy += ny * 0.5;
            other.vx -= nx * 0.5;
            other.vy -= ny * 0.5;
          }

          const centerX = SVG_WIDTH / 2;
          const centerY = SVG_HEIGHT / 2;
          node.vx += (centerX - node.x) * 0.0014;
          node.vy += (centerY - node.y) * 0.0014;
          node.vx *= 0.94;
          node.vy *= 0.94;

          if (node.id === draggingId && pointerPosition) {
            node.x = pointerPosition.x;
            node.y = pointerPosition.y;
            node.vx = 0;
            node.vy = 0;
          } else if (node.fx !== null && node.fy !== null) {
            node.x = node.fx;
            node.y = node.fy;
            node.vx = 0;
            node.vy = 0;
          } else {
            node.x += node.vx * (delta / 16);
            node.y += node.vy * (delta / 16);
          }

          node.x = Math.min(SVG_WIDTH - 40, Math.max(40, node.x));
          node.y = Math.min(SVG_HEIGHT - 40, Math.max(40, node.y));
        }

        return next;
      });

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [draggingId, pointerPosition, reducedMotion]);

  const links = useMemo(() => {
    const lookup = new Map(nodes.map((node) => [node.id, node]));
    const pairs = new Map<string, { source: GraphNode; target: GraphNode }>();

    for (const node of nodes) {
      for (const targetId of node.linkedTo ?? []) {
        const target = lookup.get(targetId);
        if (!target) {
          continue;
        }
        const key = [node.id, targetId].sort().join("::");
        if (!pairs.has(key)) {
          pairs.set(key, { source: node, target });
        }
      }
    }

    return Array.from(pairs.values());
  }, [nodes]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedOrbId) ?? null,
    [nodes, selectedOrbId],
  );

  const pointerToSvgPoint = (event: ReactPointerEvent<SVGSVGElement | SVGGElement>): { x: number; y: number } | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) {
      return null;
    }

    return {
      x: viewport.x + ((event.clientX - rect.left) / rect.width) * viewport.width,
      y: viewport.y + ((event.clientY - rect.top) / rect.height) * viewport.height,
    };
  };

  const handleNodePointerDown = (event: ReactPointerEvent<SVGGElement>, node: GraphNode) => {
    event.stopPropagation();

    if (linkMode || event.shiftKey) {
      if (pendingLinkId && pendingLinkId !== node.id) {
        onLinkOrbs(pendingLinkId, node.id);
        setPendingLinkId(null);
        toast.success(`Linked ${node.title} to the source orb.`);
      } else {
        setPendingLinkId(node.id);
        toast.message("Source selected. Now tap another orb to connect it.");
      }
      onSelectOrb(node);
      return;
    }

    setDraggingId(node.id);
    setPointerPosition(pointerToSvgPoint(event) ?? { x: node.x, y: node.y });
    onSelectOrb(node);
  };

  const handleToggleConnections = () => {
    connectionsPreferenceLockedRef.current = true;
    setShowConnections((current) => !current);
  };

  const handleZoomToFit = () => {
    setViewport(buildFitViewport(nodes));
    toast.message("Graph zoomed to fit the visible orbs.");
  };

  const handleCenterSelected = () => {
    if (!selectedNode) {
      toast.message("Pick an orb first, then center it.");
      return;
    }

    setViewport(buildCenteredViewport(selectedNode.x, selectedNode.y, 520, 364));
    toast.message(`Centered ${selectedNode.title}.`);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gv-bg-deep/82 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <svg
        ref={svgRef}
        viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
        className="h-[680px] w-full touch-none"
        onPointerMove={(event) => {
          if (!draggingId) {
            return;
          }
          const point = pointerToSvgPoint(event);
          if (point) {
            setPointerPosition(point);
          }
        }}
        onPointerUp={() => {
          setDraggingId(null);
          setPointerPosition(null);
        }}
        onPointerLeave={() => {
          setDraggingId(null);
          setPointerPosition(null);
        }}
      >
        <defs>
          <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.35">
          {showConnections
            ? links.map((link) => (
                <line
                  key={`${link.source.id}-${link.target.id}`}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth={1.4}
                  strokeDasharray="6 8"
                  pointerEvents="none"
                />
              ))
            : null}
        </g>

          {nodes.map((node) => {
          const radius = nodeRadius(node.type);
          const selected = node.id === selectedOrbId;
          const pending = node.id === pendingLinkId;
          const hitRadius = Math.max(radius + 18, 30);

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              className="cursor-pointer"
            >
              <circle r={hitRadius} fill="transparent" pointerEvents="all" />
              <circle
                r={radius + (selected ? 8 : 5)}
                fill={TYPE_COLORS[node.type]}
                opacity={selected ? 0.28 : pending ? 0.22 : 0.14}
                filter="url(#orbGlow)"
                className={selected ? "motion-safe:animate-pulse" : ""}
              />
              <circle
                r={radius}
                fill={TYPE_COLORS[node.type]}
                opacity={selected ? 0.92 : 0.78}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={selected ? 2 : 1}
              />
              <text
                y={radius + 18}
                textAnchor="middle"
                fill="rgba(248,250,252,0.88)"
                fontSize="11"
                fontWeight="600"
              >
                {node.title}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <div className="max-w-xl rounded-[1.1rem] border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-gv-text-secondary backdrop-blur-md">
          {linkMode
            ? pendingLinkId
              ? "Source selected. Tap another orb to connect it."
              : "Link mode is on. Tap an orb to select the source."
            : <>Hold <span className="text-gv-text-primary">shift</span> and click two orbs to link them.</>}
        </div>
        <div className="pointer-events-auto">
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleToggleConnections}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-gv-text-primary backdrop-blur-md"
              >
                {showConnections ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showConnections ? "Hide connections" : "Show connections"}
              </button>
              <button
                type="button"
                onClick={handleZoomToFit}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-gv-text-primary backdrop-blur-md"
              >
                Zoom to fit
              </button>
              <button
                type="button"
                onClick={handleCenterSelected}
                disabled={!selectedNode}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-gv-text-primary backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-40"
              >
                Center selected
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowLegend((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-gv-text-primary backdrop-blur-md"
            >
              {showLegend ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              Legend
            </button>
          </div>
        </div>
      </div>

      {showLegend ? (
        <div className="absolute bottom-4 left-4 rounded-[1.1rem] border border-white/10 bg-black/40 p-3 backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gv-text-muted">Color key</p>
          <div className="mt-3 grid gap-2 text-sm text-gv-text-secondary">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: TYPE_COLORS[item.type] }}
                />
                <span className="capitalize">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
