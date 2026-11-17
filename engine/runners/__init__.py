"""Engine registry. The "engine" key in a trail.json must be one of these names.

To add an engine: write a Runner subclass in this folder and register it below.
See docs/ADDING_A_TRAIL.md, section "Adding a new engine".
"""
from .base import Runner, Settings, StaticRunner
from .postgres_runner import PostgresRunner
from .python_runner import PythonRunner

RUNNERS: dict[str, type[Runner]] = {
    'python': PythonRunner,
    'postgres': PostgresRunner,
    'none': StaticRunner,
}

__all__ = ['RUNNERS', 'Runner', 'Settings']
