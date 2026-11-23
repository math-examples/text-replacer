var TR_STATE = (function(){
  var rules = [
    {id:1, from:'/\\bapple\\b/i', to:'orange', regex:true, case:false, enabled:true},
    {id:2, from:'C', to:'D', regex:false, case:false, enabled:true},
    {id:3, from:'A', to:'B', regex:false, case:false, enabled:true}
  ];
  var nextId = 4;
  var history = [];
  var hIdx = -1;
  var currentOutput = '';
  var batchFiles = [];
  var STREAM_THRESHOLD = 300000;

  function pushHist(inp, out){
    history = history.slice(0, hIdx + 1);
    try { history.push({ inp: inp, out: out, rules: JSON.parse(JSON.stringify(rules)) }); } catch(e) {}
    if(history.length > 30) history.shift(); else hIdx++;
  }
  function undo(){ if(hIdx > 0){ hIdx--; return history[hIdx]; } return null; }
  function redo(){ if(hIdx < history.length - 1){ hIdx++; return history[hIdx]; } return null; }

  return {
    get rules(){ return rules; }, setRules(r){ rules = r; },
    get nextId(){ return nextId++; },
    get currentOutput(){ return currentOutput; }, setCurrentOutput(v){ currentOutput = v; },
    get batchFiles(){ return batchFiles; }, setBatchFiles(b){ batchFiles = b; },
    get STREAM_THRESHOLD(){ return STREAM_THRESHOLD; },
    pushHist: pushHist, undo: undo, redo: redo
  };
})();