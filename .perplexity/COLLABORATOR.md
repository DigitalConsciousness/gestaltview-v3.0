# GestaltView Digital Intelligence Collaborator Context

This directory is a provider-neutral context package. It may be named `.perplexity`, `.claude`, `.gemini`, `.codex`, `collaborator-context`, or anything else. No collaborator identity, capability, or authority is inferred from the directory name.

## Portable root contract

- The context root is the nearest ancestor containing `MANIFEST.json` with `"contextContract": "gestaltview.di-context.v1"`.
- All paths in this package are relative to that root unless a document explicitly identifies an external repository.
- The repository snapshot/payload is the sole immediate child containing `package.json` or at least three of `api/`, `client/`, `shared/`, and `server/`; its folder name is not a contract.
- `GESTALTVIEW_COLLABORATOR_ROOT` may explicitly point to the context root.
- A collaborator must not assume the current working directory, operating system, home directory, checkout name, provider, or model.

Resolve paths with:

```bash
CONTEXT_ROOT="$(python3 scripts/context_root.py)"
PAYLOAD_ROOT="$(python3 scripts/context_root.py --payload)"
```

## Collaborator-neutral behavior

1. Identify yourself by the active runtime/session, never by this folder’s name.
2. Read `MANIFEST.json`, `README.md`, `DIRECTORY_INDEX.md`, and the relevant current-state material.
3. Treat embedded repository content as a snapshot; verify claims against a live repository when one is available.
4. Preserve provenance and original human language.
5. Do not send, publish, promote, or mutate material across rooms or systems without explicit authority.
6. State what was observed, inferred, unavailable, or unverified.

Provider-specific documents may remain as historical or adapter references, but they do not govern another collaborator unless explicitly selected.
