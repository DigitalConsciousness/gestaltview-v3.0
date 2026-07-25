# Web Render Backend Adapter Specification

## Scope

Adapter contract for browser-first renderers that use PixiJS, React Three Fiber, or html-video to produce canvas, WebGL, DOM, and video-frame outputs.

## Required Input Format

Adapters MUST accept a normalized `RenderJob` JSON document:

```json
{
  "jobId": "string",
  "backend": "web-render-backend",
  "entry": {
    "type": "pixijs|react-three-fiber|html-video|url|module",
    "uri": "workspace-relative path, module specifier, or local URL",
    "exportName": "optional component or factory name"
  },
  "props": {},
  "viewport": { "width": 1920, "height": 1080, "deviceScaleFactor": 1 },
  "timeline": { "frame": 0, "start": 0, "end": 0, "fps": 60 },
  "outputs": { "directory": "workspace-relative path", "formats": ["png", "webm", "mp4", "json"] },
  "metadata": { "requester": "string", "traceId": "string" }
}
```

The adapter MUST support static-frame capture. Sequence and video output MAY be implemented by driving the timeline frame range.

## Output Artifacts

The adapter MUST produce:

- Captured frame image, frame sequence, or encoded video according to `outputs.formats`.
- `render-manifest.json` with job ID, backend ID, entry type, viewport, timeline, output file list, package versions, and capture timings.
- `diagnostics.json` with browser console messages, page errors, missing asset reports, and performance metrics when available.

Optional artifacts include HTML snapshots, trace files, source maps, and per-frame timing CSV/JSON.

## Runtime Dependencies

- Node.js package runtime for JavaScript/TypeScript projects.
- Browser automation runtime such as Playwright, Puppeteer, or equivalent headless Chromium/WebKit/Firefox driver.
- PixiJS runtime for `pixijs` entries.
- React, React DOM, Three.js, and React Three Fiber for `react-three-fiber` entries.
- html-video package runtime for video-template entries.
- Optional FFmpeg or browser-native media recorder support for video encoding.

The adapter MUST run a dependency probe that reports available browser engines, package manager, installed package versions, and encoder availability.

## Error Model

Errors MUST use the shared JSON shape:

```json
{
  "ok": false,
  "code": "WEB_BACKEND_ERROR_CODE",
  "message": "human-readable summary",
  "severity": "fatal|retryable|warning",
  "stage": "validate|install|bundle|launch-browser|load-page|render|capture|encode|write-artifacts",
  "details": {},
  "artifacts": ["diagnostics.json"]
}
```

Standard error codes:

- `WEB_INPUT_INVALID`
- `WEB_ENTRY_UNRESOLVED`
- `WEB_DEPENDENCY_UNAVAILABLE`
- `WEB_BUNDLE_FAILED`
- `WEB_BROWSER_LAUNCH_FAILED`
- `WEB_PAGE_ERROR`
- `WEB_CAPTURE_FAILED`
- `WEB_OUTPUT_WRITE_FAILED`

Console errors SHOULD be warnings unless they prevent rendering or capture.

## Cross-Backend Compatibility Contract

The backend MUST:

- Implement the shared `RenderJob` envelope and common artifact names.
- Normalize browser-only outputs into filesystem artifacts usable by native, document, diagram, and orchestration backends.
- Use deterministic filenames: `{jobId}-{frameNumber}.{extension}` or `{jobId}.{extension}`.
- Serialize viewport and timeline metadata in `render-manifest.json`.
- Return all failures through the shared error object and write diagnostics on fatal page or browser failures when possible.

## Candidate Source Directories and Key Package Manifests

- `pixijs-dev/pixijs-dev` — PixiJS renderer and examples.
  - `pixijs-dev/pixijs-dev/package.json`
  - `pixijs-dev/pixijs-dev/playground/package.json`
  - `pixijs-dev/pixijs-dev/examples/package.json`
- `react-three-fiber-master/react-three-fiber-master` — React Three Fiber renderer packages and examples.
  - `react-three-fiber-master/react-three-fiber-master/package.json`
  - `react-three-fiber-master/react-three-fiber-master/packages/fiber/package.json`
  - `react-three-fiber-master/react-three-fiber-master/packages/test-renderer/package.json`
  - `react-three-fiber-master/react-three-fiber-master/example/package.json`
- `html-video-main/html-video-main` — HTML/video render runtime and adapters.
  - `html-video-main/html-video-main/package.json`
  - `html-video-main/html-video-main/packages/runtime/package.json`
  - `html-video-main/html-video-main/packages/core/package.json`
  - `html-video-main/html-video-main/packages/cli/package.json`
  - `html-video-main/html-video-main/packages/adapter-remotion/package.json`
  - `html-video-main/html-video-main/packages/adapter-hyperframes/package.json`
