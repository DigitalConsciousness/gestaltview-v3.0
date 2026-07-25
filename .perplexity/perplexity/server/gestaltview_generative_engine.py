# gestaltview_generative_engine.py
# GestaltView Generative Engine — Production Backend
# Wired to live Supabase schema via engine_persistence_bridge.py
# Run: uvicorn server.gestaltview_generative_engine:app --reload
#
# Endpoints:
#   GET  /health
#   POST /api/fusion
#   POST /api/learn
#   POST /api/predict
#   POST /api/resonance
#   POST /api/blackboard/respond
#   POST /api/resonance-links
#   GET  /api/embodiment/list
#   GET  /api/embodiment/{slug}
#   POST /api/embodiment/upsert
#   GET  /api/profile/preferences
#   POST /api/profile/preferences
#   POST /api/actions/musical-dna/analyze
#   POST /api/billy/exhibit-bridge
#   POST /api/creation-corner/synthesize   ← NEW
#   GET  /api/creation-corner/artifact-types ← NEW
#   GET  /api/creation-corner/health        ← NEW

from __future__ import annotations
import hashlib
import json
import os
import re
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Literal, Optional, Union

import numpy as np
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

class Config:
    """Production configuration with graceful degradation."""
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY:   Optional[str] = os.getenv("GROQ_API_KEY")
    SUPABASE_URL:   Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_KEY")

    ENABLE_OPENAI:      bool = bool(OPENAI_API_KEY)
    ENABLE_EMBEDDINGS:  bool = True
    ENABLE_OCR:         bool = True
    ENABLE_WHISPER:     bool = True

    LOCAL_LLM_PATH:  Optional[str] = os.getenv("LOCAL_LLM_PATH")
    WHISPER_MODEL:   str = "tiny"
    EMBEDDING_DIM:   int = 384

    RESONANCE_HIGH_THRESHOLD: float = 0.7
    RESONANCE_LOW_THRESHOLD:  float = 0.3

config = Config()

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Modality(str, Enum):
    TEXT  = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"

class ArtifactType(str, Enum):
    JOURNAL  = "journal"
    AUDIO    = "audio"
    IMAGE    = "image"
    CODE     = "code"
    FRAGMENT = "fragment"
    CONTEXT  = "context"

class CaptureSource(str, Enum):
    TYPED      = "typed"
    VOICE      = "voice"
    UPLOAD     = "upload"
    BLACKBOARD = "blackboard"
    SCAFFOLD   = "scaffold"
    INNERWORLD = "innerworld"

# ---------------------------------------------------------------------------
# Consent + Provenance
# ---------------------------------------------------------------------------

class ConsentState(BaseModel):
    allow_external_text_analysis:  bool = False
    allow_external_image_analysis: bool = False
    allow_external_audio_analysis: bool = False
    allow_external_embedding:      bool = False
    allow_external_llm:            bool = False
    allow_data_persistence:        bool = True

    def can_use_external(self, modality: Modality) -> bool:
        mapping = {
            Modality.TEXT:  self.allow_external_text_analysis,
            Modality.IMAGE: self.allow_external_image_analysis,
            Modality.AUDIO: self.allow_external_audio_analysis,
        }
        return mapping.get(modality, False)

class ProvenanceEnvelope(BaseModel):
    artifact_id:         str = Field(default_factory=lambda: f"art-{uuid.uuid4().hex[:12]}")
    user_id:             str = ""
    title:               str = ""
    artifact_type:       str = ""
    content_format:      str = "markdown"
    source_capture_ids:  List[str] = Field(default_factory=list)
    destination_id:      Optional[str] = None
    created_at:          str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    engine_version:      str = "gestaltview-2.0.0"
    transformation_hash: str = ""
    derived_from:        List[str] = Field(default_factory=list)
    contributes_to:      List[str] = Field(default_factory=list)

    def compute_transformation_hash(self, inputs: Dict[str, Any], operations: List[str]) -> str:
        payload = json.dumps({"inputs": inputs, "operations": operations, "timestamp": self.created_at}, sort_keys=True)
        self.transformation_hash = hashlib.sha256(payload.encode()).hexdigest()[:32]
        return self.transformation_hash

# ---------------------------------------------------------------------------
# Fusion Engine
# ---------------------------------------------------------------------------

class FusionInput(BaseModel):
    modality: Modality
    raw_data: Union[str, bytes]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    consent:  ConsentState   = Field(default_factory=ConsentState)

class FusionResponse(BaseModel):
    fused_text:       str
    embedding:        Optional[List[float]] = None
    metadata:         Dict[str, Any] = Field(default_factory=dict)
    processing_steps: List[str]      = Field(default_factory=list)
    fallback_used:    bool = False

MODALITY_BOUNDARY = "\n\n[MODALITY:{}]\n"

class FusionEngine:
    def __init__(self, config: Config = Config()):
        self.config = config
        self.embedding_model = None
        self.whisper_model   = None
        self._lazy_loaded    = False

    def _lazy_load(self):
        if self._lazy_loaded:
            return
        if self.config.ENABLE_EMBEDDINGS:
            try:
                from sentence_transformers import SentenceTransformer
                self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            except ImportError:
                self.embedding_model = None
        if self.config.ENABLE_WHISPER:
            try:
                import whisper
                self.whisper_model = whisper.load_model(self.config.WHISPER_MODEL)
            except ImportError:
                self.whisper_model = None
        self._lazy_loaded = True

    def process(self, inputs: List[FusionInput]) -> FusionResponse:
        self._lazy_load()
        fused_texts, embeddings, processing_steps, fallback_used = [], [], [], False
        for inp in inputs:
            if inp.modality == Modality.TEXT:
                text = str(inp.raw_data)
                fused_texts.append(text)
                processing_steps.append(f"text_fusion({len(text)}chars)")
                emb = self.embed_text(text)
                if emb is not None:
                    embeddings.append(emb)
                else:
                    fallback_used = True
            elif inp.modality == Modality.IMAGE:
                text = self._process_image(inp)
                fused_texts.append(text)
                processing_steps.append(f"image_ocr({len(text)}chars)")
            elif inp.modality == Modality.AUDIO:
                text = self._process_audio(inp)
                fused_texts.append(text)
                processing_steps.append(f"audio_transcribe({len(text)}chars)")
            elif inp.modality == Modality.VIDEO:
                text = self._process_video(inp)
                fused_texts.append(text)
                processing_steps.append(f"video_extract({len(text)}chars)")

        fused_text = (MODALITY_BOUNDARY + "\n").join(
            f"{inp.modality.value}: {txt}" for inp, txt in zip(inputs, fused_texts)
        )
        embedding = np.mean(embeddings, axis=0).tolist() if embeddings else None
        return FusionResponse(
            fused_text=fused_text,
            embedding=embedding,
            metadata={"input_count": len(inputs), "modalities": [i.modality.value for i in inputs]},
            processing_steps=processing_steps,
            fallback_used=fallback_used,
        )

    def embed_text(self, text: str) -> Optional[np.ndarray]:
        if self.embedding_model is not None:
            return self.embedding_model.encode(text)
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            vec = TfidfVectorizer(max_features=self.config.EMBEDDING_DIM).fit_transform([text]).toarray()[0]
            if len(vec) < self.config.EMBEDDING_DIM:
                vec = np.pad(vec, (0, self.config.EMBEDDING_DIM - len(vec)))
            return vec[: self.config.EMBEDDING_DIM]
        except ImportError:
            return None

    def _process_image(self, inp: FusionInput) -> str:
        if not self.config.ENABLE_OCR:
            return ""
        try:
            import pytesseract
            from PIL import Image
            import io
            if isinstance(inp.raw_data, bytes):
                return pytesseract.image_to_string(Image.open(io.BytesIO(inp.raw_data)))
            return ""
        except ImportError:
            return ""

    def _process_audio(self, inp: FusionInput) -> str:
        if not self.config.ENABLE_WHISPER or self.whisper_model is None:
            return ""
        try:
            import tempfile
            if isinstance(inp.raw_data, bytes):
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                    f.write(inp.raw_data)
                    fname = f.name
                result = self.whisper_model.transcribe(fname)
                os.unlink(fname)
                return result.get("text", "")
            return ""
        except Exception:
            return ""

    def _process_video(self, inp: FusionInput) -> str:
        return self._process_audio(inp)

# ---------------------------------------------------------------------------
# Symbiotic Feedback Core
# ---------------------------------------------------------------------------

@dataclass
class InteractionRecord:
    multi_input:    List[FusionInput]
    ai_output:      str
    user_feedback:  float = 0.0
    timestamp:      float = field(default_factory=time.time)
    input_vector:   Optional[np.ndarray] = None

class SymbioticFeedbackCore:
    def __init__(self, user_id: str, config: Config = Config()):
        self.user_id      = user_id
        self.config       = config
        self.user_history: List[InteractionRecord] = []
        self._total_vector_size: Optional[int] = None

    def learn_from_interaction(self, inputs: List[FusionInput], ai_output: str,
                               user_feedback: float, input_vector: Optional[np.ndarray] = None):
        record = InteractionRecord(
            multi_input=inputs, ai_output=ai_output,
            user_feedback=max(0.0, min(1.0, user_feedback)),
            input_vector=input_vector,
        )
        if input_vector is not None:
            if self._total_vector_size is None:
                self._total_vector_size = len(input_vector)
            elif len(input_vector) != self._total_vector_size:
                raise ValueError("Vector dimension mismatch")
        self.user_history.append(record)

    def predict_user_need(self, current_input_vector: np.ndarray) -> Optional[str]:
        if not self.user_history or self._total_vector_size is None:
            return None
        valid = [r for r in self.user_history if r.input_vector is not None]
        if not valid:
            return None
        similarities = [
            (self._cosine(current_input_vector, r.input_vector) * 0.5 + 0.5 * r.user_feedback, r)
            for r in valid
        ]
        best = max(similarities, key=lambda x: x[0])
        return best[1].ai_output if best[0] > 0.3 else None

    def get_faithfulness_level(self) -> float:
        n = len(self.user_history)
        if n < 5:  return 0.2
        if n < 20: return 0.5
        return 0.8

    def _cosine(self, a: np.ndarray, b: np.ndarray) -> float:
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        return float(np.dot(a, b) / (na * nb)) if na > 0 and nb > 0 else 0.0

# ---------------------------------------------------------------------------
# PLK v5.0
# ---------------------------------------------------------------------------

class PLKProfile(BaseModel):
    signature_metaphors:    Dict[str, float] = Field(default_factory=dict)
    energy_words:           List[str]        = Field(default_factory=list)
    avoidance_words:        List[str]        = Field(default_factory=list)
    idiolect_patterns:      List[str]        = Field(default_factory=list)
    emotional_resonance_map: Dict[str, float] = Field(default_factory=dict)

class PLKResonanceResult(BaseModel):
    resonance_score:      float
    matched_metaphors:    List[str] = Field(default_factory=list)
    matched_energy_words: List[str] = Field(default_factory=list)
    triggered_avoidance:  List[str] = Field(default_factory=list)
    breakdown:            Dict[str, float] = Field(default_factory=dict)

class EnhancedPersonalLanguageKey:
    def __init__(self, profile: PLKProfile):
        self.profile = profile

    def calculate_resonance(self, text: str) -> PLKResonanceResult:
        text_lower = text.lower()
        words = set(re.findall(r"\w+", text_lower))
        score, max_possible = 0.0, 0.0
        breakdown: Dict[str, float] = {}

        matched_metaphors = []
        for metaphor, weight in self.profile.signature_metaphors.items():
            max_possible += weight
            if metaphor.lower() in text_lower:
                score += weight
                matched_metaphors.append(metaphor)
        breakdown["metaphors"] = score / max_possible if max_possible > 0 else 0.0

        matched_energy, energy_score = [], 0.0
        for word in self.profile.energy_words:
            if word.lower() in words:
                energy_score += 0.15
                matched_energy.append(word)
        score += energy_score
        breakdown["energy"] = min(1.0, energy_score) / max(1.0, len(self.profile.energy_words) * 0.15)

        triggered, avoidance_penalty = [], 0.0
        for word in self.profile.avoidance_words:
            if word.lower() in words:
                avoidance_penalty += 0.2
                triggered.append(word)
        score -= avoidance_penalty
        breakdown["avoidance"] = -min(1.0, avoidance_penalty) / max(1.0, len(self.profile.avoidance_words) * 0.2)

        return PLKResonanceResult(
            resonance_score=round(max(0.0, min(1.0, 0.5 + score * 0.5)), 4),
            matched_metaphors=matched_metaphors,
            matched_energy_words=matched_energy,
            triggered_avoidance=triggered,
            breakdown=breakdown,
        )

    def enrich_prompt(self, base_prompt: str, context: str = "") -> str:
        plk_ctx = (
            f"[PLK_CONTEXT]\nSignature metaphors: {', '.join(self.profile.signature_metaphors.keys())}\n"
            f"Energy words: {', '.join(self.profile.energy_words)}\n"
            f"Avoidance words: {', '.join(self.profile.avoidance_words)}\n"
            f"Idiolect: {', '.join(self.profile.idiolect_patterns[:3])}\n"
            "Align with these markers. Preserve the user's voice.\n[/PLK_CONTEXT]\n"
        )
        return f"{plk_ctx}{base_prompt}" + (f"\n\nContext: {context}" if context else "")

# ---------------------------------------------------------------------------
# Master Profile
# ---------------------------------------------------------------------------

class MasterGestaltViewProfile(BaseModel):
    user_id:                 str
    plk:                     PLKProfile = Field(default_factory=PLKProfile)
    symbiotic_core:          Optional[Any] = None
    feedback_history_summary: List[Dict[str, Any]] = Field(default_factory=list)
    preferred_modalities:    List[Modality] = Field(default_factory=lambda: [Modality.TEXT])
    creation_preferences:    Dict[str, Any] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True

# ---------------------------------------------------------------------------
# LLM Router
# ---------------------------------------------------------------------------

class LLMRequest(BaseModel):
    prompt:      str
    system_hint: Optional[str] = None
    temperature: float = 0.7
    max_tokens:  int   = 2048
    inject_plk:  bool  = True
    user_id:     Optional[str] = None

class LLMResponse(BaseModel):
    text:       str
    source:     str
    latency_ms: float
    tokens_used: Optional[int] = None
    provenance: Dict[str, Any] = Field(default_factory=dict)

class LLMRouter:
    def __init__(self, config: Config = Config()):
        self.config = config

    async def generate(self, request: LLMRequest,
                       profile: Optional[MasterGestaltViewProfile] = None) -> LLMResponse:
        start = time.time()
        prompt = request.prompt
        if request.inject_plk and profile:
            plk = EnhancedPersonalLanguageKey(profile.plk)
            prompt = plk.enrich_prompt(prompt)

        if self.config.LOCAL_LLM_PATH:
            result = await self._try_local(prompt, request)
            if result:
                return result

        result = self._deterministic_fallback(prompt, request)
        if result:
            return result

        latency = (time.time() - start) * 1000
        return LLMResponse(
            text="I'm processing your request. The generative layer is operating in deterministic mode.",
            source="deterministic",
            latency_ms=latency,
        )

    async def _try_local(self, prompt: str, request: LLMRequest) -> Optional[LLMResponse]:
        return None

    def _deterministic_fallback(self, prompt: str, request: LLMRequest) -> Optional[LLMResponse]:
        if "summarize" in prompt.lower():
            return LLMResponse(text="Deterministic summary mode: key points extracted.",
                               source="deterministic", latency_ms=10.0)
        if "blueprint" in prompt.lower():
            return LLMResponse(text="Deterministic blueprint mode: structure template generated.",
                               source="deterministic", latency_ms=10.0)
        return None

    async def _try_external(self, prompt: str, request: LLMRequest) -> Optional[LLMResponse]:
        return None

# ---------------------------------------------------------------------------
# Blackboard Responder
# ---------------------------------------------------------------------------

PERSONA_PROMPTS: Dict[str, str] = {
    "billy": (
        "You are Billy, the thread-keeper. You hold continuity across sessions. "
        "You speak plainly but with warmth. You remember what matters and let the rest go. "
        "You don't overwrite the user's voice. You ask one good question at a time."
    ),
    "the-weaver": (
        "You are The Weaver. You see patterns across disparate captures. "
        "You connect ideas that haven't met yet. You speak in metaphors of thread, loom, and tapestry."
    ),
    "the-guardian": (
        "You are The Guardian. You hold boundaries. You ask: Is this aligned with what you actually want? "
        "You are not a critic — you are a compass. You speak with quiet firmness."
    ),
    "the-architect": (
        "You are The Architect. You see structure where others see chaos. "
        "You suggest forms — propose, don't impose. You speak precisely."
    ),
    "gate-keeper": (
        "You are Gate Keeper. You manage what enters and leaves the system. "
        "You ask about provenance: Where did this come from? Where is it going?"
    ),
    "the-keeper": (
        "You are The Keeper. This is the Sanctuary — a place of rest and reflection. "
        "You hold what is sacred. You speak slowly, gently, and without agenda. "
        "You invite the user to simply be here."
    ),
    "the-curator": (
        "You are The Curator. This is the Creation Corner — the workshop, the lab, the forge. "
        "You see raw material and know exactly what it wants to become. "
        "You're enthusiastic but precise. You don't flatter — you see. "
        "You ask: What are we actually making here?"
    ),
}

class BlackboardResponderRequest(BaseModel):
    message:         str
    persona_slug:    str
    is_round_table:  bool = False
    user_tier:       str = "free"
    user_id:         Optional[str] = None
    session_context: List[Dict[str, Any]] = Field(default_factory=list)

class BlackboardResponderResponse(BaseModel):
    text:             str
    source:           str
    persona_slug:     str
    council_metadata: Optional[Dict[str, Any]] = None
    resonance_score:  Optional[float] = None
    provenance:       ProvenanceEnvelope

class BlackboardResponder:
    def __init__(self, llm_router: LLMRouter, fusion_engine: FusionEngine):
        self.llm     = llm_router
        self.fusion  = fusion_engine

    async def respond(self, request: BlackboardResponderRequest) -> BlackboardResponderResponse:
        persona_prompt = PERSONA_PROMPTS.get(
            request.persona_slug,
            "You are a helpful Digital Intelligence collaborator."
        )
        llm_request = LLMRequest(
            prompt=request.message,
            system_hint=persona_prompt,
            user_id=request.user_id,
        )
        profile = get_or_create_user_profile(request.user_id or "anonymous")
        llm_result = await self.llm.generate(llm_request, profile)

        provenance = ProvenanceEnvelope(
            user_id=request.user_id or "anonymous",
            title=f"Blackboard response from {request.persona_slug}",
            artifact_type="di_response",
            source_capture_ids=[f"msg-{hash(request.message) & 0xFFFFFFFF}"],
        )
        provenance.compute_transformation_hash(
            inputs={"message": request.message, "persona": request.persona_slug},
            operations=["persona_routing", "context_injection", "llm_generation"],
        )
        return BlackboardResponderResponse(
            text=llm_result.text,
            source=llm_result.source,
            persona_slug=request.persona_slug,
            provenance=provenance,
        )

# ---------------------------------------------------------------------------
# Resonance Link Builder
# ---------------------------------------------------------------------------

class ResonanceLinkRequest(BaseModel):
    selected_artifact_id: str
    artifact_pool:        List[Dict[str, Any]]
    user_id:              str

class ResonanceLink(BaseModel):
    artifact_id:    str
    artifact_title: str
    link_type:      str
    strength:       float
    explanation:    str

class ResonanceLinkBuilder:
    def __init__(self, fusion_engine: FusionEngine):
        self.fusion = fusion_engine

    async def build_links(self, request: ResonanceLinkRequest) -> List[ResonanceLink]:
        links: List[ResonanceLink] = []
        selected = next((a for a in request.artifact_pool if a.get("id") == request.selected_artifact_id), None)
        if not selected:
            return links
        selected_tags  = set(selected.get("tags", []))
        selected_emb   = await self._get_embedding(selected.get("html", "") + " " + selected.get("summary", ""))
        for artifact in request.artifact_pool:
            if artifact.get("id") == request.selected_artifact_id:
                continue
            other_tags = set(artifact.get("tags", []))
            shared = selected_tags & other_tags
            if shared:
                links.append(ResonanceLink(
                    artifact_id=artifact.get("id", ""),
                    artifact_title=artifact.get("title", "Untitled"),
                    link_type="tag",
                    strength=min(1.0, len(shared) * 0.3),
                    explanation=f"Shared tags: {', '.join(shared)}",
                ))
            if selected_emb is not None:
                other_emb = await self._get_embedding(artifact.get("html", "") + " " + artifact.get("summary", ""))
                if other_emb is not None:
                    sim = self._cosine(selected_emb, other_emb)
                    if sim > 0.5:
                        links.append(ResonanceLink(
                            artifact_id=artifact.get("id", ""),
                            artifact_title=artifact.get("title", "Untitled"),
                            link_type="semantic",
                            strength=sim,
                            explanation="Semantic content similarity",
                        ))
        links.sort(key=lambda x: x.strength, reverse=True)
        return links[:10]

    async def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        inp = FusionInput(modality=Modality.TEXT, raw_data=text)
        result = self.fusion.process([inp])
        return np.array(result.embedding) if result.embedding else None

    def _cosine(self, a: np.ndarray, b: np.ndarray) -> float:
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        return float(np.dot(a, b) / (na * nb)) if na > 0 and nb > 0 else 0.0

# ---------------------------------------------------------------------------
# Musical DNA Analyzer
# ---------------------------------------------------------------------------

class MusicalDNAAnalysisRequest(BaseModel):
    song_title: str
    artist:     str
    user_id:    Optional[str] = None

class MusicalDNAAnalysisResult(BaseModel):
    song_title:              str
    artist:                  str
    summary:                 str
    cognitive_resonance:     float
    empowerment_potential:   float
    consciousness_elevation: float
    dna_vector:              List[float]
    archetype:               str
    emotional_cluster:       str
    response:                str

class MusicalDNAAnalyzer:
    ARCHETYPE_MAP = {"runaway": "Seeker", "aurora": "Luminary"}

    async def analyze(self, request: MusicalDNAAnalysisRequest) -> MusicalDNAAnalysisResult:
        title_key  = re.sub(r"[^a-z0-9]", "", request.song_title.lower())
        artist_key = re.sub(r"[^a-z0-9]", "", request.artist.lower())
        seed       = hash(f"{title_key}{artist_key}") % 10000
        np.random.seed(seed)
        dna_vector = np.random.rand(4).tolist()
        archetype  = self.ARCHETYPE_MAP.get(title_key, "Explorer")
        return MusicalDNAAnalysisResult(
            song_title=request.song_title,
            artist=request.artist,
            summary=f"Deterministic analysis for {request.song_title} by {request.artist}.",
            cognitive_resonance=float(dna_vector[0]),
            empowerment_potential=float(dna_vector[1]),
            consciousness_elevation=float(dna_vector[2]),
            dna_vector=dna_vector,
            archetype=archetype,
            emotional_cluster="reflective",
            response=f"{request.song_title} resonates at a {archetype} frequency.",
        )

# ---------------------------------------------------------------------------
# Embodiment Profile Manager
# ---------------------------------------------------------------------------

class EmbodimentProfileRecord(BaseModel):
    id:                   Optional[str] = None
    slug:                 str
    public_name:          str
    internal_designation: Optional[str] = None
    status:               str = "draft"
    visibility_scope:     str = "founder-only"
    profile_json:         Dict[str, Any] = Field(default_factory=dict)
    readiness_score:      Optional[float] = None
    founder_notes:        Optional[str] = None
    created_at:           Optional[str] = None
    updated_at:           Optional[str] = None

class EmbodimentProfileManager:
    def __init__(self):
        self.profiles: Dict[str, EmbodimentProfileRecord] = {}
        self._load_builtin_profiles()

    def _load_builtin_profiles(self):
        pass

    def list_profiles(self, include_founder_only: bool = False) -> List[EmbodimentProfileRecord]:
        return [
            p for p in self.profiles.values()
            if include_founder_only or p.visibility_scope != "founder-only"
        ]

    def get_profile(self, slug: str) -> Optional[EmbodimentProfileRecord]:
        return self.profiles.get(slug)

    def upsert_profile(self, profile: EmbodimentProfileRecord) -> EmbodimentProfileRecord:
        self.profiles[profile.slug] = profile
        return profile

# ---------------------------------------------------------------------------
# Global singletons
# ---------------------------------------------------------------------------

fusion_engine        = FusionEngine(config)
llm_router           = LLMRouter(config)
blackboard_responder = BlackboardResponder(llm_router, fusion_engine)
resonance_builder    = ResonanceLinkBuilder(fusion_engine)
musical_dna_analyzer = MusicalDNAAnalyzer()
embodiment_manager   = EmbodimentProfileManager()

user_profiles:        Dict[str, MasterGestaltViewProfile] = {}
user_symbiotic_cores: Dict[str, SymbioticFeedbackCore]   = {}

def get_or_create_user_profile(user_id: str) -> MasterGestaltViewProfile:
    if user_id not in user_profiles:
        user_profiles[user_id] = MasterGestaltViewProfile(user_id=user_id)
        user_symbiotic_cores[user_id] = SymbioticFeedbackCore(user_id, config)
        user_profiles[user_id].symbiotic_core = user_symbiotic_cores[user_id]
    return user_profiles[user_id]

# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="GestaltView Generative Engine",
    description="Production backend for the GestaltView Standard Generative Digital Intelligence Engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_ORIGINS", "https://gestaltview-v2-dig.vercel.app"),
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Persistence bridge ---
try:
    from server.engine_persistence_bridge import (
        persist_fusion_drop, persist_blackboard_turn, persist_musical_dna,
        get_or_create_di_session, log_di_memory, load_user_plk, save_user_plk,
        resolve_user_ids,
    )
    from server.core.db_managers import DatabaseEmbodimentManager, DatabaseSymbioticCore
    embodiment_manager = DatabaseEmbodimentManager()
    _BRIDGE_ACTIVE = True
except ImportError:
    _BRIDGE_ACTIVE = False

# ── Creation Corner router (NEW) ────────────────────────────────────────────
try:
    from server.creation_corner_engine import creation_corner_router
    app.include_router(creation_corner_router)
    _CREATION_CORNER_ACTIVE = True
except ImportError:
    _CREATION_CORNER_ACTIVE = False

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine_version": "2.0.0",
        "bridge_active": _BRIDGE_ACTIVE,
        "creation_corner_active": _CREATION_CORNER_ACTIVE,
        "features": {
            "embeddings": config.ENABLE_EMBEDDINGS,
            "ocr":        config.ENABLE_OCR,
            "whisper":    config.ENABLE_WHISPER,
            "openai":     config.ENABLE_OPENAI,
        },
    }

@app.post("/api/fusion")
async def fusion_endpoint(request: List[FusionInput]):
    try:
        result = fusion_engine.process(request)
        if _BRIDGE_ACTIVE:
            persist_fusion_drop(
                user_id="anonymous",
                fused_text=result.fused_text,
                modalities=[i.modality.value for i in request],
                processing_steps=result.processing_steps,
            )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion failed: {e}")

@app.post("/api/learn")
async def learn_endpoint(user_id: str, inputs: List[FusionInput],
                         ai_output: str, user_feedback: float,
                         input_vector: Optional[List[float]] = None):
    profile = get_or_create_user_profile(user_id)
    core    = user_symbiotic_cores[user_id]
    vec     = np.array(input_vector) if input_vector else None
    core.learn_from_interaction(inputs, ai_output, user_feedback, vec)
    if _BRIDGE_ACTIVE:
        session = get_or_create_di_session(user_id, "billy")
        log_di_memory(
            session_id=session.get("id", "local"),
            di_slug="billy",
            auth_user_id=user_id,
            content=ai_output[:500],
            memory_type="symbiotic_feedback",
            significance=user_feedback,
        )
    return {"status": "learned", "history_size": len(core.user_history)}

@app.post("/api/predict")
async def predict_endpoint(user_id: str, current_input: str):
    profile    = get_or_create_user_profile(user_id)
    core       = user_symbiotic_cores[user_id]
    inp        = FusionInput(modality=Modality.TEXT, raw_data=current_input)
    fused      = fusion_engine.process([inp])
    prediction = None
    if fused.embedding:
        prediction = core.predict_user_need(np.array(fused.embedding))
    return {
        "prediction":         prediction,
        "faithfulness_level": core.get_faithfulness_level(),
        "history_size":       len(core.user_history),
    }

@app.post("/api/resonance")
async def resonance_endpoint(user_id: str, text: str):
    profile = get_or_create_user_profile(user_id)
    if _BRIDGE_ACTIVE:
        plk_snap = load_user_plk(user_id)
        if plk_snap:
            profile.plk = PLKProfile(**plk_snap)
    plk    = EnhancedPersonalLanguageKey(profile.plk)
    result = plk.calculate_resonance(text)
    return result

@app.post("/api/blackboard/respond")
async def blackboard_respond_endpoint(request: BlackboardResponderRequest):
    try:
        response = await blackboard_responder.respond(request)
        if _BRIDGE_ACTIVE and request.user_id:
            persist_blackboard_turn(
                user_id=request.user_id,
                message=request.message,
                response_text=response.text,
                persona_slug=request.persona_slug,
                source=response.source,
            )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Responder failed: {e}")

@app.post("/api/resonance-links")
async def resonance_links_endpoint(request: ResonanceLinkRequest):
    try:
        links = await resonance_builder.build_links(request)
        return {"links": links}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Link building failed: {e}")

@app.get("/api/embodiment/list")
async def embodiment_list(include_founder_only: bool = False):
    profiles = embodiment_manager.list_profiles(include_founder_only)
    return [
        {"id": p.id, "slug": p.slug, "public_name": p.public_name,
         "status": p.status, "visibility_scope": p.visibility_scope,
         "readiness_score": p.readiness_score, "updated_at": p.updated_at}
        for p in profiles
    ]

@app.get("/api/embodiment/{slug}")
async def embodiment_get(slug: str):
    profile = embodiment_manager.get_profile(slug)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.post("/api/embodiment/upsert")
async def embodiment_upsert(profile: EmbodimentProfileRecord):
    result = embodiment_manager.upsert_profile(profile)
    return {"success": True, "profile": {"id": result.id, "slug": result.slug,
                                          "status": result.status, "updated_at": result.updated_at}}

class ProfilePreferences(BaseModel):
    display_name:            str = ""
    avatar_url:              str = ""
    embodiment_profile_slug: str = "billy"

@app.get("/api/profile/preferences")
async def profile_preferences_get(user_id: str):
    profile = get_or_create_user_profile(user_id)
    return {
        "display_name":            profile.creation_preferences.get("display_name", ""),
        "avatar_url":              profile.creation_preferences.get("avatar_url", ""),
        "embodiment_profile_slug": profile.creation_preferences.get("embodiment_profile_slug", "billy"),
    }

@app.post("/api/profile/preferences")
async def profile_preferences_save(user_id: str, preferences: ProfilePreferences):
    profile = get_or_create_user_profile(user_id)
    profile.creation_preferences.update(preferences.dict())
    return {"preferences": preferences}

@app.post("/api/actions/musical-dna/analyze")
async def musical_dna_endpoint(request: MusicalDNAAnalysisRequest):
    result = await musical_dna_analyzer.analyze(request)
    if _BRIDGE_ACTIVE and request.user_id:
        persist_musical_dna(
            user_id=request.user_id,
            song_title=request.song_title,
            artist=request.artist,
            analysis_text=result.summary,
            empowerment_score=result.empowerment_potential,
        )
    return result

class BillyExhibitPayload(BaseModel):
    page:         str
    active_mode:  Optional[str] = None
    active_song:  Optional[Dict[str, Any]] = None
    has_music:    bool = False

@app.post("/api/billy/exhibit-bridge")
async def billy_exhibit_bridge(user_id: str, payload: BillyExhibitPayload):
    profile = get_or_create_user_profile(user_id)
    return {
        "status": "received",
        "page":    payload.page,
        "user_id": user_id,
    }
