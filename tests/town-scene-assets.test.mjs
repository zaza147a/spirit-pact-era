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
