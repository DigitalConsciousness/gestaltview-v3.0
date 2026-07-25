# CLI Guide

The GestaltView Agent Trainer should support technical operators who prefer terminal workflows over a UI-only posture.

## Commands

```bash
npm run cli -- status
npm run cli -- packs
npm run cli -- bundles
npm run cli -- memory
npm run cli -- platforms
npm run cli -- doctor .env.local
npm run cli -- import-template
npm run cli -- plan devops-terminal-pack
npm run cli -- manifest general-operator-foundation buyer-project buyer-owner
npm run cli -- apply buyer-user-id general-operator-foundation buyer-project buyer-owner knowledge-core-bundle,context-alignment-bundle ./buyer-import.json
npm run apply-pack -- buyer-user-id general-operator-foundation buyer-project buyer-owner knowledge-core-bundle,context-alignment-bundle ./buyer-import.json
```

## Why the CLI Exists

- inspect package posture quickly
- validate environment state
- list preloadable starter packs
- inspect lane-aware source bundles
- make memory and ops flows legible for devops-minded buyers
- apply a starter pack to a real buyer workspace when env is configured

## Future Expansion

The CLI scaffold is the right place to add:

- corpus import commands
- memory export and review
- trainer run inspection
- pack installation and selection
- packaging and release shortcuts
