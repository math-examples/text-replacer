/* ===== js/presets.js — NO STORAGE, memory only ===== */
var TR_PRESETS = (function(){
var defaultPresets = {
'markdown-cleanup':{name:'Markdown Cleanup', desc:'Fix common MD issues', rules:[{from:'\\s+$',to:'',regex:true,case:false,enabled:true},{from:'\\n{3,}',to:'\\n\\n',regex:true,case:false,enabled:true}]},
'csv-sanitize':{name:'CSV Sanitize', desc:'Clean CSV', rules:[{from:'\\r\\n',to:'\\n',regex:true,case:false,enabled:true},{from:'""',to:'"',regex:false,case:false,enabled:true}]},
'html-entities':{name:'HTML Entities', desc:'Replace entities', rules:[{from:'&amp;',to:'&',regex:false,case:false,enabled:true},{from:'&lt;',to:'<',regex:false,case:false,enabled:true},{from:'&gt;',to:'>',regex:false,case:false,enabled:true}]}
};
// Pure in-memory — zero localStorage, zero cache
var presets = Object.assign({}, defaultPresets);

function save(name){
var key = name.toLowerCase().replace(/\s+/g,'-');
presets[key] = { name: name, desc: 'custom', rules: JSON.parse(JSON.stringify(TR_STATE.rules)) };
// NO localStorage.setItem — intentionally removed
}
function load(key){ return presets[key]; }
function all(){ return presets; }
function remove(key){ delete presets[key]; /* NO localStorage */ }
return { save: save, load: load, all: all, remove: remove, defaults: defaultPresets };
})();