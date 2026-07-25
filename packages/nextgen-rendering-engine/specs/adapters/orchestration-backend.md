# Orchestration Backend Adapter Specification

## Scope

Adapter contract for orchestration backends that coordinate GestaltView skills/runtime and AgentReach automation around rendering jobs, dependency checks, multi-step plans, and artifact handoff.

## Required Input Format

Adapters MUST accept a normalized `RenderJob` JSON document:

```json
{
  "jobId": "string",
  "backend": "orchestration-backend",
  "workflow": {
    "type": "skill-runtime|agentreach-automation|multi-backend-render",
    "goal": "human-readable objective",
    "steps": [
      {
        "id": "string",
        "backend": "native-render-backend|web-render-backend|document-render-backend|diagram-graph-backend|orchestration-backend",
        "input": {}
      }
    ],
    "skills": ["optional skill names"],
    "automation": { "provider": "agentreach", "task": "string", "parameters": {} }
  },
  "outputs": { "directory": "workspace-relative path", "formats": ["json", "md"] },
  "metadata": { "requester": "string", "traceId": "string" }
}
```

Workflow steps MUST be acyclic unless the adapter explicitly declares iterative-loop support in capabilities.

## Output Artifacts

The adapter MUST produce:

- `render-manifest.json` with job ID, backend ID, workflow type, executed step IDs, child artifact manifests, timings, and final status.
- `diagnostics.json` with validation issues, skipped steps, tool/runtime logs, retry summaries, and human-action requirements.
- A workflow result artifact such as `workflow-result.json` or `workflow-summary.md` containing the final plan/output and links to child artifacts.

Optional artifacts include step-level manifests, runbooks, task transcripts, and dependency audit reports.

## Runtime Dependencies

- GestaltView skill catalog/runtime files and any declared skill dependencies.
- AgentReach automation runtime for automation-backed workflows.
- JSON schema validator for `RenderJob` and child backend inputs.
- Filesystem artifact registry for workspace-relative handoff.
- Optional queue, scheduler, or agent runtime for parallel execution and retries.

The adapter MUST probe available skills, automation providers, child backends, and safe execution modes before accepting a workflow.

## Error Model

Errors MUST use the shared JSON shape:

```json
{
  "ok": false,
  "code": "ORCHESTRATION_BACKEND_ERROR_CODE",
  "message": "human-readable summary",
  "severity": "fatal|retryable|warning",
  "stage": "validate|plan|probe|dispatch|monitor|collect-artifacts|summarize|write-artifacts",
  "details": {},
  "artifacts": ["diagnostics.json"]
}
```

Standard error codes:

- `ORCHESTRATION_INPUT_INVALID`
- `ORCHESTRATION_CYCLE_DETECTED`
- `ORCHESTRATION_DEPENDENCY_UNAVAILABLE`
- `ORCHESTRATION_SKILL_UNAVAILABLE`
- `ORCHESTRATION_AUTOMATION_FAILED`
- `ORCHESTRATION_CHILD_BACKEND_FAILED`
- `ORCHESTRATION_ARTIFACT_COLLECTION_FAILED`
- `ORCHESTRATION_OUTPUT_WRITE_FAILED`

Child backend failures MUST be preserved with original codes and nested under `details.childErrors`.

## Cross-Backend Compatibility Contract

The backend MUST:

- Treat every child backend as an implementation of the shared `RenderJob` envelope.
- Validate child inputs before dispatch and preserve child manifests without rewriting their stable fields.
- Emit deterministic workflow artifact names: `{jobId}-workflow-result.json`, `{jobId}-workflow-summary.md`, and `{jobId}-step-{stepId}-manifest.json` when step manifests are copied.
- Propagate trace IDs and workspace-relative paths across all child jobs.
- Normalize skill/runtime and AgentReach automation failures into the shared error object.
- Make partial success explicit in `render-manifest.json` with per-step statuses.

## Candidate Source Directories and Key Package Manifests

- `skills/gestaltview-codex` — GestaltView Codex operating skill checked for this adapter specification task.
  - `skills/gestaltview-codex/SKILL.md`
  - `skills/gestaltview-codex/references/codebase-analysis.md`
- `skills/gestaltview-gen-engine-rendering-comprehensive` — rendering-oriented GestaltView skill package.
  - `skills/gestaltview-gen-engine-rendering-comprehensive/package.json`
  - `skills/gestaltview-gen-engine-rendering-comprehensive/requirements.txt`
- `skills/gestaltview-suite-orchestrator` — suite orchestration skill candidate.
  - `skills/gestaltview-suite-orchestrator/SKILL.md`
- `agentreach-main/agentreach-main` — AgentReach automation candidate.
  - `agentreach-main/agentreach-main/pyproject.toml`
