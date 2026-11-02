import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const fight=src.slice(src.lastIndexOf('  farm({durationMs='),src.lastIndexOf('  fight({boss='));
test('actual farm uses real combatTick with natural four-slot tickEncounters and boss addEncounter',()=>{
 assert.match(fight,/sink\.singleTarget=false/);
 assert.match(fight,/spawn\(\)/);
 assert.match(fight,/combatTick\(offlineClock\)/);
 assert.match(fight,/addEncounter\(offlineClock,null\)/);
 assert.match(fight,/bossCallSucceeded/);
 assert.match(fight,/bossSpawns=sink\.spawns\.filter\(x=>x\.boss\)/);
 assert.match(fight,/mobKills:sink\.kills\.filter\(x=>!x\.boss\)/);
 assert.doesNotMatch(fight,/enemy=created/);
});
test('boss call uses original boss encounter decision and does not overwrite normal mob slots',()=>{
 const idx=src.indexOf('function addEncounter('),end=src.indexOf('function tickEncounters(',idx);
 const body=src.slice(idx,end);
 assert.match(body,/canEncounterBoss\(player\.location,enemies,now,bossCooldowns\[player\.location\]\|\|0\)/);
 assert.match(body,/slotIndex:isBoss\?null:slotIndex/);
 assert.match(body,/enemies\.push\(foe\)/);
});
