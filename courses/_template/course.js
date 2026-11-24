(function () {
  'use strict';

  const course = window.COURSE;
  const storageKey = course.id + '-progress-v1';
  const byId = id => document.getElementById(id);
  const labels = {
    chapters: { en: 'Chapters', es: 'Capítulos', pt: 'Capítulos' },
    menu: { en: 'Toggle chapter list', es: 'Mostrar u ocultar capítulos', pt: 'Abrir ou fechar capítulos' },
    complete: { en: 'Mark chapter complete', es: 'Marcar capítulo completado', pt: 'Concluir capítulo' },
    completed: { en: 'Chapter complete', es: 'Capítulo completado', pt: 'Capítulo concluído' },
    run: { en: 'Run', es: 'Ejecutar', pt: 'Executar' },
    running: { en: 'Running…', es: 'Ejecutando…', pt: 'Executando…' },
    offline: { en: 'Run this exercise in the local lab.', es: 'Ejecuta este ejercicio en el laboratorio local.', pt: 'Execute este exercício no laboratório local.' },
    error: { en: 'Could not load the course.', es: 'No se pudo cargar el curso.', pt: 'Não foi possível carregar o curso.' },
    passed: { en: 'Check passed.', es: 'Validación correcta.', pt: 'Verificação aprovada.' },
    failed: { en: 'Check failed.', es: 'Validación fallida.', pt: 'Falha na verificação.' },
  };
  const text = key => course.t(labels[key]);
  const title = course.t(course.titles) || course.title;
  const sidebar = byId('course-sidebar');
  const menu = byId('course-menu');
  const navigation = byId('course-nav');
  const content = byId('course-content');
  const main = byId('course-main');

  byId('course-title').textContent = title;
  byId('mobile-title').textContent = title;
  document.title = title;
  navigation.setAttribute('aria-label', text('chapters'));
  menu.setAttribute('aria-label', text('menu'));
  menu.addEventListener('click', () => setSidebar(!sidebar.classList.contains('is-open')));

  function setSidebar(open) {
    sidebar.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
  }

  function append(parent, tag, value) {
    const element = document.createElement(tag);
    if (value != null) element.textContent = value;
    parent.appendChild(element);
    return element;
  }

  function showOutput(output, response) {
    output.replaceChildren();
    if (course.engine === 'python') {
      output.textContent = (response.saida || []).map(([, chunk]) => chunk).join('');
      if (response.status === 'falhou') append(output, 'p', response.assercao || text('failed'));
      return response.status === 'ok';
    }
    if (!response.ok) {
      output.textContent = response.erro?.mensagem || text('failed');
      return false;
    }
    for (const result of response.resultados) {
      if (!result.colunas) continue;
      const table = append(output, 'table');
      const headerRow = append(append(table, 'thead'), 'tr');
      for (const column of result.colunas) append(headerRow, 'th', column).scope = 'col';
      const body = append(table, 'tbody');
      for (const values of result.linhas) {
        const row = append(body, 'tr');
        for (const value of values) append(row, 'td', value ?? 'NULL');
      }
    }
    if (response.verificacao?.ok === false) {
      append(output, 'p', response.verificacao.motivo || text('failed'));
      return false;
    }
    return true;
  }

  function renderExercise(exercise) {
    const section = append(content, 'section');
    section.className = 'exercise';
    section.id = exercise.id;
    append(section, 'h3', exercise.title);
    append(section, 'p', exercise.text);
    const editor = append(section, 'textarea');
    editor.value = exercise.code;
    editor.setAttribute('aria-label', exercise.title);
    editor.spellcheck = false;
    if (!window.LAB_TOKEN || course.engine === 'none') {
      editor.readOnly = true;
      if (course.engine !== 'none') append(section, 'p', text('offline'));
      return;
    }
    const run = append(section, 'button', text('run'));
    run.type = 'button';
    const output = append(section, 'div');
    output.className = 'exercise-output';
    output.setAttribute('role', 'status');
    run.addEventListener('click', async () => {
      run.disabled = true;
      output.textContent = text('running');
      try {
        const payload = course.engine === 'postgres'
          ? { sql: editor.value, esperado: exercise.check }
          : { codigo: editor.value, verificacao: exercise.check };
        const response = await fetch('api/executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Lab-Token': window.LAB_TOKEN },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        if (showOutput(output, await response.json()) && exercise.check) append(output, 'p', text('passed'));
      } catch (error) {
        output.textContent = error.message;
      } finally {
        run.disabled = false;
      }
    });
  }

  async function loadContent(language) {
    const response = await fetch('content/' + encodeURIComponent(language) + '.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  }

  async function initialize() {
    const sourceLanguage = course.language.toLowerCase().split('-')[0];
    const lesson = await loadContent(course.lang).catch(error => {
      if (course.lang === sourceLanguage) throw error;
      return loadContent(sourceLanguage);
    });
    const chapters = lesson.chapters;
    if (!Array.isArray(chapters) || !chapters.length) throw new Error('content needs at least one chapter');
    byId('course-subtitle').textContent = lesson.subtitle || '';
    let completed = new Set();
    try { completed = new Set(JSON.parse(localStorage.getItem(storageKey)) || []); } catch {}
    const links = chapters.map(chapter => {
      const link = append(navigation, 'a', chapter.title);
      link.href = '#' + chapter.id;
      return link;
    });

    function updateProgress() {
      const count = chapters.filter(chapter => completed.has(chapter.id)).length;
      byId('progress-label').textContent = count + ' / ' + chapters.length;
      byId('progress-fill').style.width = (100 * count / chapters.length) + '%';
      course.progress(count, chapters.length);
    }

    function renderChapter() {
      const requestedId = location.hash.slice(1);
      const index = Math.max(0, chapters.findIndex(chapter => chapter.id === requestedId));
      const chapter = chapters[index];
      links.forEach((link, position) => {
        if (position === index) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      content.replaceChildren();
      append(content, 'h2', chapter.title);
      for (const paragraph of chapter.paragraphs || []) append(content, 'p', paragraph);
      for (const exercise of chapter.exercises || []) renderExercise(exercise);
      const complete = append(content, 'button', text(completed.has(chapter.id) ? 'completed' : 'complete'));
      complete.type = 'button';
      complete.disabled = completed.has(chapter.id);
      complete.addEventListener('click', () => {
        completed.add(chapter.id);
        try { localStorage.setItem(storageKey, JSON.stringify([...completed])); } catch {}
        complete.textContent = text('completed');
        complete.disabled = true;
        updateProgress();
      });
      setSidebar(false);
      main.scrollTop = 0;
    }

    window.addEventListener('hashchange', renderChapter);
    renderChapter();
    updateProgress();
  }

  initialize().catch(error => append(content, 'p', text('error') + ' ' + error.message));
})();
