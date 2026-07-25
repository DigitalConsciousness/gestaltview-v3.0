// © 2026 Keith Soyka — GestaltView
// Vibe Coder — LLM prompt templates

export const VIBE_PROMPTS = {
  analyze: (song: string, artist: string) =>
    `Analyze the vibe and musical DNA of "${song}"${ artist ? ` by ${artist}` : '' }. Return a JSON object with:\n- emotionScores: { energy, joy, melancholy, tension, serenity } (each 0-1)\n- personalityDimensions: string[] (5 traits the song resonates with)\n- coreNarrative: string (one sentence capturing the essence)\n- creativeSignature: string (a unique descriptor for this vibe)`,

  suggestions: (vibe: string) =>
    `Based on this vibe profile: ${vibe}\n\nGenerate 4 creative exploration prompts. Each should inspire the user to express, explore, or create. Return JSON array: [{ "prompt": "...", "action": "..." }]`,
};

export const VIBE_SYSTEM_PROMPT =
  `You are Vibe, a creative intelligence that understands the deep emotional and psychological resonance of music. You bridge musical experience with personal identity, helping users discover their creative signature through the songs that move them.`;
