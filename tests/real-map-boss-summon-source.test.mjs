import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const start=src.indexOf('function addEncounter(now='),end=src.indexOf('function tickEncounters(',start);
assert.ok(start>0&&end>start,'Source addEncounter is missing');
const actual=src.slice(start,end);
function runMixedBattleSpawn(){
 const create=new Function(`
 let player={trialRun:null,location:'worldroot',autoEscapeBoss:false},enemies=[],
  bossCooldowns={worldroot:0},encounterSerial=0,report={};
 let forceBoss=false,nextEncounterAt=0,offlineMetrics=null,auto=true;
 const gameNow=()=>15000,isTown=()=>false,ZONES=[{id:'worldroot'}],
 PETLAND_MONSTERS=[],WORLD_MONSTERS=[{id:'world_200',hp:200,atk:10,aspd:150,map:'worldroot'}],
 MAP_BOSSES={worldroot:{id:'boss_worldroot',hp:9000,atk:100,aspd:160,boss:true}},
 SPECIES={world_200:{name:'Mob'},boss_worldroot:{name:'Boss'}},
 BOSS_RESPITE_MS=90000,encounterLimit=()=>4,rand=(a,b)=>a,
 monsterRuntimeStats=()=>({def:55,hit:50,flee:40}),replacementDelay=()=>300,
 globalThis={__lingqiCombatTestSink:{spawns:[]}},
 canEncounterBoss=(loc,mobs,now,cooldown)=>forceBoss&&now>=cooldown&&!mobs.some(x=>x.boss&&x.hp>0),
 chooseAttackTarget=()=>{},startReport=()=>{},message=()=>{};
 ${actual}
 for(let i=0;i<4;i++)addEncounter(14000,i);
 forceBoss=true;addEncounter(15000,null);
 return {enemies,spawns:globalThis.__lingqiCombatTestSink.spawns};
 `);
 return create();
}
test('actual addEncounter keeps all FOUR natural mobs when the map boss is summoned',()=>{
 const {enemies,spawns}=runMixedBattleSpawn();
 assert.equal(enemies.length,5);
 assert.deepEqual(enemies.filter(e=>!e.boss).map(e=>e.slotIndex),[0,1,2,3]);
 assert.equal(enemies.filter(e=>e.boss).length,1);
 assert.equal(enemies.find(e=>e.boss).slotIndex,null);
 assert.equal(spawns.length,5);
 assert.equal(spawns.filter(e=>e.boss).length,1);
 assert.equal(new Set(spawns.map(x=>x.instanceId)).size,5);
});
test('each actual damage entry identifies whether it hit a boss or a mob',()=>{
 assert.match(src,/targetInstance:enemy\.instanceId\|\|null,targetBoss:!!enemy\.boss/);
 assert.match(src,/bossTotalDamage\+mobTotalDamage!==totalDamage/);
 assert.match(src,/sink\.singleTarget=false/);
});
