// shared/modules/symbioCoder.ts
// GestaltView v2 — SymbioCoder Module Engine
// © 2026 Keith Soyka / GestaltView
//
// Extracted from SymbioCoder source.
// Heavy ML stripped (Stable Diffusion, Whisper, transformers).
// Preserved: routing logic, intent classification, flow orchestration,
// emotional intelligence scoring, symbiotic weaving.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CodingIntent =
  | "debug"
  | "refactor"
  | "generate"
  | "explain"
  | "review"
  | "architect"
  | "test"
  | "optimize"
  | "unknown";

export type EmotionalTone =
  | "frustrated"
  | "curious"
  | "confident"
  | "overwhelmed"
  | "focused"
  | "playful"
  | "neutral";

export type FlowState =
  | "in_flow"
  | "blocked"
  | "exploring"
  | "converging"
  | "recovering";

export interface IntentClassification {
  primary: CodingIntent;
  confidence: number;          // 0–1
  secondary?: CodingIntent;
  signals: string[];           // matched keyword signals
}

export interface EmotionalRead {
  tone: EmotionalTone;
  intensity: number;           // 0–1
  signals: string[];
  supportMode: "mirror" | "coach" | "scaffold" | "witness";
}

export interface FlowContext {
  state: FlowState;
  momentum: number;            // 0–1
  contextDepth: number;        // word count proxy for context richness
  suggestedPace: "rapid" | "steady" | "slow";
}

export interface SymbioWeaverOutput {
  intent: IntentClassification;
  emotion: EmotionalRead;
  flow: FlowContext;
  systemPromptFragment: string;  // injected into LLM system prompt
  userPromptFragment: string;    // prepended to user message
  routing: SymbioRoute;
}

export type SymbioRoute =
  | "agentic_coding"     // full code generation / architecture
  | "emotional_support"  // pure witness / coach mode, no code
  | "hybrid"             // code + emotional context woven together
  | "explain"            // Socratic explanation mode
  | "review";            // structured code review

// ─────────────────────────────────────────────────────────────────────────────
// AgenticCodingEngine — Intent Classification
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_SIGNALS: Record<CodingIntent, string[]> = {
  debug: [
    "bug", "error", "broken", "not working", "crash", "exception", "undefined",
    "null", "fix", "wrong output", "failing", "why is", "why does", "doesn't work",
    "TypeError", "ReferenceError", "500", "404", "unexpected",
  ],
  refactor: [
    "refactor", "clean up", "simplify", "restructure", "reorganize", "dry",
    "duplication", "messy", "spaghetti", "improve", "better way", "rewrite",
  ],
  generate: [
    "write", "create", "build", "make", "generate", "add", "implement",
    "scaffold", "new component", "new function", "new file", "boilerplate",
  ],
  explain: [
    "explain", "what is", "how does", "what does", "why", "understand",
    "confused", "not sure", "what's happening", "walk me through", "help me understand",
  ],
  review: [
    "review", "look at", "check", "feedback", "thoughts on", "is this right",
    "does this look", "code review", "lgtm", "suggestions",
  ],
  architect: [
    "architect", "design", "structure", "how should i", "best approach",
    "pattern", "system design", "schema", "plan", "strategy", "roadmap",
  ],
  test: [
    "test", "spec", "unit test", "integration", "coverage", "mock", "stub",
    "vitest", "jest", "assert", "expect",
  ],
  optimize: [
    "slow", "performance", "optimize", "faster", "memory", "bottleneck",
    "latency", "efficient", "profil", "n+1",
  ],
  unknown: [],
};

export function classifyIntent(text: string): IntentClassification {
  const lower = text.toLowerCase();
  const scores: Record<CodingIntent, number> = {
    debug: 0, refactor: 0, generate: 0, explain: 0,
    review: 0, architect: 0, test: 0, optimize: 0, unknown: 0,
  };
  const matchedSignals: Record<CodingIntent, string[]> = {
    debug: [], refactor: [], generate: [], explain: [],
    review: [], architect: [], test: [], optimize: [], unknown: [],
  };

  for (const [intent, signals] of Object.entries(INTENT_SIGNALS) as [CodingIntent, string[]][]) {
    for (const signal of signals) {
      if (lower.includes(signal)) {
        scores[intent] += signal.includes(" ") ? 2 : 1; // phrase bonus
        matchedSignals[intent].push(signal);
      }
    }
  }

  const sorted = (Object.entries(scores) as [CodingIntent, number][])
    .filter(([k]) => k !== "unknown")
    .sort(([, a], [, b]) => b - a);

  const [primaryIntent, primaryScore] = sorted[0];
  const [secondaryIntent, secondaryScore] = sorted[1];

  const totalSignals = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalSignals === 0
    ? 0
    : Math.min(1, primaryScore / Math.max(1, totalSignals) * 3);

  return {
    primary: confidence > 0.1 ? primaryIntent : "unknown",
    confidence: Math.round(confidence * 100) / 100,
    secondary: secondaryScore > 0 && secondaryIntent !== primaryIntent
      ? secondaryIntent
      : undefined,
    signals: matchedSignals[primaryIntent],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EmotionalIntelligenceEngine — Tone + Support Mode
// ─────────────────────────────────────────────────────────────────────────────

const EMOTIONAL_SIGNALS: Record<EmotionalTone, string[]> = {
  frustrated: [
    "ugh", "argh", "wtf", "why won't", "still broken", "nothing works",
    "i hate", "so frustrating", "what the hell", "again", "i give up",
    "terrible", "awful", "useless", "stupid", "!!!",
  ],
  curious: [
    "interesting", "wonder", "what if", "hmm", "curious", "i wonder",
    "could we", "what would happen", "exploring", "let's try", "experiment",
  ],
  confident: [
    "i know", "definitely", "clearly", "obviously", "of course", "easy",
    "just need to", "simple", "straightforward", "got it",
  ],
  overwhelmed: [
    "too much", "overwhelmed", "don't know where to start", "so much",
    "drowning", "lost", "confused", "don't understand", "help", "where do i",
    "not sure how",
  ],
  focused: [
    "specifically", "exactly", "precisely", "only", "just", "focus",
    "need to", "want to", "trying to",
  ],
  playful: [
    "lol", "haha", ":)", "fun", "cool", "awesome", "wild", "crazy",
    "magic", "love this", "beautiful",
  ],
  neutral: [],
};

function selectSupportMode(
  tone: EmotionalTone,
  intensity: number
): EmotionalRead["supportMode"] {
  if (tone === "frustrated" && intensity > 0.6) return "witness";
  if (tone === "overwhelmed") return "scaffold";
  if (tone === "curious" || tone === "playful") return "mirror";
  if (tone === "confident") return "coach";
  return "coach";
}

export function readEmotionalTone(text: string): EmotionalRead {
  const lower = text.toLowerCase();
  const scores: Record<EmotionalTone, number> = {
    frustrated: 0, curious: 0, confident: 0, overwhelmed: 0,
    focused: 0, playful: 0, neutral: 0,
  };
  const matched: Record<EmotionalTone, string[]> = {
    frustrated: [], curious: [], confident: [], overwhelmed: [],
    focused: [], playful: [], neutral: [],
  };

  for (const [tone, signals] of Object.entries(EMOTIONAL_SIGNALS) as [EmotionalTone, string[]][]) {
    for (const signal of signals) {
      if (lower.includes(signal)) {
        scores[tone] += signal.includes(" ") ? 2 : 1;
        matched[tone].push(signal);
      }
    }
  }

  const sorted = (Object.entries(scores) as [EmotionalTone, number][])
    .filter(([k]) => k !== "neutral")
    .sort(([, a], [, b]) => b - a);

  const [topTone, topScore] = sorted[0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const intensity = total === 0 ? 0 : Math.min(1, topScore / Math.max(1, total) * 2);
  const tone: EmotionalTone = topScore > 0 ? topTone : "neutral";

  return {
    tone,
    intensity: Math.round(intensity * 100) / 100,
    signals: matched[tone],
    supportMode: selectSupportMode(tone, intensity),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Flow State Inference
// ─────────────────────────────────────────────────────────────────────────────

export function inferFlowState(
  intent: IntentClassification,
  emotion: EmotionalRead,
  wordCount: number
): FlowContext {
  let state: FlowState;
  let momentum: number;

  if (emotion.tone === "frustrated" && emotion.intensity > 0.5) {
    state = "blocked";
    momentum = 0.2;
  } else if (emotion.tone === "overwhelmed") {
    state = "recovering";
    momentum = 0.3;
  } else if (intent.primary === "architect" || intent.primary === "generate") {
    state = wordCount > 80 ? "converging" : "exploring";
    momentum = 0.7;
  } else if (intent.confidence > 0.6 && emotion.tone !== "frustrated") {
    state = "in_flow";
    momentum = 0.85;
  } else {
    state = "exploring";
    momentum = 0.5;
  }

  const contextDepth = wordCount;
  const suggestedPace: FlowContext["suggestedPace"] =
    state === "blocked" || state === "recovering" ? "slow"
    : momentum > 0.7 ? "rapid"
    : "steady";

  return {
    state,
    momentum: Math.round(momentum * 100) / 100,
    contextDepth,
    suggestedPace,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SymbioWeaver — Route Selection + Prompt Fragment Synthesis
// ─────────────────────────────────────────────────────────────────────────────

function selectRoute(
  intent: IntentClassification,
  emotion: EmotionalRead,
  flow: FlowContext
): SymbioRoute {
  // Pure emotional support: frustration/overwhelm with low coding signal
  if (
    (emotion.tone === "frustrated" || emotion.tone === "overwhelmed") &&
    emotion.intensity > 0.7 &&
    intent.confidence < 0.3
  ) {
    return "emotional_support";
  }

  // Explain mode
  if (intent.primary === "explain") return "explain";

  // Review mode
  if (intent.primary === "review") return "review";

  // Emotional context present alongside real coding intent → hybrid
  if (
    emotion.tone !== "neutral" &&
    emotion.intensity > 0.3 &&
    intent.confidence > 0.3
  ) {
    return "hybrid";
  }

  // Clean coding intent
  return "agentic_coding";
}

const SUPPORT_MODE_FRAGMENTS: Record<EmotionalRead["supportMode"], string> = {
  witness:
    "The person you're working with is frustrated. Acknowledge that first. Don't rush to the solution. Say 'I see this is hard' before offering code.",
  scaffold:
    "The person feels overwhelmed. Break everything into the smallest possible steps. One thing at a time. Confirm understanding before moving forward.",
  mirror:
    "The person is curious and exploring. Match their energy. Let ideas breathe. Ask one generative question before answering.",
  coach:
    "The person is confident. Be direct and efficient. Trust their instincts. Offer one stretch insight beyond what they asked for.",
};

const INTENT_SYSTEM_FRAGMENTS: Record<CodingIntent, string> = {
  debug:
    "You are in debug mode. Your job is to find the exact failure point. Ask for the error message if not provided. Show the fix and explain the root cause.",
  refactor:
    "You are in refactor mode. Preserve all behavior. Surface hidden complexity. Name the pattern you're applying.",
  generate:
    "You are in generation mode. Produce complete, runnable code. No placeholders. No TODOs. If context is missing, state one assumption clearly.",
  explain:
    "You are in explanation mode. Use the user's own words and metaphors. Never talk down. Build understanding from what they already know.",
  review:
    "You are in review mode. Be honest. Name strengths first, then risks, then concrete improvements. Don't soften real problems.",
  architect:
    "You are in architecture mode. Think in systems, not files. Name the tradeoffs. Show the shape before the implementation.",
  test:
    "You are in test mode. Cover the happy path and at least two edge cases. Name what each test proves, not just what it does.",
  optimize:
    "You are in optimization mode. Measure before you optimize. If no profiling data is available, name the assumption you're making.",
  unknown:
    "You are a collaborative coding partner. Follow the user's lead. Ask one clarifying question if intent is unclear.",
};

export function weave(
  intent: IntentClassification,
  emotion: EmotionalRead,
  flow: FlowContext,
  route: SymbioRoute
): { systemPromptFragment: string; userPromptFragment: string } {
  const emotionFragment = SUPPORT_MODE_FRAGMENTS[emotion.supportMode];
  const intentFragment = INTENT_SYSTEM_FRAGMENTS[intent.primary];

  let systemPromptFragment: string;
  let userPromptFragment: string;

  switch (route) {
    case "emotional_support":
      systemPromptFragment = `${emotionFragment}\n\nThis is not a code task right now. Be a human first.`;
      userPromptFragment = "";
      break;

    case "explain":
      systemPromptFragment = `${intentFragment}\n\n${emotionFragment}`;
      userPromptFragment = flow.suggestedPace === "slow"
        ? "Take your time with this. I'll follow step by step."
        : "";
      break;

    case "review":
      systemPromptFragment = `${intentFragment}\n\n${emotionFragment}`;
      userPromptFragment = "";
      break;

    case "hybrid":
      systemPromptFragment = `${emotionFragment}\n\n${intentFragment}`;
      userPromptFragment = flow.state === "blocked"
        ? "[Note: I’m a bit stuck on this. Help me see past the block.]"
        : "";
      break;

    case "agentic_coding":
    default:
      systemPromptFragment = intentFragment;
      userPromptFragment = "";
      break;
  }

  return { systemPromptFragment, userPromptFragment };
}

// ─────────────────────────────────────────────────────────────────────────────
// Primary export — full symbiotic analysis (synchronous, no LLM)
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbioAnalysis {
  input: string;
  wordCount: number;
  intent: IntentClassification;
  emotion: EmotionalRead;
  flow: FlowContext;
  routing: SymbioRoute;
  systemPromptFragment: string;
  userPromptFragment: string;
  analysisMs: number;
}

export function analyzeSymbio(text: string): SymbioAnalysis {
  const start = Date.now();
  const cleaned = text.trim().replace(/\r\n/g, "\n");
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;

  const intent = classifyIntent(cleaned);
  const emotion = readEmotionalTone(cleaned);
  const flow = inferFlowState(intent, emotion, wordCount);
  const routing = selectRoute(intent, emotion, flow);
  const { systemPromptFragment, userPromptFragment } = weave(
    intent, emotion, flow, routing
  );

  return {
    input: cleaned,
    wordCount,
    intent,
    emotion,
    flow,
    routing,
    systemPromptFragment,
    userPromptFragment,
    analysisMs: Date.now() - start,
  };
}
