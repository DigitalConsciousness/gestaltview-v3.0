# Agent Trainer

This folder is the strategy and packaging workspace for turning the internal GestaltView agent-training insight into a buyer-facing product without leaking protected core IP.

## What Lives Here

- [MASTER_SPEC.md](/workspaces/gestaltview-v2/agent_trainer/MASTER_SPEC.md)
  The main source of truth for product direction, packaging boundaries, UI direction, tiers, and execution priorities.
- [AGENT_TRAINER_PACKAGE_SPEC.md](/workspaces/gestaltview-v2/agent_trainer/AGENT_TRAINER_PACKAGE_SPEC.md)
  Earlier product framing that surfaced the central insight: the trainer is the product.
- [PLAYBOOK.md](/workspaces/gestaltview-v2/agent_trainer/PLAYBOOK.md)
  Client-facing operational guidance.
- [CONSULTING.md](/workspaces/gestaltview-v2/agent_trainer/CONSULTING.md)
  Consulting positioning and upsell layer.
- [CODEX_PROMPT.md](/workspaces/gestaltview-v2/agent_trainer/CODEX_PROMPT.md)
  Prompt for future build passes.
- [gv_operator_kit/](/workspaces/gestaltview-v2/agent_trainer/gv_operator_kit)
  The actual package scaffold and implementation shell.

## Current Position

The working thesis is:

> GestaltView should sell a branded, buyer-agnostic AI training system that lets operators aim an assistant at their own code, product, knowledge, and context.

The package should preserve GestaltView's signature feel and discipline while protecting the proprietary retrieval, orchestration, and governance systems that create the deeper moat.

## Immediate Next Build Areas

1. Upgrade the `gv_operator_kit` UI from placeholder scaffold to a signature GestaltView shell.
2. Turn the trainer flow into the actual centerpiece of the product.
3. Clarify solo, studio, and enterprise operating modes.
4. Keep the ship-safe versus protected-core boundary explicit in every build pass.
