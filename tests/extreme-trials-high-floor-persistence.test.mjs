import test from 'node:test';
import assert from 'node:assert/strict';
import {EXTREME_TRIALS,extremeStage} from '../dist/extreme-trials.js';
import {claimExtremeCharacterStage,extremeFiveFloorTitle,syncExtremeHonorOwnership} from '../dist/extreme-trials-rewards.js';

const kinds=Object.keys(EXTREME_TRIALS);

test('四王 30／50／100 階附近逐層增強，沒有 50／100 階硬切難度',()=>{
 for(const kind of kinds){
  for(const floor of [29,30,31,49,50,51,99,100,101]){
   const current=extremeStage(kind,floor),next=extremeStage(kind,floor+1);
   if(kind==='hp')assert.ok(next.requiredDamage>current.requiredDamage,`${kind} ${floor}`);
   else if(kind==='clear'){
    assert.ok(next.hpMultiplier>current.hpMultiplier,`${kind} ${floor}`);
    assert.ok(next.requiredKills>=current.requiredKills,`${kind} ${floor}`);
   }else assert.ok(next.attackMultiplier>current.attackMultiplier,`${kind} ${floor}`);
  }
  for(const floor of [50,100]){
   const property=kind==='hp'?'requiredDamage':kind==='clear'?'hpMultiplier':'attackMultiplier';
   const before=extremeStage(kind,floor-1)[property];
   const at=extremeStage(kind,floor)[property];
   const after=extremeStage(kind,floor+1)[property];
   const incrementBefore=at-before,incrementAfter=after-at;
   assert.ok(incrementBefore>0&&incrementAfter>0,`${kind} ${floor}`);
   assert.ok(incrementAfter/incrementBefore<2,`${kind} ${floor} unexpectedly spiked`);
  }
 }
});

test('四王 35～105 每五階稱號獨立、JSON後持續保留，重複結算不重發',()=>{
 const player={extraHonorTitles:[]};
 for(const kind of kinds){
  for(let floor=35;floor<=105;floor+=5){
   const first=claimExtremeCharacterStage(player,kind,floor);
   assert.deepEqual(first.firstClears,[floor],`${kind} ${floor}`);
   assert.deepEqual(claimExtremeCharacterStage(player,kind,floor).firstClears,[]);
  }
 }
 syncExtremeHonorOwnership(player);
 const restored=JSON.parse(JSON.stringify(player));
 syncExtremeHonorOwnership(restored);
 for(const kind of kinds){
  assert.equal(restored.extremeProgress[kind].highest,105);
  for(let floor=35;floor<=105;floor+=5){
   const title=extremeFiveFloorTitle(kind,floor);
   assert.equal(restored.extraHonorTitles.filter(item=>item===title).length,1,title);
  }
 }
 // Each route also owns its separate floor-10 challenger title.
 assert.equal(restored.extraHonorTitles.length,4*15+4);
 assert.equal(Object.hasOwn(restored,'extremeCoins'),false);
 assert.equal(Object.hasOwn(restored,'extremePurchases'),false);
});

test('500 階後新稱號即時取得並跨存檔維持，不回填巨量歷史獎勵',()=>{
 const player={extremeProgress:{atk:{highest:500}},extraHonorTitles:[]};
 for(const floor of [505,510]){
  assert.deepEqual(claimExtremeCharacterStage(player,'atk',floor).firstClears,[floor]);
  assert.deepEqual(claimExtremeCharacterStage(player,'atk',floor).firstClears,[]);
 }
 syncExtremeHonorOwnership(player);
 const copy=JSON.parse(JSON.stringify(player));
 syncExtremeHonorOwnership(copy);
 assert.ok(copy.extraHonorTitles.includes(extremeFiveFloorTitle('atk',505)));
 assert.ok(copy.extraHonorTitles.includes(extremeFiveFloorTitle('atk',510)));
 assert.equal(new Set(copy.extraHonorTitles).size,copy.extraHonorTitles.length);
 assert.ok(copy.extraHonorTitles.length<110);
});
