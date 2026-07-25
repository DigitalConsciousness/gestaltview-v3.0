# Artifacts

This folder holds handoff bundles, generated archives, and other packaged outputs that need a stable place in the repo.

Current convention:
- `embodiment-collaborator-package-v5.zip` is the latest collaborator handoff bundle
- `latest.zip` is the stable alias for the newest collaborator handoff bundle
- root-level zip copies may exist temporarily during packaging passes

Packaging command:
- `npm run package:collaborator`

Keep this folder for distributable outputs, not source-of-truth docs.
