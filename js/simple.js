/* ═══════════════════════════════════════════
Text Replacer — Simple Mode (Girly Edition 🌸)
═══════════════════════════════════════════ */
(function () {
'use strict';

var ADV_KEY = 'tr-advanced';

// ─── Language detection (bulletproof) ───
function isZh() {
  var l = (navigator.language || navigator.userLanguage || navigator.browserLanguage || 'en').toLowerCase();
  return l.indexOf('zh') === 0;
}

// ─── i18n helper ───
function _t(k) {
  // Prefer global TR_I18N if available
  if (typeof TR_I18N !== 'undefined' && TR_I18N._) return TR_I18N._(k);
  // Fallback dict with correct language
  var zh = {
    find: '查找 ✨', replace: '替换为 💖', advanced: '进入高级模式 🚀',
    simpleTitle: '文本替换器', simpleInput: '粘贴或输入文本...', simpleOutput: '结果将显示在这里...',
    simplePaste: '📋 粘贴', simpleLoad: '📂 加载', simpleAdd: '+ 添加规则',
    simpleViceVersa: '⇄ 全部交换', simpleReplace: '✨ 替换！', simpleSwap: '⇄ 交换',
    simpleCopy: '📋 复制', simpleDownload: '💾 下载',
    regex: '正则', caseInsensitive: '忽略大小写', copied: '💖 已复制', saved: '💾 已保存'
  };
  var en = {
    find: 'Find ✨', replace: 'Replace with 💖', advanced: 'Go to Advanced Mode 🚀',
    simpleTitle: 'Text Replacer', simpleInput: 'Paste or type text here...', simpleOutput: 'Result appears here...',
    simplePaste: '📋 Paste', simpleLoad: '📂 Load', simpleAdd: '+ Add Rule',
    simpleViceVersa: '⇄ Swap All', simpleReplace: '✨ Replace!', simpleSwap: '⇄ Swap',
    simpleCopy: '📋 Copy', simpleDownload: '💾 Download',
    regex: 'Regex', caseInsensitive: 'Aa', copied: '💖 Copied!', saved: '💾 Saved!'
  };
  return (isZh() ? zh : en)[k] || k;
}

// ─── Version ───
function setVersion() {
  var vMeta = document.querySelector('meta[name="version"]');
  var v = vMeta ? vMeta.content : 'v1.0.15';
  var tv = document.getElementById('topVersion');
  var hv = document.getElementById('headerVersion');
  if (tv) tv.textContent = v;
  if (hv) hv.textContent = v;
}

// ─── Cute toast ───
function showCuteToast(msg) {
  if (typeof TR_UI !== 'undefined' && TR_UI.toast) { TR_UI.toast(msg); return; }
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) scale(0.9);background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s cubic-bezier(0.4,0,0.2,1);box-shadow:0 8px 24px rgba(236,72,153,0.4);';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='translateX(-50%) scale(1)'; });
  setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(-50%) scale(0.9)'; setTimeout(function(){ document.body.removeChild(t); }, 300); }, 2000);
}

// ─── Apply i18n to a single element ───
function applyI18nToEl(el) {
  if (!el) return;
  if (el.classList.contains('simpleFrom')) el.placeholder = _t('find');
  if (el.classList.contains('simpleTo')) el.placeholder = _t('replace');
  if (el.id === 'simpleInput') el.placeholder = _t('simpleInput');
  if (el.id === 'simpleOutput') el.placeholder = _t('simpleOutput');
}

// ─── Apply i18n to all static elements ───
function applyI18n() {
  // Title
  var title = document.querySelector('.simple-container h2');
  if (title) title.innerHTML = '<span>' + _t('simpleTitle') + '</span>';

  // Textareas & all rule inputs
  document.querySelectorAll('.simpleFrom, .simpleTo, #simpleInput, #simpleOutput').forEach(applyI18nToEl);

  // Buttons by ID
  var map = {
    'simplePaste': 'simplePaste', 'simpleLoad': 'simpleLoad', 'addSimpleRule': 'simpleAdd',
    'viceVersaBtn': 'simpleViceVersa', 'simpleReplace': 'simpleReplace', 'simpleSwap': 'simpleSwap',
    'simpleCopy': 'simpleCopy', 'simpleDownload': 'simpleDownload', 'simpleAdvanced': 'advanced'
  };
  for (var id in map) {
    var el = document.getElementById(id);
    if (el) el.textContent = _t(map[id]);
  }

  // Checkbox labels (rebuild to keep inputs)
  var regexLabel = document.querySelector('label[for="simpleRegex"]');
  if (regexLabel) regexLabel.innerHTML = '<input type="checkbox" id="simpleRegex"> ' + _t('regex');
  var caseLabel = document.querySelector('label[for="simpleCase"]');
  if (caseLabel) caseLabel.innerHTML = '<input type="checkbox" id="simpleCase"> ' + _t('caseInsensitive');
}

// ─── MutationObserver for dynamic rule rows ───
function observeDynamicI18n() {
  var container = document.getElementById('simpleRules');
  if (!container) return;
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // element
          // Translate the row's inputs
          node.querySelectorAll && node.querySelectorAll('.simpleFrom, .simpleTo').forEach(applyI18nToEl);
          // Also translate the remove button if present
          var rm = node.querySelector && node.querySelector('.simple-remove-rule');
          if (rm) rm.title = isZh() ? '删除' : 'Remove';
        }
      });
    });
  });
  observer.observe(container, { childList: true });
}

// ─── Init ───
function init() {
  var simple = document.getElementById('simpleMode');
  if (!simple) return;

  // Set version immediately
  setVersion();

  // If user previously chose advanced, hide simple mode entirely
  if (localStorage.getItem(ADV_KEY) === '1') {
    simple.style.display = 'none';
    return; // Stop here — don't init simple UI
  }

  // Show simple mode
  simple.classList.add('showing');
  setTimeout(function(){ simple.classList.remove('showing'); }, 400);

  // Apply i18n (with retry in case TR_I18N loads late)
  applyI18n();
  observeDynamicI18n();
  // Retry once after a short delay to catch late-loading TR_I18N
  setTimeout(applyI18n, 100);

  // SRI toggle
  var DISABLE_SRI = localStorage.getItem('tr_disable_sri') === '1' || new URLSearchParams(location.search).has('nohash');
  var toggle = document.getElementById('toggleSRI');
  if (toggle) {
    toggle.checked = DISABLE_SRI;
    toggle.onchange = function () {
      localStorage.setItem('tr_disable_sri', this.checked ? '1' : '0');
      location.reload();
    };
  }

  // Advanced button — ALWAYS visible, forced display
  var btnAdvanced = document.getElementById('simpleAdvanced');
  if (btnAdvanced) {
    btnAdvanced.style.display = 'inline-block';
    btnAdvanced.addEventListener('click', function(){
      localStorage.setItem(ADV_KEY, '1');
      location.reload();
    });
  }

  // Multi-pair rules
  initRules();

  // Buttons
  initButtons();
}

function initRules() {
  var container = document.getElementById('simpleRules');
  var addBtn = document.getElementById('addSimpleRule');
  var viceVersaBtn = document.getElementById('viceVersaBtn');

  function updateRemove() {
    var rows = container.querySelectorAll('.simple-rule-row');
    rows.forEach(function(row){
      var rm = row.querySelector('.simple-remove-rule');
      if (rm) rm.style.display = rows.length > 1 ? '' : 'none';
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', function(){
      var row = document.createElement('div');
      row.className = 'simple-rule-row';
      row.innerHTML = '<input class="simpleFrom" placeholder="' + _t('find') + '"><span class="simple-arrow">→</span><input class="simpleTo" placeholder="' + _t('replace') + '"><button class="simple-remove-rule" title="' + (isZh() ? '删除' : 'Remove') + '">✕</button>';
      container.appendChild(row);
      row.querySelector('.simple-remove-rule').addEventListener('click', function(){ row.remove(); updateRemove(); });
      updateRemove();
    });
  }

  if (viceVersaBtn) {
    viceVersaBtn.addEventListener('click', function(){
      container.querySelectorAll('.simple-rule-row').forEach(function(row){
        var from = row.querySelector('.simpleFrom');
        var to = row.querySelector('.simpleTo');
        if (from && to) { var tmp = from.value; from.value = to.value; to.value = tmp; }
      });
    });
  }

  updateRemove();
}

function initButtons() {
  var inp = document.getElementById('simpleInput');
  var out = document.getElementById('simpleOutput');
  var regexEl = document.getElementById('simpleRegex');
  var caseEl = document.getElementById('simpleCase');

  function doReplace() {
    var text = inp.value;
    var regex = regexEl && regexEl.checked;
    var casei = caseEl && caseEl.checked;
    if (!text) { out.value = ''; return; }
    document.querySelectorAll('.simple-rule-row').forEach(function(row){
      var from = row.querySelector('.simpleFrom').value;
      var to = row.querySelector('.simpleTo').value;
      if (!from) return;
      try {
        var re = regex
          ? new RegExp(from, 'g' + (casei ? 'i' : ''))
          : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + (casei ? 'i' : ''));
        text = text.replace(re, to);
      } catch(e) { text = 'Regex error: ' + e.message; }
    });
    out.value = text;
  }

  var btnReplace = document.getElementById('simpleReplace');
  if (btnReplace) btnReplace.addEventListener('click', doReplace);
  if (inp) inp.addEventListener('input', doReplace);

  // Paste
  var btnPaste = document.getElementById('simplePaste');
  if (btnPaste && inp) {
    btnPaste.addEventListener('click', function(){
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(function(t){ inp.value = t; inp.focus(); doReplace(); }).catch(function(){ inp.focus(); document.execCommand('paste'); });
      } else { inp.focus(); document.execCommand('paste'); }
    });
  }

  // Load file
  var btnLoad = document.getElementById('simpleLoad');
  var fileInput = document.getElementById('simpleFileInput');
  if (btnLoad && fileInput && inp) {
    btnLoad.addEventListener('click', function(){ fileInput.click(); });
    fileInput.addEventListener('change', function(){
      var f = this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function(e){ inp.value = e.target.result; inp.focus(); doReplace(); };
      r.readAsText(f, 'UTF-8'); this.value = '';
    });
  }

  // Swap
  var btnSwap = document.getElementById('simpleSwap');
  if (btnSwap) btnSwap.addEventListener('click', function(){ var tmp = inp.value; inp.value = out.value; out.value = tmp; });

  // Copy
  var btnCopy = document.getElementById('simpleCopy');
  if (btnCopy) {
    btnCopy.addEventListener('click', function(){
      if (!out.value) return;
      out.select();
      document.execCommand('copy');
      var orig = btnCopy.textContent;
      btnCopy.textContent = '💖 ' + _t('copied');
      setTimeout(function(){ btnCopy.textContent = orig; }, 1500);
    });
  }

  // Download
  var btnDownload = document.getElementById('simpleDownload');
  if (btnDownload) {
    btnDownload.addEventListener('click', function(){
      var blob = new Blob([out.value || ''], { type: 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'output.txt'; a.click();
      showCuteToast('💾 ' + _t('saved'));
    });
  }
}

// ─── Boot ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();