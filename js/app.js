(function(){
  // i18n
  TR_I18N.apply();

  // Render rules
  TR_RULES.render();

  // Tabs
  TR_UI.bindTabs();

  // Input
  document.getElementById('input').addEventListener('input', function(e){
    TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
    TR_UI.process();
  });

  // Editor scroll sync
  TR_EDITOR.syncScroll(document.getElementById('input'));
  TR_EDITOR.syncScroll(document.getElementById('output'));

  // Toolbar
  document.getElementById('btnUndo').onclick = function(){
    var h = TR_STATE.undo(); if(h){ document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone')); }
  };
  document.getElementById('btnRedo').onclick = function(){
    var h = TR_STATE.redo(); if(h){ document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone')); }
  };
  document.getElementById('btnCopy').onclick = function(){
    navigator.clipboard.writeText(TR_STATE.currentOutput).then(function(){ TR_UI.toast(TR_I18N._('copied')); });
  };
  document.getElementById('btnDownload').onclick = function(){
    var b = new Blob([TR_STATE.currentOutput], {type:'text/plain'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click(); TR_UI.toast(TR_I18N._('saved'));
  };
  document.getElementById('btnLoad').onclick = function(){ document.getElementById('fileInput').click(); };
  document.getElementById('fileInput').onchange = function(e){
    var f = e.target.files[0]; if(!f) return;
    f.text().then(function(t){ document.getElementById('input').value = t; TR_STATE.pushHist(t,''); TR_UI.process(); TR_UI.toast(TR_I18N._('loaded')); });
  };

  // Rules toolbar
  document.getElementById('addRule').onclick = TR_RULES.addRule;
  document.getElementById('clearRules').onclick = TR_RULES.clearRules;
  document.getElementById('ruleSearch').oninput = TR_RULES.render;
  document.getElementById('importRules').onclick = function(){
    var i = document.createElement('input'); i.type='file'; i.accept='.json';
    i.onchange = function(e){ var f=e.target.files[0]; if(!f)return; f.text().then(function(t){ TR_RULES.importRules(t); TR_UI.toast(TR_I18N._('loaded')); }); };
    i.click();
  };
  document.getElementById('exportRules').onclick = function(){
    var b = new Blob([TR_RULES.exportRules()], {type:'application/json'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'rules.json'; a.click(); TR_UI.toast(TR_I18N._('saved'));
  };

  // Sandbox
  document.getElementById('sbRun').onclick = TR_SANDBOX.run;
  document.getElementById('sbClear').onclick = TR_SANDBOX.clear;

  // Batch
  document.getElementById('batchAdd').onclick = function(){ document.getElementById('batchFileInput').click(); };
  document.getElementById('batchFileInput').onchange = function(e){ TR_BATCH.addFiles(e.target.files); };
  document.getElementById('batchRun').onclick = TR_BATCH.run;
  document.getElementById('batchClear').onclick = TR_BATCH.clear;

  // Presets
  document.getElementById('btnPreset').onclick = function(){
    var list = document.getElementById('presetList'); list.innerHTML = '';
    var all = TR_PRESETS.all();
    Object.entries(all).forEach(function(entry){
      var key = entry[0], p = entry[1];
      var d = document.createElement('div'); d.style.cssText = 'padding:8px 14px;cursor:pointer;border-bottom:1px solid var(--border);';
      d.innerHTML = '<div style="font-weight:500;font-size:13px">'+p.name+'</div><div style="font-size:11px;color:#666">'+p.desc+' ('+p.rules.length+')</div>';
      d.onclick = function(){ TR_STATE.rules = p.rules.map(function(r){ r.id=TR_STATE.nextId; return r; }); TR_RULES.render(); TR_UI.process(); document.getElementById('presetModal').classList.remove('active'); TR_UI.toast(TR_I18N._('loaded')); };
      list.appendChild(d);
    });
    document.getElementById('presetModal').classList.add('active');
  };
  document.getElementById('closePreset').onclick = function(){ document.getElementById('presetModal').classList.remove('active'); };
  document.getElementById('savePreset').onclick = function(){
    var n = prompt(TR_I18N._('preName')); if(!n) return;
    TR_PRESETS.save(n); TR_UI.toast(TR_I18N._('saved'));
  };

  // Keyboard
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){ e.preventDefault(); document.getElementById('btnUndo').click(); }
    if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){ e.preventDefault(); document.getElementById('btnRedo').click(); }
  });

  // Initial process
  TR_UI.process();
})();