#!/usr/bin/env python3
"""Create a new trail from trails/_template.

    python tools/new_trail.py go-basics
    python tools/new_trail.py window-functions --title "Window Functions" --engine postgres --language en

Creates trails/<id>/ with a trail.json, a working index.html with two exercises,
and, for the postgres engine, a dataset in its own schema (db/01_dataset.sql).
Then restart the hub (or `docker compose restart lab`) and the trail shows up on
the home page. Full guide: docs/ADDING_A_TRAIL.md
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
from trails import ID_PATTERN, TrailError, load_trail  # noqa: E402

TEMPLATE = ROOT / 'trails' / '_template'


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description='Create a new trail from trails/_template.')
    p.add_argument('id', help='folder name and URL: lowercase letters, digits and dashes (e.g. go-basics)')
    p.add_argument('--title', help='title on the home page (default: from the id)')
    p.add_argument('--engine', default='python', choices=sorted(RUNNERS))
    p.add_argument('--language', default='en', help='content language tag, e.g. en or pt-BR')
    p.add_argument('--trails-dir', type=Path, default=ROOT / 'trails')
    args = p.parse_args(argv)

    if not ID_PATTERN.match(args.id):
        p.error('the id must be lowercase letters, digits and dashes, starting with a letter or digit')
    target = args.trails_dir / args.id
    if target.exists():
        p.error(f'{target} already exists')

    title = args.title or args.id.replace('-', ' ').title()
    schema = args.id.replace('-', '_')
    ignore = None if args.engine == 'postgres' else shutil.ignore_patterns('db')
    shutil.copytree(TEMPLATE, target, ignore=ignore)

    manifest = json.loads((target / 'trail.json').read_text(encoding='utf-8'))
    manifest = {'id': args.id, **manifest, 'title': title, 'engine': args.engine, 'language': args.language}
    if args.engine == 'postgres':
        manifest['database'] = {
            'schemas': [schema],
            'datasets': [{'name': schema, 'check': f'{schema}.notes', 'scripts': ['db/01_dataset.sql']}],
        }
    (target / 'trail.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    for path in [target / 'index.html', *target.glob('db/*.sql')]:
        text = path.read_text(encoding='utf-8')
        text = text.replace('__SCHEMA__', schema).replace('__TITLE__', title)
        text = text.replace('<title>My new trail</title>', f'<title>{title}</title>')
        text = text.replace('<h1 id="title">My new trail</h1>', f'<h1 id="title">{title}</h1>')
        path.write_text(text, encoding='utf-8')

    try:
        load_trail(target, set(RUNNERS))
    except TrailError as e:
        print(f'Created {target}, but it does not validate: {e}', file=sys.stderr)
        return 1

    rel = target.relative_to(ROOT) if target.is_relative_to(ROOT) else target
    print(f'Created {rel}/ (engine: {args.engine})')
    print('Next:')
    print(f'  1. Edit {rel}/trail.json (subtitle, description, tags, order).')
    print(f'  2. Replace the exercises in {rel}/index.html.')
    if args.engine == 'postgres':
        print(f'  3. Put your tables and data in {rel}/db/01_dataset.sql (schema "{schema}").')
    print('  -> Restart the hub (Ctrl+C, then python engine/hub.py) or: docker compose restart lab')
    return 0


if __name__ == '__main__':
    sys.exit(main())
