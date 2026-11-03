import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../dist/v11.css',import.meta.url),'utf8');
const start=game.indexOf('function renderDualGrowthCard(');
const end=game.indexOf('\nfunction renderDualPetHud(',start);
assert.ok(start>=0&&end>start,'dual growth renderer is present');

function render(guide,quest=null){
 const context={
  player:{job:'spiritist'},SPIRIT_TRIAL_KILLS:24,
  activePetRoster:()=>[],spiritGrowthGuide:()=>guide,spiritQuestState:()=>quest,
  escapeHtml:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;'),
  meter:(n,total)=>'<meter data-value="'+n+'" data-max="'+total+'"></meter>'
 };
 vm.runInNewContext(game.slice(start,end)+'\nthis.render=renderDualGrowthCard',context);
 return context.render();
}
const early=render({stage:'初期',fused:0,message:'請準備兩隻融合夥伴'});
assert.match(early,/出戰融合寵/);
assert.match(early,/0／2/);
assert.match(early,/<details class="dual-growth-next">/);
assert.match(early,/<summary>查看下一步與三轉條件<\/summary>/);
assert.match(early,/Base Lv\.140/);
const progress=render({stage:'進行中',fused:2,message:'共同擊敗敵人'},{started:true,done:false,kills:12});
assert.match(progress,/12／24/);
assert.match(progress,/data-value="50"/);
assert.match(game,/progressPanel\._dualProgressMarkup!==dualProgressHtml/);
assert.match(game,/progressPanel\.querySelector\('\.dual-growth-next'\)\?\.open/);
assert.match(game,/if\(expanded\).*details\.open=true/);
assert.ok(css.includes('body.spirit-dual-ui .dual-growth-next'));
assert.ok(css.includes('.dual-growth-next summary:focus-visible'));
assert.ok(!css.includes('body:not(.spirit-dual-ui) .dual-growth-next'));
assert.ok(game.includes('同化時此寵保留10%協戰攻擊'),'Pact stance text must match active combat factor');
assert.ok(game.includes('ATK 250%、MATK 140%、DEF/MDEF 28%、HP 16%'),'Pact transfer percentages visible in UI');
assert.ok(game.includes('萬靈統率 · 人物能力轉移'),'Commander pet-transfer description visible');
assert.ok(game.includes('ATK 30%、MATK 30%、DEF/MDEF 15%'),'Commander transfer percentages visible in UI');
console.log('Spirit dual-pet compact guidance UI regression passed.');
