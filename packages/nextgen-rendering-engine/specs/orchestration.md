# Nextgen Rendering Engine Orchestration

## Purpose

The nextgen rendering engine should use a small controller process to coordinate rendering work across multiple backend implementations. The controller owns job intake, backend selection, artifact routing, and user-facing commands, while backend adapters own the details of invoking a specific renderer or export pipeline.

This design keeps the first milestone focused on integration and orchestration rather than replacing every upstream renderer or forcing every dependency to build in one monolithic tree.

## Controller Process

The controller process is the stable entry point for tools, scripts, and future CLI commands. It should:

1. Accept a render, export, or inspection request.
2. Parse input scene files and command options into a normalized job description.
3. Select a backend adapter based on the requested target, available runtimes, platform capabilities, and explicit user configuration.
4. Dispatch the job to the selected backend.
5. Track job status, logs, diagnostics, and output artifact locations.
6. Return structured results to the caller, including success or failure metadata.

The controller should not embed every renderer directly. Instead, it should maintain a small adapter interface so new backends can be added without changing the CLI contract or scene file workflow.

## Backend Adapter Model

Each backend adapter should expose a consistent contract to the controller:

- **Capabilities:** supported targets, formats, feature flags, runtime requirements, and platform constraints.
- **Inputs:** scene JSON, asset paths, render options, export options, and environment metadata.
- **Execution:** the mode used to run the backend and any process, worker, or service lifecycle details.
- **Outputs:** artifact manifest, logs, diagnostics, and structured result metadata.
- **Errors:** recoverable validation issues, runtime failures, unsupported features, and backend-specific diagnostics.

Adapters should be thin integration layers. They translate the controller's normalized job into the backend's native invocation format, then translate backend results back into the controller's artifact and status model.

## Backend Execution Modes

The orchestration layer should support the following execution modes.

### In-Process JS/TS

Use an in-process JavaScript or TypeScript backend when the renderer can run safely inside the controller runtime. This mode is useful for lightweight scene inspection, HTML export, SVG generation, JSON transforms, validation, and pure JS renderers.

Benefits:

- Fast startup.
- Simple data sharing through function calls and structured objects.
- Easy integration with Node-based tooling.

Constraints:

- Renderer crashes or memory leaks can affect the controller process.
- CPU-heavy work may block the controller unless moved to worker threads or a separate process.
- Native dependencies still need explicit runtime checks.

### Python Subprocess

Use a Python subprocess when a backend depends on Python libraries, scripts, or existing research tooling. The controller launches a Python entry point, sends a structured job payload, and reads structured output plus logs.

Benefits:

- Reuses existing Python rendering, conversion, and ML-assisted pipelines.
- Keeps Python dependencies isolated from the controller runtime.
- Allows per-backend virtual environments or tool-managed environments.

Constraints:

- Requires interpreter discovery and dependency validation.
- Startup overhead is higher than in-process execution.
- Artifact paths and error reporting must be explicit to avoid brittle stdout parsing.

### Native Executable

Use a native executable mode when the backend is delivered as a compiled binary, command-line renderer, or upstream application with a stable CLI.

Benefits:

- Strong isolation from controller failures.
- Good fit for high-performance renderers and platform-specific engines.
- Allows prebuilt binaries without vendoring source trees.

Constraints:

- Requires executable discovery, version checks, and platform compatibility checks.
- Process management must handle timeouts, exit codes, stderr, and partial artifacts.
- File-based exchange is usually preferable to large inline payloads.

### Browser Worker

Use a browser worker mode when the backend needs browser APIs, WebGL, WebGPU, DOM-related rendering, OffscreenCanvas, or web-only dependencies.

Benefits:

- Matches browser rendering semantics.
- Isolates expensive work from the UI thread.
- Supports web-native preview and export paths.

Constraints:

- Requires a browser host, worker lifecycle management, and feature detection.
- Large binary artifacts may need Blob, File System Access, or streaming handoff.
- Browser security rules constrain filesystem and network access.

### Remote/Service Mode

Use a remote or service mode when rendering is delegated to a local daemon, container, cloud service, queue worker, or hosted rendering API.

Benefits:

- Scales heavy rendering outside the controller process.
- Allows specialized machines, GPUs, and sandboxed environments.
- Decouples local CLI installation from complex backend dependencies.

Constraints:

- Requires authentication, service discovery, retries, and network failure handling.
- Job status and artifact retention policies must be explicit.
- The controller should provide deterministic local errors when the service is unavailable.

## Artifact Exchange

Backends may exchange data with the controller through files, structured JSON messages, or a combination of both.

### File-Based Exchange

File-based exchange should be the default for large assets and generated outputs. The controller can create a job workspace with predictable subdirectories such as:

- `input/` for normalized scene JSON and copied or referenced assets.
- `work/` for backend scratch data.
- `output/` for generated artifacts.
- `logs/` for backend logs and diagnostics.
- `manifest.json` for artifact metadata.

This approach supports native executables, Python subprocesses, browser-hosted export flows, and remote workers that return artifact bundles.

### Structured JSON Messages

Structured JSON messages should be used for control-plane data, lightweight payloads, and status reporting. Examples include:

- Job request and normalized render options.
- Backend capability descriptions.
- Progress updates.
- Validation warnings.
- Error envelopes.
- Final artifact manifests.

JSON messages should avoid embedding large binary data. Instead, they should reference files, URLs, content hashes, or artifact IDs.

## Future CLI Surface

The orchestration design should preserve a CLI surface similar to the following:

```sh
render-engine inspect
render-engine render scene.json --target png
render-engine render scene.json --target video
render-engine export scene.json --format html
```

Expected behavior:

- `render-engine inspect` reports available adapters, backend capabilities, versions, runtime checks, and known limitations.
- `render-engine render scene.json --target png` renders a still image artifact and writes an artifact manifest.
- `render-engine render scene.json --target video` renders a video artifact through a backend capable of frame sequencing, encoding, or remote video generation.
- `render-engine export scene.json --format html` exports an interactive or static HTML package using a JS/TS, browser, or service-backed adapter.

The CLI should remain controller-oriented. It should not expose backend-specific commands as the primary workflow, though adapter-specific flags may be added behind a namespaced or explicit escape hatch later.

## First-Milestone Non-Goals

The first milestone should explicitly avoid expanding into a broad engine rewrite or dependency consolidation project. Non-goals include:

- **No wholesale vendoring:** do not copy entire upstream projects into this repository just to make them available to the controller.
- **No full C++ engine rewrite:** do not attempt to rewrite or replace all rendering behavior with a new native engine in the first milestone.
- **No mandatory build of every upstream project:** do not require every possible backend or upstream renderer to build before the controller, CLI, or adapter contract can be useful.

The milestone should prove the orchestration contract, at least one practical adapter path, artifact exchange, and CLI shape before taking on deeper engine integration work.
