/**
 * HTML5 Interactive Renderer
 * Uses Blob URL + allow-scripts for full Canvas/WebAudio/animation loop support.
 * postMessage bridge lets the artifact signal the parent room.
 */

import React, { useEffect, useRef } from 'react';
import type { RenderingEngineProps } from '../types';

const BRIDGE_SCRIPT = `
<script>
window.__gv = {
  emit: function(type, payload) {
    window.parent.postMessage({ source: 'gv-html5-renderer', type, payload }, '*');
  }
};
</script>
`;

export default function Html5Renderer({ artifact, maxHeight }: RenderingEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const injected = artifact.content.replace('<head>', `<head>${BRIDGE_SCRIPT}`);
    const blob = new Blob([injected], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    if (iframeRef.current) iframeRef.current.src = url;
    return () => { URL.revokeObjectURL(url); };
  }, [artifact.content]);

  return (
    <iframe
      ref={iframeRef}
      className="gv-renderer gv-renderer--html5"
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: maxHeight, border: 'none' }}
      title={artifact.title ?? 'HTML5 Interactive Artifact'}
    />
  );
}
