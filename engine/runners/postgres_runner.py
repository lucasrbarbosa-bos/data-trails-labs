"""PostgreSQL engine: runs trail SQL with psql against a Postgres server.

How psql is reached, in order of preference:
  1. LAB_PG_URL / --pg-url   -> `psql <url>` (inside Docker Compose this points at the
                                "postgres" service; locally you need psql installed)
  2. otherwise               -> `docker exec -i sql-lab-postgres psql -U lab -d loja`
                                (the container from docker-compose.yml; no local psql needed)

Each run happens inside a transaction that is rolled back at the end, so INSERT,
UPDATE and DELETE never damage the shared database.

Datasets: a trail lists them in trail.json under "database.datasets". At start-up
(and again later if the database was not reachable yet) the runner checks each
dataset's "check" relation with to_regclass() and, if it is missing, loads the
dataset's scripts in one transaction. That makes loading idempotent and lets you
add a dataset to an existing database without wiping the Docker volume.

API (relative to /t/<trail-id>/):
  GET  api/status  -> {postgres, error}
  GET  api/schema  -> {ok, tables: {table: [[column, type], ...]}, error}
  POST api/run     {sql, explain?, persist?, expected?, ordered?}
                   -> {ok, results, error, statements, check?}
"""
from __future__ import annotations

import csv
import io
import re
import shutil
import subprocess
import threading
from http import HTTPStatus
from urllib.parse import urlsplit

from .base import Runner

TIMEOUT = 20            # seconds for a lab run
LOAD_TIMEOUT = 180      # seconds for loading a dataset
NULL_MARK = '∅NULL∅'
MARKER = '@@LAB:{}@@'
COMMAND_TAG = re.compile(
    r'^(INSERT \d+ \d+|UPDATE \d+|DELETE \d+|MERGE \d+|SELECT \d+|COPY \d+|CREATE \w+( \w+)?|DROP \w+|'
    r'ALTER \w+|TRUNCATE TABLE|BEGIN|COMMIT|ROLLBACK|SET|RESET|ANALYZE|VACUUM|DO|COMMENT|GRANT|REVOKE|'
    r'SAVEPOINT|RELEASE|DISCARD \w+|PREPARE|EXECUTE|DEALLOCATE( ALL)?|REFRESH MATERIALIZED VIEW|CALL)$')
BLOCKED_META = re.compile(r'^\\(!|copy|o|w|i|ir|include|cd|setenv|g\s*\|)', re.I)
UNREACHABLE = ('could not connect', 'No such container', 'is not running', 'Cannot connect to the Docker daemon',
               'dockerDesktopLinuxEngine', 'error during connect', 'Connection refused',
               'could not translate host name', 'the database system is starting up')


# ---------------------------------------------------------------- statement splitting
def split_statements(sql: str) -> list[tuple[int, str]]:
    """Split text into statements, respecting quotes, comments and $tag$ bodies.

    Returns [(1-based start line, statement text)]. Lines starting with a backslash
    (psql meta-commands such as \\d) become statements of their own.
    """
    statements, i, n = [], 0, len(sql)
    start, buf = None, []

    def close():
        nonlocal start, buf
        text = ''.join(buf).strip()
        if text:
            statements.append((start, text))
        start, buf = None, []

    def line_of(pos):
        return sql.count('\n', 0, pos) + 1

    while i < n:
        c = sql[i]
        if start is None:
            if c.isspace():
                i += 1
                continue
            if sql.startswith('--', i):                       # comment before a statement
                end = sql.find('\n', i)
                i = n if end == -1 else end + 1
                continue
            start = line_of(i)
            if c == '\\':                                     # meta-command: runs to end of line
                end = sql.find('\n', i)
                end = n if end == -1 else end
                buf.append(sql[i:end])
                i = end
                close()
                continue
        if sql.startswith('--', i):
            end = sql.find('\n', i)
            end = n if end == -1 else end
            buf.append(sql[i:end]); i = end
        elif sql.startswith('/*', i):
            end = sql.find('*/', i + 2)
            end = n if end == -1 else end + 2
            buf.append(sql[i:end]); i = end
        elif c in ("'", '"'):
            j = i + 1
            while j < n:
                if sql[j] == c:
                    if j + 1 < n and sql[j + 1] == c:
                        j += 2
                        continue
                    break
                j += 1
            buf.append(sql[i:j + 1]); i = j + 1
        elif c == '$' and (m := re.match(r'\$([A-Za-z_]\w*)?\$', sql[i:])):
            tag = m.group(0)
            end = sql.find(tag, i + len(tag))
            end = n if end == -1 else end + len(tag)
            buf.append(sql[i:end]); i = end
        elif c == ';':
            buf.append(';'); i += 1
            close()
        else:
            buf.append(c); i += 1
    if buf:
        text = ''.join(buf).strip()
        if text and not text.endswith(';') and not text.startswith('\\'):
            buf.append(';')
        close()
    return statements


# ---------------------------------------------------------------- psql output parsing
def parse_output(stdout: str, stderr: str, total: int) -> dict:
    results, current, lines = [], None, []

    def close_block():
        if current is None:
            return
        text = list(lines)
        while text and text[-1] == '':
            text.pop()
        tag = text.pop() if text and COMMAND_TAG.match(text[-1]) else None
        result = {'statement': current, 'tag': tag}
        if text:
            rows = list(csv.reader(io.StringIO('\n'.join(text))))
            result['columns'] = rows[0]
            result['rows'] = [[None if v == NULL_MARK else v for v in row] for row in rows[1:]]
        results.append(result)

    for line in stdout.split('\n'):
        m = re.fullmatch(r'@@LAB:(\w+)@@', line)
        if m:
            close_block()
            current = None if m.group(1) == 'end' else int(m.group(1))
            lines = []
        elif current is not None:
            lines.append(line)
    close_block()

    error = None
    if 'ERROR:' in stderr or 'FATAL:' in stderr or (stderr.strip() and not results and total):
        message = re.sub(r'^psql:<stdin>:\d+:\s*', '', stderr.strip(), flags=re.M)
        m = re.search(r'^LINE (\d+):', message, flags=re.M)
        failed = results[-1]['statement'] if results else 0
        if results and 'columns' not in results[-1] and results[-1]['tag'] is None:
            results.pop()                                       # empty block of the failing statement
        error = {'statement': failed, 'relative_line': int(m.group(1)) if m else 1, 'message': message}
        if is_unreachable(message):
            error['message'] += ('\n\nPostgres is not reachable. Run "docker compose up -d" in the repository '
                                  'folder and wait a few seconds.')
    return {'ok': error is None, 'results': results, 'error': error}


def is_unreachable(message: str) -> bool:
    return any(s in message for s in UNREACHABLE)


def compare_results(mine: dict, expected: dict, ordered: bool) -> dict:
    def last_table(r):
        tables = [x for x in r.get('results', []) if 'columns' in x]
        return tables[-1] if tables else None
    a, b = last_table(mine), last_table(expected)
    if b is None:
        return {'ok': False, 'reason': 'the reference query returned no result (please tell the author)'}
    if a is None:
        return {'ok': False, 'reason': 'your query did not return any table'}
    if len(a['columns']) != len(b['columns']):
        return {'ok': False, 'reason': f"expected {len(b['columns'])} column(s) ({', '.join(b['columns'])}), "
                                        f"got {len(a['columns'])}"}
    if len(a['rows']) != len(b['rows']):
        return {'ok': False, 'reason': f"expected {len(b['rows'])} row(s), got {len(a['rows'])}"}
    la, lb = a['rows'], b['rows']
    if not ordered:
        key = lambda row: [('' if v is None else v) for v in row]
        la, lb = sorted(la, key=key), sorted(lb, key=key)
    for i, (x, y) in enumerate(zip(la, lb)):
        if x != y:
            return {'ok': False, 'reason': f'row {i + 1} differs: expected {y}, got {x}'
                                           + (' (order matters in this challenge)' if ordered else '')}
    return {'ok': True}


def masked(url: str) -> str:
    parts = urlsplit(url)
    if parts.password:
        return url.replace(f':{parts.password}@', ':***@', 1)
    return url


# ---------------------------------------------------------------- runner
class PostgresRunner(Runner):
    engine = 'postgres'

    def __init__(self, trail, settings):
        super().__init__(trail, settings)
        self.schemas = trail.database.get('schemas') or ['public']
        self.datasets = trail.database.get('datasets') or []
        self._datasets_ready = not self.datasets
        self._lock = threading.Lock()
        if settings.pg_command:
            self.base = list(settings.pg_command)
            self.mode = 'custom'
        elif settings.pg_url:
            self.base = ['psql', settings.pg_url]
            self.mode = 'url'
        else:
            self.base = ['docker', 'exec', '-i', settings.pg_container, 'psql', '-U', 'lab', '-d', 'loja']
            self.mode = 'docker'

    # ---- connection help shown on the home page
    def _hint(self) -> str:
        if self.mode == 'url':
            if not shutil.which('psql'):
                return 'LAB_PG_URL is set but psql is not installed here. Install the PostgreSQL client, or unset LAB_PG_URL to use Docker.'
            return f'Cannot reach {masked(self.settings.pg_url)}. Is that server running?'
        if self.mode == 'docker' and not shutil.which('docker'):
            return 'Docker was not found. Install Docker, or point LAB_PG_URL at a Postgres you already have.'
        return 'Start the database: docker compose up -d postgres'

    def describe(self) -> str:
        if self.mode == 'url':
            return masked(self.settings.pg_url)
        if self.mode == 'docker':
            return f'docker exec {self.settings.pg_container}'
        return 'custom psql command'

    # ---- low-level execution
    def run(self, statements: list[tuple[int, str]], persist: bool = False) -> dict:
        parts = ["SET statement_timeout = '15s';", "SET lc_messages = 'C';"]
        if not persist:
            parts.append('BEGIN;')
        for k, (_, text) in enumerate(statements):
            if BLOCKED_META.match(text):
                return {'ok': False, 'results': [], 'error': {'statement': k, 'message':
                        f'The meta-command {text.split()[0]} is not allowed in the lab.'}}
            parts.append(f'\\echo {MARKER.format(k)}')
            parts.append(text)
        parts.append(f'\\echo {MARKER.format("end")}')
        if not persist:
            parts.append('ROLLBACK;')
        args = self.base + ['-X', '-v', 'ON_ERROR_STOP=1', '--csv', '-P', f'null={NULL_MARK}']
        try:
            proc = subprocess.run(args, input='\n'.join(parts) + '\n', capture_output=True, text=True,
                                  encoding='utf-8', timeout=TIMEOUT)
        except FileNotFoundError:
            return {'ok': False, 'results': [], 'error': {'message': f'Could not find the command "{args[0]}". '
                                                                       + self._hint()}}
        except subprocess.TimeoutExpired:
            return {'ok': False, 'results': [], 'error': {'message': 'The run exceeded the time limit.'}}
        return parse_output(proc.stdout, proc.stderr, len(statements))

    def load_script_text(self, text: str) -> tuple[bool, str]:
        """Run a whole SQL script in one transaction (psql --single-transaction)."""
        args = self.base + ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '--single-transaction', '-f', '-']
        try:
            proc = subprocess.run(args, input=text, capture_output=True, text=True,
                                  encoding='utf-8', timeout=LOAD_TIMEOUT)
        except (FileNotFoundError, subprocess.TimeoutExpired) as e:
            return False, str(e)
        return proc.returncode == 0, proc.stderr.strip()

    def query_value(self, sql: str) -> tuple[str | None, str | None]:
        res = self.run(split_statements(sql))
        if res['ok'] and res['results'] and res['results'][-1].get('rows'):
            return res['results'][-1]['rows'][0][0], None
        return None, (res.get('error') or {}).get('message', 'no response')

    # ---- datasets
    def ensure_datasets(self) -> str | None:
        """Load missing datasets. Returns an error message, or None when all are present."""
        if self._datasets_ready:
            return None
        with self._lock:
            if self._datasets_ready:
                return None
            for ds in self.datasets:
                name, check = ds.get('name', ds['check']), ds['check']
                exists, err = self.query_value(f"SELECT to_regclass('{check}') IS NOT NULL;")
                if exists is None:
                    return err
                if exists == 't':
                    continue
                script = '\n'.join((self.trail.folder / s).read_text(encoding='utf-8') for s in ds['scripts'])
                ok, err = self.load_script_text(script)
                if not ok:
                    print(f'  [{self.trail.id}] failed to load dataset "{name}": {err[:400]}')
                    return f'failed to load the dataset "{name}": {err[:400]}'
                print(f'  [{self.trail.id}] dataset "{name}" loaded from {", ".join(ds["scripts"])}')
            self._datasets_ready = True
        return None

    # ---- runner contract
    def start(self) -> None:
        version, err = self.query_value("SELECT split_part(version(), ' ', 2);")
        if version is None:
            print(f'  [{self.trail.id}] PostgreSQL not reachable yet via {self.describe()} '
                  f'(the trail retries when opened). {self._hint()}')
            return
        print(f'  [{self.trail.id}] PostgreSQL {version} via {self.describe()}')
        self.ensure_datasets()

    def health(self) -> dict:
        version, err = self.query_value("SELECT split_part(version(), ' ', 2);")
        if version is None:
            return {'ready': False, 'label': 'PostgreSQL offline', 'hint': self._hint()}
        problem = self.ensure_datasets()
        if problem:
            return {'ready': False, 'label': f'PostgreSQL {version}', 'hint': problem}
        return {'ready': True, 'label': f'PostgreSQL {version}', 'hint': None}

    def handle(self, method, action, payload):
        if method == 'GET' and action == 'status':
            version, err = self.query_value("SELECT split_part(version(), ' ', 2) AS version;")
            if version is not None:
                err = self.ensure_datasets()
            return HTTPStatus.OK, {'postgres': version if not err else None, 'error': err}
        if method == 'GET' and action == 'schema':
            return HTTPStatus.OK, self.schema()
        if method == 'POST' and action == 'run':
            return HTTPStatus.OK, self.execute(payload or {})
        return super().handle(method, action, payload)

    def execute(self, request: dict) -> dict:
        statements = split_statements(request.get('sql', ''))
        if not statements:
            return {'ok': True, 'results': [], 'error': None, 'statements': []}
        if request.get('explain'):
            line, text = statements[-1]
            if not re.match(r'^(SELECT|WITH|VALUES|TABLE)\b', text, re.I):
                return {'ok': False, 'results': [], 'statements': [], 'error': {'message':
                        'The query plan is shown for the last statement, which must be a query (SELECT or WITH).'}}
            statements[-1] = (line, 'EXPLAIN (ANALYZE, BUFFERS) ' + text)
        res = self.run(statements, persist=bool(request.get('persist')))
        res['statements'] = [{'line': l, 'text': t[:60]} for l, t in statements]
        err = res.get('error')
        if err and 'statement' in err and err['statement'] < len(statements):
            err['line'] = statements[err['statement']][0] + err.get('relative_line', 1) - 1
        if request.get('expected') and res['ok']:
            expected = self.run(split_statements(request['expected']))
            res['check'] = compare_results(res, expected, bool(request.get('ordered')))
        return res

    def schema(self) -> dict:
        names = ', '.join("'" + s.replace("'", "''") + "'" for s in self.schemas)
        sql = f"""SELECT CASE WHEN c.table_schema = 'public' THEN c.table_name
                              ELSE c.table_schema || '.' || c.table_name END,
                         c.column_name, c.data_type
                  FROM information_schema.columns c
                  JOIN information_schema.tables t USING (table_schema, table_name)
                  WHERE c.table_schema IN ({names}) AND t.table_type = 'BASE TABLE'
                  ORDER BY array_position(ARRAY[{names}]::text[], c.table_schema::text),
                           c.table_name, c.ordinal_position;"""
        res = self.run(split_statements(sql))
        tables: dict[str, list] = {}
        if res['ok'] and res['results'] and 'rows' in res['results'][-1]:
            for table, column, kind in res['results'][-1]['rows']:
                tables.setdefault(table, []).append([column, kind])
        return {'ok': res['ok'], 'tables': tables, 'error': res.get('error')}
