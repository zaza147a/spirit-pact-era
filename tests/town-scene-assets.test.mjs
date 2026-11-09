import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('../dist/',import.meta.url);
const townAssets=new URL('assets/towns/',root);

test('every city has distinct background art and all NPC roles have sprites',()=>{
  for(const id of ['town','skycity','dawncity'])assert.ok(existsSync(new URL(`${id}.webp`,townAssets)),`missing ${id} background`);
  for(const id of ['guide','guild','evolution','merchant','warehouse','enhancer','reforge','collector','alchemist','archivist','guardian','trial-officiant','sigil','awakener']){
    assert.ok(existsSync(new URL(`npc-${id}.webp`,townAssets)),`missing ${id} NPC art`);
  }
  assert.match(readFileSync(new URL('game.js',root),'utf8'),/from '\.\/town-scene\.js/);
});

test('NPC actions include distinct tower and five-boss trial dialogue and preserve button routes',()=>{
  const scene=readFileSync(new URL('town-scene.js',root),'utf8');
  for(const id of ['quests','guild','third','evolution','shop','warehouse','enhancement','reforge','collection','cardrecycle','cardcollection','tower','trials','sigilcraft']){
    assert.match(scene,new RegExp(`\\b${id}:\\[`),`${id} missing dialogue`);
  }
  assert.match(scene,/bypassDialog\.add\(button\);button\.click\(\)/);
  assert.match(scene,/event\.stopImmediatePropagation\(\);showNpcDialog/);
  assert.match(scene,/portraitButton\.onclick=\(\)=>button\.click\(\)/);
  assert.match(scene,/button\.textContent=NPC_DIALOG\[role\]\[0\]/);
  assert.match(scene,/aria-modal/);
  assert.match(scene,/trials:'trial-officiant', tower:'guardian'/);
  assert.match(scene,/trials:\['星穹試煉官・艾莉亞'/);
  assert.match(scene,/tower:\['終境守望者・賽菈'/);
});

test('village is not destroyed by repeated combat rendering',()=>{
  const scene=readFileSync(new URL('town-scene.js',root),'utf8');
  const game=readFileSync(new URL('game.js',root),'utf8');
  assert.match(scene,/if\(previousMarkup\.get\(area\)===html\)return/);
  assert.match(scene,/queueMicrotask\(/);
  assert.match(game,/patchTownArea\(\$\('area'\),/);
  assert.doesNotMatch(scene,/MutationObserver/);
});

test('isolated village preview covers three towns without touching save data',()=>{
  const preview=readFileSync(new URL('village-preview.html',root),'utf8');
  for(const city of ['town','skycity','dawncity'])assert.match(preview,new RegExp(`data-city="${city}"`));
  assert.match(preview,/patchTownArea\(area,markup\)/);
  assert.doesNotMatch(preview,/localStorage|sessionStorage/);
});

test('NPCs share one ground line with paged village navigation and no scrollbar',()=>{
  const scene=readFileSync(new URL('town-scene.js',root),'utf8');
  const css=readFileSync(new URL('town-scene.css',root),'utf8');
  assert.match(scene,/Math\.floor\(index\/pageSize\)!==page/);
  assert.match(scene,/pageLabel\.textContent/);
  assert.match(css,/\.town-scene-roster\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  assert.match(css,/overflow:hidden/);
  assert.doesNotMatch(css,/overflow-x:auto|scrollbar-width/);
  assert.doesNotMatch(css,/nth-child\(5n/);
});
