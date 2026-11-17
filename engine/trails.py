"""Trail discovery: every folder in trails/ with a trail.json is a trail.

A folder whose name starts with "_" (like trails/_template) is ignored, so the
template never shows up on the home page.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

ID_PATTERN = re.compile(r'^[a-z0-9][a-z0-9-]{0,39}$')
LANGUAGES = ('en', 'es', 'pt')                    # the language toggle in the top bar
I18N_KEYS = {'title', 'subtitle', 'description', 'tags', 'materials'}


@dataclass
class Trail:
    id: str
    folder: Path
    title: str
    engine: str
    entry: str = 'index.html'
    subtitle: str = ''
    description: str = ''
    language: str = 'en'
    order: int = 100
    tags: list[str] = field(default_factory=list)
    materials: list[dict] = field(default_factory=list)
    database: dict = field(default_factory=dict)
    i18n: dict = field(default_factory=dict)      # {"en"|"es"|"pt": {title, subtitle, description, tags, materials}}

    @property
    def entry_path(self) -> Path:
        return self.folder / self.entry

    def titles(self) -> dict:
        """Title per top-bar language, falling back to the manifest title."""
        return {lang: (self.i18n.get(lang) or {}).get('title', self.title) for lang in LANGUAGES}

    def public(self) -> dict:
        """What the home page and the in-trail switcher get to see."""
        return {
            'id': self.id, 'title': self.title, 'subtitle': self.subtitle,
            'description': self.description, 'language': self.language,
            'order': self.order, 'engine': self.engine, 'tags': self.tags,
            'url': f'/t/{self.id}/',
            'materials': [{'label': m['label'], 'url': f"/t/{self.id}/{m['file']}"} for m in self.materials],
            'i18n': self.i18n,
        }


class TrailError(ValueError):
    pass


def load_trail(folder: Path, engines: set[str]) -> Trail:
    manifest = folder / 'trail.json'
    try:
        data = json.loads(manifest.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        raise TrailError(f'{manifest}: invalid JSON ({e})') from None
    if not isinstance(data, dict):
        raise TrailError(f'{manifest}: must contain a JSON object')

    trail_id = data.get('id', folder.name)
    if trail_id != folder.name:
        raise TrailError(f'{manifest}: "id" is {trail_id!r} but the folder is {folder.name!r}; they must match')
    if not ID_PATTERN.match(trail_id):
        raise TrailError(f'{manifest}: id {trail_id!r} must be lowercase letters, digits and dashes')
    for key in ('title', 'engine'):
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise TrailError(f'{manifest}: "{key}" is required')
    if data['engine'] not in engines:
        raise TrailError(f'{manifest}: unknown engine {data["engine"]!r} (available: {", ".join(sorted(engines))})')

    known = {f for f in Trail.__dataclass_fields__ if f != 'folder'}
    unknown = set(data) - known
    if unknown:
        raise TrailError(f'{manifest}: unknown key(s) {", ".join(sorted(unknown))}')

    trail = Trail(folder=folder, **{k: v for k, v in data.items() if k in known} | {'id': trail_id})
    if not trail.entry_path.is_file():
        raise TrailError(f'{manifest}: entry page {trail.entry!r} not found in {folder}')
    for item in trail.materials:
        if not isinstance(item, dict) or not item.get('label') or not item.get('file'):
            raise TrailError(f'{manifest}: each item in "materials" needs "label" and "file"')
        if not (folder / item['file']).is_file():
            raise TrailError(f'{manifest}: material {item["file"]!r} not found')
    for dataset in trail.database.get('datasets', []):
        for script in dataset.get('scripts', []):
            if not (folder / script).is_file():
                raise TrailError(f'{manifest}: database script {script!r} not found')
    if not isinstance(trail.i18n, dict):
        raise TrailError(f'{manifest}: "i18n" must be an object keyed by language')
    for lang, texts in trail.i18n.items():
        if lang not in LANGUAGES:
            raise TrailError(f'{manifest}: i18n language {lang!r} is not one of {", ".join(LANGUAGES)}')
        if not isinstance(texts, dict) or set(texts) - I18N_KEYS:
            raise TrailError(f'{manifest}: i18n.{lang} may only contain {", ".join(sorted(I18N_KEYS))}')
        if 'materials' in texts and len(texts['materials']) != len(trail.materials):
            raise TrailError(f'{manifest}: i18n.{lang}.materials must have one label per item in "materials"')
    if trail.database and trail.engine != 'postgres':
        raise TrailError(f'{manifest}: "database" only applies to the postgres engine')
    return trail


def discover(trails_dir: Path, engines: set[str]) -> tuple[list[Trail], list[str]]:
    """Return (trails sorted by order, list of error messages)."""
    trails, errors = [], []
    for folder in sorted(p for p in trails_dir.iterdir() if p.is_dir()):
        if folder.name.startswith(('_', '.')) or not (folder / 'trail.json').exists():
            continue
        try:
            trails.append(load_trail(folder, engines))
        except TrailError as e:
            errors.append(str(e))
    trails.sort(key=lambda t: (t.order, t.title.lower()))
    return trails, errors
