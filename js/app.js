/* ===== js/app.js ===== */
(function () {
'use strict';

// ─── Mode detection via URL only ───
var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── If not advanced mode, do absolutely nothing ───
if (!isAdvanced) return;

// ─── Hide simple mode if present ───
var simple = document.getElementById('simpleMode');
if (simple) simple.style.display = 'none';

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

// ─── Safe caller ───
function safe(fn) {
  try { fn(); } catch (e) { console.warn('[Text Replacer]', e); }
}

// ─── Init ───
function init() {
  setVersion();

  safe(function () { if (TR_I18N && TR_I18N.apply) TR_I18N.apply(); });
  safe(function () { if (TR_RULES && TR_RULES.render) TR_RULES.render(); });
  safe(function () { if (TR_UI && TR_UI.bindTabs) TR_UI.bindTabs(); });

  var inputEl = document.getElementById('input');
  if (inputEl && TR_STATE) {
    inputEl.addEventListener('input', function (e) {
      safe(function () {
        TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
        if (TR_UI) TR_UI.process();
      });
    });
  }

  function bind(id, fn) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () { safe(fn); });
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

  safe(function () { if (TR_UI && TR_UI.process) TR_UI.process(); });
}

// ─── Boot ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();