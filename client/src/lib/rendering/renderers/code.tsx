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
