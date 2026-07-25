from __future__ import annotations

import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "config" / "deepgram_voice_profiles.json"


class VoiceRegistryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        cls.profiles = cls.data["profiles"]

    def test_all_current_profiles_are_mapped(self) -> None:
        self.assertEqual(24, len(self.profiles))

    def test_speed_is_supported(self) -> None:
        for slug, profile in self.profiles.items():
            with self.subTest(slug=slug):
                self.assertGreaterEqual(profile["speed"], 0.7)
                self.assertLessEqual(profile["speed"], 1.5)

    def test_every_assignment_is_review_gated(self) -> None:
        for slug, profile in self.profiles.items():
            with self.subTest(slug=slug):
                self.assertEqual("proposed", profile["review_status"])
                self.assertIn("Never clone", profile["consent_boundary"])

    def test_aura_2_models(self) -> None:
        for slug, profile in self.profiles.items():
            with self.subTest(slug=slug):
                self.assertTrue(profile["tts_model"].startswith("aura-2-"))
                self.assertTrue(profile["tts_model"].endswith("-en"))


if __name__ == "__main__":
    unittest.main()
