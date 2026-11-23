/* ===== js/processor.js ===== */
var TR_PROCESSOR = (function(){
function unesc(s){ return s.replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\\\/g,'\\').replace(/\\r/g,'\r'); }
function escD(s){ return s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t'); }
function parseRe(s){ var m = s.match(/^\/(.+)\/([gimsuy]*)$/); if(!m) return null; try{ return new RegExp(m[1], m[2]); }catch(e){ return null; } }
function sortedRules(rules){
return [].concat(rules || TR_STATE.rules).filter(function(r){ return r.enabled; }).sort(function(a,b){
var la = a.regex ? Infinity : unesc(a.from).length;
var lb = b.regex ? Infinity : unesc(b.from).length;
return lb - la;
});
}
function applyRules(text, ruleSet){
var r = text;
var rules = ruleSet || sortedRules();
for(var i=0; i<rules.length; i++){
var rule = rules[i];
if(rule.regex){
var re = parseRe(rule.from);
if(re){ try{ r = r.replace(re, unesc(rule.to)); }catch(e){} }
} else {
var f = unesc(rule.from), t = unesc(rule.to);
if(rule.case){ r = r.split(f).join(t); }
else {
// FIXED: properly handle case-insensitive replacement without corrupting source
var result = '';
var lowerText = r.toLowerCase();
var lowerFrom = f.toLowerCase();
var pos = 0, foundIdx;
while((foundIdx = lowerText.indexOf(lowerFrom, pos)) !== -1){
result += r.slice(pos, foundIdx) + t;
pos = foundIdx + lowerFrom.length;
}
result += r.slice(pos);
r = result;
}
}
}
return r;
}
return { unesc: unesc, escD: escD, parseRe: parseRe, sortedRules: sortedRules, applyRules: applyRules };
})();