# Wiki Documentation Summary

Generated: 2026-04-09 11:30:58
Repository: GestaltView v2
Commit: `46a35cdd664bd3549ef8d41b793a1d21a51657d9`

## Generation Status

**Overall Status**: ✅ Complete

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| Pages | 12 | 12 | ✅ |
| Sections | 36 | 36 | ✅ |
| Citations | - | 180 | ✅ |

## Page Details

| Page | Title | Sections | Citations | Diagrams | Status |
|------|-------|----------|-----------|----------|--------|
| 01_overview.md | Overview | 3/3 | 11 | 0 | ✅ |
| 02_development-environment.md | Development Environment | 3/3 | 13 | 0 | ✅ |
| 03_frontend-auth-routing.md | Frontend, Auth, And Routing | 3/3 | 12 | 0 | ✅ |
| 04_billy-runtime.md | Billy Runtime | 3/3 | 14 | 0 | ✅ |
| 05_data-memory-retrieval.md | Data, Memory, And Retrieval | 3/3 | 18 | 0 | ✅ |
| 06_voice-runtime.md | Voice Runtime | 3/3 | 13 | 0 | ✅ |
| 07_gate-package-builder.md | GATE Package Builder | 3/3 | 16 | 0 | ✅ |
| 08_agent-trainer.md | Agent Trainer | 3/3 | 24 | 0 | ✅ |
| 09_diligence-tribunal.md | Diligence And Tribunal | 3/3 | 12 | 0 | ✅ |
| 10_operations-manifest-skills.md | Operations, Manifest, And Skills | 3/3 | 18 | 0 | ✅ |
| 11_deployment-infrastructure.md | Deployment And Infrastructure | 3/3 | 13 | 0 | ✅ |
| 12_current-state-and-glossary.md | Current State And Glossary | 3/3 | 16 | 0 | ✅ |

## Source Coverage

### Covered Files

- `.devcontainer/setup.sh` - cited in 02_development-environment.md, 11_deployment-infrastructure.md
- `README.md` - cited in 01_overview.md, 02_development-environment.md, 03_frontend-auth-routing.md, 09_diligence-tribunal.md, 10_operations-manifest-skills.md, 11_deployment-infrastructure.md, 12_current-state-and-glossary.md
- `api/_lib/auth.ts` - cited in 05_data-memory-retrieval.md
- `api/_lib/llmRouter.ts` - cited in 04_billy-runtime.md
- `api/_lib/memory.ts` - cited in 05_data-memory-retrieval.md
- `api/_lib/supabase.ts` - cited in 05_data-memory-retrieval.md
- `api/billy.ts` - cited in 04_billy-runtime.md
- `api/diligence.ts` - cited in 09_diligence-tribunal.md
- `api/session/dashboard.ts` - cited in 05_data-memory-retrieval.md, 06_voice-runtime.md
- `api/session/memory.ts` - cited in 05_data-memory-retrieval.md
- `api/trainer/_helpers.ts` - cited in 08_agent-trainer.md
- `api/trainer/runs/index.ts` - cited in 08_agent-trainer.md
- `api/voice/billy.ts` - cited in 06_voice-runtime.md
- `billy_voice/app.py` - cited in 06_voice-runtime.md
- `billy_voice/cosyvoice_tts.py` - cited in 06_voice-runtime.md
- `client/src/App.tsx` - cited in 03_frontend-auth-routing.md
- `client/src/components/DiligenceExplorer/index.tsx` - cited in 09_diligence-tribunal.md
- `client/src/components/DiligenceExplorer/useDiligenceData.ts` - cited in 09_diligence-tribunal.md
- `client/src/components/GATEEntrypointWizard.tsx` - cited in 07_gate-package-builder.md
- `client/src/contexts/AuthContext.tsx` - cited in 03_frontend-auth-routing.md
- `client/src/features/agent-trainer/AgentTrainerPage.tsx` - cited in 08_agent-trainer.md
- `client/src/lib/gateApi.ts` - cited in 07_gate-package-builder.md
- `client/src/pages/SignIn.tsx` - cited in 03_frontend-auth-routing.md
- `docs/CurrentState.md` - cited in 01_overview.md, 07_gate-package-builder.md, 12_current-state-and-glossary.md
- `package.json` - cited in 01_overview.md, 02_development-environment.md, 11_deployment-infrastructure.md
- `scripts/generate_repo_manifest.py` - cited in 10_operations-manifest-skills.md
- `scripts/gv-health-check.sh` - cited in 10_operations-manifest-skills.md
- `scripts/gv.sh` - cited in 02_development-environment.md, 10_operations-manifest-skills.md
- `server/agent-trainer/orchestrator.ts` - cited in 08_agent-trainer.md
- `server/agent-trainer/study-sources.ts` - cited in 08_agent-trainer.md
- `server/gate/service.ts` - cited in 07_gate-package-builder.md
- `shared/agent-trainer/compiler.ts` - cited in 08_agent-trainer.md
- `shared/agent-trainer/embodiment.ts` - cited in 08_agent-trainer.md
- `shared/agent-trainer/schemas.ts` - cited in 08_agent-trainer.md, 12_current-state-and-glossary.md
- `shared/billy/runtime.ts` - cited in 04_billy-runtime.md, 12_current-state-and-glossary.md
- `shared/gate/engine.ts` - cited in 07_gate-package-builder.md
- `shared/gate/schemas.ts` - cited in 07_gate-package-builder.md, 12_current-state-and-glossary.md
- `shared/llm/plk.ts` - cited in 04_billy-runtime.md
- `shared/tribunal/types.ts` - cited in 09_diligence-tribunal.md
- `vercel.json` - cited in 11_deployment-infrastructure.md
- `vite.config.ts` - cited in 02_development-environment.md, 11_deployment-infrastructure.md
- `worker/trainer/main.ts` - cited in 08_agent-trainer.md

## Issues

### Errors

None

### Recommendations

- None - documentation looks good!
