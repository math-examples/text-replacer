/* ═══════════════════════════════════════════
   Text Replacer — Simple Mode Logic
═══════════════════════════════════════════ */
(function () {
  'use strict';

  // ─── Version from meta (no hardcoded fallback needed) ───
  var vMeta = document.querySelector('meta[name="version"]');
  var VERSION = vMeta ? vMeta.content : 'v1.0.9';
  var tv = document.getElementById('topVersion');
  var hv = document.getElementById('headerVersion');
  if (tv) tv.textContent = VERSION;
  if (hv) hv.textContent = VERSION;

  // ─── SRI Toggle (debug) ───
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

  // ─── Load from local file (UTF-8) ───
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
      this.value = ''; // allow re-selecting same file
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
      row.innerHTML = '<input class="simpleFrom" placeholder="Find (literal or /regex/)"><span class="simple-arrow">→</span><input class="simpleTo" placeholder="Replace with"><button class="simple-remove-rule" title="Remove">✕</button>';
      rulesContainer.appendChild(row);
      row.querySelector('.simple-remove-rule').addEventListener('click', function () { row.remove(); updateRemoveButtons(); });
      updateRemoveButtons();
    });
  }

  // Vice versa: swap all from/to
  if (viceVersaBtn) {
    viceVersaBtn.addEventListener('click', function () {
      rulesContainer.querySelectorAll('.simple-rule-row').forEach(function (row) {
        var from = row.querySelector('.simpleFrom');
        var to = row.querySelector('.simpleTo');
        if (from && to) { var tmp = from.value; from.value = to.value; to.value = tmp; }
      });
    });
  }

  // ─── Replace (multi-pair sequential) ───
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

  // ─── Swap input/output ───
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
      btnCopy.textContent = '✓ Copied';
      setTimeout(function () { btnCopy.innerHTML = '&#128203; Copy'; }, 1500);
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
    });
  }

  // ─── Load verification (check CDN scripts loaded) ───
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
      var parts = [];
      if (errors.length > 0) parts.push('Failed to load: ' + errors.join(', '));
      if (missingGlobals.length > 0) parts.push('Missing objects: ' + missingGlobals.join(', '));
      parts.push('Check your internet connection, verify the version tag, or run ./setup.sh to update SRI hashes.');
      msg.innerHTML = parts.join('<br>');
      banner.style.display = 'block';
      console.error('Text Replacer load errors:', { errors: errors, missingGlobals: missingGlobals });
    }
  }, 800);

})();