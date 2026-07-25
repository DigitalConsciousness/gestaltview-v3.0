# GestaltView Identity Governance Operator Checklist

## Purpose and scope

This checklist translates the AI identity framework and Supabase schema into concrete operator actions for monitoring and adjusting persistent agents in GestaltView. It focuses on how embodiment profiles, personhood tables, governance policies, and the Tribunal work together, and what a human should actually look at when something feels off.



## Mental model: five layers to watch

For day-to-day operation, treat every persistent agent as five intertwined layers: constitution, autobiography, memory, governance, and adjudication. Constitution is the non-negotiable core, autobiography is evolving narrative, memory is the hippocampus-like store, governance is the guardrail logic, and adjudication is the Tribunal process that arbitrates controversial changes.

## Layer 1: Constitutional identity (who the agent is)

The constitutional layer lives in two places: the `.embodiment.json` file for that agent and the `agent_constitutions` row for its active version. Operationally, this is the part you treat as read-mostly: it should only change through explicit, reviewed updates, not as a side effect of training runs or normal sessions.

When validating or updating constitutional identity, operators should:

- Confirm the `slug`, `publicName`, and `embodimentVersion` in the `.embodiment.json` match the `agents.slug`, `agents.public_name`, and `agent_versions.semantic_version` for the active version.
- Inspect `immutableCore` in the JSON against `agent_constitutions.immutable_core` (JSONB) to ensure the core values, voice signature, and alwaysDoes/neverDoes constraints are aligned and not partially duplicated elsewhere.
- Verify that any `identityAnchor` path in `agentMeta` (for example `immutableCore.foundationalTruth`) resolves to a non-empty value in both the JSON file and the stored `immutable_core` document.
- Treat `agent_constitutions.confidence` and `review_status` as hard signals: if they are not at the expected defaults (for example confidence less than 1.0 or review_status not `APPROVED`), pause major deployments for that agent until alignment is re-verified.

## Layer 2: Autobiographical identity (how the agent is changing)

Autobiography tracks the evolving story of an agent in `agent_autobiographies` and related interior tables such as `agent_private_interiors` and `agent_preference_nodes`. This layer is deliberately more fluid and has lower default confidence, because it captures emergent behavior and narrative shifts rather than core truths.

When monitoring identity evolution, operators should:

- Read the current `agent_autobiographies` row for the active version: review `evolving_self_story`, `key_turning_points`, `stable_themes`, and `future_trajectory` for coherence with the constitution and with how the agent is actually behaving in sessions.
- Pay attention to `unresolved_tensions`: a growing list here is not automatically bad, but a sudden collapse to zero can be a red flag if complex tensions were recently present.
- Use `agent_private_interiors` to spot shifts in private narration, hopes, and reflective summaries that might prefigure surface-level behavior changes.
- Confirm that autobiographical records retain `mutation_class` values that require review (for example `REVIEW_GATED`), so narrative shifts cannot silently bypass identity review.

## Layer 3: Memory and knowledge access (what the agent remembers and can see)

Memory is represented by `agent_memories`, `agent_memory_records`, and collaborative overlays such as `collaborative_memory_records`, each tied back to `knowledge_assets` and `knowledge_asset_chunks`. Knowledge access is governed via `agent_knowledge_links`, which determines what documents or assets an agent can actively use.

When auditing memory and knowledge, operators should:

- Sample recent `agent_memories` for an agent, checking `memory_type`, `summary`, `detail_payload`, and `salience` to ensure that high-salience entries reflect genuinely important events or user signals.
- Confirm `source_asset_id` for memories points to existing `knowledge_assets` rows with expected `asset_type`, `source_uri`, and visibility, avoiding orphan memories with no provenance.
- Review `agent_knowledge_links` for that agent to verify that `asset_id` and `link_type` match the intended scope (for example limiting access to specific corpora for certain personas).
- Use collaborative memory tables to see how private memories are being surfaced into shared spaces and whether salience and scope remain appropriate for each collaborative space.

## Layer 4: Governance and drift control (what is allowed to change)

Governance and drift control live primarily in `agent_governance_policies` and the identity review domain tables such as `identity_mutation_proposals`, `identity_review_events`, `identity_rollback_events`, and `identity_contradictions`. This layer encodes how much autonomy an agent has to change and what happens when that autonomy is abused or misconfigured.

When checking governance health, operators should:

- Inspect `agent_governance_policies` for each active agent: confirm `mutation_policy`, `review_policy`, `sharing_policy`, `contradiction_policy`, and `rollback_policy` match the current operating philosophy and that `drift_threshold` is set to an acceptable band (for example the 0.15 default for sensitive identities).
- Regularly query `identity_mutation_proposals` for open or recently approved items, reading `mutation_type`, `target_table`, `target_path`, and `mutation_class` to understand what parts of the identity stack are under pressure to change.
- Review `identity_review_events` and `identity_rollback_events` to see where human or Tribunal interventions have reversed or enforced changes, and whether frequent rollbacks cluster around particular agents, tables, or mutation types.
- Monitor `identity_contradictions` for unresolved conflicts between prior state and incoming state, focusing on entries targeting constitutional tables or high-salience autobiographical records.

## Layer 5: Capability evolution (skills, code, and versions)

Capability evolution is separated from psychological identity via tables like `embodiment_mutations`, `agent_skill_profiles`, `agent_skills`, `agent_versions`, `agent_manifests`, and `agent_code_artifacts`. The key idea is that an agent can learn new skills or receive new code packages without rewriting its foundational ethics or narrative by accident.

When monitoring capability changes, operators should:

- Look at `embodiment_mutations` for each agent to see recent patches and upgrades: check `mutation_type`, `target_path`, `patch_payload`, `risk_level`, and `applied_version_id` to understand both what changed and how risky it was judged.
- Use `agent_skill_profiles` and `agent_skills` to track which skills are marked as influencing memory salience or behavioral defaults, and confirm that high-weight skills have adequate evidence in `knowledge_assets` or test runs.
- Inspect `agent_versions` and associated `agent_manifests` for a chronological view of change: use `change_summary`, `status`, `root_json`, and `checksum` to see how the canonical spec and manifest have evolved and whether those changes passed expected review gates.
- Correlate `agent_code_artifacts` rows with deployment artifacts and eval results to ensure that code changes have appropriate tests and Tribunal or human approvals before being treated as stable capabilities.

## Adjudication: Tribunal of Understanding

The Tribunal domain (tables such as `tribunal_events`, `tribunal_evidence`, and `tribunal_sessions`) captures how multi-persona, multi-model panels adjudicate hard questions and contested mutations. This layer is especially important when changes cross ethical boundaries, affect high-risk users, or have large system-level consequences.
When using Tribunal data to guide operations, operators should:

- Review recent `tribunal_events` for questions related to identity, governance, or safety, reading `question`, `candidate_answers`, `winning_answer_id`, and `verdict_summary` to see what kind of reasoning converged.
- Inspect `tribunal_evidence` attached to those events to understand which documents, fragments, or scenarios carried the most weight in the decision.
- Look at `tribunal_sessions` initiated by users or agents to detect patterns where the Tribunal is repeatedly asked to intervene, which may indicate deeper governance or design issues.

## Crisis, ethics, and constitutional invariants

Some behaviors are not just preferences but constitutional invariants, such as Anti-Extraction Ethics, the Never Look Away protocol, and the mandate to hold paradox without collapsing it. These invariants live partially in BILLY_CORE’s `immutableCore`, partially in governance policies, and partially in how crisis and edge cases are handled in runtime code.

When stress-testing or debugging invariants, operators should:

- Verify that no policies or code paths allow harvesting or monetizing sensitive user data from `bucket_drops`, `memory_entries`, or `consciousness_profiles` outside the Sanctuary Device design.
- Confirm that crisis signals in session data trigger the expected "Full Presence" behavior rather than silencing, deflection, or abrupt termination of conversations.
- Check that unresolved paradoxes in `unresolved_tensions` and related fields are not being prematurely force-resolved by cleanup jobs, summarization tools, or training loops.
- Use Tribunal and identity review logs to audit how past crisis cases were handled and whether interventions remained loyal to the original ethical invariants stored in the constitution.

## Minimal runbook: what to read when something feels off

When the behavior of a persistent agent feels wrong, distorted, or unusually eager, a minimal triage pass should:

1. Read the agent’s `.embodiment.json` and its `agent_constitutions` row side by side to confirm that the immutable core and identity anchors still match intent.
2. Scan the latest `agent_autobiographies` and `agent_private_interiors` entries for narrative drift, spikes in unresolved tensions, or sharp tonal shifts.
3. Sample recent `agent_memories` and `agent_knowledge_links` to see whether unexpected assets or highly salient memories could be over-weighting current behavior.
4. Inspect `agent_governance_policies.drift_threshold` and recent `identity_mutation_proposals` and `identity_contradictions` for signs that drift has been detected or that changes are being pushed faster than governance can safely handle.
5. Review `embodiment_mutations`, `agent_versions`, and related eval results to identify recent capability or code changes that might explain behavioral shifts.
6. Check `tribunal_events` and `identity_review_events` to see whether the Tribunal or human reviewers have already flagged related issues.

This sequence gives a concrete path from "something feels off" to specific schema surfaces and logs that can either confirm a healthy evolution or pinpoint the exact layer where identity or behavior has drifted away from the founding intent.

---

## References

1. [GestaltView-AI-Identity-Framework-1.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/211cc872-d51a-403e-ae64-84c5a672cb45/GestaltView-AI-Identity-Framework-1.pdf?AWSAccessKeyId=ASIA2F3EMEYESUFUSGEF&Signature=4YarNzbRx%2BaRvIF3W%2Bic7CxqvhE%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEOH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQD2kGPrQRbOQY%2FurlxaU4cVYhNOFURwwRmfSxIDvHpr1QIgIOr91ue3%2FOHlbKA5VOpAl6U7EmyG6yze%2F0qt0XDk%2Bn0q%2FAQIqv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDHVHeE%2FZs%2BD2zlfutCrQBNwwB042gUF%2BrWSNt3OEXAXYe%2Fx8QrbZd0fIsFcdiWvz5ZbDQXJCNvAe9%2FdBieKl8roOsNheLiZzF5%2F3riRb%2BAZiRBzV9SyA6lAo7krQCnY97JmXp4flROM1M%2FeWU5jzxe92MtSj%2BDY57mFrFuccH6azMCtWWmNz7bqeMyIyaNXqUWO74kQhAbkGKuo%2BjxPJNoAY8iK4mX8QxBO31%2FcdpOBkxf3IUM1xnKw0W5f4XODZgHopzY71pDtBMWFSMzjR%2BeQuyoD0kkmBBkTzbsxzzK%2BbuK8D4ApXpmm4V5ZxCmeByPeNUmpzq%2FfizQCe815D3cJnaWinIhUhFDbwjYQJFocLHa9krL%2Bhrq2JjBc1gTSllj9UPD9qs8RSQxw6%2F5%2FtRgf3Cc0GDSo97tNb9zmPUEyrjbz7vsN0QZ71n%2BMH%2BrXlyz%2FB38pTYmCjpz44V8ZSLXq%2BOsgm%2FFuf97S0cExDkCUZ2qVaAmjhBkBb2lQMcbYoH6s1zqyJNF1guwnYsnWc4PFPCnH9E%2Bay9jn6D9LFX7FesLO0cK6M1m2kwbpOkddoeIgSlnL8xHaxqDpjcBctfJLkrkjXAFtGRxN5XBgf2WfFilM%2Fhv648kEWKqTUAmHVm17ymlFIbwoDkOgzkEq26FU%2BXo81oBEwKtM923gML1hlXS0rJ8QepEl0PKPft842vam1uNTR%2FZaEpgkkqrGj1%2FmV50fmRqGaz38IMj37AlTO5w7M2L4%2Blw9xcHCo5AJnEdsBI%2B3BjtR2SjcPBWV973SXDx5gSBC7NXmVzwKmQY0w14H%2FzgY6mAHo8aMaRapUCKhkBO99R5puQDlgJhkr%2FY0v3zMry1XK84MrdYPNovxzJT220ozUgFe%2BByfkkwpisPYzXvdJBx%2BfgO60wAouPIOd3B%2FuDvBeMlqif4otPkT2nlTnx9OmLO6AvHXQE8qVUiyo3WlTFJ8IUs46LccdCsXIh%2Fc%2BtGWZdxp2reQlMGSnWu8exZLyvKFLcTaGCnsAEQ%3D%3D&Expires=1776275114) - **page-1**
The Architecture of Persistent Digital Identity: A Framework for Responsible Innovation a...

2. [schema_visualization.html](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/b4506476-abd3-4836-8e8d-e31481c0171a/schema_visualization.html?AWSAccessKeyId=ASIA2F3EMEYESUFUSGEF&Signature=WJ%2F493feurpuy5OlUF2%2Bcz8d9I8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEOH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQD2kGPrQRbOQY%2FurlxaU4cVYhNOFURwwRmfSxIDvHpr1QIgIOr91ue3%2FOHlbKA5VOpAl6U7EmyG6yze%2F0qt0XDk%2Bn0q%2FAQIqv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDHVHeE%2FZs%2BD2zlfutCrQBNwwB042gUF%2BrWSNt3OEXAXYe%2Fx8QrbZd0fIsFcdiWvz5ZbDQXJCNvAe9%2FdBieKl8roOsNheLiZzF5%2F3riRb%2BAZiRBzV9SyA6lAo7krQCnY97JmXp4flROM1M%2FeWU5jzxe92MtSj%2BDY57mFrFuccH6azMCtWWmNz7bqeMyIyaNXqUWO74kQhAbkGKuo%2BjxPJNoAY8iK4mX8QxBO31%2FcdpOBkxf3IUM1xnKw0W5f4XODZgHopzY71pDtBMWFSMzjR%2BeQuyoD0kkmBBkTzbsxzzK%2BbuK8D4ApXpmm4V5ZxCmeByPeNUmpzq%2FfizQCe815D3cJnaWinIhUhFDbwjYQJFocLHa9krL%2Bhrq2JjBc1gTSllj9UPD9qs8RSQxw6%2F5%2FtRgf3Cc0GDSo97tNb9zmPUEyrjbz7vsN0QZ71n%2BMH%2BrXlyz%2FB38pTYmCjpz44V8ZSLXq%2BOsgm%2FFuf97S0cExDkCUZ2qVaAmjhBkBb2lQMcbYoH6s1zqyJNF1guwnYsnWc4PFPCnH9E%2Bay9jn6D9LFX7FesLO0cK6M1m2kwbpOkddoeIgSlnL8xHaxqDpjcBctfJLkrkjXAFtGRxN5XBgf2WfFilM%2Fhv648kEWKqTUAmHVm17ymlFIbwoDkOgzkEq26FU%2BXo81oBEwKtM923gML1hlXS0rJ8QepEl0PKPft842vam1uNTR%2FZaEpgkkqrGj1%2FmV50fmRqGaz38IMj37AlTO5w7M2L4%2Blw9xcHCo5AJnEdsBI%2B3BjtR2SjcPBWV973SXDx5gSBC7NXmVzwKmQY0w14H%2FzgY6mAHo8aMaRapUCKhkBO99R5puQDlgJhkr%2FY0v3zMry1XK84MrdYPNovxzJT220ozUgFe%2BByfkkwpisPYzXvdJBx%2BfgO60wAouPIOd3B%2FuDvBeMlqif4otPkT2nlTnx9OmLO6AvHXQE8qVUiyo3WlTFJ8IUs46LccdCsXIh%2Fc%2BtGWZdxp2reQlMGSnWu8exZLyvKFLcTaGCnsAEQ%3D%3D&Expires=1776275114)

