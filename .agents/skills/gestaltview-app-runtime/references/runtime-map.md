# Runtime Map

## Main surfaces

| Surface | Primary paths | Notes |
|---|---|---|
| Marketing / portfolio site | `client/src/pages/Home.tsx`, `client/src/components/HeroSection.tsx`, adjacent sections | Public-facing narrative and conversion surface |
| Billy full-page and widget | `client/src/components/Billy.tsx`, `client/src/components/BillyLive.tsx`, `client/src/components/BillyChip.tsx` | Coordinate with Billy skill for AI behavior |
| Domain pages | `client/src/pages/BrainSparksPage.tsx`, `MusicalDNAPage.tsx`, `AddictionRecoveryPage.tsx`, `AlzheimersLegacyPage.tsx`, `EthicsFrameworkPage.tsx` | Product-specific story + demo surfaces |
| Evidence / exhibits | `client/src/pages/ExhibitsIndex.tsx`, `client/src/components/exhibits/`, `client/src/components/DiligenceExplorer/` | Diligence and audit-facing UI |
| Billing / auth | `client/src/pages/Pricing.tsx`, `client/src/pages/SignIn.tsx`, `client/src/pages/Welcome.tsx` | Revenue surface, auth gating |
| APIs | `api/`, especially `api/billy.ts`, `api/actions/[...path].ts`, `api/pricing.ts`, `api/stripe/` | Serverless contracts |
| Operational scripts | `scripts/` | Health, tests, manifest, ingestion, workflow helpers |

## Design anchors

- Primary teal: `#00D4FF`
- Dark surface: near-black / deep slate
- Ambient language: scanlines, glows, radial haze, Neural Aurora
- Fonts in repo docs: JetBrains Mono for system/Billy feel, Inter/cleaner typography for broad marketing surfaces
