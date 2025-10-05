"""Transcript loading and preprocessing utilities."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List


@dataclass
class TranscriptTurn:
    """Represents a single line in the conversation."""

    speaker: str
    utterance: str
    timestamp: str | None = None


class TranscriptLoader:
    """Load and structure call transcripts."""

    def __init__(self, transcript_path: Path) -> None:
        self.transcript_path = transcript_path

    def load(self) -> List[TranscriptTurn]:
        """Reads the transcript file into structured turns."""

        lines = self.transcript_path.read_text(encoding="utf-8").splitlines()
        turns: List[TranscriptTurn] = []
        for line in lines:
            if not line.strip():
                continue
            timestamp: str | None = None
            content = line
            if ":" in line:
                parts = line.split(":", maxsplit=1)
                speaker = parts[0].strip()
                utterance = parts[1].strip()
            else:
                speaker = "Unknown"
                utterance = line.strip()
            turns.append(TranscriptTurn(speaker=speaker, utterance=utterance, timestamp=timestamp))
        return turns

    @staticmethod
    def to_dicts(turns: Iterable[TranscriptTurn]) -> List[dict[str, str]]:
        """Converts structured turns to serializable dictionaries."""

        return [
            {
                "speaker": turn.speaker,
                "utterance": turn.utterance,
                "timestamp": turn.timestamp,
            }
            for turn in turns
        ]

