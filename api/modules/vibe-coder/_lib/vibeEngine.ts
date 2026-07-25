// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Engine utilities

export interface EmotionScores {
  energy: number;
  joy: number;
  melancholy: number;
  tension: number;
  serenity: number;
}

export function normalizeEmotionScores(raw: Record<string, number>): EmotionScores {
  const defaults = { energy: 0.5, joy: 0.5, melancholy: 0.5, tension: 0.5, serenity: 0.5 };
  const merged = { ...defaults, ...raw };
  return {
    energy: Math.max(0, Math.min(1, merged.energy)),
    joy: Math.max(0, Math.min(1, merged.joy)),
    melancholy: Math.max(0, Math.min(1, merged.melancholy)),
    tension: Math.max(0, Math.min(1, merged.tension)),
    serenity: Math.max(0, Math.min(1, merged.serenity)),
  };
}

export function deriveDominantEmotion(scores: EmotionScores): string {
  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "serenity";
}

export function vibeToNeuralAuroraGradient(scores: EmotionScores): string {
  const dominant = deriveDominantEmotion(scores);
  const map: Record<string, string> = {
    energy: 'from-orange-500 via-red-500 to-pink-500',
    joy: 'from-yellow-400 via-green-400 to-cyan-400',
    melancholy: 'from-blue-900 via-indigo-800 to-purple-900',
    tension: 'from-red-800 via-rose-700 to-orange-600',
    serenity: 'from-sky-400 via-teal-400 to-emerald-400',
  };
  return map[dominant] ?? 'from-purple-500 via-pink-500 to-blue-500';
}
