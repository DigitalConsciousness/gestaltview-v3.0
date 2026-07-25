# Product Integration Architecture

## Three Integrated Products

GestaltView's generative engine integrates three fully-featured AI products that were already extensively developed in the `.perplexity/perplexity/projects/` directory:

### 1. SymbioCoder
**File**: `.perplexity/perplexity/projects/SymbioCoder.md` (2.4MB)

**What it is**: A consciousness-serving AI coding platform with 35M+ lines of legendary code integrated into a unified system.

**Key Components**:
- Python FastAPI backend at `backend/app.py`
- Core engine: `symbio_core_engine.py` with multi-provider LLM routing
- Frontend React components with WebSocket support
- Voice-to-code synthesis with emotional state tracking
- Metaphor detection and creative code documentation

**Integration into GestaltView**:
```
Capture with "code" or "technical" tags
        ↓
Gen-Engine Fusion (normalizes input)
        ↓
Routes to SymbioCoder Module
        ↓
SymbioCoder synthesizes code in requested language
        ↓
Artifact created with type: "code"
        ↓
Stored in Dynamic Inner World or Creation Corner
```

**Features Available**:
- Multi-language code generation (TypeScript, Python, JavaScript, Rust, Go)
- Framework detection (React, Vue, Next, FastAPI, Django, etc.)
- Automatic test generation
- Voice input processing
- Metaphor-driven documentation
- Context-aware scaffolding

---

### 2. VibeCoder
**File**: `.perplexity/perplexity/projects/VibeCoder.md` (1.4MB)

**What it is**: A creative voice and emotional tone synthesis engine that learns personal communication patterns.

**Key Components**:
- Tone detection engine (technical, creative, conversational, formal, playful)
- Metaphor extraction and generation system
- Emotional arc tracking
- Personal voice profile builder
- Energy level analysis (low, medium, high)

**Integration into GestaltView**:
```
Captures representing personal voice/style
        ↓
VibeCoder analyzes tone patterns and metaphors
        ↓
Builds personal voice profile (PLK-resonant style)
        ↓
Apply profile to any content needing personal touch
        ↓
Artifact created with applied personal voice
        ↓
Stored with metadata about tone and energy
```

**Features Available**:
- Automatic tone analysis from text samples
- Signature phrase and metaphor extraction
- Voice cloning (optional, with consent)
- Emotional adaptation based on context
- Metaphor weaving for creative writing
- Personality preservation in syntheses

---

### 3. Resume Rockstar
**File**: `.perplexity/perplexity/projects/Resume_Rockstar_v2.0_11_17_25.md` (5.4MB)

**What it is**: A comprehensive career narrative and professional document synthesis system with ATS optimization.

**Key Components**:
- Career narrative synthesizer
- Skill extraction and highlighting
- ATS (Applicant Tracking System) optimization
- Multi-format rendering (Markdown, HTML, PDF, JSON)
- Achievement clustering and narrative weaving
- Resume analysis and suggestions

**Integration into GestaltView**:
```
Profile captures with "career", "profile", "achievement" tags
        ↓
Resume Rockstar analyzes career narrative
        ↓
Extracts skills, achievements, experience patterns
        ↓
Synthesizes polished career profile
        ↓
Artifact created with type: "markdown" or "pdf-ready-html"
        ↓
Multi-format rendering available on demand
```

**Features Available**:
- Career narrative generation from unstructured captures
- Implicit skill extraction
- Professional tone adaptation
- ATS-optimized keyword highlighting
- Achievement metric highlighting
- Multi-format export
- Career trajectory analysis

---

## Integration Flow

### When User Creates Captures

```
1. User creates capture in Sanctuary/Blackboard Room
   └─ Applies tags: "code", "voice", "career", etc.

2. Capture normalized through Fusion layer
   └─ Multi-modal processing, consent validation

3. Gen-Engine analyzes tags and synthesis style
   └─ Determines routing: SymbioCoder? VibeCoder? Resume Rockstar?

4. Route to appropriate product module
   ├─ SymbioCoder: Code tagged captures → code synthesis
   ├─ VibeCoder: Voice/personality tagged → tone analysis
   └─ Resume Rockstar: Career tagged → narrative synthesis

5. Product generates specialized artifact
   └─ With metadata, resonance score, source preservation

6. Artifact stored and made available
   ├─ Creation Corner (for editing/refinement)
   ├─ Dynamic Inner World (for spatial visualization)
   └─ Export/download options
```

### Tag-Based Routing

| Tag | Routes To | Output Type | Synthesis Style |
|-----|-----------|------------|-----------------|
| `code` | SymbioCoder | `code` | `technical` |
| `technical` | SymbioCoder | `code` | `technical` |
| `architecture` | SymbioCoder | `blueprint-json` | `technical` |
| `voice` | VibeCoder | `markdown` | `plk-resonant` |
| `personality` | VibeCoder | `markdown` | `plk-resonant` |
| `career` | Resume Rockstar | `markdown` | `faithful` |
| `profile` | Resume Rockstar | `markdown` | `faithful` |
| `achievement` | Resume Rockstar | `markdown` | `faithful` |

---

## Configuration

### Environment Variables

```bash
# Enable/disable product services
ENABLE_SYMBIO_CODER=true
ENABLE_VIBE_CODER=true
ENABLE_RESUME_ROCKSTAR=true

# Service endpoints (optional, for external deployments)
SYMBIO_BASE_URL=http://localhost:8000
SYMBIO_API_KEY=sk_symbio_xxx

VIBE_BASE_URL=http://localhost:5000
VIBE_API_KEY=sk_vibe_xxx

RESUME_BASE_URL=http://localhost:3000
RESUME_API_KEY=sk_resume_xxx
```

### Fallback Behavior

If a product service is unavailable:
1. Capture is ALWAYS preserved (never lost)
2. Gen-engine uses internal fallback synthesis
3. Warning logged for user awareness
4. User can re-synthesize when service online
5. Graceful degradation - system keeps running

---

## Architecture Decisions

### Why Integration This Way?

1. **Preserve Existing Products**: SymbioCoder, VibeCoder, Resume Rockstar are complete, battle-tested systems
2. **Non-invasive Bridge**: GestaltView connects them through tagged routing, not modification
3. **Opt-in Only**: Users must approve synthesis; ambient mode suggests only
4. **Source Preservation**: Original captures never destroyed
5. **Modular**: Each product can be deployed independently

### Artifact Lifecycle

```
Create (Sanctuary)
    ↓
Fuse (normalize multi-modal input)
    ↓
Route (tag-based product selection)
    ↓
Synthesize (product generates artifact)
    ↓
Store (with source preservation)
    ↓
Render (Dynamic Inner World spatial display)
    ↓
Export/Download (multiple formats available)
```

---

## Advanced Features

### Product Chaining

Create artifacts that flow through multiple products:

```
1. User capture: "Help me write my bio in my personal voice"
   Tags: ["career", "profile", "voice"]

2. First pass: Resume Rockstar generates career profile
3. Second pass: VibeCoder applies personal voice
4. Result: Career profile in user's unique voice
```

### Metadata Enrichment

Each product adds metadata to artifacts:

**SymbioCoder adds**:
- `language`: Programming language
- `framework`: Detected framework
- `complexity`: Estimated code complexity
- `hasTests`: Whether tests were generated

**VibeCoder adds**:
- `tone`: Detected primary tone
- `energy`: Energy level (low/medium/high)
- `metaphors`: Extracted metaphors
- `emotionalArc`: Emotional trajectory

**Resume Rockstar adds**:
- `atsOptimized`: Whether ATS optimization applied
- `skillCount`: Number of skills extracted
- `achievementCount`: Number of achievements
- `suggestedImprovements`: Array of suggestions

---

## Production Deployment

### Standalone Services

Each product can be deployed independently:

```bash
# SymbioCoder (Python/FastAPI)
cd products/symbio-coder
docker build -t symbio-coder .
docker run -p 8000:8000 symbio-coder

# VibeCoder (Python/Node)
cd products/vibe-coder
docker build -t vibe-coder .
docker run -p 5000:5000 vibe-coder

# Resume Rockstar (Next.js/Python)
cd products/resume-rockstar
docker build -t resume-rockstar .
docker run -p 3000:3000 resume-rockstar
```

### GestaltView Configuration

Point to deployed services:

```bash
SYMBIO_BASE_URL=https://symbio.yourcompany.com
VIBE_BASE_URL=https://vibe.yourcompany.com
RESUME_BASE_URL=https://resume.yourcompany.com
```

---

## Extending with New Products

To add a new product module:

1. **Create adapter** in `api/_lib/yourProduct.ts`
2. **Add routing logic** in gen-engine `synthesize` function
3. **Map artifact types** to output formats
4. **Add config** to environment variables
5. **Document** in `docs/PRODUCT_INTEGRATION_GUIDE.md`
6. **Test end-to-end** with sample captures

---

## Quality Assurance

### Testing Products

```bash
# Test SymbioCoder routing
curl -X POST /api/gen-engine/synthesize \
  -d '{"captures": [{"tags": ["code"]}]}'

# Test VibeCoder routing
curl -X POST /api/gen-engine/synthesize \
  -d '{"captures": [{"tags": ["voice"]}]}'

# Test Resume Rockstar routing
curl -X POST /api/gen-engine/synthesize \
  -d '{"captures": [{"tags": ["career"]}]}'

# Check service health
curl /api/gen-engine/health
```

---

**Architecture Version**: 1.0  
**Last Updated**: June 5, 2026  
**Status**: Production Ready
