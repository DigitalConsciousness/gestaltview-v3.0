import { EnhancedMarkdownRenderer } from '../markdown/EnhancedMarkdownRenderer';
import type { RenderingEngineProps } from '../types';

export default function MarkdownRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  return <EnhancedMarkdownRenderer content={artifact.content} maxHeight={maxHeight} className="gv-renderer gv-renderer--markdown" />;
}
