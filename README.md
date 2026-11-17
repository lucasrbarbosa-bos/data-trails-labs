# Trails Lab

Hands-on learning trails served by one local engine. The home page lists the trails;
each one is independent, so you can open any of them, switch between them from inside a
trail, and come back to where you left off.

| Trail | Engine | What it covers |
|---|---|---|
| **Python Moderno** (`trails/python`) | Python 3.15 | 17 chapters + 2 annexes, 89 examples, 12 challenges, step-by-step debugger. Content in Portuguese, English and Spanish. |
| **SQL Moderno** (`trails/sql`) | PostgreSQL 17 | 9 chapters, 51 examples, 19 challenges, query plans, Snowflake and BigQuery variants, the creator marketplace interview case (chapter 8, in English), dbt and SQLMesh. Content in Portuguese, English and Spanish (chapter 8 is English in all three). |
| **Data Architecture** (`trails/data-architecture`) | none (reading) | 10 parts, 50 chapters: fundamentals, modelling, data layers, ingestion (batch, CDC, micro-batching, real time), Apache Iceberg, Snowflake, orchestration and open-source frameworks, semantic models, ten reference architectures and three case studies. Checkpoint quizzes. Content in English, Spanish and Portuguese. |

Every page shares one top bar with a **theme picker** (dark, light, dracula) and an **EN | ES | PT**
language toggle; both are remembered in the browser and apply to the home page and every trail.
Translated content lives in each trail's `content/` folder; code, exercise ids and checks are the same
in every language, so progress carries over when you switch. To translate content you changed, see
[`docs/TRANSLATING.md`](docs/TRANSLATING.md) (`python tools/i18n.py status`). The Python and SQL trails also ship their
book as a PDF in Portuguese (link on each card). The Data Architecture
chapters live in `trails/data-architecture/content/` as one JSON file per chapter.

**Online:** a static copy runs at https://lucasrbarbosa-bos.github.io/data-trails-labs/, rebuilt on every
merge to `main`. Data Architecture works fully there and Python exercises run in the browser (Brython);
SQL is read-only online. For everything, including real Python 3.15, PostgreSQL 17 and the debugger,
run the lab locally as below.

---

## Run it with Docker (recommended)

You need **Docker Desktop** (Windows/macOS) or Docker Engine with the Compose plugin (Linux).

```bash
docker compose up -d --build
```

Open **http://127.0.0.1:8765**. The first start downloads the images and loads the SQL
datasets, so give it a minute; after that it starts in seconds.

```bash
docker compose logs -f lab     # see what the engine is doing
docker compose stop            # stop (data is kept)
docker compose down -v         # remove everything, including the database volume
```

What starts:

| Service | Image | Port on your machine | Role |
|---|---|---|---|
| `lab` | built from `Dockerfile` (Python 3.15 + psql) | `127.0.0.1:8765` | the hub: home page, every trail, every engine |
| `postgres` | `postgres:17` | `127.0.0.1:5433` | database for trails with `"engine": "postgres"` |

Both ports are published on `127.0.0.1` only. To change them, copy `.env.example` to `.env`.
You can also connect DBeaver, VS Code or a local `psql` to `localhost:5433`, database `loja`,
user `lab`, password `lab`.

## Run it without Docker

The hub only needs **Python 3.10 or newer** (standard library, nothing to install).

```bash
python engine/hub.py          # Windows: py engine/hub.py   ·   uv: uv run engine/hub.py
```

The browser opens at http://127.0.0.1:8765. The Python trail runs with **your** Python, so
features from 3.14/3.15 work only if your Python has them.

The SQL trail needs a PostgreSQL server. Pick one:

1. **Database in Docker, hub on your machine** (no local `psql` needed):
   ```bash
   docker compose up -d postgres
   python engine/hub.py
   ```
   The hub reaches the database with `docker exec sql-lab-postgres psql ...`.
2. **A PostgreSQL you already have** (needs `psql` on your PATH):
   ```bash
   # macOS / Linux
   LAB_PG_URL=postgresql://user:password@localhost:5432/loja python engine/hub.py
   ```
   ```powershell
   # Windows PowerShell
   $env:LAB_PG_URL = "postgresql://user:password@localhost:5432/loja"; py engine/hub.py
   ```
   The datasets are loaded into that database (schemas `public` and `marketplace`).

If no database is reachable, the Python trail still works and the SQL card on the home page
says what to start.

---

## How it works

```
 browser ──► http://127.0.0.1:8765
              │
              ▼
        engine/hub.py ─────────────── reads trails/*/trail.json at start-up
              │
   /                 home page (engine/web/home.html)
   /api/trails       trails + engine health, for the home page
   /t/<id>/          trail page, with the hub script injected (token, switcher, progress)
   /t/<id>/api/...   that trail's engine
              │
     ┌────────┴──────────┐
     ▼                   ▼
 PythonRunner        PostgresRunner ──► psql ──► postgres:17
 (subprocess per run,  (one transaction per run, rolled back;
  15 s limit,           loads each trail's datasets when missing)
  debugger)
```

- **One engine, many trails.** A trail is a folder with a `trail.json` and an HTML page.
  The manifest names the engine (`python`, `postgres` or `none`); the hub creates a runner
  for it and mounts the trail at `/t/<id>/`.
- **Pages talk to the engine through relative URLs** (`api/executar`), so the same page works
  under any mount point.
- **Security:** the hub binds to `127.0.0.1`, generates a secret token at each start, injects it
  into the pages it serves, and rejects API calls without it or from another origin. Code runs
  with your user's permissions (inside the container, as an unprivileged user), with a time limit.
- **SQL datasets are loaded by the engine,** not by Docker's first-boot scripts. For each dataset
  in a trail's manifest, the engine checks one table with `to_regclass()` and loads the scripts
  if it is missing. A database volume created earlier therefore picks up new datasets without a reset.
- **Progress** lives in the browser (`localStorage`), per trail. Clearing site data resets it.
- **Files created by exercises** go to `workspace/<trail-id>/`.

## Repository layout

```
.
├── docker-compose.yml        lab + postgres
├── Dockerfile                engine image: Python 3.15 + PostgreSQL client
├── engine/
│   ├── hub.py                the server (entry point)
│   ├── trails.py             trail.json discovery and validation
│   ├── runners/              one engine per file + registry in __init__.py
│   │   ├── base.py           Runner contract and Settings
│   │   ├── python_runner.py  + python_executor.py (the per-run sandbox process)
│   │   └── postgres_runner.py
│   └── web/
│       ├── home.html         home page
│       └── trail-hub.js      injected into every trail page
├── trails/
│   ├── python/               trail.json, index.html, materials/
│   ├── sql/                  trail.json, index.html, materials/, db/*.sql
│   └── _template/            starting point for new trails (hidden from the home page)
├── tools/new_trail.py        creates a trail from the template
├── tools/i18n.py             keeps the translated content in step (docs/TRANSLATING.md)
├── tools/build_static.py     static copy of the lab for GitHub Pages (docs/MAINTAINING.md)
├── i18n/                     which source text each translation was made from
├── tests/test_engine.py      python -m unittest discover -s tests
├── docs/ADDING_A_TRAIL.md    how to add trails and engines
└── workspace/                files created by exercises (git-ignored)
```

## Configuration

Every flag has an environment variable, which is what Docker Compose uses.

| Flag | Environment | Default | Meaning |
|---|---|---|---|
| `--host` | `LAB_HOST` | `127.0.0.1` | address to bind (`0.0.0.0` inside Docker) |
| `--port` | `LAB_PORT` | `8765` | port |
| `--no-browser` | `LAB_NO_BROWSER=1` | off | do not open the browser |
| `--pg-url` | `LAB_PG_URL` | unset | `psql` connection URL for postgres trails |
| `--pg-container` | `LAB_PG_CONTAINER` | `sql-lab-postgres` | container used with `docker exec` when no URL is set |
| `--trails-dir` | `LAB_TRAILS_DIR` | `trails/` | where trails are discovered |
| `--workspace` | `LAB_WORKSPACE` | `workspace/` | where exercises may write files |
| `--check` | | | validate every `trail.json` and exit (non-zero on errors) |

## Adding a trail

```bash
python tools/new_trail.py my-trail --title "My Trail"                 # Python engine
python tools/new_trail.py window-fns --title "Window Functions" --engine postgres
```

Then edit the new folder, restart the hub (`docker compose restart lab`, or Ctrl+C and
`python engine/hub.py`), and the trail appears on the home page. The full guide, including the
page contract, the engine APIs, datasets and how to add a new engine, is in
[`docs/ADDING_A_TRAIL.md`](docs/ADDING_A_TRAIL.md).

## Tests

```bash
python -m unittest discover -s tests -v
# also run the PostgreSQL tests against the Docker database:
LAB_TEST_PG_URL=postgresql://lab:lab@localhost:5433/loja python -m unittest discover -s tests -v
```

## Troubleshooting

**`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`** (Windows):
Docker Desktop is not running. Start it, wait until it says "Engine running", and try again.

**`Conflict. The container name "/sql-lab-postgres" is already in use`:** the database container
from the older standalone SQL lab still exists. In that old folder run `docker compose down`,
or remove it with `docker rm -f sql-lab-postgres`. (Its volume is separate; this repo creates its own.)

**`Cannot listen on 127.0.0.1:8765`:** something else uses the port, often the older standalone
Python lab. Stop it, or use `--port 8780` (Docker: set `LAB_PORT=8780` in `.env`).

**The SQL card says "PostgreSQL offline":** start the database (`docker compose up -d postgres`)
and reload the home page. The trail retries the connection and loads missing datasets on its own.

**The home page says "The engine did not answer" after a restart:** the token changes at every
start. Reload the page.

**Exercise files are not in `workspace/` (Linux + Docker):** the container user has uid 1000. If
your user has another uid it cannot write to the folder, so the engine falls back to a temporary
folder inside the container (it says so in `docker compose logs lab`). Fix with
`sudo chown -R 1000 workspace`, or run the hub without Docker.

**Fonts look different offline:** pages use Google Fonts when online and fall back to system fonts.

## Contributing

Every change reaches `main` through a pull request that passes the checks in
`.github/workflows/pr-checks.yml`. Branch names (`feature/<area>/<description>`, `trail/…`,
`content/…`, `i18n/…`, `fix/…`), PR titles (`feat(engine): …`) and the local checks are in
[CONTRIBUTING.md](CONTRIBUTING.md). Maintainer settings are in [docs/MAINTAINING.md](docs/MAINTAINING.md).

## License

This repository has two licenses: one for the software, one for the course content.

| What | License | File |
|---|---|---|
| **Software**: `engine/`, `tools/`, `tests/`, the trail pages (`trails/*/index.html`), `trails/_template/`, `.github/`, `Dockerfile`, `docker-compose.yml` | GNU Affero General Public License v3.0 only (**AGPL-3.0-only**) | [LICENSE](LICENSE) |
| **Course content**: `trails/*/content/`, `trails/*/materials/` (PDF books), `trails/*/db/` (datasets), `trails/*/trail.json`, `docs/`, `i18n/` | Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (**CC BY-NC-SA 4.0**) | [LICENSE-CONTENT](LICENSE-CONTENT) |

In short: you may use, study, change and share the software, including commercially, as long as you
publish your changes under the AGPL, also when you only run them as a website. You may use and adapt
the course content for non-commercial purposes, with attribution and under the same license.
Commercial use of the content, or of the software under other terms, needs permission from the
copyright holder.

Third-party components keep their own licenses: Brython (BSD-3-Clause) and the JetBrains Mono font
(SIL Open Font License 1.1) are loaded from public CDNs at run time; the Docker images use the
`python` and `postgres` official images.
