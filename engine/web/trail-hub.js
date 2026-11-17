/* Trails Lab top bar: loaded by the home page and injected by the hub into every trail page,
 * right before </head>, together with engine/web/theme.css.
 *
 * It owns two platform-wide settings, stored in this browser:
 *   theme      dark | light | dracula      ->  <html data-theme="...">        key trails-hub:theme
 *   language   en | es | pt                ->  window.TRAIL.lang, <html lang>  key trails-hub:lang
 * The theme switches live. Changing the language reloads the page, so a page only has to read
 * window.TRAIL.lang once at start-up (window.TRAIL.t({en, es, pt}) picks the right string).
 *
 * On trail pages window.TRAIL = {id, title, titles, engine, language, home, trails} comes from the hub;
 * this script adds TRAIL.progress(done, total) (shown on the home card), remembers the last
 * location.hash of each trail, and renders the bar as the first element of <body>: brand, "All trails",
 * a trail switcher, the theme picker and the EN | ES | PT toggle.
 */
(function () {
  'use strict';
  var ctx = window.TRAIL = window.TRAIL || {};
  var PREFIX = 'trails-hub:';
  var THEMES = ['dark', 'light', 'dracula'];
  var LANGS = ['en', 'es', 'pt'];
  var root = document.documentElement;

  function get(k) { try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(PREFIX + k, v); } catch (e) {} }

  // ---- theme: applied immediately (this script runs in <head>), so there is no flash
  var theme = get('theme');
  if (!theme) { try { theme = localStorage.getItem('trails-hub-theme'); } catch (e) {} }   // key used before v2
  if (THEMES.indexOf(theme) < 0) theme = 'dark';
  root.dataset.theme = theme;

  // ---- language
  function detect() {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    nav = nav.toLowerCase();
    return nav.indexOf('pt') === 0 ? 'pt' : nav.indexOf('es') === 0 ? 'es' : 'en';
  }
  var lang = get('lang');
  if (LANGS.indexOf(lang) < 0) lang = detect();
  ctx.lang = lang;
  ctx.theme = theme;
  ctx.LANGS = LANGS;
  root.lang = lang === 'pt' ? 'pt-BR' : lang;
  ctx.t = function (map) { return map == null ? '' : typeof map === 'string' ? map : (map[lang] != null ? map[lang] : map.en); };

  var T = {
    all: { en: 'All trails', es: 'Todas las rutas', pt: 'Todas as trilhas' },
    pick: { en: 'Switch trail', es: 'Cambiar de ruta', pt: 'Trocar de trilha' },
    theme: { en: 'theme', es: 'tema', pt: 'tema' },
    lang: { en: 'lang', es: 'idioma', pt: 'idioma' },
    themes: { dark: { en: 'Dark', es: 'Oscuro', pt: 'Escuro' }, light: { en: 'Light', es: 'Claro', pt: 'Claro' }, dracula: { en: 'Dracula', es: 'Dracula', pt: 'Dracula' } },
    langNames: { en: 'English', es: 'Español', pt: 'Português' }
  };

  // ---- progress and last position (trail pages only)
  function key(kind, id) { return kind + ':' + (id || ctx.id); }
  if (ctx.id) {
    ctx.progress = function (done, total) {
      set(key('progress'), JSON.stringify({ done: Number(done) || 0, total: Number(total) || 0, at: Date.now() }));
    };
    var remember = function () { set(key('last'), JSON.stringify({ hash: location.hash || '', at: Date.now() })); };
    remember();
    window.addEventListener('hashchange', remember);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function titleOf(t) { return (t.titles && t.titles[lang]) || t.title; }

  // ---- the bar
  function render() {
    var trails = ctx.trails || [];
    var html = '<a class="th-brand" href="' + esc(ctx.home || '/') + '"><b>tl</b><span>trails-lab</span></a>';
    if (ctx.id) {
      html += '<nav class="th-crumbs" aria-label="Trails"><span class="th-sep">/</span>' +
        '<a href="' + esc(ctx.home || '/') + '">← <span class="th-home-label">' + esc(ctx.t(T.all)) + '</span></a>';
      if (trails.length > 1) {
        html += '<span class="th-sep th-sep-pick">/</span><select id="thTrail" aria-label="' + esc(ctx.t(T.pick)) + '">' + trails.map(function (t) {
          return '<option value="' + esc(t.id) + '"' + (t.id === ctx.id ? ' selected' : '') + '>' + esc(titleOf(t)) + '</option>';
        }).join('') + '</select>';
      }
      html += '</nav>';
    }
    html += '<span class="th-spacer"></span>' +
      '<label class="th-ctl"><span class="th-lbl">' + esc(ctx.t(T.theme)) + '</span><select id="thTheme" aria-label="Theme">' +
      THEMES.map(function (k) { return '<option value="' + k + '"' + (k === theme ? ' selected' : '') + '>' + esc(ctx.t(T.themes[k])) + '</option>'; }).join('') +
      '</select></label>' +
      '<span class="th-ctl"><span class="th-lbl">' + esc(ctx.t(T.lang)) + '</span><span class="th-seg" role="group" aria-label="Language">' +
      LANGS.map(function (k) {
        return '<button type="button" data-lang="' + k + '" aria-pressed="' + (k === lang) + '" title="' + T.langNames[k] + '">' + k.toUpperCase() + '</button>';
      }).join('') + '</span></span>';

    var bar = document.createElement('header');
    bar.className = 'th-top';
    bar.innerHTML = html;
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('th-has-bar');
    // pages written for the first version left a slot for the switcher; it now lives in the bar
    var slot = document.querySelector('[data-trail-hub]');
    if (slot) slot.hidden = true;

    var pick = bar.querySelector('#thTrail');
    if (pick) pick.addEventListener('change', function () {
      var target = trails.filter(function (t) { return t.id === pick.value; })[0];
      if (!target) return;
      var last = null;
      try { last = JSON.parse(get(key('last', target.id)) || 'null'); } catch (e) {}
      location.href = target.url + (last && last.hash ? last.hash : '');
    });
    bar.querySelector('#thTheme').addEventListener('change', function (e) {
      theme = e.target.value;
      root.dataset.theme = ctx.theme = theme;
      set('theme', theme);
      window.dispatchEvent(new CustomEvent('trails:theme', { detail: { theme: theme } }));
    });
    bar.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.lang === lang) return;
        set('lang', b.dataset.lang);
        location.reload();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
