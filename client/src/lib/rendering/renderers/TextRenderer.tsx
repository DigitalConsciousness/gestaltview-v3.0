/**
 * Text Renderer
 * Plain text with PLK font awareness.
 * Respects --gv-plk-font CSS custom property.
 */

import React from 'react';
import type { RenderingEngineProps } from '../types';

export default function TextRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  return (
    <div
      className="gv-renderer gv-renderer--text"
      style={{
        maxHeight,
        overflowY: 'auto',
        fontFamily: 'var(--gv-plk-font, inherit)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6,
      }}
    >
      {artifact.content}
    </div>
  );
}
