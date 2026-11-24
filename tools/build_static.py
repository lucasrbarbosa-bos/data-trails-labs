#!/usr/bin/env python3
"""Build a static copy of Trails Lab for GitHub Pages (or any static host).

    python tools/build_static.py                              # -> _site/, served at /
    python tools/build_static.py --base data-trails-labs      # -> _site/, served at /data-trails-labs/
    python -m http.server -d _site 8000                       # preview (with --base /, the default)

The output is the same home page and trail pages the hub serves, as plain files: the shared theme and
top bar under hub/, each trail under t/<id>/ with its content and materials, and the trail list baked
into the home page. There is no engine behind it, so pages run in "static" mode (window.TRAIL.static):
  - reading trails (engine "none") work completely;
  - the Python trail runs exercises in the browser with Brython (its built-in fallback);
  - the SQL trail is read-only: queries need the local lab (docker compose up -d).
The local lab (engine/hub.py, Docker) is not affected by this script.

Standard library only.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'engine'))

from runners import RUNNERS  # noqa: E402
from trails import Trail, discover  # noqa: E402

WEB = ROOT / 'engine' / 'web'
HUB_FILES = ('theme.css', 'trail-base.css', 'trail-hub.js', 'favicon.svg')

# What the home card says about each engine when there is no server behind the site.
STATIC_HEALTH = {
    'none': {'ready': True, 'label': {'en': 'reading only', 'es': 'solo lectura', 'pt': 'somente leitura'}},
    'python': {'ready': True, 'label': {'en': 'python in the browser', 'es': 'python en el navegador',
                                        'pt': 'python no navegador'}},
    'postgres': {'ready': False, 'label': {'en': 'read-only online', 'es': 'solo lectura en línea',
                                           'pt': 'somente leitura online'},
                 'hint': {'en': 'Queries run in the local lab: docker compose up -d',
                          'es': 'Las consultas se ejecutan en el laboratorio local: docker compose up -d',
                          'pt': 'As consultas rodam no laboratório local: docker compose up -d'}},
}


def safe_json(value) -> str:
    """JSON that is safe inside a <script> element (same rule as engine/hub.py)."""
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')


def inject(html: str, snippet: str) -> str:
    """Insert snippet before the closing head tag (engine/hub.py does the same at request time)."""
    i = html.lower().rfind('</head>')
    return html[:i] + snippet + '\n' + html[i:] if i >= 0 else snippet + html


def trail_url(base: str, trail: Trail) -> str:
    return f'{base}t/{trail.id}/'


def listing(trails: list[Trail], base: str) -> list[dict]:
    """The /api/trails answer, with URLs under base and static health."""
    out = []
    for t in trails:
        item = t.public()
        item['url'] = trail_url(base, t)
        item['materials'] = [{'label': m['label'], 'url': f"{trail_url(base, t)}{m['file']}"} for m in t.materials]
        item['health'] = STATIC_HEALTH.get(t.engine, {'ready': False, 'label': t.engine})
        out.append(item)
    return out


def context(trail: Trail, trails: list[Trail], base: str) -> dict:
    """window.TRAIL for a trail page (engine/hub.py builds the same, plus static/base)."""
    return {
        'id': trail.id, 'title': trail.title, 'titles': trail.titles(), 'engine': trail.engine,
        'language': trail.language, 'home': base, 'static': True, 'base': base,
        'trails': [{'id': t.id, 'title': t.title, 'titles': t.titles(), 'url': trail_url(base, t)} for t in trails],
    }


def copy_trail_files(trail: Trail, dest: Path) -> int:
    """Every file of the trail folder except dotfiles (the hub doesn't serve them either)."""
    n = 0
    for path in sorted(trail.folder.rglob('*')):
        rel = path.relative_to(trail.folder)
        if not path.is_file() or any(p.startswith('.') for p in rel.parts):
            continue
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        n += 1
    return n


def build(out: Path, base: str = '/', trails_dir: Path = ROOT / 'trails') -> dict:
    if ':' in base or '\\' in base:          # Git Bash on Windows turns /x/ into C:/Program Files/Git/x/
        raise ValueError(f'--base {base!r} is not a URL path; pass it without slashes, e.g. --base data-trails-labs')
    base = '/' + base.strip('/') + '/' if base.strip('/') else '/'
    trails, errors = discover(trails_dir, set(RUNNERS))
    if errors:
        raise SystemExit('invalid trails:\n  ' + '\n  '.join(errors))
    if out.exists():
        shutil.rmtree(out)
    (out / 'hub').mkdir(parents=True)
    for name in HUB_FILES:
        shutil.copy2(WEB / name, out / 'hub' / name)
    hub_script = (WEB / 'trail-hub.js').read_text(encoding='utf-8')

    # home page: same file, hub assets under base, trail list baked in instead of /api/trails
    home = (WEB / 'home.html').read_text(encoding='utf-8')
    home = home.replace('"/hub/', f'"{base}hub/')
    home = home.replace("<script>window.TRAIL = { home: '/' };</script>",
                        f'<script>window.TRAIL = {safe_json({"home": base, "static": True, "base": base})};\n'
                        f'window.TRAILS_STATIC = {safe_json(listing(trails, base))};</script>')
    (out / 'index.html').write_text(home, encoding='utf-8')

    files = 0
    for t in trails:
        dest = out / 't' / t.id
        files += copy_trail_files(t, dest)
        page = t.entry_path.read_text(encoding='utf-8')
        snippet = (f'<link rel="stylesheet" href="{base}hub/theme.css">\n'
                   f'<link rel="stylesheet" href="{base}hub/trail-base.css">\n'
                   f'<script>window.TRAIL = {safe_json(context(t, trails, base))};</script>\n'
                   f'<script>{hub_script}</script>')
        (dest / 'index.html').write_text(inject(page, snippet), encoding='utf-8')
        if t.entry != 'index.html':                  # the hub serves the entry page at /t/<id>/
            (dest / t.entry).write_text(inject(page, snippet), encoding='utf-8')
    (out / '.nojekyll').write_text('', encoding='utf-8')   # serve folders and files as they are
    return {'trails': [t.id for t in trails], 'files': files}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description='Build a static copy of Trails Lab (GitHub Pages).')
    p.add_argument('--out', type=Path, default=ROOT / '_site')
    p.add_argument('--base', default='/', help='URL path the site is served under, e.g. data-trails-labs (slashes optional)')
    args = p.parse_args(argv)
    result = build(args.out.resolve(), args.base)
    print(f"built {args.out} for {args.base}: {', '.join(result['trails'])} ({result['files']} trail files)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
