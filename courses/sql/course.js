(function () {
  'use strict';
  const COURSE = window.COURSE || {};
  const LANG = ['pt', 'en', 'es'].indexOf(COURSE.lang) >= 0 ? COURSE.lang : 'pt';

  // ---------- interface strings (content comes from content/<lang>.json) ----------
  const UI = {
    pt: {
      pageTitle: 'SQL Moderno — Laboratório',
      title: 'SQL Moderno',
      brand: 'psql · laboratório',
      courseSubtitle: 'Laboratório · PostgreSQL com Snowflake e BigQuery',
      progressHeading: 'progresso',
      chaptersHeading: 'capítulos',
      progress: (f, t) => f + ' de ' + t + ' atividades concluídas',
      schema: 'Esquema da base',
      connecting: 'Conectando…',
      localOnly: 'Disponível com o servidor local.',
      checkingConnection: 'Procurando o servidor…',
      readOnly: 'Somente leitura. Para executar, abra pelo Trails Lab: docker compose up -d (veja o README)',
      engineReady: v => 'PostgreSQL ' + v + ' (Docker) · transações desfeitas a cada execução',
      engineFailed: m => 'O servidor respondeu, mas o Postgres não: rode "docker compose up -d" e recarregue. (' + m + ')',
      noResponse: 'sem resposta',
      openMenu: 'Abrir menu', navCapitulos: 'Capítulos', editorSql: 'Editor SQL', editorLeitura: 'Exemplo somente leitura',
      executionPlan: 'plano de execução', executado: 'executado',
      rowCount: n => n + (n === 1 ? ' linha' : ' linhas'), mostrando: n => ' (mostrando ' + n + ')',
      postgresOnly: 'só o PostgreSQL executa no laboratório',
      run: '▶ Executar', verificar: '✓ Verificar', plano: 'Plano de execução', restaurar: '↺ Restaurar', verSolucao: 'Ver solução',
      copy: 'Copiar para o editor', solucao: 'Solução',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> executa', atalhoDesafio: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> executa · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> verifica',
      running: 'executando…', semServidor: 'Não consegui falar com o servidor local. Ele ainda está rodando?',
      command: n => 'Comando ' + n, linha: n => 'linha ' + n, nada: 'nada a executar',
      outputFooter: ms => ms + ' ms · alterações desfeitas automaticamente (ROLLBACK)',
      passed: '✓ Resultado igual ao esperado. Desafio concluído!',
      notCompleted: m => 'Ainda não: ' + m + '.', comErro: 'a consulta terminou com erro',
      confirmSolution: 'Mostrar a solução?',
      verifiedOrder: '(a ordem das linhas é verificada)',
      practiceBadge: 'prática sem gabarito · diga em voz alta grão, partição e ordem',
      example: 'exemplo', challenge: 'desafio', practice: 'prática', chapter: (i, n) => 'capítulo ' + i + ' / ' + n,
      home: 'Início', console: 'Console livre', consoleSub: 'Um editor SQL em branco',
      consoleDescription: 'Um espaço para qualquer consulta na base da loja. Para salvar mudanças, use outra ferramenta conectada em <code>localhost:5433</code> (usuário e senha <code>lab</code>).',
      activities: n => n + (n === 1 ? ' atividade' : ' atividades'),
      howToUse: 'como usar', rotCards: 'capítulos',
      prompt: 'psql -d loja <em>-- pronto para consultar</em>',
      howTo: [
        'Todo exemplo em PostgreSQL é um editor: altere e clique em <b>▶ Executar</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>). Vários comandos podem ser executados de uma vez; cada resultado aparece separado.',
        'As abas <b>Snowflake</b> e <b>BigQuery</b> mostram a sintaxe equivalente para comparar.',
        '<b>Plano de execução</b> roda <code>EXPLAIN (ANALYZE, BUFFERS)</code> no último comando.',
        'Cada execução roda em uma transação desfeita no final: teste <code>INSERT</code>, <code>UPDATE</code> e <code>DELETE</code> à vontade.',
        'Nos desafios, <b>✓ Verificar</b> compara o seu resultado com o esperado e explica a diferença.',
        'O esquema da base fica no menu lateral, em “Esquema da base”.'
      ],
      notes: { NOTA: 'nota', 'ATENÇÃO': 'atenção', DICA: 'dica', NOVO: 'novo' },
      loading: 'carregando conteúdo…',
      contentError: 'Não foi possível carregar o conteúdo do curso.',
      openHub: 'Esta página precisa ser aberta pelo Trails Lab',
      openHubInstructions: 'Rode <code>docker compose up -d</code> na pasta do repositório e abra <code>http://127.0.0.1:8765</code>.',
      reasons: null
    },
    en: {
      pageTitle: 'Modern SQL — Lab',
      title: 'Modern SQL',
      brand: 'psql · lab',
      courseSubtitle: 'Lab · PostgreSQL with Snowflake and BigQuery',
      progressHeading: 'progress',
      chaptersHeading: 'chapters',
      progress: (f, t) => f + ' of ' + t + ' activities done',
      schema: 'Database schema',
      connecting: 'Connecting…',
      localOnly: 'Available with the local server.',
      checkingConnection: 'Looking for the server…',
      readOnly: 'Read-only. To run queries, open it through Trails Lab: docker compose up -d (see the README)',
      engineReady: v => 'PostgreSQL ' + v + ' (Docker) · every run is rolled back',
      engineFailed: m => 'The server answered, but Postgres did not: run "docker compose up -d" and reload. (' + m + ')',
      noResponse: 'no response',
      openMenu: 'Open menu', navCapitulos: 'Chapters', editorSql: 'SQL editor', editorLeitura: 'Read-only example',
      executionPlan: 'query plan', executado: 'done',
      rowCount: n => n + (n === 1 ? ' row' : ' rows'), mostrando: n => ' (showing ' + n + ')',
      postgresOnly: 'only PostgreSQL runs in the lab',
      run: '▶ Run', verificar: '✓ Check', plano: 'Query plan', restaurar: '↺ Reset', verSolucao: 'Show solution',
      copy: 'Copy to editor', solucao: 'Solution',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs', atalhoDesafio: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> checks',
      running: 'running…', semServidor: 'Could not reach the local server. Is it still running?',
      command: n => 'Statement ' + n, linha: n => 'line ' + n, nada: 'nothing to run',
      outputFooter: ms => ms + ' ms · changes rolled back automatically (ROLLBACK)',
      passed: '✓ Same result as expected. Challenge complete!',
      notCompleted: m => 'Not yet: ' + m + '.', comErro: 'the query ended with an error',
      confirmSolution: 'Show the solution?',
      verifiedOrder: '(row order is checked)',
      practiceBadge: 'practice without an answer key · say grain, partition and order out loud',
      example: 'example', challenge: 'challenge', practice: 'practice', chapter: (i, n) => 'chapter ' + i + ' / ' + n,
      home: 'Home', console: 'Free console', consoleSub: 'A blank SQL editor',
      consoleDescription: 'A place for any query against the store database. To keep changes, use another tool connected to <code>localhost:5433</code> (user and password <code>lab</code>).',
      activities: n => n + (n === 1 ? ' activity' : ' activities'),
      howToUse: 'how to use', rotCards: 'chapters',
      prompt: 'psql -d loja <em>-- ready to query</em>',
      howTo: [
        'Every PostgreSQL example is an editor: change it and click <b>▶ Run</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>). Several statements can run at once; each result is shown separately.',
        'The <b>Snowflake</b> and <b>BigQuery</b> tabs show the equivalent syntax for comparison.',
        '<b>Query plan</b> runs <code>EXPLAIN (ANALYZE, BUFFERS)</code> on the last statement.',
        'Every run happens inside a transaction that is rolled back at the end: try <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code> freely.',
        'In challenges, <b>✓ Check</b> compares your result with the expected one and explains the difference.',
        'The database schema is in the sidebar, under “Database schema”.'
      ],
      notes: { NOTA: 'note', 'ATENÇÃO': 'warning', DICA: 'tip', NOVO: 'new' },
      loading: 'loading content…',
      contentError: 'Could not load the course content.',
      openHub: 'This page must be opened through Trails Lab',
      openHubInstructions: 'Run <code>docker compose up -d</code> in the repository folder and open <code>http://127.0.0.1:8765</code>.',
      reasons: [
        [/^a consulta de referência não devolveu resultado \(avise o autor\)$/, () => 'the reference query returned no result (please tell the author)'],
        [/^sua consulta não devolveu nenhuma tabela$/, () => 'your query did not return any table'],
        [/^esperava (\d+) coluna\(s\) \((.*)\), veio (\d+)$/, m => 'expected ' + m[1] + ' column(s) (' + m[2] + '), got ' + m[3]],
        [/^esperava (\d+) linha\(s\), veio (\d+)$/, m => 'expected ' + m[1] + ' row(s), got ' + m[2]],
        [/^a linha (\d+) difere: esperava ([\s\S]*), veio ([\s\S]*?)( \(a ordem importa neste desafio\))?$/,
          m => 'row ' + m[1] + ' differs: expected ' + m[2] + ', got ' + m[3] + (m[4] ? ' (order matters in this challenge)' : '')]
      ],
      errors: [
        [/O Postgres não está acessível\. Rode "docker compose up -d" na pasta do repositório e aguarde alguns segundos\./, 'Postgres is not reachable. Run "docker compose up -d" in the repository folder and wait a few seconds.'],
        [/^A execução passou do tempo limite\.$/, 'The run exceeded the time limit.'],
        [/^O meta-comando (\S+) não é permitido no laboratório\.$/, 'The meta-command $1 is not allowed in the lab.'],
        [/^O plano de execução é mostrado para o último comando, que deve ser uma consulta \(SELECT ou WITH\)\.$/, 'The query plan is shown for the last statement, which must be a query (SELECT or WITH).']
      ]
    },
    es: {
      pageTitle: 'SQL Moderno — Laboratorio',
      title: 'SQL Moderno',
      brand: 'psql · laboratorio',
      courseSubtitle: 'Laboratorio · PostgreSQL con Snowflake y BigQuery',
      progressHeading: 'progreso',
      chaptersHeading: 'capítulos',
      progress: (f, t) => f + ' de ' + t + ' actividades completadas',
      schema: 'Esquema de la base',
      connecting: 'Conectando…',
      localOnly: 'Disponible con el servidor local.',
      checkingConnection: 'Buscando el servidor…',
      readOnly: 'Solo lectura. Para ejecutar, ábrela desde Trails Lab: docker compose up -d (consulta el README)',
      engineReady: v => 'PostgreSQL ' + v + ' (Docker) · cada ejecución se deshace',
      engineFailed: m => 'El servidor respondió, pero Postgres no: ejecuta "docker compose up -d" y recarga. (' + m + ')',
      noResponse: 'sin respuesta',
      openMenu: 'Abrir menú', navCapitulos: 'Capítulos', editorSql: 'Editor SQL', editorLeitura: 'Ejemplo de solo lectura',
      executionPlan: 'plan de ejecución', executado: 'ejecutado',
      rowCount: n => n + (n === 1 ? ' fila' : ' filas'), mostrando: n => ' (se muestran ' + n + ')',
      postgresOnly: 'solo PostgreSQL se ejecuta en el laboratorio',
      run: '▶ Ejecutar', verificar: '✓ Verificar', plano: 'Plan de ejecución', restaurar: '↺ Restaurar', verSolucao: 'Ver solución',
      copy: 'Copiar al editor', solucao: 'Solución',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> ejecuta', atalhoDesafio: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> ejecuta · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> verifica',
      running: 'ejecutando…', semServidor: 'No se pudo contactar el servidor local. ¿Sigue en ejecución?',
      command: n => 'Comando ' + n, linha: n => 'línea ' + n, nada: 'nada que ejecutar',
      outputFooter: ms => ms + ' ms · cambios deshechos automáticamente (ROLLBACK)',
      passed: '✓ El resultado coincide con el esperado. ¡Desafío completado!',
      notCompleted: m => 'Todavía no: ' + m + '.', comErro: 'la consulta terminó con un error',
      confirmSolution: '¿Mostrar la solución?',
      verifiedOrder: '(se verifica el orden de las filas)',
      practiceBadge: 'práctica sin solución · di en voz alta el grano, la partición y el orden',
      example: 'ejemplo', challenge: 'desafío', practice: 'práctica', chapter: (i, n) => 'capítulo ' + i + ' / ' + n,
      home: 'Inicio', console: 'Consola libre', consoleSub: 'Un editor SQL en blanco',
      consoleDescription: 'Un espacio para cualquier consulta sobre la base de la tienda. Para guardar cambios, usa otra herramienta conectada a <code>localhost:5433</code> (usuario y contraseña <code>lab</code>).',
      activities: n => n + (n === 1 ? ' actividad' : ' actividades'),
      howToUse: 'cómo usarlo', rotCards: 'capítulos',
      prompt: 'psql -d loja <em>-- listo para consultar</em>',
      howTo: [
        'Cada ejemplo en PostgreSQL es un editor: modifícalo y haz clic en <b>▶ Ejecutar</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>). Se pueden ejecutar varios comandos a la vez; cada resultado aparece por separado.',
        'Las pestañas <b>Snowflake</b> y <b>BigQuery</b> muestran la sintaxis equivalente para comparar.',
        '<b>Plan de ejecución</b> ejecuta <code>EXPLAIN (ANALYZE, BUFFERS)</code> sobre el último comando.',
        'Cada ejecución ocurre en una transacción que se deshace al final: prueba <code>INSERT</code>, <code>UPDATE</code> y <code>DELETE</code> sin miedo.',
        'En los desafíos, <b>✓ Verificar</b> compara tu resultado con el esperado y explica la diferencia.',
        'El esquema de la base está en el menú lateral, en “Esquema de la base”.'
      ],
      notes: { NOTA: 'nota', 'ATENÇÃO': 'atención', DICA: 'consejo', NOVO: 'nuevo' },
      loading: 'cargando contenido…',
      contentError: 'No se pudo cargar el contenido del curso.',
      openHub: 'Esta página debe abrirse desde Trails Lab',
      openHubInstructions: 'Ejecuta <code>docker compose up -d</code> en la carpeta del repositorio y abre <code>http://127.0.0.1:8765</code>.',
      reasons: [
        [/^a consulta de referência não devolveu resultado \(avise o autor\)$/, () => 'la consulta de referencia no devolvió resultados (avisa al autor)'],
        [/^sua consulta não devolveu nenhuma tabela$/, () => 'tu consulta no devolvió ninguna tabla'],
        [/^esperava (\d+) coluna\(s\) \((.*)\), veio (\d+)$/, m => 'se esperaban ' + m[1] + ' columna(s) (' + m[2] + '), llegaron ' + m[3]],
        [/^esperava (\d+) linha\(s\), veio (\d+)$/, m => 'se esperaban ' + m[1] + ' fila(s), llegaron ' + m[2]],
        [/^a linha (\d+) difere: esperava ([\s\S]*), veio ([\s\S]*?)( \(a ordem importa neste desafio\))?$/,
          m => 'la fila ' + m[1] + ' es distinta: se esperaba ' + m[2] + ', llegó ' + m[3] + (m[4] ? ' (el orden importa en este desafío)' : '')]
      ],
      errors: [
        [/O Postgres não está acessível\. Rode "docker compose up -d" na pasta do repositório e aguarde alguns segundos\./, 'Postgres no está accesible. Ejecuta "docker compose up -d" en la carpeta del repositorio y espera unos segundos.'],
        [/^A execução passou do tempo limite\.$/, 'La ejecución superó el tiempo límite.'],
        [/^O meta-comando (\S+) não é permitido no laboratório\.$/, 'El metacomando $1 no está permitido en el laboratorio.'],
        [/^O plano de execução é mostrado para o último comando, que deve ser uma consulta \(SELECT ou WITH\)\.$/, 'El plan de ejecución se muestra para el último comando, que debe ser una consulta (SELECT o WITH).']
      ]
    }
  };
  const L = UI[LANG] || UI.pt;
  // the engine answers in Portuguese; show its known messages in the selected language
  function translateReason(m) {
    for (const [re, f] of (L.reasons || [])) { const r = String(m).match(re); if (r) return f(r); }
    return m;
  }
  const translateError = m => (L.errors || []).reduce((s, [re, t]) => s.replace(re, t), String(m));

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const $ = id => document.getElementById(id);

  // ---------- static interface ----------
  document.title = L.pageTitle;
  $('marca').textContent = L.brand;
  $('course-title').textContent = L.title;
  $('course-subtitle').textContent = L.courseSubtitle;
  $('rotProgresso').textContent = L.progressHeading;
  $('rotCapitulos').textContent = L.chaptersHeading;
  $('rotEsquema').textContent = L.schema;
  $('esqCarregando').textContent = L.connecting;
  $('engine-status').querySelector('span').textContent = L.checkingConnection;
  $('course-menu').setAttribute('aria-label', L.openMenu);
  $('course-nav').setAttribute('aria-label', L.chapterNavigation);
  $('mobile-title').textContent = L.title;
  $('course-menu').onclick = () => $('course-sidebar').classList.toggle('aberto');
  $('course-main').addEventListener('click', e => { if (!e.target.closest('#course-menu')) $('course-sidebar').classList.remove('aberto'); });

  const courseContent = $('course-content');
  if (!COURSE.lang || (!window.LAB_TOKEN && !COURSE.static)) {   // opened from disk; the static site (GitHub Pages) is read-only below
    courseContent.innerHTML = '<div class="aviso"><strong>' + esc(L.openHub) + '</strong>' + L.openHubInstructions + '</div>';
    $('engine-status').querySelector('span').textContent = L.readOnly;
    $('engine-status').className = 'motor falhou';
    $('esquema').innerHTML = '<small>' + esc(L.localOnly) + '</small>';
    return;
  }

  courseContent.innerHTML = '<div class="carregando">' + esc(L.loading) + '</div>';
  const fetchContent = l => fetch('content/' + l + '.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  fetchContent(LANG).catch(() => fetchContent('pt')).then(initializeCourse, e => {
    courseContent.innerHTML = '<div class="aviso"><strong>' + esc(L.contentError) + '</strong>' + esc(e.message) + '</div>';
  });

  function initializeCourse(COURSE_DATA) {
  const STORAGE_KEY = 'sql-moderno-v1';
  let state = { completed: {}, savedCode: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) state = { completed: saved.feitos || {}, savedCode: saved.codigos || {} };
  } catch (error) {}
  const saveState = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ feitos: state.completed, codigos: state.savedCode })); } catch (e) {} };

  function inline(t) {
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?![\w*])/g, '$1<i>$2</i>');
    return t.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + esc(codes[+i]) + '</code>');
  }
  const CIRC = '❶❷❸❹❺❻❼❽❾❿';
  const DIALECT_NAMES = { sql: 'PostgreSQL', snowflake: 'Snowflake', bigquery: 'BigQuery', text: 'Terminal', dbt: 'dbt (SQL + Jinja)', sqlmesh: 'SQLMesh', yaml: 'YAML' };

  // ---------- SQL highlighting ----------
  const KW = new Set(('select from where and or not in is null as on join left right full outer inner cross lateral using group by having order asc desc nulls first last limit offset fetch ' +
    'distinct all union intersect except with recursive case when then else end between like ilike exists any some insert into values update set delete returning ' +
    'create table index view materialized drop alter add column primary key foreign references unique check default generated always identity constraint ' +
    'over partition window rows range unbounded preceding following current row filter within qualify interval true false begin commit rollback explain analyze ' +
    'grouping sets rollup cube cast if replace temporary temp conflict do nothing merge matched struct array unnest').split(' '));
  const FN = new Set(('count sum avg min max round coalesce nullif greatest least upper lower length trim split_part concat string_agg array_agg listagg ' +
    'row_number rank dense_rank ntile lag lead first_value last_value nth_value percent_rank cume_dist date_trunc extract now current_date current_timestamp ' +
    'generate_series to_char to_date date_part age abs ceil floor count_if countif iff regexp_like regexp_contains dateadd datediff date_sub date_add ' +
    'generate_date_array json_agg jsonb_build_object grouping split safe_offset format').split(' '));
  const TOKEN = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|("(?:[^"]|"")*")|(\b\d+(?:\.\d+)?\b)|(::\w+)|([A-Za-z_][\w$]*)/g;
  function highlightCode(code, lang) {
    if (lang === 'text' || lang === 'yaml') return esc(code);
    let out = '', previousEnd = 0;
    code.replace(TOKEN, (m, comment, str, ident, num, typeCast, name, pos) => {
      out += esc(code.slice(previousEnd, pos));
      let cls = null;
      if (comment) cls = 'com'; else if (str) cls = 'str'; else if (num) cls = 'num'; else if (typeCast) cls = 'bi';
      else if (name) { const l = name.toLowerCase(); if (KW.has(l)) cls = 'kw'; else if (FN.has(l)) cls = 'fn'; }
      out += cls ? '<span class="tk-' + cls + '">' + esc(m) + '</span>' : esc(m);
      previousEnd = pos + m.length; return m;
    });
    return out + esc(code.slice(previousEnd));
  }

  // ---------- server ----------
  let engineReady = false;
  const engineStatusElement = $('engine-status');
  const setEngineStatus = (c, t) => { engineStatusElement.className = 'motor ' + c; engineStatusElement.querySelector('span').textContent = t; };
  async function api(path, requestBody) {
    const r = await fetch(path, requestBody ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lab-Token': window.LAB_TOKEN }, body: JSON.stringify(requestBody) }
                                          : { headers: { 'X-Lab-Token': window.LAB_TOKEN } });
    return r.json();
  }
  async function initialize() {
    if (!window.LAB_TOKEN) {
      setEngineStatus('falhou', L.readOnly);
      $('esquema').innerHTML = '<small>' + esc(L.localOnly) + '</small>';
      return;
    }
    try {
      const st = await api('api/status');
      if (!st.postgres) throw new Error(st.erro || L.noResponse);
      setEngineStatus('pronto', L.engineReady(st.postgres));
      engineReady = true;
      document.querySelectorAll('.btn-run').forEach(b => b.disabled = false);
      const schemaResponse = await api('api/esquema');
      $('esquema').innerHTML = Object.entries(schemaResponse.tabelas || {}).map(([t, cols]) =>
        '<div class="tab-esq"><b>' + esc(t) + '</b>' + cols.map(([c, outputType]) => '<div><span>' + esc(c) + '</span><em>' + esc(outputType) + '</em></div>').join('') + '</div>').join('');
    } catch (e) {
      setEngineStatus('falhou', L.engineFailed(e.message));
    }
  }

  // ---------- progress ----------
  const activities = [];
  function updateProgress() {
    const total = activities.length, completedCount = activities.filter(id => state.completed[id]).length;
    $('barra').style.width = (total ? 100 * completedCount / total : 0) + '%';
    $('txtProgresso').textContent = L.progress(completedCount, total);
    if (window.COURSE && window.COURSE.progress) window.COURSE.progress(completedCount, total);
    COURSE_DATA.capitulos.forEach((chapterData, i) => {
      const f = chapterData.atividades.filter(id => state.completed[id]).length;
      const el = document.querySelector('#course-nav a[data-cap="' + i + '"] .cnt');
      if (el) { el.textContent = f + '/' + chapterData.atividades.length; el.classList.toggle('cheio', f === chapterData.atividades.length && f > 0); }
    });
  }
  const markComplete = id => { if (!state.completed[id]) { state.completed[id] = true; saveState(); updateProgress(); } };

  // ---------- editor ----------
  function createEditor(id, initialCode, readOnly, lang) {
    const box = document.createElement('div'); box.className = 'editor';
    box.innerHTML = '<div class="ed-wrap"><div class="gutter"></div><div class="area"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div></div>';
    const ta = box.querySelector('textarea'), pre = box.querySelector('pre'), gut = box.querySelector('.gutter');
    ta.setAttribute('aria-label', readOnly ? L.readOnlyEditor : L.sqlEditor);
    const savedCode = readOnly ? null : state.savedCode[id];
    ta.value = savedCode != null ? savedCode : initialCode;
    ta.readOnly = !!readOnly;
    let errorLine = 0;
    function repaint() {
      const lines = ta.value.split('\n');
      let html = highlightCode(ta.value, lang || 'sql');
      if (errorLine) { const p = html.split('\n'); if (p[errorLine - 1] !== undefined) p[errorLine - 1] = '<span class="linha-erro">' + (p[errorLine - 1] || ' ') + '</span>'; html = p.join('\n'); }
      pre.innerHTML = html + '\n';
      gut.innerHTML = lines.map((_, i) => i + 1 === errorLine ? '<span class="erro">' + (i + 1) + '</span>' : (i + 1)).join('\n');
      pre.style.minWidth = 'calc(' + (Math.max(...lines.map(l => l.length)) + 2) + 'ch + 28px)';
    }
    ta.addEventListener('input', () => { errorLine = 0; repaint(); if (!readOnly) { state.savedCode[id] = ta.value; saveState(); } });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab' && !readOnly) { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    });
    repaint();
    return {
      el: box, ta, getValue: () => ta.value,
      setValue: v => { ta.value = v; errorLine = 0; repaint(); state.savedCode[id] = v; saveState(); },
      markError: n => { errorLine = n; repaint(); },
      goToLine: n => { const l = ta.value.split('\n'); let pos = 0; for (let i = 0; i < n - 1 && i < l.length; i++) pos += l[i].length + 1; ta.focus(); ta.setSelectionRange(pos, pos + (l[n - 1] || '').length); }
    };
  }

  // ---------- results ----------
  function renderResultTable(res, label) {
    if (res.colunas && res.colunas.length === 1 && res.colunas[0] === 'QUERY PLAN') {
      return '<div class="res-bloco"><div class="res-cab">' + label + ' · ' + esc(L.executionPlan) + '</div><pre class="plano">' + esc(res.linhas.map(l => l[0]).join('\n')) + '</pre></div>';
    }
    if (!res.colunas) return '<div class="res-bloco"><div class="res-cab">' + label + ' · ' + esc(res.tag || L.executed) + '</div></div>';
    const max = 200, lines = res.linhas.slice(0, max);
    const numericColumns = res.colunas.map((_, j) => res.linhas.length > 0 && res.linhas.every(l => l[j] === null || /^-?\d+(\.\d+)?$/.test(l[j])));
    return '<div class="res-bloco"><div class="res-cab">' + label + ' · ' + esc(L.rowCount(res.linhas.length)) +
      (res.tag ? ' · ' + esc(res.tag) : '') + (res.linhas.length > max ? esc(L.showing(max)) : '') + '</div><div class="tabela grade"><table><tr>' +
      res.colunas.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr>' +
      lines.map(l => '<tr>' + l.map((v, j) => '<td' + (numericColumns[j] ? ' class="num"' : '') + '>' + (v === null ? '<span class="nulo">NULL</span>' : esc(v)) + '</td>').join('') + '</tr>').join('') +
      '</table></div></div>';
  }

  function createExercise(opts) {
    const frag = document.createElement('div');
    const variants = (opts.variantes || []).filter(v => v.lang !== 'sql');
    let tabs = null;
    if (variants.length) {
      tabs = document.createElement('div'); tabs.className = 'abas';
      tabs.innerHTML = ['sql', ...variants.map(v => v.lang)].map((l, i) => '<button class="aba' + (i ? '' : ' ativa') + '" data-l="' + l + '">' + DIALECT_NAMES[l] + '</button>').join('') +
        '<span class="aba-dica">' + esc(L.postgresOnly) + '</span>';
      frag.appendChild(tabs);
    }
    const ed = createEditor(opts.id, opts.codigo, false, 'sql');
    frag.appendChild(ed.el);
    const alternateEditors = {};
    variants.forEach(v => {
      const e = createEditor(opts.id + '-' + v.lang, v.code, true, 'sql');
      e.el.style.display = 'none'; e.el.classList.add('variante'); alternateEditors[v.lang] = e; frag.appendChild(e.el);
    });
    const actions = document.createElement('div'); actions.className = 'acoes';
    actions.innerHTML = '<button class="btn prim btn-run"' + (engineReady ? '' : ' disabled') + '>' + esc(L.run) + '</button>' +
      (opts.desafio ? '<button class="btn ok btn-run btn-verif"' + (engineReady ? '' : ' disabled') + '>' + esc(L.verify) + '</button>' : '<button class="btn btn-run btn-plano"' + (engineReady ? '' : ' disabled') + '>' + esc(L.plan) + '</button>') +
      '<button class="btn btn-reset">' + esc(L.reset) + '</button>' + (opts.desafio ? '<button class="btn btn-sol">' + esc(L.showSolution) + '</button>' : '') +
      '<span class="atalho">' + (opts.desafio ? L.challengeShortcut : L.shortcut) + '</span>';
    frag.appendChild(actions);
    const outputElement = document.createElement('div'); outputElement.className = 'saida-sql'; frag.appendChild(outputElement);
    const resultElement = document.createElement('div'); resultElement.className = 'resultado'; resultElement.setAttribute('role', 'status'); frag.appendChild(resultElement);
    let solDiv = null;
    if (opts.desafio) {
      solDiv = document.createElement('div'); solDiv.className = 'solucao';
      solDiv.innerHTML = '<div class="rotulo-sol">' + esc(L.solution) + '</div><div class="estatico editor"><pre>' + highlightCode(opts.solucao, 'sql') + '</pre></div><div class="acoes"><button class="btn btn-usar">' + esc(L.copy) + '</button></div>';
      frag.appendChild(solDiv);
      solDiv.querySelector('.btn-usar').onclick = () => ed.setValue(opts.solucao);
    }
    if (tabs) tabs.addEventListener('click', e => {
      const b = e.target.closest('.aba'); if (!b) return;
      tabs.querySelectorAll('.aba').forEach(x => x.classList.toggle('ativa', x === b));
      ed.el.style.display = b.dataset.l === 'sql' ? '' : 'none';
      Object.entries(alternateEditors).forEach(([l, e2]) => e2.el.style.display = l === b.dataset.l ? '' : 'none');
      actions.style.display = b.dataset.l === 'sql' ? '' : 'none';
    });

    async function execute(mode) {
      if (!engineReady) return;
      const runButtons = actions.querySelectorAll('.btn-run'); runButtons.forEach(b => b.disabled = true);
      outputElement.innerHTML = '<div class="res-cab">' + esc(L.running) + '</div>'; outputElement.classList.add('vis'); resultElement.className = 'resultado'; ed.markError(0);
      const t0 = performance.now();
      let res;
      try {
        res = await api('api/executar', { sql: ed.getValue(), explicar: mode === 'plano',
          esperado: mode === 'verificar' ? opts.solucao : undefined, ordenado: !!opts.ordenado });
      } catch (e) { res = { ok: false, resultados: [], erro: { mensagem: L.serverUnavailable } }; }
      runButtons.forEach(b => b.disabled = false);
      const ms = Math.round(performance.now() - t0);
      let html = (res.resultados || []).map(r => renderResultTable(r, esc(L.command(r.comando + 1)))).join('');
      if (res.erro) {
        html += '<div class="tb">' + (res.erro.linha ? '<a data-l="' + res.erro.linha + '">' + esc(L.linha(res.erro.linha)) + '</a> · ' : '') + esc(translateError(res.erro.mensagem)) + '</div>';
        if (res.erro.linha) ed.markError(res.erro.linha);
      }
      outputElement.innerHTML = (html || '<div class="res-cab">' + esc(L.noOutput) + '</div>') + '<div class="res-rodape">' + esc(L.outputFooter(ms)) + '</div>';
      outputElement.querySelectorAll('a[data-l]').forEach(a => a.onclick = () => ed.goToLine(+a.dataset.l));
      if (mode === 'verificar') {
        const v = res.verificacao;
        if (v && v.ok) { resultElement.className = 'resultado vis ok'; resultElement.textContent = L.passed; markComplete(opts.id); }
        else { resultElement.className = 'resultado vis falha'; resultElement.textContent = L.notCompleted(v ? translateReason(v.motivo) : L.failed); }
      } else if (!opts.desafio && res.ok) markComplete(opts.id);
    }
    actions.querySelector('.btn-run').onclick = () => execute('normal');
    if (opts.desafio) actions.querySelector('.btn-verif').onclick = () => execute('verificar');
    else actions.querySelector('.btn-plano').onclick = () => execute('plano');
    actions.querySelector('.btn-reset').onclick = () => { ed.setValue(opts.codigo); outputElement.classList.remove('vis'); resultElement.className = 'resultado'; };
    if (solDiv) actions.querySelector('.btn-sol').onclick = () => { if (solDiv.classList.contains('vis') || confirm(L.confirmSolution)) solDiv.classList.toggle('vis'); };
    ed.ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); execute(opts.desafio && e.shiftKey ? 'verificar' : 'normal'); } });
    return frag;
  }

  // ---------- rendering ----------
  function createStaticCode(code, lang) { const d = document.createElement('div'); d.className = 'estatico editor'; d.innerHTML = '<pre>' + highlightCode(code, lang) + '</pre>'; return d; }
  function renderChapter(ci) {
    const chapterData = COURSE_DATA.capitulos[ci];
    courseContent.innerHTML = '<div class="kicker">' + esc(L.chapter(ci + 1, COURSE_DATA.capitulos.length)) + '</div><h2 class="cap">' + esc(chapterData.titulo) + '</h2>';
    let listElement = null;
    chapterData.blocos.forEach(b => {
      if (b.t !== 'bullet') listElement = null;
      let el = null;
      switch (b.t) {
        case 'h2': el = document.createElement('h3'); el.className = 'sec'; el.id = b.ancora; el.innerHTML = inline(b.text); break;
        case 'h3': el = document.createElement('h4'); el.innerHTML = inline(b.text); break;
        case 'p': el = document.createElement('p'); el.innerHTML = inline(b.text); break;
        case 'bullet':
          if (!listElement) { listElement = document.createElement('ul'); listElement.className = 'lista'; courseContent.appendChild(listElement); }
          const li = document.createElement('li'); li.innerHTML = inline(b.text); listElement.appendChild(li); return;
        case 'note':
          el = document.createElement('div'); el.className = 'nota ' + b.kind;
          el.innerHTML = '<div class="ic">' + esc(L.notes[b.kind] || UI.pt.notes[b.kind] || b.kind) + '</div><div class="tx">' + inline(b.text) + '</div>';
          break;
        case 'table':
          el = document.createElement('div'); el.className = 'tabela';
          el.innerHTML = '<table>' + b.rows.map((r, i) => '<tr>' + r.map(c => (i ? '<td>' : '<th>') + inline(c) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>';
          break;
        case 'code': el = document.createElement('div'); el.style.margin = '0 0 18px'; el.appendChild(b.lang === 'sql' ? createExercise({ id: 'c-' + ci + '-' + b.code.length, codigo: b.code }) : createStaticCode(b.code, b.lang)); break;
        case 'ex': {
          el = document.createElement('div'); el.className = 'ex';
          el.innerHTML = '<div class="kicker">' + esc(L.example) + '</div><div class="titulo">' + inline(b.titulo) + '</div><div class="meta"><span class="arquivo">' + esc(b.arquivo) + '</span></div>';
          if (b.lang === 'sql') el.appendChild(createExercise({ id: b.id, codigo: b.code, variantes: b.variantes }));
          else {
            const codeBlocks = [{ lang: b.lang, code: b.code }, ...(b.variantes || [])];
            codeBlocks.forEach(v => {
              if (codeBlocks.length > 1) { const r = document.createElement('div'); r.className = 'arquivo rotulo-bloco'; r.textContent = DIALECT_NAMES[v.lang] || v.lang; el.appendChild(r); }
              el.appendChild(createStaticCode(v.code, v.lang));
            });
          }
          if (b.callouts.length) {
            const ul = document.createElement('ul'); ul.className = 'callouts';
            ul.innerHTML = b.callouts.map((c, i) => '<li><span class="n">' + CIRC[i] + '</span><span>' + inline(c) + '</span></li>').join('');
            el.appendChild(ul);
          }
          break;
        }
        case 'desafio': {
          const isPractice = b.pratica || !b.solucao;
          el = document.createElement('div'); el.className = 'ex desafio';
          el.innerHTML = '<div class="kicker">' + esc(isPractice ? L.practice : L.challenge) + '</div><div class="titulo">' + inline(b.titulo) + '</div><div class="enunciado">' + inline(b.enunciado) + (b.ordenado ? ' <i>' + esc(L.verifiedOrder) + '</i>' : '') + '</div>';
          if (isPractice) {
            // chapter 8 (the English case study, "Step N") keeps its own English hint in every language
            const badge = /^Step /.test(b.titulo) ? UI.en.practiceBadge : L.practiceBadge;
            el.querySelector('.titulo').insertAdjacentHTML('afterend', '<div class="selo-pratica">' + esc(badge) + '</div>');
            el.appendChild(createExercise({ id: b.id, codigo: b.inicial }));
          } else el.appendChild(createExercise({ id: b.id, codigo: b.inicial, solucao: b.solucao, ordenado: b.ordenado, desafio: true }));
          break;
        }
      }
      if (el) courseContent.appendChild(el);
    });
    const pag = document.createElement('div'); pag.className = 'paginacao';
    pag.innerHTML = (ci > 0 ? '<a href="#cap-' + ci + '">← ' + esc(COURSE_DATA.capitulos[ci - 1].titulo) + '</a>' : '<a href="#inicio">← ' + esc(L.home) + '</a>') +
      (ci < COURSE_DATA.capitulos.length - 1 ? '<a href="#cap-' + (ci + 2) + '">' + esc(COURSE_DATA.capitulos[ci + 1].titulo) + ' →</a>' : '<a href="#console">' + esc(L.console) + ' →</a>');
    courseContent.appendChild(pag);
    $('mobile-title').textContent = chapterData.titulo;
  }
  function renderHome() {
    courseContent.innerHTML = '<div class="inicio"><h2>' + esc(L.title) + '</h2><div class="sub">' + esc(COURSE_DATA.subtitulo) + '</div>' +
      '<div class="prompt">$ ' + L.prompt + '</div>' +
      '<div class="label"><span>' + esc(L.howToUse) + '</span></div>' +
      '<div class="como"><ul>' + L.howTo.map(li => '<li>' + li + '</li>').join('') + '</ul></div>' +
      '<div class="label"><span>' + esc(L.cardsHeading) + '</span></div><div class="cards">' +
      COURSE_DATA.capitulos.map((c, i) => {
        const f = c.atividades.filter(id => state.completed[id]).length, t = c.atividades.length;
        return '<a class="card" href="#cap-' + (i + 1) + '"><span class="num-cap">cap-' + (i + 1) + '</span><b>' + esc(c.titulo) + '</b><small>' + f + '/' + esc(L.activities(t)) + '</small>' +
          '<span class="mini"><span style="width:' + (t ? 100 * f / t : 0) + '%"></span></span></a>';
      }).join('') +
      '<a class="card" href="#console"><span class="num-cap">console</span><b>' + esc(L.console) + '</b><small>' + esc(L.consoleSubtitle) + '</small></a></div></div>';
    $('mobile-title').textContent = L.title;
  }
  function renderConsole() {
    courseContent.innerHTML = '<div class="kicker">console</div><h2 class="cap">' + esc(L.console) + '</h2><p>' + L.consoleDescription + '</p>';
    const d = document.createElement('div'); d.className = 'ex';
    d.appendChild(createExercise({ id: 'console', codigo: "SELECT status, count(*) AS pedidos\nFROM pedidos\nGROUP BY status\nORDER BY pedidos DESC;\n" }));
    courseContent.appendChild(d);
    $('mobile-title').textContent = L.console;
  }

  const nav = $('course-nav');
  nav.innerHTML = '<a href="#inicio" class="cap">' + esc(L.home) + '</a>' + COURSE_DATA.capitulos.map((c, i) =>
    '<a class="cap" data-cap="' + i + '" href="#cap-' + (i + 1) + '"><span>' + esc(c.titulo) + '</span><span class="cnt"></span></a>' +
    c.secoes.map(s => '<a class="sec" href="#cap-' + (i + 1) + '" data-ancora="' + s.ancora + '">' + inline(s.titulo) + '</a>').join('')).join('') +
    '<a class="cap" href="#console">' + esc(L.console) + '</a>';
  COURSE_DATA.capitulos.forEach(c => activities.push(...c.atividades));
  let pendingAnchor = null;
  nav.addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; pendingAnchor = a.dataset.ancora || null; $('course-sidebar').classList.remove('aberto'); if (a.getAttribute('href') === location.hash) { e.preventDefault(); route(); } });
  function route() {
    const h = location.hash.slice(1) || 'inicio', m = h.match(/^cap-(\d+)$/);
    nav.querySelectorAll('a.cap').forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + h));
    if (m && COURSE_DATA.capitulos[+m[1] - 1]) renderChapter(+m[1] - 1); else if (h === 'console') renderConsole(); else renderHome();
    const destination = pendingAnchor && document.getElementById(pendingAnchor); if (destination) destination.scrollIntoView(); else $('course-main').scrollTop = 0; pendingAnchor = null;
  }
  window.addEventListener('hashchange', route);
  route(); updateProgress(); initialize();
  }
})();
