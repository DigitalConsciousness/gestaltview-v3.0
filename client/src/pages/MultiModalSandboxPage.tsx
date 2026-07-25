import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import { useCreateArtifact } from "@/hooks/useCreateArtifact";
import { useSandboxPersistence } from "@/hooks/useSandboxPersistence";
import {
  buildSandboxArtifactPayload,
  type SandboxMode,
  type SandboxState,
} from "@/lib/sandboxArtifacts";

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
  "--font-primary": "'Inter', sans-serif",
  "--font-mono": "'JetBrains Mono', monospace",
  "--font-display": "'Space Grotesk', sans-serif",
  "--font-accent": "'Syne', sans-serif",
};

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

const DEFAULT_SANDBOX_STATE: SandboxState = {
  htmlCode: `<!-- HTML / JS Scratchpad -->\n<div style="padding:20px;border-radius:8px;background:var(--color-obsidian-light);color:var(--color-text-primary);font-family:var(--font-display);">\n  <h2>Hello GestaltView</h2>\n  <p>Edit this HTML and JavaScript code to see changes instantly.</p>\n  <script>\n    function updateText() {\n      const p = document.getElementById('message');\n      p.textContent = 'The time is ' + new Date().toLocaleTimeString();\n    }\n  </script>\n  <p id="message">Press the button…</p>\n  <button onclick="updateText()" style="padding:6px 12px;background:var(--color-violet);color:white;border:none;border-radius:4px;cursor:pointer;">Show Time</button>\n</div>`,
  pythonCode: `# Python Scratchpad\n# Your code will run in Pyodide inside the preview.\nimport sys\nprint('Hello from Python!')\nprint('Python version:', sys.version)`,
  threeCode: `// Three.js Scratchpad\n// Your code runs after Three.js and OrbitControls are loaded.\n// Use 'scene', 'camera' and 'renderer' that are provided.\n// A basic scene is already set up for you.\nconst geometry = new THREE.BoxGeometry();\nconst material = new THREE.MeshStandardMaterial({ color: 0x00d4ff });\nconst cube = new THREE.Mesh(geometry, material);\nscene.add(cube);\n\nfunction animate() {\n  requestAnimationFrame(animate);\n  cube.rotation.x += 0.01;\n  cube.rotation.y += 0.01;\n  renderer.render(scene, camera);\n}\nanimate();`,
  lastMode: "html",
};

type ModeConfig = {
  id: SandboxMode;
  label: string;
  accent: string;
  description: string;
};

const MODES: ModeConfig[] = [
  { id: "html", label: "HTML / JS", accent: "#00d4ff", description: "Markup, DOM scripting, and quick UI experiments." },
  { id: "python", label: "Python", accent: "#ffaa00", description: "Pyodide-backed Python with captured stdout/stderr." },
  { id: "three", label: "Three.js", accent: "#7b2fff", description: "Scene setup, lights, and interactive 3D sketches." },
];

function escapeForTemplateLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const LivePreview: React.FC<{ doc: string }> = ({ doc }) => (
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

function editorLabel(mode: SandboxMode): string {
  return mode === "html" ? "HTML / JS Editor" : mode === "python" ? "Python Editor" : "Three.js Editor";
}

function buildPreviewDoc(mode: SandboxMode, sandboxState: SandboxState): string {
  const cssVars = Object.entries(NA_TOKENS)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n    ");

  const head = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;600;700&family=Syne:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    ${cssVars}
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--color-obsidian);color:var(--color-text-primary);font-family:var(--font-primary);min-height:100vh;padding:24px;}
  ${CRT_CSS}
</style>`;

  if (mode === "html") {
    return `${head}</head><body>\n${sandboxState.htmlCode}\n</body></html>`;
  }

  if (mode === "python") {
    const escaped = escapeForTemplateLiteral(sandboxState.pythonCode);
    return `${head}<script src="https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js"></script>\n</head><body>\n<pre id="py-output" style="white-space:pre-wrap;font-family:var(--font-mono);font-size:0.9rem;line-height:1.5;"></pre>\n<script>\n  async function runPython() {\n    const outputElement = document.getElementById('py-output');\n    function writeToOutput(text) { outputElement.textContent += text; }\n    try {\n      const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/' });\n      pyodide.setStdout({ batched: (data) => writeToOutput(data) });\n      pyodide.setStderr({ batched: (data) => writeToOutput(data) });\n      await pyodide.runPythonAsync(\`${escaped}\`);\n    } catch (err) {\n      writeToOutput('\\n' + err.toString());\n    }\n  }\n  runPython();\n</script>\n</body></html>`;
  }

  const escaped = escapeForTemplateLiteral(sandboxState.threeCode);
  return `${head}<script type="module">\nimport * as THREE from 'https://unpkg.com/three@0.160.2/build/three.module.js';\nimport { OrbitControls } from 'https://unpkg.com/three@0.160.2/examples/jsm/controls/OrbitControls.js';\nwindow.THREE = THREE;\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.setSize(window.innerWidth, window.innerHeight);\nrenderer.setPixelRatio(window.devicePixelRatio);\ndocument.body.appendChild(renderer.domElement);\nconst scene = new THREE.Scene();\nscene.background = new THREE.Color('${NA_TOKENS["--color-obsidian"]}');\nconst camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);\ncamera.position.set(0, 1.6, 3);\nconst hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1.0);\nscene.add(hemi);\nconst dir = new THREE.DirectionalLight(0xffffff, 0.8);\ndir.position.set(3, 5, 2);\nscene.add(dir);\nconst controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;\nwindow.addEventListener('resize', () => {\n  camera.aspect = window.innerWidth / window.innerHeight;\n  camera.updateProjectionMatrix();\n  renderer.setSize(window.innerWidth, window.innerHeight);\n});\ntry {\n  ${escaped}\n} catch (e) {\n  console.error(e);\n}\nconst defaultRender = () => {\n  controls.update();\n  renderer.render(scene, camera);\n  requestAnimationFrame(defaultRender);\n};\ndefaultRender();\n</script>\n</head><body></body></html>`;
}

export default function MultiModalSandboxPage() {
  useSEO(PAGE_SEO.sandbox);
  const [, setLocation] = useLocation();
  const { sandboxState, saveSandboxState } = useSandboxPersistence(DEFAULT_SANDBOX_STATE);
  const { createArtifact } = useCreateArtifact();
  const [mode, setMode] = useState<SandboxMode>(sandboxState.lastMode);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const previewDoc = useMemo(() => buildPreviewDoc(mode, sandboxState), [mode, sandboxState]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(123,47,255,0.12), transparent 40%), linear-gradient(180deg, #06060a 0%, #0a0a0f 60%, #06060a 100%)",
        color: "#e8e8f0",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        gap: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          padding: "16px 20px",
          background: "rgba(18,18,26,0.92)",
          border: "1px solid #2a2a3e",
          borderRadius: 12,
          flexShrink: 0,
          boxShadow: "0 18px 70px rgba(0,0,0,0.34)",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#e8e8f0",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Multi-Modal Sandbox
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.72rem",
              color: "#9090b0",
              margin: "4px 0 0",
            }}
          >
            Live editing for HTML/JS, Python via Pyodide, and Three.js scenes.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              color: "#00d4ff",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            ● LIVE
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={async () => {
              setExportError(null);
              setIsExporting(true);

              try {
                const payload = buildSandboxArtifactPayload(mode, sandboxState);
                const result = await createArtifact(payload, sandboxState);
                toast.success(`Saved ${result.payload.title}`);
                setLocation(`/app/artifacts/${result.artifactId}`);
              } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to save sandbox artifact.";
                setExportError(message);
                toast.error(message);
              } finally {
                setIsExporting(false);
              }
            }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.65rem",
              color: "#e8e8f0",
              background: isExporting ? "rgba(123,47,255,0.12)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "6px 12px",
              cursor: isExporting ? "wait" : "pointer",
            }}
          >
            {isExporting ? "Saving..." : "Save as Artifact"}
          </button>
        </div>
      </div>

      {exportError ? (
        <div
          style={{
            border: "1px solid rgba(255,170,0,0.25)",
            background: "rgba(255,170,0,0.08)",
            color: "#ffaa00",
            borderRadius: 10,
            padding: "10px 14px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.72rem",
          }}
        >
          {exportError}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              setMode(entry.id);
              saveSandboxState((previous) => ({ ...previous, lastMode: entry.id }));
            }}
            style={{
              textAlign: "left",
              background:
                mode === entry.id
                  ? `rgba(${entry.accent === "#00d4ff" ? "0,212,255" : entry.accent === "#ffaa00" ? "255,170,0" : "123,47,255"},0.12)`
                  : "rgba(255,255,255,0.03)",
              color: mode === entry.id ? entry.accent : "#9090b0",
              border: `1px solid ${mode === entry.id ? entry.accent + "55" : "#2a2a3e"}`,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.18s ease",
              boxShadow: mode === entry.id ? `0 0 0 1px ${entry.accent}12, 0 12px 30px rgba(0,0,0,0.2)` : "none",
            }}
          >
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: 4 }}>
              {entry.label}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", lineHeight: 1.5 }}>
              {entry.description}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 12,
          flex: 1,
          minHeight: 0,
        }}
      >
        <section
          style={{
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "#9090b0",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {editorLabel(mode)}
          </div>
          <textarea
            value={mode === "html" ? sandboxState.htmlCode : mode === "python" ? sandboxState.pythonCode : sandboxState.threeCode}
            onChange={(event) => {
              const value = event.target.value;
              saveSandboxState((previous) =>
                mode === "html"
                  ? { ...previous, htmlCode: value }
                  : mode === "python"
                    ? { ...previous, pythonCode: value }
                    : { ...previous, threeCode: value },
              );
            }}
            spellCheck={false}
            style={{
              minHeight: 520,
              flex: 1,
              width: "100%",
              background: "#12121a",
              color: "#e8e8f0",
              border: "1px solid #2a2a3e",
              borderRadius: 12,
              padding: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              resize: "none",
              outline: "none",
              tabSize: 2,
              overflow: "auto",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
          />
        </section>

        <section
          style={{
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: "#9090b0",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Live Preview
          </div>
          <div
            style={{
              minHeight: 520,
              flex: 1,
              border: "1px solid #2a2a3e",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              background: "#0a0a0f",
              boxShadow: "0 18px 60px rgba(0,0,0,0.24)",
            }}
          >
            <LivePreview doc={previewDoc} />
          </div>
        </section>
      </div>
    </div>
  );
}
