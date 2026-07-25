import React, { useMemo } from 'react';
import type { GestaltSceneGraph, GestaltSceneNode } from '../../lib/rendering/sceneGraph';
import { orderContainedNodes, validateGestaltSceneGraph } from '../../lib/rendering/sceneGraph';
import { downloadRenderPackage } from '../../lib/rendering/exportPackage';

export interface GestaltRenderSurfaceProps {
  graph: GestaltSceneGraph;
  className?: string;
  showToolbar?: boolean;
  rootId?: string;
  onPromoteToCreationCorner?: (graph: GestaltSceneGraph) => void;
}

export function GestaltRenderSurface({ graph, className = '', showToolbar = true, rootId, onPromoteToCreationCorner }: GestaltRenderSurfaceProps) {
  const diagnostics = useMemo(() => validateGestaltSceneGraph(graph), [graph]);
  const nodes = useMemo(() => orderContainedNodes(graph, rootId), [graph, rootId]);
  const ok = diagnostics.every(item => item.severity !== 'fatal');

  return (
    <section className={`gv-render-surface ${className}`} aria-label="GestaltView rendering surface">
      <style>{styles}</style>
      {showToolbar && (
        <header className="gv-render-toolbar">
          <div>
            <p className="gv-render-kicker">NextGen Rendering Engine</p>
            <h2>{String(graph.metadata?.title ?? graph.graphId)}</h2>
            <p className="gv-render-subtitle">Scene graph preview · {graph.nodes.length} nodes · {graph.edges.length} edges · {ok ? 'valid' : 'needs attention'}</p>
          </div>
          <div className="gv-render-actions">
            {onPromoteToCreationCorner && <button type="button" onClick={() => onPromoteToCreationCorner(graph)}>Promote to Creation Corner</button>}
            <button type="button" onClick={() => downloadRenderPackage(graph)}>Download render package</button>
          </div>
        </header>
      )}

      {diagnostics.length > 0 && (
        <div className="gv-render-diagnostics">
          {diagnostics.map(item => <p key={`${item.code}-${item.message}`}><strong>{item.code}</strong>: {item.message}</p>)}
        </div>
      )}

      <div className="gv-render-grid">
        {nodes.map(node => <RenderNodeCard key={node.id} node={node} />)}
      </div>
    </section>
  );
}

function RenderNodeCard({ node }: { node: GestaltSceneNode }) {
  const title = node.name ?? node.id;
  if (node.type === 'Markdown') return <article className="gv-render-card markdown"><NodeMeta node={node} /><pre>{String(node.props.source ?? node.props.assetRef ?? '')}</pre></article>;
  if (node.type === 'Diagram') return <article className="gv-render-card diagram"><NodeMeta node={node} /><div className="gv-diagram-box"><pre>{String(node.props.source ?? '')}</pre></div></article>;
  if (node.type === 'Chart') return <article className="gv-render-card chart"><NodeMeta node={node} /><h3>{title}</h3><pre>{JSON.stringify(node.props.data ?? {}, null, 2)}</pre></article>;
  if (node.type === 'DOMSnapshot') return <article className="gv-render-card dom"><NodeMeta node={node} /><div className="gv-dom-preview" dangerouslySetInnerHTML={{ __html: String(node.props.html ?? '') }} /></article>;
  if (node.type === 'Scene3D' || node.type === 'Atmosphere' || node.type === 'Mesh' || node.type === 'Camera' || node.type === 'Light' || node.type === 'Material') {
    return <article className="gv-render-card native"><NodeMeta node={node} /><h3>{title}</h3><p>Native/web-canvas handoff node. Rendered as a deterministic preview card until a concrete Babylon/R3F/Pixi/native backend is wired.</p><pre>{JSON.stringify(node.props, null, 2)}</pre></article>;
  }
  if (node.type === 'Document') return <article className="gv-render-card document"><NodeMeta node={node} /><h3>{title}</h3><p>{String(node.props.title ?? node.props.format ?? 'Document composition')}</p></article>;
  return <article className="gv-render-card"><NodeMeta node={node} /><h3>{title}</h3><pre>{JSON.stringify(node.props, null, 2)}</pre></article>;
}

function NodeMeta({ node }: { node: GestaltSceneNode }) {
  return <p className="gv-node-meta">{node.type} · {node.id}</p>;
}

const styles = `
.gv-render-surface{border:1px solid rgba(155,220,255,.26);border-radius:24px;padding:20px;background:linear-gradient(135deg,rgba(10,14,24,.92),rgba(13,22,40,.82));box-shadow:0 0 32px rgba(80,190,255,.12);color:#ecfbff;}
.gv-render-toolbar{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;border-bottom:1px solid rgba(155,220,255,.18);padding-bottom:16px;margin-bottom:16px;}
.gv-render-kicker,.gv-node-meta{letter-spacing:.12em;text-transform:uppercase;font-size:11px;color:#96e6ff;margin:0 0 6px;}
.gv-render-toolbar h2{margin:0;font-size:24px;}
.gv-render-subtitle{margin:6px 0 0;color:#b7cad4;}
.gv-render-actions{display:flex;flex-wrap:wrap;gap:8px;}
.gv-render-actions button{border:1px solid rgba(150,230,255,.35);border-radius:999px;background:rgba(255,255,255,.06);color:#ecfbff;padding:9px 13px;cursor:pointer;}
.gv-render-diagnostics{border:1px solid rgba(255,200,120,.35);border-radius:16px;background:rgba(255,170,60,.08);padding:12px;margin-bottom:16px;}
.gv-render-diagnostics p{margin:4px 0;}
.gv-render-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;}
.gv-render-card{border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;background:rgba(255,255,255,.055);min-height:120px;overflow:hidden;}
.gv-render-card h3{margin:0 0 10px;font-size:18px;}
.gv-render-card pre{white-space:pre-wrap;word-break:break-word;max-height:280px;overflow:auto;padding:12px;border-radius:12px;background:rgba(0,0,0,.24);color:#d8f7ff;}
.gv-diagram-box{border-radius:16px;padding:12px;background:linear-gradient(135deg,rgba(87,47,155,.22),rgba(33,180,210,.12));}
.gv-dom-preview{border:1px dashed rgba(150,230,255,.35);border-radius:14px;padding:12px;background:rgba(255,255,255,.08);}
.native{background:radial-gradient(circle at top left,rgba(140,70,255,.18),rgba(255,255,255,.045));}
`;

export default GestaltRenderSurface;
