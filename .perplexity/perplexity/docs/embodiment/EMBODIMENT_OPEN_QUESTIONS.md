# Embodiment Open Questions

## Registry and governance

- Should the validator become part of the default build or CI path once registry drift is acceptable to fail fast on?
- Should slug format stay strictly kebab-case, or should the repo allow future exceptions for legacy artifacts?
- Do we want nested required-field checks to remain hard failures, or should some be downgraded to warnings when profiles are intentionally partial?

## Runtime integration

- Which runtime entrypoint should own registry consumption when the next slice begins?
- Should room-aware digital intelligence be a new surface, a routing concern, or an augmentation to existing room state?
- What is the minimum runtime contract for consuming an embodiment profile safely without coupling the runtime to the generator format?

## Generated artifact behavior

- Should `shared/embodiment/generated.ts` stay committed, or should it eventually become a build artifact only?
- If additional generated views are added later, should they be derived from the same validator pass or split into separate checks?
- Is the current generated artifact ordering the desired canonical order, or just the current implementation detail?

## Spec sequencing

- Should `the-recursive-builder` be the first profile used to prove the registry hardening flow end-to-end?
- Which room-aware intelligence behaviors belong in the next slice versus a later runtime slice?
