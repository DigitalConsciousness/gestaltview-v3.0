# Transcriptory patch directive

## Problem

`api/transcriptory/captures.ts` can create an audio capture with `status = processing` if the client passes that status. Then `api/transcriptory/transcribe.ts` refuses to claim it because `claimTranscriptoryCapture()` only accepts `pending` or `failed`.

Observed exported row:

```json
{
  "status": "processing",
  "transcript_status": "processing",
  "raw_transcript": null,
  "processing_started_at": null,
  "error_message": null
}
```

## Required code change

### `api/transcriptory/captures.ts`

For new upload/audio captures without `rawTranscript`, do not allow client-provided `processing`.

Replace:

```ts
const status = rawTranscript ? "ready" : body.status?.trim() || "pending";
```

with:

```ts
const requestedStatus = body.status?.trim();
const status = rawTranscript
  ? "ready"
  : requestedStatus === "failed"
    ? "failed"
    : "pending";
```

### `api/transcriptory/transcribe.ts`

Allow claim if status is `processing` but the row was never actually claimed.

In `claimTranscriptoryCapture()`, replace the simple `.in("status", ["pending", "failed"])` filter with a two-stage claim:

1. Try normal claim for `pending` / `failed`.
2. If no row, try recovery claim:

```ts
.eq("status", "processing")
.is("processing_started_at", null)
.is("raw_transcript", null)
```

Then set `processing_started_at`, provider, and clear errors.

### UX requirement

Transcriptory UI must show a visible failed/retry state. Never leave a capture as an infinite spinner with no error.
