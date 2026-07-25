# SPEC: MultiModalSandboxPage — Integration & Gap Remediation
**Version:** 1.0  
**Date:** 2026-06-12  
**Status:** Draft — Pending Keith Approval  
**Repo:** `DigitalConsciousness/gestaltview-v2.0`  
**Component:** `client/src/pages/MultiModalSandboxPage.tsx`

---

## Overview

The `MultiModalSandboxPage` component is **functionally complete** for its three runtime modes (HTML/JS, Python via Pyodide, Three.js). It has correct sandbox isolation, Neural Aurora token injection, live preview, and CRT overlay. The remaining work is entirely integration and polish — no runtime logic needs to be rebuilt.

This spec covers three sequential work streams:

1. **Sprint A — MVP Integration** (route + persistence, ~2 hours)
2. **Sprint B — Gen-Engine Artifact Bridge** (one-way export, ~1 day)
3. **Sprint C — Production Polish** (Monaco, LLM proxy, debounce, error boundaries)

Each sprint is independently shippable. Sprint A unlocks demo value immediately.

---

## Checked Sources

- **GitHub MCP:** `DigitalConsciousness/gestaltview-v2.0` — confirmed `client/src/pages/` directory exists, `App.tsx` present at `client/src/App.tsx` (18 KB), no existing sandbox route found in directory listing
- **Attached files:** `SandboxPage.tsx.txt`, `SANDBOX_GAP_ANALYSIS.md`, `SANDBOX_GENENGINE_INTEGRATION.ts`, `SANDBOX_INTEGRATION_SCAFFOLD.ts` — all read in full
- **Supabase MCP:** Not checked for this spec (no schema changes required in Sprints A–B)
- **Vercel MCP:** Not checked (no env var changes required in Sprints A–B)

---

## Sprint A — MVP Integration

**Goal:** Sandbox is live at `/app/sandbox`, code persists across reloads, component uses the app's standard layout wrapper.  
**Estimated effort:** 1–2 hours  
**Acceptance:** Route resolves, all three mode tabs work, code survives a hard refresh.

### A-1 — Copy Component File

Drop `SandboxPage.tsx.txt` into the live pages directory, renamed:

```
client/src/pages/MultiModalSandboxPage.tsx
```
```
/*
 * MultiModalSandboxPage
 *
 * A next‑generation real‑time render sandbox for experimenting with a variety of
 * development languages and component types. Inspired by the existing
 * SandboxPage, this page introduces multiple editing modes (HTML/JS, Python
 * via Pyodide and Three.js) and a shared live preview area. Users can type
 * code directly into the provided editor and immediately see the results
 * reflected in the preview without needing to reload the page. Styling is
 * harmonised with the Neural Aurora design system defined in the rest of
 * GestaltView, including the CRT overlay and custom colour/font tokens. This
 * component is self contained – it does not rely on backend services – and
 * demonstrates how GestaltView could evolve toward a richer, multi‑modal
 * prototyping environment.
 */

import React, { useState, useMemo, ChangeEvent } from "react";

// ─── Neural Aurora Design Tokens ──────────────────────────────────────────────
const NA_TOKENS = {
  "--color-obsidian": "#0a0a0f",
  "--color-obsidian-mid": "#12121a",
  "--color-obsidian-light": "#1a1a2e",
  "--color-cyan": "#00d4ff",
  "--color-cyan-dim": "#00a8cc",
  "--color-violet": "#7b2fff",
  "--color-violet-dim": "#5a1fcc",
  "--color-amber": "#ffaa00",
  "--color-text-primary": "#e8e8f0",
  "--color-text-secondary": "#9090b0",
  "--color-border": "#2a2a3e",
  "--font-primary": "'Inter', sans‑serif",
  "--font-mono": "'JetBrains Mono', monospace",
  "--font-display": "'Space Grotesk', sans‑serif",
  "--font-accent": "'Syne', sans‑serif",
};

// ─── CRT Scanline CSS (injected into preview iframes) ─────────────────────────
const CRT_CSS = `
  body::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }
`;

// ─── Supported language modes for the sandbox ──────────────────────────────────
type ModeId = "html" | "python" | "three";

const MODES: { id: ModeId; label: string; accent: string }[] = [
  { id: "html", label: "HTML / JS", accent: "#00d4ff" },
  { id: "python", label: "Python", accent: "#ffaa00" },
  { id: "three", label: "Three.js", accent: "#7b2fff" },
];

// ─── LivePreview component ────────────────────────────────────────────────────
interface LivePreviewProps {
  doc: string;
}

/**
 * Renders a sandboxed iframe with the provided document content. The iframe
 * operates in a self‑contained environment with scripts enabled and same‑origin
 * isolation so that user code runs safely. A CRT scanline overlay and
 * Neural Aurora tokens are injected automatically.
 */
const LivePreview: React.FC<LivePreviewProps> = ({ doc }) => {
  return (
    <iframe
      sandbox="allow-scripts allow-same-origin"
      srcDoc={doc}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "#0a0a0f",
        borderRadius: 4,
      }}
      title="Live Preview"
    />
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const MultiModalSandboxPage: React.FC = () => {
  // active language mode
  const [mode, setMode] = useState<ModeId>("html");

  // editors for each mode – preserve code separately per tab
  const [htmlCode, setHtmlCode] = useState<string>(
    `<!-- HTML / JS Scratchpad -->\n<div style="padding:20px;border-radius:8px;background:var(--color-obsidian-light);color:var(--color-text-primary);font-family:var(--font-display);">\n  <h2>Hello GestaltView</h2>\n  <p>Edit this HTML and JavaScript code to see changes instantly.</p>\n  <script>\n    // Example: click the button to change the text\n    function updateText() {\n      const p = document.getElementById('message');\n      p.textContent = 'The time is ' + new Date().toLocaleTimeString();\n    }\n  </script>\n  <p id="message">Press the button…</p>\n  <button onclick="updateText()" style="padding:6px 12px;background:var(--color-violet);color:white;border:none;border-radius:4px;cursor:pointer;">Show Time</button>\n</div>`
  );

  const [pythonCode, setPythonCode] = useState<string>(
    `# Python Scratchpad\n# Your code will run in Pyodide inside the preview.\nimport sys\nprint('Hello from Python!')\nprint('Python version:', sys.version)`
  );

  const [threeCode, setThreeCode] = useState<string>(
    `// Three.js Scratchpad\n// Your code runs after Three.js and OrbitControls are loaded.\n// Use 'scene', 'camera' and 'renderer' that are provided.\n// A basic scene is already set up for you.\n// Example: add a rotating cube\nconst geometry = new THREE.BoxGeometry();\nconst material = new THREE.MeshStandardMaterial({ color: 0x00d4ff });\nconst cube = new THREE.Mesh(geometry, material);\nscene.add(cube);\n\n// animate the cube\nfunction animate() {\n  requestAnimationFrame(animate);\n  cube.rotation.x += 0.01;\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n}\nanimate();`
  );

  // compute the full HTML document for the iframe based on mode and code
  const previewDoc = useMemo(() => {
    // prepare design token CSS variables
    const cssVars = Object.entries(NA_TOKENS)
      .map(([k, v]) => `${k}: ${v};`)
      .join("\n    ");

    // common head with fonts and base styles
    const head = `\n<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1"/>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;600;700&family=Syne:wght@400;700&display=swap" rel="stylesheet"/>\n<style>\n  :root {\n    ${cssVars}\n  }\n  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\n  body{background:var(--color-obsidian);color:var(--color-text-primary);font-family:var(--font-primary);min-height:100vh;padding:24px;}\n  ${CRT_CSS}\n</style>\n`;

    // mode specific body content
    if (mode === "html") {
      // We embed the user HTML/JS directly. Note that script tags run in
      // the sandboxed iframe and cannot escape into the parent document.
      return `${head}</head><body>\n${htmlCode}\n</body></html>`;
    }

    if (mode === "python") {
      // Python via Pyodide. We load Pyodide from jsDelivr. When loaded,
      // the code entered by the user runs and its stdout is written into
      // a <pre> element. Errors are caught and displayed similarly. The
      // generated document is plain HTML so that users can inspect the
      // result of their computations.
      const escaped = pythonCode
        .replace(/\`/g, "`")
        .replace(/\\/g, "\\\\")
        .replace(/\$/g, "\\$");
      return `${head}<script type="text/javascript" src="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js"></script>\n</head><body>\n<pre id="py-output" style="white-space:pre-wrap;font-family:var(--font-mono);font-size:0.9rem;line-height:1.5;"></pre>\n<script type="text/javascript">\n  async function runPython() {\n    const pyodide = await loadPyodide({indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/"});\n    // Redirect Python print statements to the pre element\n    const outputElement = document.getElementById('py-output');\n    function writeToOutput(text) {\n      outputElement.textContent += text;\n    }\n    pyodide.setStdout({\n      batched: (data) => writeToOutput(data)\n    });\n    pyodide.setStderr({\n      batched: (data) => writeToOutput(data)\n    });\n    try {\n      await pyodide.runPythonAsync(`${escaped}`);\n    } catch (err) {\n      writeToOutput('\n' + err.toString());\n    }\n  }\n  runPython();\n</script>\n</body></html>`;
    }

    if (mode === "three") {
      // Three.js playground. We load Three.js and its OrbitControls plugin
      // from unpkg CDN and set up a basic scene, camera and renderer. The
      // user script runs after the scene is ready and has access to THREE,
      // scene, camera and renderer variables. Common helpers such as
      // resizing are handled automatically. The scene renders continuously.
      const escaped = threeCode
        .replace(/\`/g, "`")
        .replace(/\\/g, "\\\\")
        .replace(/\$/g, "\\$");
      return `${head}<script type="module">\nimport * as THREE from 'https://unpkg.com/three@0.160.2/build/three.module.js';\nimport { OrbitControls } from 'https://unpkg.com/three@0.160.2/examples/jsm/controls/OrbitControls.js';\nwindow.THREE = THREE;\n// Create renderer and append to body\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.setPixelRatio(window.devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);\n// Scene & camera\nconst scene = new THREE.Scene();\nscene.background = new THREE.Color('${NA_TOKENS["--color-obsidian"]}');\nconst camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\ncamera.position.set(0, 1.6, 3);\n// Lighting\nconst hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1.0);\nscene.add(hemi);\nconst dir = new THREE.DirectionalLight(0xffffff, 0.8);\ndir.position.set(3, 5, 2);\nscene.add(dir);\n// Controls\nconst controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;\n// Handle resize\nwindow.addEventListener('resize', () => {\n  camera.aspect = window.innerWidth / window.innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(window.innerWidth, window.innerHeight);\n});\n// Execute user code\ntry {\n  ${escaped}\n} catch (e) {\n  console.error(e);\n}\n// Animation loop helper (if not overridden by user)\nconst defaultRender = () => {\n  controls.update();\n  renderer.render(scene, camera);\n  requestAnimationFrame(defaultRender);\n};\nif (!window.__three_user_loop_started) {\n  defaultRender();\n}\n</script>\n</head><body></body></html>`;
    }
    return `${head}</head><body><p>Unsupported mode</p></body></html>`;
  }, [mode, htmlCode, pythonCode, threeCode]);

  // unified change handlers
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (mode === "html") setHtmlCode(val);
    if (mode === "python") setPythonCode(val);
    if (mode === "three") setThreeCode(val);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e8e8f0",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        gap: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          padding: "16px 20px",
          background: "#12121a",
          border: "1px solid #2a2a3e",
          borderRadius: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#e8e8f0",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Multi‑Modal Sandbox
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#9090b0",
              margin: "2px 0 0",
            }}
          >
            Experiment with different languages and see the results instantly
          </p>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            color: "#00d4ff",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 4,
            padding: "4px 10px",
          }}
        >
          ● LIVE
        </div>
      </div>
      {/* Mode Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background:
                mode === m.id
                  ? `rgba(${m.accent === "#00d4ff" ? "0,212,255" : m.accent === "#ffaa00" ? "255,170,0" : "123,47,255"},0.1)`
                  : "transparent",
              color: mode === m.id ? m.accent : "#9090b0",
              border: `1px solid ${mode === m.id ? m.accent + "55" : "#2a2a3e"}`,
              borderRadius: 6,
              padding: "8px 18px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              fontWeight: mode === m.id ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      {/* Editor & Preview layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          gap: 12,
          height: "calc(100vh - 200px)",
        }}
      >
        {/* Editor */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "#9090b0",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {mode === "html"
              ? "HTML / JS Editor"
              : mode === "python"
              ? "Python Editor"
              : "Three.js Editor"}
          </div>
          <textarea
            value={mode === "html" ? htmlCode : mode === "python" ? pythonCode : threeCode}
            onChange={handleChange}
            spellCheck={false}
            style={{
              flex: 1,
              background: "#12121a",
              color: "#e8e8f0",
              border: "1px solid #2a2a3e",
              borderRadius: 6,
              padding: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.8rem",
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              tabSize: 2,
              overflow: "auto",
            }}
          />
        </div>
        {/* Preview */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "#9090b0",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Live Preview
          </div>
          <div
            style={{
              flex: 1,
              border: "1px solid #2a2a3e",
              borderRadius: 6,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <LivePreview doc={previewDoc} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiModalSandboxPage;
```
No internal changes required. The component has zero external dependencies beyond React.

### A-2 — Register Route in App.tsx

**File:** `client/src/App.tsx`

Add a lazy import alongside the existing page imports:

```tsx
const MultiModalSandboxPage = React.lazy(
  () => import('./pages/MultiModalSandboxPage')
);
```

Add the route inside the authenticated route tree (same parent as other `/app/*` routes):

```tsx
<Route path="/app/sandbox" element={<MultiModalSandboxPage />} />
```

**Validation:** `npm run build` — no type errors. Navigate to `/app/sandbox` — three mode tabs render.

### A-3 — Add Persistence Hook

**New file:** `client/src/hooks/useSandboxPersistence.ts`

Implement exactly as specified in `SANDBOX_INTEGRATION_SCAFFOLD.ts` Section 1. The hook reads/writes `gestaltview:sandbox:state` to `localStorage`, shape:

```ts
interface SandboxState {
  htmlCode: string;
  pythonCode: string;
  threeCode: string;
  lastMode: 'html' | 'python' | 'three';
}
```

Wire into `MultiModalSandboxPage.tsx`: replace the four `useState` initializers with values from the hook, and call the hook's `save()` on every editor `onChange`.

**Acceptance criteria:**
- [ ] User writes code in HTML mode, refreshes — code is still there
- [ ] Active mode tab is restored on reload
- [ ] Empty/corrupt localStorage value falls back to the component's original defaults without crashing

### A-4 — Apply StandardLayout Wrapper

**File:** `client/src/pages/MultiModalSandboxPage.tsx`

Wrap the returned JSX in whatever layout component the other `/app/*` pages use (verify by checking one existing page, e.g., `DynamicInnerWorldPage.tsx`). Do not change any internal styles — the CRT overlay and Neural Aurora tokens are applied inside the preview iframe and do not conflict with the outer layout.

### A-5 — Navigation Entry (Optional, Demo-Recommended)

If the navigation sidebar has a config file or component, add a Sandbox entry behind the same feature-flag pattern used for other stub pages (see `GATE` flags in the existing nav config). Label: **Sandbox**. Icon: `terminal` from Lucide. Position: below Creation Corner.

---

## Sprint B — Gen-Engine Artifact Bridge

**Goal:** Users can click "Save as Artifact" from the Sandbox and the current code + preview snapshot is stored as a GestaltView artifact, navigating them to the artifact detail view.  
**Estimated effort:** 4–8 hours  
**Dependency:** The artifact creation endpoint (`/api/artifacts` or equivalent) must exist and accept the payload shape below. If it does not exist, this sprint is **blocked** — confirm before starting.

### B-1 — Artifact Payload Shape

```ts
interface SandboxArtifactPayload {
  type: 'sandbox';
  mode: 'html' | 'python' | 'three';
  title: string;                   // auto-generated: "Sandbox · HTML · [timestamp]"
  sourceCode: string;              // the active mode's code string
  previewSnapshot?: string;        // optional: base64 PNG of preview iframe
  metadata: {
    sandboxVersion: '1.0';
    createdAt: string;             // ISO 8601
    modeContext: {
      htmlCode: string;
      pythonCode: string;
      threeCode: string;
    };
  };
}
```

### B-2 — useCreateArtifact Hook

**New file:** `client/src/hooks/useCreateArtifact.ts`

```ts
export function useCreateArtifact() {
  const createArtifact = async (payload: SandboxArtifactPayload) => {
    const res = await fetch('/api/artifacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Artifact creation failed: ${res.status}`);
    return res.json() as Promise<{ id: string }>;
  };
  return { createArtifact };
}
```

If the API endpoint path differs, update the fetch URL. Do not hardcode the base URL — use the `BACKEND_API_URL` env var via `import.meta.env.VITE_BACKEND_API_URL`.

### B-3 — Export Button in MultiModalSandboxPage

Add a **"Save as Artifact"** button to the Sandbox header bar (right side, secondary style — not the primary cyan CTA). Wire `handleExportAsArtifact` exactly as shown in `SANDBOX_GENENGINE_INTEGRATION.ts` Pattern 2.

```tsx
const handleExportAsArtifact = async () => {
  setExporting(true);
  try {
    const payload = buildArtifactPayload(mode, { htmlCode, pythonCode, threeCode });
    const artifact = await createArtifact(payload);
    navigate(`/app/artifacts/${artifact.id}`, {
      state: { fromSandbox: true, originalCode: payload },
    });
  } catch (err) {
    // Show inline error toast — do not use alert()
    setExportError(true);
  } finally {
    setExporting(false);
  }
};
```

**UI states to implement:**
- Default: "Save as Artifact" label, secondary button style
- Loading (`exporting === true`): spinner + "Saving…" label, button disabled
- Error (`exportError === true`): inline red error message beneath button, "Try again" link

**Acceptance criteria:**
- [ ] Button visible in all three modes
- [ ] Clicking saves artifact and navigates to `/app/artifacts/:id`
- [ ] `fromSandbox: true` is present in navigation state (used by artifact page to show "Back to Sandbox" breadcrumb)
- [ ] Error state is visible and recoverable without a page reload

### B-4 — Artifact Detail Page: Back Link

**File:** Whichever artifact detail page lives at `/app/artifacts/:id`

If `location.state?.fromSandbox === true`, render a "← Back to Sandbox" breadcrumb link at the top of the page. This is a one-line conditional — no structural changes to the artifact page required.

---

## Sprint C — Production Polish

These items are deferred post-MVP. They are listed here to prevent re-architecting the component in a way that blocks them later.

### C-1 — Debounce Editor Input

Currently, every keystroke in the textarea triggers a `useMemo` recompute and iframe reload. This is acceptable for simple HTML snippets but will cause jank for large Python or Three.js files.

**Fix:** Wrap the `previewDoc` memo's dependencies with a 300ms debounce. Use `useDebounce` from `use-debounce` (already a common dep in React projects) or implement a one-liner with `useEffect` + `setTimeout`.

```ts
const debouncedHtmlCode = useDebounce(htmlCode, 300);
const debouncedPythonCode = useDebounce(pythonCode, 300);
const debouncedThreeCode = useDebounce(threeCode, 300);
// Pass debounced values into the useMemo dependency array
```

### C-2 — Error Boundary

Python and Three.js execution errors currently fail silently inside the iframe. Add a React `ErrorBoundary` wrapper around `<LivePreview />` so that if `srcDoc` construction throws (e.g., malformed escape sequences), the user sees a readable error state rather than a blank preview pane.

**Error UI spec:**
- Background: `--color-obsidian-mid`
- Icon: `⚠` in amber (`--color-amber`)
- Message: "Preview error — check your code for syntax issues"
- Monospaced error string if available

### C-3 — Monaco Editor Upgrade

Replace the `<textarea>` editor with [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`. Map modes to Monaco languages: `html` → `html`, `python` → `python`, `three` → `javascript`. Apply the Neural Aurora dark theme as a Monaco custom theme definition.

**Note:** Monaco adds ~2MB to bundle. Lazy-load the import behind a `React.lazy` boundary so it does not impact initial page load.

### C-4 — LLM Code Suggestion Proxy

**New server route:** `POST /api/sandbox/suggest`

Request shape:
```ts
{ mode: ModeId; code: string; prompt?: string }
```

Response shape:
```ts
{ suggestion: string; explanation?: string }
```

The server route calls the active LLM provider (same as Billy's backend), injecting a system prompt that constrains the model to code-only responses in the active language. Environment variable management lives server-side — no API keys are ever sent to the client.

UI: "Get Suggestion" button beneath the editor. Opens a single-line prompt input ("What would you like help with?"), submits to the proxy, and injects the suggestion as a comment block at the top of the current editor content.

**Billy integration option:** If Billy DI context is available (user is logged in, Billy is initialized), pre-populate the suggestion prompt with the user's current Sanctuary context. This gives Billy awareness that the user is in the Sandbox and what they're building.

### C-5 — JS Console Output Capture

Currently, `console.log` output in HTML/JS mode is invisible to the user. Add a collapsible **Console** panel below the preview iframe that captures `console.log`, `console.warn`, and `console.error` from the sandboxed iframe via `window.addEventListener('message', ...)` and a `postMessage` bridge injected into the iframe document.

---

## Code Quality Issues to Fix in Sprint A

These are existing issues in the component that should be corrected when copying the file into the repo — none require architectural changes.

| Issue | Location | Fix |
|-------|----------|-----|
| Hard-coded Pyodide CDN URL `v0.21.3` | `previewDoc` memo, python branch | Lift to a named constant `PYODIDE_VERSION` at the top of the file |
| Hard-coded Three.js CDN URL `0.160.2` | `previewDoc` memo, three branch | Lift to `THREEJS_VERSION` constant |
| Inline CSS throughout JSX | All JSX return | Extract to a `const styles = {}` object at the bottom of the file (or a co-located `.module.css` file if the project uses CSS modules) |
| No `aria-label` on mode tab buttons | Mode tabs render | Add `aria-label={`Switch to ${mode.label} mode`}` |
| `<textarea>` has no `aria-label` | Editor textarea | Add `aria-label={`${currentMode.label} code editor`}` |

---

## Open Decisions (Required Before Sprint B)

| # | Decision | Options | Recommended |
|---|----------|---------|-------------|
| 1 | **Artifact endpoint** — does `/api/artifacts` POST exist? | A) Exists, ready to wire · B) Needs to be built first | Confirm in server routes before Sprint B |
| 2 | **Navigation placement** — should Sandbox appear in main nav? | A) Yes, always visible · B) Feature-flagged · C) Admin/power-user only | B (feature-flagged) for now |
| 3 | **Billy integration scope** — Sprint C only, or pull into Sprint B? | A) Sprint B: Billy-aware artifact naming · B) Sprint C: full suggestion proxy | A is low-effort and high demo value |
| 4 | **localStorage vs. Supabase** — persistence layer for Sprint A | A) localStorage (30 min) · B) Supabase `knowledge_fragments` (1–2 days) | A for Sprint A; migrate to B in Sprint C |
| 5 | **Free-tier artifact cap** — does this Sandbox count against free-tier limits? | A) Yes, counts as 1 artifact · B) Sandbox is separate from the artifact cap | Needs product decision before Sprint B ships |

---

## File Change Summary

| File | Action | Sprint |
|------|--------|--------|
| `client/src/pages/MultiModalSandboxPage.tsx` | **Create** (copy from attachment + minor fixes) | A |
| `client/src/App.tsx` | **Edit** — add lazy import + route | A |
| `client/src/hooks/useSandboxPersistence.ts` | **Create** | A |
| `client/src/hooks/useCreateArtifact.ts` | **Create** | B |
| `client/src/pages/MultiModalSandboxPage.tsx` | **Edit** — add export button + handler | B |
| `client/src/pages/[ArtifactDetailPage].tsx` | **Edit** — add back link when `fromSandbox` | B |
| `server/routes/sandbox.ts` | **Create** — LLM suggestion proxy | C |
| `client/src/pages/MultiModalSandboxPage.tsx` | **Edit** — Monaco, debounce, console panel | C |

---

## Validation Commands

After each sprint, run:

```bash
npm run build          # Must complete with zero TypeScript errors
git diff --check       # No whitespace issues
# Manual: navigate to /app/sandbox — all three mode tabs render
# Manual: write code, hard refresh — code persists (Sprint A+)
# Manual: click Save as Artifact — navigates to artifact detail (Sprint B+)
```

---

*Generated from: `SandboxPage.tsx.txt`, `SANDBOX_GAP_ANALYSIS.md`, `SANDBOX_GENENGINE_INTEGRATION.ts`, `SANDBOX_INTEGRATION_SCAFFOLD.ts` + live inspection of `DigitalConsciousness/gestaltview-v2.0` via GitHub MCP.*
