import React, { useMemo } from 'react';
import Papa from 'papaparse';
import type { RenderProps } from '../types';

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  color: 'rgba(200,170,255,0.9)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  color: 'rgba(255,255,255,0.7)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'top',
};

export function CsvRenderer({ artifact, mode }: RenderProps) {
  const { data, meta } = useMemo(
    () => Papa.parse(artifact.content, { header: true, skipEmptyLines: true }),
    [artifact.content]
  );

  const rows = data as Record<string, string>[];
  const headers = meta.fields ?? [];

  return (
    <div style={{ overflowX: 'auto', fontSize: mode === 'compact' ? '0.76rem' : '0.84rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
              {headers.map(h => <td key={h} style={tdStyle}>{row[h] ?? ''}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: '8px', textAlign: 'right' }}>
        {rows.length} rows · {headers.length} columns
      </div>
    </div>
  );
}
