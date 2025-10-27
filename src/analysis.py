"""LLM-powered happiness moment extraction."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List

import google.generativeai as genai

from .config import settings
from .prompts import happiness_extraction_prompt


class HappinessAnalyzer:
    """Uses Gemini to identify the happiest conversation segment."""

    def __init__(self) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.model_text)

    def select_happiest(self, transcript: List[dict[str, str]]) -> Dict[str, Any]:
        """Returns the top joyful excerpt and metadata."""

        prompt = happiness_extraction_prompt(transcript)
        response = self.model.generate_content(prompt)
        text_payload = self._sanitize_json(self._extract_text(response))
        try:
            return json.loads(text_payload)
        except json.JSONDecodeError as exc:
            logging.error("Gemini happiness response was not valid JSON: %s", text_payload)
            raise ValueError("Failed to parse happiness analysis response") from exc

    @staticmethod
    def _extract_text(response: genai.types.AsyncGenerateContentResponse) -> str:
        """Pulls the first text part from the Gemini response, if present."""

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
            logging.warning("Gemini prompt feedback: %s", prompt_feedback)
        return ""

    @staticmethod
    def _sanitize_json(raw: str) -> str:
        """Removes Markdown code fences before JSON parsing."""

        cleaned = raw.strip()
        if cleaned.startswith("```") and cleaned.endswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z0-9_+-]*\s*", "", cleaned)
            cleaned = re.sub(r"```$", "", cleaned.strip())
        return cleaned

