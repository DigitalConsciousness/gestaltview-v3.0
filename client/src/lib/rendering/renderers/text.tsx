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
