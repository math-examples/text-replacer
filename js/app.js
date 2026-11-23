/* ===== js/app.js — Advanced Mode Controller ===== */
(function () {
'use strict';
var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── If NOT advanced, do nothing — simple.js owns the page ───
if (!isAdvanced) return;

// ─── STEP 1: Hide simple mode, show full UI (non-destructive) ───
var simple = document.getElementById('simpleMode');
if (simple) simple.style.display = 'none';

var fullUI = document.getElementById('fullUI');
if (fullUI) {
    fullUI.style.display = 'block';
    fullUI.classList.add('revealed');
}

// ─── STEP 2: Apply girly theme via CSS variable overrides ───
var girlyStyle = document.createElement('style');
girlyStyle.id = 'advancedGirlyTheme';
girlyStyle.textContent = `
/* ═══════════ ADVANCED MODE — Girly Edition 🌸 ═══════════ */
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
body {
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #f3e8ff 50%, #ede9fe 75%, #fdf2f8 100%) !important;
    background-size: 400% 400% !important;
    animation: gradientShift 12s ease infinite !important;
    color: #4a3040 !important;
}
/* Header */
.header {
    background: rgba(255,255,255,0.85) !important;
    backdrop-filter: blur(10px) !important;
    border-bottom: 2px solid rgba(244,114,182,0.3) !important;
    border-radius: 0 0 16px 16px !important;
    box-shadow: 0 4px 20px rgba(244,114,182,0.15) !important;
}
.header h1 { color: #be185d !important; }
.header h1 span { color: #ec4899 !important; }
/* Toolbar */
.toolbar button {
    background: rgba(255,255,255,0.7) !important;
    color: #7c3a6b !important;
    border: 1.5px solid rgba(244,114,182,0.3) !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    transition: all 0.25s ease !important;
}
.toolbar button:hover {
    background: linear-gradient(135deg, #ec4899, #a855f7) !important;
    color: #fff !important;
    border-color: transparent !important;
    box-shadow: 0 4px 14px rgba(236,72,153,0.35) !important;
    transform: translateY(-1px) !important;
}
/* Tabs */
.tabs {
    background: rgba(255,255,255,0.65) !important;
    backdrop-filter: blur(10px) !important;
    border-bottom: 2px solid rgba(244,114,182,0.3) !important;
    padding: 0 8px !important;
}
.tab {
    color: #9d6b8f !important;
    font-weight: 600 !important;
    border-radius: 12px 12px 0 0 !important;
    margin-top: 4px !important;
    transition: all 0.25s ease !important;
    border-right: none !important;
}
.tab.active {
    background: rgba(255,255,255,0.95) !important;
    color: #be185d !important;
    border-bottom: 3px solid #ec4899 !important;
    box-shadow: 0 -4px 12px rgba(236,72,153,0.1) !important;
}
.tab:hover:not(.active) {
    background: rgba(255,255,255,0.5) !important;
    color: #be185d !important;
}
/* Panels */
.panel.active { display: flex !important; }
.rules-toolbar input[type="text"] {
    background: rgba(255,255,255,0.8) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    color: #4a3040 !important;
    border-radius: 10px !important;
}
.rules-toolbar input[type="text"]:focus {
    outline: none !important;
    border-color: #ec4899 !important;
    box-shadow: 0 0 0 3px rgba(236,72,153,0.12) !important;
}
.rules-toolbar button {
    background: rgba(255,255,255,0.7) !important;
    color: #7c3a6b !important;
    border: 1.5px solid rgba(244,114,182,0.3) !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
}
.rules-toolbar button:hover {
    background: linear-gradient(135deg, #ec4899, #a855f7) !important;
    color: #fff !important;
    border-color: transparent !important;
}
/* Rule rows */
.rule-row {
    background: rgba(255,255,255,0.75) !important;
    backdrop-filter: blur(10px) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    border-radius: 12px !important;
    margin-bottom: 6px !important;
    transition: all 0.25s ease !important;
}
.rule-row:hover {
    border-color: rgba(244,114,182,0.5) !important;
    box-shadow: 0 4px 16px rgba(244,114,182,0.15) !important;
    transform: translateY(-1px) !important;
}
.rule-fields input {
    background: rgba(255,255,255,0.85) !important;
    border: 1.5px solid rgba(244,114,182,0.2) !important;
    color: #4a3040 !important;
    border-radius: 8px !important;
}
.rule-fields input:focus {
    outline: none !important;
    border-color: #ec4899 !important;
    box-shadow: 0 0 0 3px rgba(236,72,153,0.12) !important;
}
.rule-fields .arrow { color: #ec4899 !important; }
.rule-toggles label { color: #9d6b8f !important; font-weight: 600 !important; }
.rule-remove { color: #f43f5e !important; }
/* Editor */
.pane-header {
    background: rgba(255,255,255,0.65) !important;
    color: #9d6b8f !important;
    border-bottom: 1.5px solid rgba(244,114,182,0.3) !important;
}
.pane-header .stats { color: #c4a3b8 !important; }
.editor-wrap textarea, .highlight-layer {
    background: rgba(255,255,255,0.85) !important;
    color: #4a3040 !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    border-radius: 0 0 12px 12px !important;
}
/* Diff */
.diff-output {
    background: rgba(255,255,255,0.85) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    border-radius: 12px !important;
}
.diff-output .line.added { background: rgba(16,185,129,0.15) !important; color: #065f46 !important; }
.diff-output .line.removed { background: rgba(244,63,94,0.15) !important; color: #991b1b !important; }
.diff-output .ln { color: #c4a3b8 !important; }
/* Sandbox */
.sandbox-row input, .sandbox-row select {
    background: rgba(255,255,255,0.85) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    color: #4a3040 !important;
    border-radius: 10px !important;
}
.sandbox-row label { color: #9d6b8f !important; font-weight: 600 !important; }
.sandbox-result {
    background: rgba(255,255,255,0.85) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    border-radius: 12px !important;
    color: #4a3040 !important;
}
/* Batch */
.batch-list {
    background: rgba(255,255,255,0.85) !important;
    border: 1.5px solid rgba(244,114,182,0.25) !important;
    border-radius: 12px !important;
}
.batch-item { border-bottom: 1px solid rgba(244,114,182,0.15) !important; }
.batch-item .name { color: #4a3040 !important; }
.batch-item .status.pending { background: rgba(156,163,175,0.2) !important; color: #6b7280 !important; }
.batch-item .status.done { background: rgba(16,185,129,0.2) !important; color: #065f46 !important; }
.batch-item .status.error { background: rgba(244,63,94,0.2) !important; color: #991b1b !important; }
/* Modal */
.modal-overlay { background: rgba(236,72,153,0.15) !important; backdrop-filter: blur(5px) !important; }
.modal {
    background: rgba(255,255,255,0.97) !important;
    border: 2px solid rgba(244,114,182,0.3) !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(236,72,153,0.2) !important;
}
.modal-header, .modal-footer { border-color: rgba(244,114,182,0.2) !important; color: #be185d !important; }
.btn-close { color: #9d6b8f !important; }
/* Toast */
.toast {
    background: rgba(255,255,255,0.97) !important;
    border: 1.5px solid rgba(244,114,182,0.3) !important;
    color: #be185d !important;
    box-shadow: 0 8px 24px rgba(236,72,153,0.2) !important;
    font-weight: 600 !important;
}
/* Buttons */
.btn-primary {
    background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #a855f7 100%) !important;
    color: #fff !important;
    border: none !important;
    padding: 8px 18px !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 14px rgba(236,72,153,0.35) !important;
}
.btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(236,72,153,0.45) !important; }
.btn-secondary {
    background: rgba(255,255,255,0.7) !important;
    color: #7c3a6b !important;
    border: 1.5px solid rgba(244,114,182,0.3) !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
}
.btn-secondary:hover {
    background: rgba(255,255,255,0.95) !important;
    border-color: #ec4899 !important;
    box-shadow: 0 4px 14px rgba(236,72,153,0.15) !important;
}
/* Scrollbar */
::-webkit-scrollbar-track { background: rgba(255,255,255,0.5) !important; }
::-webkit-scrollbar-thumb { background: rgba(236,72,153,0.4) !important; border-radius: 6px !important; }
/* Version banner */
#versionBanner { background: rgba(255,255,255,0.85) !important; color: #7c3a6b !important; border-bottom-color: rgba(244,114,182,0.3) !important; }
/* Decorative sparkle */
body::after {
    content: '✨' !important;
    position: fixed !important;
    top: 14px !important;
    right: 20px !important;
    font-size: 20px !important;
    animation: twinkle 2s ease-in-out infinite !important;
    z-index: 99999 !important;
    pointer-events: none !important;
}
@keyframes twinkle { 0%,100%{opacity:0.4;transform:scale(1);} 50%{opacity:1;transform:scale(1.2);} }
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

// ─── STEP 4: "Back to Simple" floating button (moved to bottom-right) ───
var backBtn = document.createElement('button');
backBtn.innerHTML = '← ' + ((window.TR_LANG === 'zh') ? '返回简单模式 🌸' : 'Back to Simple 🌸');
backBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;padding:10px 18px;background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;border:none;border-radius:12px;font-size:13px;cursor:pointer;font-weight:700;box-shadow:0 4px 14px rgba(236,72,153,0.35);transition:all 0.3s ease;';
backBtn.onmouseenter = function() { backBtn.style.transform = 'translateY(-2px)'; backBtn.style.boxShadow = '0 8px 24px rgba(236,72,153,0.45)'; };
backBtn.onmouseleave = function() { backBtn.style.transform = ''; backBtn.style.boxShadow = '0 4px 14px rgba(236,72,153,0.35)'; };
backBtn.onclick = function() { location.href = location.pathname + location.hash; };
document.body.appendChild(backBtn);

// ─── STEP 5: Initialize modules with error logging ───
function safe(fn, label) {
    try { fn(); }
    catch (e) { console.error('[TR][' + label + ']', e); }
}

console.log('[TR] Advanced init. Modules:', {
    TR_I18N: typeof TR_I18N, TR_RULES: typeof TR_RULES, TR_UI: typeof TR_UI,
    TR_STATE: typeof TR_STATE, TR_SANDBOX: typeof TR_SANDBOX, TR_BATCH: typeof TR_BATCH
});

safe(function() { if (TR_I18N && TR_I18N.apply) TR_I18N.apply(); }, 'i18n');
safe(function() { if (TR_RULES && TR_RULES.render) TR_RULES.render(); }, 'rules-render');
safe(function() { if (TR_UI && TR_UI.bindTabs) TR_UI.bindTabs(); }, 'bindTabs');
safe(function() { if (TR_UI && TR_UI.process) TR_UI.process(); }, 'process');

// ─── STEP 6: Wire toolbar buttons ───
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

// ─── STEP 7: File input handlers ───
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

// ─── STEP 8: Preset modal ───
var presetModal = document.getElementById('presetModal');
if (presetModal) {
    bind('btnPreset', function() { presetModal.style.display = 'flex'; });
    bind('closePreset', function() { presetModal.style.display = 'none'; });
    bind('savePreset', function() {
        var name = prompt((TR_I18N && TR_I18N._('preName')) ? TR_I18N._('preName') : 'Preset name:');
        if (name && TR_PRESETS) { TR_PRESETS.save(name); if (TR_UI) TR_UI.toast(TR_I18N._('saved')); }
    });
}

})();