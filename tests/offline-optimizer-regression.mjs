// Run with: node tests/offline-optimizer-regression.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const start=game.indexOf('function offlineIdleSkipSteps(');
const end=game.indexOf('\nasync function simulateOffline(',start);
assert.ok(start>=0&&end>start,'offline idle helper missing');
const code=game.slice(start,end);
const context={
  player:{},casting:null,controlEffect:null,enemies:[],
  encounterSlots:[1000],timers:{regen:0,offlineSupplies:0},OFFLINE_STEP_MS:100
};
vm.runInNewContext(code+'\nthis.skip=offlineIdleSkipSteps',context);
for(let spawn=100;spawn<=6000;spawn+=50){
  for(const regen of [2000,4000,6000]){
    for(const supply of [2500,4500,6500]){
      context.encounterSlots=[spawn];
      context.timers={regen:regen-4000,offlineSupplies:supply-4000};
      const skipped=context.skip(0,10000);
      const nextTick=(skipped+1)*100;
      const earliest=Math.min(spawn,regen,supply);
      const expected=Math.ceil(earliest/100)*100;
      assert.equal(nextTick,expected,'must not skip an encounter/regen/supply deadline');
    }
  }
}
context.encounterSlots=[1000];context.timers={regen:0,offlineSupplies:0};
context.enemies=[{hp:100}];assert.equal(context.skip(0,10000),0,'active enemy cannot be skipped');
context.enemies=[];context.player={trialRun:{}};assert.equal(context.skip(0,10000),0,'trial cannot be skipped');
context.player={};context.casting={id:'skill'};assert.equal(context.skip(0,10000),0,'casting cannot be skipped');
context.casting=null;context.controlEffect={kind:'stun'};assert.equal(context.skip(0,10000),0,'control effect cannot be skipped');
context.controlEffect=null;context.encounterSlots=[NaN];assert.equal(context.skip(0,10000),0,'unknown encounter timer cannot be skipped');
console.log('Offline optimizer deadline/guard checks passed.');


// Compare the optimized encounter hot path with the original logic across
// occupied, expired, vacant, and defeated slots without a browser DOM.
const encounterStart=game.indexOf('function tickEncounters(');
const encounterEnd=game.indexOf('\nfunction restoreTownPartyFully(',encounterStart);
assert.ok(encounterStart>=0&&encounterEnd>encounterStart,'encounter tick missing');
const optimized=game.slice(encounterStart,encounterEnd);
const original=`function tickEncounters(now){if(player.trialRun){if(!enemies.some(e=>e.hp>0)&&now>=player.trialRun.nextAt)spawnTrialBoss();return;}if(isTown(player.location)||!player.hp)return;const capacity=encounterLimit(player.location);let changed=false;enemies=enemies.filter(e=>e.hp>0);for(let slot=0;slot<capacity;slot++){if(encounterSlots[slot]===undefined)encounterSlots[slot]=now+rand(100,900);if(!enemies.some(e=>!e.boss&&e.slotIndex===slot)&&now>=encounterSlots[slot]){encounterSlots[slot]=now+rand(250,1400);addEncounter(now,slot);changed=true;}}if(changed)render();}`;
function encounterState(fn,initial){
 const state={player:{location:'field',hp:100},enemies:structuredClone(initial.enemies),encounterSlots:initial.slots.slice(),rng:0,renders:0};
 const env={...state,isTown:()=>false,encounterLimit:()=>3,
   rand:(a,b)=>a+(env.rng++%Math.max(1,b-a+1)),
   addEncounter:(now,slot)=>env.enemies.push({slotIndex:slot,hp:100,boss:false,id:'spawn'+slot}),
   render:()=>{env.renders++},spawnTrialBoss:()=>{}};
 vm.runInNewContext(fn+'\\nthis.runEncounter=tickEncounters',env);
 env.runEncounter(5000);
 return JSON.stringify({enemies:env.enemies,slots:env.encounterSlots,rng:env.rng,renders:env.renders});
}
for(const trial of [
 {enemies:[0,1,2].map(i=>({slotIndex:i,hp:100,boss:false})),slots:[6000,6000,6000]},
 {enemies:[0,1,2].map(i=>({slotIndex:i,hp:100,boss:false})),slots:[1000,1000,1000]},
 {enemies:[0,1,2].map(i=>({slotIndex:i,hp:i===1?0:100,boss:false})),slots:[1000,1000,1000]},
 {enemies:[{slotIndex:0,hp:100,boss:false}],slots:[1000,1000,1000]},
 {enemies:[],slots:[1000,1000,1000]},
 {enemies:[{slotIndex:0,hp:100,boss:true}],slots:[1000,1000,1000]},
 {enemies:[],slots:[]}
]){
 assert.equal(encounterState(optimized,trial),encounterState(original,trial),'optimized encounter behavior must match baseline');
}
console.log('Offline encounter hot-path equivalence checks passed.');


// Ability stat snapshots should only be calculated once the existing 850ms
// ability guard permits a cast; timestamps/cast counts must remain identical.
assert.match(game,/if\(now-lastPetAbility>=850\)petAutoAbility\(companion,petStats\(companion\),now\)/);
for(const dual of [false,true]){
 const previous={last:0,stats:0,casts:[]},optimizedAbility={last:0,stats:0,casts:[]};
 for(let now=100;now<=60000;now+=100){
  previous.stats++;
  if(now-previous.last>=850){previous.last=now;previous.casts.push(now);}
  if(now-optimizedAbility.last>=850){optimizedAbility.stats++;optimizedAbility.last=now;optimizedAbility.casts.push(now);}
 }
 assert.deepEqual(optimizedAbility.casts,previous.casts,'pet ability schedule must remain identical');
 assert.ok(optimizedAbility.stats<previous.stats/5,'ability stat calculations should drop sharply');
}
console.log('Offline pet ability cooldown/stat-guard checks passed.');
