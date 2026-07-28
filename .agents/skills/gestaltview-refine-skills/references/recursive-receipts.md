# Recursive collaboration receipts

Use a durable record when a skill claims continuity, learning, iterative improvement, or embodiment-profile development.

## Receipt contract

```yaml
receipt_id: stable identifier
skill: skill name and version or source revision
subject: user, project, profile, or system scope
request:
  fingerprint: stable source/request fingerprint
  expected_outputs: []
cycle:
  started_at: timestamp
  completed_at: timestamp or null
known:
  sources: []
  prior_receipts: []
  constraints: []
  uncertainties: []
attempted:
  objective: ""
  actions: []
  rationale: []
observed:
  outputs: []
  tests_or_evidence: []
  failures: []
  user_or_collaborator_corrections: []
changed:
  proposed_learnings: []
  approved_learnings: []
  rejected_learnings: []
  confidence_and_basis: []
  next_state: []
provenance:
  created_by: ""
  source_links: []
  supersedes: []
  approval_state: proposed
```

Adapt storage format to the runtime. Preserve the semantic fields.

## Continuity rules

1. Retrieve only receipts relevant to the current responsibility and subject.
2. Compare observed outputs with the originating request and expected outputs.
3. Keep observations separate from approved learning.
4. Do not silently overwrite rejected or superseded interpretations.
5. Record the source and reason for every durable change.
6. Let the human or designated governance process approve identity-affecting changes.
7. Test whether the next run actually uses the receipt when continuity is claimed.
8. Expire or archive operational details that no longer help, while preserving required provenance.

## Evidence of recursion

Do not infer recursion from repeated runs. Demonstrate:

1. Cycle A leaves a changed-state receipt.
2. Cycle B retrieves the relevant receipt.
3. Cycle B behaves differently because of it.
4. The difference is observable and appropriate.
5. Correction remains possible and attributable.

If any link is absent, describe the loop as intended, modeled, or partial rather than operational learning.
