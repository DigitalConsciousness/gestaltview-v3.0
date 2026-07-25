import React, { useState } from 'react';
import type { RenderProps } from '../types';

export function ImageRenderer({ artifact, mode }: RenderProps) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={artifact.content}
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
