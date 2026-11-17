#!/usr/bin/env python3
"""Trails Lab hub: one local server for every trail.

    python engine/hub.py                 # http://127.0.0.1:8765 opens in your browser

Routes
    /                          home page (pick a trail)
    /api/trails                trails + engine health, for the home page
    /hub/<file>                files from engine/web (favicon, etc.)
    /t/<id>/                   the trail's entry page, with the hub script injected
    /t/<id>/api/<action>       the trail's engine (see engine/runners)
    /t/<id>/<file>             any other file in the trail folder (PDFs, images, ...)

Security: binds to 127.0.0.1 by default, and every API call needs a secret token
that is generated at start-up and injected into the pages the hub serves, plus a
same-origin check. Inside Docker the hub binds 0.0.0.0, but docker-compose.yml only
publishes the port on 127.0.0.1.

Only the Python standard library is used. Python 3.10 or newer.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import secrets
import sys
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ENGINE_DIR = Path(__file__).resolve().parent
ROOT = ENGINE_DIR.parent
sys.path.insert(0, str(ENGINE_DIR))

from runners import RUNNERS, Settings  # noqa: E402
from trails import Trail, discover  # noqa: E402

WEB = ENGINE_DIR / 'web'
TOKEN = secrets.token_urlsafe(24)
MAX_BODY = 1_000_000


class Hub:
    def __init__(self, trails: list[Trail], settings: Settings):
        self.trails = {t.id: t for t in trails}
        self.runners = {t.id: RUNNERS[t.engine](t, settings) for t in trails}

    def start(self) -> None:
        for runner in self.runners.values():
            runner.start()

    def listing(self) -> list[dict]:
        out = []
        for trail_id, trail in self.trails.items():
            item = trail.public()
            try:
                item['health'] = self.runners[trail_id].health()
            except Exception as e:          # a broken engine must not break the home page
                item['health'] = {'ready': False, 'label': 'Engine error', 'hint': str(e)[:300]}
            out.append(item)
        return out

    def trail_context(self, trail: Trail) -> dict:
        """What the injected trail-hub script receives as window.TRAIL."""
        return {
            'id': trail.id, 'title': trail.title, 'titles': trail.titles(), 'engine': trail.engine,
            'language': trail.language, 'home': '/',
            'trails': [{'id': t.id, 'title': t.title, 'titles': t.titles(), 'url': f'/t/{t.id}/'}
                       for t in self.trails.values()],
        }


def inject(html: str, snippet: str) -> str:
    """Insert snippet right before the real closing head tag (ignoring any inside <!-- comments -->)."""
    comments = [m.span() for m in re.finditer(r'<!--.*?-->', html, flags=re.S)]
    for m in re.finditer(r'</head\s*>', html, flags=re.I):
        if not any(a <= m.start() < b for a, b in comments):
            return html[:m.start()] + snippet + '\n' + html[m.start():]
    return snippet + html


def safe_json(value) -> str:
    """JSON that is safe to place inside a <script> element."""
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')


def make_handler(hub: Hub):
    hub_script = (WEB / 'trail-hub.js').read_text(encoding='utf-8')

    class Handler(BaseHTTPRequestHandler):
        server_version = 'TrailsLab/1.0'

        def log_message(self, fmt, *args):     # keep the terminal quiet
            pass

        # ---- responses
        def _send(self, status, body: bytes, content_type: str, extra: dict | None = None):
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def _json(self, data, status=HTTPStatus.OK):
            self._send(status, json.dumps(data, ensure_ascii=False).encode('utf-8'), 'application/json; charset=utf-8')

        def _html(self, html: str):
            self._send(HTTPStatus.OK, html.encode('utf-8'), 'text/html; charset=utf-8')

        def _not_found(self):
            self._json({'erro': 'não encontrado'}, HTTPStatus.NOT_FOUND)

        def _file(self, base: Path, relative: str):
            try:
                path = (base / relative).resolve()
                path.relative_to(base.resolve())
            except (ValueError, OSError):
                return self._not_found()
            if not path.is_file() or any(p.startswith('.') for p in path.relative_to(base.resolve()).parts):
                return self._not_found()
            kind = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
            if kind.startswith('text/') or kind in ('application/javascript', 'application/json', 'image/svg+xml'):
                kind += '; charset=utf-8'
            self._send(HTTPStatus.OK, path.read_bytes(), kind)

        def _authorized(self) -> bool:
            origin = self.headers.get('Origin')
            same_origin = origin is None or origin == f"http://{self.headers.get('Host', '')}"
            return same_origin and secrets.compare_digest(self.headers.get('X-Lab-Token', ''), TOKEN)

        # ---- routing
        def _route(self, method: str):
            path = unquote(urlsplit(self.path).path)
            if path in ('/', '/index.html'):
                if method != 'GET':
                    return self._not_found()
                html = (WEB / 'home.html').read_text(encoding='utf-8')
                return self._html(inject(html, f'<script>window.LAB_TOKEN = {safe_json(TOKEN)};</script>'))
            if path == '/api/trails':
                if not self._authorized():
                    return self._json({'erro': 'não autorizado'}, HTTPStatus.FORBIDDEN)
                return self._json({'trails': hub.listing()})
            if path.startswith('/hub/') and method == 'GET':
                return self._file(WEB, path[len('/hub/'):])

            parts = path.split('/', 3)          # ['', 't', id, rest]
            if len(parts) < 3 or parts[1] != 't' or parts[2] not in hub.trails:
                return self._not_found()
            trail = hub.trails[parts[2]]
            if len(parts) == 3:                 # /t/<id>  ->  /t/<id>/
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                self.send_header('Location', f'/t/{trail.id}/')
                self.send_header('Content-Length', '0')
                self.end_headers()
                return
            rest = parts[3]

            if rest.startswith('api/'):
                if not self._authorized():
                    return self._json({'erro': 'não autorizado'}, HTTPStatus.FORBIDDEN)
                payload = None
                if method == 'POST':
                    size = int(self.headers.get('Content-Length', 0) or 0)
                    if size > MAX_BODY:
                        return self._json({'erro': 'pedido grande demais'}, HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
                    try:
                        payload = json.loads(self.rfile.read(size) or b'{}')
                    except json.JSONDecodeError:
                        return self._json({'erro': 'JSON inválido'}, HTTPStatus.BAD_REQUEST)
                status, body = hub.runners[trail.id].handle(method, rest[len('api/'):], payload)
                return self._json(body, status)

            if method != 'GET':
                return self._not_found()
            if rest in ('', trail.entry):
                html = trail.entry_path.read_text(encoding='utf-8')
                snippet = ('<link rel="stylesheet" href="/hub/theme.css">\n'
                           f'<script>window.LAB_TOKEN = {safe_json(TOKEN)};\n'
                           f'window.TRAIL = {safe_json(hub.trail_context(trail))};</script>\n'
                           f'<script>{hub_script}</script>')
                return self._html(inject(html, snippet))
            return self._file(trail.folder, rest)

        def do_GET(self):
            self._route('GET')

        def do_POST(self):
            self._route('POST')

    return Handler


def env_flag(name: str) -> bool:
    return os.environ.get(name, '').strip().lower() in ('1', 'true', 'yes', 'on')


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description='Trails Lab: one local server for every trail.')
    p.add_argument('--host', default=os.environ.get('LAB_HOST', '127.0.0.1'),
                   help='address to bind (default 127.0.0.1; Docker uses 0.0.0.0)')
    p.add_argument('--port', type=int, default=int(os.environ.get('LAB_PORT', 8765)))
    p.add_argument('--no-browser', action='store_true', default=env_flag('LAB_NO_BROWSER'),
                   help='do not open the browser')
    p.add_argument('--trails-dir', type=Path, default=Path(os.environ.get('LAB_TRAILS_DIR', ROOT / 'trails')))
    p.add_argument('--workspace', type=Path, default=Path(os.environ.get('LAB_WORKSPACE', ROOT / 'workspace')),
                   help='folder where exercises may create files (one subfolder per trail)')
    p.add_argument('--pg-url', default=os.environ.get('LAB_PG_URL') or None,
                   help='psql URL for the postgres engine, e.g. postgresql://lab:lab@localhost:5433/loja')
    p.add_argument('--pg-container', default=os.environ.get('LAB_PG_CONTAINER', 'sql-lab-postgres'),
                   help='container used with "docker exec" when --pg-url is not set')
    p.add_argument('--pg-command', help=argparse.SUPPRESS)       # full psql command, for tests
    p.add_argument('--check', action='store_true', help='validate every trail.json and exit')
    args = p.parse_args(argv)

    trails_dir = args.trails_dir.resolve()
    if not trails_dir.is_dir():
        p.error(f'trails folder not found: {trails_dir}')
    trails, errors = discover(trails_dir, set(RUNNERS))
    for e in errors:
        print(f'ERROR {e}', file=sys.stderr)
    if args.check:
        for t in trails:
            print(f'ok    {t.id:<16} engine={t.engine:<9} {t.title}')
        return 1 if errors else 0
    if not trails:
        p.error('no valid trails found (see the errors above)')

    settings = Settings(root=ROOT, workspace=args.workspace.resolve(), pg_url=args.pg_url,
                        pg_container=args.pg_container,
                        pg_command=args.pg_command.split() if args.pg_command else None)
    hub = Hub(trails, settings)
    print(f'Trails Lab - {len(trails)} trail(s): ' + ', '.join(t.id for t in trails))
    hub.start()

    try:
        server = ThreadingHTTPServer((args.host, args.port), make_handler(hub))
    except OSError as e:
        print(f'Cannot listen on {args.host}:{args.port} ({e}). Is another lab already running? '
              f'Try --port {args.port + 1}.', file=sys.stderr)
        return 1
    server.daemon_threads = True
    shown = '127.0.0.1' if args.host in ('0.0.0.0', '::') else args.host
    url = f'http://{shown}:{args.port}/'
    print(f'Open {url}   (Ctrl+C to stop)', flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nstopped.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
