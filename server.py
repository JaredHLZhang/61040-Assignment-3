"""FastAPI server exposing Amimi generation endpoints."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.main import run_pipeline
from src.config import settings
from src.transcript import TranscriptLoader
from pathlib import Path

app = FastAPI(title="Amimi GenStory Service")


@app.post("/generate")
async def generate(payload: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Triggers the pipeline and returns file paths."""

    try:
        style = None
        if payload and isinstance(payload, dict):
            style = payload.get("style")
        result = run_pipeline(style)
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/stories/{session_id}")
async def get_story(session_id: str) -> FileResponse:
    """Serves the story JSON for a given session."""

    story_path = Path(f"data/stories/story_{session_id}.json")
    if not story_path.exists():
        raise HTTPException(status_code=404, detail="Story not found")
    return FileResponse(story_path)


@app.get("/images/{session_id}/{image_name}")
async def get_image(session_id: str, image_name: str) -> FileResponse:
    """Serves generated images."""

    image_path = Path(f"data/images/images_{session_id}/{image_name}")
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)


@app.get("/transcript")
async def get_transcript() -> Dict[str, str]:
    """Returns the latest transcript as plain text for the call screen."""

    transcript_files = sorted(settings.transcript_dir.glob("*.txt"))
    if not transcript_files:
        raise HTTPException(status_code=404, detail="Transcript not found")
    latest_path = transcript_files[-1]
    loader = TranscriptLoader(latest_path)
    turns = loader.load()
    text_lines = [f"{turn.speaker}: {turn.utterance}" for turn in turns]
    return {"text": "\n".join(text_lines)}


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

