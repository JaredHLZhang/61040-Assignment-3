"""Image generation via Gemini image API."""

from __future__ import annotations

import base64
import logging
from pathlib import Path
from typing import Dict

import google.generativeai as genai

from .config import settings
from .prompts import image_prompt


class ImageGenerator:
    """Generates square illustrations for each story scene."""

    def __init__(self, output_dir: Path) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(model_name=settings.model_image)
        self.output_dir = output_dir

    def generate_scene_image(self, scene: Dict[str, str], style: str | None, index: int) -> Path:
        """Generates and saves an image for a single scene."""

        prompt = image_prompt(scene["title"], scene["narration"], style)
        response = self.model.generate_content([prompt])
        image_bytes = self._extract_image_bytes(response)
        if image_bytes is None:
            logging.error("Imagen response missing inline image data: %s", response)
            raise ValueError("Image model returned no image data")
        if isinstance(image_bytes, str):
            image_data = base64.b64decode(image_bytes)
        else:
            image_data = image_bytes
        output_path = self.output_dir / f"scene_{index + 1}.png"
        output_path.write_bytes(image_data)
        return output_path

    @staticmethod
    def _extract_image_bytes(response: genai.types.AsyncGenerateContentResponse) -> bytes | str | None:
        """Locate inline image data inside the Gemini response."""

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            if not content:
                continue
            for part in getattr(content, "parts", []):
                inline = getattr(part, "inline_data", None)
                if inline and getattr(inline, "data", None):
                    return inline.data
        images = getattr(response, "images", None)
        if images:
            return images[0].base64_data
        return None

