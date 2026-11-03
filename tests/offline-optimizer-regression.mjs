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
