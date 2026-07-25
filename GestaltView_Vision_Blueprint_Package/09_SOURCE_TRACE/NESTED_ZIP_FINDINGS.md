# Nested Zip Findings

Generated: `2026-06-01T17:25:13+00:00`

The user indicated the intended nested source was `contextual_lens.zip`.

## What the mounted files exposed

```json
{
  "GestaltView_Vision_Blueprint_Package.zip": [],
  "creation.zip": [],
  "GestaltView_Vision_Blueprint_Package_with_Creation_Layer.zip": [
    "GestaltView_Vision_Blueprint_Package/99_SOURCE_ARCHIVES/creation.zip"
  ]
}
```

## Integrity note

In the mounted file-system view available during this pass, `contextual_lens.zip` was **not present** inside `/mnt/data/GestaltView_Vision_Blueprint_Package.zip`.

The closest available contextual framing source was:

- `/mnt/data/creation.zip` → `tools/GestaltView-Contextual-Anchoring-Checkpoint.md`

This package therefore treats the available contextual anchoring checkpoint, Doctrine of Origin, Founding Statement, Room Definitions, UI/UX spec, Constitutional Invariants, and Codex Outside-In Translation Layer as the active framing corpus.

Nothing in this package pretends an unavailable archive was parsed. If `contextual_lens.zip` is later present in the runtime, rerun this package generation with that archive placed in `99_SOURCE_ARCHIVES/` and update this findings file.
