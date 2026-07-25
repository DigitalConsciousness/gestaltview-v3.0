import type { GestaltSceneGraph } from './sceneGraph';

export const mixedContentSceneGraph: GestaltSceneGraph = {
  schema: 'nextgen.scene-graph.v1',
  graphId: 'gestaltview_mixed_content_runtime_demo',
  metadata: {
    room: 'DynamicInnerWorld',
    purpose: 'safe local preview of multimodal artifacts before export',
  },
  nodes: [
    { id: 'export_main', type: 'ExportRequest', name: 'Runtime preview export', props: { roots: ['doc_main'], targets: [{ format: 'html', uri: 'out/runtime-preview.html' }, { format: 'json', uri: 'out/runtime-preview.json' }] } },
    { id: 'doc_main', type: 'Document', name: 'GestaltView render packet', props: { format: 'interactive-report', title: 'NextGen Render Surface' } },
    { id: 'intro', type: 'Markdown', name: 'Rendered note', props: { source: '# Render Engine Preview\n\nThis scene graph can hold Markdown, diagrams, charts, DOM snapshots, video tracks, and native/GPU handoff plans without flattening them into one blob.' } },
    { id: 'pipeline', type: 'Diagram', name: 'Pipeline', props: { diagramType: 'mermaid', source: 'flowchart LR\n  Blackboard --> DynamicInnerWorld\n  DynamicInnerWorld --> ExternalScaffold\n  ExternalScaffold --> CreationCorner\n  CreationCorner --> ExportManifest' } },
    { id: 'readiness', type: 'Chart', name: 'Backend readiness', props: { chartType: 'bar', library: 'chart.js', data: { labels: ['Document', 'Diagram', 'Web', 'Native'], datasets: [{ label: 'Readiness', data: [92, 88, 80, 64] }] } } },
    { id: 'world_shell', type: 'Scene3D', name: 'Dynamic Inner World shell', props: { coordinateSystem: 'right-handed-y-up', units: 'meters', renderSettings: { pbr: true, atmosphericShell: true } } },
    { id: 'atmosphere', type: 'Atmosphere', name: 'Aurora/fog atmosphere handoff', props: { model: 'aurora-fog-shell', sunDirection: [0.2, 0.8, 0.4] } },
    { id: 'preview_dom', type: 'DOMSnapshot', name: 'HTML preview', props: { html: '<div data-gestalt-render="preview">Museum-like artifact surface</div>', viewport: { width: 1440, height: 900 } } },
  ],
  edges: [
    { id: 'e1', type: 'contains', from: 'export_main', to: 'doc_main', props: { order: 0 } },
    { id: 'e2', type: 'contains', from: 'doc_main', to: 'intro', props: { order: 1 } },
    { id: 'e3', type: 'contains', from: 'doc_main', to: 'pipeline', props: { order: 2 } },
    { id: 'e4', type: 'contains', from: 'doc_main', to: 'readiness', props: { order: 3 } },
    { id: 'e5', type: 'contains', from: 'doc_main', to: 'preview_dom', props: { order: 4 } },
    { id: 'e6', type: 'contains', from: 'world_shell', to: 'atmosphere', props: {} },
    { id: 'e7', type: 'composes', from: 'doc_main', to: 'world_shell', props: { zIndex: 0 } },
  ],
};
