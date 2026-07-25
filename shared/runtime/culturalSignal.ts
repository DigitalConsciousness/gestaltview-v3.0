const ALICE_IN_CHAINS_WOULD_TOKENS = ["flood", "same old trip", "big mistake", "my way"];

export function detectCulturalSignal(input: string) {
  const normalized = input.toLowerCase();
  const matches = ALICE_IN_CHAINS_WOULD_TOKENS.filter((token) => normalized.includes(token)).length;

  if (matches >= 2) {
    return {
      kind: "song_lyric" as const,
      confidence: 0.94,
      title: "Would?",
      artist: "Alice in Chains",
      route: "ask_user" as const,
    };
  }

  return {
    kind: "unknown" as const,
    confidence: 0,
    route: "tribunal" as const,
  };
}
