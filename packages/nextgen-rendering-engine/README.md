# NextGen Rendering Engine Integration Package

This package defines the top-level architecture boundary for a future GestaltView rendering engine. It is intentionally documentation-first: the first deliverable is a stable integration surface that can coordinate native GPU engines, web renderers, document/diagram exporters, and automation agents without copying upstream source wholesale.

## Goals

- Establish a neutral engine boundary that can host rendering capabilities from multiple source projects through adapters.
- Keep native, web, document, and automation concerns separated until their licenses, build systems, and runtime assumptions are reviewed.
- Define stable interfaces before implementation so future packages can integrate incrementally.
- Preserve source projects as references rather than vendored dependencies during the initial phase.
- Support GestaltView orchestration workflows where context, modality, rendering, export, and automation agents cooperate through explicit contracts.

## Architecture Boundary

`nextgen-rendering-engine/` is the integration layer, not a wholesale fork of any upstream engine. Code added here should use adapters, facades, or reference documentation to bridge external projects into a common engine model.

Initial boundaries:

- **References stay external:** source projects remain in their existing folders and are mapped in [`docs/source-map.md`](docs/source-map.md).
- **Interfaces come first:** engine components communicate through stable contracts listed below.
- **Adapters isolate risk:** each adapter owns compatibility with one upstream project, runtime, or export target.
- **No implicit build coupling:** native, web, and document renderers should not assume a shared build pipeline until a dedicated integration plan exists.

## Stable Interfaces

| Interface | Responsibility | Boundary |
| --- | --- | --- |
| `SceneGraph` | Owns canonical scene objects, transforms, relationships, cameras, materials, lights, metadata, and semantic annotations. | Does not depend on any one renderer or asset format. |
| `RenderBackend` | Executes draw or render work against a concrete runtime such as Vulkan, WebGL/WebGPU, Canvas, SVG, DOM, or a server-side document renderer. | Receives prepared frame/scene data through adapters. |
| `AssetPipeline` | Imports, normalizes, validates, caches, and versions geometry, textures, shaders, fonts, markdown, diagrams, video, and document assets. | Converts external assets into engine-level resources without leaking source-specific assumptions. |
| `FrameGraph` | Describes render passes, dependencies, resources, scheduling, post-processing, and export capture points. | Coordinates work across backends without exposing backend internals. |
| `ExportTarget` | Produces final outputs such as images, video frames, PDFs, HTML snapshots, diagrams, resumes, charts, or structured documents. | Uses backend outputs and document adapters through explicit export profiles. |
| `ModalityAdapter` | Bridges input/output modes including 3D scenes, 2D diagrams, markdown, video, charts, documents, UI flows, and agent context. | Translates modality-specific semantics into `SceneGraph`, `AssetPipeline`, or `ExportTarget` contracts. |
| `AutomationAgent` | Coordinates scripted rendering, batch export, validation, inspection, context persistence, and orchestration workflows. | Operates through public interfaces and avoids direct ownership of renderer internals. |

## Module Map

Recommended package modules once implementation begins:

```text
nextgen-rendering-engine/
├── README.md
├── docs/
│   └── source-map.md
├── interfaces/          # Stable interface definitions and schemas.
├── adapters/            # Thin adapters for native, web, document, and GestaltView references.
├── pipelines/           # Asset and frame-graph orchestration implementations.
├── backends/            # Backend facades; concrete engines remain isolated.
├── exporters/           # ExportTarget implementations for images, video, docs, diagrams, and reports.
└── agents/              # AutomationAgent workflows and validation hooks.
```

## Integration Principles

1. Do not copy source wholesale during the initial integration phase.
2. Treat existing projects as references until license, dependency, and build-system boundaries are documented.
3. Add adapters only when an interface contract is stable enough to keep the integration reversible.
4. Prefer small compatibility layers over changing upstream project layouts.
5. Document every source-to-role mapping before implementing runtime coupling.

## Implemented Runtime

The package now includes a working TypeScript integration layer for GestaltView's high-end multi-modal renderer. It intentionally starts as a safe orchestration and facade engine rather than a monolithic fork of the source codebases.

Implemented modules:

- `src/core/types.ts` defines the canonical scene graph, render job, backend, artifact, diagnostic, and capability contracts.
- `src/core/validation.ts` validates scene graph identity, node and edge types, required export targets, and required source/data fields for Markdown, diagrams, and charts.
- `src/adapters/native.ts` creates a native render-core facade inspired by AnKi, Vulkan Renderer, Hybrid Rendering Engine, and Unreal Sky Atmosphere.
- `src/adapters/web.ts` creates a web render shell for PixiJS, React Three Fiber, and html-video style browser/timeline rendering.
- `src/adapters/document.ts` creates an HTML document renderer for Markdown, chart, DOM snapshot, and document composition nodes.
- `src/adapters/diagram.ts` exports Mermaid-compatible source and deterministic SVG placeholders for diagram nodes.
- `src/adapters/orchestration.ts` provides `GestaltRenderEngine`, which validates a graph, selects compatible backends, runs them, and writes a combined render manifest.
- `src/cli/index.ts` exposes a `gestalt-render` CLI with `inspect` and `render` commands.

## Quickstart

```bash
cd nextgen-rendering-engine
npm run build
node dist/cli/index.js inspect
node dist/cli/index.js render examples/mixed-content.scene.json out/demo
```

The sample scene in `examples/mixed-content.scene.json` demonstrates a GestaltView export that composes Markdown, Mermaid diagrams, Chart.js-style data, a web preview snapshot, a native 3D scene, and a sky/atmosphere node through one scene graph.
