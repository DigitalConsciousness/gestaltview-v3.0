import { EnhancedMarkdownRenderer } from "@/lib/rendering/markdown/EnhancedMarkdownRenderer";
import HtmlArtifactRenderer from "@/lib/rendering/renderers/HtmlArtifactRenderer";
import {
  classifyInnerWorldArtifactView,
  type InnerWorldArtifactRecord,
} from "@/lib/innerWorldFiles";
import { cn } from "@/lib/utils";

type ArtifactViewSurfaceProps = {
  artifact: InnerWorldArtifactRecord;
  minHeight?: number;
  className?: string;
};

type SceneGraphRecord = {
  graphId?: string;
  nodes?: Array<{ id?: string; name?: string; type?: string; props?: Record<string, unknown> }>;
  edges?: Array<{ id?: string; from?: string; to?: string; type?: string }>;
};

function renderSceneGraph(graph: SceneGraphRecord) {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph.edges) ? graph.edges : [];

  return (
    <section className="flex h-full flex-col gap-4 rounded-[1.35rem] border border-cyan-200/12 bg-slate-950/80 p-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/62">Scene graph</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{graph.graphId ?? "GestaltView scene graph"}</h3>
        </div>
        <div className="rounded-full border border-cyan-100/15 bg-cyan-100/10 px-3 py-1 text-xs text-cyan-50/75">
          {nodes.length} nodes / {edges.length} edges
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {nodes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/58">
            No graph nodes were present in this artifact.
          </div>
        ) : (
          nodes.slice(0, 8).map((node) => (
            <article key={node.id ?? node.name ?? "node"} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-white">{node.name ?? node.id ?? "Untitled node"}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/55">{node.type ?? "Node"}</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-white/60">
                {JSON.stringify(node.props ?? {}, null, 2)}
              </pre>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function ArtifactViewSurface({ artifact, minHeight = 420, className }: ArtifactViewSurfaceProps) {
  const view = classifyInnerWorldArtifactView(artifact);

  if (view.kind === "html") {
    return (
      <HtmlArtifactRenderer
        title={artifact.title}
        html={view.rawSource}
        retrievalMode="persistent"
        minHeight={minHeight}
        autoResize={false}
        chrome={false}
        className={cn("w-full", className)}
      />
    );
  }

  if (view.kind === "markdown") {
    return (
      <EnhancedMarkdownRenderer
        content={view.rawSource}
        maxHeight={minHeight}
        className={cn("h-full", className)}
      />
    );
  }

  if (view.kind === "json_scene_graph") {
    return (
      <div className={cn("overflow-auto", className)} style={{ minHeight }}>
        {renderSceneGraph((view.parsedJson ?? {}) as SceneGraphRecord)}
      </div>
    );
  }

  if (view.kind === "image" && view.mediaSrc) {
    return (
      <div className={cn("flex items-center justify-center rounded-[1.35rem] border border-white/10 bg-black/35 p-4", className)} style={{ minHeight }}>
        <img src={view.mediaSrc} alt={artifact.title} className="max-h-full max-w-full rounded-2xl object-contain" />
      </div>
    );
  }

  if (view.kind === "audio" && view.mediaSrc) {
    return (
      <div className={cn("flex items-center rounded-[1.35rem] border border-white/10 bg-black/35 p-6", className)} style={{ minHeight }}>
        <audio controls src={view.mediaSrc} className="w-full" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-[1.35rem] border border-amber-200/16 bg-black/35 p-4 text-white", className)} style={{ minHeight }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-100/68">Raw source</p>
      <p className="mt-2 text-sm leading-6 text-white/58">
        This artifact was preserved, but it does not yet advertise a primary render contract. The raw source stays inspectable here.
      </p>
      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-white">Open raw</summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-white/62">
          {view.rawSource}
        </pre>
      </details>
    </div>
  );
}
