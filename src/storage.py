"""Persistence utilities for stories and images."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from .config import settings


class StorageManager:
    """Handles saving outputs to disk."""

    def __init__(self) -> None:
        self.story_dir = settings.story_dir
        self.image_dir = settings.image_dir
        self.story_dir.mkdir(parents=True, exist_ok=True)
        self.image_dir.mkdir(parents=True, exist_ok=True)

    def _timestamp(self) -> str:
        return datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    def prepare_session_dirs(self) -> Dict[str, Path]:
        """Creates fresh directories for a generation session."""

        stamp = self._timestamp()
        story_path = self.story_dir / f"story_{stamp}.json"
        image_path = self.image_dir / f"images_{stamp}"
        image_path.mkdir(exist_ok=True)
        return {"story": story_path, "images": image_path, "id": stamp}

    def save_story(self, story_path: Path, story_data: Dict[str, Any]) -> None:
        """Writes story data as JSON and pretty text."""

        story_path.write_text(json.dumps(story_data, indent=2), encoding="utf-8")
        text_path = story_path.with_suffix(".txt")
        scenes = story_data.get("scenes", [])
        text_lines = []
        for idx, scene in enumerate(scenes, start=1):
            title = scene.get("title", f"Scene {idx}")
            narration = scene.get("narration", "")
            text_lines.append(f"Scene {idx}: {title}\n{narration}\n")
        text_path.write_text("\n".join(text_lines), encoding="utf-8")

