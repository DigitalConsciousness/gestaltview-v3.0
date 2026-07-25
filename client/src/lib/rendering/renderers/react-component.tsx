import React, { useEffect, useState } from 'react';
import type { RenderProps } from '../types';

const BABEL_CDN = 'https://unpkg.com/@babel/standalone/babel.min.js';
const REACT_CDN = 'https://unpkg.com/react@18/umd/react.development.js';
const REACT_DOM_CDN = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';

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
