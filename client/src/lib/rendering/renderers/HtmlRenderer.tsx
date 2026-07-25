/**
 * HTML Renderer
 * Uses srcdoc instead of doc.write() — CSP-safe, no navigation.
 * Sandboxed: allow-same-origin allow-scripts allow-forms.
 */

import React from 'react';
import type { RenderingEngineProps } from '../types';

export default function HtmlRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  return (
    <iframe
      className="gv-renderer gv-renderer--html"
      srcDoc={artifact.content}
      sandbox="allow-same-origin allow-scripts allow-forms"
      style={{ width: '100%', height: maxHeight, border: 'none' }}
      title={artifact.title ?? 'HTML Artifact'}
    />
  );
}
