/* ===== js/app.js ===== */
(function(){
'use strict';
var ADV_KEY = 'tr-advanced';

// Version display for full UI header
var ver = document.querySelector('meta[name="version"]');
if(ver){
  var vEl = document.createElement('span');
  vEl.style.cssText = 'font-size:10px;color:#555;margin-left:8px;font-weight:400;';
  vEl.textContent = ver.content;
  var h1 = document.querySelector('.header h1');
  if(h1) h1.appendChild(vEl);
}

// Wire up full UI only if elements exist
if(typeof TR_I18N !== 'undefined' && TR_I18N.apply) TR_I18N.apply();
if(typeof TR_RULES !== 'undefined' && TR_RULES.render) TR_RULES.render();
if(typeof TR_UI !== 'undefined' && TR_UI.bindTabs) TR_UI.bindTabs();
var inputEl = document.getElementById('input');
if(inputEl && typeof TR_STATE !== 'undefined'){
  inputEl.addEventListener('input', function(e){
    TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
    if(TR_UI) TR_UI.process();
  });
}

// Generic button wire-up
function bind(id, fn){ var b=document.getElementById(id); if(b) b.onclick=fn; }
if(typeof TR_UI !== 'undefined'){
  bind('btnUndo', function(){ var h=TR_STATE.undo(); if(h){document.getElementById('input').value=h.inp; TR_STATE.rules=h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone'));} });
  bind('btnRedo', function(){ var h=TR_STATE.redo(); if(h){document.getElementById('input').value=h.inp; TR_STATE.rules=h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone'));} });
  bind('btnCopy', function(){ if(navigator.clipboard) navigator.clipboard.writeText(TR_STATE.currentOutput).then(function(){TR_UI.toast(TR_I18N._('copied'));}); });
  bind('btnDownload', function(){ var b=new Blob([TR_STATE.currentOutput],{type:'text/plain'}); var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='replaced.txt'; a.click(); TR_UI.toast(TR_I18N._('saved')); });
}
bind('btnLoad', function(){ document.getElementById('fileInput').click(); });
bind('btnBackSimple', function(){
  localStorage.removeItem(ADV_KEY);
  location.reload();
});
if(typeof TR_RULES !== 'undefined'){
  bind('addRule', TR_RULES.addRule);
  bind('clearRules', TR_RULES.clearRules);
}
if(typeof TR_SANDBOX !== 'undefined'){
  bind('sbRun', TR_SANDBOX.run);
  bind('sbClear', TR_SANDBOX.clear);
}
if(typeof TR_BATCH !== 'undefined'){
  bind('batchRun', TR_BATCH.run);
  bind('batchClear', TR_BATCH.clear);
}
if(TR_UI && TR_UI.process) TR_UI.process();
})();