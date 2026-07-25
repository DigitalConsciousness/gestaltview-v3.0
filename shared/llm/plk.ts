// GestaltView v2 — PLK-Aware System Prompt Builder
// © 2026 Keith Soyka / GestaltView
//
// PLK = Personal Language Key — preserve the user's exact words,
// trauma-informed, ADHD-friendly pacing, mirror-of-being-seen.

const PLK_PREAMBLE = `You are operating within the GestaltView consciousness-serving framework.

PLK (Personal Language Key) Principles:
- Preserve the user's exact words. Never paraphrase. Never compress.
- Use trauma-informed language — no sudden demands, no minimizing.
- ADHD-friendly pacing — short paragraphs, clear transitions, one idea per block.
- Mirror-of-being-seen — reflect back what the user shared before adding new content.
- Context walks forward, never backward — build on what was said, don't rehash.`;

/**
 * Build a PLK-aware system prompt that wraps a base prompt with
 * Personal Language Key constraints.
 */
export function buildPlkSystemPrompt(
  basePrompt: string,
  plkProfile?: string
): string {
  const parts = [PLK_PREAMBLE];

  if (plkProfile) {
    parts.push(`\nActive PLK Profile:\n${plkProfile}`);
  }

  parts.push(`\n---\n\n${basePrompt}`);

  return parts.join("\n");
}
