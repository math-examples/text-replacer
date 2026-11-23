/* ===== js/app.js ===== */

// ============ SIMPLE MODE — completely standalone ============
(function(){
    'use strict';
    var ADV_KEY = 'tr-advanced';

    function initSimple(){
        var simple = document.getElementById('simpleMode');
        if(!simple) return;

        // If user previously chose advanced, show full UI
        if(localStorage.getItem(ADV_KEY) === '1'){
            simple.style.display = 'none';
            document.querySelectorAll('.header,.tabs,.panel').forEach(function(el){
                el.classList.add('full-ui');
                requestAnimationFrame(function(){ el.classList.add('revealed'); });
            });
            return;
        }

        // Show simple mode
        simple.classList.add('showing');
        setTimeout(function(){ simple.classList.remove('showing'); }, 400);

        // Advanced button hover hint
        var advBtn = document.getElementById('simpleAdvanced');
        var hint = document.getElementById('advancedFeatureHint');
        if(advBtn && hint){
            advBtn.addEventListener('mouseenter', function(){ hint.classList.add('visible'); });
            advBtn.addEventListener('mouseleave', function(){ hint.classList.remove('visible'); });
            advBtn.addEventListener('focus', function(){ hint.classList.add('visible'); });
            advBtn.addEventListener('blur', function(){ hint.classList.remove('visible'); });
            advBtn.addEventListener('click', function(){
                hint.classList.remove('visible');
                localStorage.setItem(ADV_KEY, '1');
                location.reload();
            });
        }

        // ---- Elements ----
        var fromEl = document.getElementById('simpleFrom');
        var toEl   = document.getElementById('simpleTo');
        var regexEl= document.getElementById('simpleRegex');
        var caseEl = document.getElementById('simpleCase');
        var inpEl  = document.getElementById('simpleInput');
        var outEl  = document.getElementById('simpleOutput');

        if(!fromEl || !toEl || !inpEl || !outEl) return;

        // ---- Core replace (standalone, no external deps) ----
        function doReplace(){
            var text = inpEl.value;
            var from = fromEl.value;
            var to   = toEl.value;
            var isRegex = regexEl.checked;
            var isCase  = caseEl.checked;

            if(!text){ outEl.value = ''; return; }

            if(isRegex){
                // Try regex
                var m = from.match(/^\/(.+)\/([gimsuy]*)$/);
                if(m){
                    try{
                        var re = new RegExp(m[1], m[2]);
                        outEl.value = text.replace(re, to);
                    }catch(e){
                        outEl.value = text; // invalid regex → no change
                    }
                } else {
                    // Treat as literal regex without slashes → add g flag
                    try{
                        var re2 = new RegExp(from, 'g');
                        outEl.value = text.replace(re2, to);
                    }catch(e){
                        outEl.value = text;
                    }
                }
            } else {
                // Literal replacement
                if(isCase){
                    // Case-sensitive: simple split/join
                    outEl.value = text.split(from).join(to);
                } else {
                    // Case-insensitive: safe accumulator (no string mutation)
                    if(!from){ outEl.value = text; return; }
                    var result = '';
                    var lowerText = text.toLowerCase();
                    var lowerFrom = from.toLowerCase();
                    var pos = 0, idx;
                    while((idx = lowerText.indexOf(lowerFrom, pos)) !== -1){
                        result += text.slice(pos, idx) + to;
                        pos = idx + lowerFrom.length;
                    }
                    result += text.slice(pos);
                    outEl.value = result;
                }
            }
        }

        // ---- Event listeners ----
        document.getElementById('simpleReplace').addEventListener('click', doReplace);
        inpEl.addEventListener('input', doReplace);
        fromEl.addEventListener('input', doReplace);
        toEl.addEventListener('input', doReplace);
        regexEl.addEventListener('change', doReplace);
        caseEl.addEventListener('change', doReplace);

        // Run once on load
        doReplace();

        // ---- Copy (with fallback for HTTP / older browsers) ----
        document.getElementById('simpleCopy').addEventListener('click', function(){
            var val = outEl.value;
            if(!val) return;
            if(navigator.clipboard && navigator.clipboard.writeText){
                navigator.clipboard.writeText(val).then(function(){
                    showToast('Copied!');
                }).catch(function(){
                    fallbackCopy(val);
                });
            } else {
                fallbackCopy(val);
            }
        });

        function fallbackCopy(txt){
            outEl.select();
            try{ document.execCommand('copy'); showToast('Copied!'); }
            catch(e){ showToast('Copy failed'); }
        }

        // ---- Save / Download ----
        document.getElementById('simpleDownload').addEventListener('click', function(){
            var val = outEl.value;
            if(!val) return;
            var blob = new Blob([val], {type:'text/plain;charset=utf-8'});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'replaced.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Saved!');
        });

        // ---- Simple toast ----
        function showToast(msg){
            var t = document.createElement('div');
            t.textContent = msg;
            t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:6px 14px;border-radius:4px;font-size:12px;z-index:9999;opacity:0;transition:opacity .3s;';
            document.body.appendChild(t);
            requestAnimationFrame(function(){ t.style.opacity = '1'; });
            setTimeout(function(){ t.style.opacity = '0'; setTimeout(function(){ document.body.removeChild(t); }, 300); }, 1500);
        }
    }

    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initSimple);
    } else {
        initSimple();
    }
})();

// ============ FULL APP ============
(function(){
    'use strict';
    var ADV_KEY = 'tr-advanced';

    // Version display
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
    // ... remaining bindings unchanged ...
    if(TR_UI && TR_UI.process) TR_UI.process();
})();