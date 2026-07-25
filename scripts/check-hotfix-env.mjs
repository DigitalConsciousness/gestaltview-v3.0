const REQUIRED_CORE = [
  ["SUPABASE_URL", "VITE_SUPABASE_URL"],
  ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"],
  ["VITE_SUPABASE_URL"],
  ["VITE_SUPABASE_ANON_KEY"],
];

function firstPresent(env, keys) {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

export function summarizeHotfixEnv(env = process.env) {
  const coreReady = REQUIRED_CORE.every((group) => Boolean(firstPresent(env, group)));
  const hasSessionSecret = Boolean(firstPresent(env, ["SESSION_SECRET"]));
  const hasBillySecret = Boolean(firstPresent(env, ["BILLY_API_SECRET"]));
  const hasTranscriptoryProvider = Boolean(
    firstPresent(env, [
      "ASSEMBLYAI_API_KEY",
      "BILLY_TRANSCRIPTION_URL",
      "GROQ_API_KEY",
      "HUGGINGFACE_API_KEY",
      "HF_API_TOKEN",
    ]),
  );

  return {
    coreRuntime: {
      status: coreReady ? "ready" : "blocked",
      missing: coreReady ? [] : ["SUPABASE runtime keys"],
    },
    session: {
      status: hasSessionSecret ? "ready" : "action_required",
      message: hasSessionSecret
        ? "Session signing available."
        : "Set a dev-only SESSION_SECRET for local session-backed flows.",
    },
    billyDiagnose: {
      status: hasBillySecret ? "ready" : "disabled",
      message: hasBillySecret
        ? "Billy diagnose mode enabled."
        : "Billy diagnose mode disabled without BILLY_API_SECRET.",
    },
    transcriptory: {
      status: hasTranscriptoryProvider ? "ready" : "degraded",
      message: hasTranscriptoryProvider
        ? "At least one transcription provider is available."
        : "Audio capture may persist, but server-side transcription will not complete.",
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(summarizeHotfixEnv(), null, 2));
}
