"""Orchestration entrypoint for the Amimi memory generator."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from .analysis import HappinessAnalyzer
from .config import settings
from .image import ImageGenerator
from .storage import StorageManager
from .story import StoryGenerator
from .transcript import TranscriptLoader


def run_pipeline(style: str | None = None) -> Dict[str, object]:
    """Executes the full transcript-to-storyboard flow."""

    # Load the latest transcript from the transcripts directory.
    transcript_files = sorted(settings.transcript_dir.glob("*.txt"))
    if not transcript_files:
        raise FileNotFoundError("No transcript files found in transcripts directory")

    loader = TranscriptLoader(transcript_files[-1])
    turns = loader.load()
    transcript_dicts = TranscriptLoader.to_dicts(turns)

    # Ask Gemini to identify the happiest moment in the transcript.
    analyzer = HappinessAnalyzer()
    happiest = analyzer.select_happiest(transcript_dicts)

    # Generate a three-scene story based on the highlighted excerpt.
    story_generator = StoryGenerator()
    story = story_generator.create_story(happiest["excerpt"])

    # Persist story JSON/text and prepare folders for the session images.
    storage = StorageManager()
    paths = storage.prepare_session_dirs()
    storage.save_story(Path(paths["story"]), story)

    image_generator = ImageGenerator(Path(paths["images"]))
    image_urls: List[str] = []
    for idx, scene in enumerate(story.get("scenes", [])):
        image_path = image_generator.generate_scene_image(scene, style, idx)
        relative_url = f"/images/{paths['id']}/{image_path.name}"
        image_urls.append(relative_url)

    return {
        "story": story,
        "story_path": str(paths["story"]),
        "image_paths": image_urls,
        "session_id": paths["id"],
        "happiest": happiest,
    }

