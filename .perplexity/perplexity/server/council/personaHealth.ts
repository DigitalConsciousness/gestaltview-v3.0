/**
 * PersonaHealthTracker
 *
 * Character-level circuit breaker for council dispatch.
 * Tracks consecutive fallback / canned-response failures per persona slug.
 *
 * This is intentionally separate from the provider-level circuit breaker
 * (BillyEngine _providerHealth). Provider health asks "is the LLM vendor
 * reachable?". Persona health asks "did the character actually show up in
 * the last response?"
 *
 * Thresholds and stagger timing are exported as constants so tests and
 * callers can override them without patching module internals.
 */

export const PERSONA_HEALTH_FAILURE_THRESHOLD = 2;
export const PERSONA_HEALTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
export const COUNCIL_DISPATCH_STAGGER_MS = 150;

export type PersonaHealthStatus = "healthy" | "degraded" | "recovering";

export interface PersonaHealthEntry {
  slug: string;
  consecutiveFailures: number;
  totalFailures: number;
  totalRetries: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  status: PersonaHealthStatus;
}

function freshEntry(slug: string): PersonaHealthEntry {
  return {
    slug,
    consecutiveFailures: 0,
    totalFailures: 0,
    totalRetries: 0,
    lastFailureAt: null,
    lastSuccessAt: null,
    status: "healthy",
  };
}

function deriveStatus(
  consecutiveFailures: number,
  threshold: number
): PersonaHealthStatus {
  if (consecutiveFailures === 0) return "healthy";
  if (consecutiveFailures >= threshold) return "degraded";
  return "recovering";
}

export class PersonaHealthTracker {
  private readonly entries = new Map<string, PersonaHealthEntry>();
  private readonly threshold: number;

  constructor(threshold = PERSONA_HEALTH_FAILURE_THRESHOLD) {
    this.threshold = threshold;
  }

  /** Called after a clean (non-fallback) response from a persona. */
  recordSuccess(slug: string): void {
    const entry = this.entries.get(slug) ?? freshEntry(slug);
    entry.consecutiveFailures = 0;
    entry.lastSuccessAt = Date.now();
    entry.status = "healthy";
    this.entries.set(slug, entry);
  }

  /**
   * Called after a fallback / canned response from a persona.
   * Returns true when the failure count has crossed the threshold,
   * signalling the caller to attempt a hardened-seed retry.
   */
  recordFailure(slug: string): boolean {
    const entry = this.entries.get(slug) ?? freshEntry(slug);
    entry.consecutiveFailures += 1;
    entry.totalFailures += 1;
    entry.lastFailureAt = Date.now();
    entry.status = deriveStatus(entry.consecutiveFailures, this.threshold);
    this.entries.set(slug, entry);
    return entry.consecutiveFailures >= this.threshold;
  }

  /** Record that a hardened-seed retry was issued for this persona. */
  recordRetry(slug: string): void {
    const entry = this.entries.get(slug) ?? freshEntry(slug);
    entry.totalRetries += 1;
    this.entries.set(slug, entry);
  }

  /** Returns true when the persona has been degraded and a hardened retry should fire. */
  isDegraded(slug: string): boolean {
    return (this.entries.get(slug)?.status ?? "healthy") === "degraded";
  }

  getEntry(slug: string): PersonaHealthEntry {
    return this.entries.get(slug) ?? freshEntry(slug);
  }

  /** Snapshot of all tracked entries — useful for observability / logging. */
  snapshot(): PersonaHealthEntry[] {
    return [...this.entries.values()];
  }

  /** Reset all state — used in tests and after a council session ends. */
  reset(): void {
    this.entries.clear();
  }
}

/** Module-level singleton used by councilRunner in production. */
export const defaultPersonaHealthTracker = new PersonaHealthTracker();
