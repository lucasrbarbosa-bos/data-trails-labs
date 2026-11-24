"""Python engine: runs trail code with the same Python that runs the hub.

In Docker that is the Python in the image (see Dockerfile). Without Docker it is
whatever Python you used to start engine/hub.py.

API (relative to /t/<trail-id>/):
  GET  api/status  -> {version, executable, folder}
  POST api/run     {code, inputs?, argv?, debug?, check?}
                   -> {status, assertion, output, vars, steps, truncated}
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from http import HTTPStatus
from pathlib import Path

from .base import Runner

EXECUTOR = (Path(__file__).with_name('python_executor.py')).read_text(encoding='utf-8')
TIMEOUT = 15   # seconds per run


class PythonRunner(Runner):
    engine = 'python'

    def __init__(self, trail, settings):
        super().__init__(trail, settings)
        self.workdir = settings.workspace / trail.id

    @property
    def label(self) -> str:
        return f'Python {sys.version.split()[0]}'

    def start(self) -> None:
        try:
            self.workdir.mkdir(parents=True, exist_ok=True)
            probe = self.workdir / '.write-test'
            probe.write_text('ok')
            probe.unlink()
        except OSError:
            fallback = Path(tempfile.gettempdir()) / 'trails-lab' / self.trail.id
            fallback.mkdir(parents=True, exist_ok=True)
            print(f'  [{self.trail.id}] cannot write to {self.workdir}; exercise files go to {fallback}')
            self.workdir = fallback

    def health(self) -> dict:
        return {'ready': True, 'label': self.label, 'hint': None}

    def handle(self, method, action, payload):
        if method == 'GET' and action == 'status':
            return HTTPStatus.OK, {'version': sys.version.split()[0], 'executable': sys.executable,
                                   'folder': str(self.workdir)}
        if method == 'POST' and action == 'run':
            return HTTPStatus.OK, self.execute(payload or {})
        return super().handle(method, action, payload)

    def execute(self, request: dict) -> dict:
        self.workdir.mkdir(parents=True, exist_ok=True)
        try:
            proc = subprocess.run(
                [sys.executable, '-X', 'utf8', '-c', EXECUTOR],
                input=json.dumps(request), capture_output=True, text=True,
                cwd=self.workdir, timeout=TIMEOUT, encoding='utf-8',
            )
        except subprocess.TimeoutExpired:
            return {'status': 'error', 'vars': [], 'steps': [],
                    'output': [['tb', f'TimeoutError: the run took longer than {TIMEOUT}s '
                                     '(infinite loop?) and was stopped.']]}
        try:
            return json.loads(proc.stdout.strip().splitlines()[-1])
        except (IndexError, json.JSONDecodeError):
            return {'status': 'error', 'vars': [], 'steps': [],
                    'output': [['tb', 'Internal executor error:\n' + proc.stderr[-2000:]]]}
