/**
 * React JSX Renderer
 * Transpiles JSX string client-side via @babel/standalone loaded in iframe.
 * Convention: artifact.content must export default App or Component.
 * @babel/standalone loads from CDN inside the iframe — zero main-bundle impact.
 */

import React, { useEffect, useRef } from 'react';
import type { RenderingEngineProps } from '../types';

function buildShell(jsxCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<style>body{margin:0;background:transparent;font-family:inherit;}</style>
</head>
<body><div id="root"></div>
<script type="text/babel">
${jsxCode}
const _Component = typeof App !== 'undefined' ? App : (typeof Component !== 'undefined' ? Component : () => React.createElement('pre', null, 'No default export found (App or Component).'));
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(_Component));
</script>
</body></html>`;
}

export default function ReactRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const html = buildShell(artifact.content);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [artifact.content]);

  return (
    <iframe
      ref={iframeRef}
      className="gv-renderer gv-renderer--react"
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: maxHeight, border: 'none' }}
      title={artifact.title ?? 'React Artifact'}
    />
  );
}
