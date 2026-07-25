# Buyer Due Diligence

Use this pass when you want to inspect the Agent Trainer the way a paying buyer would: does setup make sense, does the shared onboarding graph hold together, and is there a demoable path from zero to publish-ready handoff.

## Fast path

```bash
npm run diligence
```

This runs:

- TypeScript typecheck
- Focused onboarding/setup tests
- A solo end-to-end CLI onboarding smoke run with generated repo-corpus scaffolding

Artifacts land under `/tmp/gsvw-agent-trainer-diligence` by default.

## Filmed walkthrough

```bash
npm run demo:onboarding -- solo your-org/your-repo main "Demo Workspace" "Demo Agent"
```

This creates a clean demo session and walks through:

1. Initialize the onboarding session
2. Create the workspace and first agent
3. Stage the repo corpus container
4. Select a provider
5. Review the first manifest batch
6. Import the reviewed manifest
7. Choose lane focus
8. Select theme
9. Run evaluations
10. Publish a demo handoff and write a support bundle

## What to inspect like a buyer

- The wizard should show one current step, not a wall of options.
- The repo-corpus container should make file placement obvious before ingest.
- The manifest should be reusable and human-readable.
- The CLI should let an operator progress without hidden manual steps.
- The support bundle should explain status, blockers, and the next task clearly.
