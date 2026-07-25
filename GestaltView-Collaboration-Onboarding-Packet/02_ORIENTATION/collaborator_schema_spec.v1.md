# Collaborator Schema Spec v1

## Required collaborator fields
- collaborator_id
- collaborator_type (`human` or `digital_intelligence`)
- name
- role
- scope
- source_of_truth_read
- active_context
- access_boundary
- escalation_path

## Minimum packet absorption
Every collaborator should absorb:
1. constitutional invariants
2. latest orientation checkpoint
3. current focus
4. active blockers
5. role-relevant routing guide

## Why this exists
To reduce reintroduction tax and keep handoffs bounded by evidence and governance.
