/* ===== js/app.js — Advanced Mode Controller ===== */
(function () {
'use strict';

var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── If NOT advanced, do nothing — simple.js owns the page ───
if (!isAdvanced) return;

// ─── STEP 1: Completely remove simple mode from DOM ───
var simple = document.getElementById('simpleMode');
if (simple) simple.remove();
// Also remove any simple-mode injected styles
document.querySelectorAll('style').forEach(function(s) {
  if (s.textContent.indexOf('simple') !== -1 || s.textContent.indexOf('Simple') !== -1) s.remove();
});

// ─── STEP 2: Inject aggressive show-all stylesheet ───
var showAll = document.createElement('style');
showAll.textContent = `
  /* Force ALL major containers visible */
  #app, .app-container, .app, main, .container, #main, .main-content,
  .full-app, .advanced-app, .tabs-container, .editor-container,
  .rules-panel, .editor-panel, .diff-panel, .sandbox-panel, .batch-panel,
  .header, .footer, .toolbar, .input-section, .output-section,
  .tab-content, .tab-pane, .preset-panel, [class*="tab"], [class*="panel"],
  [class*="rule"], [class*="editor"], [class*="input"], [class*="output"],
  [id*="tab"], [id*="panel"], [id*="rule"], [id*="editor"] {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  /* Flex containers need flex, not block */
  .tabs, .tab-bar, .toolbar, .button-row, .rule-row,
  [class*="tabs"], [class*="toolbar"], [class*="button-row"] {
    display: flex !important;
  }
  /* Hide only simple things */
  .simple-container, .simple-mode, #simpleAdvanced, #toggleSRI { display: none !important; }
  body { overflow: auto !important; }
`;
document.head.appendChild(showAll);

// ─── STEP 3: Version ───
var ver = document.querySelector('meta[name="version"]');
if (ver) {
  var vEl = document.createElement('span');
  vEl.style.cssText = 'font-size:10px;color:#555;margin-left:8px;font-weight:400;';
  vEl.textContent = ver.content;
  var h1 = document.querySelector('.header h1') || document.querySelector('h1');
  if (h1) h1.appendChild(vEl);
}

// ─── STEP 4: Add "Back to Simple" button ───
var backBtn = document.createElement('button');
backBtn.textContent = '← ' + ((window.TR_LANG === 'zh') ? '返回简单模式' : 'Back to Simple');
backBtn.style.cssText = 'position:fixed;top:8px;left:8px;z-index:99999;padding:6px 12px;background:#ec4899;color:#fff;border:none;border-radius:12px;font-size:12px;cursor:pointer;';
backBtn.onclick = function() { location.href = location.pathname + location.hash; };
document.body.appendChild(backBtn);

// ─── STEP 5: Initialize modules with full error logging ───
function safe(fn, label) {
  try { fn(); }
  catch (e) { console.error('[TR][' + label + ']', e); }
}

console.log('[TR] Advanced init. Modules:', {
  TR_I18N: typeof TR_I18N,
  TR_RULES: typeof TR_RULES,
  TR_UI: typeof TR_UI,
  TR_STATE: typeof TR_STATE,
  TR_SANDBOX: typeof TR_SANDBOX,
  TR_BATCH: typeof TR_BATCH
});

safe(function() { if (TR_I18N && TR_I18N.apply) TR_I18N.apply(); }, 'i18n');
safe(function() { if (TR_RULES && TR_RULES.render) TR_RULES.render(); }, 'rules-render');
safe(function() { if (TR_UI && TR_UI.bindTabs) TR_UI.bindTabs(); }, 'bindTabs');
safe(function() { if (TR_UI && TR_UI.process) TR_UI.process(); }, 'process');

// ─── STEP 6: Wire buttons safely ───
function bind(id, fn) {
  var b = document.getElementById(id);
  if (b) b.addEventListener('click', function() { safe(fn, id); });
}

if (TR_UI && TR_STATE) {
  bind('btnUndo', function() { var h = TR_STATE.undo(); if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone')); } });
  bind('btnRedo', function() { var h = TR_STATE.redo(); if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone')); } });
  bind('btnCopy', function() { if (navigator.clipboard) navigator.clipboard.writeText(TR_STATE.currentOutput).then(function() { TR_UI.toast(TR_I18N._('copied')); }); });
  bind('btnDownload', function() { var b = new Blob([TR_STATE.currentOutput], {type:'text/plain'}); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click(); TR_UI.toast(TR_I18N._('saved')); });
}
bind('btnLoad', function() { var f = document.getElementById('fileInput'); if (f) f.click(); });
if (TR_RULES) { bind('addRule', function() { TR_RULES.addRule(); }); bind('clearRules', function() { TR_RULES.clearRules(); }); }
if (TR_SANDBOX) { bind('sbRun', function() { TR_SANDBOX.run(); }); bind('sbClear', function() { TR_SANDBOX.clear(); }); }
if (TR_BATCH) { bind('batchRun', function() { TR_BATCH.run(); }); bind('batchClear', function() { TR_BATCH.clear(); }); }

// ─── STEP 7: Final visibility pass — ensure nothing is hidden ───
setTimeout(function() {
  document.querySelectorAll('*').forEach(function(el) {
    var s = window.getComputedStyle(el);
    if (s.display === 'none' && !el.id.match(/simple/i) && !el.className.toString().match(/simple/i)) {
      // Only force show if it's likely an advanced element
      el.style.setProperty('display', 'block', 'important');
    }
  });
}, 100);

})();