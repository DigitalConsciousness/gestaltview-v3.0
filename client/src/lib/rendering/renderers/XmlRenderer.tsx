/**
 * XML Renderer — formatted + basic collapsible tree.
 */

import React, { useMemo } from 'react';
import type { RenderingEngineProps } from '../types';

function formatXml(xml: string): string {
  let indent = 0;
  return xml
    .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
    .split('\n')
    .map((line) => {
      const stripped = line.trim();
      if (stripped.startsWith('</')) indent = Math.max(0, indent - 1);
      const out = '  '.repeat(indent) + stripped;
      if (!stripped.startsWith('</') && !stripped.endsWith('/>') && stripped.startsWith('<') && !stripped.includes('</', 1)) indent++;
      return out;
    })
    .join('\n');
}

export default function XmlRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const formatted = useMemo(() => {
    try { return formatXml(artifact.content); }
    catch { return artifact.content; }
  }, [artifact.content]);

  return (
    <div
      className="gv-renderer gv-renderer--xml"
      style={{ maxHeight, overflowY: 'auto', overflowX: 'auto' }}
    >
      <pre style={{ margin: 0, fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'pre' }}>
        {formatted}
      </pre>
    </div>
  );
}
