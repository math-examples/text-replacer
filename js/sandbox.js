/* ===== js/sandbox.js ===== */
var TR_SANDBOX = (function(){
function run(){
var f = document.getElementById('sbFrom').value;
var t = document.getElementById('sbTo').value;
var r = document.getElementById('sbRegex').checked;
var c = document.getElementById('sbCase').checked;
var text = document.getElementById('input').value || 'Hello world, apple banana';
// FIXED: use TR_PROCESSOR.applyRules directly
var tmpRule = { from: f, to: t, regex: r, case: c, enabled: true };
var result = TR_PROCESSOR.applyRules(text, [tmpRule]);
document.getElementById('sbResult').textContent = result;
}
function clear(){ document.getElementById('sbResult').innerHTML = '<span class="placeholder">'+TR_I18N._('sbResult')+'</span>'; }
return { run: run, clear: clear };
})();