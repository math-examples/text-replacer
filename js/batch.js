var TR_BATCH = (function(){
  function addFiles(files){
    for(var i=0; i<files.length; i++) TR_STATE.batchFiles.push({ file: files[i], status: 'pending', result: '' });
    render();
  }
  function render(){
    var list = document.getElementById('batchList');
    if(!TR_STATE.batchFiles.length){ list.innerHTML = '<div class="empty">'+TR_I18N._('batchEmpty')+'</div>'; return; }
    list.innerHTML = '';
    TR_STATE.batchFiles.forEach(function(bf, i){
      var d = document.createElement('div'); d.className = 'batch-item';
      d.innerHTML = '<span class="name">'+bf.file.name+'</span><span class="status '+bf.status+'">'+bf.status+'</span><button data-i="'+i+'" style="background:none;border:none;color:#f14c4c;cursor:pointer">✕</button>';
      d.querySelector('button').onclick = function(){ TR_STATE.batchFiles.splice(i,1); render(); };
      list.appendChild(d);
    });
  }
  function clear(){ TR_STATE.batchFiles = []; render(); }
  function run(){
    if(!TR_STATE.batchFiles.length){ TR_UI.toast(TR_I18N._('batchEmpty')); return; }
    var sr = TR_PROCESSOR.sortedRules();
    var pending = TR_STATE.batchFiles.filter(function(b){ return b.status !== 'done'; });
    function next(idx){
      if(idx >= pending.length){ TR_UI.toast(TR_I18N._('batchDone')); render(); return; }
      var bf = pending[idx];
      bf.status = '...'; render();
      var reader = new FileReader();
      reader.onload = function(e){
        try{ bf.result = TR_PROCESSOR.applyRules(e.target.result, sr); bf.status = 'done'; }
        catch(err){ bf.status = 'error'; }
        render();
        // auto-download
        if(bf.status === 'done'){
          var b = new Blob([bf.result], {type:'text/plain'});
          var a = document.createElement('a'); a.href = URL.createObjectURL(b);
          a.download = bf.file.name.replace(/(\.[^.]+)?$/, '_replaced$1');
          a.click();
        }
        setTimeout(function(){ next(idx+1); }, 50);
      };
      reader.readAsText(bf.file);
    }
    next(0);
  }
  return { addFiles: addFiles, render: render, clear: clear, run: run };
})();