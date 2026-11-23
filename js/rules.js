/* ===== js/rules.js ===== */
var TR_RULES = (function(){
    'use strict';

    function genId() {
        return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }

    function normalizeRule(r) {
        return {
            id: r.id || genId(),
            from: r.from || '',
            to: r.to || '',
            regex: !!r.regex,
            case: !!r.case,
            enabled: (r.enabled !== undefined) ? !!r.enabled : true
        };
    }

    function escAttr(s) {
        return (s || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function render(){
        var list = document.getElementById('rulesList');
        var searchEl = document.getElementById('ruleSearch');
        var q = (searchEl && searchEl.value || '').toLowerCase();

        if (!list) return;
        list.innerHTML = '';

        if (!TR_STATE || !Array.isArray(TR_STATE.rules)) return;

        var filtered = TR_STATE.rules.filter(function(r){
            var hay = ((r.from || '') + ' ' + (r.to || '')).toLowerCase();
            return !q || hay.indexOf(q) !== -1;
        });

        if (filtered.length === 0) {
            var empty = document.createElement('div');
            empty.style.cssText = 'color:#888;padding:8px;font-size:12px;';
            empty.textContent = (TR_I18N && TR_I18N._('noRules')) || 'No rules match search';
            list.appendChild(empty);
            return;
        }

        filtered.forEach(function(rule){
            var row = document.createElement('div');
            row.className = 'rule-row' + (rule.enabled ? '' : ' disabled');

            var toggles = document.createElement('div');
            toggles.className = 'rule-toggles';
            toggles.innerHTML =
                '<label><input type="checkbox" data-act="enabled" ' + (rule.enabled ? 'checked' : '') + '>on</label>' +
                '<label><input type="checkbox" data-act="regex" ' + (rule.regex ? 'checked' : '') + '>re</label>' +
                '<label><input type="checkbox" data-act="case" ' + (rule.case ? 'checked' : '') + '>Aa</label>';

            var fields = document.createElement('div');
            fields.className = 'rule-fields';
            fields.innerHTML =
                '<input data-fld="from" value="' + escAttr(rule.from) + '" placeholder="Find">' +
                '<div class="arrow">↓</div>' +
                '<input data-fld="to" value="' + escAttr(rule.to) + '" placeholder="Replace">';

            var removeBtn = document.createElement('button');
            removeBtn.className = 'rule-remove';
            removeBtn.dataset.act = 'remove';
            removeBtn.innerHTML = '✕';

            row.appendChild(toggles);
            row.appendChild(fields);
            row.appendChild(removeBtn);

            toggles.querySelectorAll('input').forEach(function(inp){
                inp.addEventListener('change', function(){
                    if (this.dataset.act === 'enabled') rule.enabled = this.checked;
                    if (this.dataset.act === 'regex') rule.regex = this.checked;
                    if (this.dataset.act === 'case') rule.case = this.checked;
                    row.classList.toggle('disabled', !rule.enabled);
                    if (TR_UI && TR_UI.process) TR_UI.process();
                });
            });

            fields.querySelectorAll('input').forEach(function(inp){
                inp.addEventListener('input', function(){
                    if (this.dataset.fld === 'from') rule.from = this.value;
                    if (this.dataset.fld === 'to') rule.to = this.value;
                    if (TR_UI && TR_UI.process) TR_UI.process();
                });
            });

            removeBtn.addEventListener('click', function(){
                TR_STATE.rules = TR_STATE.rules.filter(function(r){ return r.id !== rule.id; });
                render();
                if (TR_UI && TR_UI.process) TR_UI.process();
            });

            list.appendChild(row);
        });
    }

    function addRule(rule){
        if (!TR_STATE.rules) TR_STATE.rules = [];
        TR_STATE.rules.push(normalizeRule(rule));
        render();
    }

    function clearRules(){
        if (confirm('Clear all rules?')) {
            TR_STATE.rules = [];
            render();
            if (TR_UI && TR_UI.process) TR_UI.process();
        }
    }

    function getRules(){
        return TR_STATE.rules || [];
    }

    function setRules(arr){
        if (!Array.isArray(arr)) return;
        TR_STATE.rules = arr.map(normalizeRule);
        render();
    }

    function exportRules(){
        return JSON.stringify({ rules: getRules(), version: '1.0.32' }, null, 2);
    }

    function importRules(data){
        try {
            var parsed = (typeof data === 'string') ? JSON.parse(data) : data;
            var rules = parsed.rules || parsed;
            if (Array.isArray(rules)) {
                setRules(rules);
                return true;
            }
        } catch (e) {
            console.error('[TR] importRules failed:', e);
        }
        return false;
    }

    return {
        render: render,
        addRule: addRule,
        clearRules: clearRules,
        getRules: getRules,
        setRules: setRules,
        exportRules: exportRules,
        importRules: importRules
    };
})();