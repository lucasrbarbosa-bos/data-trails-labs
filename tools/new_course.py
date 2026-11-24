#!/usr/bin/env python3
"""Create a new course from courses/_template.

    python tools/new_course.py go-basics
    python tools/new_course.py window-functions --title "Window Functions" --engine postgres --language en

Creates courses/<id>/ with a course.json, a working page and editable JSON content,
and, for the postgres engine, a dataset in its own schema (db/01_dataset.sql).
Then restart the hub (or `docker compose restart lab`) and the course shows up on
the home page. Full guide: docs/ADDING_A_COURSE.md
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'engine'))

from runners import RUNNERS  # noqa: E402
from courses import ID_PATTERN, CourseError, load_course  # noqa: E402

TEMPLATE = ROOT / 'courses' / '_template'


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description='Create a new course from courses/_template.')
    p.add_argument('id', help='folder name and URL: lowercase letters, digits and dashes (e.g. go-basics)')
    p.add_argument('--title', help='title on the home page (default: from the id)')
    p.add_argument('--engine', default='python', choices=sorted(RUNNERS))
    p.add_argument('--language', default='en', help='content language tag, e.g. en or pt-BR')
    p.add_argument('--courses-dir', '--trails-dir', type=Path, default=ROOT / 'courses')
    args = p.parse_args(argv)

    if not ID_PATTERN.match(args.id):
        p.error('the id must be lowercase letters, digits and dashes, starting with a letter or digit')
    if not re.fullmatch(r'[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*', args.language):
        p.error('use a language tag such as en, es or pt-BR')
    target = args.courses_dir / args.id
    if target.exists():
        p.error(f'{target} already exists')

    title = args.title or args.id.replace('-', ' ').title()
    schema = 'course_' + args.id.replace('-', '_')
    ignored = ['examples'] if args.engine == 'postgres' else ['examples', 'db']
    ignore = shutil.ignore_patterns(*ignored)
    shutil.copytree(TEMPLATE, target, ignore=ignore)

    manifest = json.loads((target / 'course.json').read_text(encoding='utf-8'))
    manifest = {'id': args.id, **manifest, 'title': title, 'engine': args.engine, 'language': args.language}
    if args.engine == 'postgres':
        manifest['database'] = {
            'schemas': [schema],
            'datasets': [{'name': schema, 'check': f'{schema}.notes', 'scripts': ['db/01_dataset.sql']}],
        }
    (target / 'course.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    content = (TEMPLATE / 'examples' / f'{args.engine}.json').read_text(encoding='utf-8')
    content_dir = target / 'content'
    content_dir.mkdir()
    content_language = args.language.lower().split('-')[0]
    (content_dir / f'{content_language}.json').write_text(content.replace('__SCHEMA__', schema), encoding='utf-8')
    for path in target.glob('db/*.sql'):
        script = path.read_text(encoding='utf-8')
        path.write_text(script.replace('__SCHEMA__', schema), encoding='utf-8')

    try:
        load_course(target, set(RUNNERS))
    except CourseError as e:
        print(f'Created {target}, but it does not validate: {e}', file=sys.stderr)
        return 1

    rel = target.relative_to(ROOT) if target.is_relative_to(ROOT) else target
    print(f'Created {rel}/ (engine: {args.engine})')
    print('Next:')
    print(f'  1. Edit {rel}/course.json (subtitle, description, tags, order).')
    print(f'  2. Write the chapters in {rel}/content/{content_language}.json.')
    if args.engine == 'postgres':
        print(f'  3. Put your tables and data in {rel}/db/01_dataset.sql (schema "{schema}").')
    print('  -> Restart the hub (Ctrl+C, then python engine/hub.py) or: docker compose restart lab')
    return 0


if __name__ == '__main__':
    sys.exit(main())
