# Adding a course

A course is **a folder in `courses/` with a `course.json` and an HTML page**. The hub discovers it
at start-up, puts a card on the home page, serves the page at `/t/<id>/`, and connects the page
to the engine the manifest names. Courses never talk to each other and never depend on the order
they are taken in.

```
courses/
└── my-course/
    ├── course.json        manifest: title, engine, card text, datasets
    ├── index.html        shared page structure and optional course-specific markup
    ├── course.css        course-specific styles
    ├── course.js         course behavior and content rendering
    ├── content/          chapter text and exercises, by language
    ├── materials/        optional: PDFs and other downloads linked from the card
    └── db/               optional, postgres engine only: SQL that creates the course's data
```

Folders whose name starts with `_` are ignored (that is how `courses/_template` stays hidden).

---

## The quick way

```bash
python tools/new_course.py my-course --title "My Course"                        # Python
python tools/new_course.py window-fns --title "Window Functions" --engine postgres
python tools/new_course.py reading-list --engine none                          # content only
```

The command uses the Python standard library and needs no AI service, account or build step.
It copies the starter HTML, CSS and JavaScript, writes a sample content file for the chosen
engine and, for PostgreSQL, adds a sample dataset in its own schema. Python and PostgreSQL
start with two exercises. Reading courses start with two chapters. All include navigation and
chapter progress.

1. Edit `courses/<id>/course.json`: subtitle, description, tags, `order`.
2. Write chapters in `courses/<id>/content/en.json` (or the language selected with `--language`).
   The browser tries the selected language first and falls back to the source language. Keep the
   same chapter and exercise IDs across translations so links and progress carry over.
3. Postgres only: put your tables and data in `courses/<id>/db/01_dataset.sql`.
4. Validate: `python engine/hub.py --check`
5. Restart the hub so it discovers the new folder:
   `docker compose restart lab`, or Ctrl+C and `python engine/hub.py`.
6. Open http://127.0.0.1:8765: the new card is there. Edits to the page afterwards only need a
   browser reload.

### Starter content format

```json
{
  "subtitle": "What the reader will learn",
  "chapters": [
    {
      "id": "intro",
      "title": "Introduction",
      "paragraphs": ["Your first paragraph goes here."],
      "exercises": [
        { "id": "hello", "title": "Hello", "text": "Run this program.", "code": "print('Hello')" }
      ]
    }
  ]
}
```

Use unique lowercase IDs with dashes. `paragraphs` and `exercises` are optional. For exercises,
use an optional `check` containing a Python assertion or a reference PostgreSQL query.
Plain-text paragraphs and prompts are rendered as text. The starter requires the local hub for
execution. Its chapters and sample code are readable in a static build. The existing Modern Python
course has its own Brython runner for browser execution.

Check your JSON with `python -m json.tool courses/<id>/content/en.json` and preview the GitHub Pages
build with `python tools/build_static.py` followed by `python -m http.server -d _site 8000`.

### Shared page structure

Copy the layout from `courses/_template/index.html`: `.course-page`, `.course-layout`,
`.course-sidebar`, `.course-main`, `.course-mobile` and `.course-content`.
Keep `<!-- course styles -->` in the head just before the local stylesheet. Both the hub and the
static builder replace it with links to `theme.css` and `course.css` under the correct site base.
Put course-specific components in the local `course.css`. Put text and exercises in `content/`.
Change the JavaScript when you need a new kind of block or course behavior.

## Doing it by hand

1. Create `courses/<id>/`. The id becomes the URL, so use lowercase letters, digits and dashes.
2. Write `course.json` (reference below).
3. Write the entry page following the five rules in **The page contract**.
4. Postgres only: add the `database` block and the scripts in `db/`.
5. `python engine/hub.py --check`, restart, open the home page.

---

## `course.json` reference

```json
{
  "id": "window-fns",
  "title": "Window Functions",
  "subtitle": "Ranking, lag/lead and frames in PostgreSQL",
  "description": "Two or three sentences for the card.",
  "language": "en",
  "order": 30,
  "engine": "postgres",
  "entry": "index.html",
  "tags": ["6 chapters", "20 exercises"],
  "materials": [{ "label": "Cheat sheet (PDF)", "file": "materials/cheatsheet.pdf" }],
  "i18n": {
    "es": { "title": "Funciones de ventana", "subtitle": "…", "tags": ["6 capítulos", "20 ejercicios"], "materials": ["Hoja de referencia (PDF)"] },
    "pt": { "title": "Funções de janela" }
  },
  "database": {
    "schemas": ["window_fns"],
    "datasets": [
      { "name": "window_fns", "check": "window_fns.sales", "scripts": ["db/01_dataset.sql"] }
    ]
  }
}
```

| Key | Required | Meaning |
|---|---|---|
| `id` | no | Must equal the folder name if present. |
| `title` | **yes** | Card title and switcher label (in the course's own `language`). |
| `engine` | **yes** | `python`, `postgres` or `none` (see `engine/runners/__init__.py`). |
| `subtitle`, `description` | no | Card text. |
| `language` | no | The language the course was written in, e.g. `en` or `pt-BR`. |
| `order` | no | Card position, ascending (default 100). The shipped courses use 10 and 20. |
| `entry` | no | Entry page inside the folder (default `index.html`). |
| `tags` | no | Short facts shown on the card. |
| `materials` | no | Downloads linked from the card. Files must exist in the course folder. |
| `database` | postgres only | `schemas` shown in the schema browser; `datasets` loaded by the engine. |
| `i18n` | no | Card text per top-bar language (`en`, `es`, `pt`): `title`, `subtitle`, `description`, `tags`, and `materials` (one label per item). Missing keys fall back to the fields above. |

Unknown keys are rejected, so typos show up in `--check`.

---

## The page contract

The page can be anything from a single file to a generated book. The hub injects four things at
the end of its head element: the shared stylesheet `/hub/theme.css`, `window.LAB_TOKEN`,
`window.COURSE`, and the top-bar script. The top bar is added as the first element of `<body>`
(48px, `var(--th-bar-h)`): brand, "All courses", the course switcher, the theme picker
(dark, light, dracula) and the EN | ES | PT language toggle. A page follows five rules:

1. **Call the engine with relative URLs**: `fetch('api/executar')`, never `fetch('/api/executar')`.
   The page is served at `/t/<id>/`, so relative URLs reach `/t/<id>/api/executar`.
2. **Send the token** on every API call: header `X-Lab-Token: window.LAB_TOKEN`. Without it the
   hub answers 403.
3. **Report progress** whenever it changes: `window.COURSE.progress(done, total)`. The home page
   shows it on the card. Guard it (`if (window.COURSE && COURSE.progress)`) so the page still opens
   from disk.
4. **Use the shared theme and language.** Colour everything with the `--th-*` tokens from
   `engine/web/theme.css` (they change with the theme picker) and the font `var(--th-mono)`. Leave room
   for the top bar: the page sits below it, so a full-height layout uses
   `calc(100dvh - var(--th-bar-h))`. Read `window.COURSE.lang` (`'en'`, `'es'` or `'pt'`) once at start-up
   and show the UI and content in that language; `COURSE.t({en, es, pt})` picks a string. Changing the
   language reloads the page. The shipped courses keep content per language in `content/`
   (`content/<lang>.json`, or `content/<lang>/` for the Data Architecture chapters).
   [`TRANSLATING.md`](TRANSLATING.md) explains how those files are produced and kept up to date.
5. **Prefix your own `localStorage` keys** with the course id. Every course shares one origin
   (`127.0.0.1:8765`), so a generic key like `progress` would collide. The hub's own keys start with
   `trails-hub:`.

`window.COURSE` contains `{id, title, titles, engine, language, lang, theme, home, courses: [{id, title,
titles, url}]}` (`titles` maps each language to the title from `i18n`), plus `progress()` and `t()`.
The theme is on `<html data-theme>` and changes trigger the existing `trails:theme` event.

Any other file in the course folder is served as-is at `/t/<id>/<path>` (images, CSS, JS, PDFs).
Dotfiles are not served.

---

## Engine APIs

All paths are relative to the course page. Field names are in Portuguese because the first two
courses were built with them; they are the stable contract.

### `python`

Runs the code in a new process of the Python that runs the hub (3.15 in Docker), with the course's
workspace folder as the current directory and a 15 s limit.

`POST api/executar`

| Request field | Meaning |
|---|---|
| `codigo` | the code to run |
| `verificacao` | optional: code run afterwards in the same namespace, typically `assert`s |
| `entradas` | optional: list of strings returned by successive `input()` calls |
| `argv` | optional: list placed in `sys.argv[1:]` |
| `depurar` | optional: `true` records every line for the step debugger |

Response: `status` (`ok`, `erro`, `falhou` when a check failed, `saida` on non-zero exit),
`assercao` (the failed assertion message), `saida` (list of `[stream, text]`, where stream is
`out`, `err` or `tb`), `vars` (`[name, type, repr]`), `passos` (debugger steps), `cortado`.

`GET api/status` returns `{versao, executavel, pasta}`.

### `postgres`

Runs the SQL through `psql` inside a transaction that is rolled back at the end, so learners can
`INSERT`, `UPDATE` and `DELETE` freely. Statement timeout 15 s. `\d`-style meta-commands work;
`\!`, `\copy`, `\o`, `\i` and similar are blocked.

`POST api/executar`

| Request field | Meaning |
|---|---|
| `sql` | one or more statements |
| `explicar` | optional: run `EXPLAIN (ANALYZE, BUFFERS)` on the last statement |
| `esperado` | optional: a reference query; the response then has `verificacao: {ok, motivo}` |
| `ordenado` | optional: with `esperado`, row order must match too |
| `persistir` | optional: commit instead of rolling back (avoid in exercises) |

Response: `ok`, `resultados` (one per statement: `colunas`, `linhas`, `tag`), `erro`
(`mensagem`, `linha` in the submitted text), `comandos`, and `verificacao` when requested.

`GET api/status` returns `{postgres, erro}`. `GET api/esquema` returns the tables and columns of
the schemas listed in `database.schemas`.

### `none`

No API. Use it for reading-only courses.

---

## Databases (postgres courses)

Every postgres course shares one database (`loja` in Docker Compose). The engine owns loading:
at start-up, and again whenever the course is opened while data is missing, it checks each dataset's
`check` relation with `to_regclass()`. If the relation does not exist, it runs the dataset's
`scripts`, in order, in **one transaction** (`psql --single-transaction`). So:

- **Use your own schema.** `CREATE SCHEMA IF NOT EXISTS my_course;` and qualify every object
  (`my_course.sales`). Never create objects in `public`; that belongs to the SQL course.
- **No `BEGIN`/`COMMIT` in the scripts.** The engine wraps the dataset in a transaction; a failed
  script leaves nothing half-loaded.
- **The `check` relation must be created by the dataset**, ideally the last table it fills.
- **Changing a dataset that is already loaded:** the engine will not reload it, because the check
  relation exists. Either drop the schema (`DROP SCHEMA my_course CASCADE;` in any SQL client, then
  restart the hub) or reset everything with `docker compose down -v`.
- **Unqualified names:** the SQL course sets the database `search_path` to `public, marketplace`.
  Do not change it in your dataset; qualify your names, or set the path inside your exercise SQL
  (`SET search_path = my_course, public;` only lasts for that run).

---

## Adding a new engine

An engine is a `Runner` subclass. To add, for example, a Node.js or SQLite engine:

1. Create `engine/runners/node_runner.py`:

   ```python
   import subprocess
   from http import HTTPStatus
   from .base import Runner

   class NodeRunner(Runner):
       engine = 'node'
       label = 'Node.js'

       def health(self):
           try:
               v = subprocess.run(['node', '--version'], capture_output=True, text=True, timeout=5).stdout.strip()
               return {'ready': True, 'label': f'Node {v}', 'hint': None}
           except (OSError, subprocess.TimeoutExpired):
               return {'ready': False, 'label': 'Node offline', 'hint': 'Install Node.js or add it to the Dockerfile.'}

       def handle(self, method, action, payload):
           if method == 'POST' and action == 'executar':
               proc = subprocess.run(['node', '-e', payload.get('codigo', '')], capture_output=True,
                                     text=True, timeout=15, cwd=self.settings.workspace)
               return HTTPStatus.OK, {'status': 'ok' if proc.returncode == 0 else 'erro',
                                      'saida': [['out', proc.stdout], ['err', proc.stderr]]}
           return super().handle(method, action, payload)
   ```

2. Register it in `engine/runners/__init__.py`: `RUNNERS['node'] = NodeRunner`.
3. Install what it needs in the `Dockerfile` (here `apt-get install -y nodejs`), then
   `docker compose up -d --build`. If it needs its own server (another database, say), add a
   service to `docker-compose.yml` and pass its address to the `lab` service as an environment
   variable, the way `LAB_PG_URL` is passed.
4. Use `"engine": "node"` in a course.

The contract (`engine/runners/base.py`):

| Method | Called | Must |
|---|---|---|
| `start()` | once, at hub start-up | not block for long, never raise |
| `health()` | on every home page load | return `{ready, label, hint}` quickly |
| `handle(method, action, payload)` | on `GET/POST /t/<id>/api/<action>` | return `(http_status, json_dict)` |

Each course gets its own runner instance, so per-course state (a work folder, loaded datasets) lives
on `self`. `self.course` is the parsed manifest and `self.settings` the engine-wide settings.

---

## Checklist

- [ ] `python engine/hub.py --check` lists the course as `ok`
- [ ] The page opens from the home card, under the top bar, and looks right in dark, light and dracula
- [ ] UI text (and content, if translated) follows the EN | ES | PT toggle
- [ ] API calls use relative paths and send `X-Lab-Token`
- [ ] Progress moves on the home card after solving something
- [ ] `localStorage` keys start with the course id
- [ ] Postgres: own schema, no `BEGIN`/`COMMIT`, `check` created by the dataset
- [ ] `python -m unittest discover -s tests` still passes
