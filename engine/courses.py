"""Course discovery: every folder in courses/ with a course.json is a course.

A folder whose name starts with "_" (like courses/_template) is ignored, so the
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
class Course:
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
        """What the home page and the in-course switcher get to see."""
        return {
            'id': self.id, 'title': self.title, 'subtitle': self.subtitle,
            'description': self.description, 'language': self.language,
            'order': self.order, 'engine': self.engine, 'tags': self.tags,
            'url': f'/t/{self.id}/',
            'materials': [{'label': m['label'], 'url': f"/t/{self.id}/{m['file']}"} for m in self.materials],
            'i18n': self.i18n,
        }


class CourseError(ValueError):
    pass


def load_course(folder: Path, engines: set[str]) -> Course:
    manifest = folder / 'course.json'
    try:
        data = json.loads(manifest.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        raise CourseError(f'{manifest}: invalid JSON ({e})') from None
    if not isinstance(data, dict):
        raise CourseError(f'{manifest}: must contain a JSON object')

    course_id = data.get('id', folder.name)
    if course_id != folder.name:
        raise CourseError(f'{manifest}: "id" is {course_id!r} but the folder is {folder.name!r}; they must match')
    if not ID_PATTERN.match(course_id):
        raise CourseError(f'{manifest}: id {course_id!r} must be lowercase letters, digits and dashes')
    for key in ('title', 'engine'):
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise CourseError(f'{manifest}: "{key}" is required')
    if data['engine'] not in engines:
        raise CourseError(f'{manifest}: unknown engine {data["engine"]!r} (available: {", ".join(sorted(engines))})')

    known = {f for f in Course.__dataclass_fields__ if f != 'folder'}
    unknown = set(data) - known
    if unknown:
        raise CourseError(f'{manifest}: unknown key(s) {", ".join(sorted(unknown))}')

    course = Course(folder=folder, **{k: v for k, v in data.items() if k in known} | {'id': course_id})
    if not course.entry_path.is_file():
        raise CourseError(f'{manifest}: entry page {course.entry!r} not found in {folder}')
    for item in course.materials:
        if not isinstance(item, dict) or not item.get('label') or not item.get('file'):
            raise CourseError(f'{manifest}: each item in "materials" needs "label" and "file"')
        if not (folder / item['file']).is_file():
            raise CourseError(f'{manifest}: material {item["file"]!r} not found')
    for dataset in course.database.get('datasets', []):
        for script in dataset.get('scripts', []):
            if not (folder / script).is_file():
                raise CourseError(f'{manifest}: database script {script!r} not found')
    if not isinstance(course.i18n, dict):
        raise CourseError(f'{manifest}: "i18n" must be an object keyed by language')
    for lang, texts in course.i18n.items():
        if lang not in LANGUAGES:
            raise CourseError(f'{manifest}: i18n language {lang!r} is not one of {", ".join(LANGUAGES)}')
        if not isinstance(texts, dict) or set(texts) - I18N_KEYS:
            raise CourseError(f'{manifest}: i18n.{lang} may only contain {", ".join(sorted(I18N_KEYS))}')
        if 'materials' in texts and len(texts['materials']) != len(course.materials):
            raise CourseError(f'{manifest}: i18n.{lang}.materials must have one label per item in "materials"')
    if course.database and course.engine != 'postgres':
        raise CourseError(f'{manifest}: "database" only applies to the postgres engine')
    return course


def discover(courses_dir: Path, engines: set[str]) -> tuple[list[Course], list[str]]:
    """Return (courses sorted by order, list of error messages)."""
    courses, errors = [], []
    for folder in sorted(p for p in courses_dir.iterdir() if p.is_dir()):
        if folder.name.startswith(('_', '.')) or not (folder / 'course.json').exists():
            continue
        try:
            courses.append(load_course(folder, engines))
        except CourseError as e:
            errors.append(str(e))
    courses.sort(key=lambda t: (t.order, t.title.lower()))
    return courses, errors
