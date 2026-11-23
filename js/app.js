/* ===== js/app.js — Advanced Mode Controller ===== */
(function () {
'use strict';
var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';
// ─── If NOT advanced, do nothing — simple.js owns the page ───
if (!isAdvanced) return;
// ─── STEP 1: Hide simple mode, show full UI ───
var simple = document.getElementById('simpleMode');
if (simple) simple.style.display = 'none';
var fullUI = document.getElementById('fullUI');
if (fullUI) {
fullUI.style.display = 'block';
fullUI.classList.add('revealed');
}
// ─── STEP 2: Apply girly theme ───
var girlyStyle = document.createElement('style');
girlyStyle.id = 'advancedGirlyTheme';
girlyStyle.textContent = `
body { background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #f3e8ff 50%, #ede9fe 75%, #fdf2f8 100%) !important; background-size: 400% 400% !important; animation: gradientShift 12s ease infinite !important; color: #4a3040 !important; }
@keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
.header { background: rgba(255,255,255,0.85) !important; border-bottom: 2px solid rgba(244,114,182,0.3) !important; border-radius: 0 0 16px 16px !important; }
.header h1 { color: #be185d !important; }
.toolbar button { background: rgba(255,255,255,0.7) !important; color: #7c3a6b !important; border: 1.5px solid rgba(244,114,182,0.3) !important; border-radius: 10px !important; }
.toolbar button:hover { background: linear-gradient(135deg,#ec4899,#a855f7) !important; color: #fff !important; }
.tabs { background: rgba(255,255,255,0.65) !important; border-bottom: 2px solid rgba(244,114,182,0.3) !important; }
.tab { color: #9d6b8f !important; border-radius: 12px 12px 0 0 !important; }
.tab.active { background: rgba(255,255,255,0.95) !important; color: #be185d !important; border-bottom: 3px solid #ec4899 !important; }
.panel.active { display: flex !important; }
.rule-row { background: rgba(255,255,255,0.75) !important; border: 1.5px solid rgba(244,114,182,0.25) !important; border-radius: 12px !important; }
.rule-fields input { background: rgba(255,255,255,0.85) !important; border: 1.5px solid rgba(244,114,182,0.2) !important; color: #4a3040 !important; border-radius: 8px !important; }
.btn-primary { background: linear-gradient(135deg,#ec4899,#a855f7) !important; color: #fff !important; border-radius: 12px !important; }
.btn-secondary { background: rgba(255,255,255,0.7) !important; color: #7c3a6b !important; border: 1.5px solid rgba(244,114,182,0.3) !important; border-radius: 10px !important; }
`;
document.head.appendChild(girlyStyle);
// ─── STEP 3: Version display ───
var ver = document.querySelector('meta[name="version"]');
if (ver) {
var vEl = document.createElement('span');
vEl.style.cssText = 'font-size:10px;color:#9d6b8f;margin-left:8px;font-weight:400;';
vEl.textContent = ver.content;
var h1 = document.querySelector('.header h1');
if (h1) h1.appendChild(vEl);
}
// ─── STEP 4: Back to Simple button ───
var backBtn = document.createElement('button');
backBtn.innerHTML = '← Simple 🌸';
backBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:10px 18px;background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;border:none;border-radius:12px;font-size:13px;cursor:pointer;font-weight:700;box-shadow:0 4px 14px rgba(236,72,153,0.35);';
backBtn.onclick = function() { location.href = location.pathname + location.hash; };
document.body.appendChild(backBtn);
// ─── STEP 5: Initialize modules ───
function safe(fn, label) {
try { fn(); } catch (e) { console.error('[TR][' + label + ']', e); }
}
safe(function() { if (TR_I18N && TR_I18N.apply) TR_I18N.apply(); }, 'i18n');
safe(function() { if (TR_RULES && TR_RULES.render) TR_RULES.render(); }, 'rules-render');
safe(function() { if (TR_UI && TR_UI.bindTabs) TR_UI.bindTabs(); }, 'bindTabs');
safe(function() { if (TR_UI && TR_UI.process) TR_UI.process(); }, 'process');
// ─── STEP 6: Wire buttons ───
function bind(id, fn) {
var b = document.getElementById(id);
if (b) b.addEventListener('click', function() { safe(fn, id); });
}
if (TR_UI && TR_STATE) {
bind('btnUndo', function() { var h = TR_STATE.undo(); if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast('Undone'); } });
bind('btnRedo', function() { var h = TR_STATE.redo(); if (h) { document.getElementById('input').value = h.inp; TR_STATE.rules = h.rules; TR_RULES.render(); TR_UI.process(); TR_UI.toast('Redone'); } });
bind('btnCopy', function() { if (navigator.clipboard) navigator.clipboard.writeText(TR_STATE.currentOutput).then(function() { TR_UI.toast('Copied'); }); });
bind('btnDownload', function() { var b = new Blob([TR_STATE.currentOutput], {type:'text/plain'}); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'replaced.txt'; a.click(); TR_UI.toast('Saved'); });
}
bind('btnLoad', function() { var f = document.getElementById('fileInput'); if (f) f.click(); });
if (TR_RULES) { bind('addRule', function() { TR_RULES.addRule(); }); bind('clearRules', function() { TR_RULES.clearRules(); }); }
if (TR_SANDBOX) { bind('sbRun', function() { TR_SANDBOX.run(); }); bind('sbClear', function() { TR_SANDBOX.clear(); }); }
if (TR_BATCH) { bind('batchRun', function() { TR_BATCH.run(); }); bind('batchClear', function() { TR_BATCH.clear(); }); }
// ─── STEP 7: File inputs ───
var fileInput = document.getElementById('fileInput');
if (fileInput) {
fileInput.onchange = function() {
var f = this.files[0]; if (!f) return;
var r = new FileReader();
r.onload = function(e) { document.getElementById('input').value = e.target.result; if (TR_UI) TR_UI.process(); };
r.readAsText(f); this.value = '';
};
}
var batchFileInput = document.getElementById('batchFileInput');
if (batchFileInput) {
batchFileInput.onchange = function() { if (TR_BATCH && TR_BATCH.addFiles) TR_BATCH.addFiles(this.files); this.value = ''; };
}
bind('batchAdd', function() { if (batchFileInput) batchFileInput.click(); });
// ─── STEP 8: Import / Export (fixed — no nextId dependency) ───
(function() {
    var importInput = document.createElement('input');
    importInput.type = 'file'; importInput.accept = '.json,application/json'; importInput.style.display = 'none';
    document.body.appendChild(importInput);

    importInput.addEventListener('change', function() {
        var f = this.files[0]; if (!f) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                // TR_RULES.importRules handles both string and object, normalizes IDs internally
                if (TR_RULES && TR_RULES.importRules) {
                    TR_RULES.importRules(e.target.result);
                }
                setTimeout(function() {
                    if (TR_RULES && TR_RULES.render) TR_RULES.render();
                    if (TR_UI && TR_UI.process) TR_UI.process();
                    if (TR_UI && TR_UI.toast) TR_UI.toast('✅ Rules imported');
                }, 50);
            } catch(err) { console.error('[TR] Import error:', err); }
        };
        reader.readAsText(f);
        this.value = '';
    });

    function doExport() {
        var data = (TR_RULES && TR_RULES.exportRules) ? TR_RULES.exportRules() : JSON.stringify({ rules: (TR_STATE && TR_STATE.rules) || [] }, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'rules-' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        if (TR_UI && TR_UI.toast) TR_UI.toast('📤 Exported');
    }

    // Wire import/export buttons
    function bindImportExport(id, fn) {
        var b = document.getElementById(id);
        if (b) b.addEventListener('click', function() { try { fn(); } catch(e) { console.error(e); } });
    }
    bindImportExport('importRules', function() { importInput.click(); });
    bindImportExport('exportRules', function() { doExport(); });
})();
// ─── STEP 9: Preset modal ───
var presetModal = document.getElementById('presetModal');
if (presetModal) {
bind('btnPreset', function() { presetModal.style.display = 'flex'; });
bind('closePreset', function() { presetModal.style.display = 'none'; });
bind('savePreset', function() {
var name = prompt('Preset name:');
if (name && TR_PRESETS) { TR_PRESETS.save(name); if (TR_UI) TR_UI.toast('Saved'); }
});
}
console.log('[TR] Advanced mode ready ✅');
})();