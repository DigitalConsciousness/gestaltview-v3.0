# Musical DNA Upload Hotfix

## Problem

Manual song upload can fail without the user clearly knowing whether the track landed.

## Code-level fix

In `useTrackUpload`, make upload local-first:

1. Validate file.
2. Create local file record.
3. Append local file immediately with tag `sync:local_ready`.
4. Attempt server upload.
5. If server succeeds, replace local record with server record and tag `sync:synced`.
6. If server fails, keep local record and tag `sync:failed_remote`, then surface visible retry option.

## UX states

```ts
type UploadSyncState =
  | "selected"
  | "local_ready"
  | "syncing"
  | "synced"
  | "failed_remote"
  | "rejected";
```

## User-facing requirement

If remote upload fails:

```text
Track is saved locally for this browser. Cloud sync failed. Retry sync / export local copy.
```

Never silently disappear the selected track.
