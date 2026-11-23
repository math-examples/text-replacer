/* ═══════════════════════════════════════════
Text Replacer — Simple Mode (Girly Edition 🌸)
═══════════════════════════════════════════ */
(function () {
'use strict';

var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── If advanced, do nothing — app.js owns the page ───
if (isAdvanced) return;

// ─── Language ───
function isZh() { return window.TR_LANG === 'zh' || (navigator.language || '').toLowerCase().indexOf('zh') === 0; }

// ─── Dict ───
var D = {
  zh: { find:'查找 ✨', replace:'替换为 💖', advanced:'进入高级模式 🚀', simpleTitle:'文本替换器', simpleInput:'粘贴或输入文本...', simpleOutput:'结果将显示在这里...', simplePaste:'📋 粘贴', simpleLoad:'📂 加载', simpleAdd:'+ 添加规则', simpleViceVersa:'⇄ 全部交换', simpleReplace:'✨ 替换！', simpleSwap:'⇄ 交换', simpleCopy:'📋 复制', simpleDownload:'💾 下载', regex:'正则', caseInsensitive:'忽略大小写', copied:'💖 已复制', saved:'💾 已保存' },
  en: { find:'Find ✨', replace:'Replace with 💖', advanced:'Go to Advanced Mode 🚀', simpleTitle:'Text Replacer', simpleInput:'Paste or type text here...', simpleOutput:'Result appears here...', simplePaste:'📋 Paste', simpleLoad:'📂 Load', simpleAdd:'+ Add Rule', simpleViceVersa:'⇄ Swap All', simpleReplace:'✨ Replace!', simpleSwap:'⇄ Swap', simpleCopy:'📋 Copy', simpleDownload:'💾 Download', regex:'Regex', caseInsensitive:'Aa', copied:'💖 Copied!', saved:'💾 Saved!' }
};
function _t(k) {
  if (typeof TR_I18N !== 'undefined' && TR_I18N._) { var v = TR_I18N._(k); if (v !== k) return v; }
  return (isZh() ? D.zh : D.en)[k] || k;
}

// ─── Remove ALL advanced elements from DOM ───
document.querySelectorAll('#app, .app-container, .app, main, .container, .tabs-container, .editor-container, .rules-panel, .editor-panel, .diff-panel, .sandbox-panel, .batch-panel, .header, .footer, .toolbar, [class*="tab"]:not(.simple-tab), [class*="advanced"]').forEach(function(el) { el.remove(); });

// ─── Inject base styles ───
var style = document.createElement('style');
style.textContent = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #fdf2f8, #faf5ff); margin: 0; padding: 0; min-height: 100vh; }
  #simpleMode { display: block !important; padding: 16px; max-width: 600px; margin: 0 auto; padding-top: env(safe-area-inset-top, 60px); padding-bottom: env(safe-area-inset-bottom, 60px); }
  .simple-container h2 { text-align: center; color: #ec4899; margin-bottom: 16px; }
  .simple-rule-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: center; }
  .simple-rule-row input { flex: 1; padding: 8px 12px; border: 2px solid #fbcfe8; border-radius: 12px; font-size: 14px; }
  .simple-arrow { color: #ec4899; font-weight: bold; }
  .simple-remove-rule { background: #fee2e2; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; color: #dc2626; }
  textarea { width: 100%; min-height: 100px; padding: 12px; border: 2px solid #fbcfe8; border-radius: 16px; font-size: 14px; resize: vertical; margin-bottom: 8px; box-sizing: border-box; }
  .simple-btn-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .simple-btn { padding: 8px 14px; border: none; border-radius: 12px; font-size: 13px; cursor: pointer; font-weight: 600; }
  .btn-pink { background: linear-gradient(135deg, #ec4899, #a855f7); color: #fff; }
  .btn-purple { background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; }
  .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
  .btn-gray { background: #f3f4f6; color: #374151; }
  .simple-checkbox-row { display: flex; gap: 12px; align-items: center; margin: 8px 0; font-size: 13px; }
  .simple-checkbox-row label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
  /* Fixed Advanced button — ALWAYS visible, never hidden by browser UI */
  #simpleAdvancedBtn { position: fixed !important; bottom: max(16px, env(safe-area-inset-bottom)) !important; right: max(16px, env(safe-area-inset-right)) !important; z-index: 2147483647 !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important; background: linear-gradient(135deg, #ec4899, #a855f7) !important; color: #fff !important; border: none !important; border-radius: 24px !important; padding: 12px 20px !important; font-size: 14px !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: 0 6px 20px rgba(236,72,153,0.5) !important; }
`;
document.head.appendChild(style);

// ─── Ensure simpleMode exists ───
var simple = document.getElementById('simpleMode');
if (!simple) {
  simple = document.createElement('div');
  simple.id = 'simpleMode';
  document.body.appendChild(simple);
}
simple.innerHTML = `
  <div class="simple-container">
    <h2><span>${_t('simpleTitle')}</span></h2>
    <div id="simpleRules">
      <div class="simple-rule-row">
        <input class="simpleFrom" placeholder="${_t('find')}">
        <span class="simple-arrow">→</span>
        <input class="simpleTo" placeholder="${_t('replace')}">
        <button class="simple-remove-rule" title="${isZh()?'删除':'Remove'}">✕</button>
      </div>
    </div>
    <div class="simple-btn-row">
      <button class="simple-btn btn-gray" id="addSimpleRule">${_t('simpleAdd')}</button>
      <button class="simple-btn btn-gray" id="viceVersaBtn">${_t('simpleViceVersa')}</button>
    </div>
    <div class="simple-checkbox-row">
      <label><input type="checkbox" id="simpleRegex"> ${_t('regex')}</label>
      <label><input type="checkbox" id="simpleCase"> ${_t('caseInsensitive')}</label>
    </div>
    <textarea id="simpleInput" placeholder="${_t('simpleInput')}"></textarea>
    <div class="simple-btn-row">
      <button class="simple-btn btn-pink" id="simpleReplace">${_t('simpleReplace')}</button>
      <button class="simple-btn btn-purple" id="simpleSwap">${_t('simpleSwap')}</button>
      <button class="simple-btn btn-gray" id="simplePaste">${_t('simplePaste')}</button>
      <button class="simple-btn btn-gray" id="simpleLoad">${_t('simpleLoad')}</button>
      <input type="file" id="simpleFileInput" style="display:none">
    </div>
    <textarea id="simpleOutput" placeholder="${_t('simpleOutput')}" readonly></textarea>
    <div class="simple-btn-row">
      <button class="simple-btn btn-green" id="simpleCopy">${_t('simpleCopy')}</button>
      <button class="simple-btn btn-green" id="simpleDownload">${_t('simpleDownload')}</button>
    </div>
    <div id="topVersion" style="text-align:center;margin-top:12px;font-size:11px;color:#999;"></div>
  </div>
`;
// Fixed Advanced button (outside container so it's never clipped)
var advBtn = document.createElement('button');
advBtn.id = 'simpleAdvancedBtn';
advBtn.textContent = '🚀 ' + _t('advanced');
advBtn.onclick = function() { location.href = location.pathname + '?advanced=1' + location.hash; };
document.body.appendChild(advBtn);

// ─── Version ───
var vMeta = document.querySelector('meta[name="version"]');
var tv = document.getElementById('topVersion');
if (tv && vMeta) tv.textContent = vMeta.content;

// ─── Logic ───
var container = document.getElementById('simpleRules');
function updateRemove() {
  container.querySelectorAll('.simple-rule-row').forEach(function(row) {
    var rm = row.querySelector('.simple-remove-rule');
    if (rm) rm.style.display = container.querySelectorAll('.simple-rule-row').length > 1 ? '' : 'none';
  });
}
document.getElementById('addSimpleRule').onclick = function() {
  var row = document.createElement('div'); row.className = 'simple-rule-row';
  row.innerHTML = '<input class="simpleFrom" placeholder="' + _t('find') + '"><span class="simple-arrow">→</span><input class="simpleTo" placeholder="' + _t('replace') + '"><button class="simple-remove-rule" title="' + (isZh()?'删除':'Remove') + '">✕</button>';
  container.appendChild(row);
  row.querySelector('.simple-remove-rule').onclick = function() { row.remove(); updateRemove(); };
  updateRemove();
};
document.getElementById('viceVersaBtn').onclick = function() {
  container.querySelectorAll('.simple-rule-row').forEach(function(row) {
    var f = row.querySelector('.simpleFrom'), t = row.querySelector('.simpleTo');
    if (f && t) { var tmp = f.value; f.value = t.value; t.value = tmp; }
  });
};
updateRemove();

var inp = document.getElementById('simpleInput'), out = document.getElementById('simpleOutput');
var rx = document.getElementById('simpleRegex'), ci = document.getElementById('simpleCase');
function doReplace() {
  var text = inp.value; if (!text) { out.value = ''; return; }
  container.querySelectorAll('.simple-rule-row').forEach(function(row) {
    var f = row.querySelector('.simpleFrom').value, t = row.querySelector('.simpleTo').value;
    if (!f) return;
    try { text = text.replace(rx.checked ? new RegExp(f, 'g'+(ci.checked?'i':'')) : new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g'+(ci.checked?'i':'')), t); }
    catch(e) { text = 'Regex error: ' + e.message; }
  });
  out.value = text;
}
document.getElementById('simpleReplace').onclick = doReplace;
inp.addEventListener('input', doReplace);
document.getElementById('simplePaste').onclick = function() {
  if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function(t){ inp.value=t; doReplace(); });
};
document.getElementById('simpleLoad').onclick = function() { document.getElementById('simpleFileInput').click(); };
document.getElementById('simpleFileInput').onchange = function() {
  var f = this.files[0]; if (!f) return;
  var r = new FileReader(); r.onload = function(e){ inp.value = e.target.result; doReplace(); }; r.readAsText(f); this.value='';
};
document.getElementById('simpleSwap').onclick = function() { var tmp=inp.value; inp.value=out.value; out.value=tmp; };
document.getElementById('simpleCopy').onclick = function() {
  if (!out.value) return; out.select(); document.execCommand('copy');
  var btn = document.getElementById('simpleCopy'); var orig = btn.textContent; btn.textContent = '💖 ' + _t('copied'); setTimeout(function(){ btn.textContent = orig; }, 1500);
};
document.getElementById('simpleDownload').onclick = function() {
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([out.value||''], {type:'text/plain'})); a.download='output.txt'; a.click();
};

})();