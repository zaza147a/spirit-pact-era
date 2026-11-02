import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const begin=source.indexOf('function tickEncounters(now)');
const end=source.indexOf('function spawn(){',begin);
assert.ok(begin>=0&&end>begin);
const realTickEncounters=source.slice(begin,end);
function runWithIsolation(singleTarget){
 const events=[],foe={hp:123,slotIndex:0,boss:false,instanceId:'bench-monster'},
 sink=singleTarget?{singleTarget:true}:null;
 const create=new Function('events','foe','sink',`
 let player={location:'worldroot',hp:100,trialRun:null},enemies=[foe],encounterSlots=[0,0,0,0];
 const globalThis={__lingqiCombatTestSink:sink};
 const isTown=()=>false,encounterLimit=()=>4,rand=()=>0,
 addEncounter=(now,slot)=>events.push({name:'spawn',slot}),
 render=()=>events.push({name:'render'}),spawnTrialBoss=()=>{};
 ${realTickEncounters}
 return tickEncounters;
 `);
 create(events,foe,sink)(1000);
 return events;
}
test('verbatim tickEncounters does NOT spawn unrelated mobs during a single-target real fight',()=>{
 assert.deepEqual(runWithIsolation(true),[]);
});
test('verbatim production tickEncounters STILL spawns normal mobs without test sink',()=>{
 const result=runWithIsolation(false);
 assert.ok(result.filter(e=>e.name==='spawn').length>0);
});
test('test-only hook is restricted to a real singleTarget flag and tests keep actual enemy attacks',()=>{
 assert.match(source,/if\(globalThis\.__lingqiCombatTestSink\?\.singleTarget===true\)return/);
 assert.match(source,/globalThis\.__lingqiCombatTestSink=\{singleTarget:true/);
 assert.match(source,/if\(foe\.hp&&now-foe\.lastAttack>=aspdAttackIntervalMs\(foe\.aspd\)\)/);
});
