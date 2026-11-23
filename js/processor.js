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
          var L = r.toLowerCase(), fl = f.toLowerCase(), idx = 0, o = '';
          while((idx = L.indexOf(fl, idx)) !== -1){ o += r.slice(0, idx) + t; idx += fl.length; r = r.slice(idx); idx = 0; }
          o += r; r = o;
        }
      }
    }
    return r;
  }

  return { unesc: unesc, escD: escD, parseRe: parseRe, sortedRules: sortedRules, applyRules: applyRules };
})();