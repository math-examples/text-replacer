/* ═══════════════════════════════════════════
Text Replacer — Simple Mode (Girly Edition 🌸)
═══════════════════════════════════════════ */
(function () {
'use strict';

// ─── Mode detection via URL only ───
var params = new URLSearchParams(location.search);
var isAdvanced = params.get('advanced') === '1';

// ─── Language helper ───
function isZh() {
  return window.TR_LANG === 'zh' || (navigator.language || '').toLowerCase().indexOf('zh') === 0;
}

// ─── Embedded dict ───
var FALLBACK = {
  zh: {
    find: '查找 ✨', replace: '替换为 💖', advanced: '进入高级模式 🚀',
    simpleTitle: '文本替换器', simpleInput: '粘贴或输入文本...', simpleOutput: '结果将显示在这里...',
    simplePaste: '📋 粘贴', simpleLoad: '📂 加载', simpleAdd: '+ 添加规则',
    simpleViceVersa: '⇄ 全部交换', simpleReplace: '✨ 替换！', simpleSwap: '⇄ 交换',
    simpleCopy: '📋 复制', simpleDownload: '💾 下载',
    regex: '正则', caseInsensitive: '忽略大小写', copied: '💖 已复制', saved: '💾 已保存'
  },
  en: {
    find: 'Find ✨', replace: 'Replace with 💖', advanced: 'Go to Advanced Mode 🚀',
    simpleTitle: 'Text Replacer', simpleInput: 'Paste or type text here...', simpleOutput: 'Result appears here...',
    simplePaste: '📋 Paste', simpleLoad: '📂 Load', simpleAdd: '+ Add Rule',
    simpleViceVersa: '⇄ Swap All', simpleReplace: '✨ Replace!', simpleSwap: '⇄ Swap',
    simpleCopy: '📋 Copy', simpleDownload: '💾 Download',
    regex: 'Regex', caseInsensitive: 'Aa', copied: '💖 Copied!', saved: '💾 Saved!'
  }
};

function _t(k) {
  if (typeof TR_I18N !== 'undefined' && TR_I18N._) {
    var val = TR_I18N._(k);
    if (val !== k) return val;
  }
  return (isZh() ? FALLBACK.zh : FALLBACK.en)[k] || k;
}

// ─── Version ───
function setVersion() {
  var vMeta = document.querySelector('meta[name="version"]');
  var v = vMeta ? vMeta.content : 'v1.0.15';
  var tv = document.getElementById('topVersion');
  if (tv) tv.textContent = v;
}

// ─── Toast ───
function showCuteToast(msg) {
  if (typeof TR_UI !== 'undefined' && TR_UI.toast) { TR_UI.toast(msg); return; }
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) scale(0.9);background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s cubic-bezier(0.4,0,0.2,1);box-shadow:0 8px 24px rgba(236,72,153,0.4);';
  document.body.appendChild(t);
  requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) scale(1)'; });
  setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) scale(0.9)'; setTimeout(function () { document.body.removeChild(t); }, 300); }, 2000);
}

// ─── Inject critical CSS for Advanced button visibility ───
function injectButtonFix() {
  var style = document.createElement('style');
  style.textContent = `
    #simpleAdvanced {
      position: fixed !important;
      top: env(safe-area-inset-top, 8px) !important;
      right: env(safe-area-inset-right, 8px) !important;
      z-index: 10000 !important;
      display: inline-block !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      background: linear-gradient(135deg, #ec4899, #a855f7) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 20px !important;
      padding: 8px 16px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(236,72,153,0.4) !important;
    }
    /* Ensure simple mode container doesn't overflow-hidden the button */
    #simpleMode, .simple-container {
      overflow: visible !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── i18n element ───
function applyI18nToEl(el) {
  if (!el) return;
  if (el.classList.contains('simpleFrom')) el.placeholder = _t('find');
  if (el.classList.contains('simpleTo')) el.placeholder = _t('replace');
  if (el.id === 'simpleInput') el.placeholder = _t('simpleInput');
  if (el.id === 'simpleOutput') el.placeholder = _t('simpleOutput');
}

function applyI18n() {
  var title = document.querySelector('.simple-container h2');
  if (title) title.innerHTML = '<span>' + _t('simpleTitle') + '</span>';
  document.querySelectorAll('.simpleFrom, .simpleTo, #simpleInput, #simpleOutput').forEach(applyI18nToEl);
  var map = {
    'simplePaste': 'simplePaste', 'simpleLoad': 'simpleLoad', 'addSimpleRule': 'simpleAdd',
    'viceVersaBtn': 'simpleViceVersa', 'simpleReplace': 'simpleReplace', 'simpleSwap': 'simpleSwap',
    'simpleCopy': 'simpleCopy', 'simpleDownload': 'simpleDownload', 'simpleAdvanced': 'advanced'
  };
  for (var id in map) {
    var el = document.getElementById(id);
    if (el) el.textContent = _t(map[id]);
  }
  var rl = document.querySelector('label[for="simpleRegex"]');
  if (rl) rl.innerHTML = '<input type="checkbox" id="simpleRegex"> ' + _t('regex');
  var cl = document.querySelector('label[for="simpleCase"]');
  if (cl) cl.innerHTML = '<input type="checkbox" id="simpleCase"> ' + _t('caseInsensitive');
}

function applyI18nWhenReady(retries) {
  retries = retries || 0;
  if (typeof TR_I18N !== 'undefined' && TR_I18N._) applyI18n();
  else if (retries < 20) setTimeout(function () { applyI18nWhenReady(retries + 1); }, 50);
  else applyI18n();
}

function observeDynamicI18n() {
  var container = document.getElementById('simpleRules');
  if (!container) return;
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          node.querySelectorAll && node.querySelectorAll('.simpleFrom, .simpleTo').forEach(applyI18nToEl);
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
  injectButtonFix();

  var simple = document.getElementById('simpleMode');
  if (!simple) return;

  // If advanced mode via URL, hide simple entirely
  if (isAdvanced) {
    simple.style.display = 'none';
    return;
  }

  // Show simple mode
  simple.style.display = '';
  setVersion();
  applyI18nWhenReady();
  observeDynamicI18n();

  // Advanced button → navigate with param
  var btnAdvanced = document.getElementById('simpleAdvanced');
  if (btnAdvanced) {
    btnAdvanced.addEventListener('click', function () {
      location.href = location.pathname + '?advanced=1' + location.hash;
    });
  }

  // Rules
  var container = document.getElementById('simpleRules');
  var addBtn = document.getElementById('addSimpleRule');
  var viceVersaBtn = document.getElementById('viceVersaBtn');

  function updateRemove() {
    var rows = container.querySelectorAll('.simple-rule-row');
    rows.forEach(function (row) {
      var rm = row.querySelector('.simple-remove-rule');
      if (rm) rm.style.display = rows.length > 1 ? '' : 'none';
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', function () {
      var row = document.createElement('div');
      row.className = 'simple-rule-row';
      row.innerHTML = '<input class="simpleFrom" placeholder="' + _t('find') + '"><span class="simple-arrow">→</span><input class="simpleTo" placeholder="' + _t('replace') + '"><button class="simple-remove-rule" title="' + (isZh() ? '删除' : 'Remove') + '">✕</button>';
      container.appendChild(row);
      row.querySelector('.simple-remove-rule').addEventListener('click', function () { row.remove(); updateRemove(); });
      updateRemove();
    });
  }
  if (viceVersaBtn) {
    viceVersaBtn.addEventListener('click', function () {
      container.querySelectorAll('.simple-rule-row').forEach(function (row) {
        var from = row.querySelector('.simpleFrom'), to = row.querySelector('.simpleTo');
        if (from && to) { var tmp = from.value; from.value = to.value; to.value = tmp; }
      });
    });
  }
  updateRemove();

  // Buttons
  var inp = document.getElementById('simpleInput'), out = document.getElementById('simpleOutput');
  var regexEl = document.getElementById('simpleRegex'), caseEl = document.getElementById('simpleCase');

  function doReplace() {
    var text = inp.value;
    var regex = regexEl && regexEl.checked, casei = caseEl && caseEl.checked;
    if (!text) { out.value = ''; return; }
    container.querySelectorAll('.simple-rule-row').forEach(function (row) {
      var from = row.querySelector('.simpleFrom').value, to = row.querySelector('.simpleTo').value;
      if (!from) return;
      try {
        var re = regex ? new RegExp(from, 'g' + (casei ? 'i' : '')) : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + (casei ? 'i' : ''));
        text = text.replace(re, to);
      } catch (e) { text = 'Regex error: ' + e.message; }
    });
    out.value = text;
  }

  var btnReplace = document.getElementById('simpleReplace');
  if (btnReplace) btnReplace.addEventListener('click', doReplace);
  if (inp) inp.addEventListener('input', doReplace);

  var btnPaste = document.getElementById('simplePaste');
  if (btnPaste && inp) btnPaste.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (t) { inp.value = t; inp.focus(); doReplace(); }).catch(function () { inp.focus(); document.execCommand('paste'); });
    else { inp.focus(); document.execCommand('paste'); }
  });

  var btnLoad = document.getElementById('simpleLoad'), fileInput = document.getElementById('simpleFileInput');
  if (btnLoad && fileInput && inp) {
    btnLoad.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function (e) { inp.value = e.target.result; inp.focus(); doReplace(); };
      r.readAsText(f, 'UTF-8'); this.value = '';
    });
  }

  var btnSwap = document.getElementById('simpleSwap');
  if (btnSwap) btnSwap.addEventListener('click', function () { var tmp = inp.value; inp.value = out.value; out.value = tmp; });

  var btnCopy = document.getElementById('simpleCopy');
  if (btnCopy) btnCopy.addEventListener('click', function () {
    if (!out.value) return; out.select(); document.execCommand('copy');
    var orig = btnCopy.textContent; btnCopy.textContent = '💖 ' + _t('copied'); setTimeout(function () { btnCopy.textContent = orig; }, 1500);
  });

  var btnDownload = document.getElementById('simpleDownload');
  if (btnDownload) btnDownload.addEventListener('click', function () {
    var blob = new Blob([out.value || ''], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'output.txt'; a.click();
    showCuteToast('💾 ' + _t('saved'));
  });
}

// ─── Boot ───
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();