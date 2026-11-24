#!/usr/bin/env python3
"""Keep the courses' translated content in step with the source language.

    python tools/i18n.py status                  what is missing or out of date, per course and language
    python tools/i18n.py extract [course ...]     write the strings that need translating to i18n-work/
    python tools/i18n.py check                   validate the translations in i18n-work/ (keys, markup)
    python tools/i18n.py merge [course ...]       fold translations in and rebuild the content files

Workflow (details in docs/TRANSLATING.md):
  1. Edit the source content (courses/python/content/pt.json, courses/sql/content/pt.json,
     courses/data-architecture/content/en/*.json).
  2. `extract` writes i18n-work/<course>/<lang>/chunkNN.src.json: {key: source text}, only for strings
     that are new or whose source text changed since they were last translated.
  3. Translate each chunk into chunkNN.out.json next to it (same keys), following docs/TRANSLATING.md.
  4. `check`, then `merge`: rebuilds courses/<course>/content/<lang>... and records in i18n/ which source
     text each translation was made from. i18n-work/ can then be deleted.

Only prose is extracted. Code, ids, anchors and checks are copied from the source as they are, so
exercises behave the same in every language. Strings with no translation yet fall back to the source
text and are reported by `status`.

Standard library only.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSES = ROOT / 'courses'
STATE = ROOT / 'i18n'                 # committed: {key: hash of the source text it was translated from}
WORK = ROOT / 'i18n-work'             # git-ignored: chunks for translators
CHUNK = 34_000                        # characters of source text per chunk

CONFIG = {
    'python': {'kind': 'lessons', 'source': 'pt', 'targets': ['en', 'es']},
    # chapter "8. Case study: creator marketplace" is written in English and stays English everywhere
    'sql': {'kind': 'lessons', 'source': 'pt', 'targets': ['en', 'es'], 'keep_chapters': ('8.',)},
    'data-architecture': {'kind': 'chapters', 'source': 'en', 'targets': ['pt', 'es']},
}


# ------------------------------------------------------------------ prose fields
def _item(obj, k):
    return (lambda: obj[k]), (lambda v: obj.__setitem__(k, v))


def lesson_fields(d: dict, keep_chapters=()):
    """(key, get, set) for every prose field of a lesson document (python and sql courses)."""
    yield ('subtitulo', *_item(d, 'subtitulo'))
    for ci, c in enumerate(d['capitulos']):
        if keep_chapters and c['titulo'].startswith(keep_chapters):
            continue
        p = f'c{ci}'
        yield (f'{p}.titulo', *_item(c, 'titulo'))
        for si, s in enumerate(c.get('secoes', [])):
            yield (f'{p}.s{si}', *_item(s, 'titulo'))
        for bi, b in enumerate(c['blocos']):
            q, t = f'{p}.b{bi}', b['t']
            if t in ('h2', 'h3', 'p', 'bullet', 'note'):
                yield (f'{q}.text', *_item(b, 'text'))
            elif t == 'table':
                for ri, row in enumerate(b['rows']):
                    for k in range(len(row)):
                        yield (f'{q}.r{ri}.{k}', *_item(row, k))
            elif t == 'ex':
                yield (f'{q}.titulo', *_item(b, 'titulo'))
                for k in range(len(b.get('callouts') or [])):
                    yield (f'{q}.co{k}', *_item(b['callouts'], k))
            elif t == 'desafio':
                yield (f'{q}.titulo', *_item(b, 'titulo'))
                yield (f'{q}.enunciado', *_item(b, 'enunciado'))


def manifest_fields(m: dict):
    yield ('m.title', *_item(m, 'title'))
    yield ('m.subtitle', *_item(m, 'subtitle'))
    for pi, part in enumerate(m['parts']):
        yield (f'm.p{pi}', *_item(part, 'title'))
        for ci, c in enumerate(part['chapters']):
            yield (f'm.p{pi}.c{ci}', *_item(c, 'title'))


def chapter_fields(ch: dict):
    """Prose fields of one data-architecture chapter. Keys start with the chapter id."""
    p = ch['id']
    yield (f'{p}.title', *_item(ch, 'title'))
    if ch.get('summary'):
        yield (f'{p}.summary', *_item(ch, 'summary'))
    for bi, b in enumerate(ch['blocks']):
        q = f'{p}.b{bi}'
        for f in ('text', 'title', 'caption', 'q', 'explain'):
            if isinstance(b.get(f), str) and b[f] and not (b['t'] == 'code' and f == 'text'):
                yield (f'{q}.{f}', *_item(b, f))
        for f in ('items', 'head', 'options', 'hints'):
            for k in range(len(b.get(f) or [])):
                yield (f'{q}.{f}{k}', *_item(b[f], k))
        for ri, row in enumerate(b.get('rows') or []):
            for k in range(len(row)):
                yield (f'{q}.r{ri}.{k}', *_item(row, k))
        for f in ('steps', 'layers'):
            for k, s in enumerate(b.get(f) or []):
                yield (f'{q}.{f}{k}.label', *_item(s, 'label'))
                if s.get('sub'):
                    yield (f'{q}.{f}{k}.sub', *_item(s, 'sub'))


# ------------------------------------------------------------------ documents
class Doc:
    """A course's content in one language: load, list prose fields, write back."""

    def __init__(self, course: str, lang: str):
        self.course, self.lang, self.cfg = course, lang, CONFIG[course]
        self.folder = COURSES / course / 'content'
        self.data = None

    def path(self) -> Path:
        return self.folder / (f'{self.lang}.json' if self.cfg['kind'] == 'lessons' else self.lang)

    def exists(self) -> bool:
        return self.path().exists()

    def load(self) -> 'Doc':
        if self.cfg['kind'] == 'lessons':
            self.data = json.loads(self.path().read_text(encoding='utf-8'))
        else:
            folder = self.path()
            manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
            chapters = {}
            for part in manifest['parts']:
                for c in part['chapters']:
                    name = f"{c['num']:02d}-{c['id']}.json"
                    chapters[name] = json.loads((folder / name).read_text(encoding='utf-8'))
            self.data = {'manifest': manifest, 'chapters': chapters}
        return self

    def fields(self):
        if self.cfg['kind'] == 'lessons':
            yield from lesson_fields(self.data, self.cfg.get('keep_chapters', ()))
        else:
            yield from manifest_fields(self.data['manifest'])
            for ch in self.data['chapters'].values():
                yield from chapter_fields(ch)

    def strings(self) -> dict:
        return {k: get() for k, get, _ in self.fields() if isinstance(get(), str) and get().strip()}

    def finish(self):
        """Fix-ups after translations are applied."""
        if self.cfg['kind'] == 'chapters':     # one title per chapter: the manifest's, which the nav shows
            titles = {c['id']: c['title'] for p in self.data['manifest']['parts'] for c in p['chapters']}
            for ch in self.data['chapters'].values():
                ch['title'] = titles[ch['id']]

    def rendered(self) -> dict:
        """{path: text} exactly as `write` would store it."""
        if self.cfg['kind'] == 'lessons':
            return {self.path(): json.dumps(self.data, ensure_ascii=False)}
        out = {self.path() / 'manifest.json': json.dumps(self.data['manifest'], ensure_ascii=False, indent=2) + '\n'}
        for name, ch in self.data['chapters'].items():
            head = {k: v for k, v in ch.items() if k != 'blocks'}
            text = json.dumps(head, ensure_ascii=False)[:-1] + ', "blocks": [\n'
            text += ',\n'.join(json.dumps(b, ensure_ascii=False) for b in ch['blocks']) + '\n]}\n'
            out[self.path() / name] = text
        return out

    def write(self):
        for path, text in self.rendered().items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding='utf-8', newline='\n')


# ------------------------------------------------------------------ state and helpers
def digest(text: str) -> str:
    return hashlib.sha1(text.encode('utf-8')).hexdigest()[:12]


def state_path(course, lang) -> Path:
    return STATE / f'{course}.{lang}.json'


def load_state(course, lang) -> dict:
    p = state_path(course, lang)
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else {}


THOUSANDS = re.compile(r'(?<![\d.,])(\d{1,3}(?:,\d{3})+)(?![\d,])')


def localise(text: str, source: str, lang: str) -> str:
    """English thousands separators (1,440) become 1.440 in pt/es, outside `code` spans."""
    if source != 'en' or lang not in ('pt', 'es'):
        return text
    parts = text.split('`')
    for i in range(0, len(parts), 2):
        parts[i] = THOUSANDS.sub(lambda m: m.group(1).replace(',', '.'), parts[i])
    return '`'.join(parts)


def plan(course, lang):
    """Return (source strings, current translations that are still valid, keys needing translation)."""
    src = Doc(course, CONFIG[course]['source']).load().strings()
    state = load_state(course, lang)
    target = Doc(course, lang)
    current = target.load().strings() if target.exists() else {}
    valid = {k: current[k] for k, s in src.items() if k in current and state.get(k) == digest(s)}
    todo = [k for k in src if k not in valid]
    return src, valid, todo


def work_dir(course, lang) -> Path:
    return WORK / course / lang


def read_work(course, lang) -> tuple[dict, list[str]]:
    """Translations waiting in i18n-work/, and problems found in them."""
    table, problems = {}, []
    for src_file in sorted(work_dir(course, lang).glob('chunk*.src.json')):
        src = json.loads(src_file.read_text(encoding='utf-8'))
        out_file = src_file.with_name(src_file.name.replace('.src.', '.out.'))
        if not out_file.exists():
            problems.append(f'{out_file.relative_to(ROOT)}: missing')
            continue
        try:
            out = json.loads(out_file.read_text(encoding='utf-8'))
        except json.JSONDecodeError as e:
            problems.append(f'{out_file.relative_to(ROOT)}: invalid JSON ({e})')
            continue
        lost, extra = set(src) - set(out), set(out) - set(src)
        if lost or extra:
            problems.append(f'{out_file.relative_to(ROOT)}: {len(lost)} key(s) missing, {len(extra)} unknown')
        for k in set(src) & set(out):
            s, t = src[k], out[k]
            if not isinstance(t, str) or not t.strip():
                problems.append(f'{out_file.name} {k}: empty translation')
            elif s.count('`') != t.count('`') or s.count('**') != t.count('**'):
                problems.append(f'{out_file.name} {k}: markup differs from the source (` or **)')
            elif re.findall(r'`[^`]*`', s) and sorted(re.findall(r'`[^`]*`', s)) != sorted(re.findall(r'`[^`]*`', t)):
                problems.append(f'{out_file.name} {k}: a `code` span was changed')
            else:
                table[k] = t
    return table, problems


# ------------------------------------------------------------------ commands
def cmd_status(courses) -> int:
    behind = 0
    for course in courses:
        for lang in CONFIG[course]['targets']:
            src, valid, todo = plan(course, lang)
            behind += len(todo)
            state = 'up to date' if not todo else f'{len(todo)} string(s) to translate ({sum(len(src[k]) for k in todo)} chars)'
            print(f'{course:<18} {lang}  {len(valid)}/{len(src)} translated, {state}')
    return 1 if behind else 0


def cmd_extract(courses) -> int:
    for course in courses:
        for lang in CONFIG[course]['targets']:
            src, _, todo = plan(course, lang)
            folder = work_dir(course, lang)
            folder.mkdir(parents=True, exist_ok=True)
            for old in folder.glob('chunk*.src.json'):
                old.unlink()
            chunks, cur, size = [], {}, 0
            for k in todo:
                if size + len(src[k]) > CHUNK and cur:
                    chunks.append(cur)
                    cur, size = {}, 0
                cur[k] = src[k]
                size += len(src[k])
            if cur:
                chunks.append(cur)
            for i, c in enumerate(chunks):
                (folder / f'chunk{i:02d}.src.json').write_text(json.dumps(c, ensure_ascii=False, indent=0), encoding='utf-8')
            print(f'{course:<18} {CONFIG[course]["source"]} -> {lang}: {len(todo)} string(s) in {len(chunks)} chunk(s)'
                  + (f'  ({folder.relative_to(ROOT)})' if chunks else ''))
    return 0


def cmd_check(courses) -> int:
    bad = 0
    for course in courses:
        for lang in CONFIG[course]['targets']:
            table, problems = read_work(course, lang)
            for p in problems:
                print('  ' + p)
            bad += len(problems)
            if table or problems:
                print(f'{course:<18} {lang}: {len(table)} translation(s) ok, {len(problems)} problem(s)')
    print('ok' if not bad else f'{bad} problem(s)')
    return 1 if bad else 0


def build(course, lang, extra: dict | None = None) -> tuple[Doc, dict]:
    """Target document = source with every valid or new translation applied. Returns (doc, new state)."""
    cfg = CONFIG[course]
    src, valid, _ = plan(course, lang)
    table = dict(valid, **(extra or {}))
    doc = Doc(course, cfg['source']).load()
    doc.lang = lang
    doc.data = copy.deepcopy(doc.data)
    for k, _, set_ in doc.fields():
        if k in table:
            set_(localise(table[k], cfg['source'], lang))
    doc.finish()
    return doc, {k: digest(src[k]) for k in src if k in table}


def cmd_merge(courses) -> int:
    for course in courses:
        for lang in CONFIG[course]['targets']:
            new, problems = read_work(course, lang)
            if problems:
                print(f'{course} {lang}: {len(problems)} problem(s) in i18n-work, run `check`; merging the valid ones')
            doc, state = build(course, lang, new)
            doc.write()
            STATE.mkdir(exist_ok=True)
            state_path(course, lang).write_text(json.dumps(state, indent=0, sort_keys=True) + '\n', encoding='utf-8')
            total = len(Doc(course, CONFIG[course]['source']).load().strings())
            print(f'{course:<18} {lang}: {len(new)} new, {len(state)}/{total} translated')
    return 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    p.add_argument('command', choices=['status', 'extract', 'check', 'merge'])
    p.add_argument('courses', nargs='*', help=f'default: all ({", ".join(CONFIG)})')
    args = p.parse_args(argv)
    unknown = set(args.courses) - set(CONFIG)
    if unknown:
        p.error(f'unknown course(s): {", ".join(sorted(unknown))}')
    courses = args.courses or list(CONFIG)
    return {'status': cmd_status, 'extract': cmd_extract, 'check': cmd_check, 'merge': cmd_merge}[args.command](courses)


if __name__ == '__main__':
    sys.exit(main())
