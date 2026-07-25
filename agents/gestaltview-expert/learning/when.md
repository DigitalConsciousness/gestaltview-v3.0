# When

## Lifecycle

- At startup: read root context and current-state files.
- During orientation: map runtime, skills, and provider selection.
- During refactor: compare behavior to the learning tree and current TODOs.
- At closeout: update the learning tree, asset tree, and `docs/CurrentState.md`.

## Questions to answer

- When should the expert stop reading and start changing files?
- When is a TODO ready to become an implementation task?
- When does a gap require a doc update versus a code change?

## Update rule

Keep chronology explicit. If a dependency or sequence changes, record it here.
