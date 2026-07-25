/**
 * Image Renderer
 * Accepts: URL, data URI (base64), or raw base64 string.
 * Click-to-zoom via native <dialog> or full-screen overlay.
 * Neural Aurora border treatment by default.
 */

import React, { useState } from 'react';
import type { RenderingEngineProps } from '../types';

function toSrc(content: string, mimeType?: string): string {
  if (content.startsWith('http') || content.startsWith('blob:') || content.startsWith('data:')) {
    return content;
  }
  // raw base64
  const mime = mimeType ?? 'image/png';
  return `data:${mime};base64,${content}`;
}

export default function ImageRenderer({ artifact }: RenderingEngineProps) {
  const [zoomed, setZoomed] = useState(false);
  const src = toSrc(artifact.content, artifact.mimeType);

  return (
    <>
      <div className="gv-renderer gv-renderer--image" onClick={() => setZoomed(true)} style={{ cursor: 'zoom-in' }}>
        <img
          src={src}
          alt={artifact.title ?? 'GestaltView artifact'}
          style={{ maxWidth: '100%', display: 'block' }}
        />
      </div>
      {zoomed && (
        <div
          className="gv-image-zoom-overlay"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-label="Full size image"
        >
          <img
            src={src}
            alt={artifact.title ?? 'GestaltView artifact'}
            style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}
