import { describe, it, expect } from 'vitest';
import { getRenderer } from '@shared/rendering';

describe('Rendering dispatcher', () => {
  it('returns the correct renderer for markdown', () => {
    const renderer = getRenderer('markdown');
    expect(renderer.kind).toBe('markdown');
    expect(renderer.formats()).toContain('html');
  });

  it('throws for unknown artifact kinds', () => {
    expect(() => getRenderer('unknown_kind')).toThrow();
  });

  it('detects unsupported formats', async () => {
    const renderer = getRenderer('markdown');
    await expect(renderer.render('# Test', 'pdf')).rejects.toThrow();
  });
});
