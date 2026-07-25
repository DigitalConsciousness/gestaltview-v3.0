// GestaltView v2 — Billy API hardening tests
// © 2026 Keith Soyka / GestaltView

import { describe, expect, it } from 'vitest';
import { buildBootstrapMessage, buildFounderAppendix, truncatePromptValue } from '../billy';
import type { FounderContextRow } from '../_lib/supabase';

function createFounderContext(overrides: Partial<FounderContextRow> = {}): FounderContextRow {
  return {
    id: 'founder-context-1',
    user_id: 'user-1',
    plk_snapshot: { metaphors: ['loom', 'bucket', 'beautiful tapestry'], notes: 'context stays alive' },
    current_state: 'We were tracing the persistence bottleneck across the founder continuity lane.',
    mode_preference: 'synthesis',
    last_session_at: '2026-03-22T00:00:00.000Z',
    session_thread: 'Last time we were threading this through the Loom: founder continuity appears to stall after the model response should already be back.',
    confirmed_adult: true,
    created_at: '2026-03-21T00:00:00.000Z',
    updated_at: '2026-03-22T00:00:00.000Z',
    ...overrides,
  };
}

describe('truncatePromptValue', () => {
  it('flattens whitespace and preserves short strings', () => {
    expect(truncatePromptValue('  The Loom\n\n is   warm.  ', 80)).toBe('The Loom is warm.');
  });

  it('truncates oversized strings with an ellipsis', () => {
    const result = truncatePromptValue('abcdefghij', 5);
    expect(result).toBe('abcd…');
  });
});

describe('buildFounderAppendix', () => {
  it('keeps founder continuity prompt bounded when stored fields are oversized', () => {
    const appendix = buildFounderAppendix(
      createFounderContext({
        plk_snapshot: { giant: 'x'.repeat(6000) },
        session_thread: 'thread '.repeat(200),
        current_state: 'state '.repeat(220),
      })
    );

    expect(appendix).toContain('FOUNDER SESSION ACTIVE.');
    expect(appendix).toContain('PLK snapshot:');
    expect(appendix).toContain('Last session thread:');
    expect(appendix).toContain('Current state:');
    expect(appendix.length).toBeLessThan(3200);
    expect(appendix).toContain('…');
  });
});

describe('buildBootstrapMessage', () => {
  it('uses the trimmed founder thread when founder continuity exists', () => {
    const message = buildBootstrapMessage(createFounderContext(), 'chat');
    expect(message).toContain('Vibe mode is live.');
    expect(message).toContain('Where are we going this morning?');
  });

  it('falls back cleanly for anonymous chat mode', () => {
    const message = buildBootstrapMessage(null, 'chat');
    expect(message).toContain('Billy is in chat mode.');
  });
});
