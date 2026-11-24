"""The contract every engine (runner) implements.

The hub creates one runner per trail. A trail page calls its runner through
relative URLs, so a page served at /t/<trail-id>/ that fetches "api/run"
reaches   POST /t/<trail-id>/api/run  ->  runner.handle('POST', 'run', body).
"""
from __future__ import annotations

from dataclasses import dataclass
from http import HTTPStatus
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from trails import Trail


@dataclass
class Settings:
    """Engine-wide settings, filled from command-line flags and environment variables."""
    root: Path                         # repository root
    workspace: Path                    # where runners may write files (one subfolder per trail)
    pg_url: str | None = None          # psql connection URL, e.g. postgresql://lab:lab@postgres:5432/loja
    pg_container: str = 'sql-lab-postgres'   # used with "docker exec" when pg_url is not set
    pg_command: list[str] | None = None      # full psql command override (used by tests)


class Runner:
    engine = 'none'
    label = 'Reading only'

    def __init__(self, trail: 'Trail', settings: Settings):
        self.trail = trail
        self.settings = settings

    def start(self) -> None:
        """Called once when the hub starts. Must not block for long or raise."""

    def health(self) -> dict[str, Any]:
        """Summary for the home page: {'ready': bool, 'label': str, 'hint': str | None}."""
        return {'ready': True, 'label': self.label, 'hint': None}

    def handle(self, method: str, action: str, payload: dict | None) -> tuple[int, dict]:
        """Answer GET/POST /t/<id>/api/<action>. Returns (HTTP status, JSON body)."""
        return HTTPStatus.NOT_FOUND, {'error': f'unknown action: {action}'}


class StaticRunner(Runner):
    """For trails that only show content and never execute anything."""
