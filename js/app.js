/* ===== js/app.js ===== */
(function(){
'use strict';
var ADV_KEY = 'tr-advanced';
var adv = localStorage.getItem(ADV_KEY) === '1';

// ─── Always hide simple mode when in advanced ───
var simple = document.getElementById('simpleMode');
if (simple) simple.style.display = 'none';

// ─── Show full app container ───
// Try many possible selectors
var selectors = ['#app','.app-container','.app','main','.container','#main','.main-content','.full-app','#fullApp','.advanced-app','.tabs-container','.editor-container'];
var fullApp = null;
for (var i = 0; i < selectors.length; i++) {
  fullApp = document.querySelector(selectors[i]);
  if (fullApp) break;
}
if (fullApp) {
  fullApp.style.display = '';
} else {
  // Fallback: unhide all body children except simpleMode, scripts, styles
  var children = document.body.children;
  for (var j = 0; j < children.length; j++) {
    var ch = children[j];
    if (ch.id !== 'simpleMode' && !/^(SCRIPT|STYLE|LINK|META|HEAD)$/.test(ch.tagName)) {
      ch.style.display = '';
    }
  }
}

// If not advanced, stop — simple.js will handle it
if (!adv) return;

// ─── Version ───
var ver = document.querySelector('meta[name="version"]');
if (ver) {
  var vEl = document.createElement('span');
  vEl.style.cssText = 'font-size:10px;color:#555;margin-left:8px;font-weight:400;';
  vEl.textContent = ver.content;
  var h1 = document.querySelector('.header h1') || document.querySelector('h1');
  if (h1) h1.appendChild(vEl);
}

// ─── Init full UI with error catching ───
try {
  if (typeof TR_I18N !== 'undefined' && TR_I18N.apply) TR_I18N.apply();
  if (typeof TR_RULES !== 'undefined' && TR_RULES.render) TR_RULES.render();
  if (typeof TR_UI !== 'undefined' && TR_UI.bindTabs) TR_UI.bindTabs();

  var inputEl = document.getElementById('input');
  if (inputEl && typeof TR_STATE !== 'undefined') {
    inputEl.addEventListener('input', function(e){
      TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
      if (TR_UI) TR_UI.process();
    });
  }

  function bind(id, fn){ var b = document.getElementById(id); if(b) b.onclick = fn; }

  if (typeof TR_UI !== 'undefined') {
    bind('btnUndo', function(){
      var h = TR_STATE.undo();
      if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone')); }
    });
    bind('btnRedo', function(){
      var h = TR_STATE.redo();
      if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone')); }
    });
    bind('btnCopy', function(){
      if (navigator.clipboard) navigator.clipboard.writeText(TR_STATE.currentOutput).then(function(){ TR_UI.toast(TR_I18N._('copied')); });
    });
    bind('btnDownload', function(){
      var b = new Blob([TR_STATE.currentOutput], {type:'text/plain'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click();
      TR_UI.toast(TR_I18N._('saved'));
    });
  }

  bind('btnLoad', function(){ var f = document.getElementById('fileInput'); if(f) f.click(); });
  bind('btnBackSimple', function(){ localStorage.removeItem(ADV_KEY); location.reload(); });

  if (typeof TR_RULES !== 'undefined') {
    bind('addRule', TR_RULES.addRule);
    bind('clearRules', TR_RULES.clearRules);
  }
  if (typeof TR_SANDBOX !== 'undefined') {
    bind('sbRun', TR_SANDBOX.run);
    bind('sbClear', TR_SANDBOX.clear);
  }
  if (typeof TR_BATCH !== 'undefined') {
    bind('batchRun', TR_BATCH.run);
    bind('batchClear', TR_BATCH.clear);
  }

  if (TR_UI && TR_UI.process) TR_UI.process();

} catch(e) {
  console.error('[Text Replacer] App init error:', e);
  // Show error on page so user can see what's wrong
  var errDiv = document.createElement('div');
  errDiv.style.cssText = 'background:#fee;color:red;padding:12px;margin:10px;border-radius:8px;font-size:13px;';
  errDiv.textContent = '初始化错误: ' + e.message;
  document.body.appendChild(errDiv);
}
})();