"""Story generation using Gemini."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict

import google.generativeai as genai

from .config import settings
from .prompts import story_prompt


class StoryGenerator:
    """Creates a three-scene story based on the happiest excerpt."""

    def __init__(self) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.model_text)

    def create_story(self, excerpt: str) -> Dict[str, Any]:
        """Returns a structured story derived from the excerpt."""

        response = self.model.generate_content(story_prompt(excerpt))
        text_payload = self._sanitize_json(self._extract_text(response))
        try:
            return json.loads(text_payload)
        except json.JSONDecodeError as exc:
            logging.error("Gemini story response was not valid JSON: %s", text_payload)
            raise ValueError("Failed to parse story generation response") from exc

    @staticmethod
    def _extract_text(response: genai.types.AsyncGenerateContentResponse) -> str:
        """Extracts the first textual part from the Gemini response."""

        if getattr(response, "text", None):
            return response.text

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            parts = getattr(candidate, "content", None)
            if not parts:
                continue
            for part in getattr(parts, "parts", []):
                text = getattr(part, "text", None)
                if text:
                    return text
        prompt_feedback = getattr(response, "prompt_feedback", None)
        if prompt_feedback:
            logging.warning("Gemini story prompt feedback: %s", prompt_feedback)
        return ""

    @staticmethod
    def _sanitize_json(raw: str) -> str:
        """Strips Markdown code fences if present."""

        cleaned = raw.strip()
        if cleaned.startswith("```") and cleaned.endswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z0-9_+-]*\s*", "", cleaned)
            cleaned = re.sub(r"```$", "", cleaned.strip())
        return cleaned

