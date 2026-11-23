var TR_RULES = (function(){
  function render(){
    var list = document.getElementById('rulesList');
    var q = (document.getElementById('ruleSearch').value || '').toLowerCase();
    list.innerHTML = '';
    var filtered = TR_STATE.rules.filter(function(r){
      return !q || r.from.toLowerCase().indexOf(q) !== -1 || r.to.toLowerCase().indexOf(q) !== -1;
    });
    filtered.forEach(function(rule){
      var realIdx = TR_STATE.rules.indexOf(rule);
      var row = document.createElement('div');
      row.className = 'rule-row' + (rule.enabled ? '' : ' disabled');
      row.innerHTML =
        '<div class="rule-toggles">'+
          '<label><input type="checkbox" '+(rule.regex?'checked':'')+' data-p="regex">R</label>'+
          '<label><input type="checkbox" '+(rule.case?'checked':'')+' data-p="case">Aa</label>'+
          '<label><input type="checkbox" '+(rule.enabled?'checked':'')+' data-p="enabled">✓</label>'+
        '</div>'+
        '<div class="rule-fields">'+
          '<input class="rf" value="'+TR_PROCESSOR.escD(rule.from)+'" placeholder="from">'+
          '<div class="arrow">↓</div>'+
          '<input class="rt" value="'+TR_PROCESSOR.escD(rule.to)+'" placeholder="to">'+
        '</div>'+
        '<button class="rule-remove">✕</button>';
      row.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
        cb.onchange = function(){ rule[cb.dataset.p] = cb.checked; row.classList.toggle('disabled', !rule.enabled); TR_UI.process(); };
      });
      row.querySelector('.rf').oninput = function(e){ rule.from = e.target.value; TR_UI.process(); };
      row.querySelector('.rt').oninput = function(e){ rule.to = e.target.value; TR_UI.process(); };
      row.querySelector('.rule-remove').onclick = function(){ TR_STATE.rules.splice(realIdx,1); render(); TR_UI.process(); };
      list.appendChild(row);
    });
    if(!list.innerHTML) list.innerHTML = '<div style="padding:20px;text-align:center;color:#555;font-size:12px">'+TR_I18N._('noRules')+'</div>';
  }

  function addRule(){ TR_STATE.rules.push({id:TR_STATE.nextId, from:'', to:'', regex:false, case:false, enabled:true}); render(); }
  function clearRules(){ TR_STATE.rules = []; render(); TR_UI.process(); }
  function importRules(text){ TR_STATE.rules = JSON.parse(text).map(function(r){ r.id=TR_STATE.nextId; return r; }); render(); TR_UI.process(); }
  function exportRules(){ return JSON.stringify(TR_STATE.rules, null, 2); }

  return { render: render, addRule: addRule, clearRules: clearRules, importRules: importRules, exportRules: exportRules };
})();