# Customization Guide

## White-Label Controls

Use environment variables first:

- `KIT_NAME`
- `KIT_DOMAIN`
- `KIT_TIER`
- `KIT_PRIMARY_COLOR`

## Safe Customization Areas

- prompt templates in `config/prompts.ts`
- domain presets in `config/domains.ts`
- pricing and limits in `config/tiers.ts`
- docs and onboarding copy
- UI styling inside components and pages

## Avoid

- importing parent-repo protected internals
- hardcoding buyer secrets
- embedding founder-specific language into client-facing UX

## Recommended Process

1. customize domain preset and prompt language
2. tune the setup wizard copy
3. add real framework adapters for the API modules
4. connect uploads and embedding generation
5. expand tests once the runtime is fixed
