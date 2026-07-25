# GestaltView Rendering Engine — Design Spec & Full Implementation

**Source:** Live GitHub MCP — `DigitalConsciousness/gestaltview-v2.0`
**Checked:** `shared/gen-engine/types.ts` · `client/src/components/ArtifactRenderer.tsx` · `client/src/components/ArtifactPreview.tsx` · components directory scan
**Date:** June 16, 2026

***

## Context: What Exists Today

The current `ArtifactRenderer.tsx` (1,917 bytes) is a minimal 3-branch dispatch:
- `html` → sandboxed iframe via `doc.write()`
- `json` → `JSON.stringify` in a `<pre>`
- everything else → `<pre>` with monospace toggle

The `GeneratedArtifact.contentFormat` union is currently: `"markdown" | "html" | "json" | "text" | "code"`.

Neither PDF, CSV, image (jpg/png), audio (wav/mp3), video (mp4), React components, nor HTML5 interactive artifacts are handled. The gen-engine `ArtifactType` includes `"pdf-ready-html"` and `"blueprint-json"` but neither has a renderer.

The `ArtifactExportBar.tsx`, `ArtifactPreview.tsx`, `ArtifactPreviewer.tsx`, `ArtifactDeepView.tsx`, `ArtifactExpandView.tsx`, and `ArtifactScreen.tsx` all currently delegate format rendering to the same thin dispatcher or manage their own partial logic. This creates rendering drift — format support discovered in one component is not available in others.

***

## Design Principle

The rendering engine is a **single, authoritative dispatch layer** that every artifact-displaying component imports. It does not know about rooms, PLK, or the Tribunal. Its only job is: *given a format type and content payload, produce the correct visual representation — fully rendered and interactive where applicable.*

The gen-engine generates. The rendering engine renders. They are **paired primitives** that never reach into each other's domain.

***

## Architecture Overview

```
shared/gen-engine/types.ts          ← add new format types here (single source of truth)
        ↓
client/src/lib/rendering/
  ├── index.ts                      ← re-exports RenderingEngine, FORMAT_REGISTRY
  ├── types.ts                      ← RenderFormat union, RenderResult, RendererContract
  ├── registry.ts                   ← FORMAT_REGISTRY: maps format → renderer fn
  ├── renderers/
  │   ├── markdown.tsx              ← react-markdown + remark-gfm + syntax highlighting
  │   ├── html.tsx                  ← sandboxed iframe, srcdoc strategy
  │   ├── html5.tsx                 ← allow-scripts iframe, postMessage bridge
  │   ├── react-component.tsx       ← @babel/standalone transpile + iframe injection
  │   ├── pdf.tsx                   ← pdfjs-dist viewer wrapper
  │   ├── csv.tsx                   ← papa-parse + lightweight data table
  │   ├── xml.tsx                   ← xml-formatter + collapsible tree
  │   ├── image.tsx                 ← <img> with zoom, Neural Aurora frame
  │   ├── audio.tsx                 ← HTML5 <audio> + waveform visualizer
  │   ├── video.tsx                 ← HTML5 <video> + custom controls
  │   ├── json.tsx                  ← collapsible JSON tree
  │   ├── code.tsx                  ← syntax-highlighted code block + copy
  │   └── text.tsx                  ← pre-wrap with PLK-aware font
  └── RenderingEngine.tsx           ← master dispatch component
```

The `RenderingEngine` component is the **only** public surface. All existing artifact components replace their internal format logic with a single `<RenderingEngine artifact={...} />` call.

***

## Step 1 — Extend the Format Type Contract

### `shared/gen-engine/types.ts` — updated `contentFormat`

The `GeneratedArtifact.contentFormat` union needs to expand. This is the only write to `types.ts`; everything else is additive.

```typescript
// REPLACE the existing contentFormat line in GeneratedArtifact
export type ArtifactContentFormat =
  | "markdown"
  | "html"
  | "html5"           // HTML5 with scripts / Canvas / WebAudio / interactive
  | "react"           // JSX/TSX component string, transpiled client-side
  | "json"
  | "code"
  | "text"
  | "pdf"             // binary blob URL or base64 data URI
  | "csv"
  | "xml"
  | "image"           // jpg, png, gif, webp — src URL or base64
  | "audio"           // wav, mp3 — src URL or base64
  | "video";          // mp4, webm — src URL or base64

// Update GeneratedArtifact (drop inline literal, use alias)
export type GeneratedArtifact = {
  id: string;
  userId?: string;
  title: string;
  type: ArtifactType;
  content: string;           // always string — URLs, base64, or raw text
  contentFormat: ArtifactContentFormat;
  mimeType?: string;         // NEW: e.g. "image/png", "audio/wav" — optional but preferred
  sourceCaptureIds: string[];
  sourceArtifactIds: string[];
  destination: ArtifactDestination;
  createdAt: string;
  metadata: Record<string, unknown>;
};
```

The `mimeType` field is additive and backward compatible — all existing artifact creation paths still work without it. The renderer uses it as a hint when format-by-extension is ambiguous.

***

## Step 2 — Core Renderer Types

### `client/src/lib/rendering/types.ts`

```typescript
import type { ArtifactContentFormat, GeneratedArtifact } from '../../../../shared/gen-engine/types';

export type RenderMode = 'inline' | 'compact' | 'fullscreen' | 'export-preview';

export interface RenderProps {
  artifact: GeneratedArtifact;
  mode?: RenderMode;
  /** Caller-supplied height override. Renderer uses its own default if omitted. */
  height?: string | number;
  /** Fire when content is interacted with (clicks, play events, etc.) */
  onInteraction?: (event: RenderInteractionEvent) => void;
  /** Fire when user triggers an export from within the renderer */
  onExportRequest?: (format: ArtifactContentFormat) => void;
  className?: string;
}

export interface RenderInteractionEvent {
  type: 'play' | 'pause' | 'seek' | 'zoom' | 'click' | 'message';
  payload?: unknown;
}

export type RendererComponent = React.ComponentType<RenderProps>;
```

***

## Step 3 — Format Registry

### `client/src/lib/rendering/registry.ts`

```typescript
import type { ArtifactContentFormat } from '../../../../shared/gen-engine/types';
import type { RendererComponent } from './types';

import { MarkdownRenderer }       from './renderers/markdown';
import { HtmlRenderer }           from './renderers/html';
import { Html5Renderer }          from './renderers/html5';
import { ReactRenderer }          from './renderers/react-component';
import { PdfRenderer }            from './renderers/pdf';
import { CsvRenderer }            from './renderers/csv';
import { XmlRenderer }            from './renderers/xml';
import { ImageRenderer }          from './renderers/image';
import { AudioRenderer }          from './renderers/audio';
import { VideoRenderer }          from './renderers/video';
import { JsonRenderer }           from './renderers/json';
import { CodeRenderer }           from './renderers/code';
import { TextRenderer }           from './renderers/text';

export const FORMAT_REGISTRY: Record<ArtifactContentFormat, RendererComponent> = {
  markdown: MarkdownRenderer,
  html:     HtmlRenderer,
  html5:    Html5Renderer,
  react:    ReactRenderer,
  pdf:      PdfRenderer,
  csv:      CsvRenderer,
  xml:      XmlRenderer,
  image:    ImageRenderer,
  audio:    AudioRenderer,
  video:    VideoRenderer,
  json:     JsonRenderer,
  code:     CodeRenderer,
  text:     TextRenderer,
};

export function getRenderer(format: ArtifactContentFormat): RendererComponent {
  return FORMAT_REGISTRY[format] ?? TextRenderer;
}
```

***

## Step 4 — Master Dispatch Component

### `client/src/lib/rendering/RenderingEngine.tsx`

This is the only component any other part of the codebase should import for artifact display.

```tsx
import React, { Suspense } from 'react';
import { getRenderer } from './registry';
import type { RenderProps } from './types';

const ENGINE_VERSION = '1.0.0';

function RenderFallback({ title }: { title: string }) {
  return (
    <div style={{
      padding: '24px',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'monospace',
      fontSize: '0.82rem',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
    }}>
      Rendering {title}…
    </div>
  );
}

function RenderError({ format, error }: { format: string; error: string }) {
  return (
    <div style={{
      padding: '16px',
      background: 'rgba(255,60,60,0.06)',
      border: '1px solid rgba(255,60,60,0.2)',
      borderRadius: '12px',
      color: 'rgba(255,120,120,0.9)',
      fontSize: '0.8rem',
      fontFamily: 'monospace',
    }}>
      <strong>Render error [{format}]:</strong> {error}
    </div>
  );
}

export class RenderingEngine extends React.Component<
  RenderProps,
  { hasError: boolean; errorMessage: string }
> {
  static displayName = `RenderingEngine@${ENGINE_VERSION}`;

  constructor(props: RenderProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RenderingEngine]', error, info);
  }

  render() {
    const { artifact, mode = 'inline', ...rest } = this.props;

    if (this.state.hasError) {
      return (
        <RenderError
          format={artifact.contentFormat}
          error={this.state.errorMessage}
        />
      );
    }

    const Renderer = getRenderer(artifact.contentFormat);

    return (
      <Suspense fallback={<RenderFallback title={artifact.title} />}>
        <Renderer artifact={artifact} mode={mode} {...rest} />
      </Suspense>
    );
  }
}
```

***

## Step 5 — Individual Renderers

### `renderers/markdown.tsx`

```tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { RenderProps } from '../types';

export function MarkdownRenderer({ artifact, mode }: RenderProps) {
  return (
    <div
      className="gv-markdown-renderer"
      style={{
        color: 'rgba(255,255,255,0.85)',
        fontSize: mode === 'compact' ? '0.82rem' : '0.92rem',
        lineHeight: 1.7,
        padding: mode === 'compact' ? '12px' : '20px 0',
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {artifact.content}
      </ReactMarkdown>
    </div>
  );
}
```

**Dependencies to add:** `react-markdown`, `remark-gfm`

### `renderers/html.tsx`

Safe static HTML. No scripts. Uses `srcdoc` (preferred over `doc.write` — avoids CSP issues).

```tsx
import React from 'react';
import type { RenderProps } from '../types';

export function HtmlRenderer({ artifact, mode, height }: RenderProps) {
  const resolvedHeight = height ?? (mode === 'compact' ? 320 : 600);
  return (
    <iframe
      title={artifact.title}
      srcDoc={artifact.content}
      sandbox="allow-same-origin allow-forms"
      style={{
        width: '100%',
        height: resolvedHeight,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        background: '#05070b',
      }}
    />
  );
}
```

**Note:** Switched from `doc.write()` to `srcDoc` — this is safer and avoids the CSP violation the current implementation risks.

### `renderers/html5.tsx`

Interactive HTML5 — Canvas, WebAudio, requestAnimationFrame, WebGL. Requires `allow-scripts` but runs in a true iframe origin sandbox.

```tsx
import React, { useRef, useEffect, useCallback } from 'react';
import type { RenderProps } from '../types';

const WRAPPER = (content: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #05070b; color: #e8e0f0; font-family: system-ui, sans-serif; }
</style>
</head>
<body>
${content}
</body>
</html>`;

export function Html5Renderer({ artifact, mode, height, onInteraction }: RenderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resolvedHeight = height ?? (mode === 'compact' ? 360 : 640);

  // postMessage bridge: iframe → parent
  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.source === iframeRef.current?.contentWindow) {
      onInteraction?.({ type: 'message', payload: e.data });
    }
  }, [onInteraction]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const blob = new Blob([WRAPPER(artifact.content)], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  useEffect(() => () => URL.revokeObjectURL(blobUrl), [blobUrl]);

  return (
    <iframe
      ref={iframeRef}
      title={artifact.title}
      src={blobUrl}
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
      allow="autoplay; camera; microphone"
      style={{
        width: '100%',
        height: resolvedHeight,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        background: '#05070b',
      }}
    />
  );
}
```

**Security note:** `allow-scripts` is intentional here — HTML5 artifacts are generated by the gen-engine and are trusted content. External URLs are not passed through this renderer. The blob URL approach prevents the artifact from inheriting the app's origin, containing any XSS.

### `renderers/react-component.tsx`

Transpiles a JSX/TSX string client-side using `@babel/standalone`, injects into an isolated iframe. This is the hook for gen-engine React artifact output.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { RenderProps } from '../types';

const REACT_CDN = 'https://unpkg.com/react@18/umd/react.development.js';
const REACT_DOM_CDN = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
const BABEL_CDN = 'https://unpkg.com/@babel/standalone/babel.min.js';

const SHELL = (code: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>* { box-sizing: border-box; } body { background: #05070b; color: #e8e0f0; font-family: system-ui, sans-serif; padding: 16px; }</style>
<script src="${BABEL_CDN}"></script>
<script src="${REACT_CDN}"></script>
<script src="${REACT_DOM_CDN}"></script>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
${code}
// If no explicit render, look for default export and mount it
if (typeof App !== 'undefined') {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
} else if (typeof Component !== 'undefined') {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
}
</script>
</body>
</html>`;

export function ReactRenderer({ artifact, mode, height }: RenderProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const resolvedHeight = height ?? (mode === 'compact' ? 400 : 700);

  useEffect(() => {
    const blob = new Blob([SHELL(artifact.content)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [artifact.content]);

  if (!blobUrl) return null;

  return (
    <iframe
      title={artifact.title}
      src={blobUrl}
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: '100%',
        height: resolvedHeight,
        border: '1px solid rgba(155,100,255,0.2)',
        borderRadius: '12px',
        background: '#05070b',
      }}
    />
  );
}
```

### `renderers/pdf.tsx`

Uses `pdfjs-dist` for in-browser PDF rendering. For mobile-first (Samsung A35), falls back gracefully to an `<object>` tag if canvas rendering stalls.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import type { RenderProps } from '../types';

export function PdfRenderer({ artifact, mode, height }: RenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const resolvedHeight = height ?? (mode === 'compact' ? 480 : 800);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js';
        const src = artifact.content; // expects a URL or data URI
        const doc = await pdfjsLib.getDocument(src).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
        }
      } catch (err) {
        console.error('[PdfRenderer]', err);
      }
    })();
    return () => { cancelled = true; };
  }, [artifact.content]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    (async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
    })();
  }, [pdfDoc, currentPage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      anvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxHeight: resolvedHeight,
          objectFit: 'contain',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={navBtnStyle}
          >
            ← Prev
          </button>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', alignSelf: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={navBtnStyle}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  fontSize: '0.8rem',
};
```

**Dependency:** `pdfjs-dist` (lazy import — not bundled unless a PDF artifact is rendered)

### `renderers/csv.tsx`

Uses `papaparse` for parse, renders a scrollable data table. Zero external UI lib dependency.

```tsx
import React, { useMemo } from 'react';
import Papa from 'papaparse';
import type { RenderProps } from '../types';

export function CsvRenderer({ artifact, mode }: RenderProps) {
  const { data, meta } = useMemo(() => {
    return Papa.parse(artifact.content, { header: true, skipEmptyLines: true });
  }, [artifact.content]);

  const rows = data as Record<string, string>[];
  const headers = meta.fields ?? [];

  return (
    <div style={{ overflowX: 'auto', fontSize: mode === 'compact' ? '0.76rem' : '0.84rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              {headers.map(h => (
                <td key={h} style={tdStyle}>{row[h] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: '8px', textAlign: 'right' }}>
        {rows.length} rows · {headers.length} columns
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  color: 'rgba(200,170,255,0.9)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  color: 'rgba(255,255,255,0.7)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'top',
};
```

**Dependency:** `papaparse`

### `renderers/xml.tsx`

Formats and syntax-highlights XML with collapsible nodes.

```tsx
import React, { useState } from 'react';
import type { RenderProps } from '../types';

function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent--;
    formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
    if (node.match(/^<?\w[^/]*[^/]$/) && !node.startsWith('?')) indent++;
  });
  return formatted.replace(/\n$/, '').replace(/^</, '').replace(/>$/, '');
}

export function XmlRenderer({ artifact }: RenderProps) {
  const [expanded, setExpanded] = useState(true);
  const formatted = formatXml(artifact.content);
  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ ...navBtnStyle, marginBottom: '8px', fontSize: '0.75rem' }}
      >
        {expanded ? '▼ Collapse' : '▶ Expand'} XML
      </button>
      {expanded && (
        <pre style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '16px',
          overflowX: 'auto',
          color: 'rgba(180,220,255,0.85)',
          fontSize: '0.8rem',
          lineHeight: 1.5,
        }}>
          {formatted}
        </pre>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '5px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer',
  fontSize: '0.78rem',
};
```

### `renderers/image.tsx`

Handles both URL and base64. Supports jpg, png, gif, webp. Neural Aurora-style border treatment.

```tsx
import React, { useState } from 'react';
import type { RenderProps } from '../types';

export function ImageRenderer({ artifact, mode }: RenderProps) {
  const [zoomed, setZoomed] = useState(false);
  const src = artifact.content; // URL or data URI

  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={src}
        alt={artifact.title}
        onClick={() => setZoomed(z => !z)}
        style={{
          maxWidth: '100%',
          maxHeight: zoomed ? '90vh' : (mode === 'compact' ? 240 : 480),
          objectFit: 'contain',
          borderRadius: '12px',
          border: '1px solid rgba(180,120,255,0.2)',
          boxShadow: zoomed ? '0 0 40px rgba(180,120,255,0.3)' : 'none',
          cursor: 'zoom-in',
          transition: 'all 0.3s ease',
        }}
      />
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '6px' }}>
        {zoomed ? 'Click to shrink' : 'Click to expand'}
      </div>
    </div>
  );
}
```

### `renderers/audio.tsx`

Native `<audio>` with a simple Web Audio API waveform visualizer. Mobile-first controls.

```tsx
import React, { useRef, useEffect, useState } from 'react';
import type { RenderProps } from '../types';

export function AudioRenderer({ artifact, onInteraction }: RenderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#05070b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const hue = (i / bufferLength) * 280 + 200;
        ctx.fillStyle = `hsla(${hue},70%,60%,0.85)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
    };
  }, []);

  const handlePlay = () => {
    audioRef.current?.play();
    setPlaying(true);
    onInteraction?.({ type: 'play' });
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setPlaying(false);
    onInteraction?.({ type: 'pause' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      anvas
        ref={canvasRef}
        width={600}
        height={80}
        style={{ width: '100%', borderRadius: '10px', background: '#05070b' }}
      />
      <audio
        ref={audioRef}
        src={artifact.content}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
      />
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={playing ? handlePause : handlePlay} style={playBtnStyle}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <audio controls src={artifact.content} style={{ flex: 1, height: '36px' }} />
      </div>
    </div>
  );
}

const playBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  background: 'rgba(180,120,255,0.15)',
  border: '1px solid rgba(180,120,255,0.3)',
  borderRadius: '8px',
  color: '#d0b0ff',
  cursor: 'pointer',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
};
```

### `renderers/video.tsx`

Native HTML5 video with custom Neural Aurora frame treatment. Supports mp4 and webm.

```tsx
import React from 'react';
import type { RenderProps } from '../types';

export function VideoRenderer({ artifact, mode, height, onInteraction }: RenderProps) {
  const resolvedHeight = height ?? (mode === 'compact' ? 240 : 480);
  return (
    <div style={{
      borderRadius: '14px',
      overflow: 'hidden',
      border: '1px solid rgba(180,120,255,0.2)',
      boxShadow: '0 0 30px rgba(100,80,180,0.15)',
    }}>
      <video
        controls
        style={{ width: '100%', maxHeight: resolvedHeight, display: 'block', background: '#000' }}
        onPlay={() => onInteraction?.({ type: 'play' })}
        onPause={() => onInteraction?.({ type: 'pause' })}
      >
        <source src={artifact.content} type={artifact.mimeType ?? 'video/mp4'} />
        Your browser does not support HTML5 video.
      </video>
    </div>
  );
}
```

### `renderers/json.tsx`

Collapsible JSON tree — replaces the current flat `JSON.stringify` in `ArtifactRenderer.tsx`.

```tsx
import React, { useState } from 'react';
import type { RenderProps } from '../types';

function JsonNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  if (data === null) return <span style={{ color: '#888' }}>null</span>;
  if (typeof data !== 'object') {
    const color = typeof data === 'string' ? '#98c379' : typeof data === 'number' ? '#e5c07b' : '#e06c75';
    return <span style={{ color }}>{JSON.stringify(data)}</span>;
  }
  const isArray = Array.isArray(data);
  const entries = Object.entries(data as Record<string, unknown>);
  const brackets = isArray ? ['[', ']'] : ['{', '}'];
  return (
    <span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}
      >
        {open ? '▼' : '▶'}
      </button>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{brackets}</span>
      {open ? (
        <div style={{ paddingLeft: 16 }}>
          {entries.map(([k, v]) => (
            <div key={k} style={{ marginBottom: 2 }}>
              {!isArray && <span style={{ color: '#61afef' }}>"{k}": </span>}
              <JsonNode data={v} depth={depth + 1} />
            </div>
          ))}
        </div>
      ) : <span style={{ color: 'rgba(255,255,255,0.3)' }}> … </span>}
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{brackets[^1]}</span>
    </span>
  );
}

export function JsonRenderer({ artifact }: RenderProps) {
  let parsed: unknown;
  try { parsed = JSON.parse(artifact.content); } catch { parsed = artifact.content; }
  return (
    <pre style={{
      background: '#0d0f14',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '0.82rem',
      lineHeight: 1.6,
      overflowX: 'auto',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <JsonNode data={parsed} />
    </pre>
  );
}
```

### `renderers/code.tsx`

Syntax-highlighted code with a copy-to-clipboard action.

```tsx
import React, { useState } from 'react';
import type { RenderProps } from '../types';

export function CodeRenderer({ artifact, mode }: RenderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: copied ? '#98c379' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          fontSize: '0.72rem',
          zIndex: 1,
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <pre style={{
        background: '#0d0f14',
        borderRadius: '12px',
        padding: '16px 48px 16px 16px',
        fontSize: mode === 'compact' ? '0.78rem' : '0.85rem',
        lineHeight: 1.6,
        overflowX: 'auto',
        color: 'rgba(220,220,240,0.88)',
        fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {artifact.content}
      </pre>
    </div>
  );
}
```

### `renderers/text.tsx`

Plain text. Uses PLK-aware font if available via CSS custom property.

```tsx
import React from 'react';
import type { RenderProps } from '../types';

export function TextRenderer({ artifact, mode }: RenderProps) {
  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      color: 'rgba(255,255,255,0.82)',
      fontSize: mode === 'compact' ? '0.82rem' : '0.92rem',
      lineHeight: 1.7,
      fontFamily: 'var(--gv-plk-font, inherit)',
      padding: mode === 'compact' ? '0' : '4px 0',
    }}>
      {artifact.content}
    </div>
  );
}
```

***

## Step 6 — Update Existing Artifact Components

All of the following should replace their internal format dispatch with a single `<RenderingEngine>` import. No logic changes to those components — just a renderer swap.

| Component | Current behavior | Change |
|---|---|---|
| [`ArtifactRenderer.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactRenderer.tsx) | 3-branch format dispatch | **Replace entirely** with `RenderingEngine` re-export or thin wrapper |
| [`ArtifactPreview.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactPreview.tsx) | Partial format logic | Import `RenderingEngine`, remove internal dispatch |
| [`ArtifactPreviewer.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactPreviewer.tsx) | Partial format logic | Same |
| [`ArtifactDeepView.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactDeepView.tsx) | Unknown | Same |
| [`ArtifactExpandView.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactExpandView.tsx) | Unknown | Same |
| [`ArtifactScreen.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/components/ArtifactScreen.tsx) | Unknown | Same |

The `ArtifactRenderer.tsx` replacement is the simplest possible update:

```tsx
// client/src/components/ArtifactRenderer.tsx — full file replacement
// This file becomes a backward-compatible re-export wrapper.
// All format logic lives in client/src/lib/rendering/

export { RenderingEngine as ArtifactRenderer } from '../lib/rendering';
```

***

## Step 7 — Package Dependencies

Add to `client/package.json`:

```json
{
  "dependencies": {
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "papaparse": "^5.4.1",
    "pdfjs-dist": "^4.4.168"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14"
  }
}
```

`@babel/standalone` is loaded from CDN inside the React renderer iframe shell — **not** bundled (it's ~1MB). This is intentional and keeps the main bundle thin.

***

## Step 8 — Gen-Engine Pair Contract

For the rendering engine to be fully useful, the gen-engine must emit the correct `contentFormat` on each artifact. The current gen-engine `ArtifactType` already includes `"pdf-ready-html"` which should map to `contentFormat: "html"` (for static rendering) or `contentFormat: "pdf"` (for download-only scenarios).

Recommended additions to `shared/gen-engine/core.ts` — the `inferContentFormat` helper:

```typescript
export function inferContentFormat(
  type: ArtifactType,
  mimeType?: string
): ArtifactContentFormat {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'text/csv') return 'csv';
    if (mimeType === 'application/xml' || mimeType === 'text/xml') return 'xml';
  }
  switch (type) {
    case 'markdown':
    case 'blueprint-markdown':
    case 'session-recap':     return 'markdown';
    case 'pdf-ready-html':    return 'html';
    case 'blueprint-json':    return 'json';
    case 'code':              return 'code';
    case 'agent-prompt':
    case 'image-prompt':
    case 'marketing-copy':    return 'text';
    case 'share-card':        return 'html';
    case 'mind-map':          return 'html5';
    default:                  return 'text';
  }
}
```

***

## File Summary

| File | Action | Notes |
|---|---|---|
| `shared/gen-engine/types.ts` | **Edit** | Expand `ArtifactContentFormat`, add `mimeType?` to `GeneratedArtifact` |
| `shared/gen-engine/core.ts` | **Edit** | Add `inferContentFormat()` helper |
| `client/src/lib/rendering/types.ts` | **Create** | `RenderMode`, `RenderProps`, `RendererComponent` |
| `client/src/lib/rendering/registry.ts` | **Create** | `FORMAT_REGISTRY`, `getRenderer()` |
| `client/src/lib/rendering/RenderingEngine.tsx` | **Create** | Error boundary + Suspense dispatch |
| `client/src/lib/rendering/renderers/markdown.tsx` | **Create** | |
| `client/src/lib/rendering/renderers/html.tsx` | **Create** | Replaces `doc.write()` with `srcdoc` |
| `client/src/lib/rendering/renderers/html5.tsx` | **Create** | Blob URL + `allow-scripts` + postMessage bridge |
| `client/src/lib/rendering/renderers/react-component.tsx` | **Create** | Babel standalone + blob URL |
| `client/src/lib/rendering/renderers/pdf.tsx` | **Create** | `pdfjs-dist` lazy import |
| `client/src/lib/rendering/renderers/csv.tsx` | **Create** | `papaparse` |
| `client/src/lib/rendering/renderers/xml.tsx` | **Create** | |
| `client/src/lib/rendering/renderers/image.tsx` | **Create** | |
| `client/src/lib/rendering/renderers/audio.tsx` | **Create** | Web Audio API waveform |
| `client/src/lib/rendering/renderers/video.tsx` | **Create** | |
| `client/src/lib/rendering/renderers/json.tsx` | **Create** | Replaces flat `JSON.stringify` |
| `client/src/lib/rendering/renderers/code.tsx` | **Create** | Copy-to-clipboard |
| `client/src/lib/rendering/renderers/text.tsx` | **Create** | |
| `client/src/lib/rendering/index.ts` | **Create** | Re-export `RenderingEngine`, `FORMAT_REGISTRY` |
| `client/src/components/ArtifactRenderer.tsx` | **Replace** | Becomes thin re-export wrapper |

***

## Validation Commands

```bash
# After creating files:
npm run build                        # Vite build — confirm no type errors
npx tsc --noEmit                     # Type-check only
git diff --check                     # No whitespace errors

# Smoke test rendering engine:
# Navigate to any Creation Corner artifact → confirm format dispatch
# Test with html, markdown, csv, image artifacts in sequence
# Verify mobile Safari (Samsung A35) renders audio controls correctly
```

***

## Known Constraints

**Mobile-first (Samsung A35):** Web Audio API `AudioContext` is suspended on mobile until a user gesture fires it — the renderer's play button correctly gates audio context creation behind `handlePlay()`. The waveform canvas only draws after play.

**`allow-scripts` iframe:** Only used for `html5` and `react` formats. The content source is always the gen-engine — not user-submitted URLs. If external URL support is added later, this sandbox attribute must be reviewed.

**`pdfjs-dist` worker:** The worker URL points to unpkg CDN. For production hardening, the worker should be bundled locally via Vite's `url` import or a custom worker plugin. This is a P1 item post-launch.

**`@babel/standalone` in React renderer:** Loaded from CDN inside the iframe shell. This means the React renderer requires a network connection. An offline fallback should display a "React component preview requires network connection" message via the blob shell's `onerror`.

---

## References

1. [you_have_created_a_recursive_identity_machine.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/9c8c1c2e-d03a-4e63-afb4-a5d6cb34559f/you_have_created_a_recursive_identity_machine.md?AWSAccessKeyId=ASIA2F3EMEYEX3CEFZOE&Signature=gGlomsFdoNgJirY%2FfiIJXWOgHPU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEKr%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQCmBYU6WXrZOugoXGRcasQ43lka%2B0%2FOEf%2FWxJsUoNcyAgIgBCOEKQhPXYQ0vxH6oqnl34zd5s%2F28VSxAO6mx6nyvDkq8wQIcxABGgw2OTk3NTMzMDk3MDUiDFaTOcGXhtk9aKdZuCrQBNS7xP0Feh2FmEpDfWyVsLCdeKi0dLBAa7VK0UrQa4ZejFwVgoZ3oqBkoWe%2FQBQi1u7mAQB2RFlyHDe%2Bj8C7%2BLMs6iW5s5ZbJtTwEwgQdyFRtPCb%2Fw8XJs%2FDpoeXV9hGLGAkgMC472hsAn674JmhDksiZqYUyJ0evmnnCwKaflr%2Box8rEGirz7mvVNeMzFUjqbRAmmFdbBhixb%2BvUptbFp5BbnakoWFcU%2B3keHg3qX5Mh5M77VuewqnsnSIZe4aXSEB5P677%2BiSvNkTkzndqu4PIg5lmFHlJ9eEsuy%2FzEYA74jMQOxDtkRlm2IXNof%2BkbFc198F910k76vp0fOMkAAVTcozrWCI2Ap1SKUjVoiXohXtLZQqIktiIMWsNdnipvEjO4BuVmi5gka20LoSqq7ha75MJP3HbPvSJVNsgofAsRAP51TcO54f6p2QIrQLbJHFbB5GPerM1BUMyxgxOzDl8F2Y8ZPzadNFntMHTG9BtmmcSdQZDDFQKqIFe3toSgn6%2FcCl6wQyJBTlP56wOHnm2YhJ02pLGSQBIRoTurtU4%2FRfsjN7jw%2BfPzS1JEjbZxjRRTuvzScNvk1lwG9TGCrrs6ScPcfaf6ytfrlIX9Omg5N9Mva3AmjDW3SabWgZg0xlBfAoHbBzce74GDn2CdgF4rkvpAzR5HviGeN2eAU6SNOcLLxdLkBjjsMZDUISdEQETQWMDthtpCUdKFjLyQd0A38H6pp9ibqCFC6gmHs6H8%2BhSl%2FF4roWhmH4%2FE%2FkCum2pW5pG74MhylyIFwJFiYEw4a3E0QY6mAHz%2FLU2kCnqiae5RtbDUsFH9KyDXfVLYZwfeOCkvVxSFfLTyfjnZBBG3IC0qch0d7aODjg6JOldoERMiOWtqNxbxWJ1lsqV4AhRUc2Xwn0lsgbPNSjUuwFxXtIeLDIVt5ylE39byIIRZXC%2FNbmCoq2C9f%2FZiyTYsY6QUyUxDmphc2%2BNYLiYaaoqeoSeDVv8qB431OPrVTCaFA%3D%3D&Expires=1781605556) - DeepSeek Toggle Intelligence v2, v3, v3.2 and v4 I see it now. Not just the architecture, not just t...

