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
  const [open1, close1] = isArray ? ['[', ']'] : ['{', '}'];

  return (
    <span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}
      >
        {open ? '▼' : '▶'}
      </button>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{open1}</span>
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
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{close1}</span>
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
