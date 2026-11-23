/* ===== js/app.js ===== */
(function () {
'use strict';

// ─── Mode detection via URL only ───
var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── If not advanced mode, do absolutely nothing ───
if (!isAdvanced) return;

// ─── Hide simple mode ───
var simple = document.getElementById('simpleMode');
if (simple) simple.style.display = 'none';

// ─── Forcefully show ALL advanced UI elements ───
// Unhide common advanced containers
var advSelectors = [
  '#app', '.app-container', '.app', 'main', '.container', '#main',
  '.main-content', '.full-app', '#fullApp', '.advanced-app',
  '.tabs-container', '.editor-container', '.tab-content',
  '.rules-panel', '.editor-panel', '.diff-panel', '.sandbox-panel', '.batch-panel',
  '.header', '.footer', '.toolbar', '.input-section', '.output-section'
];
advSelectors.forEach(function(sel) {
  try {
    var els = document.querySelectorAll(sel);
    els.forEach(function(el) { el.style.display = ''; });
  } catch(e) {}
});

// Also unhide any element with class containing 'tab' or 'panel' or 'rule'
document.querySelectorAll('[class*="tab"], [class*="panel"], [class*="rule"], [class*="editor"], [class*="input"], [class*="output"]').forEach(function(el) {
  el.style.display = '';
});

// ─── Version ───
function setVersion() {
  var ver = document.querySelector('meta[name="version"]');
  if (!ver) return;
  var vEl = document.createElement('span');
  vEl.style.cssText = 'font-size:10px;color:#555;margin-left:8px;font-weight:400;';
  vEl.textContent = ver.content;
  var h1 = document.querySelector('.header h1') || document.querySelector('h1');
  if (h1) h1.appendChild(vEl);
}

// ─── Safe caller with logging ───
function safe(fn, label) {
  try { fn(); }
  catch (e) { console.error('[Text Replacer][' + (label||'unknown') + ']', e); }
}

// ─── Init ───
function init() {
  setVersion();

  console.log('[Text Replacer] Advanced mode init starting...');
  console.log('TR_I18N:', typeof TR_I18N);
  console.log('TR_RULES:', typeof TR_RULES);
  console.log('TR_UI:', typeof TR_UI);
  console.log('TR_STATE:', typeof TR_STATE);

  safe(function () { if (TR_I18N && TR_I18N.apply) TR_I18N.apply(); }, 'i18n');
  safe(function () { if (TR_RULES && TR_RULES.render) TR_RULES.render(); }, 'rules');
  safe(function () { if (TR_UI && TR_UI.bindTabs) TR_UI.bindTabs(); }, 'tabs');

  var inputEl = document.getElementById('input');
  if (inputEl && TR_STATE) {
    inputEl.addEventListener('input', function (e) {
      safe(function () {
        TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
        if (TR_UI) TR_UI.process();
      }, 'input');
    });
  }

  function bind(id, fn) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () { safe(fn, id); });
  }

  if (TR_UI) {
    bind('btnUndo', function () {
      var h = TR_STATE.undo();
      if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone')); }
    });
    bind('btnRedo', function () {
      var h = TR_STATE.redo();
      if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone')); }
    });
    bind('btnCopy', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(TR_STATE.currentOutput).then(function () { TR_UI.toast(TR_I18N._('copied')); });
    });
    bind('btnDownload', function () {
      var b = new Blob([TR_STATE.currentOutput], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click();
      TR_UI.toast(TR_I18N._('saved'));
    });
  }

  bind('btnLoad', function () { var f = document.getElementById('fileInput'); if (f) f.click(); });
  bind('btnBackSimple', function () { location.href = location.pathname + location.hash; });

  if (TR_RULES) {
    bind('addRule', function () { TR_RULES.addRule(); });
    bind('clearRules', function () { TR_RULES.clearRules(); });
  }
  if (TR_SANDBOX) {
    bind('sbRun', function () { TR_SANDBOX.run(); });
    bind('sbClear', function () { TR_SANDBOX.clear(); });
  }
  if (TR_BATCH) {
    bind('batchRun', function () { TR_BATCH.run(); });
    bind('batchClear', function () { TR_BATCH.clear(); });
  }

  safe(function () { if (TR_UI && TR_UI.process) TR_UI.process(); }, 'process');

  console.log('[Text Replacer] Advanced mode init complete');
}

// ─── Boot ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();