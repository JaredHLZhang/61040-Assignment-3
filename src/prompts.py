"""Prompt templates for Gemini interactions."""

from __future__ import annotations

from textwrap import dedent
from typing import Iterable, List


def happiness_extraction_prompt(transcript: Iterable[dict[str, str]]) -> str:
    """Builds a prompt to ask Gemini for the happiest conversation moment."""

    turns: List[str] = []
    for turn in transcript:
        speaker = turn.get("speaker", "Unknown")
        utterance = turn.get("utterance", "")
        timestamp = turn.get("timestamp")
        prefix = f"[{timestamp}] " if timestamp else ""
        turns.append(f"{prefix}{speaker}: {utterance}")

    conversation = "\n".join(turns)
    template = dedent(
        """
        You are an empathetic relationship coach helping long-distance couples
        relive their happiest memories. Review the conversation transcript and
        identify the single moment that best captures shared joy.

        Provide a JSON object with these keys:
        - "excerpt": exact lines capturing the joyful exchange.
        - "summary": concise description of why it is joyful.
        - "confidence": number between 0 and 1 estimating certainty.
        - "supporting_points": array of short bullet points explaining the
          selection.

        Transcript:
        {conversation}

        Respond with JSON only.
        """
    ).strip()

    return template.format(conversation=conversation)


def story_prompt(happiness_excerpt: str) -> str:
    """Prompt to generate a three-scene story from the happiest moment."""

    return dedent(
        """
        You are Amimi, an affectionate AI companion. Transform the highlighted
        joyful moment into a three-scene vignette. Each scene focuses on:
        1. The girl's happiest moment today.
        2. The boy's happiest moment today.
        3. A creative "together" moment imagining them in the same place.

        Return JSON with fields:
        - "scenes": array of three objects containing
          - "title" (string)
          - "narration" (3-4 sentences, warm and vivid)
        - "tone": sentence describing the mood of the story.

        Base the first two scenes strictly on the excerpt while the third may
        imagine a sweet future moment consistent with their personalities.

        Happiest excerpt:
        {excerpt}

        Reply with JSON only.
        """
    ).strip().format(excerpt=happiness_excerpt)


def image_prompt(scene_title: str, scene_narration: str, style: str | None) -> str:
    """Prompt template for generating a square image of a scene."""

    style_hint = f" in {style} style" if style else ""
    return (
        dedent(
            """
            Create a 1:1 aspect ratio illustration capturing the scene below.
            Focus on tenderness and the emotional bond between the couple. Avoid
            text or typography in the image.

            Scene title: {title}
            Scene narration: {narration}
            Style preference: {style_hint}
            """
        )
        .strip()
        .format(
            title=scene_title,
            narration=scene_narration,
            style_hint=style_hint or "natural illustrative style",
        )
    )

