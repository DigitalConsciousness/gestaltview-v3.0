import { routeLlm, type LlmResult } from "../../api/_lib/llmRouter.js";
import {
  buildHardenedCouncilJob,
  buildIsolatedCouncilPrompt,
} from "../../shared/embodiment/chat.js";
import type {
  AssemblyInput,
  CouncilResponse,
  CouncilResult,
  IsolatedCouncilJob,
} from "../../shared/embodiment/types.js";
import {
  COUNCIL_DISPATCH_STAGGER_MS,
  defaultPersonaHealthTracker,
  type PersonaHealthTracker,
} from "./personaHealth.js";

export type CouncilLlmCaller = (
  job: IsolatedCouncilJob,
) => Promise<LlmResult | string>;

export interface RunCouncilOptions {
  callLlm?: CouncilLlmCaller;
  buildJob?: (slug: string) => IsolatedCouncilJob;
  /**
   * Override the PersonaHealthTracker used for this run.
   * Defaults to the module-level singleton.
   * Inject a fresh instance in tests to isolate state.
   */
  personaHealthTracker?: PersonaHealthTracker;
  /**
   * Override the stagger delay between persona dispatches (ms).
   * Defaults to COUNCIL_DISPATCH_STAGGER_MS (150 ms).
   * Set to 0 in tests for synchronous-like behaviour.
   */
  dispatchStaggerMs?: number;
}

function normalizeLlmResponse(
  result: Awaited<ReturnType<CouncilLlmCaller>>,
): string {
  return typeof result === "string" ? result : result.response;
}

function estimateResonance(
  result: Awaited<ReturnType<CouncilLlmCaller>>,
): number | undefined {
  if (typeof result === "string") {
    return undefined;
  }

  const value = result.metadata?.resonanceEstimate;
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function tripsFallbackGuard(response: string, fallbackGuard: string): boolean {
  return (
    response.trim().startsWith(fallbackGuard) ||
    response.includes(fallbackGuard)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function defaultCouncilLlmCaller(
  job: IsolatedCouncilJob,
): Promise<LlmResult> {
  return routeLlm(job.userPrompt, {
    systemPrompt: job.systemPrompt,
    mode: `council-${job.slug}`,
  });
}

/**
 * runCouncil
 *
 * Air-traffic-controller dispatch for the full council.
 *
 * Key behaviours added in this revision:
 *
 * 1. Sequential staggered dispatch — jobs fire one at a time with a short
 *    pause between each (COUNCIL_DISPATCH_STAGGER_MS, default 150 ms).
 *    This prevents context-window collisions and rate-limit spikes when
 *    dispatching the full Tribunal slate simultaneously.
 *
 * 2. Per-persona health tracking — after each response the
 *    PersonaHealthTracker records success or failure. On failure it checks
 *    whether the consecutive-failure threshold has been crossed.
 *
 * 3. Inline hardened-seed retry — when a fallback is detected AND the
 *    health tracker indicates the persona is degraded, the runner
 *    immediately issues a second LLM call via buildHardenedCouncilJob().
 *    The retry re-injects the full immutableCore seed with amplified
 *    identity directives. Only one retry per turn per persona.
 *
 * 4. Retry outcome routing — if the retry produces a clean response, it
 *    lands in `baked` with retried=true and hardenedSeedUsed=true.
 *    If the retry also trips the fallback guard, it lands in `flagged`
 *    with hardenedSeedUsed=true so the caller knows recovery was attempted.
 */
export async function runCouncil(
  userPrompt: string,
  slugs: string[],
  corpusContext: string[] = [],
  options: RunCouncilOptions = {},
): Promise<CouncilResult> {
  const callLlm = options.callLlm ?? defaultCouncilLlmCaller;
  const tracker = options.personaHealthTracker ?? defaultPersonaHealthTracker;
  const staggerMs =
    options.dispatchStaggerMs ??
    (process.env.NODE_ENV === "test" ? 0 : COUNCIL_DISPATCH_STAGGER_MS);

  const jobs = slugs.map((slug) => {
    if (options.buildJob) {
      return options.buildJob(slug);
    }

    return buildIsolatedCouncilPrompt(slug, userPrompt, {
      extraContext: corpusContext,
    });
  });

  const skipped: CouncilResponse[] = jobs
    .filter((job) => !job.shouldFire)
    .map((job) => ({
      slug: job.slug,
      response: "did-not-activate",
      fallbackTripped: false,
      depthStatus: job.depthStatus,
    }));

  const activeJobs = jobs.filter((job) => job.shouldFire);
  const baked: CouncilResponse[] = [];
  const flagged: CouncilResponse[] = [];

  async function dispatchJob(job: IsolatedCouncilJob): Promise<void> {
    let primaryResponse: string;
    let primaryResonance: number | undefined;

    try {
      const llmResult = await callLlm(job);
      primaryResponse = normalizeLlmResponse(llmResult);
      primaryResonance = estimateResonance(llmResult);
    } catch {
      // Provider-level error: skip this persona, do not corrupt health state.
      skipped.push({
        slug: job.slug,
        response: "provider-error",
        fallbackTripped: false,
        depthStatus: job.depthStatus,
      });
      return;
    }

    const primaryFallback = tripsFallbackGuard(
      primaryResponse,
      job.fallbackGuard,
    );

    if (!primaryFallback) {
      tracker.recordSuccess(job.slug);
      baked.push({
        slug: job.slug,
        response: primaryResponse,
        resonanceEstimate: primaryResonance,
        fallbackTripped: false,
        depthStatus: job.depthStatus,
      });
      return;
    }

    // Primary response tripped the fallback guard.
    const shouldRetry = tracker.recordFailure(job.slug);

    if (!shouldRetry) {
      // Failure count has not yet crossed the threshold — flag but do not retry.
      flagged.push({
        slug: job.slug,
        response: primaryResponse,
        resonanceEstimate: primaryResonance,
        fallbackTripped: true,
        depthStatus: job.depthStatus,
      });
      return;
    }

    // Threshold crossed — attempt a hardened-seed retry.
    tracker.recordRetry(job.slug);

    const hardenedJob = buildHardenedCouncilJob(job.slug, userPrompt, {
      extraContext: corpusContext,
    });

    let retryResponse: string;
    let retryResonance: number | undefined;

    try {
      const retryResult = await callLlm(hardenedJob);
      retryResponse = normalizeLlmResponse(retryResult);
      retryResonance = estimateResonance(retryResult);
    } catch {
      // Retry call also failed at provider level — route original to flagged.
      flagged.push({
        slug: job.slug,
        response: primaryResponse,
        resonanceEstimate: primaryResonance,
        fallbackTripped: true,
        depthStatus: job.depthStatus,
        retried: true,
        hardenedSeedUsed: false,
      });
      return;
    }

    const retryFallback = tripsFallbackGuard(retryResponse, job.fallbackGuard);

    if (!retryFallback) {
      // Hardened retry produced a clean response.
      tracker.recordSuccess(job.slug);
      baked.push({
        slug: job.slug,
        response: retryResponse,
        resonanceEstimate: retryResonance,
        fallbackTripped: false,
        depthStatus: job.depthStatus,
        retried: true,
        hardenedSeedUsed: true,
      });
    } else {
      // Both attempts tripped the fallback guard — route to flagged.
      flagged.push({
        slug: job.slug,
        response: retryResponse,
        resonanceEstimate: retryResonance,
        fallbackTripped: true,
        depthStatus: job.depthStatus,
        retried: true,
        hardenedSeedUsed: true,
      });
    }
  }

  if (staggerMs <= 0) {
    await Promise.all(activeJobs.map((job) => dispatchJob(job)));
  } else {
    for (let i = 0; i < activeJobs.length; i++) {
      if (i > 0) {
        await sleep(staggerMs);
      }

      await dispatchJob(activeJobs[i]!);
    }
  }

  return {
    baked,
    flagged,
    skipped,
    assemblyReady: baked.length >= 1,
  };
}

export function buildAssemblyInput(
  result: CouncilResult,
  userPrompt: string,
  synthesizerSlug: AssemblyInput["synthesizerSlug"],
): AssemblyInput | null {
  if (!result.assemblyReady) {
    return null;
  }

  return {
    baked: result.baked,
    userPrompt,
    synthesizerSlug,
  };
}
