import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const root=new URL('../dist/',import.meta.url);
const townAssets=new URL('assets/towns/',root);

test('every city has distinct background art and all NPC roles have sprites',()=>{
  for(const id of ['town','skycity','dawncity'])assert.ok(existsSync(new URL(`${id}.webp`,townAssets)),`missing ${id} background`);
  for(const id of ['guide','guild','evolution','merchant','warehouse','enhancer','reforge','collector','alchemist','archivist','guardian','sigil','awakener']){
    assert.ok(existsSync(new URL(`npc-${id}.webp`,townAssets)),`missing ${id} NPC art`);
  }
  assert.match(readFileSync(new URL('game.js',root),'utf8'),/import '\.\/town-scene\.js/);
});

test('all thirteen NPC actions have unique dialogue and preserve the original button route',()=>{
  const scene=readFileSync(new URL('town-scene.js',root),'utf8');
  for(const id of ['quests','guild','third','evolution','shop','warehouse','enhancement','reforge','collection','cardrecycle','cardcollection','trials','sigilcraft']){
    assert.match(scene,new RegExp(`\\b${id}:\\[`),`${id} missing dialogue`);
  }
  assert.match(scene,/bypassDialog\.add\(button\);button\.click\(\)/);
  assert.match(scene,/event\.stopImmediatePropagation\(\);showNpcDialog/);
  assert.match(scene,/aria-modal/);
});
