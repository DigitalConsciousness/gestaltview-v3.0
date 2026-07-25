# GEMINI.md — GestaltView v2 Instructional Context

## Project Overview
**GestaltView v2** is the world's first documented **AI-Human Consciousness Symbiosis** platform, built by Keith Soyka. It serves as a public runtime for the GestaltView ecosystem, centered on **Billy** (a conversational AI companion), PLK (Personal Language Key) integrity, and cross-repository knowledge operations.

### Core Stack
- **Frontend:** React 19, TypeScript, Vite, Wouter (routing), Framer Motion, Tailwind CSS v4, Babylon.js (3D Billy).
- **Backend:** Vercel Serverless Functions (TypeScript).
- **Data Layer:** Supabase (Postgres + `pgvector` for RAG).
- **AI Runtime:** **Gemini Flash 2.0 (Primary)**, OpenAI/Anthropic/Groq (Fallbacks), Ollama (Local AI).
- **Voice Services:** Python-based Whisper STT and CosyVoice TTS (located in `billy_voice/`).

---

## Building and Running

### Development
```bash
# Install dependencies
cd client && npm install

# Start frontend development server (Vite)
cd client && npm run dev
```

### Production Build
```bash
# Build the project (TypeScript check + Vite build)
npm run build
```

### Operational Scripts
- **Health Check:** `npm run health` (Runs comprehensive system status)
- **Billy Check:** `npm run billycheck` (Validates Billy runtime connectivity)
- **Manifest:** `npm run manifest` (Regenerates the repository manifest)
- **Ingestion:** `npm run ingest` (Processes knowledge corpus into Supabase)

---

## Development Conventions & Mandates

### ⚠️ Mandatory Agent Rules (from AGENTS.md)
1.  **FULL FILE REPLACEMENT:** Never provide snippets or surgical edits. Always return the complete, final file content.
2.  **NO MERGE CONFLICT MARKERS:** Ensure output is clean of `<<<<`, `====`, `>>>>`.
3.  **STRICT TYPESCRIPT:** Use explicit interfaces; avoid `any`. Place interfaces above the components they describe.
4.  **GEMINI FIRST:** Billy (in `BillyLive.tsx` and `Billy.tsx`) **must** use Gemini Flash 2.0. Do not switch to OpenAI/Anthropic for core Billy functions.
5.  **COPYRIGHT:** Never remove `© 2026 Keith Soyka / GestaltView` copyright notices.

### Visual Identity (Neural Aurora Gradient)
- **Primary Teal:** `#00D4FF`
- **Dark Background:** `#0A0F14`
- **Atmosphere:** Always include scanlines and radial glow effects on new pages.
- **Fonts:** JetBrains Mono for UI/Billy; Inter for marketing.

### Architectural Concepts
- **PLK (Personal Language Key):** Preserve exact user wording. Never paraphrase or compress.
- **Context Weaver:** Intent is extracted via 5W1H before LLM calls.
- **Tribunal Framework:** Forensic validation layer for AI claims.

---

## Directory Structure Highlights
- `client/src/`: React application (components, pages, contexts).
- `api/`: Vercel serverless functions (Billy logic, LLM routing).
- `shared/`: TypeScript types shared between client and API.
- `docs/`: Extensive architectural and workflow documentation.
- `scripts/`: Operational shell and Python scripts.
- `billy_voice/`: Python voice processing services.
- `Diligence_Reports/`: Source data for tribunal and evidence exhibits.

---

## Key Files for Reference
- `AGENTS.md`: Mandatory operating instructions for AI agents.
- `README.md`: High-level project summary.
- `package.json`: Project dependencies and scripts.
- `docs/ArchitecturalStructure.md`: Detailed system design.
- `docs/CurrentState.md`: Ongoing development log and next steps.
- `client/src/App.tsx`: Central router and application entry.
- `api/billy.ts`: Core Billy chat and retrieval logic.
- `.env.example`: Required environment variables.
- `skills/index.md : Skills Directory
