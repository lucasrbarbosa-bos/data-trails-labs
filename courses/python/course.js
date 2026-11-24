(function () {
  'use strict';

  // ---------- textos da interface (pt / en / es) ----------
  const UI = {
    pt: {
      docTitle: 'Python Moderno — Laboratório interativo',
      courseName: 'Python Moderno',
      courseSubtitle: 'Laboratório interativo · Python 3.15',
      progressLabel: 'progresso',
      progress: '{f} de {t} atividades concluídas',
      chapters: 'capítulos',
      menu: 'Abrir menu',
      loadingContent: '$ carregando o conteúdo…',
      needHub: 'Não consegui carregar o conteúdo deste curso. Abra a página pelo Trails Lab (docker compose up -d ou python engine/hub.py) em vez de abrir o arquivo direto do disco.',
      loadingPy: 'Carregando o Python…',
      loadingBrowserPy: 'Carregando o Python no navegador…',
      brythonOk: 'Python no navegador (Brython {v})',
      brythonFail: 'O Python do navegador não carregou. Para executar com o seu Python de verdade, abra pelo Trails Lab: python engine/hub.py (veja o README)',
      localOk: 'Seu Python {v} (servidor local) · depurador ativo',
      serverRefused: 'Servidor recusou: ',
      serverDown: 'Não consegui falar com o servidor local. Ele ainda está rodando? ({m})',
      internalErr: 'Erro interno do motor: ',
      promptInput: 'Entrada:',
      editorAria: 'Editor de código Python',
      inputs: 'Entradas', inputsPh: 'Uma resposta por linha. Em branco, o navegador vai perguntar.',
      args: 'Argumentos', argsPh: 'ex.: 1000 1 12 --detalhe',
      run: '▶ Executar', verify: '✓ Verificar', debug: '🐞 Depurar', vars: 'Variáveis', reset: '↺ Restaurar', showSol: 'Ver solução',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> executa', shortcutVerify: ' · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> verifica',
      output: 'Saída', solution: 'Solução', copyToEditor: 'Copiar para o editor',
      first: 'Primeiro passo', prev: 'Passo anterior', next: 'Próximo passo', last: 'Último passo', closeDbg: 'Fechar depurador', stepSlider: 'Passo do depurador',
      varsStep: 'Variáveis neste passo', outSoFar: 'Saída até aqui', globals: 'Globais', none: '(nenhuma)',
      stepInfo: 'Passo {i} de {n} · linha {l} · {onde}', moduleLevel: 'nível do módulo', returned: '↩ {fn}() devolveu {v}', exception: '⚠ exceção: ',
      nothingYet: '(nada ainda)', truncated: 'Mostrando só os primeiros passos.',
      running: 'executando…', line: 'linha', noOutput: '(sem saída)', endedErr: 'terminou com erro · ',
      notPassed: 'Ainda não passou{m}. Ajuste o código e tente de novo.', passed: '✓ Tudo certo! Desafio concluído.',
      errBeforeCheck: 'O código terminou com erro antes de ser verificado. Veja o traceback acima.',
      runForVars: 'Execute o código para ver as variáveis criadas.', colName: 'Nome', colType: 'Tipo', colValue: 'Valor',
      confirmSol: 'Mostrar a solução? Tente mais um pouco antes, se puder.',
      challenge: 'desafio', done: '✓ concluído',
      notes: { NOTA: 'Nota', 'ATENÇÃO': 'Atenção', DICA: 'Dica', NOVO: 'Novidade 3.15' },
      reqCode: 'Este exemplo usa recursos do Python 3.14 ou superior e não roda no motor do navegador. Execute no seu Python 3.15 local.',
      reqEx: 'Execute este exemplo no seu Python local: ele usa arquivos, banco de dados, vários módulos ou recursos do 3.14+, que o motor do navegador não oferece.',
      home: 'Início', lab: 'Laboratório livre', labCard: 'Um editor em branco para experimentar',
      labIntro: 'Um espaço para experimentar o que quiser. O código fica salvo neste navegador.',
      labCode: "# Escreva seu código aqui\nnomes = ['Ana', 'Bia', 'Caio']\nfor i, nome in enumerate(nomes, start=1):\n    print(f'{i}. {nome}')\n",
      activities: '{n} atividades', activity: '1 atividade', chapter: 'cap {n}', annex: 'anexo',
      howTo: 'como usar',
      howItems: [
        'Todo exemplo da apostila é um editor: altere o código à vontade e clique em <b>▶ Executar</b> (ou <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).',
        'Em caso de erro, o traceback aparece com a <b>linha clicável</b>, que é destacada no editor, e uma dica sobre o tipo de erro.',
        '<b>Variáveis</b> mostra tudo o que o seu código criou, com tipo e valor: é o seu depurador.',
        'Nos <b>desafios</b>, <b>✓ Verificar</b> roda testes automáticos sobre a sua solução.',
        'Seu código e seu progresso ficam salvos neste navegador.'
      ],
      howLocal: '<b>Você está usando o seu Python de verdade</b> pelo Trails Lab: todos os exemplos executam, inclusive arquivos, banco de dados e recursos do 3.14/3.15. Use <b>🐞 Depurar</b> para avançar linha a linha (<kbd>F10</kbd> no editor).',
      howBrowser: 'Sem o servidor local, o código roda no navegador pelo Brython (compatível com o Python 3.12), e exemplos de arquivos, banco de dados e 3.14+ ficam só para leitura. Para executar tudo no seu Python e usar o depurador, abra pelo Trails Lab: <code>docker compose up -d</code> ou <code>python engine/hub.py</code> (veja o README).',
      errHints: {
        NameError: 'Um nome foi usado antes de ser definido. Confira a grafia (maiúsculas contam) e a ordem das linhas.',
        TypeError: 'Uma operação recebeu um tipo que não esperava, como somar texto com número. Talvez falte uma conversão.',
        ValueError: 'O tipo está certo, mas o valor não serve, como int(\'mil\').',
        SyntaxError: 'O código não segue a gramática do Python: confira parênteses, aspas e dois-pontos.',
        IndentationError: 'O recuo das linhas não bate. Use 4 espaços por nível.',
        KeyError: 'A chave não existe no dicionário. Use .get() quando ela puder faltar.',
        IndexError: 'O índice está fora da lista. Lembre que a contagem começa em 0.',
        AttributeError: 'O objeto não tem esse atributo ou método. Use dir() para ver o que existe.',
        ZeroDivisionError: 'Divisão por zero.'
      }
    },
    en: {
      docTitle: 'Modern Python — interactive lab',
      courseName: 'Modern Python',
      courseSubtitle: 'Interactive lab · Python 3.15',
      progressLabel: 'progress',
      progress: '{f} of {t} activities done',
      chapters: 'chapters',
      menu: 'Open menu',
      loadingContent: '$ loading content…',
      needHub: 'Could not load this course\'s content. Open the page through Trails Lab (docker compose up -d or python engine/hub.py) instead of opening the file straight from disk.',
      loadingPy: 'Loading Python…',
      loadingBrowserPy: 'Loading Python in the browser…',
      brythonOk: 'Python in the browser (Brython {v})',
      brythonFail: 'The in-browser Python did not load. To run your real Python, open the page through Trails Lab: python engine/hub.py (see the README)',
      localOk: 'Your Python {v} (local server) · debugger on',
      serverRefused: 'The server refused: ',
      serverDown: 'Could not reach the local server. Is it still running? ({m})',
      internalErr: 'Internal engine error: ',
      promptInput: 'Input:',
      editorAria: 'Python code editor',
      inputs: 'Inputs', inputsPh: 'One answer per line. If empty, the browser will ask.',
      args: 'Arguments', argsPh: 'e.g. 1000 1 12 --detalhe',
      run: '▶ Run', verify: '✓ Check', debug: '🐞 Debug', vars: 'Variables', reset: '↺ Reset', showSol: 'Show solution',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs', shortcutVerify: ' · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> checks',
      output: 'Output', solution: 'Solution', copyToEditor: 'Copy to editor',
      first: 'First step', prev: 'Previous step', next: 'Next step', last: 'Last step', closeDbg: 'Close debugger', stepSlider: 'Debugger step',
      varsStep: 'Variables at this step', outSoFar: 'Output so far', globals: 'Globals', none: '(none)',
      stepInfo: 'Step {i} of {n} · line {l} · {onde}', moduleLevel: 'module level', returned: '↩ {fn}() returned {v}', exception: '⚠ exception: ',
      nothingYet: '(nothing yet)', truncated: 'Showing only the first steps.',
      running: 'running…', line: 'line', noOutput: '(no output)', endedErr: 'ended with an error · ',
      notPassed: 'Not passing yet{m}. Adjust the code and try again.', passed: '✓ All good! Challenge complete.',
      errBeforeCheck: 'The code ended with an error before it could be checked. See the traceback above.',
      runForVars: 'Run the code to see the variables it creates.', colName: 'Name', colType: 'Type', colValue: 'Value',
      confirmSol: 'Show the solution? Try a little longer first, if you can.',
      challenge: 'challenge', done: '✓ done',
      notes: { NOTA: 'Note', 'ATENÇÃO': 'Warning', DICA: 'Tip', NOVO: 'New in 3.15' },
      reqCode: 'This example uses Python 3.14+ features and does not run on the browser engine. Run it on your local Python 3.15.',
      reqEx: 'Run this example on your local Python: it uses files, a database, several modules or 3.14+ features that the browser engine does not offer.',
      home: 'Home', lab: 'Free lab', labCard: 'A blank editor to experiment in',
      labIntro: 'A place to try anything you like. The code is saved in this browser.',
      labCode: "# Write your code here\nnomes = ['Ana', 'Bia', 'Caio']\nfor i, nome in enumerate(nomes, start=1):\n    print(f'{i}. {nome}')\n",
      activities: '{n} activities', activity: '1 activity', chapter: 'ch {n}', annex: 'annex',
      howTo: 'how to use',
      howItems: [
        'Every example in the book is an editor: change the code freely and click <b>▶ Run</b> (or <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).',
        'When something fails, the traceback shows a <b>clickable line</b>, highlighted in the editor, plus a hint about the kind of error.',
        '<b>Variables</b> lists everything your code created, with type and value: it is your debugger.',
        'In the <b>challenges</b>, <b>✓ Check</b> runs automatic tests against your solution.',
        'Your code and your progress are saved in this browser.'
      ],
      howLocal: '<b>You are using your real Python</b> through Trails Lab: every example runs, including files, databases and 3.14/3.15 features. Use <b>🐞 Debug</b> to step line by line (<kbd>F10</kbd> in the editor).',
      howBrowser: 'Without the local server, code runs in the browser through Brython (compatible with Python 3.12), and the file, database and 3.14+ examples are read-only. To run everything on your Python and use the debugger, open the page through Trails Lab: <code>docker compose up -d</code> or <code>python engine/hub.py</code> (see the README).',
      errHints: {
        NameError: 'A name was used before it was defined. Check the spelling (case matters) and the order of the lines.',
        TypeError: 'An operation got a type it did not expect, such as adding text to a number. A conversion may be missing.',
        ValueError: 'The type is right but the value is not, as in int(\'thousand\').',
        SyntaxError: 'The code does not follow Python\'s grammar: check parentheses, quotes and colons.',
        IndentationError: 'The indentation of the lines does not match. Use 4 spaces per level.',
        KeyError: 'The key is not in the dictionary. Use .get() when it may be missing.',
        IndexError: 'The index is outside the list. Remember that counting starts at 0.',
        AttributeError: 'The object has no such attribute or method. Use dir() to see what it has.',
        ZeroDivisionError: 'Division by zero.'
      }
    },
    es: {
      docTitle: 'Python Moderno — laboratorio interactivo',
      courseName: 'Python Moderno',
      courseSubtitle: 'Laboratorio interactivo · Python 3.15',
      progressLabel: 'progreso',
      progress: '{f} de {t} actividades completadas',
      chapters: 'capítulos',
      menu: 'Abrir menú',
      loadingContent: '$ cargando el contenido…',
      needHub: 'No se pudo cargar el contenido de este curso. Abre la página a través de Trails Lab (docker compose up -d o python engine/hub.py) en lugar de abrir el archivo directamente desde el disco.',
      loadingPy: 'Cargando Python…',
      loadingBrowserPy: 'Cargando Python en el navegador…',
      brythonOk: 'Python en el navegador (Brython {v})',
      brythonFail: 'El Python del navegador no se cargó. Para ejecutar con tu Python real, abre la página a través de Trails Lab: python engine/hub.py (consulta el README)',
      localOk: 'Tu Python {v} (servidor local) · depurador activo',
      serverRefused: 'El servidor rechazó la solicitud: ',
      serverDown: 'No se pudo contactar con el servidor local. ¿Sigue en ejecución? ({m})',
      internalErr: 'Error interno del motor: ',
      promptInput: 'Entrada:',
      editorAria: 'Editor de código Python',
      inputs: 'Entradas', inputsPh: 'Una respuesta por línea. Si lo dejas vacío, el navegador preguntará.',
      args: 'Argumentos', argsPh: 'p. ej.: 1000 1 12 --detalhe',
      run: '▶ Ejecutar', verify: '✓ Verificar', debug: '🐞 Depurar', vars: 'Variables', reset: '↺ Restaurar', showSol: 'Ver solución',
      shortcut: '<kbd>Ctrl</kbd>+<kbd>Enter</kbd> ejecuta', shortcutVerify: ' · <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> verifica',
      output: 'Salida', solution: 'Solución', copyToEditor: 'Copiar al editor',
      first: 'Primer paso', prev: 'Paso anterior', next: 'Paso siguiente', last: 'Último paso', closeDbg: 'Cerrar depurador', stepSlider: 'Paso del depurador',
      varsStep: 'Variables en este paso', outSoFar: 'Salida hasta aquí', globals: 'Globales', none: '(ninguna)',
      stepInfo: 'Paso {i} de {n} · línea {l} · {onde}', moduleLevel: 'nivel del módulo', returned: '↩ {fn}() devolvió {v}', exception: '⚠ excepción: ',
      nothingYet: '(nada todavía)', truncated: 'Se muestran solo los primeros pasos.',
      running: 'ejecutando…', line: 'línea', noOutput: '(sin salida)', endedErr: 'terminó con error · ',
      notPassed: 'Todavía no pasa{m}. Ajusta el código e inténtalo de nuevo.', passed: '✓ ¡Todo correcto! Desafío completado.',
      errBeforeCheck: 'El código terminó con un error antes de poder verificarse. Revisa el traceback de arriba.',
      runForVars: 'Ejecuta el código para ver las variables que crea.', colName: 'Nombre', colType: 'Tipo', colValue: 'Valor',
      confirmSol: '¿Mostrar la solución? Inténtalo un poco más antes, si puedes.',
      challenge: 'desafío', done: '✓ completado',
      notes: { NOTA: 'Nota', 'ATENÇÃO': 'Atención', DICA: 'Consejo', NOVO: 'Novedad 3.15' },
      reqCode: 'Este ejemplo usa funciones de Python 3.14 o posterior y no se ejecuta en el motor del navegador. Ejecútalo en tu Python 3.15 local.',
      reqEx: 'Ejecuta este ejemplo en tu Python local: usa archivos, bases de datos, varios módulos o funciones de 3.14+, que el motor del navegador no ofrece.',
      home: 'Inicio', lab: 'Laboratorio libre', labCard: 'Un editor en blanco para experimentar',
      labIntro: 'Un espacio para probar lo que quieras. El código se guarda en este navegador.',
      labCode: "# Escribe tu código aquí\nnomes = ['Ana', 'Bia', 'Caio']\nfor i, nome in enumerate(nomes, start=1):\n    print(f'{i}. {nome}')\n",
      activities: '{n} actividades', activity: '1 actividad', chapter: 'cap {n}', annex: 'anexo',
      howTo: 'cómo usar',
      howItems: [
        'Cada ejemplo del libro es un editor: cambia el código libremente y haz clic en <b>▶ Ejecutar</b> (o <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).',
        'Si hay un error, el traceback muestra la <b>línea en la que se puede hacer clic</b>, resaltada en el editor, y una pista sobre el tipo de error.',
        '<b>Variables</b> muestra todo lo que creó tu código, con tipo y valor: es tu depurador.',
        'En los <b>desafíos</b>, <b>✓ Verificar</b> ejecuta pruebas automáticas sobre tu solución.',
        'Tu código y tu progreso se guardan en este navegador.'
      ],
      howLocal: '<b>Estás usando tu Python real</b> a través de Trails Lab: todos los ejemplos se ejecutan, incluidos archivos, bases de datos y funciones de 3.14/3.15. Usa <b>🐞 Depurar</b> para avanzar línea por línea (<kbd>F10</kbd> en el editor).',
      howBrowser: 'Sin el servidor local, el código se ejecuta en el navegador con Brython (compatible con Python 3.12), y los ejemplos de archivos, bases de datos y 3.14+ son solo de lectura. Para ejecutar todo en tu Python y usar el depurador, abre la página a través de Trails Lab: <code>docker compose up -d</code> o <code>python engine/hub.py</code> (consulta el README).',
      errHints: {
        NameError: 'Se usó un nombre antes de definirlo. Revisa la ortografía (las mayúsculas cuentan) y el orden de las líneas.',
        TypeError: 'Una operación recibió un tipo que no esperaba, como sumar texto con un número. Tal vez falte una conversión.',
        ValueError: 'El tipo es correcto, pero el valor no sirve, como en int(\'mil\').',
        SyntaxError: 'El código no sigue la gramática de Python: revisa paréntesis, comillas y dos puntos.',
        IndentationError: 'La sangría de las líneas no coincide. Usa 4 espacios por nivel.',
        KeyError: 'La clave no existe en el diccionario. Usa .get() cuando pueda faltar.',
        IndexError: 'El índice está fuera de la lista. Recuerda que el conteo empieza en 0.',
        AttributeError: 'El objeto no tiene ese atributo o método. Usa dir() para ver lo que tiene.',
        ZeroDivisionError: 'División por cero.'
      }
    }
  };
  const LANG = window.COURSE && UI[window.COURSE.lang] ? window.COURSE.lang : 'pt';
  const L = UI[LANG];
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));

  // textos fixos do HTML
  document.title = L.docTitle;
  document.getElementById('course-title').textContent = L.courseName;
  document.getElementById('course-subtitle').textContent = L.courseSubtitle;
  document.getElementById('rotProgresso').textContent = L.progressLabel;
  document.getElementById('rotCapitulos').textContent = L.chapters;
  document.getElementById('course-menu').setAttribute('aria-label', L.menu);
  document.getElementById('mobile-title').textContent = L.courseName;
  window.pyInputLabel = L.promptInput;

  // ---------- armazenamento (por visitante) ----------
  const STORAGE_KEY = 'python-moderno-v1';
  let state = { completed: {}, savedCode: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) state = { completed: saved.feitos || {}, savedCode: saved.codigos || {} };
  } catch (error) {}
  function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ feitos: state.completed, codigos: state.savedCode })); } catch (e) {} }

  // conteúdo do curso (content/<idioma>.json), carregado na inicialização
  let COURSE_DATA = null;

  // ---------- utilidades ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escAttr = s => esc(s).replace(/"/g, '&quot;');
  function inline(t) {
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?![\w*])/g, '$1<i>$2</i>');
    return t.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + esc(codes[+i]) + '</code>');
  }
  const CIRC = '❶❷❸❹❺❻❼❽❾❿';

  // ---------- realce de sintaxe ----------
  const KW = new Set('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case type lazy'.split(' '));
  const BI = new Set('print len range int float str bool list dict set tuple type input sum min max sorted reversed isinstance enumerate zip map filter open round abs any all repr help dir id iter next super object frozenset frozendict sentinel breakpoint format divmod pow hash chr ord'.split(' '));
  const TOKEN = /(#[^\n]*)|([rRbBfFtTuU]{0,2}("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_À-ÿ][\wÀ-ÿ]*)/g;
  function highlightCode(code, lang) {
    if (lang !== 'python') return esc(code);
    let out = '', previousEnd = 0, previousToken = '';
    code.replace(TOKEN, (m, comment, str, _q, num, name, pos) => {
      out += esc(code.slice(previousEnd, pos));
      let cls = null;
      if (comment) cls = 'com'; else if (str) cls = 'str'; else if (num) cls = 'num';
      else if (name) {
        if (KW.has(name)) cls = 'kw';
        else if (previousToken === 'def' || previousToken === 'class') cls = 'fn';
        else if (BI.has(name)) cls = 'bi';
        previousToken = name;
      }
      out += cls ? '<span class="tk-' + cls + '">' + esc(m) + '</span>' : esc(m);
      previousEnd = pos + m.length;
      return m;
    });
    return out + esc(code.slice(previousEnd));
  }

  // ---------- motor Python ----------
  let engineReady = false, useLocalEngine = false, outputListener = null, variablesListener = null;
  const engineStatusElement = document.getElementById('engine-status');
  function setEngineStatus(className, outputText) { engineStatusElement.className = 'motor ' + className; engineStatusElement.querySelector('span').textContent = outputText; }
  setEngineStatus('', L.loadingPy);
  function enableExecution() { engineReady = true; document.querySelectorAll('.btn-run').forEach(b => b.disabled = false); }
  window.pyEmit = (outputType, outputText) => { if (outputListener) outputListener(outputType, outputText); };
  window.pyVars = v => { if (variablesListener) variablesListener(v); };
  window.pyReady = () => {
    if (useLocalEngine) return;
    setEngineStatus('pronto', fmt(L.brythonOk, { v: (window.__BRYTHON__ && __BRYTHON__.implementation) ? __BRYTHON__.implementation.slice(0, 3).join('.') : '' }));
    enableExecution();
  };
  function loadScript(src) {
    return new Promise((ok, errorText) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => errorText(new Error(src)); document.head.appendChild(s); });
  }
  async function startBrython() {
    setEngineStatus('', L.loadingBrowserPy);
    const failBrowserEngine = () => setEngineStatus('falhou', L.brythonFail);
    const timeout = setTimeout(() => { if (!engineReady) failBrowserEngine(); }, 30000);
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/brython@3.12.4/brython.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/brython@3.12.4/brython_stdlib.js');
      const runner = await fetch('browser_runner.py');
      if (!runner.ok) throw new Error('HTTP ' + runner.status);
      document.getElementById('browser-python').textContent = await runner.text();
      window.brython({ debug: 1 });
    } catch (e) { clearTimeout(timeout); failBrowserEngine(); }
  }
  async function startEngine() {
    if (window.LAB_TOKEN) {
      try {
        const r = await fetch('api/status', { headers: { 'X-Lab-Token': window.LAB_TOKEN } });
        if (r.ok) {
          const info = await r.json();
          useLocalEngine = true;
          setEngineStatus('pronto', fmt(L.localOk, { v: info.versao }));
          enableExecution();
          route();
          return;
        }
      } catch (e) {}
    }
    startBrython();
  }

  async function runExercise(sourceCode, extra, inputLines, argv, onOutput, onVariables, shouldDebug) {
    if (useLocalEngine) {
      try {
        const r = await fetch('api/executar', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lab-Token': window.LAB_TOKEN },
          body: JSON.stringify({ codigo: sourceCode, verificacao: extra || '', entradas: inputLines, argv, depurar: !!shouldDebug })
        });
        const res = await r.json();
        if (!r.ok) { onOutput('tb', L.serverRefused + (res.erro || r.status)); return { status: 'erro', passos: [] }; }
        (res.saida || []).forEach(([outputType, outputText]) => onOutput(outputType, outputText));
        if (res.status === 'falhou') onOutput('assert', res.assercao || '');
        onVariables(res.vars || []);
        return { status: res.status, passos: res.passos || [], saida: res.saida || [], cortado: res.cortado };
      } catch (e) {
        onOutput('tb', fmt(L.serverDown, { m: e.message }));
        return { status: 'erro', passos: [] };
      }
    }
    outputListener = onOutput; variablesListener = onVariables;
    try { return { status: window.pyExecute(sourceCode, extra || '', inputLines, argv), passos: [] }; }
    catch (e) { onOutput('tb', L.internalErr + (e && e.message ? e.message : e)); return { status: 'erro', passos: [] }; }
    finally { outputListener = null; variablesListener = null; }
  }

  // ---------- progresso ----------
  const activities = [];
  function updateProgress() {
    const total = activities.length, completedCount = activities.filter(id => state.completed[id]).length;
    const pct = total ? 100 * completedCount / total : 0;
    document.getElementById('barra').style.width = pct + '%';
    document.getElementById('pctProgresso').textContent = Math.round(pct) + '%';
    document.getElementById('txtProgresso').textContent = fmt(L.progress, { f: completedCount, t: total });
    if (window.COURSE && window.COURSE.progress) window.COURSE.progress(completedCount, total);
    COURSE_DATA.capitulos.forEach((chapterData, i) => {
      const ids = chapterData.atividades, f = ids.filter(id => state.completed[id]).length;
      const el = document.querySelector('#course-nav a[data-cap="' + i + '"] .cnt');
      if (el) { el.textContent = f + '/' + ids.length; el.classList.toggle('cheio', f === ids.length && ids.length > 0); }
    });
  }
  function markComplete(id) {
    if (!state.completed[id]) { state.completed[id] = true; saveState(); updateProgress(); }
    document.querySelectorAll('.feito[data-feito]').forEach(el => { if (el.dataset.feito === id) el.textContent = L.done; });
  }
  const completionMarker = id => '<span class="feito" data-feito="' + escAttr(id) + '">' + (state.completed[id] ? L.done : '') + '</span>';

  // ---------- editor ----------
  function createEditor(id, initialCode) {
    const savedCode = state.savedCode[id];
    const box = document.createElement('div');
    box.className = 'editor';
    box.innerHTML = '<div class="ed-wrap"><div class="gutter"></div><div class="area"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="' + escAttr(L.editorAria) + '"></textarea></div></div>';
    const ta = box.querySelector('textarea'), pre = box.querySelector('pre'), gut = box.querySelector('.gutter');
    ta.value = savedCode != null ? savedCode : initialCode;
    let errorLine = 0, activeLine = 0;
    function repaint() {
      const lines = ta.value.split('\n');
      let html = highlightCode(ta.value, 'python');
      const highlightedLine = activeLine || errorLine, className = activeLine ? 'linha-atual' : 'linha-erro';
      if (highlightedLine) {
        const highlightedLines = html.split('\n');
        if (highlightedLines[highlightedLine - 1] !== undefined) highlightedLines[highlightedLine - 1] = '<span class="' + className + '">' + (highlightedLines[highlightedLine - 1] || ' ') + '</span>';
        html = highlightedLines.join('\n');
      }
      pre.innerHTML = html + '\n';
      gut.innerHTML = lines.map((_, i) => i + 1 === highlightedLine ? '<span class="' + (activeLine ? 'atual' : 'erro') + '">' + (i + 1) + '</span>' : (i + 1)).join('\n');
      const editorWidth = Math.max(...lines.map(l => l.length)) + 2;
      pre.style.minWidth = 'calc(' + editorWidth + 'ch + 28px)';
    }
    ta.addEventListener('input', () => { errorLine = 0; activeLine = 0; repaint(); state.savedCode[id] = ta.value; saveState(); });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, f = ta.selectionEnd;
        if (e.shiftKey) {
          const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
          if (ta.value.slice(lineStart, lineStart + 4) === '    ') { ta.value = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + 4); ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - 4); }
        } else { ta.setRangeText('    ', s, f, 'end'); }
        ta.dispatchEvent(new Event('input'));
      } else if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const s = ta.selectionStart, lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
        const currentLineText = ta.value.slice(lineStart, s);
        let indentation = (currentLineText.match(/^\s*/) || [''])[0];
        if (/:\s*(#.*)?$/.test(currentLineText)) indentation += '    ';
        e.preventDefault();
        ta.setRangeText('\n' + indentation, s, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    });
    repaint();
    return {
      el: box, ta,
      getValue: () => ta.value,
      setValue: v => { ta.value = v; errorLine = 0; repaint(); state.savedCode[id] = v; saveState(); },
      markError: n => { errorLine = n; activeLine = 0; repaint(); },
      markCurrentLine: n => { activeLine = n; repaint(); },
      goToLine: n => {
        const lines = ta.value.split('\n'); let pos = 0;
        for (let i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
        ta.focus(); ta.setSelectionRange(pos, pos + (lines[n - 1] || '').length);
      }
    };
  }

  const ERROR_HINTS = L.errHints;

  // ---------- célula executável ----------
  function createExercise(opts) {
    // opts: id, codigo, verificacao, solucao, desafio(bool)
    const frag = document.createElement('div');
    const ed = createEditor(opts.id, opts.codigo);
    frag.appendChild(ed.el);
    const usesInput = /\binput\s*\(/.test(opts.codigo);
    const usesArguments = /sys\.argv|parse_args\(argv\)|argparse/.test(opts.codigo) && !opts.desafio;
    let inputField = null, argumentsField = null;
    if (usesInput) {
      const c = document.createElement('div'); c.className = 'campo';
      c.innerHTML = '<label>' + esc(L.inputs) + '</label><textarea aria-label="' + escAttr(L.inputs) + '" placeholder="' + escAttr(L.inputsPh) + '"></textarea>';
      inputField = c.querySelector('textarea'); inputField.value = opts.entradas || '';
      frag.appendChild(c);
    }
    if (usesArguments) {
      const c = document.createElement('div'); c.className = 'campo';
      c.innerHTML = '<label>' + esc(L.args) + '</label><input type="text" aria-label="' + escAttr(L.args) + '" placeholder="' + escAttr(L.argsPh) + '">';
      argumentsField = c.querySelector('input'); argumentsField.value = opts.argv || '';
      frag.appendChild(c);
    }
    const actions = document.createElement('div'); actions.className = 'acoes';
    actions.innerHTML =
      '<button class="btn prim btn-run"' + (engineReady ? '' : ' disabled') + '>' + esc(L.run) + '</button>' +
      (opts.desafio ? '<button class="btn ok btn-run btn-verif"' + (engineReady ? '' : ' disabled') + '>' + esc(L.verify) + '</button>' : '') +
      (useLocalEngine ? '<button class="btn btn-run btn-dep">' + esc(L.debug) + '</button>' : '') +
      '<button class="btn btn-insp">' + esc(L.vars) + '</button>' +
      '<button class="btn btn-reset">' + esc(L.reset) + '</button>' +
      (opts.desafio ? '<button class="btn btn-sol">' + esc(L.showSol) + '</button>' : '') +
      '<span class="atalho">' + L.shortcut + (opts.desafio ? L.shortcutVerify : '') + '</span>';
    frag.appendChild(actions);
    const outputElement = document.createElement('div'); outputElement.className = 'saida';
    outputElement.innerHTML = '<div class="cab"><span>' + esc(L.output) + '</span><span class="tempo"></span></div><div class="corpo"></div>';
    frag.appendChild(outputElement);
    const resultElement = document.createElement('div'); resultElement.className = 'resultado'; resultElement.setAttribute('role', 'status'); frag.appendChild(resultElement);
    const insp = document.createElement('div'); insp.className = 'inspetor tabela'; frag.appendChild(insp);
    const debuggerPanel = document.createElement('div'); debuggerPanel.className = 'depurador';
    const bt = (a, rot, txt) => '<button data-a="' + a + '" title="' + escAttr(rot) + '" aria-label="' + escAttr(rot) + '">' + txt + '</button>';
    debuggerPanel.innerHTML = '<div class="dep-cab">' + bt('ini', L.first, '⏮') + bt('ant', L.prev, '◀') + bt('prox', L.next, '▶') + bt('fim', L.last, '⏭') +
      '<input type="range" min="0" value="0" aria-label="' + escAttr(L.stepSlider) + '"><span class="dep-info"></span>' + bt('fechar', L.closeDbg, '✕') + '</div>' +
      '<div class="dep-evento"></div><div class="dep-corpo"><div><h5>' + esc(L.varsStep) + '</h5><div class="dep-vars"></div></div><div><h5>' + esc(L.outSoFar) + '</h5><pre class="dep-saida"></pre></div></div>';
    frag.appendChild(debuggerPanel);
    let solDiv = null;
    if (opts.desafio) {
      solDiv = document.createElement('div'); solDiv.className = 'solucao';
      solDiv.innerHTML = '<div class="cab"><span>' + esc(L.solution) + '</span></div><div class="estatico editor"><pre>' + highlightCode(opts.solucao, 'python') + '</pre></div><div class="acoes"><button class="btn btn-usar">' + esc(L.copyToEditor) + '</button></div>';
      frag.appendChild(solDiv);
      solDiv.querySelector('.btn-usar').onclick = () => ed.setValue(opts.solucao);
    }
    const outputBody = outputElement.querySelector('.corpo');
    let lastVariables = [];

    let steps = [], outputChunks = [], currentStep = 0;
    function renderVariablesTable(listElement) {
      if (!listElement || !listElement.length) return '<small class="mudo">' + esc(L.none) + '</small>';
      return '<table>' + listElement.map(([n, t, r]) => '<tr><td><b>' + esc(n) + '</b></td><td>' + esc(t) + '</td><td>' + esc(r) + '</td></tr>').join('') + '</table>';
    }
    function showStep(i) {
      if (!steps.length) return;
      currentStep = Math.max(0, Math.min(steps.length - 1, i));
      const p = steps[currentStep];
      ed.markCurrentLine(p.linha);
      debuggerPanel.querySelector('input').value = currentStep;
      const callStack = p.pilha.length > 1 ? p.pilha.slice(1).join(' → ') + '()' : L.moduleLevel;
      debuggerPanel.querySelector('.dep-info').textContent = fmt(L.stepInfo, { i: currentStep + 1, n: steps.length, l: p.linha, onde: callStack });
      const ev = debuggerPanel.querySelector('.dep-evento');
      if (p.evento === 'return' && p.pilha.length > 1) { ev.textContent = fmt(L.returned, { fn: p.pilha[p.pilha.length - 1], v: p.retorno }); ev.className = 'dep-evento vis'; }
      else if (p.evento === 'exception') { ev.textContent = L.exception + p.excecao; ev.className = 'dep-evento vis'; }
      else { ev.className = 'dep-evento'; ev.textContent = ''; }
      debuggerPanel.querySelector('.dep-vars').innerHTML = renderVariablesTable(p.vars) + (p.globais ? '<h5 style="margin-top:10px">' + esc(L.globals) + '</h5>' + renderVariablesTable(p.globais) : '');
      let outputText = '', remaining = p.saida;
      for (const [outputType, t] of outputChunks) { if (outputType === 'tb' || remaining <= 0) continue; outputText += t.slice(0, remaining); remaining -= t.length; }
      debuggerPanel.querySelector('.dep-saida').textContent = outputText || L.nothingYet;
      const sd = debuggerPanel.querySelector('.dep-saida'); sd.scrollTop = sd.scrollHeight;
    }
    debuggerPanel.querySelector('.dep-cab').addEventListener('click', e => {
      const b = e.target.closest('button'); const a = b && b.dataset.a; if (!a) return;
      if (a === 'fechar') { debuggerPanel.classList.remove('vis'); ed.markCurrentLine(0); return; }
      showStep({ ini: 0, ant: currentStep - 1, prox: currentStep + 1, fim: steps.length - 1 }[a]);
    });
    debuggerPanel.querySelector('input').addEventListener('input', e => showStep(+e.target.value));

    async function execute(shouldVerify, shouldDebug) {
      if (!engineReady) return;
      const runButtons = actions.querySelectorAll('.btn-run');
      runButtons.forEach(b => b.disabled = true);
      outputBody.innerHTML = '<span class="mudo">' + esc(L.running) + '</span>'; outputElement.classList.add('vis'); resultElement.className = 'resultado';
      ed.markError(0);
      if (!shouldDebug) debuggerPanel.classList.remove('vis');
      const inputLines = inputField ? inputField.value.split('\n').filter((l, i, a) => i < a.length - 1 || l !== '') : [];
      const argv = argumentsField ? argumentsField.value.trim().split(/\s+/).filter(Boolean) : [];
      let buffer = '';
      const t0 = performance.now();
      const res = await runExercise(ed.getValue(), shouldVerify ? opts.verificacao : '', inputLines, argv, (outputType, outputText) => {
        if (outputType === 'out') { buffer += esc(outputText); }
        else if (outputType === 'err') { buffer += '<span class="err">' + esc(outputText) + '</span>'; }
        else if (outputType === 'tb') {
          let tb = esc(outputText);
          let reportedLine = 0;
          tb = tb.replace(/File &quot;&lt;seu código&gt;&quot;, line (\d+)|File "&lt;seu código&gt;", line (\d+)/g, (m, a, b) => {
            const n = +(a || b); reportedLine = n;
            return m.replace(/line \d+/, '<a data-l="' + n + '">' + esc(L.line) + ' ' + n + '</a>');
          });
          const errorType = (outputText.trim().split('\n').pop().match(/^(\w+)/) || [])[1];
          buffer += '<div class="tb">' + tb + '</div>' + (ERROR_HINTS[errorType] ? '<div class="dica-erro">💡 ' + esc(ERROR_HINTS[errorType]) + '</div>' : '');
          if (reportedLine) ed.markError(reportedLine);
        } else if (outputType === 'assert') {
          resultElement.className = 'resultado vis falha';
          resultElement.textContent = fmt(L.notPassed, { m: outputText ? ' — ' + outputText : '' });
        }
      }, v => { lastVariables = v; }, shouldDebug);
      const status = res.status;
      runButtons.forEach(b => b.disabled = false);
      outputBody.innerHTML = buffer || '<span class="mudo">' + esc(L.noOutput) + '</span>';
      outputBody.querySelectorAll('a[data-l]').forEach(a => a.onclick = () => ed.goToLine(+a.dataset.l));
      outputElement.querySelector('.tempo').textContent = (status === 'erro' ? L.endedErr : '') + Math.round(performance.now() - t0) + ' ms';
      if (insp.classList.contains('vis')) showVariables();
      if (shouldDebug) {
        steps = res.passos || []; outputChunks = res.saida || [];
        if (steps.length) {
          debuggerPanel.classList.add('vis');
          debuggerPanel.querySelector('input').max = steps.length - 1;
          if (res.cortado) debuggerPanel.querySelector('.dep-info').title = L.truncated;
          showStep(0);
        }
      }
      if (shouldVerify) {
        if (status === 'ok') {
          resultElement.className = 'resultado vis ok';
          resultElement.textContent = L.passed;
          markComplete(opts.id);
        } else if (status === 'erro' && !resultElement.classList.contains('vis')) {
          resultElement.className = 'resultado vis falha';
          resultElement.textContent = L.errBeforeCheck;
        }
      } else if (!opts.desafio && (status !== 'erro' || opts.erroEsperado)) {
        markComplete(opts.id);
      }
    }
    function showVariables() {
      if (!lastVariables.length) { insp.innerHTML = '<small class="mudo">' + esc(L.runForVars) + '</small>'; return; }
      insp.innerHTML = '<table><tr><th>' + esc(L.colName) + '</th><th>' + esc(L.colType) + '</th><th>' + esc(L.colValue) + '</th></tr>' +
        lastVariables.map(([n, t, r]) => '<tr><td>' + esc(n) + '</td><td>' + esc(t) + '</td><td>' + esc(r) + '</td></tr>').join('') + '</table>';
    }
    actions.querySelector('.btn-run').onclick = () => execute(false);
    if (useLocalEngine) actions.querySelector('.btn-dep').onclick = () => execute(false, true);
    if (opts.desafio) actions.querySelector('.btn-verif').onclick = () => execute(true);
    actions.querySelector('.btn-insp').onclick = () => { insp.classList.toggle('vis'); showVariables(); };
    actions.querySelector('.btn-reset').onclick = () => { ed.setValue(opts.codigo); outputBody.innerHTML = ''; outputElement.classList.remove('vis'); resultElement.className = 'resultado'; };
    if (solDiv) actions.querySelector('.btn-sol').onclick = () => {
      if (solDiv.classList.contains('vis') || confirm(L.confirmSol)) solDiv.classList.toggle('vis');
    };
    ed.ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); execute(opts.desafio && e.shiftKey); } });
    ed.ta.addEventListener('keydown', e => { if (e.key === 'F10' && debuggerPanel.classList.contains('vis')) { e.preventDefault(); showStep(currentStep + (e.shiftKey ? -1 : 1)); } });
    return frag;
  }

  // ---------- renderização ----------
  const courseContent = document.getElementById('course-content');
  courseContent.innerHTML = '<p class="carregando">' + esc(L.loadingContent) + '</p>';
  function createStaticCode(code, lang) {
    const d = document.createElement('div'); d.className = 'estatico editor';
    d.innerHTML = '<pre>' + highlightCode(code, lang) + '</pre>';
    return d;
  }
  const NOTE_ICONS = { NOTA: 'i', 'ATENÇÃO': '!', DICA: '✓', NOVO: '★' };
  function renderChapter(ci) {
    const chapterData = COURSE_DATA.capitulos[ci];
    courseContent.innerHTML = '';
    const h = document.createElement('h2'); h.className = 'cap'; h.textContent = chapterData.titulo; courseContent.appendChild(h);
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
          el.innerHTML = '<div class="rot">' + esc((NOTE_ICONS[b.kind] || 'i') + ' ' + (L.notes[b.kind] || b.kind)) + '</div><div class="tx">' + inline(b.text) + '</div>';
          break;
        case 'table':
          el = document.createElement('div'); el.className = 'tabela';
          el.innerHTML = '<table>' + b.rows.map((r, i) => '<tr>' + r.map(c => (i ? '<td>' : '<th>') + inline(c) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('') + '</table>';
          break;
        case 'code':
          if (b.run || (useLocalEngine && b.lang === 'python')) { el = document.createElement('div'); el.style.margin = '18px 0'; el.appendChild(createExercise({ id: b.id || ('local-' + ci + '-' + b.code.length), codigo: b.code })); }
          else {
            el = document.createElement('div'); el.appendChild(createStaticCode(b.code, b.lang));
            if (b.lang === 'python') { const r = document.createElement('div'); r.className = 'req'; r.textContent = L.reqCode; el.appendChild(r); }
            else el.style.margin = '0 0 18px';
          }
          break;
        case 'ex': {
          el = document.createElement('div'); el.className = 'ex';
          el.innerHTML = '<div class="titulo">' + inline(b.titulo) + '</div><div class="meta"><span class="arquivo">' + esc(b.arquivo) + '</span>' + (b.run ? completionMarker(b.id) : '') + '</div>';
          if (b.run || (useLocalEngine && b.lang === 'python')) el.appendChild(createExercise({ id: b.id || ('local-' + ci + '-' + b.code.length), codigo: b.code, entradas: b.entradas, argv: b.argv, erroEsperado: b.erroEsperado }));
          else {
            el.appendChild(createStaticCode(b.code, b.lang));
            if (b.lang === 'python') { const r = document.createElement('div'); r.className = 'req'; r.style.margin = '8px 0 0'; r.textContent = L.reqEx; el.appendChild(r); }
          }
          if (b.callouts.length) {
            const ul = document.createElement('ul'); ul.className = 'callouts';
            ul.innerHTML = b.callouts.map((c, i) => '<li><span class="n">' + CIRC[i] + '</span><span>' + inline(c) + '</span></li>').join('');
            el.appendChild(ul);
          }
          break;
        }
        case 'desafio': {
          el = document.createElement('div'); el.className = 'ex desafio';
          el.innerHTML = '<div class="meta"><span class="pill">' + esc(L.challenge) + '</span>' + completionMarker(b.id) + '</div><div class="titulo">' + inline(b.titulo) + '</div><div class="enunciado">' + inline(b.enunciado) + '</div>';
          el.appendChild(createExercise({ id: b.id, codigo: b.inicial, verificacao: b.verificacao, solucao: b.solucao, desafio: true }));
          break;
        }
      }
      if (el) courseContent.appendChild(el);
    });
    const pag = document.createElement('div'); pag.className = 'paginacao';
    pag.innerHTML = (ci > 0 ? '<a href="#cap-' + ci + '">← ' + esc(COURSE_DATA.capitulos[ci - 1].titulo) + '</a>' : '<a href="#inicio">← ' + esc(L.home) + '</a>') +
      (ci < COURSE_DATA.capitulos.length - 1 ? '<a href="#cap-' + (ci + 2) + '">' + esc(COURSE_DATA.capitulos[ci + 1].titulo) + ' →</a>' : '<a href="#laboratorio">' + esc(L.lab) + ' →</a>');
    courseContent.appendChild(pag);
    document.getElementById('mobile-title').textContent = chapterData.titulo;
  }
  function renderHome() {
    const items = L.howItems.concat(useLocalEngine ? L.howLocal : L.howBrowser);
    courseContent.innerHTML = '<div class="inicio"><div class="prompt">$ python3 --version <em>→ 3.15</em></div><h2>' + esc(L.courseName) + '</h2><p class="sub">' + esc(COURSE_DATA.subtitulo) + '</p>' +
      '<div class="label"><span>' + esc(L.howTo) + '</span></div>' +
      '<div class="como"><ul>' + items.map(t => '<li>' + t + '</li>').join('') + '</ul></div>' +
      '<div class="label"><span>' + esc(L.chapters) + '</span></div><div class="cards">' +
      COURSE_DATA.capitulos.map((c, i) => {
        const n = c.atividades.length, f = c.atividades.filter(id => state.completed[id]).length;
        const num = (c.titulo.match(/^(\d+)\./) || [])[1];
        return '<a class="card" href="#cap-' + (i + 1) + '"><span class="row"><span class="cmd">' + esc(num ? fmt(L.chapter, { n: num.padStart(2, '0') }) : L.annex) + '</span>' +
          '<span class="' + (n && f === n ? 'ok' : '') + '">' + f + '/' + n + '</span></span><b>' + esc(c.titulo) + '</b><small>' + esc(n === 1 ? L.activity : fmt(L.activities, { n })) + '</small>' +
          '<span class="bar"><div style="width:' + (n ? 100 * f / n : 0) + '%"></div></span></a>';
      }).join('') +
      '<a class="card" href="#laboratorio"><span class="row"><span class="cmd">python3</span></span><b>' + esc(L.lab) + '</b><small>' + esc(L.labCard) + '</small></a></div></div>';
    document.getElementById('mobile-title').textContent = L.courseName;
  }
  function renderLab() {
    courseContent.innerHTML = '<h2 class="cap">' + esc(L.lab) + '</h2><p>' + esc(L.labIntro) + '</p>';
    const d = document.createElement('div'); d.className = 'ex';
    d.appendChild(createExercise({ id: 'laboratorio', codigo: L.labCode }));
    courseContent.appendChild(d);
    document.getElementById('mobile-title').textContent = L.lab;
  }

  // ---------- navegação ----------
  const nav = document.getElementById('course-nav');
  const menu = document.getElementById('course-sidebar'), btnMenu = document.getElementById('course-menu');
  function toggleSidebar(isOpen) { menu.classList.toggle('aberto', isOpen); btnMenu.setAttribute('aria-expanded', String(isOpen)); }
  let pendingAnchor = null;
  function route() {
    if (!COURSE_DATA) return;
    const h = location.hash.slice(1) || 'inicio';
    const m = h.match(/^cap-(\d+)$/);
    nav.querySelectorAll('a.cap').forEach(a => a.classList.toggle('ativo', a.getAttribute('href') === '#' + h));
    if (m && COURSE_DATA.capitulos[+m[1] - 1]) renderChapter(+m[1] - 1);
    else if (h === 'laboratorio') renderLab();
    else renderHome();
    const destination = pendingAnchor && document.getElementById(pendingAnchor);
    if (destination) destination.scrollIntoView(); else document.getElementById('course-main').scrollTop = 0;
    pendingAnchor = null;
  }
  function initialize(lessonData) {
    COURSE_DATA = lessonData;
    nav.innerHTML = '<a href="#inicio" class="cap">' + esc(L.home) + '</a>' + COURSE_DATA.capitulos.map((c, i) =>
      '<a class="cap" data-cap="' + i + '" href="#cap-' + (i + 1) + '"><span>' + esc(c.titulo) + '</span><span class="cnt"></span></a>' +
      c.secoes.map(s => '<a class="sec" href="#cap-' + (i + 1) + '" data-ancora="' + escAttr(s.ancora) + '">' + inline(s.titulo) + '</a>').join('')).join('') +
      '<a class="cap" href="#laboratorio">' + esc(L.lab) + '</a>';
    COURSE_DATA.capitulos.forEach(c => activities.push(...c.atividades));
    nav.addEventListener('click', e => {
      const a = e.target.closest('a'); if (!a) return;
      pendingAnchor = a.dataset.ancora || null;
      toggleSidebar(false);
      if (a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
    });
    window.addEventListener('hashchange', route);
    route();
    updateProgress();
    startEngine();
  }
  btnMenu.onclick = () => toggleSidebar(!menu.classList.contains('aberto'));
  document.getElementById('veu').onclick = () => toggleSidebar(false);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aberto')) toggleSidebar(false); });

  async function loadContent(lang) {
    const r = await fetch('content/' + lang + '.json');
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  (async () => {
    let lessonData = null;
    try { lessonData = await loadContent(LANG); }
    catch (e) { try { lessonData = await loadContent('pt'); } catch (e2) {} }
    if (!lessonData || !Array.isArray(lessonData.capitulos)) {
      courseContent.innerHTML = '<p class="carregando erro">' + esc(L.needHub) + '</p>';
      setEngineStatus('falhou', '—');
      return;
    }
    initialize(lessonData);
  })();
})();
