/* ===== js/app.js ===== */
// ============ SIMPLE MODE ============
(function(){
var ADV_KEY = 'tr-advanced';
function initSimple(){
var simple = document.getElementById('simpleMode');
if(!simple) return;
var isAdvanced = localStorage.getItem(ADV_KEY) === '1';
if(isAdvanced){
simple.style.display = 'none';
document.querySelectorAll('.header,.tabs,.panel').forEach(function(el){
el.classList.add('full-ui');
requestAnimationFrame(function(){ el.classList.add('revealed'); });
});
return;
}
simple.classList.add('showing');
setTimeout(function(){ simple.classList.remove('showing'); }, 400);
var advBtn = document.getElementById('simpleAdvanced');
var hint = document.getElementById('advancedFeatureHint');
if(advBtn && hint){
advBtn.addEventListener('mouseenter', function(){ hint.classList.add('visible'); });
advBtn.addEventListener('mouseleave', function(){ hint.classList.remove('visible'); });
advBtn.addEventListener('focus', function(){ hint.classList.add('visible'); });
advBtn.addEventListener('blur', function(){ hint.classList.remove('visible'); });
advBtn.addEventListener('click', function(){
hint.classList.remove('visible');
enterAdvanced(simple);
});
return;
}
function enterAdvanced(sm){
sm.classList.add('hiding');
setTimeout(function(){
localStorage.setItem(ADV_KEY, '1');
sm.style.display = 'none';
document.body.style.overflow = '';
var fullInput = document.getElementById('input');
if(fullInput){
fullInput.value = document.getElementById('simpleInput').value;
TR_STATE.setCurrentOutput(document.getElementById('simpleOutput').value);
var from = document.getElementById('simpleFrom');
var to = document.getElementById('simpleTo');
var regex = document.getElementById('simpleRegex');
var kase = document.getElementById('simpleCase');
if(from && from.value){
TR_STATE.rules.push({id:TR_STATE.nextId, from:from.value, to:to.value, regex:regex.checked, case:kase.checked, enabled:true});
if(TR_RULES && TR_RULES.render) TR_RULES.render();
}
if(TR_UI && TR_UI.process) TR_UI.process();
}
document.querySelectorAll('.header,.tabs,.panel').forEach(function(el){
el.classList.add('full-ui');
requestAnimationFrame(function(){ el.classList.add('revealed'); });
});
}, 350);
}
var from = document.getElementById('simpleFrom');
var to = document.getElementById('simpleTo');
var regex = document.getElementById('simpleRegex');
var kase = document.getElementById('simpleCase');
var inp = document.getElementById('simpleInput');
var out = document.getElementById('simpleOutput');

function doReplace(){
var f = from.value, t = to.value;
var text = inp.value;
if(!text){ out.value = ''; return; }
// FIXED: use TR_PROCESSOR.applyRules directly — single code path
var tmpRule = { from: f, to: t, regex: regex.checked, case: kase.checked, enabled: true };
out.value = TR_PROCESSOR.applyRules(text, [tmpRule]);
}

document.getElementById('simpleReplace').onclick = doReplace;
inp.addEventListener('input', doReplace);
from.addEventListener('input', doReplace);
to.addEventListener('input', doReplace);
regex.addEventListener('change', doReplace);
kase.addEventListener('change', doReplace);
// Also run once on load in case there's pre-filled text
setTimeout(doReplace, 100);

document.getElementById('simpleCopy').onclick = function(){
if(navigator.clipboard && navigator.clipboard.writeText){
navigator.clipboard.writeText(out.value).then(function(){
if(window.TR_UI) TR_UI.toast(TR_I18N._('copied'));
});
} else { TR_UI.toast('Clipboard not available'); }
};
document.getElementById('simpleDownload').onclick = function(){
var b = new Blob([out.value], {type:'text/plain'});
var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click();
};
}
if(document.readyState === 'loading'){
document.addEventListener('DOMContentLoaded', initSimple);
} else {
initSimple();
}
})();

// ============ FULL APP ============
(function(){
var ADV_KEY = 'tr-advanced';
if(TR_I18N && TR_I18N.apply) TR_I18N.apply();
if(TR_RULES && TR_RULES.render) TR_RULES.render();
if(TR_UI && TR_UI.bindTabs) TR_UI.bindTabs();
// Display version in header
var ver = document.querySelector('meta[name="version"]');
if(ver){
var vEl = document.createElement('span');
vEl.style.cssText = 'font-size:10px;color:#555;margin-left:8px;font-weight:400;';
vEl.textContent = ver.content;
var h1 = document.querySelector('.header h1');
if(h1) h1.appendChild(vEl);
}
var inputEl = document.getElementById('input');
if(inputEl){
inputEl.addEventListener('input', function(e){
TR_STATE.pushHist(e.target.value, TR_STATE.currentOutput);
TR_UI.process();
});
}
if(TR_EDITOR){ TR_EDITOR.syncScroll(document.getElementById('input')); TR_EDITOR.syncScroll(document.getElementById('output')); }
var b;
b = document.getElementById('btnUndo'); if(b) b.onclick = function(){
var h = TR_STATE.undo(); if(h){ document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('undone')); }
};
b = document.getElementById('btnRedo'); if(b) b.onclick = function(){
var h = TR_STATE.redo(); if(h){ document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast(TR_I18N._('redone')); }
};
b = document.getElementById('btnCopy'); if(b) b.onclick = function(){
if(navigator.clipboard && navigator.clipboard.writeText){
navigator.clipboard.writeText(TR_STATE.currentOutput).then(function(){ TR_UI.toast(TR_I18N._('copied')); });
} else { TR_UI.toast('Clipboard not available'); }
};
b = document.getElementById('btnDownload'); if(b) b.onclick = function(){
var b2 = new Blob([TR_STATE.currentOutput], {type:'text/plain'});
var a = document.createElement('a'); a.href = URL.createObjectURL(b2); a.download = 'replaced.txt'; a.click(); TR_UI.toast(TR_I18N._('saved'));
};
b = document.getElementById('btnLoad'); if(b) b.onclick = function(){ document.getElementById('fileInput').click(); };
b = document.getElementById('fileInput'); if(b) b.onchange = function(e){
var f = e.target.files[0]; if(!f) return;
f.text().then(function(t){ document.getElementById('input').value = t; TR_STATE.pushHist(t,''); TR_UI.process(); TR_UI.toast(TR_I18N._('loaded')); });
};
b = document.getElementById('btnBackSimple'); if(b) b.onclick = function(){
document.querySelectorAll('.header,.tabs,.panel').forEach(function(el){
el.style.transition = 'opacity .3s, transform .3s';
el.style.opacity = '0';
el.style.transform = 'translateY(6px)';
});
setTimeout(function(){
localStorage.removeItem(ADV_KEY);
location.reload();
}, 300);
};
b = document.getElementById('addRule'); if(b) b.onclick = TR_RULES.addRule;
b = document.getElementById('clearRules'); if(b) b.onclick = TR_RULES.clearRules;
b = document.getElementById('ruleSearch'); if(b) b.oninput = TR_RULES.render;
b = document.getElementById('importRules'); if(b) b.onclick = function(){
var i = document.createElement('input'); i.type='file'; i.accept='.json';
i.onchange = function(e){ var f=e.target.files[0]; if(!f)return; f.text().then(function(t){ TR_RULES.importRules(t); TR_UI.toast(TR_I18N._('loaded')); }); };
i.click();
};
b = document.getElementById('exportRules'); if(b) b.onclick = function(){
var b2 = new Blob([TR_RULES.exportRules()], {type:'application/json'});
var a = document.createElement('a'); a.href = URL.createObjectURL(b2); a.download = 'rules.json'; a.click(); TR_UI.toast(TR_I18N._('saved'));
};
b = document.getElementById('sbRun'); if(b) b.onclick = TR_SANDBOX.run;
b = document.getElementById('sbClear'); if(b) b.onclick = TR_SANDBOX.clear;
b = document.getElementById('batchAdd'); if(b) b.onclick = function(){ document.getElementById('batchFileInput').click(); };
b = document.getElementById('batchFileInput'); if(b) b.onchange = function(e){ TR_BATCH.addFiles(e.target.files); };
b = document.getElementById('batchRun'); if(b) b.onclick = TR_BATCH.run;
b = document.getElementById('batchClear'); if(b) b.onclick = TR_BATCH.clear;
b = document.getElementById('btnPreset'); if(b) b.onclick = function(){
var list = document.getElementById('presetList'); if(!list) return; list.innerHTML = '';
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
b = document.getElementById('closePreset'); if(b) b.onclick = function(){ document.getElementById('presetModal').classList.remove('active'); };
b = document.getElementById('savePreset'); if(b) b.onclick = function(){
var n = prompt(TR_I18N._('preName')); if(!n) return;
TR_PRESETS.save(n); TR_UI.toast(TR_I18N._('saved'));
};
document.addEventListener('keydown', function(e){
if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){ e.preventDefault(); var b=document.getElementById('btnUndo'); if(b)b.click(); }
if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){ e.preventDefault(); var b=document.getElementById('btnRedo'); if(b)b.click(); }
});
if(TR_UI && TR_UI.process) TR_UI.process();
})();