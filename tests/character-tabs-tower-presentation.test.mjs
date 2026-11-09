import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

test('character handbook tabs use a four-column layout with a narrow screen fallback',async()=>{
 const css=await readFile('dist/endless-tower.css','utf8');
 assert.match(css,/#side \.section-tabs\{display:grid!important;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:420px\)\{#side \.section-tabs\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('dawn city gatekeeper and home name-frame use the same character honor selection',async()=>{
 const game=await readFile('dist/game.js','utf8');
 assert.match(game,/終境守望者・賽菈/);
 assert.match(game,/tower-gatekeeper/);
 assert.match(game,/nameButton\.classList\.add\('tower-honor-name',chosenFrame\)/);
 assert.match(game,/refreshCollectionHonorTitles\(player\)/);
 assert.doesNotMatch(game,/insertAdjacentHTML\('beforeend','<span class="gold-collector-title">/);
 assert.match(game,/data-open="tower" class="goldbtn">與賽菈對話/);
 assert.match(game,/星穹試煉官・艾莉亞/);
 assert.match(game,/npc-trial-officiant\.webp/);
 assert.match(game,/data-open="trials" class="goldbtn">與艾莉亞對話/);
});

test('first thirty floors use three transparent independent regional monster images',async()=>{
 const game=await readFile('dist/game.js','utf8');
 assert.match(game,/assets\/tower\/monster-\$\{/);
 for(const name of ['dawn','flame','frost']){
  const file=`dist/assets/tower/monster-${name}.webp`;
  assert.ok((await stat(file)).size>15_000,file);
 }
});

test('five-boss trial officiant has an independent portrait asset',async()=>{
 const file='dist/assets/towns/npc-trial-officiant.webp';
 assert.ok((await stat(file)).size>15_000);
 const css=await readFile('dist/endless-tower.css','utf8');
 assert.match(css,/\.trial-gatekeeper-profile img/);
});

test('tower battle portrait and long warning occupy separate layout regions',async()=>{
 const game=await readFile('dist/game.js','utf8');
 const css=await readFile('dist/endless-tower.css','utf8');
 assert.match(game,/<div class="tower-encounter-main"><div class="tower-monster-portrait">\$\{spriteHtml\(foe\.id,'monster'\)\}<\/div><div class="tower-encounter-info">/);
 assert.match(game,/<\/small>\$\{cast\}<\/div><\/div><\/div>`;/);
 assert.match(css,/#encounter \.enemy-target\.tower-encounter\{[^\n]*display:flex!important/);
 assert.match(css,/#encounter:has\(\.tower-encounter\) \.enemy-lineup\{[^\n]*grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/#encounter \.tower-monster-portrait \.art-monster\{position:static!important/);
 assert.match(css,/#encounter \.tower-encounter-info>\.tower-cast-warning\{[^\n]*width:100%/);
 assert.doesNotMatch(game,/enemy-target trial-boss tower-encounter/);
 assert.match(game,/const towerVariant=\/\^tower-\(\?:\(\\d\+\)-wave-/);
 for(const special of ['tower-chaser-26','tower-escort-26-0','tower-26-wave-11']){
  const match=/^tower-(?:(\d+)-wave-\d+|chaser-(\d+)|escort-(\d+)-\d+)$/.exec(special);
  assert.equal(Number(match?.[1]||match?.[2]||match?.[3]),26,`${special} must resolve to frost art`);
 }
 assert.doesNotMatch(css,/\.tower-encounter \.art-monster\{grid-row:1 \/ span 5/);
});

test('equipped character name frame wins over portrait background styling',async()=>{
 const css=await readFile('dist/endless-tower.css','utf8');
 for(const frame of ['dawn','flame','frost','collect-dawn','collect-flame','collect-frost']){
  assert.match(css,new RegExp(`#gameShell #character>\\.hero\\.cosmetic-scene-active \\.character-name\\.tower-frame-${frame}\\{[^\\n]*background:[^\\n]*!important`));
 }
});
test('honor selection immediately rerenders the character portrait without reloading',async()=>{
 const game=await readFile('dist/game.js','utf8');
 assert.match(game,/selectTowerHonor\(player,b\.dataset\.towerHonorPick,b\.dataset\.towerHonorValue\)/);
 assert.match(game,/if\(save\(\)===false\)\{player\.towerHonorSelection=previous;render\(\);renderSide\(true\);return toast\('稱號／名稱框儲存失敗，已恢復原先選擇'\);\}/);
 assert.match(game,/render\(\);renderSide\(true\);toast\('已更新天穹稱號／名稱框，角色畫面立即生效'\)/);
});
test('purchased three-region showcase renders its own character card and toggle',async()=>{
 const game=await readFile('dist/game.js','utf8');
 const css=await readFile('dist/endless-tower.css','utf8');
 assert.match(game,/data-tower-showcase="on"/);
 assert.match(game,/data-tower-showcase="off"/);
 assert.match(game,/normalizeTowerCollection\(player\.towerCollection\)\.selectedShowcase/);
 assert.match(game,/tower-showcase-display/);
 assert.match(game,/selectTowerShowcase\(player,b\.dataset\.towerShowcase==='on'\)/);
 assert.match(css,/#gameShell #character>\.hero \.tower-showcase-display/);
 for(const i of [10,20,30])assert.match(game,new RegExp(`assets/tower/boss-${i}\\.webp`));
});

test('release entrypoint and title module use synchronized cache versions',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const game=await readFile('dist/game.js','utf8');
 assert.match(html,/靈契紀元 · 夥伴返鄉 V7\.1\.9/);
 assert.match(html,/game\.js\?v=7\.1\.9/);
 assert.match(html,/endless-tower\.css\?v=7\.1\.9/);
 assert.match(game,/tower-honors\.js\?v=7\.1\.9/);
 assert.match(game,/town-scene\.js\?v=7\.1\.9/);
});
