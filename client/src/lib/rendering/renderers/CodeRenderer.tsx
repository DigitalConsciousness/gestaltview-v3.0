/**
 * Code Renderer
 * Syntax-highlighted <pre> with copy-to-clipboard.
 * Language badge from artifact.language or filename extension.
 */

import React, { useState } from 'react';
import type { RenderingEngineProps } from '../types';

export default function CodeRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const [copied, setCopied] = useState(false);

  const lang = artifact.language
    ?? artifact.filename?.split('.').pop()
    ?? (artifact.format === 'python' || artifact.contentFormat === 'python' ? 'python' : undefined)
    ?? 'code';

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="gv-renderer gv-renderer--code">
      <div className="gv-code-header">
        <span className="gv-code-lang">{lang}</span>
        <button className="gv-code-copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <pre className="gv-code-pre">
          <code>{artifact.content}</code>
        </pre>
      </div>
    </div>
  );
}
