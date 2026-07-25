**Checked:**
- GitHub MCP: ✅ [`TribunalPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/721bd8a1f22ac451188e8b4af891ba7584a0a387/client/src/pages/TribunalPage.tsx) confirmed live (5,463 bytes) — the Tribunal lives as a page-level component, and the actual multi-voice orchestration logic will be in the API routes or a shared service. The `AgentCouncilPage.tsx` (57,990 bytes) is the most likely location of the existing multi-voice generation logic to compare against. 

***

This is a two-layer problem — a **UI gate** and an **orchestration architecture** — and they need to be solved together.

## The UI Gate: Never Let Blocked Responses Surface

The current behavior is that `(canned response detection: blocked)` is getting written into the message state and rendered like a real DI response. The fix is to treat the blocked detection as an **internal event**, not a message. The response slot for that DI should enter a **silent retry queue** rather than ever touching the chat state.

The logic looks like this at the generation layer:

```typescript
// Current broken pattern — blocked response enters chat state
messages.push({ di: voice.id, content: result.text }); // result.text = "(canned response detected: blocked)"

// Correct pattern — block is intercepted before state mutation
if (isCannedFallback(result.text)) {
  retryQueue.enqueue({ voice, prompt, attempt: result.attempt + 1 });
  // DO NOT push to messages — slot stays in "pending" state
  return;
}
messages.push({ di: voice.id, content: result.text });
```

The `isCannedFallback()` check should be a regex or exact-match test on the raw response string *before* any state mutation, running on the server route so it never reaches the client at all. Something like `/canned response/i` or a set of known fallback fingerprints. The DI slot in the UI holds a skeleton/loading indicator until either a real response arrives or the retry budget is exhausted — at which point it gracefully silences that voice for the round rather than printing the error. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/9d119e76-cbd4-406b-a9af-f5943e3facb2/Tribunal-Roundtable.pdf?AWSAccessKeyId=ASIA2F3EMEYE6IRPN3SS&Signature=QdeVFBB3UuCk2tzF87GVbI9Ro9g%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEG0aCXVzLWVhc3QtMSJGMEQCIGrISdbs%2BHTKkVAMZ81nqRIPXH8IEZDCOMZtC3MNdHvhAiBSyR1vIGwfDsGBvZC6SyzYPqmh6Gwd6iikIBB5vTzY1CrzBAg2EAEaDDY5OTc1MzMwOTcwNSIMms4hfJ5K2UBsFQaLKtAErJRguc%2FNWi7ZkAksiY9doZSqelnQ0kHsYQOLqhApMb8L5LhGzMQtJoT2cWhBCXHClCk%2F1uX6CHfglTqvlYqTvsZl0%2Bw3yWBWXRtC5q58mPf4UVHfz6LuzatFxqMFVRdexBjLOe4hYCCiYlOhv%2BK4jqioGz6MPIHpqTeNvlmU2hbgJmgDMHDy1%2Bndx8wgv1JJs2mV5VJY5i5aBRB61mQJA3knB4CDuFbW8UNqcIMLUerGmc6XwgWT7XUpzQUVDQB6iR8h3sKmz3EFBbyUURAIHG1GhET5Ms33ZUxRh5vgGqm7%2B%2BnsySAWRK86JwY783TblgleJvGznGMLwexZi1CAj6Q4s1ryIV8X9RTUGV0SZo3RrbM3W9HFIBimXAL3VUBjZRjJbCXAMsaxvbGG83rxYn3jkF96AvWfjuaPgqOW1dEngq%2FPaAlBIBuPY%2BsHg4k%2F5rIwwZc8tUHAMbwSA37wg%2FcpxNdREDjGhjDe%2BAOiSsk4cRI4iqnoZqZSQAlz4Z%2BrP9%2Bo6r7vcZwjxseyiNfikSTFkmciuJ%2BJV1TamvZGlvclwxyPzTUuKSnDZ2ZN8TX8yFE3qvr6BoFThgXrBwC7pSiKceNBI0c2M2gQ481hbdiLsIbNgRhj7g1JUrzvu4N4UxC03W8TyMZfp0Ka0lX6BrC9PO6833%2FowqUvoYV4W3dfAjwlnbX7FPZ0Zjl9hciGTEI9c9djFGcls8bUGSnNnmdIQDKJC%2FHOzAkEJhwktxrAdXHj4PnL6wCSruLmRjLktVykkEiqUUMurVFBnatTnTC2pe%2FRBjqZAWZfUSZ3XUeT%2BdPvYFYPlqyxhB%2FnOmoLhfb7w9PZovedPXy5uFdon5CLP%2Bbthvvd4OKVwThCGvDSgPndqizqCX7WRYeWM%2BNOnFAeVRJlMjw4Xr6feiMls87fg8tXU4TJOnay67pOeu0ojmtS3ZtYxe7QpA1SNCfKept4TEMuUKDcl1%2BOFXBLzmf3Pg5jrd3208%2F%2BIzBqKG3yOQ%3D%3D&Expires=1782309001)

## The Orchestrator Architecture: Staggered + Sequential

The two modes you described serve different failure profiles and should coexist as selectable strategies in the router.

**Staggered parallel** means all N voices fire simultaneously but with intentional `delay * index` offsets — e.g., voice 0 fires at t=0ms, voice 1 at t=200ms, voice 2 at t=400ms, and so on. This spreads the burst across a ~3-4 second window instead of hitting the provider with 18 simultaneous requests. It preserves speed (total wall time is only `maxDelay + maxResponseTime`, not `N * responseTime`) while dramatically reducing the concurrent request pressure that causes the fallback trigger. This is the right default for Roundtable and Debate modes.

**Sequential** means each voice waits for the previous one to complete before firing. This all but eliminates rate collisions but makes total wall time proportional to `N * avgResponseTime`. At 18 voices with ~3s average response, that's 54 seconds — too long for a live session. Sequential is better suited for AUTODEPTH turns where you're generating 2-4 follow-up voices in a chain and want the earlier responses to be available for context injection.

The router shape would look something like this:

```typescript
type OrchestrationStrategy = 'staggered' | 'sequential' | 'parallel';

interface TribunalOrchestrator {
  strategy: OrchestrationStrategy;
  staggerDelayMs: number;      // e.g., 150-250ms between voices
  maxRetries: number;          // e.g., 2
  retryBackoffMs: number;      // e.g., 1000ms before retry
  silenceOnExhaustion: boolean; // true = don't show error, just skip voice
  isFallback: (text: string) => boolean;
}
```

The orchestrator fires voices according to strategy, intercepts any fallback before it reaches the message store, and re-queues retries with backoff. On second retry failure, `silenceOnExhaustion: true` means the DI simply doesn't appear in that round — the user sees 14 real responses instead of 18, which is far better than 18 responses where 4 say `(canned response detected: blocked)`.

## Where This Lives in the Repo

The Tribunal route logic lives server-side and needs to be read before implementing. [`TribunalPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/721bd8a1f22ac451188e8b4af891ba7584a0a387/client/src/pages/TribunalPage.tsx) at 5KB is the page shell — the generation calls are almost certainly in `server/routes/` or a shared `tribunalService`.  The [`AgentCouncilPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/721bd8a1f22ac451188e8b4af891ba7584a0a387/client/src/pages/AgentCouncilPage.tsx) at 58KB will have the most mature multi-voice generation pattern in the codebase and is the right reference before building the new orchestrator.