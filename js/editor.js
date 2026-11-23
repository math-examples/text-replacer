var TR_EDITOR = (function(){
  function hl(ta, layer){
    if(!ta || !layer) return;
    var v = ta.value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    layer.innerHTML = v || ' ';
  }
  function syncScroll(ta){
    if(!ta) return;
    var layer = ta.parentElement.querySelector('.highlight-layer');
    if(layer) ta.addEventListener('scroll', function(){ layer.scrollTop = ta.scrollTop; layer.scrollLeft = ta.scrollLeft; });
  }
  function renderDiff(oldT, newT){
    var ol = oldT.split('\n'), nl = newT.split('\n'), mx = Math.max(ol.length, nl.length);
    var chg = 0, html = '';
    for(var i=0; i<mx; i++){
      if(ol[i] === nl[i]){ html += '<div class="line">'+(ol[i]||'&nbsp;')+'</div>'; }
      else {
        if(ol[i] !== undefined){ html += '<div class="line removed"><span class="ln">'+(i+1)+'</span>'+escH(ol[i])+'</div>'; chg++; }
        if(nl[i] !== undefined){ html += '<div class="line added"><span class="ln">'+(i+1)+'</span>'+escH(nl[i])+'</div>'; chg++; }
      }
    }
    var d = document.getElementById('diffOutput'); if(d) d.innerHTML = html;
    var ds = document.getElementById('diffStats'); if(ds) ds.textContent = chg + ' ' + TR_I18N._('changes');
  }
  function escH(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/ /g,'&nbsp;'); }

  return { hl: hl, syncScroll: syncScroll, renderDiff: renderDiff };
})();