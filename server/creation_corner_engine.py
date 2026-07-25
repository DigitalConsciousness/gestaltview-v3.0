"""
GestaltView — Creation Corner Synthesis Engine
===============================================
Provides /api/creation-corner/* endpoints.

Endpoints:
  POST /api/creation-corner/synthesize   — full multimodal synthesis pipeline
  GET  /api/creation-corner/artifact-types
  GET  /api/creation-corner/health

Artifact types:
  markdown | blueprint_json | blueprint_md | image_prompt | image |
  audio_prompt | audio | share_card | session_recap | mind_map |
  agent_prompt | code

Synthesis styles:
  preserve_voice | compress | expand | reframe | structural | narrative

Destinations:
  creation_corner | dynamic_inner_world | scaffold_pending |
  download_only | gate_draft

Activation in gestaltview_generative_engine.py:
  from server.creation_corner_engine import creation_corner_router
  app.include_router(creation_corner_router)
"""

from __future__ import annotations

import logging
import hashlib
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from server.gestaltview_generative_engine import (
    Config,
    ConsentState,
    FusionEngine,
    FusionInput,
    LLMRouter,
    LLMRequest,
    Modality,
    MasterGestaltViewProfile,
    EnhancedPersonalLanguageKey,
    ProvenanceEnvelope,
    get_or_create_user_profile,
)
from server.hf_adapter import HuggingFaceAdapter, GenerationResult

try:
    from server.supabase_integration import (
        InnerWorldArtifactRepository,
        InsightRepository,
    )
    from server.engine_persistence_bridge import (
        persist_fusion_drop,
        persist_inner_world_artifact,
        persist_insight,
    )
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

logger = logging.getLogger(__name__)

# ─── Types ───────────────────────────────────────────────────────────────────────────────────

ArtifactTypeValue = Literal[
    "markdown", "blueprint_json", "blueprint_md",
    "image_prompt", "image",
    "audio_prompt", "audio",
    "share_card", "session_recap",
    "mind_map", "agent_prompt", "code",
]

SynthesisStyleValue = Literal[
    "preserve_voice", "compress", "expand",
    "reframe", "structural", "narrative",
]

DestinationValue = Literal[
    "creation_corner", "dynamic_inner_world",
    "scaffold_pending", "download_only", "gate_draft",
]

DESTINATION_BLOCKLIST: dict[str, list[str]] = {
    "session_recap": ["dynamic_inner_world"],
    "agent_prompt": ["dynamic_inner_world"],
    "marketing_copy": ["dynamic_inner_world"],
}

DESTINATION_FALLBACK = "creation_corner"


def resolve_destination(artifact_type: str, requested: str) -> str:
    blocked = DESTINATION_BLOCKLIST.get(artifact_type, [])
    if requested in blocked:
        logger.warning(
            "Destination override: %s is not valid for artifact_type=%s. Redirecting to %s.",
            requested,
            artifact_type,
            DESTINATION_FALLBACK,
        )
        return DESTINATION_FALLBACK
    return requested


class CreationCornerRequest(BaseModel):
    user_id:              str
    subject_id:           Optional[str]       = None
    text:                 Optional[str]       = None
    image_b64:            Optional[str]       = None
    image_mime:           Optional[str]       = "image/jpeg"
    audio_b64:            Optional[str]       = None
    audio_mime:           Optional[str]       = "audio/wav"
    source_capture_ids:   List[str]           = Field(default_factory=list)
    source_artifact_ids:  List[str]           = Field(default_factory=list)
    artifact_type:        ArtifactTypeValue   = "markdown"
    synthesis_style:      SynthesisStyleValue = "preserve_voice"
    destination:          DestinationValue    = "creation_corner"
    custom_title:         Optional[str]       = None
    image_width:          int                 = 512
    image_height:         int                 = 512
    audio_mood:           str                 = "contemplative"
    audio_duration_seconds: int               = 10
    consent:              ConsentState        = Field(default_factory=ConsentState)


class CreationCornerArtifact(BaseModel):
    id:                   str             = Field(default_factory=lambda: f"cc-{uuid.uuid4().hex[:12]}")
    user_id:              str
    title:                str
    artifact_type:        ArtifactTypeValue
    synthesis_style:      SynthesisStyleValue
    destination:          DestinationValue
    destination_override: Optional[str] = None
    content:              Optional[str]   = None
    content_format:       str             = "markdown"
    image_b64:            Optional[str]   = None
    audio_b64:            Optional[str]   = None
    image_prompt:         Optional[str]   = None
    audio_prompt:         Optional[str]   = None
    plk_resonance_score:  float           = 0.0
    provenance:           Dict[str, Any]  = Field(default_factory=dict)
    source_capture_ids:   List[str]       = Field(default_factory=list)
    source_artifact_ids:  List[str]       = Field(default_factory=list)
    generation_mode:      str             = "deterministic"
    fallback_used:        bool            = False
    warnings:             List[str]       = Field(default_factory=list)
    latency_ms:           float           = 0.0
    created_at:           str             = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    persisted_artifact_id: Optional[str] = None


# ─── Engine ───────────────────────────────────────────────────────────────────────────────────

class CreationCornerEngine:
    def __init__(
        self,
        config:        Optional[Config]               = None,
        fusion_engine: Optional[FusionEngine]         = None,
        llm_router:    Optional[LLMRouter]            = None,
        hf_adapter:    Optional[HuggingFaceAdapter]   = None,
    ):
        self.config = config or Config()
        self.fusion = fusion_engine or FusionEngine(self.config)
        self.llm    = llm_router    or LLMRouter(self.config)
        self.hf     = hf_adapter    or HuggingFaceAdapter()

    async def synthesize(self, req: CreationCornerRequest) -> CreationCornerArtifact:
        start         = time.monotonic()
        warnings:     List[str] = []
        generation_mode         = "deterministic"
        fallback_used           = False

        # 1. Build fusion inputs
        fusion_inputs: List[FusionInput] = []
        if req.text:
            fusion_inputs.append(FusionInput(modality=Modality.TEXT,  raw_data=req.text,  consent=req.consent))
        if req.image_b64:
            import base64
            fusion_inputs.append(FusionInput(modality=Modality.IMAGE, raw_data=base64.b64decode(req.image_b64),
                                             metadata={"mime": req.image_mime}, consent=req.consent))
        if req.audio_b64:
            import base64
            fusion_inputs.append(FusionInput(modality=Modality.AUDIO, raw_data=base64.b64decode(req.audio_b64),
                                             metadata={"mime": req.audio_mime}, consent=req.consent))
        if not fusion_inputs:
            raise ValueError("At least one of text, image_b64, or audio_b64 must be provided")

        # 2. Fuse
        fusion_result = self.fusion.process(fusion_inputs)
        fused_text    = fusion_result.fused_text
        if fusion_result.fallback_used:
            fallback_used = True
            warnings.append("fusion_fallback: one or more modalities fell back to local processing")

        # 3. PLK resonance
        profile         = get_or_create_user_profile(req.user_id)
        plk             = EnhancedPersonalLanguageKey(profile.plk)
        resonance_result = plk.calculate_resonance(fused_text)
        plk_score       = resonance_result.resonance_score

        # 4. Persist fusion drop
        drop_id: Optional[str] = None
        if SUPABASE_AVAILABLE:
            try:
                drop    = persist_fusion_drop(
                    user_id=req.user_id, fused_text=fused_text,
                    modalities=[i.modality.value for i in fusion_inputs],
                    processing_steps=fusion_result.processing_steps,
                    plk_resonance_score=plk_score,
                )
                drop_id = drop.get("id")
            except Exception as exc:
                warnings.append(f"supabase_drop_persist_failed: {exc}")

        # 5. Derive title
        title = req.custom_title or self._derive_title(fused_text, req.artifact_type)

        # 6. Normalize destination and route to generator
        requested_destination = req.destination
        destination = resolve_destination(req.artifact_type, requested_destination)
        destination_override = None
        if destination != requested_destination:
            destination_override = (
                f"Destination override: {requested_destination} is not valid for "
                f"artifact_type={req.artifact_type}; routed to {destination}."
            )
            warnings.append(destination_override)

        artifact = CreationCornerArtifact(
            user_id=req.user_id, title=title,
            artifact_type=req.artifact_type, synthesis_style=req.synthesis_style,
            destination=destination, destination_override=destination_override,
            plk_resonance_score=plk_score,
            source_capture_ids=req.source_capture_ids, source_artifact_ids=req.source_artifact_ids,
        )

        if req.artifact_type == "image_prompt":
            artifact.image_prompt = self.hf.build_image_prompt(
                fused_text, artifact_context=title,
                plk_metaphors=list(profile.plk.signature_metaphors.keys())[:3],
            )
            artifact.content        = artifact.image_prompt
            artifact.content_format = "text"

        elif req.artifact_type == "image":
            img_prompt = self.hf.build_image_prompt(
                fused_text, artifact_context=title,
                plk_metaphors=list(profile.plk.signature_metaphors.keys())[:3],
            )
            artifact.image_prompt = img_prompt
            consent_ok = req.consent.allow_external_image_analysis
            gen = self.hf.generate_image(img_prompt, width=req.image_width, height=req.image_height,
                                          consent_granted=consent_ok)
            if gen.success and gen.image_b64:
                artifact.image_b64   = gen.image_b64
                generation_mode      = "huggingface"
            else:
                artifact.content        = gen.prompt_artifact
                artifact.content_format = "text"
                fallback_used           = True
            warnings.extend(gen.warnings)

        elif req.artifact_type == "audio_prompt":
            artifact.audio_prompt   = self.hf.build_audio_prompt(fused_text, req.audio_mood)
            artifact.content        = artifact.audio_prompt
            artifact.content_format = "text"

        elif req.artifact_type == "audio":
            audio_prompt = self.hf.build_audio_prompt(fused_text, req.audio_mood)
            artifact.audio_prompt = audio_prompt
            consent_ok = req.consent.allow_external_audio_analysis
            gen = self.hf.generate_audio(audio_prompt,
                                          duration_seconds=req.audio_duration_seconds,
                                          consent_granted=consent_ok)
            if gen.success and gen.audio_b64:
                artifact.audio_b64 = gen.audio_b64
                generation_mode    = "huggingface"
            else:
                artifact.content        = gen.prompt_artifact
                artifact.content_format = "text"
                fallback_used           = True
            warnings.extend(gen.warnings)

        else:
            # All text-based types → LLMRouter
            synthesis_prompt = self._build_synthesis_prompt(
                fused_text, req.artifact_type, req.synthesis_style,
                title, resonance_result.matched_metaphors,
            )
            llm_req    = LLMRequest(prompt=synthesis_prompt, temperature=0.5,
                                    max_tokens=2000, inject_plk=True, user_id=req.user_id)
            llm_result = await self.llm.generate(llm_req, profile)
            artifact.content        = llm_result.text
            artifact.content_format = self._content_format(req.artifact_type)
            generation_mode         = llm_result.source
            if llm_result.source == "deterministic":
                fallback_used = True

        # 7. Provenance
        input_hash  = hashlib.sha256(fused_text.encode()).hexdigest()[:16]
        out_str     = artifact.content or artifact.image_b64 or artifact.audio_b64 or ""
        output_hash = hashlib.sha256(out_str.encode()).hexdigest()[:16]
        envelope    = ProvenanceEnvelope(
            user_id=req.user_id, title=title, artifact_type=req.artifact_type,
            content_format=artifact.content_format,
            source_capture_ids=req.source_capture_ids + ([drop_id] if drop_id else []),
        )
        envelope.compute_transformation_hash(
            inputs={"fused_text_hash": input_hash, "plk_score": plk_score},
            operations=["multimodal_fusion", f"plk_scoring:{plk_score:.3f}",
                        f"artifact_synthesis:{req.artifact_type}", f"generation_mode:{generation_mode}"],
        )
        artifact.provenance = envelope.dict()
        artifact.provenance["input_hash"]  = input_hash
        artifact.provenance["output_hash"] = output_hash

        # 8. Persist to inner_world_artifacts if destined there
        if SUPABASE_AVAILABLE and destination == "dynamic_inner_world":
            try:
                html_content = (
                    f"<article class='cc-artifact' data-type='{req.artifact_type}'>"
                    f"<h2>{title}</h2>"
                    f"<div class='content'>{artifact.content or ''}</div>"
                    "</article>"
                )
                persisted = persist_inner_world_artifact(
                    user_id=req.user_id, title=title,
                    summary=(artifact.content or "")[:300],
                    html=html_content,
                    tags=[req.artifact_type, req.synthesis_style, "creation_corner"],
                    origin_room="creation_corner",
                )
                artifact.persisted_artifact_id = persisted.get("id")
            except Exception as exc:
                warnings.append(f"supabase_artifact_persist_failed: {exc}")

        # 9. Persist insight if PLK score is high
        if SUPABASE_AVAILABLE and plk_score >= 0.65:
            try:
                persist_insight(
                    user_id=req.user_id, insight_type="plk_resonance",
                    title=f"High resonance in: {title}",
                    preview=f"PLK score {plk_score:.2f} detected in {req.artifact_type} artifact.",
                    payload={"plk_score": plk_score, "artifact_type": req.artifact_type,
                             "matched_metaphors": resonance_result.matched_metaphors},
                    significance=plk_score, session_origin="creation_corner",
                )
            except Exception as exc:
                warnings.append(f"supabase_insight_persist_failed: {exc}")

        artifact.generation_mode = generation_mode
        artifact.fallback_used   = fallback_used
        artifact.warnings        = warnings
        artifact.latency_ms      = (time.monotonic() - start) * 1000
        return artifact

    # ── Private helpers ────────────────────────────────────────────────────────────────────────

    def _derive_title(self, fused_text: str, artifact_type: str) -> str:
        prefix_map = {
            "blueprint_json": "Blueprint:",
            "blueprint_md":   "Blueprint:",
            "share_card":     "Share:",
            "session_recap":  "Recap:",
            "mind_map":       "Map:",
            "agent_prompt":   "Agent:",
            "code":           "Code:",
            "image":          "Visual:",
            "audio":          "Audio:",
        }
        prefix = prefix_map.get(artifact_type, "")
        lines  = [l.strip() for l in fused_text.split("\n") if l.strip()]
        core   = lines[0][:60] if lines else "Untitled"
        return f"{prefix} {core}".strip()

    def _build_synthesis_prompt(
        self, fused_text: str, artifact_type: str,
        style: str, title: str, matched_metaphors: List[str],
    ) -> str:
        style_map = {
            "preserve_voice": "Preserve the speaker\'s exact voice, rhythm, and vocabulary. Do not paraphrase.",
            "compress":       "Distill to the irreducible essence. Remove all filler. Keep only what matters.",
            "expand":         "Elaborate richly from the fragments. Surface what\'s implied but unsaid.",
            "reframe":        "Offer a genuinely new angle on the same material. Shift the perspective.",
            "structural":     "Produce a clean skeleton or outline. Headings, bullets, hierarchy only.",
            "narrative":      "Write as flowing, coherent prose. No bullets. One voice.",
        }
        type_map = {
            "markdown":     "a rich markdown document",
            "blueprint_json": "a JSON blueprint with keys: title, objective, steps, resources, metadata",
            "blueprint_md": "a structured markdown blueprint with ## headings and actionable steps",
            "share_card":   "a 280-character max share card for social distribution",
            "session_recap": "a concise session recap summarizing key insights and next actions",
            "mind_map":     "a markdown mind map using indented structure",
            "agent_prompt": "a precise system prompt for a Digital Intelligence agent",
            "code":         "clean, well-commented code",
        }
        format_desc = type_map.get(artifact_type, "a markdown document")
        style_desc  = style_map.get(style, style_map["preserve_voice"])
        metaphors   = f"\nKey metaphors to honor: {', '.join(matched_metaphors)}." if matched_metaphors else ""
        return (
            f"Synthesize the following captured material into {format_desc}.\n"
            f"Title: {title}\n"
            f"Style directive: {style_desc}{metaphors}\n"
            f"---\n"
            f"{fused_text}\n"
            f"---\n"
            f"Produce only the final artifact. No preamble. No commentary."
        )

    def _content_format(self, artifact_type: str) -> str:
        return {
            "blueprint_json": "json",
            "code":           "code",
            "share_card":     "text",
        }.get(artifact_type, "markdown")


# ─── FastAPI Router ──────────────────────────────────────────────────────────────────────────────

creation_corner_router = APIRouter(prefix="/api/creation-corner", tags=["creation-corner"])
_engine = CreationCornerEngine()


@creation_corner_router.post("/synthesize", response_model=CreationCornerArtifact)
async def synthesize_endpoint(request: CreationCornerRequest):
    try:
        return await _engine.synthesize(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {e}")


@creation_corner_router.get("/artifact-types")
async def artifact_types_endpoint():
    return {
        "types": [
            {"value": "markdown",       "label": "Rich Markdown",      "consent_required": False},
            {"value": "blueprint_json", "label": "Blueprint (JSON)",   "consent_required": False},
            {"value": "blueprint_md",   "label": "Blueprint (MD)",     "consent_required": False},
            {"value": "image_prompt",   "label": "Image Prompt",       "consent_required": False},
            {"value": "image",          "label": "Generated Image",    "consent_required": True,
             "consent_field": "allow_external_image_analysis"},
            {"value": "audio_prompt",   "label": "Audio Prompt",       "consent_required": False},
            {"value": "audio",          "label": "Generated Audio",    "consent_required": True,
             "consent_field": "allow_external_audio_analysis"},
            {"value": "share_card",     "label": "Share Card",         "consent_required": False},
            {"value": "session_recap",  "label": "Session Recap",      "consent_required": False},
            {"value": "mind_map",       "label": "Mind Map",           "consent_required": False},
            {"value": "agent_prompt",   "label": "Agent Prompt",       "consent_required": False},
            {"value": "code",           "label": "Code",               "consent_required": False},
        ]
    }


@creation_corner_router.get("/health")
async def creation_corner_health():
    return {
        "status":           "healthy",
        "supabase_wired":   SUPABASE_AVAILABLE,
        "hf_key_present":   bool(HuggingFaceAdapter().api_key),
        "models": {
            "image": "black-forest-labs/FLUX.1-schnell",
            "audio": "facebook/musicgen-small",
            "embed": "BAAI/bge-small-en-v1.5",
        },
    }
