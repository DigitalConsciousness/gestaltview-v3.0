import React, { useState } from 'react';
import type { RenderProps } from '../types';

function formatXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent--;
    formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';
    if (node.match(/^<?\w[^/]*[^/]$/) && !node.startsWith('?')) indent++;
  });
  return formatted.replace(/\n$/, '').replace(/^</, '').replace(/>$/, '');
}

export function XmlRenderer({ artifact }: RenderProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '5px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          fontSize: '0.78rem',
          marginBottom: '8px',
        }}
      >
        {expanded ? '▼ Collapse' : '▶ Expand'} XML
      </button>
      {expanded && (
        <pre style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '16px',
          overflowX: 'auto',
          color: 'rgba(180,220,255,0.85)',
          fontSize: '0.8rem',
          lineHeight: 1.5,
        }}>
          {formatXml(artifact.content)}
        </pre>
      )}
    </div>
  );
}
