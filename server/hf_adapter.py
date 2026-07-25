"""
GestaltView — HuggingFace Free-First Adapter
=============================================
Adds multimodal generation to the existing FusionEngine stack.

Capabilities:
- Image generation: FLUX.1-schnell (black-forest-labs) — fast, free tier
- Audio generation: MusicGen-small (facebook) — ambient / mood audio
- Embeddings: BGE-small-en-v1.5 (BAAI) — 384-dim, free inference API

Free-first design:
- All calls go to https://api-inference.huggingface.co
- HUGGINGFACE_API_KEY is optional — HF allows rate-limited use without a key
- Every path has a deterministic fallback (prompt artifact) if generation fails

Consent gating:
- Image generation requires ConsentState.allow_external_image_analysis = True
- Audio generation requires ConsentState.allow_external_audio_analysis = True
- Embeddings require ConsentState.allow_external_embedding = True
- No consent? Return a structured prompt artifact instead — never silently skip.

Integration:
Drop this file alongside gestaltview_generative_engine.py.
Import via: from server.hf_adapter import HuggingFaceAdapter, GenerationResult
"""

from __future__ import annotations

import base64
import hashlib
import os
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

# ─── Configuration ────────────────────────────────────────────────────────────────────────────────

HF_API_BASE = "https://api-inference.huggingface.co"
HF_API_KEY  = os.getenv("HUGGINGFACE_API_KEY")  # Optional — graceful without it

FLUX_MODEL     = "black-forest-labs/FLUX.1-schnell"
MUSICGEN_MODEL = "facebook/musicgen-small"
BGE_MODEL      = "BAAI/bge-small-en-v1.5"

IMAGE_TIMEOUT_S = 45.0
AUDIO_TIMEOUT_S = 90.0
EMBED_TIMEOUT_S = 10.0

GESTALTVIEW_STYLE_SUFFIX = (
    "Neural Aurora aesthetic: deep dark field, bioluminescent accents, "
    "fog and atmospheric depth, warm glow at center, digital consciousness atmosphere, "
    "cinematic lighting, photorealistic detail. "
    "Negative: cartoon, anime, flat design, bright white background, text overlay, watermark."
)

# ─── Result types ───────────────────────────────────────────────────────────────────────────────

@dataclass
class GenerationResult:
    """Unified result from any HuggingFace generation call."""
    id:               str             = field(default_factory=lambda: f"hf-{uuid.uuid4().hex[:10]}")
    success:          bool            = False
    modality:         str             = "unknown"  # image | audio | embedding | prompt
    image_b64:        Optional[str]   = None        # base64 JPEG
    audio_b64:        Optional[str]   = None        # base64 WAV/FLAC
    embedding:        Optional[List[float]] = None
    prompt_artifact:  Optional[str]   = None
    model_used:       str             = "deterministic"
    latency_ms:       float           = 0.0
    fallback_used:    bool            = False
    fallback_reason:  Optional[str]   = None
    warnings:         List[str]       = field(default_factory=list)
    provenance:       Dict[str, Any]  = field(default_factory=dict)


# ─── HuggingFace Adapter ────────────────────────────────────────────────────────────────────────────

class HuggingFaceAdapter:
    """
    Free-first multimodal generation adapter.
    Every method degrades gracefully — callers always receive a GenerationResult,
    never an unhandled exception.
    """

    def __init__(self, api_key: Optional[str] = HF_API_KEY):
        self.api_key = api_key
        self._base_headers = {"Content-Type": "application/json"}
        if api_key:
            self._base_headers["Authorization"] = f"Bearer {api_key}"

    # ── Image Generation ────────────────────────────────────────────────────────────────────

    def generate_image(
        self,
        prompt: str,
        *,
        width: int = 512,
        height: int = 512,
        guidance_scale: float = 3.5,
        num_inference_steps: int = 4,
        inject_style: bool = True,
        consent_granted: bool = False,
    ) -> GenerationResult:
        start = time.monotonic()

        if not consent_granted:
            return self._prompt_fallback(
                prompt, "image",
                reason="consent_required: allow_external_image_analysis not granted",
                latency_ms=0.0,
            )

        full_prompt = f"{prompt}\n\n{GESTALTVIEW_STYLE_SUFFIX}" if inject_style else prompt
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "width": width, "height": height,
                "guidance_scale": guidance_scale,
                "num_inference_steps": num_inference_steps,
            },
            "options": {"wait_for_model": True},
        }
        try:
            resp = self._post(FLUX_MODEL, payload, IMAGE_TIMEOUT_S)
            image_b64 = base64.b64encode(resp.content).decode("utf-8")
            return GenerationResult(
                success=True, modality="image", image_b64=image_b64,
                model_used=FLUX_MODEL, latency_ms=(time.monotonic() - start) * 1000,
                provenance=self._make_provenance(prompt, FLUX_MODEL, "image"),
            )
        except Exception as exc:
            fb = self._prompt_fallback(prompt, "image", reason=str(exc),
                                       latency_ms=(time.monotonic() - start) * 1000)
            fb.warnings.append(f"flux_generation_failed: {exc}")
            return fb

    # ── Audio Generation ────────────────────────────────────────────────────────────────────

    def generate_audio(
        self,
        prompt: str,
        *,
        duration_seconds: int = 10,
        consent_granted: bool = False,
    ) -> GenerationResult:
        start = time.monotonic()

        if not consent_granted:
            return self._prompt_fallback(
                prompt, "audio",
                reason="consent_required: allow_external_audio_analysis not granted",
                latency_ms=0.0,
            )

        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": int(duration_seconds * 50)},
            "options": {"wait_for_model": True},
        }
        try:
            resp = self._post(MUSICGEN_MODEL, payload, AUDIO_TIMEOUT_S)
            audio_b64 = base64.b64encode(resp.content).decode("utf-8")
            return GenerationResult(
                success=True, modality="audio", audio_b64=audio_b64,
                model_used=MUSICGEN_MODEL, latency_ms=(time.monotonic() - start) * 1000,
                provenance=self._make_provenance(prompt, MUSICGEN_MODEL, "audio"),
            )
        except Exception as exc:
            fb = self._prompt_fallback(prompt, "audio", reason=str(exc),
                                       latency_ms=(time.monotonic() - start) * 1000)
            fb.warnings.append(f"musicgen_generation_failed: {exc}")
            return fb

    # ── Embeddings ──────────────────────────────────────────────────────────────────────────

    def embed_text(
        self,
        text: str,
        *,
        consent_granted: bool = False,
    ) -> GenerationResult:
        start = time.monotonic()

        if not consent_granted:
            return GenerationResult(
                success=False, modality="embedding", model_used="consent_blocked",
                fallback_used=True,
                fallback_reason="consent_required: allow_external_embedding not granted",
                latency_ms=0.0,
            )

        payload = {"inputs": text[:512], "options": {"wait_for_model": True}}
        try:
            resp = self._post(BGE_MODEL, payload, EMBED_TIMEOUT_S)
            data = resp.json()
            embedding = data[0] if isinstance(data[0], list) else data
            return GenerationResult(
                success=True, modality="embedding", embedding=embedding,
                model_used=BGE_MODEL, latency_ms=(time.monotonic() - start) * 1000,
                provenance=self._make_provenance(text[:40], BGE_MODEL, "embedding"),
            )
        except Exception as exc:
            return GenerationResult(
                success=False, modality="embedding", model_used="deterministic",
                fallback_used=True, fallback_reason=str(exc),
                latency_ms=(time.monotonic() - start) * 1000,
                warnings=[f"bge_embed_failed: {exc}"],
            )

    # ── Prompt Builders (pure deterministic) ─────────────────────────────────────────────

    def build_image_prompt(
        self,
        fused_text: str,
        artifact_context: str = "",
        *,
        plk_metaphors: Optional[List[str]] = None,
    ) -> str:
        lines = [l.strip() for l in fused_text.split("\n") if l.strip() and not l.startswith("[")]
        anchor = lines[0][:200] if lines else "abstract digital consciousness"
        metaphor_layer = f" Symbolism: {', '.join(plk_metaphors[:3])}." if plk_metaphors else ""
        context_layer  = f" Context: {artifact_context[:100]}." if artifact_context else ""
        return (
            f"Visual representation of: {anchor}.{metaphor_layer}{context_layer} "
            f"{GESTALTVIEW_STYLE_SUFFIX}"
        )

    def build_audio_prompt(
        self,
        fused_text: str,
        mood: str = "contemplative",
        *,
        bpm: Optional[int] = None,
    ) -> str:
        mood_map = {
            "contemplative": "ambient electronic, slowly evolving pads, atmospheric depth",
            "energized":     "upbeat electronic, rhythmic pulse, forward motion",
            "melancholic":   "slow orchestral strings, minor key, emotional depth",
            "focused":       "lo-fi beats, steady rhythm, minimal melody",
            "expansive":     "cinematic orchestral, wide stereo field, swelling dynamics",
        }
        mood_desc = mood_map.get(mood, mood_map["contemplative"])
        text_lower = fused_text.lower()
        tone_hints = []
        if any(w in text_lower for w in ["dark","night","void","shadow"]):   tone_hints.append("dark undertones")
        if any(w in text_lower for w in ["light","aurora","glow","bright"]):  tone_hints.append("luminous texture")
        if any(w in text_lower for w in ["memory","past","remember"]):        tone_hints.append("nostalgic feel")
        if any(w in text_lower for w in ["future","vision","build","create"]): tone_hints.append("forward momentum")
        tone_str = f" With {', '.join(tone_hints)}." if tone_hints else ""
        bpm_str  = f" {bpm} BPM." if bpm else " 70–90 BPM."
        return (
            f"{mood_desc}.{tone_str}{bpm_str} "
            "No lyrics. Instrumental only. Professional recording quality."
        )

    # ── Helpers ──────────────────────────────────────────────────────────────────────────────────

    def _post(self, model_slug: str, payload: dict, timeout: float) -> httpx.Response:
        """POST to HF inference API with one 503 retry."""
        url = f"{HF_API_BASE}/models/{model_slug}"
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(url, headers=self._base_headers, json=payload)
        if resp.status_code == 503:
            time.sleep(12)
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(url, headers=self._base_headers, json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"HF {model_slug} HTTP {resp.status_code}: {resp.text[:200]}")
        return resp

    def _prompt_fallback(
        self, prompt: str, modality: str, reason: str, latency_ms: float
    ) -> GenerationResult:
        artifact = (
            f"[{modality.upper()} GENERATION PROMPT]\n\n"
            f"{prompt}\n\n---\n"
            f"This prompt is ready for external generation. "
            f"Use FLUX.1-schnell for image, MusicGen for audio, or any compatible service.\n"
            f"Reason for local-only mode: {reason}"
        )
        return GenerationResult(
            success=True, modality="prompt", prompt_artifact=artifact,
            model_used="deterministic", fallback_used=True,
            fallback_reason=reason, latency_ms=latency_ms,
        )

    def _make_provenance(self, prompt_excerpt: str, model: str, modality: str) -> Dict[str, Any]:
        return {
            "model":        model,
            "modality":     modality,
            "prompt_hash":  hashlib.sha256(prompt_excerpt.encode()).hexdigest()[:16],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "engine":       "hf_adapter/1.0",
        }
