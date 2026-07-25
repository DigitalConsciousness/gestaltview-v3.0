from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os
import logging
import sentry_sdk

log = logging.getLogger(__name__)


def _read_bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None or value == "":
        return default

    return value.lower() in {"1", "true", "yes", "on"}


def _read_float_env(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None or value == "":
        return default

    try:
        parsed = float(value)
    except ValueError:
        return default

    return parsed if 0.0 <= parsed <= 1.0 else default


def init_sentry() -> None:
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return

    sentry_sdk.init(
        dsn=dsn,
        send_default_pii=_read_bool_env("SENTRY_SEND_DEFAULT_PII", True),
        enable_logs=_read_bool_env("SENTRY_ENABLE_LOGS", True),
        traces_sample_rate=_read_float_env("SENTRY_TRACES_SAMPLE_RATE", 1.0),
        profile_session_sample_rate=_read_float_env(
            "SENTRY_PROFILE_SESSION_SAMPLE_RATE",
            1.0,
        ),
        profile_lifecycle=os.getenv("SENTRY_PROFILE_LIFECYCLE", "trace") or "trace",  # type: ignore
    )

init_sentry()

app = FastAPI(title="GestaltView GPT Actions Stub", version="1.0.0")
@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0

class SynthesisRequest(BaseModel):
    query: str
    sectionId: Optional[str] = None
    mode: str = "synthesize"
    topK: int = 5
    includeCorpus: bool = True
    includeManifest: bool = True
    userContext: Optional[Dict[str, Any]] = None

class BucketDropCreateRequest(BaseModel):
    content: str
    rawText: Optional[str] = None
    emotionalIntensity: int = Field(default=5, ge=1, le=10)
    cognitiveLoad: int = Field(default=3, ge=1, le=10)
    significanceScore: float = Field(default=0.5, ge=0, le=1)
    attentionState: Optional[str] = None
    hyperfocusIndicator: bool = False
    executiveFunction: Optional[str] = None
    energyLevel: int = Field(default=5, ge=1, le=10)
    connectedDrops: List[str] = []
    tapestryWeight: float = 1.0
    captureContext: Dict[str, Any] = {}

class ModuleProfileUpsertRequest(BaseModel):
    moduleKey: str
    payload: Dict[str, Any]
    userId: Optional[str] = None
    sourceNotes: List[str] = []
    mergeStrategy: str = "merge"

class MusicalDNARequest(BaseModel):
    songTitle: str
    artist: str
    album: Optional[str] = None
    lyrics: Optional[str] = None
    emotionalConnection: Optional[str] = None
    associatedMemory: Optional[str] = None
    workflowRelevance: Optional[str] = None
    themes: List[str] = []
    musicalFeatures: Dict[str, Any] = {}

class JourneyRecapRequest(BaseModel):
    userId: Optional[str] = None
    moduleKeys: List[str] = []
    timeWindowDays: int = 30
    focus: Optional[str] = None

class TribunalRequest(BaseModel):
    topic: Optional[str] = None
    question: str
    participants: List[str] = ["gemini", "openai", "anthropic"]
    validationDomains: List[str] = []
    mode: str = "draft"

@app.get('/actions/health')
def get_health():
    return {
        'status': 'ok',
        'version': '1.0.0',
        'schemaVersion': '2.0.0',
        'platformVersion': '6.23',
        'timestamp': datetime.now(timezone.utc).isoformat(),
    }

@app.get('/sentry-debug')
async def sentry_debug():
    log.warning('Sentry debug route triggered')
    raise Exception('Intentional error for Sentry testing')

@app.get('/actions/providers/status')
def get_provider_status():
    return {
        'providers': [
            {'provider': 'gemini', 'available': True, 'failures': 0, 'priority': 1},
            {'provider': 'openai', 'available': True, 'failures': 0, 'priority': 2},
            {'provider': 'anthropic', 'available': True, 'failures': 0, 'priority': 3},
        ]
    }

@app.post('/actions/billy/synthesize')
def synthesize_with_billy(request: SynthesisRequest):
    # Replace with real Billy orchestration.
    return {
        'answer': f"Stub Billy response for: {request.query}",
        'provider': 'stub-provider',
        'mode': request.mode,
        'sectionId': request.sectionId,
        'weavePlan': {
            'raw_query': request.query,
            'intent': 'general',
            'five_w1h': {'who': None, 'what': request.query, 'where': None, 'when': None, 'why': None, 'how': None},
            'expansions': {
                'iteration': f'What came before {request.query}?',
                'emergence': f'What is emerging around {request.query}?',
                'significance': f'Why does {request.query} matter?',
                'ripples': f'What does {request.query} unlock?'
            },
            'retrieval_queries': [request.query]
        },
        'loomResults': [],
        'corpus': [],
        'warnings': ['Replace stub implementation with real Billy orchestration.']
    }

@app.post('/actions/billy/loom')
def retrieve_loom_results(request: SynthesisRequest):
    request.mode = 'loom'
    return synthesize_with_billy(request)

@app.post('/actions/billy/code')
def generate_code_with_billy(request: SynthesisRequest):
    request.mode = 'code'
    return synthesize_with_billy(request)

@app.post('/actions/billy/weave-plan')
def build_weave_plan_only(payload: Dict[str, Any]):
    query = payload.get('query')
    if not query:
        raise HTTPException(status_code=400, detail='query is required')
    return {
        'raw_query': query,
        'intent': 'general',
        'five_w1h': {'who': None, 'what': query, 'where': None, 'when': None, 'why': None, 'how': None},
        'expansions': {
            'iteration': f'What came before {query}?',
            'emergence': f'What is emerging around {query}?',
            'significance': f'Why does {query} matter?',
            'ripples': f'What does {query} unlock?'
        },
        'retrieval_queries': [query]
    }

@app.post('/actions/bucket-drops')
def capture_bucket_drop(request: BucketDropCreateRequest):
    return {
        'id': 'bucketdrop_stub_001',
        'status': 'captured',
        'bucketDrop': request.model_dump(),
        'loomHints': ['Preserve the original phrasing.', 'Link later to related drops.'],
        'nextSuggestedAction': 'Optionally run a synthesis after more context accumulates.'
    }

@app.post('/actions/profile/module')
def upsert_profile_module(request: ModuleProfileUpsertRequest):
    return {
        'moduleKey': request.moduleKey,
        'status': 'updated',
        'data': request.payload,
        'updatedAt': datetime.now(timezone.utc).isoformat(),
    }

@app.get('/actions/profile/module/{module_key}')
def get_profile_module(module_key: str, userId: Optional[str] = None):
    return {
        'moduleKey': module_key,
        'status': 'retrieved',
        'data': {'userId': userId, 'message': 'Replace with real persistence layer.'},
        'updatedAt': datetime.now(timezone.utc).isoformat(),
    }

@app.post('/actions/musical-dna/analyze')
def analyze_musical_dna(request: MusicalDNARequest):
    return {
        'analysisId': 'musicaldna_stub_001',
        'songTitle': request.songTitle,
        'artist': request.artist,
        'cognitiveResonance': 0.81,
        'empowermentPotential': 0.77,
        'consciousnessElevation': 0.73,
        'adhdResonanceFactors': {'momentum': 'high', 'focus-support': 'moderate'},
        'metaphorAnalysis': {'coreImage': 'uphill motion with emotional lift'},
        'summary': 'Stub musical DNA analysis. Replace with your real processor.'
    }

@app.post('/actions/journey/recap')
def generate_journey_recap(request: JourneyRecapRequest):
    return {
        'summary': 'Stub journey recap. Replace with a real cross-module summarizer.',
        'patterns': ['PLK cues recurring across recent entries'],
        'crossLinks': ['Module 11 language cues reinforce Module 3 strengths framing'],
        'nextSuggestedAction': 'Invite the user to validate which pattern feels most true.'
    }

@app.post('/actions/tribunal/run')
def run_tribunal_review(request: TribunalRequest):
    return {
        'sessionId': 'tribunal_stub_001',
        'consensusReached': False,
        'consensusScore': 0.64,
        'majorityView': 'Stub Tribunal review. Replace with real multi-provider orchestration.',
        'dissent': ['One participant requested stronger evidence traceability.'],
        'participantSummaries': [{'provider': p, 'summary': 'Stub summary'} for p in request.participants]
    }
