var TR_SANDBOX = (function(){
  function run(){
    var f = document.getElementById('sbFrom').value;
    var t = document.getElementById('sbTo').value;
    var r = document.getElementById('sbRegex').checked;
    var c = document.getElementById('sbCase').checked;
    var text = document.getElementById('input').value || 'Hello world, apple banana';
    if(r){
      var re = TR_PROCESSOR.parseRe(f);
      if(re){ try{ text = text.replace(re, TR_PROCESSOR.unesc(t)); }catch(e){ TR_UI.toast('Invalid regex'); return; } }
      else { TR_UI.toast('Invalid regex'); return; }
    } else {
      var from = TR_PROCESSOR.unesc(f), to = TR_PROCESSOR.unesc(t);
      if(c){ text = text.split(from).join(to); }
      else {
        var L = text.toLowerCase(), fl = from.toLowerCase(), idx = 0, o = '';
        while((idx = L.indexOf(fl, idx)) !== -1){ o += text.slice(0, idx) + to; idx += fl.length; text = text.slice(idx); idx = 0; }
        o += text; text = o;
      }
    }
    document.getElementById('sbResult').textContent = text;
  }
  function clear(){ document.getElementById('sbResult').innerHTML = '<span class="placeholder">'+TR_I18N._('sbResult')+'</span>'; }
  return { run: run, clear: clear };
})();