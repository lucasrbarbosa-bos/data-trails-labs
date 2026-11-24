#!/usr/bin/env python3
"""Build a static copy of Trails Lab for GitHub Pages (or any static host).

    python tools/build_static.py                              # -> _site/, served at /
    python tools/build_static.py --base data-trails-labs      # -> _site/, served at /data-trails-labs/
    python -m http.server -d _site 8000                       # preview (with --base /, the default)

The output is the same home page and course pages the hub serves, as plain files: the shared theme and
top bar under hub/, each course under t/<id>/ with its content and materials, and the course list baked
into the home page. There is no engine behind it, so pages run in "static" mode (window.COURSE.static):
  - reading courses (engine "none") work completely;
  - the Python course runs exercises in the browser with Brython (its built-in fallback);
  - the SQL course is read-only: queries need the local lab (docker compose up -d).
The local lab (engine/hub.py, Docker) is not affected by this script.

Standard library only.
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'engine'))

from runners import RUNNERS  # noqa: E402
from courses import Course, discover  # noqa: E402
from course_page import render_course_page, safe_json  # noqa: E402

WEB = ROOT / 'engine' / 'web'
HUB_FILES = ('theme.css', 'course.css', 'trail-hub.js', 'favicon.svg')

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


def course_url(base: str, course: Course) -> str:
    return f'{base}t/{course.id}/'


def listing(courses: list[Course], base: str) -> list[dict]:
    """The /api/trails answer, with URLs under base and static health."""
    out = []
    for t in courses:
        item = t.public()
        item['url'] = course_url(base, t)
        item['materials'] = [{'label': m['label'], 'url': f"{course_url(base, t)}{m['file']}"} for m in t.materials]
        item['health'] = STATIC_HEALTH.get(t.engine, {'ready': False, 'label': t.engine})
        out.append(item)
    return out


def context(course: Course, courses: list[Course], base: str) -> dict:
    """window.COURSE for a static course page."""
    return {
        'id': course.id, 'title': course.title, 'titles': course.titles(), 'engine': course.engine,
        'language': course.language, 'home': base, 'static': True, 'base': base,
        'courses': [{'id': t.id, 'title': t.title, 'titles': t.titles(), 'url': course_url(base, t)} for t in courses],
    }


def copy_course_files(course: Course, dest: Path) -> int:
    """Every file of the course folder except dotfiles (the hub doesn't serve them either)."""
    n = 0
    for path in sorted(course.folder.rglob('*')):
        rel = path.relative_to(course.folder)
        if not path.is_file() or any(p.startswith('.') for p in rel.parts):
            continue
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        n += 1
    return n


def build(out: Path, base: str = '/', courses_dir: Path = ROOT / 'courses') -> dict:
    if ':' in base or '\\' in base:          # Git Bash on Windows turns /x/ into C:/Program Files/Git/x/
        raise ValueError(f'--base {base!r} is not a URL path; pass it without slashes, e.g. --base data-trails-labs')
    base = '/' + base.strip('/') + '/' if base.strip('/') else '/'
    courses, errors = discover(courses_dir, set(RUNNERS))
    if errors:
        raise SystemExit('invalid courses:\n  ' + '\n  '.join(errors))
    if out.exists():
        shutil.rmtree(out)
    (out / 'hub').mkdir(parents=True)
    for name in HUB_FILES:
        shutil.copy2(WEB / name, out / 'hub' / name)
    hub_script = (WEB / 'trail-hub.js').read_text(encoding='utf-8')

    # home page: same file, hub assets under base, course list baked in instead of /api/trails
    home = (WEB / 'home.html').read_text(encoding='utf-8')
    home = home.replace('"/hub/', f'"{base}hub/')
    home = home.replace("<script>window.TRAIL = { home: '/' };</script>",
                        f'<script>window.TRAIL = {safe_json({"home": base, "static": True, "base": base})};\n'
                        f'window.TRAILS_STATIC = {safe_json(listing(courses, base))};</script>')
    (out / 'index.html').write_text(home, encoding='utf-8')

    files = 0
    for t in courses:
        dest = out / 't' / t.id
        files += copy_course_files(t, dest)
        page = t.entry_path.read_text(encoding='utf-8')
        page = render_course_page(page, context(t, courses, base), base, hub_script)
        (dest / 'index.html').write_text(page, encoding='utf-8')
        if t.entry != 'index.html':                  # the hub serves the entry page at /t/<id>/
            (dest / t.entry).write_text(page, encoding='utf-8')
    (out / '.nojekyll').write_text('', encoding='utf-8')   # serve folders and files as they are
    return {'courses': [t.id for t in courses], 'files': files}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description='Build a static copy of Trails Lab (GitHub Pages).')
    p.add_argument('--out', type=Path, default=ROOT / '_site')
    p.add_argument('--base', default='/', help='URL path the site is served under, e.g. data-trails-labs (slashes optional)')
    p.add_argument('--courses-dir', type=Path, default=ROOT / 'courses')
    args = p.parse_args(argv)
    result = build(args.out.resolve(), args.base, args.courses_dir.resolve())
    print(f"built {args.out} for {args.base}: {', '.join(result['courses'])} ({result['files']} course files)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
