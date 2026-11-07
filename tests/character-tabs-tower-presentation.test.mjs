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

test('release entrypoint and title module use synchronized cache versions',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const game=await readFile('dist/game.js','utf8');
 assert.match(html,/靈契紀元 · 夥伴返鄉 V7\.1\.5/);
 assert.match(html,/game\.js\?v=7\.1\.5/);
 assert.match(html,/endless-tower\.css\?v=7\.1\.5/);
 assert.match(game,/tower-honors\.js\?v=7\.1\.5/);
 assert.match(game,/town-scene\.js\?v=7\.1\.5/);
});
