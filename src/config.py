"""Application configuration settings."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict


BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_FILE = BASE_DIR / "config.json"


def _load_config_file() -> Dict[str, Any]:
    """Loads secrets from config.json when present."""

    if not CONFIG_FILE.exists():
        return {}
    try:
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("config.json is not valid JSON") from exc


class Settings:
    """Centralized configuration for the service."""

    def __init__(self) -> None:
        file_config = _load_config_file()
        # API key used for authenticating Gemini requests. Environment value wins.
        self.gemini_api_key: str = os.getenv(
            "GEMINI_API_KEY",
            file_config.get("GEMINI_API_KEY", ""),
        )
        # Base directory for incoming transcripts provided by the caller service.
        self.transcript_dir: Path = BASE_DIR / "data" / "transcripts"
        # Destination for storing generated stories in text and JSON formats.
        self.story_dir: Path = BASE_DIR / "data" / "stories"
        # Destination for storing generated storyboard images.
        self.image_dir: Path = BASE_DIR / "data" / "images"
        # Text model identifier powering transcript analysis and story generation.
        self.model_text: str = os.getenv(
            "GEMINI_TEXT_MODEL",
            # Gemini 2.5 Flash balances speed and reasoning for conversational stories.
            file_config.get("GEMINI_TEXT_MODEL", "models/gemini-2.5-flash"),
        )
        # Image model identifier used to synthesize scene artwork.
        self.model_image: str = os.getenv(
            "GEMINI_IMAGE_MODEL",
            # Gemini 2.5 Flash image endpoint yields high fidelity illustrations.
            file_config.get("GEMINI_IMAGE_MODEL", "models/gemini-2.5-flash-image"),
        )


settings = Settings()

