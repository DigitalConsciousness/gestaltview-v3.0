# Metrics And Tribunal Retry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire GestaltView's live metrics surfaces end to end and stop blocked Tribunal responses from ever entering the transcript.

**Architecture:** Use the existing runtime endpoints and client-local Tribunal transcript state rather than inventing a new telemetry store. Add a small shared metrics helper layer that turns trainer queue health, orchestration analytics, and stored Tribunal transcript turns into a single dashboard snapshot, then update the metrics dashboard to render those live signals. For Tribunal chat, add a pure retry/guard helper that retries canned fallback responses with backoff and returns silence on exhaustion, then have `AgentCouncilPage` only mutate chat state after a clean response passes the guard.

**Tech Stack:** TypeScript, React 19, Vite, Vitest, Wouter, existing GestaltView API routes and localStorage-backed Tribunal transcript state.

---

### Task 1: Add a shared metrics snapshot helper and tests

**Files:**
- Create: `client/src/lib/gestaltviewMetrics.ts`
- Create: `client/src/tests/gestaltview-metrics.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildGestaltViewMetricsSnapshot } from "@/lib/gestaltviewMetrics";

describe("buildGestaltViewMetricsSnapshot", () => {
  it("derives the live metric families from trainer, analytics, and tribunal transcript inputs", () => {
    const snapshot = buildGestaltViewMetricsSnapshot({
      generatedAt: "2026-06-24T00:00:00.000Z",
      trainer: {
        trackedRuns: 4,
        queuedRuns: 1,
        awaitingReviewRuns: 2,
        failedRuns: 1,
        stalledRuns: 1,
      },
      orchestration: {
        totalDecisions: 12,
        averageConfidence: 0.81,
        elevatedSupportRate: 0.25,
      },
      tribunal: {
        totalTurns: 18,
        userTurns: 3,
        agentTurns: 15,
        cleanAgentTurns: 14,
        cannedAgentTurns: 1,
        uniqueVoices: 5,
        addressedTurns: 8,
        autoReplyTurns: 4,
        maxReplyDepth: 3,
        savedExcerpts: 2,
      },
    });

    expect(snapshot.overviewCards[0]).toMatchObject({
      label: "Operational health",
      value: "1 stalled",
    });
    expect(snapshot.familyCards).toHaveLength(5);
    expect(snapshot.familyCards[0]).toMatchObject({
      key: "empathy_actualization",
      title: "Empathy Resonance Index",
    });
    expect(snapshot.familyCards[0].value).not.toBe("0%");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts -v`
Expected: fail because `buildGestaltViewMetricsSnapshot` does not exist yet.

- [ ] **Step 3: Implement the helper**

```ts
export function buildGestaltViewMetricsSnapshot(
  input: MetricsSnapshotInput,
): GestaltViewMetricsSnapshot {
  return {
    generatedAt: input.generatedAt,
    overviewCards: [
      {
        key: "trainer_health",
        label: "Operational health",
        value: input.trainer.stalledRuns > 0 ? `${input.trainer.stalledRuns} stalled` : "Clear",
        detail: `${input.trainer.queuedRuns} queued, ${input.trainer.awaitingReviewRuns} awaiting review, ${input.trainer.failedRuns} failed.`,
      },
      {
        key: "orchestration_health",
        label: "Orchestration coverage",
        value: `${input.orchestration.totalDecisions}`,
        detail: `${Math.round(input.orchestration.averageConfidence * 100)}% average confidence.`,
      },
    ],
    familyCards: [
      {
        key: "empathy_actualization",
        title: "Empathy Resonance Index",
        value: `${Math.round((input.tribunal.cleanAgentTurns / Math.max(input.tribunal.agentTurns, 1)) * 100)}%`,
        detail: "Proxy from clean Tribunal turns versus canned fallbacks.",
        tone: "success",
      },
      {
        key: "transformational_change",
        title: "Identity Shift Velocity",
        value: `${Math.max(input.tribunal.maxReplyDepth, input.tribunal.autoReplyTurns)} turns`,
        detail: "Proxy from follow-up depth and auto-reply activity.",
        tone: "neutral",
      },
      {
        key: "collective_intelligence",
        title: "Collective Breakthrough Density",
        value: `${input.tribunal.uniqueVoices} voices`,
        detail: "Proxy from distinct Tribunal participants and addressed turns.",
        tone: "neutral",
      },
      {
        key: "authentic_self_discovery",
        title: "Authentic Self Coherence Index",
        value: `${Math.round((input.tribunal.addressedTurns / Math.max(input.tribunal.totalTurns, 1)) * 100)}%`,
        detail: "Proxy from whether the room is speaking directly to the work.",
        tone: "success",
      },
      {
        key: "narrative_change",
        title: "Narrative Evolution Index",
        value: `${input.tribunal.savedExcerpts} saves`,
        detail: "Proxy from saved Tribunal excerpts and creation handoff activity.",
        tone: "warning",
      },
    ],
    liveSignals: [
      `Trainer queue: ${input.trainer.queuedRuns} queued / ${input.trainer.stalledRuns} stalled`,
      `Council health: ${input.tribunal.cleanAgentTurns} clean turns / ${input.tribunal.cannedAgentTurns} canned`,
      `Decision spine: ${input.orchestration.totalDecisions} decisions at ${Math.round(input.orchestration.elevatedSupportRate * 100)}% elevated support`,
    ],
  };
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/gestaltviewMetrics.ts client/src/tests/gestaltview-metrics.test.ts
git commit -m "feat: add gestaltview metrics snapshot helper"
```

### Task 2: Rewire the metrics dashboard to render the new live snapshot

**Files:**
- Modify: `client/src/components/GestaltViewMetricsDashboard.tsx`
- Modify: `client/src/pages/MetricsDashboardPage.tsx`
- Modify: `client/src/pages/AnalyticsPage.tsx`

- [ ] **Step 1: Write the failing UI-level test**

```ts
import { describe, expect, it } from "vitest";
import { buildGestaltViewMetricsSnapshot } from "@/lib/gestaltviewMetrics";

describe("metrics page snapshot copy", () => {
  it("shows live proxy labels for the GestaltView metric families", () => {
    const snapshot = buildGestaltViewMetricsSnapshot({
      generatedAt: "2026-06-24T00:00:00.000Z",
      trainer: { trackedRuns: 0, queuedRuns: 0, awaitingReviewRuns: 0, failedRuns: 0, stalledRuns: 0 },
      orchestration: { totalDecisions: 0, averageConfidence: 0, elevatedSupportRate: 0 },
      tribunal: { totalTurns: 0, userTurns: 0, agentTurns: 0, cleanAgentTurns: 0, cannedAgentTurns: 0, uniqueVoices: 0, addressedTurns: 0, autoReplyTurns: 0, maxReplyDepth: 0, savedExcerpts: 0 },
    });

    expect(snapshot.familyCards.map((card) => card.title)).toEqual([
      "Empathy Resonance Index",
      "Identity Shift Velocity",
      "Collective Breakthrough Density",
      "Authentic Self Coherence Index",
      "Narrative Evolution Index",
    ]);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts -v`
Expected: fail until the component and helper are wired to the live snapshot shape.

- [ ] **Step 3: Wire the dashboard to the new helper**

```tsx
const trainerSnapshot = {
  trackedRuns: trainer.runs.length,
  queuedRuns: trainer.queueHealth?.queuedCount ?? 0,
  awaitingReviewRuns: trainer.runs.filter((run) => run.status === "awaiting_review").length,
  failedRuns: trainer.runs.filter((run) => run.status === "failed").length,
  stalledRuns: trainer.runs.filter(
    (run) => run.status === "queued" && Date.now() - new Date(run.createdAt).getTime() >= 45_000,
  ).length,
};

const storedTribunalMessages = readStoredTribunalMessages();
const savedTribunalExcerpts = readSavedTribunalExcerpts();
const tribunalTranscriptSummary = {
  totalTurns: storedTribunalMessages.length,
  userTurns: storedTribunalMessages.filter((turn) => turn.role === "user").length,
  agentTurns: storedTribunalMessages.filter((turn) => turn.role === "agent").length,
  cleanAgentTurns: storedTribunalMessages.filter(
    (turn) => turn.role === "agent" && !/canned fallback detected|temporarily offline/i.test(turn.content),
  ).length,
  cannedAgentTurns: storedTribunalMessages.filter((turn) => /canned fallback detected/i.test(turn.content)).length,
  uniqueVoices: new Set(storedTribunalMessages.filter((turn) => turn.role === "agent" && turn.agentSlug).map((turn) => turn.agentSlug)).size,
  addressedTurns: storedTribunalMessages.filter((turn) => Array.isArray(turn.addressedTo) && turn.addressedTo.length > 0).length,
  autoReplyTurns: storedTribunalMessages.filter((turn) => turn.isAutoReply).length,
  maxReplyDepth: storedTribunalMessages.reduce((max, turn) => Math.max(max, turn.replyDepth ?? 0), 0),
  savedExcerpts: savedTribunalExcerpts.length,
};

const snapshot = useMemo(
  () => buildGestaltViewMetricsSnapshot({
    generatedAt: new Date().toISOString(),
    trainer: trainerSnapshot,
    orchestration: {
      totalDecisions: orchestrationSummary?.summary.totalDecisions ?? 0,
      averageConfidence: orchestrationSummary?.summary.averageConfidence ?? 0,
      elevatedSupportRate: orchestrationSummary?.summary.elevatedSupportRate ?? 0,
    },
    tribunal: tribunalTranscriptSummary,
  }),
  [trainerSnapshot, orchestrationSummary, tribunalTranscriptSummary],
);
```

- [ ] **Step 4: Render the new cards and keep the current access gates honest**

```tsx
{snapshot.familyCards.map((card) => (
  <MetricCard key={card.key} title={card.title} value={card.value} detail={card.detail} tone={card.tone} />
))}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/GestaltViewMetricsDashboard.tsx client/src/pages/MetricsDashboardPage.tsx client/src/pages/AnalyticsPage.tsx
git commit -m "feat: wire gestaltview metrics dashboard to live signals"
```

### Task 3: Add a Tribunal retry guard and silence blocked responses

**Files:**
- Create: `client/src/lib/tribunalResponseGuard.ts`
- Modify: `client/src/hooks/useTribunalRetry.ts`
- Modify: `client/src/pages/AgentCouncilPage.tsx`
- Create: `client/src/tests/tribunal-response-guard.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { retryTribunalResponse } from "@/lib/tribunalResponseGuard";

describe("retryTribunalResponse", () => {
  it("returns silence after exhausting canned fallback retries", async () => {
    const result = await retryTribunalResponse(
      async () => "[canned fallback detected] try again later",
      { maxRetries: 2, backoffMs: [0, 0] },
    );

    expect(result.text).toBeNull();
    expect(result.exhausted).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `./node_modules/.bin/vitest run client/src/tests/tribunal-response-guard.test.ts -v`
Expected: fail because the retry helper does not exist yet.

- [ ] **Step 3: Implement the helper and hook wrapper**

```ts
export async function retryTribunalResponse(
  fetchTurn: () => Promise<string>,
  options: RetryOptions = {},
): Promise<TribunalRetryResult> {
  const maxRetries = options.maxRetries ?? 2;
  const backoffMs = options.backoffMs ?? [1000, 2000];

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const text = await fetchTurn();
    if (!isCannedTribunalResponse(text)) {
      return { text, exhausted: false, attempts: attempt + 1 };
    }

    if (attempt < maxRetries) {
      await sleep(backoffMs[attempt] ?? backoffMs[backoffMs.length - 1] ?? 0);
    }
  }

  return { text: null, exhausted: true, attempts: maxRetries + 1 };
}
```

- [ ] **Step 4: Update the live room to skip blocked transcript entries**

```ts
const result = await retryTribunalResponse(
  () => callBillyApi(prompt, "tribunal", "synthesis", undefined, turn.target.slug, "tribunal").then((value) => value.text),
  { maxRetries: 2, backoffMs: [1000, 2000] },
);
if (!result.text) {
  recordPersonaFailure(turn.target.slug);
  continue;
}
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `./node_modules/.bin/vitest run client/src/tests/tribunal-response-guard.test.ts -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/lib/tribunalResponseGuard.ts client/src/hooks/useTribunalRetry.ts client/src/pages/AgentCouncilPage.tsx client/src/tests/tribunal-response-guard.test.ts
git commit -m "feat: silence canned tribunal fallbacks"
```

### Task 4: Update the durable handoff and verify the touched surfaces

**Files:**
- Modify: `docs/CurrentState.md`

- [ ] **Step 1: Capture the new live state**

```md
- GestaltView metrics now blend trainer queue health, orchestration analytics, and Tribunal transcript proxies in the live dashboard.
- Tribunal room turns now retry canned responses and silently skip exhausted fallbacks instead of writing blocked shells into the transcript.
```

- [ ] **Step 2: Run the focused validation commands**

Run:
`./node_modules/.bin/vitest run client/src/tests/gestaltview-metrics.test.ts client/src/tests/tribunal-response-guard.test.ts -v`
`./node_modules/.bin/tsc --noEmit --pretty false`
`git diff --check`

Expected: the focused tests pass, TypeScript stays clean for the touched surfaces, and there are no whitespace or patch-format regressions.

- [ ] **Step 3: Commit**

```bash
git add docs/CurrentState.md
git commit -m "docs: record metrics and tribunal retry wiring"
```
