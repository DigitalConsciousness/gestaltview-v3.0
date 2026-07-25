# Agent Trainer Package Scope

## Package promise

The bespoke Agent Trainer package is not just a ZIP export. It is a buyer-specific starter system that shortens the path from purchase to first controlled deployment.

The customer should understand the purchase as:

- A configured runtime scaffold aligned to their use case, tier, backend, and delivery surfaces.
- A branded onboarding package with operator-facing docs, install scripts, and environment templates.
- A curated starter configuration that makes the first rollout concrete instead of abstract.

## What the buyer receives

The current generated package should be described as including:

- `package.manifest.json` with buyer, order, config, compatibility, quote, and deliverable metadata.
- `config/backend.env.template` for the selected infrastructure path.
- `config/theme.tokens.json` for the selected visual system.
- `config/operator-packs.json` and `config/source-bundles.json` reflecting chosen starter packs.
- `branding/<theme>.json` with branding and asset references.
- `docs/README.md`, `docs/ONBOARDING.md`, `docs/ARCHITECTURE_SUMMARY.md`, `docs/DELIVERABLES.md`, and `docs/SUPPORT.md`.
- `install.sh` and `install.ps1` for the first-run bootstrap path.

## Bespoke vs templated

Templated:

- Runtime scaffolding shape
- Documentation structure
- Config file layout
- Installer/bootstrap scripts

Bespoke:

- Buyer identity and branding
- Use-case defaults
- Tier, backend, and delivery-surface mix
- Selected operator packs and source bundles
- Compatibility warnings, exclusions, and support path
- Price/quote composition and order metadata

## Value at point of purchase

The pricing and builder surfaces should communicate four concrete outcomes:

- The buyer sees the exact package shape before paying.
- Payment immediately converts into a provisioned package path, not a manual follow-up void.
- Access-key redemption gates delivery so download entitlement is explicit and supportable.
- The package is structured for deployment handoff, not just evaluation.

## Prototype to scale plan

Phase 1: Golden-path prototype

- Keep the package set intentionally small.
- Require the payment -> issued key -> key redemption -> download path to stay green.
- Validate that buyer identity persists from draft capture through packaging.

Phase 2: Repeatable packaging

- Treat the current artifact composer as the canonical package factory.
- Expand templates only when they map to a real deliverable customers already expect.
- Keep admin control-plane tooling separate from hosted/client runtime surfaces.

Phase 3: Vending model

- Generate buyer packages from configuration + entitlement data instead of operator intervention.
- Add post-payment delivery channels for the issued access key.
- Promote the package factory from single ZIP generation into a catalog-driven product assembly pipeline.
