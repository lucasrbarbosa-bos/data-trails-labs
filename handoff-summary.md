# Handoff summary: Python/SQL course labs, interview prep, PII architecture

Paste this into the new chat. Attach `trails-lab.zip` if you want Claude to keep working on the code. The other files listed below exist only in the old chat's outputs, so attach any of them you need.

## How I want Claude to work (important)
- Follow requirements literally. Don't swap in a different approach or build things I didn't ask for. Example: I asked for a SQLMesh-only PII design and got Terraform; I asked how to connect Claude to a local folder and got a whole repo built.
- When reviewing my practice SQL queries, review and rank them. Don't write the solutions for me.
- Refer to teams, not named individuals, when talking about mistakes or responsibility.
- Course content is in Brazilian Portuguese, except SQL chapter 8 (the marketplace case), which stays in English.

## 1. Deliverables produced so far
| File | What it is |
|---|---|
| `trails-lab.zip` | **Current main project** (details in section 2) |
| `Python Moderno - Apostila Completa.pdf` | New Python book: 17 chapters + 2 annexes, ~97 pages, Python 3.15 |
| `SQL Moderno - Parte 1.pdf` | SQL book: 9 chapters, ~76 pages; PostgreSQL with Snowflake/BigQuery variants |
| `python-moderno-lab.zip`, `sql-moderno-lab.zip` | Older standalone labs (replaced by trails-lab) |
| `Curso Python - Caderno de Atualizacao 3.15.pdf`, `Curso Python - Anexo de Projetos.pdf`, `projetos-curso-python.zip` | First pass: update notes on my original Python course PDF (`curso-python-versao-1_1.pdf`), plus a projects annex |
| Published artifact "Python Moderno" (claude.ai) | Interactive Python lab |
| Published artifact "PII BigQuery" (claude.ai) | PII redaction architecture: a full-platform option and a small-company SQLMesh-only option |

## 2. trails-lab (current project)
One repository that combines the Python and SQL labs under a shared engine and a single Docker Compose setup.

**Run it:** `docker compose up -d --build`, then open http://127.0.0.1:8765. Without Docker: `python engine/hub.py` (needs Python 3.10+, standard library only).

**Layout**
```
docker-compose.yml   services: lab (built from Dockerfile: python:3.15-slim + postgresql-client, port 127.0.0.1:8765)
                     and postgres (postgres:17, container_name sql-lab-postgres, db loja, user/pass lab, port 127.0.0.1:5433)
engine/hub.py        single stdlib HTTP server. Routes: / (home), /api/trails, /hub/<file>,
                     /t/<id>/ (trail page with injected scripts), /t/<id>/api/<action>, /t/<id>/<file>
engine/trails.py     discovers trails/*/trail.json; folders starting with "_" are ignored; validates manifests
engine/runners/      base.py (Runner: start/health/handle, Settings), python_runner.py + python_executor.py,
                     postgres_runner.py, registry in __init__.py (python | postgres | none)
engine/web/          home.html (roadmap.sh-style: dark, monospace, cards with progress bars), trail-hub.js, favicon.svg
trails/python/       trail.json, index.html (the lab), materials/ PDF
trails/sql/          trail.json, index.html, materials/ PDF, db/01_esquema.sql 02_dados.sql 03_marketplace.sql
trails/_template/    starter trail that works with any engine (python or SQL exercises)
tools/new_trail.py   python tools/new_trail.py <id> [--title] [--engine python|postgres|none] [--language]
tests/test_engine.py python -m unittest discover -s tests   (Postgres tests need LAB_TEST_PG_URL)
docs/ADDING_A_TRAIL.md, README.md, .env.example, .gitignore, .gitattributes, .dockerignore, workspace/
```

**Key design decisions**
- Security: a secret token is generated at each start, injected as `window.LAB_TOKEN`, and required in the `X-Lab-Token` header. The API also requires same-origin requests and binds to 127.0.0.1 only.
- Page contract:
  - call the API with relative URLs (`api/executar`);
  - send the token header;
  - call `window.TRAIL.progress(done, total)` when progress changes;
  - leave a `<div data-trail-hub>` slot for the "All trails" link and switcher;
  - prefix `localStorage` keys with the trail id (the hub uses `trails-hub:progress:<id>` and `trails-hub:last:<id>`).
- Datasets are loaded by the engine, not by Docker's init folder. Each dataset has a `check` relation tested with `to_regclass`. If it's missing, the engine runs the scripts in one transaction (`psql --single-transaction`), so scripts must not contain BEGIN/COMMIT. Loading is lazy: the engine retries when Postgres becomes reachable.
- Postgres engine: each run happens inside BEGIN…ROLLBACK, with `\echo @@LAB:n@@` markers, `--csv` output, a 15s statement timeout, and dangerous meta-commands blocked. The page uses Portuguese field names (sql, explicar, esperado, ordenado, persistir → ok, resultados, erro, verificacao).
- Python engine: runs each request in a subprocess with a 15s limit, records `sys.settrace` steps for the debugger, and works inside `workspace/<id>`. If that folder isn't writable, it falls back to a temp folder. Fields: codigo, verificacao, entradas, argv, depurar → status, saida, vars, passos.
- The `sql-lab-postgres` container name was kept so the book's `docker exec` commands still work. It will clash with the old standalone SQL lab if that is still running.

**Testing done:** 21 unit tests pass, including against a real Postgres. In the browser: all 12 Python challenges pass and their starter code is rejected. The 9 SQL challenges that have solutions check correctly. The debugger, query plans, schema browser, switcher, scaffolded trails and home page progress all work.

**Not yet verified:** the actual Docker image build and `docker compose up` (Docker wasn't available in that sandbox). The zip has no `.git`; run `git init` before pushing.

## 3. SQL interview prep: creator marketplace (PostgreSQL)
Schema `marketplace` (it's chapter 8 of the SQL trail):
- creators(creator_id, name, country, signup_date)
- samples(sample_id, creator_id, title)
- licenses(license_id, sample_id, price, purchase_date)
- creator_payouts(payout_id, creator_id, license_id, amount, status: paid / pending / failed)

Traps in the data: two creators are both named "Nova"; license 1004 has a failed and then a paid payout; creators 5 and 6 have no sales; payouts have no date column.

- Steps 1–4 are DONE. Expected result for step 4: 6 rows with totals (1: 3 purchases, 25.00 paid), (2: 2, 35.00), (3: 1, 7.50), (4: 2, 12.50), (5: 0, 0), (6: 0, 0).
- Practice steps 5–14 are TO DO and ship without solutions on purpose:
  - Part A: row_number, first purchase, rank vs dense_rank
  - Part B: lag, average gap, lead
  - Part C: running totals, trailing 30-day range frames
  - Part D: date_trunc + lag + generate_series; payout attempts
- Lessons from the review:
  - the driving table goes on the left;
  - aggregate each fact per creator in its own CTE;
  - put the status filter inside the CTE;
  - use leading commas;
  - partition by creator_id, never by name;
  - Postgres has no QUALIFY;
  - add tie-breakers so ordering is deterministic.
- An earlier review fix: in step 8, licenses must drive the join. Otherwise it returns 10 rows instead of 8.
- Lag drills: treino 1 and 2 are done. **Treino 3 (previous payout attempt's status per license) was never submitted.**

## 4. PII redaction case (BigQuery), for the Platform Engineer interview
Tables: `raw_users` (Fivetran, one row per change, with `updated_at` and `_fivetran_synced`) and `erasure_requests` (`completed_at` is NULL while a request is open).

Questions and review notes:
- Q1, latest version of each user: filter out NULL user_id; order by `updated_at desc, _fivetran_synced desc`.
- Q2, users with a completed erasure who still have PII: check every history row → u1, u2, u3, u6, u7.
- Q4, rows with PII where the previous row had none: lag a boolean so each user's first row doesn't count; use `timestamp_diff(later, earlier, DAY)` → u1 (224 days) and u6 (92 days).

Architecture discussed:
- BigQuery: column data policies (masking), row access policies, `GRANT FINE_GRAINED_READ`.
- SQLMesh: before_all/after_all statements, post-statements, audits, linter.
- dbt: incremental models with post_hook erasure; the snapshots trap; `cluster_by user_id`.
- The artifact has two options: a full platform, and a small-company SQLMesh-only option. Targeted tokenize/delete was also covered.

## 5. Possible next steps
- Run `docker compose up -d --build` on my machine and fix anything that breaks there.
- Review my answers for marketplace steps 5–14 and lag treino 3 (review only, no solutions).
- Add new trails with `tools/new_trail.py`.
