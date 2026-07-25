# Scene Graph Contract

## Purpose

The scene graph is the interchange contract for the next-generation rendering engine. It represents visual, document, media, and agent-produced content as a typed directed graph that can be serialized, inspected, validated, transformed, and exported across heterogeneous render backends.

The contract is JSON-first. JSON is the canonical wire format and persistence target for graph documents. TypeScript, Python, and C++ bindings should be generated or maintained as later language-specific projections of the same schema rather than as independent sources of truth.

## Contract principles

- **Typed nodes and edges:** every node and edge carries an explicit `type` selected from the enumerations below.
- **Stable identity:** every node has a graph-local `id`; asset references use URLs, content-addressed URIs, or repository-relative paths in typed properties.
- **Backend neutrality:** the graph describes intent and dependencies, not a single renderer implementation.
- **Capability-aware rendering:** a backend may render native nodes directly, delegate unsupported nodes to resolvers, or substitute placeholders according to the backend requirements in this document.
- **Deterministic export:** `ExportRequest` nodes name the requested targets, ordering, layout, and resolution policy for a full export.

## Serialization target

### Canonical format

The canonical serialization target is JSON:

```json
{
  "schema": "nextgen.scene-graph.v1",
  "graphId": "graph_demo_export",
  "nodes": [],
  "edges": []
}
```

Rules:

1. `schema` MUST identify the scene graph schema version.
2. `graphId` MUST be stable for the serialized graph revision.
3. `nodes` MUST be an array of typed node objects.
4. `edges` MUST be an array of typed edge objects.
5. Unknown top-level fields SHOULD be ignored by readers and preserved by lossless tools.
6. Bindings for TypeScript, Python, and C++ MUST treat JSON as the source of truth and MUST preserve unknown extension fields when possible.

### Node shape

```json
{
  "id": "node_id",
  "type": "Markdown",
  "name": "Human readable label",
  "props": {},
  "metadata": {}
}
```

Required fields:

- `id`: unique string within the graph.
- `type`: one of the node types in this contract.
- `props`: node-type-specific data. Use `{}` when no properties are required.

Optional fields:

- `name`: display label for authoring tools and diagnostics.
- `metadata`: non-rendering annotations such as provenance, timestamps, authorship, tags, and validation notes.

### Edge shape

```json
{
  "id": "edge_id",
  "type": "contains",
  "from": "source_node_id",
  "to": "target_node_id",
  "props": {}
}
```

Required fields:

- `id`: unique string within the graph.
- `type`: one of the edge types in this contract.
- `from`: source node id.
- `to`: target node id.
- `props`: edge-type-specific data. Use `{}` when no properties are required.

## Node types

| Type | Purpose | Required `props` | Common optional `props` |
| --- | --- | --- | --- |
| `Scene3D` | Root or sub-scene for native 3D content. | `coordinateSystem`, `units` | `background`, `environment`, `renderSettings` |
| `Mesh` | Renderable geometry instance. | `geometry` | `transform`, `bounds`, `materialSlot`, `lod` |
| `Material` | Surface or volume appearance definition. | `model` | `textures`, `parameters`, `shaderRef` |
| `Light` | Illumination source. | `lightType`, `intensity` | `color`, `transform`, `range`, `shadow` |
| `Camera` | View definition. | `projection` | `transform`, `fov`, `near`, `far`, `viewport` |
| `Atmosphere` | Sky, fog, volumetric, or environment scattering model. | `model` | `sunDirection`, `density`, `turbidity`, `assetRef` |
| `Document` | Ordered document or composition container. | `format` | `title`, `layout`, `pageSize`, `styles` |
| `Markdown` | Markdown source content or a reference to markdown content. | one of `source` or `assetRef` | `flavor`, `frontmatter`, `sanitization` |
| `Diagram` | Declarative or raster/vector diagram. | `diagramType` and one of `source` or `assetRef` | `theme`, `layout`, `renderer` |
| `Chart` | Data visualization specification. | `chartType`, `data` | `options`, `library`, `fallbackImage` |
| `DOMSnapshot` | Captured DOM tree, HTML fragment, or browser-rendered snapshot. | one of `html`, `snapshotRef`, or `assetRef` | `css`, `viewport`, `deviceScaleFactor` |
| `VideoTrack` | Timeline media track or encoded video source. | `source` | `startTime`, `duration`, `fps`, `audio`, `alpha` |
| `AgentArtifact` | Asset or content produced by an agent. | `artifactType`, `uri` | `producer`, `promptRef`, `hash`, `license` |
| `ExportRequest` | Export job definition that selects graph roots and output targets. | `targets`, `roots` | `resolutionPolicy`, `outputs`, `quality`, `layout` |

## Edge types

| Type | Meaning | Typical source | Typical target | Required `props` | Common optional `props` |
| --- | --- | --- | --- | --- | --- |
| `contains` | Source structurally owns or orders target. | `Document`, `Scene3D`, `ExportRequest` | any node | none | `order`, `slot`, `layoutRegion` |
| `referencesAsset` | Source depends on external asset data. | any node | `AgentArtifact` or asset proxy node | none | `usage`, `mimeType`, `required` |
| `rendersTo` | Source renders into target output, buffer, snapshot, or export request. | renderable node | `DOMSnapshot`, `VideoTrack`, `ExportRequest`, `AgentArtifact` | none | `pass`, `format`, `resolution` |
| `derivedFrom` | Source was produced from target. | any node | any node | none | `transform`, `timestamp`, `tool` |
| `controls` | Source influences target behavior or parameters. | `Camera`, `Light`, `ExportRequest`, UI/control artifact | renderable node | none | `channel`, `binding`, `priority` |
| `annotates` | Source adds explanatory or semantic context to target. | `Markdown`, `Diagram`, `AgentArtifact` | any node | none | `range`, `anchor`, `semanticRole` |
| `composes` | Source visually or temporally combines targets without ownership. | `Document`, `DOMSnapshot`, `VideoTrack`, `ExportRequest` | any node | none | `blendMode`, `zIndex`, `timeRange` |

## Backend requirements for unsupported nodes

Backends MUST advertise a capability manifest before accepting an `ExportRequest`. The manifest SHOULD list supported node types, edge types, media formats, maximum dimensions, and resolver plugins.

When a backend encounters an unsupported node, it MUST follow this resolution sequence:

1. **Native support:** render the node directly when the node type and required properties are supported.
2. **Resolver lookup:** find a registered resolver for the unsupported node type or declared `props.renderer` / `props.library` value.
3. **Delegated rendering:** call the resolver with the JSON node, inbound dependency context, outbound edge context, and requested export target. The resolver MUST return either a supported replacement node, a rendered asset node, or a structured error.
4. **Fallback asset:** if the node declares `fallbackImage`, `assetRef`, `snapshotRef`, or another explicit fallback, use that fallback and record a warning in export diagnostics.
5. **Placeholder:** if the export policy allows placeholders, emit a deterministic placeholder node or raster with the node id, node type, and failure reason.
6. **Hard failure:** if the node is required and cannot be resolved, fail the export with a machine-readable diagnostic that includes `nodeId`, `nodeType`, `edgePath`, `backend`, and `reason`.

Resolution policy is controlled by `ExportRequest.props.resolutionPolicy`:

```json
{
  "unsupported": "fail | placeholder | warn-and-continue",
  "missingAssets": "fail | placeholder | warn-and-continue",
  "preserveDiagnostics": true
}
```

Backend implementations MUST NOT silently drop unsupported required nodes. They MAY drop optional nodes only when an inbound edge or node property marks the dependency as optional and diagnostics are preserved.

## Minimal mixed-content export example

The following JSON combines a Markdown document, Mermaid diagram, Chart.js chart, Pixi / React Three Fiber canvas snapshot, and native 3D render placeholder into one export request.

```json
{
  "schema": "nextgen.scene-graph.v1",
  "graphId": "graph_mixed_content_export_minimal",
  "nodes": [
    {
      "id": "export_main",
      "type": "ExportRequest",
      "name": "Mixed content PDF and PNG export",
      "props": {
        "roots": ["doc_report"],
        "targets": [
          { "format": "pdf", "uri": "out/mixed-content.pdf" },
          { "format": "png", "uri": "out/mixed-content.png", "width": 1600, "height": 1200 }
        ],
        "resolutionPolicy": {
          "unsupported": "placeholder",
          "missingAssets": "fail",
          "preserveDiagnostics": true
        }
      }
    },
    {
      "id": "doc_report",
      "type": "Document",
      "name": "Rendering engine demo report",
      "props": {
        "format": "paged-document",
        "title": "Nextgen Rendering Engine Demo",
        "layout": "vertical-stack"
      }
    },
    {
      "id": "md_intro",
      "type": "Markdown",
      "name": "Intro copy",
      "props": {
        "flavor": "commonmark-gfm",
        "source": "# Rendering Demo\n\nThis export composes Markdown, Mermaid, Chart.js, web canvas, and native 3D content."
      }
    },
    {
      "id": "diagram_pipeline",
      "type": "Diagram",
      "name": "Mermaid pipeline",
      "props": {
        "diagramType": "mermaid",
        "renderer": "mermaid",
        "source": "flowchart LR\n  MD[Markdown] --> DOC[Document]\n  CHART[Chart.js] --> DOC\n  R3F[Pixi / React Three Fiber Canvas] --> DOC\n  NATIVE[Native 3D Placeholder] --> DOC\n  DOC --> EXPORT[ExportRequest]"
      }
    },
    {
      "id": "chart_metrics",
      "type": "Chart",
      "name": "Chart.js render timings",
      "props": {
        "library": "chart.js",
        "chartType": "bar",
        "data": {
          "labels": ["Markdown", "Mermaid", "Chart.js", "Canvas", "Native 3D"],
          "datasets": [
            {
              "label": "Render ms",
              "data": [12, 34, 28, 45, 60]
            }
          ]
        },
        "options": {
          "responsive": false,
          "plugins": { "legend": { "display": true } }
        }
      }
    },
    {
      "id": "dom_canvas_snapshot",
      "type": "DOMSnapshot",
      "name": "Pixi and React Three Fiber canvas capture",
      "props": {
        "html": "<div id=\"stage\"><canvas data-engine=\"pixi\"></canvas><canvas data-engine=\"react-three-fiber\"></canvas></div>",
        "css": "#stage { width: 800px; height: 400px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } canvas { background: #111827; border-radius: 12px; }",
        "viewport": { "width": 800, "height": 400 },
        "deviceScaleFactor": 2
      }
    },
    {
      "id": "scene_native_placeholder",
      "type": "Scene3D",
      "name": "Native 3D render placeholder",
      "props": {
        "coordinateSystem": "right-handed-y-up",
        "units": "meters",
        "renderSettings": {
          "mode": "placeholder-until-native-backend",
          "width": 800,
          "height": 450
        }
      }
    },
    {
      "id": "camera_main",
      "type": "Camera",
      "name": "Main camera",
      "props": {
        "projection": "perspective",
        "fov": 55,
        "near": 0.1,
        "far": 1000,
        "transform": {
          "position": [0, 2, 6],
          "target": [0, 0, 0]
        }
      }
    }
  ],
  "edges": [
    { "id": "e_export_contains_doc", "type": "contains", "from": "export_main", "to": "doc_report", "props": { "order": 0 } },
    { "id": "e_doc_contains_md", "type": "contains", "from": "doc_report", "to": "md_intro", "props": { "order": 0 } },
    { "id": "e_doc_contains_diagram", "type": "contains", "from": "doc_report", "to": "diagram_pipeline", "props": { "order": 1 } },
    { "id": "e_doc_contains_chart", "type": "contains", "from": "doc_report", "to": "chart_metrics", "props": { "order": 2 } },
    { "id": "e_doc_contains_canvas", "type": "contains", "from": "doc_report", "to": "dom_canvas_snapshot", "props": { "order": 3 } },
    { "id": "e_doc_contains_native", "type": "contains", "from": "doc_report", "to": "scene_native_placeholder", "props": { "order": 4 } },
    { "id": "e_camera_controls_scene", "type": "controls", "from": "camera_main", "to": "scene_native_placeholder", "props": { "channel": "view" } },
    { "id": "e_doc_renders_export", "type": "rendersTo", "from": "doc_report", "to": "export_main", "props": { "format": "pdf" } },
    { "id": "e_diagram_annotates_pipeline", "type": "annotates", "from": "diagram_pipeline", "to": "doc_report", "props": { "semanticRole": "pipeline-overview" } },
    { "id": "e_export_composes_chart", "type": "composes", "from": "export_main", "to": "chart_metrics", "props": { "zIndex": 10 } }
  ]
}
```
