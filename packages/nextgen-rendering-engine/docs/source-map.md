# Source Map

This document maps existing repository sources to their intended roles in the `nextgen-rendering-engine/` integration boundary. These projects are references for architecture and adapters; they should not be copied wholesale into the integration package during the initial phase.

## Integration Policy

- Use source projects as references and adapter targets.
- Keep each source project's license, build system, dependency graph, and runtime assumptions isolated until reviewed.
- Stabilize `SceneGraph`, `RenderBackend`, `AssetPipeline`, `FrameGraph`, `ExportTarget`, `ModalityAdapter`, and `AutomationAgent` contracts before moving implementation code into this package.
- Prefer reference notes, adapter interfaces, and compatibility tests over vendoring or large source imports.

## Source-to-Role Map

| Source path | Role | Integration boundary |
| --- | --- | --- |
| `anki-3d-engine-master/anki-3d-engine-master` | Native GPU/render-core reference. | Study renderer architecture, resource lifetime, GPU abstractions, scene submission, and frame scheduling for future `RenderBackend` and `FrameGraph` adapters. |
| `vulkan-renderer-main/vulkan-renderer-main` | Native GPU/render-core reference. | Use as a Vulkan-oriented reference for command submission, swapchain handling, render passes, and low-level backend isolation. |
| `HybridRenderingEngine-master/HybridRenderingEngine-master` | Clustered/PBR shading reference. | Reference clustered lighting, physically based shading, material models, and shading pipeline organization for `FrameGraph` and material portions of `SceneGraph`. |
| `UnrealEngineSkyAtmosphere-master/UnrealEngineSkyAtmosphere-master` | Atmosphere/sky reference. | Reference sky, aerial perspective, atmosphere LUTs, and environmental rendering concepts behind optional atmosphere modules. |
| `pixijs-dev/pixijs-dev` | Web/rendering front-end reference. | Reference high-performance 2D/WebGL rendering patterns for browser-facing `RenderBackend` adapters and UI composition. |
| `react-three-fiber-master/react-three-fiber-master` | Web/rendering front-end reference. | Reference React declarative scene orchestration and component-driven scene bindings for `SceneGraph` and `ModalityAdapter` layers. |
| `html-video-main/html-video-main` | Web/rendering front-end reference. | Reference timeline, HTML/video composition, web media capture, and browser-native render/export workflows. |
| `mermaid-develop/mermaid-develop` | Structured/document/diagram/export renderer. | Reference diagram parsing and rendering for diagram-oriented `ModalityAdapter` and `ExportTarget` implementations. |
| `xyflow-main/xyflow-main` | Structured/document/diagram/export renderer. | Reference node-edge graph interaction and flow rendering for structured graph modalities. |
| `ChartjsNodeCanvas-master/ChartjsNodeCanvas-master` | Structured/document/diagram/export renderer. | Reference server-side chart rendering and image export patterns. |
| `dom-to-image-master/dom-to-image-master` | Structured/document/diagram/export renderer. | Reference DOM capture and rasterization patterns for browser export targets. |
| `markdown-preview-enhanced-master/markdown-preview-enhanced-master` | Structured/document/diagram/export renderer. | Reference markdown preview, document enrichment, and preview/export orchestration. |
| `vue-markdown-renderer-main/vue-markdown-renderer-main` | Structured/document/diagram/export renderer. | Reference Vue-based markdown rendering and document componentization. |
| `rendercv-main/rendercv-main` | Structured/document/diagram/export renderer. | Reference resume/document rendering, templated exports, and structured content-to-output pipelines. |
| `skills/gestaltview-gen-engine-rendering-comprehensive` | GestaltView orchestration/context reference. | Reference existing rendering-generation context, orchestration documents, validation expectations, and integration vocabulary. |
| `skills/gestaltview-codex` | GestaltView orchestration/context reference. | Reference Codex workflow expectations, context handling, and agent-facing operating rules when present; in the current repository snapshot, the checked GestaltView Codex skill is available at `skills/gestaltview-gen-engine-rendering-comprehensive/.agents/skills/gestaltview-codex`. |

## Interface Alignment

### `SceneGraph`

Canonical scene and semantic structure. Native render-core, clustered shading, React scene bindings, diagrams, markdown documents, and generated exports should translate into or out of this model through modality adapters.

### `RenderBackend`

Concrete render execution boundary. Backends may target Vulkan/native GPU, browser WebGL/WebGPU/canvas, DOM capture, server-side chart rendering, or document renderers.

### `AssetPipeline`

Shared import and normalization layer for meshes, materials, shaders, media, markdown, diagrams, fonts, templates, and document data.

### `FrameGraph`

Render-pass dependency and scheduling layer. Native renderers and clustered/PBR references inform this contract, but browser and document exporters can also use it to define staged rendering and capture points.

### `ExportTarget`

Final output boundary for images, video, diagrams, PDFs, HTML snapshots, charts, resumes, and structured documents.

### `ModalityAdapter`

Translation layer for 3D scenes, 2D diagrams, node graphs, markdown, charts, video, UI captures, and GestaltView context artifacts.

### `AutomationAgent`

Orchestration layer for batch rendering, validation, context-aware generation, test capture, and export workflows. Agents should call stable interfaces rather than reaching into backend internals.

## Initial Non-Goals

- No wholesale source copying into `nextgen-rendering-engine/`.
- No shared monolithic build across native, web, and document-rendering references.
- No direct dependency on upstream internals without an adapter and documented boundary.
- No license-sensitive redistribution decisions until each source has been reviewed.
