var TR_UI = (function(){
  function toast(msg){
    var c = document.getElementById('toastContainer');
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    c.appendChild(t); setTimeout(function(){ t.remove(); }, 3000);
  }
  function process(){
    var inp = document.getElementById('input').value;
    if(inp.length > TR_STATE.STREAM_THRESHOLD){ stream(inp); return; }
    var out = TR_PROCESSOR.applyRules(inp);
    TR_STATE.setCurrentOutput(out);
    document.getElementById('output').value = out;
    var stats = TR_I18N._('chars');
    document.getElementById('inputStats').textContent = inp.length + ' ' + stats;
    document.getElementById('outputStats').textContent = out.length + ' ' + stats;
    TR_EDITOR.hl(document.getElementById('input'), document.getElementById('inputHL'));
    TR_EDITOR.hl(document.getElementById('output'), document.getElementById('outputHL'));
    TR_EDITOR.renderDiff(inp, out);
  }
  function stream(text){
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:var(--accent);color:#fff;font-size:11px;padding:4px;text-align:center;z-index:9999';
    bar.textContent = '...'; document.body.appendChild(bar);
    var sr = TR_PROCESSOR.sortedRules();
    var cs = 100000, p = 0, res = '';
    function chunk(){
      var c = text.slice(p, p+cs); res += TR_PROCESSOR.applyRules(c, sr); p += cs;
      bar.textContent = Math.round(p/text.length*100)+'%';
      if(p < text.length){ setTimeout(chunk, 0); }
      else {
        bar.remove(); TR_STATE.setCurrentOutput(res);
        document.getElementById('output').value = res;
        document.getElementById('outputStats').textContent = res.length + ' ' + TR_I18N._('chars');
        TR_EDITOR.hl(document.getElementById('output'), document.getElementById('outputHL'));
        TR_EDITOR.renderDiff(text, res); toast('✅');
      }
    }
    chunk();
  }
  function bindTabs(){
    document.querySelectorAll('.tab').forEach(function(t){
      t.onclick = function(){
        document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
        t.classList.add('active');
        document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
        document.getElementById('panel-'+t.dataset.panel).classList.add('active');
      };
    });
  }
  return { toast: toast, process: process, stream: stream, bindTabs: bindTabs };
})();