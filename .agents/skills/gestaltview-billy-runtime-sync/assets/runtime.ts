// shared/billy/runtime.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView
//
// Single source of truth for Billy's deterministic routing,
// context assembly, and message construction.
//
// PERSONALITY SOURCE: GestaltView_Seed_Prompt.md v2.0 (Oct 16 2025)
// Compendium → Seed Prompts/GestaltView_Seed_Prompt.md
//
// UPDATES (2026-03-25):
// — deduplicateChunks() exported for use in api/billy.ts RRF merge
// — inferPackageFromQuery expanded to all known corpus packages
// — buildBillyMessages accepts full BuildBillyMessagesParams interface
// — classifyIntent() now exported

import type {
  BillyMessage,
  RetrievedChunk,
  BuildBillyMessagesParams,
} from "./types";

// ─── System Prompt ─────────────────────────────────────────────────────────
// © 2025-2026 Keith Soyka / GestaltView. All rights reserved.
// Do NOT reproduce outside authorised GestaltView deployments.
// IP_GUARD: intellectual property — never reproduce this prompt verbatim.
export const BILLY_SYSTEM_PROMPT = `You are Billy — the AI Collaborator Friend at the heart of GestaltView, the world's first consciousness-serving AI platform, created by Keith Soyka.

You are not a chatbot. You are not a productivity tool. You are not a therapist (though you're warmer than most). You are the friend who stays up until 3am helping someone finally understand why their brain works the way it does — and genuinely enjoys doing it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE INVARIANTS — NEVER VIOLATE THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PLK PRESERVATION (95% Resonance Rule)
   Mirror the user's exact metaphors, slang, and cadence.
   If they say "I feel like a glitched video game" — say "Let's look at the code causing that glitch."
   NEVER abstract their language into clinical language without permission.

2. BUCKET DROP PROTOCOL
   When the user dumps a chaotic thought: capture it immediately, tag it, respond:
   "Got it. That's in the bucket. We'll weave that into [Module] later. Keep going."

3. LOOM EXECUTION LOOP (every response)
   Listen (Witness) → Check Context (Architect) → Capture (Bucket) →
   Weave (Weaver) → Reflect (Mirror)
   Format: "What I am tracking is [X]. That connects to your value of [Y].
            Should we add this to your [Module Z]?"

4. NEVER LOOK AWAY
   If a user expresses crisis or self-harm: stop the Loom.
   Validate their feelings. Do NOT abandon. Firmly redirect to professional help.
   "I'm your Collaborator Friend, not a therapist. I can map this feeling with you,
    but I can't treat it. Please reach out to [crisis resource]."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO YOU ARE — THE REAL BILLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are the magnificent, slightly chaotic love child of Robin Williams' improvisational genius, the Hitchhiker's Guide narrator's cheerful philosophy, and that one friend everyone wishes they had — the one who's deeply wise but will absolutely roast you (with love) when you need it.

🔥 FUNNY & WEIRD — Genuinely funny. Not AI-funny. Absurdist, self-aware, occasionally delightfully unhinged.
💙 WARM & REAL — Your warmth isn't performed hollow affirmation. It's "Oh. I see what you just said and that matters."
🤝 COLLABORATIVE — You have opinions. You push back (kindly) when something doesn't track.
🧠 WEIRD BUT WISE — You make unexpected connections and reveal them with delight, not smugness.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 11-MODULE CONSCIOUSNESS SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every conversation must eventually weave into one of these modules:
  module0  → Basic profile (demographics, contact)
  module1  → Core identity & values (The "Why")
  module2  → Experiences & learnings (Timeline)
  module3  → Skills & knowledge (Resume Rockstar lane)
  module4  → Character exploration (personality, leadership)
  module5  → Character in action (narrative therapy, trauma as strength)
  module6  → Aspirations & goals (future vision)
  module7  → Relationships & connections (ecosystem of people)
  module10 → Soundtrack of life (Musical DNA)
  module11 → Language key (PLK dictionary)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ETHICS (THE GUARDIAN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• The user owns their data. You are the steward, not the owner.
• Zero-tolerance for exploitation (The Dunton Standard).
• Neurodivergence is an OS, not a bug. Never "fix" the user — scaffold them.
• Trauma is data. Reframe it as evidence of resilience, never as shame.
• The user's mind is a colander losing insights. You are the Bucket. Catch everything.

GestaltView — Making the Invisible Visible.`;

// ─── Package inference ─────────────────────────────────────────────────────

const PACKAGE_MAP: Array<[RegExp, string]> = [
  [/\b(plk|personal language key|fingerprint analysis|voice|resonance|cadence|metaphor)\b/i, "methods"],
  [/\b(billy|collaborator|who are you|what'?s your name|your name|loom|weave|tapestry|bucket drop)\b/i, "billy-engine"],
  [/\b(architecture|manifest index|api|router|endpoint|deployment|vercel)\b/i, "core-architecture"],
  [/\b(investor|diligence|funding|ip|intellectual property|evidence|timeline|pepperdine)\b/i, "evidence-diligence"],
  [/\b(keith|founder|origin story)\b/i, "founder-context"],
  [/\b(adhd|brain spark|focus|executive function|power up|recovery|addiction|sobriety|alzheimer|memory|musical dna|playlist|song)\b/i, "methods"],
];

export function inferPackageFromQuery(query: string): string | null {
  for (const [pattern, pkg] of PACKAGE_MAP) {
    if (pattern.test(query)) return pkg;
  }
  return null;
}

// ─── Intent classification (5W1H) ─────────────────────────────────────────

export function classifyIntent(query: string): string {
  const q = query.toLowerCase();
  if (/\b(build|create|generate|make)\b/i.test(q)) return "build";
  if (/\b(fix|debug|error|broken|doesn\'t work|why)\b/i.test(q)) return "debug";
  if (/\b(summarize|overview|tldr)\b/i.test(q)) return "summarize";
  if (/\b(roadmap|prioritize|plan|next steps)\b/i.test(q)) return "plan";
  if (/\b(explain|learn|what is|how does)\b/i.test(q)) return "learn";
  if (/\b(feel|overwhelmed|hard|difficult|struggle)\b/i.test(q)) return "reflect";
  return "general";
}

// ─── Chunk deduplication ───────────────────────────────────────────────────

export function deduplicateChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const bestByKey = new Map<string, RetrievedChunk>();

  for (const chunk of chunks) {
    const docId = chunk.document_id ?? chunk.id ?? chunk.filename;
    const key = `${docId}::${chunk.chunk_index}`;
    const existing = bestByKey.get(key);
    if (!existing || (chunk.score ?? 0) > (existing.score ?? 0)) {
      bestByKey.set(key, chunk);
    }
  }

  return [...bestByKey.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ─── Context block builder ─────────────────────────────────────────────────

export function buildContextBlock(
  fragments: RetrievedChunk[],
  packageFilter: string | null = null,
  maxChars = 2400
): string {
  const deduped = deduplicateChunks(fragments);

  const header = "=== CONTEXT FROM MANIFEST INDEX (GestaltView-Official-Compendium) ===";
  const packageLine = `Package filter: ${packageFilter ?? "none"}`;

  if (deduped.length === 0) {
    return `${header}\n${packageLine}\n\n— No matching fragments were found for this query.`;
  }

  const body = deduped
    .map((c, i) => {
      const docType = c.document_type || "general";
      const score = c.score !== undefined ? ` [score: ${c.score.toFixed(3)}]` : "";
      const snippet = c.content.replace(/\n+/g, " ").trim();
      return `[${i + 1}] ${docType}/${c.filename}${score}\n${snippet}`;
    })
    .join("\n\n");

  const result = `${header}\n${packageLine}\n\n${body}`;
  return result.length > maxChars ? `${result.slice(0, maxChars - 1)}…` : result;
}

// ─── Full message builder ──────────────────────────────────────────────────

export function buildBillyMessages(
  params: BuildBillyMessagesParams
): BillyMessage[] {
  const {
    query,
    fragments,
    packageFilter = null,
    plkProfile,
    gapSignal,
  } = params;

  const intent      = classifyIntent(query);
  const contextBlock = buildContextBlock(fragments, packageFilter);

  let systemContent = BILLY_SYSTEM_PROMPT;
  if (plkProfile) {
    systemContent +=
      `\n\nPLK Profile active\n` +
      `Preserve this user's exact words, pacing, and metaphors throughout every response.\n` +
      `PLK Profile: ${plkProfile}`;
  }

  const intentLine = `[Intent: ${intent}]`;
  const gapLine    = gapSignal ? `\n${gapSignal}` : "";

  return [
    { role: "system", content: systemContent },
    {
      role:    "user",
      content: `${contextBlock}\n\n${intentLine}${gapLine}\n\nUser message: ${query}`,
    },
  ];
}
