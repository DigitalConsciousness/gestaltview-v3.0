# vercel.json patch

Add explicit include rules for render routes. The current `api/gen-engine/*.ts` includeFiles entry covers `shared/rendering/**`, but `/api/render/*` is missing.

```json
"api/render/*.ts": {
  "includeFiles": "api/_lib/**,shared/rendering/**,packages/nextgen-rendering-engine/**"
}
```

Also avoid raw TypeScript package imports from Vercel functions unless the package is built to `dist` during root build. The immediate hotfix full-file swap for `api/render/engine.ts` removes the raw package import and uses shared renderer fallback so production stops 500ing.
