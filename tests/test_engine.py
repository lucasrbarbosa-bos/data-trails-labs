"""Engine tests. Standard library only:

    python -m unittest discover -s tests -v

The PostgreSQL tests run only when LAB_TEST_PG_URL points at a database you can
write to (the datasets are loaded into it), for example the one from Docker Compose:

    LAB_TEST_PG_URL=postgresql://lab:lab@localhost:5433/loja python -m unittest discover -s tests -v
"""
from __future__ import annotations

import contextlib
import io
import json
import os
import shutil
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'engine'))
sys.path.insert(0, str(ROOT / 'tools'))

import build_static  # noqa: E402
import hub  # noqa: E402
import i18n  # noqa: E402
import new_trail  # noqa: E402
from runners import RUNNERS, Settings  # noqa: E402
from runners.postgres_runner import PostgresRunner, compare_results, split_statements  # noqa: E402
from runners.python_runner import PythonRunner  # noqa: E402
from trails import discover, load_trail  # noqa: E402

TRAILS = ROOT / 'trails'
PG_URL = os.environ.get('LAB_TEST_PG_URL')


class ManifestTests(unittest.TestCase):
    def test_shipped_trails_are_valid(self):
        trails, errors = discover(TRAILS, set(RUNNERS))
        self.assertEqual(errors, [])
        self.assertEqual([t.id for t in trails][:2], ['python', 'sql'])

    def test_template_is_hidden(self):
        trails, _ = discover(TRAILS, set(RUNNERS))
        self.assertNotIn('_template', [t.id for t in trails])

    def test_scaffolder_creates_valid_trails(self):
        with tempfile.TemporaryDirectory() as tmp:
            for trail_id, engine in [('demo-py', 'python'), ('demo-pg', 'postgres'), ('demo-read', 'none')]:
                self.assertEqual(new_trail.main([trail_id, '--engine', engine, '--trails-dir', tmp]), 0)
                trail = load_trail(Path(tmp) / trail_id, set(RUNNERS))
                self.assertEqual(trail.engine, engine)
                page = trail.entry_path.read_text(encoding='utf-8')
                self.assertNotIn('__SCHEMA__', page)
            self.assertEqual(load_trail(Path(tmp) / 'demo-pg', set(RUNNERS)).database['schemas'], ['demo_pg'])
            self.assertFalse((Path(tmp) / 'demo-py' / 'db').exists())

    def test_bad_manifest_is_reported(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / 'broken'
            folder.mkdir()
            (folder / 'trail.json').write_text(json.dumps({'title': 'x', 'engine': 'cobol'}))
            (folder / 'index.html').write_text('<html></html>')
            trails, errors = discover(Path(tmp), set(RUNNERS))
            self.assertEqual(trails, [])
            self.assertIn('unknown engine', errors[0])

    def test_i18n_is_validated(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / 'multi'
            folder.mkdir()
            (folder / 'index.html').write_text('<html></html>')
            manifest = {'title': 'x', 'engine': 'none', 'i18n': {'es': {'title': 'equis'}}}
            (folder / 'trail.json').write_text(json.dumps(manifest))
            trail = load_trail(folder, set(RUNNERS))
            self.assertEqual(trail.titles(), {'en': 'x', 'es': 'equis', 'pt': 'x'})
            for bad, message in [({'fr': {'title': 'x'}}, 'is not one of'), ({'es': {'titulo': 'x'}}, 'may only contain')]:
                (folder / 'trail.json').write_text(json.dumps(dict(manifest, i18n=bad)))
                with self.assertRaisesRegex(Exception, message):
                    load_trail(folder, set(RUNNERS))


class TranslationTests(unittest.TestCase):
    """tools/i18n.py: generated languages are reproducible, and an edit is re-translated alone."""

    def test_generated_content_matches_a_rebuild(self):
        for trail, cfg in i18n.CONFIG.items():
            for lang in cfg['targets']:
                doc, _ = i18n.build(trail, lang)
                for path, text in doc.rendered().items():
                    self.assertEqual(path.read_text(encoding='utf-8'), text, f'{path} was edited by hand or is stale')

    def test_edit_extract_merge_cycle(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            shutil.copytree(TRAILS / 'data-architecture' / 'content', tmp / 'trails' / 'data-architecture' / 'content')
            shutil.copytree(ROOT / 'i18n', tmp / 'i18n')
            saved = i18n.TRAILS, i18n.STATE, i18n.WORK, i18n.ROOT
            i18n.TRAILS, i18n.STATE, i18n.WORK, i18n.ROOT = tmp / 'trails', tmp / 'i18n', tmp / 'i18n-work', tmp
            try:
                src = tmp / 'trails' / 'data-architecture' / 'content' / 'en' / '01-what-is-data-architecture.json'
                ch = json.loads(src.read_text(encoding='utf-8'))
                key = next(f'{ch["id"]}.b{i}.text' for i, b in enumerate(ch['blocks']) if b['t'] == 'p')
                ch['blocks'][int(key.split('.b')[1].split('.')[0])]['text'] = 'A new paragraph with 1,440 rows and `code`.'
                src.write_text(json.dumps(ch), encoding='utf-8')
                with contextlib.redirect_stdout(io.StringIO()):
                    self.assertEqual(i18n.main(['status', 'data-architecture']), 1)
                    i18n.main(['extract', 'data-architecture'])
                    chunk = json.loads((tmp / 'i18n-work/data-architecture/pt/chunk00.src.json').read_text(encoding='utf-8'))
                    self.assertEqual(list(chunk), [key])                     # only the edited string
                    for lang in ('pt', 'es'):
                        (tmp / f'i18n-work/data-architecture/{lang}/chunk00.out.json').write_text(
                            json.dumps({key: 'Um novo parágrafo com 1,440 linhas e `code`.'}), encoding='utf-8')
                    self.assertEqual(i18n.main(['check', 'data-architecture']), 0)
                    i18n.main(['merge', 'data-architecture'])
                    self.assertEqual(i18n.main(['status', 'data-architecture']), 0)
                pt = json.loads((tmp / 'trails/data-architecture/content/pt/01-what-is-data-architecture.json').read_text(encoding='utf-8'))
                texts = [b.get('text') for b in pt['blocks']]
                self.assertIn('Um novo parágrafo com 1.440 linhas e `code`.', texts)   # separators localised
            finally:
                i18n.TRAILS, i18n.STATE, i18n.WORK, i18n.ROOT = saved


class StaticSiteTests(unittest.TestCase):
    """tools/build_static.py: the GitHub Pages copy of the lab."""

    def test_build_under_a_sub_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / 'site'
            result = build_static.build(out, '/data-trails-labs/')
            self.assertEqual(result['trails'][:2], ['python', 'sql'])
            home = (out / 'index.html').read_text(encoding='utf-8')
            self.assertIn('href="/data-trails-labs/hub/theme.css"', home)
            self.assertNotIn('"/hub/', home)                              # nothing points at the site root
            self.assertIn('"url": "/data-trails-labs/t/sql/"', home)       # trail list baked in, under the base
            self.assertTrue((out / 'hub' / 'trail-hub.js').is_file())
            self.assertTrue((out / 'hub' / 'trail-base.css').is_file())
            self.assertTrue((out / '.nojekyll').is_file())
            for trail in result['trails']:
                page = (out / 't' / trail / 'index.html').read_text(encoding='utf-8')
                self.assertIn('<link rel="stylesheet" href="/data-trails-labs/hub/theme.css">', page)
                self.assertIn('<link rel="stylesheet" href="/data-trails-labs/hub/trail-base.css">', page)
                self.assertIn('"static": true', page)
                self.assertNotIn('LAB_TOKEN =', page)                      # no engine, no token
            self.assertTrue((out / 't/data-architecture/content/es/manifest.json').is_file())
            self.assertTrue((out / 't/sql/materials/sql-moderno-parte-1.pdf').is_file())
            self.assertTrue((out / 't/python/content/en.json').is_file())

    def test_base_must_be_a_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):                         # a Windows path, not a URL path
                build_static.build(Path(tmp) / 'site', 'C:/Program Files/Git/data-trails-labs/')
            build_static.build(Path(tmp) / 'site', 'data-trails-labs')     # slashes are optional
            self.assertIn('"/data-trails-labs/hub/', (Path(tmp) / 'site' / 'index.html').read_text(encoding='utf-8'))


class SqlSplitTests(unittest.TestCase):
    def test_split(self):
        sql = ("-- comment\nSELECT 1;\nSELECT 'a;b';\n\\d pedidos\n"
               "DO $$ BEGIN PERFORM 1; END $$;\nSELECT 2")
        parts = [t for _, t in split_statements(sql)]
        self.assertEqual(parts, ['SELECT 1;', "SELECT 'a;b';", '\\d pedidos',
                                 'DO $$ BEGIN PERFORM 1; END $$;', 'SELECT 2;'])

    def test_compare_ignores_order_unless_asked(self):
        a = {'resultados': [{'colunas': ['x'], 'linhas': [['1'], ['2']]}]}
        b = {'resultados': [{'colunas': ['x'], 'linhas': [['2'], ['1']]}]}
        self.assertTrue(compare_results(a, b, ordered=False)['ok'])
        self.assertFalse(compare_results(a, b, ordered=True)['ok'])


class PythonRunnerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        trail = load_trail(TRAILS / 'python', set(RUNNERS))
        self.runner = PythonRunner(trail, Settings(root=ROOT, workspace=Path(self.tmp)))
        self.runner.start()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_output_and_check(self):
        res = self.runner.execute({'codigo': 'x = 2\nprint(x * 21)', 'verificacao': 'assert x == 2'})
        self.assertEqual(res['status'], 'ok')
        self.assertEqual(res['saida'], [['out', '42\n']])

    def test_failed_check(self):
        res = self.runner.execute({'codigo': 'x = 1', 'verificacao': 'assert x == 2, "x deveria ser 2"'})
        self.assertEqual((res['status'], res['assercao']), ('falhou', 'x deveria ser 2'))

    def test_files_go_to_the_workspace(self):
        self.runner.execute({'codigo': 'open("nota.txt", "w").write("oi")'})
        self.assertTrue((Path(self.tmp) / 'python' / 'nota.txt').exists())

    def test_debugger_records_steps(self):
        res = self.runner.execute({'codigo': 'a = 1\nb = a + 1', 'depurar': True})
        self.assertGreaterEqual(len(res['passos']), 2)


class HubHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.mkdtemp()
        trails, _ = discover(TRAILS, set(RUNNERS))
        settings = Settings(root=ROOT, workspace=Path(cls.tmp),
                            pg_command=[sys.executable, '-c', 'import sys; sys.stderr.write("could not connect"); sys.exit(2)'])
        cls.hub = hub.Hub(trails, settings)
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), hub.make_handler(cls.hub))
        cls.base = f'http://127.0.0.1:{cls.server.server_address[1]}'
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def get(self, path, token=True, data=None):
        req = urllib.request.Request(self.base + path, data=data)
        if token:
            req.add_header('X-Lab-Token', hub.TOKEN)
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode('utf-8')

    def test_home_has_token(self):
        status, body = self.get('/', token=False)
        self.assertEqual(status, 200)
        self.assertIn(hub.TOKEN, body)

    def test_api_needs_token(self):
        self.assertEqual(self.get('/api/trails', token=False)[0], 403)
        self.assertEqual(self.get('/t/python/api/status', token=False)[0], 403)

    def test_listing_reports_offline_database(self):
        status, body = self.get('/api/trails')
        trails = {t['id']: t for t in json.loads(body)['trails']}
        self.assertTrue(trails['python']['health']['ready'])
        self.assertFalse(trails['sql']['health']['ready'])

    def test_trail_page_gets_context_and_relative_api(self):
        status, body = self.get('/t/sql/', token=False)
        self.assertEqual(status, 200)
        self.assertIn('window.TRAIL = {"id": "sql"', body)
        self.assertNotIn("api('/api/", body)
        self.assertIn('<link rel="stylesheet" href="/hub/theme.css">', body)   # shared themes + top bar
        self.assertIn('<link rel="stylesheet" href="/hub/trail-base.css">', body)   # shared page kit
        self.assertIn('"titles": {"en": "Modern SQL"', body)                     # switcher labels per language

    def test_theme_and_hub_script_are_served(self):
        status, css = self.get('/hub/theme.css', token=False)
        self.assertEqual(status, 200)
        for theme in ('light', 'dracula'):
            self.assertIn(f'[data-theme="{theme}"]', css)
        status, css = self.get('/hub/trail-base.css', token=False)
        self.assertEqual(status, 200)
        self.assertIn('@layer trail-base', css)          # a page's own unlayered <style> always wins
        self.assertIn(':where(.tl)', css)                # opt-in: only pages with <html class="tl">
        status, js = self.get('/hub/trail-hub.js', token=False)
        self.assertEqual(status, 200)
        self.assertIn("'trails-hub:'", js)

    def test_listing_carries_translations(self):
        trails = {t['id']: t for t in json.loads(self.get('/api/trails')[1])['trails']}
        self.assertEqual(trails['python']['i18n']['en']['title'], 'Modern Python')
        self.assertEqual(trails['data-architecture']['i18n']['pt']['title'], 'Arquitetura de Dados')

    def test_python_through_http(self):
        status, body = self.get('/t/python/api/executar', data=json.dumps({'codigo': 'print(7)'}).encode())
        self.assertEqual(json.loads(body)['saida'], [['out', '7\n']])

    def test_static_files_and_traversal(self):
        self.assertEqual(self.get('/t/sql/materials/sql-moderno-parte-1.pdf', token=False)[0], 200)
        self.assertEqual(self.get('/t/sql/%2e%2e/%2e%2e/engine/hub.py', token=False)[0], 404)
        self.assertEqual(self.get('/t/nope/', token=False)[0], 404)

    def test_injection_skips_comments(self):
        html = '<html><head><!-- before </head> --><title>x</title></head><body></body></html>'
        out = hub.inject(html, '<script>X</script>')
        self.assertIn('<title>x</title><script>X</script>', out)


@unittest.skipUnless(PG_URL, 'set LAB_TEST_PG_URL to run the PostgreSQL tests')
class PostgresTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        trail = load_trail(TRAILS / 'sql', set(RUNNERS))
        cls.runner = PostgresRunner(trail, Settings(root=ROOT, workspace=Path(tempfile.gettempdir()), pg_url=PG_URL))
        cls.runner.start()

    def test_datasets_and_search_path(self):
        res = self.runner.execute({'sql': 'SELECT count(*) FROM creators;'})
        self.assertTrue(res['ok'], res)
        self.assertEqual(res['resultados'][-1]['linhas'], [['6']])

    def test_runs_are_rolled_back(self):
        self.runner.execute({'sql': 'DELETE FROM marketplace.creator_payouts;'})
        res = self.runner.execute({'sql': 'SELECT count(*) FROM marketplace.creator_payouts;'})
        self.assertEqual(res['resultados'][-1]['linhas'], [['8']])

    def test_challenge_check(self):
        res = self.runner.execute({'sql': 'SELECT 1 AS x;', 'esperado': 'SELECT 2 AS x;'})
        self.assertFalse(res['verificacao']['ok'])

    def test_error_line(self):
        res = self.runner.execute({'sql': 'SELECT 1;\n\nSELEC 2;'})
        self.assertFalse(res['ok'])
        self.assertEqual(res['erro']['linha'], 3)


if __name__ == '__main__':
    unittest.main()
