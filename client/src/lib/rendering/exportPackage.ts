import type { GestaltSceneGraph, GestaltRenderDiagnostic } from './sceneGraph';
import { validateGestaltSceneGraph } from './sceneGraph';

export interface BrowserRenderPackage {
  ok: boolean;
  graph: GestaltSceneGraph;
  diagnostics: GestaltRenderDiagnostic[];
  manifest: {
    engine: 'gestaltview-browser-render-surface';
    generatedAt: string;
    graphId: string;
    nodeCount: number;
    edgeCount: number;
  };
}

export function buildBrowserRenderPackage(graph: GestaltSceneGraph): BrowserRenderPackage {
  const diagnostics = validateGestaltSceneGraph(graph);
  return {
    ok: diagnostics.every(item => item.severity !== 'fatal'),
    graph,
    diagnostics,
    manifest: {
      engine: 'gestaltview-browser-render-surface',
      generatedAt: new Date().toISOString(),
      graphId: graph.graphId,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
    },
  };
}

export function downloadRenderPackage(graph: GestaltSceneGraph, filename = `${graph.graphId}.render-package.json`) {
  const payload = buildBrowserRenderPackage(graph);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
