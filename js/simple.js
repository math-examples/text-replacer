/* ═══════════════════════════════════════════
Text Replacer — Simple Mode Logic (Girly Edition 🌸)
═══════════════════════════════════════════ */
(function () {
'use strict';

// ─── i18n helpers ───
function _t(k) {
  if (typeof TR_I18N !== 'undefined' && TR_I18N._) return TR_I18N._(k);
  return k;
}

// ─── Cute toast (girly) ───
function showCuteToast(msg) {
  // Try full UI toast first
  if (typeof TR_UI !== 'undefined' && TR_UI.toast) { TR_UI.toast(msg); return; }
  // Fallback cute toast
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) scale(0.9);background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s cubic-bezier(0.4,0,0.2,1);box-shadow:0 8px 24px rgba(236,72,153,0.4);';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='translateX(-50%) scale(1)'; });
  setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(-50%) scale(0.9)'; setTimeout(function(){ document.body.removeChild(t); }, 300); }, 2000);
}

// ─── Version from meta ───
var vMeta = document.querySelector('meta[name="version"]');
var VERSION = vMeta ? vMeta.content : 'v1.0.9';
var tv = document.getElementById('topVersion');
var hv = document.getElementById('headerVersion');
if (tv) tv.textContent = VERSION;
if (hv) hv.textContent = VERSION;

// ─── SRI Toggle ───
var DISABLE_SRI = localStorage.getItem('tr_disable_sri') === '1' || new URLSearchParams(location.search).has('nohash');
var toggle = document.getElementById('toggleSRI');
if (toggle) {
  toggle.checked = DISABLE_SRI;
  toggle.onchange = function () {
    localStorage.setItem('tr_disable_sri', this.checked ? '1' : '0');
    location.reload();
  };
}

// ─── Advanced / Simple toggle ───
var simpleMode = document.getElementById('simpleMode');
var fullUI = document.getElementById('fullUI');
var btnAdvanced = document.getElementById('simpleAdvanced');
var btnBackSimple = document.getElementById('btnBackSimple');

function showAdvanced() { simpleMode.style.display = 'none'; fullUI.style.display = 'block'; window.scrollTo(0, 0); }
function showSimple() { simpleMode.style.display = ''; fullUI.style.display = 'none'; window.scrollTo(0, 0); }

if (btnAdvanced) btnAdvanced.addEventListener('click', showAdvanced);
if (btnBackSimple) btnBackSimple.addEventListener('click', showSimple);

// ─── Apply i18n ───
function applySimpleI18n() {
  var simpleFrom = document.getElementById('simpleFrom');
  var simpleTo = document.getElementById('simpleTo');
  if (simpleFrom) simpleFrom.placeholder = _t('find') || 'Find';
  if (simpleTo) simpleTo.placeholder = _t('replace') || 'Replace';
}
setTimeout(applySimpleI18n, 0);

// ─── Paste button ───
var btnPaste = document.getElementById('simplePaste');
var simpleInput = document.getElementById('simpleInput');
if (btnPaste && simpleInput) {
  btnPaste.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (text) { simpleInput.value = text; simpleInput.focus(); })
      .catch(function () { simpleInput.focus(); document.execCommand('paste'); });
    } else { simpleInput.focus(); document.execCommand('paste'); }
  });
}

// ─── Load from local file ───
var btnLoad = document.getElementById('simpleLoad');
var simpleFileInput = document.getElementById('simpleFileInput');
if (btnLoad && simpleFileInput) {
  btnLoad.addEventListener('click', function () { simpleFileInput.click(); });
  simpleFileInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) { simpleInput.value = e.target.result; simpleInput.focus(); };
    reader.readAsText(file, 'UTF-8');
    this.value = '';
  });
}

// ─── Multi-pair rules logic ───
var rulesContainer = document.getElementById('simpleRules');
var addRuleBtn = document.getElementById('addSimpleRule');
var viceVersaBtn = document.getElementById('viceVersaBtn');
var simpleRegex = document.getElementById('simpleRegex');
var simpleCase = document.getElementById('simpleCase');

function updateRemoveButtons() {
  var rows = rulesContainer.querySelectorAll('.simple-rule-row');
  rows.forEach(function (row) {
    var rm = row.querySelector('.simple-remove-rule');
    if (rm) rm.style.display = rows.length > 1 ? '' : 'none';
  });
}

if (addRuleBtn) {
  addRuleBtn.addEventListener('click', function () {
    var row = document.createElement('div');
    row.className = 'simple-rule-row';
    row.innerHTML = '<input class="simpleFrom" placeholder="' + (_t('find') || 'Find') + '"><span class="simple-arrow">→</span><input class="simpleTo" placeholder="' + (_t('replace') || 'Replace') + '"><button class="simple-remove-rule" title="Remove">✕</button>';
    rulesContainer.appendChild(row);
    row.querySelector('.simple-remove-rule').addEventListener('click', function () { row.remove(); updateRemoveButtons(); });
    updateRemoveButtons();
  });
}

if (viceVersaBtn) {
  viceVersaBtn.addEventListener('click', function () {
    rulesContainer.querySelectorAll('.simple-rule-row').forEach(function (row) {
      var from = row.querySelector('.simpleFrom');
      var to = row.querySelector('.simpleTo');
      if (from && to) { var tmp = from.value; from.value = to.value; to.value = tmp; }
    });
  });
}

// ─── Replace ───
var btnReplace = document.getElementById('simpleReplace');
var simpleOutput = document.getElementById('simpleOutput');
if (btnReplace) {
  btnReplace.addEventListener('click', function () {
    var result = simpleInput.value;
    var regex = simpleRegex && simpleRegex.checked;
    var casei = simpleCase && simpleCase.checked;
    rulesContainer.querySelectorAll('.simple-rule-row').forEach(function (row) {
      var from = row.querySelector('.simpleFrom').value;
      var to = row.querySelector('.simpleTo').value;
      if (!from) return;
      try {
        var re = regex
          ? new RegExp(from, 'g' + (casei ? 'i' : ''))
          : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + (casei ? 'i' : ''));
        result = result.replace(re, to);
      } catch (e) { result = 'Regex error: ' + e.message; }
    });
    simpleOutput.value = result;
  });
}

// ─── Swap ───
var btnSwap = document.getElementById('simpleSwap');
if (btnSwap) {
  btnSwap.addEventListener('click', function () {
    var tmp = simpleInput.value;
    simpleInput.value = simpleOutput.value;
    simpleOutput.value = tmp;
  });
}

// ─── Copy ───
var btnCopy = document.getElementById('simpleCopy');
if (btnCopy) {
  btnCopy.addEventListener('click', function () {
    if (!simpleOutput.value) return;
    simpleOutput.select();
    document.execCommand('copy');
    var origHTML = btnCopy.innerHTML;
    btnCopy.textContent = '💖 ' + (_t('copied') || 'Copied!');
    setTimeout(function () { btnCopy.innerHTML = origHTML; }, 1500);
  });
}

// ─── Download ───
var btnDownload = document.getElementById('simpleDownload');
if (btnDownload) {
  btnDownload.addEventListener('click', function () {
    var blob = new Blob([simpleOutput.value || ''], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'output.txt';
    a.click();
    showCuteToast('💾 ' + (_t('saved') || 'Saved!'));
  });
}

// ─── Load verification ───
setTimeout(function () {
  var errors = window.__scriptLoadErrors || [];
  var missingGlobals = [];
  if (typeof TR_I18N === 'undefined') missingGlobals.push('TR_I18N');
  if (typeof TR_STATE === 'undefined') missingGlobals.push('TR_STATE');
  if (typeof TR_PROCESSOR === 'undefined') missingGlobals.push('TR_PROCESSOR');
  if (typeof TR_RULES === 'undefined') missingGlobals.push('TR_RULES');
  if (typeof TR_UI === 'undefined') missingGlobals.push('TR_UI');
  if (errors.length > 0 || missingGlobals.length > 0) {
    var banner = document.getElementById('loadErrorBanner');
    var msg = document.getElementById('loadErrorMsg');
    if (banner && msg) {
      var parts = [];
      if (errors.length > 0) parts.push('Failed to load: ' + errors.join(', '));
      if (missingGlobals.length > 0) parts.push('Missing objects: ' + missingGlobals.join(', '));
      parts.push('Check your internet connection, verify the version tag, or run ./setup.sh to update SRI hashes.');
      msg.innerHTML = parts.join('<br>');
      banner.style.display = 'block';
    }
  }
}, 800);
})();