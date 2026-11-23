/* ===== js/i18n.js ===== */
var TR_I18N = (function(){
// ─── Detect language (bulletproof) ───
var rawLang = (navigator.language || navigator.userLanguage || navigator.browserLanguage || 'en').toLowerCase();
var lang = rawLang.indexOf('zh') === 0 ? 'zh' : 'en';

// Expose globally for other scripts
window.TR_LANG = lang;

var dict = {
en: {
title:'Text ✨', undo:'↩ Undo', redo:'↪ Redo', copy:'📋 Copy', dl:'💾 Save', load:'📂 Load', preset:'📦 Presets',
tabRules:'🔄 Rules', tabEdit:'📝 Editor', tabDiff:'🔍 Diff', tabSand:'🧪 Sandbox', tabBatch:'📦 Batch',
add:'Add', clear:'Clear', import:'Import', export:'Export',
input:'📥 Input', output:'📤 Output', diff:'🔍 Diff',
sbFrom:'From:', sbTo:'To:', sbTest:'Test text:', sbRun:'▶ Run', sbClr:'Clear', sbResult:'Result will appear here...',
btAdd:'+ Add Files', btRun:'▶ Process All', btClr:'Clear',
preTitle:'Presets', preSave:'💾 Save Current', preName:'Preset name:', preDel:'Delete',
search:'Search rules...', chars:'chars', changes:'changes',
copied:'💖 Copied!', saved:'💾 Saved!', loaded:'📂 Loaded', undone:'↩ Undone', redone:'↪ Redone',
noRules:'No rules match search', batchDone:'✅ All files processed', batchEmpty:'No files in queue',
simpleTitle:'Text Replacer', find:'Find ✨', replace:'Replace with 💖', advanced:'Advanced 🚀',
simpleInput:'Paste or type text here...', simpleOutput:'Result appears here...',
simplePaste:'📋 Paste', simpleLoad:'📂 Load', simpleAdd:'+ Add Rule',
simpleViceVersa:'⇄ Swap All', simpleReplace:'✨ Replace!', simpleSwap:'⇄ Swap',
simpleCopy:'📋 Copy', simpleDownload:'💾 Download',
regex:'Regex', caseInsensitive:'Aa'
},
zh: {
title:'文本 ✨', undo:'↩ 撤销', redo:'↪ 重做', copy:'📋 复制', dl:'💾 保存', load:'📂 加载', preset:'📦 预设',
tabRules:'🔄 规则', tabEdit:'📝 编辑', tabDiff:'🔍 对比', tabSand:'🧪 沙盒', tabBatch:'📦 批量',
add:'添加', clear:'清空', import:'导入', export:'导出',
input:'📥 输入', output:'📤 输出', diff:'🔍 差异',
sbFrom:'从:', sbTo:'到:', sbTest:'测试文本:', sbRun:'▶ 运行', sbClr:'清空', sbResult:'结果将显示在这里...',
btAdd:'+ 添加文件', btRun:'▶ 处理全部', btClr:'清空',
preTitle:'预设规则', preSave:'💾 保存当前', preName:'预设名称:', preDel:'删除',
search:'搜索规则...', chars:'字符', changes:'处变更',
copied:'💖 已复制', saved:'💾 已保存', loaded:'📂 已加载', undone:'↩ 已撤销', redone:'↪ 已重做',
noRules:'无匹配规则', batchDone:'✅ 所有文件处理完成', batchEmpty:'队列为空',
simpleTitle:'文本替换器', find:'查找 ✨', replace:'替换为 💖', advanced:'高级 🚀',
simpleInput:'粘贴或输入文本...', simpleOutput:'结果将显示在这里...',
simplePaste:'📋 粘贴', simpleLoad:'📂 加载', simpleAdd:'+ 添加规则',
simpleViceVersa:'⇄ 全部交换', simpleReplace:'✨ 替换！', simpleSwap:'⇄ 交换',
simpleCopy:'📋 复制', simpleDownload:'💾 下载',
regex:'正则', caseInsensitive:'忽略大小写'
}
};
function _(k){ return (dict[lang] && dict[lang][k]) || dict.en[k] || k; }
function apply(){
  document.querySelectorAll('[id^="t-"]').forEach(function(el){
    var key = el.id.replace(/^t-/,'');
    var val = _(key.charAt(0).toLowerCase()+key.slice(1));
    if(val) el.textContent = val;
  });
  var t = document.getElementById('t-title'); if(t) t.textContent = _('title');
  var s = document.getElementById('ruleSearch'); if(s) s.placeholder = _('search');
  var sr = document.getElementById('sbResult'); if(sr) sr.innerHTML = '<span class="placeholder">'+_('sbResult')+'</span>';
}
return { _: _, apply: apply, lang: lang };
})();

// Apply on load — immediately if DOM ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ if(TR_I18N.apply) TR_I18N.apply(); });
} else {
  TR_I18N.apply();
}