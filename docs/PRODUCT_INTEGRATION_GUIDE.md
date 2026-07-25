# GestaltView Product Integration Guide

## Overview

GestaltView v2.0 integrates three powerful modular products into its generative engine:

1. **SymbioCoder** - AI coding assistant that synthesizes code from context
2. **VibeCoder** - Creative voice & tone synthesis engine  
3. **Resume Rockstar** - Career narrative and CV synthesis

These products are full standalone systems that can be optionally integrated to extend GestaltView's artifact synthesis capabilities.

## Product Locations

All product documentation is available in `.perplexity/perplexity/projects/`:

- **SymbioCoder.md** (2.4MB) - Full consciousness-serving AI coding platform
- **VibeCoder.md** (1.4MB) - Creative voice and metaphor synthesis
- **Resume_Rockstar_v2.0_11_17_25.md** (5.4MB) - Complete career synthesis system

## Architecture Integration Points

### 1. SymbioCoder Integration

**Purpose**: Code synthesis from captured context
**Trigger**: When synthesis request includes `code` or `technical` tags

**Connection Path**:
- GestaltView artifact request with code captures
- Routes through gen-engine `synthesis` mode
- SymbioCoder backend processes: language analysis, framework inference, code generation
- Output: Artifact type `code` with synthesized implementation

**API Contract**:
```typescript
// Input: Captures tagged with "code" or "technical"
// Output: GeneratedArtifact with contentFormat: "code"
// Service URL: Configurable via SYMBIO_BASE_URL env var
```

**Features Available**:
- Multi-language support (TypeScript, Python, JavaScript, Rust, Go)
- Framework detection and code scaffolding
- Test generation
- Voice-to-code synthesis (optional)
- Metaphor extraction for documentation

### 2. VibeCoder Integration

**Purpose**: Personal voice analysis and creative tone synthesis
**Trigger**: When synthesis style is `plk-resonant` or request includes `voice` tags

**Connection Path**:
- Extract emotional markers and language patterns from captures
- VibeCoder analyzes tone, energy, and signature metaphors
- Applies personal voice profile to new content
- Output: Artifact with personalized voice applied

**API Contract**:
```typescript
// Input: User captures (text collection for voice analysis)
// Output: GeneratedArtifact with applied personal voice
// Service URL: Configurable via VIBE_BASE_URL env var
```

**Features Available**:
- Tone detection (technical, creative, conversational, formal, playful)
- Energy level analysis (low, medium, high)
- Metaphor extraction and generation
- Emotional arc tracking
- Voice cloning (optional)
- Adaptive emotional response

### 3. Resume Rockstar Integration

**Purpose**: Career narrative and professional document synthesis
**Trigger**: When request includes `career`, `profile`, or `bio` tags

**Connection Path**:
- Extract career-relevant captures and profile metadata
- Resume Rockstar synthesizes career narrative
- Applies ATS optimization (optional)
- Generates multi-format output
- Output: Artifact type `markdown` or `pdf-ready-html`

**API Contract**:
```typescript
// Input: Profile data + career captures
// Output: GeneratedArtifact with career synthesis
// Service URL: Configurable via RESUME_BASE_URL env var
```

**Features Available**:
- Career narrative synthesis
- Skill extraction and highlighting
- ATS optimization
- Multi-format rendering (MD, HTML, PDF, JSON)
- Achievement clustering
- Professional tone adaptation

## Environment Variables

Add to your `.env` to configure product integration:

```bash
# SymbioCoder
SYMBIO_BASE_URL=http://localhost:8000
SYMBIO_API_KEY=your-api-key

# VibeCoder  
VIBE_BASE_URL=http://localhost:5000
VIBE_API_KEY=your-api-key

# Resume Rockstar
RESUME_BASE_URL=http://localhost:3000
RESUME_API_KEY=your-api-key
```

## Integration Workflow

1. **User Creates Capture** in Sanctuary or Blackboard Room
2. **Tags Applied**: `code`, `technical`, `voice`, `career`, `profile`, etc.
3. **Gen-Engine Processes**: Normalizes capture through fusion layer
4. **Product Routing**: Routes to appropriate module based on tags/style:
   - Code tags → SymbioCoder
   - Voice/personality tags → VibeCoder
   - Career/profile tags → Resume Rockstar
5. **Synthesis**: Product module generates specialized artifact
6. **Artifact Created**: Stored in database with source preservation
7. **Destination**: Sent to Creation Corner or Dynamic Inner World

## Fallback Behavior

If a product service is unavailable:

1. Gen-engine captures the capture anyway (never lost)
2. Uses internal synthesis fallback (simpler but functional)
3. Logs warning but continues operation
4. User can re-synthesize when product service is online

## Extending with Custom Products

To add a new product module:

1. Create adapter in `api/_lib/` following SymbioCoder pattern
2. Add routing logic to gen-engine `synthesize` function
3. Map artifact types to output formats
4. Add configuration to environment variables
5. Document in this integration guide

## Full Documentation

For complete implementation details, see:

- SymbioCoder: `.perplexity/perplexity/projects/SymbioCoder.md`
- VibeCoder: `.perplexity/perplexity/projects/VibeCoder.md`
- Resume Rockstar: `.perplexity/perplexity/projects/Resume_Rockstar_v2.0_11_17_25.md`

Each contains:
- Complete architecture documentation
- API endpoint specifications
- Configuration guides
- Example requests/responses
- Troubleshooting guides

## Usage Examples

### Synthesize Code from Context

```bash
curl -X POST http://localhost:3000/api/gen-engine/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "captures": [
      {
        "text": "Need a React component for user auth",
        "tags": ["code", "technical", "react"]
      }
    ],
    "synthesisStyle": "technical"
  }'
```

### Apply Personal Voice

```bash
curl -X POST http://localhost:3000/api/gen-engine/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "captures": [{...voice samples...}],
    "newContent": "This is technical documentation",
    "synthesisStyle": "plk-resonant"
  }'
```

### Generate Career Profile

```bash
curl -X POST http://localhost:3000/api/gen-engine/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "captures": [{...career achievements...}],
    "synthesisStyle": "faithful",
    "metadata": {"format": "markdown"}
  }'
```

## Production Deployment

1. Deploy SymbioCoder backend separately (Python/FastAPI)
2. Deploy VibeCoder service separately (Python/Node)
3. Deploy Resume Rockstar separately (Next.js/Python)
4. Configure env vars pointing to deployed services
5. GestaltView routes all synthesis requests transparently
6. Monitor service health via `/api/gen-engine/health`

---

**Last Updated**: June 5, 2026
**Status**: Integration Framework Complete
**Next**: Deploy individual product services and configure endpoints
