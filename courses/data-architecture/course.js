(function () {
  'use strict';
  var COURSE = window.COURSE || {};
  var LANG = ['en', 'es', 'pt'].indexOf(COURSE.lang) >= 0 ? COURSE.lang : 'en';
  var KEY = (COURSE.id || 'data-architecture') + '-v1';            // localStorage keys start with the trail id

  // ---------------------------------------------------------------- UI strings
  var UI = {
    en: {
      search: 'Search all chapters…', searchLabel: 'Search all chapters', chapters: 'Chapters', reset: 'Reset progress',
      resetConfirm: 'Reset all checkpoint answers and chapter progress for this course?', menu: 'Open chapter list',
      complete: '{d} of {t} chapters complete', part: 'Part', chapter: 'Chapter', readingCourse: 'Reading course · {n} chapters',
      intro: ['The course starts with the fundamentals of data engineering, then builds up modelling, data layers, ingestion (batch, CDC, micro-batching and real time), Apache Iceberg, Snowflake, orchestration and the open-source stack, and the semantic layer on top of the gold layer. Part IX compares ten reference architectures with the same skeleton, and Part X puts everything together in three end-to-end case studies.',
        'Each chapter closes with a design exercise (no answer key: reason it out) and four checkpoint questions. A chapter counts as complete when all four are answered correctly.'],
      start: 'Start', cont: 'Continue', allDone: 'Every chapter is complete.', parts: 'Parts', overview: 'Overview',
      inChapter: 'In this chapter', checkpoint: 'Checkpoint', checkpointSub: 'Answer all four correctly to complete the chapter.',
      minRead: '~{m} min read', answered: '{r} of {t} checkpoint questions answered', done: '✓ Complete',
      prev: '← Previous', next: 'Next →', loadingChapter: 'loading chapter {n}…', cantLoad: 'Could not load this chapter ({e}).',
      correct: 'Correct.', notQuite: 'Not quite.', thinkAgain: 'Think about it again, then retry.', retry: 'Try again',
      copy: 'Copy', copied: 'Copied', selectCopy: 'Select and copy', indexing: 'Indexing…', noMatches: 'No matches.', more: '{n} more…',
      useCase: 'Use case', exercise: 'Design exercise', hints: 'Hints', keypoints: 'Key points',
      note: 'Note', tip: 'Tip', warn: 'Warning', pitfall: 'Pitfall', code: 'Code',
      needHub: 'This trail loads its chapters from <code>content/</code>, so open it through the hub (<code>python engine/hub.py</code> or <code>docker compose up -d</code>, then http://127.0.0.1:8765).',
      progress: 'progress'
    },
    es: {
      search: 'Buscar en todos los capítulos…', searchLabel: 'Buscar en todos los capítulos', chapters: 'Capítulos', reset: 'Reiniciar progreso',
      resetConfirm: '¿Reiniciar todas las respuestas y el progreso de los capítulos de este curso?', menu: 'Abrir la lista de capítulos',
      complete: '{d} de {t} capítulos completados', part: 'Parte', chapter: 'Capítulo', readingCourse: 'Curso de lectura · {n} capítulos',
      intro: ['El curso empieza por los fundamentos de la ingeniería de datos y luego construye el modelado, las capas de datos, la ingesta (batch, CDC, micro-batching y tiempo real), Apache Iceberg, Snowflake, la orquestación y el stack open source, y la capa semántica sobre la capa gold. La Parte IX compara diez arquitecturas de referencia con la misma estructura, y la Parte X lo integra todo en tres casos de estudio de punta a punta.',
        'Cada capítulo termina con un ejercicio de diseño (sin respuesta: razónalo tú) y cuatro preguntas de control. Un capítulo cuenta como completado cuando las cuatro se responden correctamente.'],
      start: 'Empezar', cont: 'Continuar', allDone: 'Todos los capítulos están completados.', parts: 'Partes', overview: 'Resumen',
      inChapter: 'En este capítulo', checkpoint: 'Control', checkpointSub: 'Responde las cuatro correctamente para completar el capítulo.',
      minRead: '~{m} min de lectura', answered: '{r} de {t} preguntas de control respondidas', done: '✓ Completado',
      prev: '← Anterior', next: 'Siguiente →', loadingChapter: 'cargando el capítulo {n}…', cantLoad: 'No se pudo cargar este capítulo ({e}).',
      correct: 'Correcto.', notQuite: 'No exactamente.', thinkAgain: 'Piénsalo de nuevo y vuelve a intentarlo.', retry: 'Intentar de nuevo',
      copy: 'Copiar', copied: 'Copiado', selectCopy: 'Selecciona y copia', indexing: 'Indexando…', noMatches: 'Sin resultados.', more: '{n} más…',
      useCase: 'Caso de uso', exercise: 'Ejercicio de diseño', hints: 'Pistas', keypoints: 'Puntos clave',
      note: 'Nota', tip: 'Consejo', warn: 'Atención', pitfall: 'Trampa', code: 'Código',
      needHub: 'Este curso carga sus capítulos desde <code>content/</code>, así que ábrelo a través del hub (<code>python engine/hub.py</code> o <code>docker compose up -d</code>, y luego http://127.0.0.1:8765).',
      progress: 'progreso'
    },
    pt: {
      search: 'Buscar em todos os capítulos…', searchLabel: 'Buscar em todos os capítulos', chapters: 'Capítulos', reset: 'Zerar progresso',
      resetConfirm: 'Zerar todas as respostas e o progresso dos capítulos deste curso?', menu: 'Abrir a lista de capítulos',
      complete: '{d} de {t} capítulos concluídos', part: 'Parte', chapter: 'Capítulo', readingCourse: 'Curso de leitura · {n} capítulos',
      intro: ['O curso começa pelos fundamentos de engenharia de dados e depois constrói modelagem, camadas de dados, ingestão (batch, CDC, micro-batching e tempo real), Apache Iceberg, Snowflake, orquestração e o stack open source, e a camada semântica sobre a camada gold. A Parte IX compara dez arquiteturas de referência com a mesma estrutura, e a Parte X junta tudo em três estudos de caso de ponta a ponta.',
        'Cada capítulo termina com um exercício de design (sem gabarito: raciocine você mesmo) e quatro perguntas de verificação. Um capítulo conta como concluído quando as quatro são respondidas corretamente.'],
      start: 'Começar', cont: 'Continuar', allDone: 'Todos os capítulos estão concluídos.', parts: 'Partes', overview: 'Visão geral',
      inChapter: 'Neste capítulo', checkpoint: 'Verificação', checkpointSub: 'Acerte as quatro para concluir o capítulo.',
      minRead: '~{m} min de leitura', answered: '{r} de {t} perguntas de verificação respondidas', done: '✓ Concluído',
      prev: '← Anterior', next: 'Próximo →', loadingChapter: 'carregando o capítulo {n}…', cantLoad: 'Não foi possível carregar este capítulo ({e}).',
      correct: 'Correto.', notQuite: 'Não exatamente.', thinkAgain: 'Pense de novo e tente outra vez.', retry: 'Tentar de novo',
      copy: 'Copiar', copied: 'Copiado', selectCopy: 'Selecione e copie', indexing: 'Indexando…', noMatches: 'Nenhum resultado.', more: 'mais {n}…',
      useCase: 'Caso de uso', exercise: 'Exercício de design', hints: 'Dicas', keypoints: 'Pontos-chave',
      note: 'Nota', tip: 'Dica', warn: 'Atenção', pitfall: 'Armadilha', code: 'Código',
      needHub: 'Este curso carrega os capítulos de <code>content/</code>, então abra-o pelo hub (<code>python engine/hub.py</code> ou <code>docker compose up -d</code>, depois http://127.0.0.1:8765).',
      progress: 'progresso'
    }
  };
  var L = UI[LANG];
  function fmt(s, v) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return v[k]; }); }

  document.getElementById('search').placeholder = L.search;
  document.getElementById('search').setAttribute('aria-label', L.searchLabel);
  document.getElementById('course-nav').setAttribute('aria-label', L.chapters);
  document.getElementById('reset').textContent = L.reset;
  document.getElementById('course-menu').setAttribute('aria-label', L.menu);

  // ---------------------------------------------------------------- state
  var state = { quiz: {}, done: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY)); if (saved) state = Object.assign(state, saved); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  // ---------------------------------------------------------------- data (content/<lang>/, English fallback)
  var BASE = 'content/' + LANG + '/', FALLBACK = 'content/en/';
  var manifest = null, chapters = [], byId = {}, cache = {};
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fileOf(ch) { return pad(ch.num) + '-' + ch.id + '.json'; }
  function getJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(url + ': HTTP ' + r.status);
      return r.json();
    });
  }
  function getLocal(name) {
    return getJSON(BASE + name).catch(function (e) { if (BASE === FALLBACK) throw e; return getJSON(FALLBACK + name); });
  }
  function loadChapter(id) {
    if (!cache[id]) cache[id] = getLocal(fileOf(byId[id])).catch(function (e) { delete cache[id]; throw e; });
    return cache[id];
  }

  // ---------------------------------------------------------------- text helpers
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(s) {             // **bold**, *italic*, `code` on escaped text
    var parts = String(s == null ? '' : s).split('`');
    return parts.map(function (part, i) {
      if (i % 2) return '<code>' + esc(part) + '</code>';
      return esc(part).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<i>$2</i>');
    }).join('');
  }
  function plain(s) { return String(s == null ? '' : s).replace(/[*`]/g, ''); }

  var KW = {
    sql: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|ON|GROUP|BY|ORDER|HAVING|WITH|AS|AND|OR|NOT|IN|IS|NULL|CASE|WHEN|THEN|ELSE|END|INSERT|INTO|VALUES|UPDATE|SET|DELETE|MERGE|USING|MATCHED|CREATE|TABLE|VIEW|REPLACE|ALTER|DROP|ADD|PARTITION|PARTITIONED|CLUSTER|OVER|ROWS|RANGE|BETWEEN|PRECEDING|FOLLOWING|CURRENT|ROW|UNION|ALL|DISTINCT|LIMIT|QUALIFY|WINDOW|PRIMARY|KEY|REFERENCES|DEFAULT|INTERVAL|EXISTS|LATERAL|TIMESTAMP|DATE|STREAM|TASK|STAGE|PIPE|COPY|GRANT|TO|ROLE|POLICY|RETURNS|DYNAMIC|WAREHOUSE|SCHEDULE|IF|CALL|TBLPROPERTIES|VERSION|OF|SYSTEM_TIME|TRUE|FALSE)\b/gi,
    python: /\b(def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|with|yield|lambda|try|except|finally|raise|None|True|False|async|await|pass)\b/g
  };
  function highlight(code, lang) {
    var out = esc(code);
    var hasComment = lang === 'sql' || lang === 'python' || lang === 'yaml' || lang === 'bash';
    if (!KW[lang] && !hasComment) return out;
    return out.split('\n').map(function (line) {
      var cm = '';
      if (lang === 'sql') { var i = line.indexOf('--'); if (i >= 0) { cm = line.slice(i); line = line.slice(0, i); } }
      else if (hasComment) { var m = line.match(/(^|\s)#.*$/); if (m) { cm = line.slice(m.index); line = line.slice(0, m.index); } }
      var segs = line.split(/(&#39;[^&]*?&#39;|&quot;[^&]*?&quot;)/);
      line = segs.map(function (seg, k) {
        if (k % 2) return '<span class="st">' + seg + '</span>';
        return KW[lang] ? seg.replace(KW[lang], '<span class="kw">$1</span>') : seg;
      }).join('');
      return line + (cm ? '<span class="cm">' + cm + '</span>' : '');
    }).join('\n');
  }

  // ---------------------------------------------------------------- block renderers
  var LANGNAME = { sql: 'SQL', python: 'Python', yaml: 'YAML', json: 'JSON', bash: 'Shell', text: 'Text' };
  var codeStore = [];
  var RENDER = {
    h2: function (b) { return '<h3 class="sec" id="' + b._anchor + '">' + inline(b.text) + '</h3>'; },
    h3: function (b) { return '<h4 class="sub">' + inline(b.text) + '</h4>'; },
    p: function (b) { return '<p>' + inline(b.text) + '</p>'; },
    ul: function (b) { return '<ul class="list">' + (b.items || []).map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>'; },
    ol: function (b) { return '<ol class="list">' + (b.items || []).map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ol>'; },
    note: function (b) {
      var k = { note: 1, tip: 1, warn: 1, pitfall: 1 }[b.kind] ? b.kind : 'note';
      return '<div class="callout ' + k + '"><div><div class="lab">' + L[k] + '</div><p>' + inline(b.text) + '</p></div></div>';
    },
    code: function (b) {
      codeStore.push(b.text || '');
      return '<div class="codebox"><div class="hd"><span>' + esc(b.title || LANGNAME[b.lang] || b.lang || L.code) + '</span>' +
        '<button type="button" data-copy="' + (codeStore.length - 1) + '">' + L.copy + '</button></div>' +
        '<pre><code>' + highlight(b.text || '', b.lang) + '</code></pre></div>';
    },
    table: function (b) {
      return '<div class="table"><table><thead><tr>' + (b.head || []).map(function (h) { return '<th>' + inline(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' + (b.rows || []).map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    },
    flow: function (b) {
      var steps = (b.steps || []).map(function (s) {
        return '<div class="step"><b>' + inline(s.label) + '</b>' + (s.sub ? '<span>' + inline(s.sub) + '</span>' : '') + '</div>';
      }).join('<div class="arrow" aria-hidden="true">→</div>');
      return figure(b, '<div class="flow">' + steps + '</div>');
    },
    stack: function (b) {
      var n = (b.layers || []).length;
      var layers = (b.layers || []).map(function (l, i) {
        var mix = Math.round(4 + 14 * i / Math.max(1, n - 1));          // deeper layers get a stronger tint
        return '<div class="layer" style="--mix:' + mix + '%"><b>' + inline(l.label) + '</b><span>' + inline(l.sub || '') + '</span></div>';
      }).join('');
      return figure(b, '<div class="stack">' + layers + '</div>');
    },
    diagram: function (b) { return figure(b, '<pre class="ascii">' + esc(b.text) + '</pre>'); },
    case: function (b) {
      return '<div class="box case"><div class="lab">' + L.useCase + '</div><h5>' + inline(b.title) + '</h5><p>' + inline(b.text) + '</p>' +
        (b.items && b.items.length ? RENDER.ul(b) : '') + '</div>';
    },
    exercise: function (b) {
      return '<div class="box exercise"><div class="lab">' + L.exercise + '</div><h5>' + inline(b.title) + '</h5><p>' + inline(b.text) + '</p>' +
        (b.hints && b.hints.length ? '<details class="hints"><summary>' + L.hints + '</summary>' + RENDER.ul({ items: b.hints }) + '</details>' : '') + '</div>';
    },
    keypoints: function (b) { return '<div class="box keypoints"><div class="lab">' + L.keypoints + '</div>' + RENDER.ul(b) + '</div>'; },
    quiz: function (b) {
      return '<div class="quiz" data-quiz="' + esc(b.id) + '"><div class="q">' + inline(b.q) + '</div><div class="opts">' +
        (b.options || []).map(function (o, i) {
          return '<button type="button" class="opt" data-i="' + i + '"><span class="k">' + 'abcd'.charAt(i) + ')</span><span>' + inline(o) + '</span></button>';
        }).join('') + '</div><div class="why" hidden></div></div>';
    }
  };
  function figure(b, inner) {
    return '<figure>' + (b.title ? '<div class="ft">' + inline(b.title) + '</div>' : '') + inner +
      (b.caption ? '<figcaption>' + inline(b.caption) + '</figcaption>' : '') + '</figure>';
  }

  // ---------------------------------------------------------------- progress
  function quizzesOf(ch) { return (ch.blocks || []).filter(function (b) { return b.t === 'quiz'; }); }
  function chapterComplete(ch) {
    var qs = quizzesOf(ch);
    return qs.length > 0 && qs.every(function (q) { return state.quiz[q.id] === q.answer; });
  }
  function updateProgress() {
    var total = chapters.length;
    var done = chapters.filter(function (c) { return state.done[c.id]; }).length;
    document.getElementById('bar').style.width = (total ? 100 * done / total : 0) + '%';
    document.getElementById('ptext').textContent = fmt(L.complete, { d: done, t: total });
    if (COURSE.progress) COURSE.progress(done, total);
    renderNav();
  }

  // ---------------------------------------------------------------- navigation
  var current = null;
  function renderNav() {
    var html = '';
    manifest.parts.forEach(function (part) {
      html += '<div class="part"><b>' + esc(part.id) + '</b><span>' + esc(part.title) + '</span></div>';
      part.chapters.forEach(function (ch) {
        html += '<a href="#/' + ch.id + '"' + (current === ch.id ? ' class="active" aria-current="page"' : '') + '>' +
          '<span class="n">' + ch.num + '</span><span class="t">' + esc(ch.title) + '</span>' +
          (state.done[ch.id] ? '<span class="ck">✓</span>' : '') + '</a>';
      });
    });
    document.getElementById('course-nav').innerHTML = html;
  }

  var content = document.getElementById('course-content'), mainEl = document.getElementById('course-main');
  function setTitle(t) { document.title = t; document.getElementById('mobile-title').textContent = t; }

  function renderHome() {
    current = null;
    setTitle(manifest.title);
    var next = chapters.filter(function (c) { return !state.done[c.id]; })[0];
    var doneCount = chapters.filter(function (c) { return state.done[c.id]; }).length;
    var html = '<div class="eyebrow">' + esc(fmt(L.readingCourse, { n: chapters.length })) + '</div>' +
      '<h2 class="title">' + esc(manifest.title) + '</h2>' +
      '<div class="prompt">$ course --status <em>' + esc(fmt(L.complete, { d: doneCount, t: chapters.length })) + '</em></div>' +
      '<div class="home-intro"><p>' + esc(manifest.subtitle) + '.</p>' + L.intro.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div>' +
      (next ? '<a class="continue" href="#/' + next.id + '">' + (doneCount ? L.cont : L.start) + ': ' +
        next.num + '. ' + esc(next.title) + ' →</a>' : '<p><b>' + L.allDone + '</b></p>') +
      '<div class="label"><span>' + L.parts + '</span></div>' +
      '<div class="parts">' + manifest.parts.map(function (part) {
        var d = part.chapters.filter(function (c) { return state.done[c.id]; }).length;
        return '<div class="partcard"><div class="eyebrow">' + L.part + ' ' + esc(part.id) + '</div><h4>' + esc(part.title) + '</h4><ol>' +
          part.chapters.map(function (c) {
            return '<li><span>' + c.num + '.</span><a href="#/' + c.id + '">' + esc(c.title) + '</a>' +
              (state.done[c.id] ? '<span class="ck">✓</span>' : '') + '</li>';
          }).join('') + '</ol><div class="bar"><div style="width:' + (100 * d / part.chapters.length) + '%"></div></div></div>';
      }).join('') + '</div>';
    content.innerHTML = html;
    renderNav();
    mainEl.scrollTop = 0;
  }

  function anchorsFor(ch) {
    var used = {}, out = [];
    (ch.blocks || []).forEach(function (b, i) {
      if (b.t !== 'h2') return;
      // anchors come from the section number ("22.1" -> "22-1"), identical in every language
      var num = String(b.text).match(/^\s*(\d+(?:\.\d+)*)/);
      var a = num ? num[1].replace(/\./g, '-') : 's' + (out.length + 1);
      while (used[a]) a += '-x'; used[a] = 1;
      b._anchor = a; out.push(b);
    });
    return out;
  }

  function renderChapter(id, anchor) {
    var meta = byId[id];
    current = id;
    renderNav();
    setTitle(meta.num + '. ' + meta.title);
    content.innerHTML = '<p class="loading">' + esc(fmt(L.loadingChapter, { n: meta.num })) + '</p>';
    loadChapter(id).then(function (ch) {
      if (current !== id) return;
      codeStore = [];
      var sections = anchorsFor(ch);
      var body = '', quizStarted = false;
      (ch.blocks || []).forEach(function (b) {
        if (b.t === 'quiz' && !quizStarted) {
          quizStarted = true;
          body += '<h3 class="quizhead" id="checkpoint">' + L.checkpoint + '</h3><div class="quizsub">' + L.checkpointSub + '</div>';
        }
        var r = RENDER[b.t];
        body += r ? r(b) : '';
      });
      var idx = chapters.indexOf(meta), prev = chapters[idx - 1], nextC = chapters[idx + 1];
      content.innerHTML =
        '<div class="eyebrow">' + L.part + ' ' + esc(meta.part) + ' · ' + esc(meta.partTitle) + ' · ' + L.chapter + ' ' + meta.num + '</div>' +
        '<h2 class="title">' + esc(meta.title) + '</h2>' +
        (ch.summary ? '<p class="summary">' + inline(ch.summary) + '</p>' : '') +
        '<div class="meta" id="cmeta"></div>' +
        (sections.length ? '<div class="toc"><div class="eyebrow">' + L.inChapter + '</div><ol>' + sections.map(function (s) {
          return '<li><a href="#/' + id + '/' + s._anchor + '">' + inline(s.text) + '</a></li>';
        }).join('') + (quizStarted ? '<li><a href="#/' + id + '/checkpoint">' + L.checkpoint + '</a></li>' : '') + '</ol></div>' : '') +
        body +
        '<div class="pager">' +
        (prev ? '<a class="prev" href="#/' + prev.id + '"><small>' + L.prev + '</small>' + prev.num + '. ' + esc(prev.title) + '</a>' : '<a class="prev" href="#/"><small>←</small>' + L.overview + '</a>') +
        (nextC ? '<a class="next" href="#/' + nextC.id + '"><small>' + L.next + '</small>' + nextC.num + '. ' + esc(nextC.title) + '</a>' : '<a class="next" href="#/"><small>→</small>' + L.overview + '</a>') +
        '</div>';
      wireChapter(ch);
      var el = anchor && document.getElementById(anchor);
      if (el) el.scrollIntoView(); else mainEl.scrollTop = 0;
    }).catch(function (e) {
      if (current !== id) return;
      content.innerHTML = '<p class="msg">' + esc(fmt(L.cantLoad, { e: e.message })) + '</p>';
    });
  }

  function showMeta(ch) {
    var el = document.getElementById('cmeta');
    if (!el) return;
    var qs = quizzesOf(ch), right = qs.filter(function (q) { return state.quiz[q.id] === q.answer; }).length;
    el.innerHTML = (ch.minutes ? esc(fmt(L.minRead, { m: ch.minutes })) + ' · ' : '') +
      (state.done[ch.id] ? '<span class="done">' + L.done + '</span>' : esc(fmt(L.answered, { r: right, t: qs.length })));
  }

  function wireChapter(ch) {
    var quizzes = {};
    quizzesOf(ch).forEach(function (q) { quizzes[q.id] = q; });
    content.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = codeStore[+btn.dataset.copy];
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          btn.textContent = L.copied; setTimeout(function () { btn.textContent = L.copy; }, 1200);
        }, function () { btn.textContent = L.selectCopy; });
      });
    });
    content.querySelectorAll('.quiz').forEach(function (box) {
      var q = quizzes[box.dataset.quiz];
      if (!q) return;
      function paint(choice) {
        var why = box.querySelector('.why');
        box.querySelectorAll('.opt').forEach(function (b) {
          var i = +b.dataset.i;
          b.classList.toggle('right', choice != null && i === q.answer && choice === q.answer);
          b.classList.toggle('wrong', choice != null && i === choice && choice !== q.answer);
          b.disabled = choice != null;
        });
        if (choice == null) { why.hidden = true; why.innerHTML = ''; return; }
        var ok = choice === q.answer;
        why.hidden = false;
        why.className = 'why ' + (ok ? 'right' : 'wrong');
        why.innerHTML = '<b>' + (ok ? L.correct : L.notQuite) + '</b> ' + (ok ? inline(q.explain) : L.thinkAgain) +
          (ok ? '' : '<br><button type="button" class="retry">' + L.retry + '</button>');
        var retry = why.querySelector('.retry');
        if (retry) retry.addEventListener('click', function () { delete state.quiz[q.id]; save(); paint(null); showMeta(ch); });
      }
      box.querySelectorAll('.opt').forEach(function (b) {
        b.addEventListener('click', function () {
          state.quiz[q.id] = +b.dataset.i;
          var wasDone = !!state.done[ch.id];
          if (chapterComplete(ch)) state.done[ch.id] = true;
          save();
          paint(state.quiz[q.id]);
          if (!wasDone && state.done[ch.id]) updateProgress();
          showMeta(ch);
        });
      });
      paint(q.id in state.quiz ? state.quiz[q.id] : null);
    });
    showMeta(ch);
  }

  // ---------------------------------------------------------------- routing
  function route() {
    var m = location.hash.match(/^#\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/);
    document.getElementById('course-sidebar').classList.remove('open');
    if (m && byId[m[1]]) renderChapter(m[1], m[2]);
    else renderHome();
  }
  window.addEventListener('hashchange', route);
  document.getElementById('course-menu').addEventListener('click', function () {
    document.getElementById('course-sidebar').classList.toggle('open');
  });

  // ---------------------------------------------------------------- search
  var searchBox = document.getElementById('search'), results = document.getElementById('results');
  var index = null, indexing = null;
  function buildIndex() {
    if (indexing) return indexing;
    indexing = Promise.all(chapters.map(function (c) {
      return loadChapter(c.id).then(function (ch) { return { meta: c, ch: ch }; }, function () { return null; });
    })).then(function (all) {
      index = [];
      all.forEach(function (x) {
        if (!x) return;
        anchorsFor(x.ch);
        var section = { title: x.meta.title, anchor: '' };
        x.ch.blocks.forEach(function (b) {
          var text = '';
          if (b.t === 'h2') { section = { title: plain(b.text), anchor: b._anchor }; text = b.text; }
          else if (b.t === 'table') text = (b.head || []).concat.apply(b.head || [], b.rows || []).join(' ');
          else if (b.t === 'flow') text = (b.steps || []).map(function (s) { return s.label + ' ' + (s.sub || ''); }).join(' ');
          else if (b.t === 'stack') text = (b.layers || []).map(function (s) { return s.label + ' ' + (s.sub || ''); }).join(' ');
          else if (b.t === 'quiz') text = b.q + ' ' + (b.options || []).join(' ');
          else text = [b.text, b.title, (b.items || []).join(' '), (b.hints || []).join(' ')].filter(Boolean).join(' ');
          index.push({ meta: x.meta, section: section, text: fold(plain(text)) });
        });
      });
    });
    return indexing;
  }
  function fold(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var timer = null;
  searchBox.addEventListener('focus', buildIndex);
  searchBox.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(runSearch, 150); });
  function runSearch() {
    var q = fold(searchBox.value.trim());
    if (q.length < 2) { results.hidden = true; return; }
    results.hidden = false;
    if (!index) { results.innerHTML = '<div class="none">' + L.indexing + '</div>'; buildIndex().then(runSearch); return; }
    var words = q.split(/\s+/), seen = {}, hits = [];
    index.forEach(function (row) {
      if (!words.every(function (w) { return row.text.indexOf(w) >= 0; })) return;
      var k = row.meta.id + '/' + row.section.anchor;
      if (seen[k]) return;
      seen[k] = 1;
      hits.push(row);
    });
    results.innerHTML = hits.length ? hits.slice(0, 25).map(function (h) {
      return '<a href="#/' + h.meta.id + (h.section.anchor ? '/' + h.section.anchor : '') + '">' + esc(h.section.title) +
        '<small>' + h.meta.num + '. ' + esc(h.meta.title) + '</small></a>';
    }).join('') + (hits.length > 25 ? '<div class="none">' + esc(fmt(L.more, { n: hits.length - 25 })) + '</div>' : '')
      : '<div class="none">' + L.noMatches + '</div>';
  }
  searchBox.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { searchBox.value = ''; results.hidden = true; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement === document.body) { e.preventDefault(); searchBox.focus(); }
  });

  document.getElementById('reset').addEventListener('click', function () {
    if (!confirm(L.resetConfirm)) return;
    state = { quiz: {}, done: {} };
    save();
    updateProgress();
    route();
  });

  // ---------------------------------------------------------------- start
  getLocal('manifest.json').then(function (m) {
    manifest = m;
    document.getElementById('course-title').textContent = m.title;
    document.getElementById('course-subtitle').textContent = m.subtitle;
    m.parts.forEach(function (part) {
      part.chapters.forEach(function (c) {
        c.part = part.id; c.partTitle = part.title;
        chapters.push(c); byId[c.id] = c;
      });
    });
    Object.keys(state.done).forEach(function (id) { if (!byId[id]) delete state.done[id]; });
    updateProgress();
    route();
  }).catch(function (e) {
    content.innerHTML = '<p class="msg">' + L.needHub + ' (' + esc(e.message) + ')</p>';
  });
})();
