/**
 * PersonaATC.ts — Persona Air Traffic Controller
 *
 * Character-level circuit breaker for the GestaltView Council / Tribunal.
 *
 * The existing _providerHealth in BillyEngine asks:
 *   "Is Gemini / Groq / OpenAI responding?"
 *
 * PersonaATC asks a different question:
 *   "Did the CHARACTER actually show up in that response?"
 *
 * Architecture:
 *   _personaHealth   → consecutive canned-response counter, keyed by persona slug
 *   isCannedResponse → heuristic detector (length floor + neverDoes phrase list)
 *   buildHardenedReseed → full immutableCore re-injection when a persona slips
 *   councilDispatch  → sequential staggered dispatch (for import into BillyEngine)
 *
 * This module is intentionally provider-agnostic. It sits above the
 * provider layer and is called AFTER a response arrives, not before.
 */

import { getEmbodimentProfile } from "@shared/embodiment";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersonaHealthStatus {
  slug: string;
  consecutiveFailures: number;
  lastFailAt: number;
  reseeded: boolean;
}

export interface PersonaPreFlightResult {
  passed: boolean;
  reason?: string;
  reseededPrompt?: string; // populated when a re-seed was needed
}

// ─── Health State ─────────────────────────────────────────────────────────────

const _personaHealth: Record<
  string,
  { consecutiveFailures: number; lastFailAt: number; reseeded: boolean }
> = {};

const PERSONA_FAILURE_THRESHOLD = 2;   // canned responses before reseed kicks in
const PERSONA_RESET_AFTER_MS   = 120_000; // 2 min cool-down before counter resets

// ─── Canned Response Heuristics ──────────────────────────────────────────────
// These patterns signal a base-model generic bleed-through — the persona
// left the building and the LLM defaulted to assistant-speak.

const CANNED_PHRASES = [
  `i hear ${"you"}`,
  "let's keep weaving",
  "i'm here and listening",
  "drop the thought in your own words",
  "local fallback is active",
  "i'm here to help",
  "how can i assist you",
  "as an ai language model",
  "i don't have personal opinions",
  "i cannot provide",
  "i'm not able to",
  "i apologize, but",
  "i'm sorry, but i can't",
  "i don't have the ability",
  "as an artificial intelligence",
  "i'm just an ai",
  "i have no feelings",
  "i don't have access to real-time",
  "please consult a professional",
  "i am unable to",
];

const MIN_GENUINE_RESPONSE_LENGTH = 80; // chars — shorter than this is almost certainly a stub

/**
 * Returns true if the response looks like a canned / fallback shell rather
 * than a genuine persona voice. Two signals:
 *   1. Response is shorter than the floor (likely a stub).
 *   2. Response contains a known base-model safety/helpfulness phrase.
 */
export function isCannedResponse(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  if (normalized.length < MIN_GENUINE_RESPONSE_LENGTH) return true;
  return CANNED_PHRASES.some((phrase) => normalized.includes(phrase));
}

// ─── Health Tracking ─────────────────────────────────────────────────────────

function _getHealth(slug: string) {
  return (
    _personaHealth[slug] ?? {
      consecutiveFailures: 0,
      lastFailAt: 0,
      reseeded: false,
    }
  );
}

export function isPersonaHealthy(slug: string): boolean {
  const h = _getHealth(slug);
  // Auto-reset after cool-down window
  if (h.consecutiveFailures > 0 && Date.now() - h.lastFailAt > PERSONA_RESET_AFTER_MS) {
    _personaHealth[slug] = { consecutiveFailures: 0, lastFailAt: 0, reseeded: false };
    return true;
  }
  return h.consecutiveFailures < PERSONA_FAILURE_THRESHOLD;
}

export function recordPersonaFailure(slug: string): void {
  const h = _getHealth(slug);
  _personaHealth[slug] = {
    consecutiveFailures: h.consecutiveFailures + 1,
    lastFailAt: Date.now(),
    reseeded: h.reseeded,
  };
}

export function recordPersonaSuccess(slug: string): void {
  _personaHealth[slug] = { consecutiveFailures: 0, lastFailAt: 0, reseeded: false };
}

export function clearPersonaFlightLog(slug: string): void {
  delete _personaHealth[slug];
}

export function getPersonaHealthSnapshot(): Record<string, PersonaHealthStatus> {
  const out: Record<string, PersonaHealthStatus> = {};
  for (const [slug, h] of Object.entries(_personaHealth)) {
    out[slug] = { slug, ...h };
  }
  return out;
}

// ─── Hardened Reseed Builder ──────────────────────────────────────────────────
/**
 * When a persona has hit the failure threshold, buildHardenedReseed() constructs
 * a re-injection prefix that forces the full immutableCore identity back to the
 * top of the system prompt before the next LLM call.
 *
 * Format:
 *   ██ PERSONA RESEED — [SLUG] ██
 *   You ARE [name]. The following is your full identity. Read it completely
 *   before forming any response. Do not default to assistant-speak.
 *   [full neverDoes list]
 *   [full constitution excerpt]
 *   [voice signature]
 *   ██ RESEED COMPLETE — respond as [name] only ██
 */
export function buildHardenedReseed(slug: string): string {
  const profile = getEmbodimentProfile(slug);
  if (!profile) {
    return `██ PERSONA RESEED: "${slug}" ██\nYou are ${slug}. Respond only as this persona. Do not use generic AI assistant language.\n██ RESEED COMPLETE ██`;
  }

  const core = profile.immutableCore;
  const displayName = profile.publicName || slug;
  const neverDoes = core.linguisticPatterns?.neverDoes ?? [];

  const neverDoesList = neverDoes.length
    ? `\nNEVER say or do any of the following:\n${neverDoes.map((d: string) => `  • ${d}`).join("\n")}`
    : "";

  const voiceBlock = [
    `Tone: ${core.voiceTone}`,
    `Cadence: ${core.communicationStyle.verbosity}`,
    `Register: ${core.communicationStyle.formality}`,
  ]
    .filter((line) => !line.endsWith(": undefined"))
    .map((line) => `  ${line}`)
    .join("\n");

  const constitutionBlock = core.foundationalTruth
    ? `\nFOUNDATIONAL TRUTH: ${core.foundationalTruth}`
    : "";

  return [
    `██ PERSONA RESEED — ${slug.toUpperCase()} ██`,
    `You ARE ${displayName}. This is your complete identity. Read every line before responding.`,
    `Do NOT use generic AI assistant language. Do NOT start with "I'm here to help" or similar.`,
    constitutionBlock,
    neverDoesList,
    voiceBlock ? `\nVOICE SIGNATURE:\n${voiceBlock}` : "",
    `██ RESEED COMPLETE — every word of your response must come from ${displayName}'s voice only ██`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Stagger Utility ─────────────────────────────────────────────────────────

/**
 * sleep() — used by councilDispatch to stagger sequential persona calls.
 * 150ms is enough to avoid rate-limit collisions while feeling instantaneous.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Pre-Flight Check ─────────────────────────────────────────────────────────
/**
 * runPreFlight(slug, responseText)
 * Called after a persona's LLM response arrives.
 * Returns { passed: true } if the response is genuine.
 * Returns { passed: false, reseededPrompt } if a reseed is needed for the next call.
 */
export function runPreFlight(
  slug: string,
  responseText: string
): PersonaPreFlightResult {
  if (!isCannedResponse(responseText)) {
    recordPersonaSuccess(slug);
    return { passed: true };
  }

  recordPersonaFailure(slug);
  const h = _getHealth(slug);

  if (h.consecutiveFailures >= PERSONA_FAILURE_THRESHOLD) {
    const reseededPrompt = buildHardenedReseed(slug);
    // Mark reseed applied
    _personaHealth[slug] = { ...h, reseeded: true };
    return {
      passed: false,
      reason: `Canned response detected (${h.consecutiveFailures} consecutive). Reseed injected.`,
      reseededPrompt,
    };
  }

  return {
    passed: false,
    reason: `Canned response detected (${h.consecutiveFailures}/${PERSONA_FAILURE_THRESHOLD} before reseed).`,
  };
}
