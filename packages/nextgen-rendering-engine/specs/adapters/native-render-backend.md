# Native Render Backend Adapter Specification

## Scope

Adapter contract for native Vulkan/OpenGL/C++ engines that render real-time or offline 3D scenes through compiled engine runtimes. Candidate integrations include:

- `vulkan-renderer-main/vulkan-renderer-main`
- `anki-3d-engine-master/anki-3d-engine-master`
- `HybridRenderingEngine-master/HybridRenderingEngine-master`

## Required Input Format

Adapters MUST accept a normalized `RenderJob` JSON document:

```json
{
  "jobId": "string",
  "backend": "native-render-backend",
  "scene": {
    "format": "gltf|glb|engine-native|procedural-json",
    "uri": "file:// or workspace-relative path",
    "assetsRoot": "workspace-relative path",
    "camera": { "name": "string", "projection": "perspective|orthographic" },
    "frameRange": { "start": 0, "end": 0, "fps": 60 }
  },
  "render": {
    "width": 1920,
    "height": 1080,
    "samples": 1,
    "api": "vulkan|opengl|auto",
    "mode": "realtime-frame|sequence|headless-benchmark"
  },
  "outputs": {
    "directory": "workspace-relative path",
    "formats": ["png", "exr", "mp4", "json"]
  },
  "metadata": { "requester": "string", "traceId": "string" }
}
```

The adapter MAY extend `scene` with engine-native material, shader, lighting, or pipeline descriptors, but MUST preserve the common fields above for orchestration and cross-backend routing.

## Output Artifacts

The adapter MUST produce:

- Frame images or image sequences in the requested output directory.
- A `render-manifest.json` containing job ID, backend ID, input hash, output file list, timings, resolution, selected graphics API, and adapter version.
- A `diagnostics.json` file containing warnings, recoverable errors, GPU/device information, shader compilation results, and memory usage when available.

The adapter SHOULD produce optional artifacts when supported:

- Encoded video previews.
- GPU timing captures.
- Pipeline cache files.
- Engine logs normalized into UTF-8 text.

## Runtime Dependencies

Required dependencies are backend-specific but MUST be declared by the adapter manifest:

- C++ compiler toolchain compatible with the selected engine.
- CMake for the candidate C++ projects.
- Vulkan SDK and GPU driver for Vulkan paths.
- OpenGL-capable driver and window/headless context provider for OpenGL paths.
- Asset codecs for glTF/GLB, texture formats, shader compilation, and optional video encoding.

Adapters MUST expose a `capabilities` probe that reports available graphics APIs, driver versions, headless support, maximum texture size, and supported output formats before accepting jobs.

## Error Model

Errors MUST be returned as structured JSON with this shape:

```json
{
  "ok": false,
  "code": "NATIVE_BACKEND_ERROR_CODE",
  "message": "human-readable summary",
  "severity": "fatal|retryable|warning",
  "stage": "validate|prepare|compile-shaders|load-assets|render|encode|write-artifacts",
  "details": {},
  "artifacts": ["diagnostics.json"]
}
```

Standard error codes:

- `NATIVE_INPUT_INVALID`
- `NATIVE_ASSET_MISSING`
- `NATIVE_DEPENDENCY_UNAVAILABLE`
- `NATIVE_DEVICE_UNAVAILABLE`
- `NATIVE_SHADER_COMPILE_FAILED`
- `NATIVE_RENDER_FAILED`
- `NATIVE_OUTPUT_WRITE_FAILED`

Fatal errors MUST still write `diagnostics.json` when the output directory is available.

## Cross-Backend Compatibility Contract

The backend MUST:

- Accept the shared `RenderJob` envelope and reject unsupported native extensions without mutating the request.
- Produce `render-manifest.json` and `diagnostics.json` with stable field names.
- Use workspace-relative paths in manifests for portability.
- Preserve deterministic output naming: `{jobId}-{frameNumber}.{extension}` for sequences and `{jobId}.{extension}` for single artifacts.
- Report unsupported capabilities during validation rather than during rendering when possible.
- Map all native engine failures into the shared error shape.

## Candidate Source Directories and Key Package Manifests

- `vulkan-renderer-main/vulkan-renderer-main` — Vulkan-oriented C++ renderer source.
  - `vulkan-renderer-main/vulkan-renderer-main/CMakeLists.txt`
  - `vulkan-renderer-main/vulkan-renderer-main/src/CMakeLists.txt`
  - `vulkan-renderer-main/vulkan-renderer-main/shaders/CMakeLists.txt`
  - `vulkan-renderer-main/vulkan-renderer-main/example-app/CMakeLists.txt`
- `anki-3d-engine-master/anki-3d-engine-master` — C++ 3D engine candidate with tools and third-party runtime sources.
  - `anki-3d-engine-master/anki-3d-engine-master/CMakeLists.txt`
  - `anki-3d-engine-master/anki-3d-engine-master/Tools/CMakeLists.txt`
  - `anki-3d-engine-master/anki-3d-engine-master/Tools/Shader/CMakeLists.txt`
  - `anki-3d-engine-master/anki-3d-engine-master/Tools/GltfImporter/CMakeLists.txt`
- `HybridRenderingEngine-master/HybridRenderingEngine-master` — hybrid native rendering candidate.
  - `HybridRenderingEngine-master/HybridRenderingEngine-master/CMakeLists.txt`
