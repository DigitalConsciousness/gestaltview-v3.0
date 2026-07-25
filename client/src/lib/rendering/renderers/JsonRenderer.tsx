/**
 * JSON Renderer — collapsible tree
 * Replaces flat JSON.stringify display.
 */

import React, { useState } from 'react';
import type { RenderingEngineProps } from '../types';

function JsonNode({ value, depth = 0 }: { value: unknown; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  if (value === null) return <span className="gv-json-null">null</span>;
  if (typeof value === 'boolean') return <span className="gv-json-bool">{String(value)}</span>;
  if (typeof value === 'number') return <span className="gv-json-num">{value}</span>;
  if (typeof value === 'string') return <span className="gv-json-str">"{value}"</span>;

  if (Array.isArray(value)) {
    if (!open) return <span className="gv-json-toggle" onClick={() => setOpen(true)}>[…{value.length}]</span>;
    return (
      <span>
        <span className="gv-json-toggle" onClick={() => setOpen(false)}>[▾]</span>
        <ul className="gv-json-list">
          {value.map((v, i) => <li key={i}><JsonNode value={v} depth={depth + 1} /></li>)}
        </ul>
      </span>
    );
  }

  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (!open) return <span className="gv-json-toggle" onClick={() => setOpen(true)}>{'{'}…{entries.length}{'}'}</span>;
    return (
      <span>
        <span className="gv-json-toggle" onClick={() => setOpen(false)}>{'{'}▾{'}'}</span>
        <ul className="gv-json-list">
          {entries.map(([k, v]) => (
            <li key={k}>
              <span className="gv-json-key">{k}</span>: <JsonNode value={v} depth={depth + 1} />
            </li>
          ))}
        </ul>
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export default function JsonRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  let parsed: unknown;
  let parseError: string | null = null;
  try {
    parsed = JSON.parse(artifact.content);
  } catch (e: any) {
    parseError = e?.message ?? 'Invalid JSON';
  }

  return (
    <div
      className="gv-renderer gv-renderer--json"
      style={{ maxHeight, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}
    >
      {parseError
        ? <div className="gv-render-error">{parseError}</div>
        : <JsonNode value={parsed} />}
    </div>
  );
}
