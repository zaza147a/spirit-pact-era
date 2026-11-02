import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WORLD_MONSTERS} from '../dist/world-data.js';
import {MAP_BOSSES} from '../dist/map-bosses.js';
import {DAWN_MONSTERS,DAWN_BOSS} from '../dist/dawn-world.js';
const code=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
test('actual combat fixture must use the real Dawn boss instead of missing MAP_BOSSES.dawnrift',()=>{
 assert.equal(MAP_BOSSES.dawnrift,undefined);
 assert.equal(DAWN_BOSS.id,'dawn-archon');
 assert.equal(DAWN_BOSS.level,210);
 assert.match(code,/player\.location==='dawnrift'\?DAWN_BOSS:MAP_BOSSES\[player\.location\]/);
});
test('fixture references all ten worldroot and three dawn enemies',()=>{
 const world=WORLD_MONSTERS.filter(x=>x.map==='worldroot');
 assert.equal(world.length,10);
 assert.deepEqual(world.map(x=>x.id),Array.from({length:10},(_,i)=>'world_'+(191+i)));
 assert.deepEqual(DAWN_MONSTERS.map(x=>x.id),['dawn-scout','dawn-ram','dawn-ray']);
 assert.equal(MAP_BOSSES.worldroot?.level,200);
});
test('actual battle fixture cannot silently substitute wrong monster; pet XP must be numeric',()=>{
 assert.match(code,/Requested monster not found/);
 assert.match(code,/level:200,xp:0,kills:0,rarity:'mythic'/);
});
