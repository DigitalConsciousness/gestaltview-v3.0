# Operating Cycle

## Standard cycle
1. Read local instructions and context files.
2. Identify whether the task belongs to v2, the Compendium, or a satellite repo.
3. Build or update the artifact.
4. Validate the change with the smallest relevant checks.
5. Update `CurrentState.md` with changes, reasoning, validation, repo state, and recommendations.
6. If the work affects long-memory or sister-repo context, note the sync-back requirement.
7. Commit with an intentful message.

## For larger feature work
Use the Symbiotic Workflow pattern:
- extract context,
- align against invariants,
- implement in runtime,
- validate,
- sync back to state documents and the Compendium.
