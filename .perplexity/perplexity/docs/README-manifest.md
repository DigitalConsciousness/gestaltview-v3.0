# Generated Manifest Notes

This document explains the generated manifest artifacts for `gestaltview-v2` and how they should be used.

---

## What these files are

The repo currently generates two manifest outputs:

- `docs/gestaltview-v2.manifest.json` — machine-readable inventory
- `docs/gestaltview-v2.manifest.md` — human-readable summary

They are produced by:

```bash
python3 scripts/generate_repo_manifest.py
```

---

## What the generator scans

The manifest generator currently scans major runtime and documentation surfaces including:

- `api/`
- `client/src/`
- `shared/`
- `scripts/`
- `server/`
- `config/`
- `docs/`
- `supabase/migrations/`

It also extracts:

- route inventory
- API handler inventory
- markdown/doc index
- test-script registry
- dependency snapshot
- git metadata

---

## What the manifest is good for

Use the generated manifest for:

- fast repo orientation
- machine-readable inventory for tools or agents
- cross-repo handoff context
- wiki-generation inputs
- checking that route/API/script coverage is broadly represented

---

## What the manifest is not

Do not treat the generated manifest as a replacement for direct inspection.

It is:

- a summary artifact,
- time-stamped at generation time,
- only as current as the last generator run,
- unable to capture every runtime nuance or recent edit on its own.

If a manifest entry conflicts with the source tree, the source tree wins.

---

## Recommended workflow

1. Inspect the live repo files first for the subsystem you are changing.
2. Regenerate the manifest if your change materially alters routes, API files, docs, scripts, or migration inventory.
3. Update `docs/CurrentState.md` if the repo's operational reality changed.
4. Treat older generated docs in `docs/generated_*` as snapshots, not canonical state.

---

## Related files

- `docs/Manifest.md`
- `docs/CurrentState.md`
- `docs/Workflows.md`
- `scripts/generate_repo_manifest.py`
