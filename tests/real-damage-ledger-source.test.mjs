import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const begin=source.indexOf('function dealDamage(amount,key)');
const end=source.indexOf('function targetEnemy(id)',begin);
assert.ok(begin>=0&&end>begin);
const actualGameFunction=source.slice(begin,end);
function makeHarness(hp){
 const hitSink={hits:[]},state={enemy:{id:'world_200',hp,boss:false}};
 // Extracts and executes ACTUAL game.js dealDamage; dependencies replaced only
 // for deterministic fixed conditions. Not a complete combatTick simulation.
 const create=new Function('state','globalThis',`
 let enemy=state.enemy,player={job:'assassin',level:200},pendingPetCredit=0;
 let offlineSimulation=true,combatSamples=[],petEffects={blessingUntil:0},report=null;
 const fusedPair=()=>null,activePet=()=>null,gameNow=()=>0,
 dawnArchonPreparationFactor=()=>1,jobZoneOutputFactor=()=>1,
 record=()=>{},activePetMarkPower=()=>0;
 ${actualGameFunction}
 return (amount,key)=>dealDamage(amount,key);
 `);
 return {hitSink,state,attack:create(state,{__lingqiCombatTestSink:hitSink})};
}
test('source damage ledger player, pet and buff sums equal actual HP delta',()=>{
 const {hitSink,state,attack}=makeHarness(10000);
 assert.equal(attack(1600,'playerDamage'),1600);
 assert.equal(attack(2400,'petDamage'),2400);
 assert.equal(attack(300,'buffDamage'),300);
 const sum=k=>hitSink.hits.reduce((n,x)=>n+x[k],0);
 assert.equal(sum('owner'),1600);
 assert.equal(sum('pet'),2700);
 assert.equal(sum('amount'),4300);
 assert.equal(state.enemy.hp,5700);
 assert.equal(sum('owner')+sum('pet'),10000-state.enemy.hp);
});
test('source damage ledger clamps overkill and never double-counts pet',()=>{
 const {hitSink,state,attack}=makeHarness(1000);
 assert.equal(attack(400,'playerDamage'),400);
 assert.equal(attack(9999,'petDamage'),600);
 assert.equal(attack(900,'buffDamage'),0);
 assert.equal(state.enemy.hp,0);
 assert.equal(hitSink.hits.reduce((n,x)=>n+x.owner+x.pet,0),1000);
});
