import test from 'node:test';
import assert from 'node:assert/strict';
import {TOWER_REGIONS,towerFloor,towerEntryError,normalizeTowerProgress,finishTowerFloor,estimateTowerClear,towerAvailableFloors} from '../dist/endless-tower.js';

test('100 fixed floors map to ten distinct regions and bosses',()=>{
  assert.equal(TOWER_REGIONS.length,10);
  for(let i=0;i<10;i++){
    const floor=towerFloor((i+1)*10);
    assert.equal(floor.kind,'boss');
    assert.equal(floor.name,TOWER_REGIONS[i].boss);
    assert.equal(floor.checkpoint,true);
    assert.equal(floor.endless,false);
  }
});
test('every floor has bounded rules and first thirty are deterministic',()=>{
  for(let floor=1;floor<=100;floor++){
    const stage=towerFloor(floor);
    assert.ok(stage.hpMultiplier>0&&stage.atkMultiplier>0);
    assert.ok(stage.timeLimitSeconds>=70&&stage.timeLimitSeconds<=360);
    assert.deepEqual(stage,towerFloor(floor));
  }
  assert.equal(towerFloor(5).kind,'guardian');
  assert.equal(towerFloor(8).affixes,1);
  assert.equal(towerFloor(30).region,'永凍王庭');
});
test('each ten-floor region rotates combat, pursuit, survival, and assassination objectives',()=>{
 for(const start of [0,10,20]){
  assert.equal(towerFloor(start+1).objective,'eliminate');
  assert.equal(towerFloor(start+3).objective,'hunt');
  assert.equal(towerFloor(start+3).enemyCount,4);
  assert.equal(towerFloor(start+6).objective,'survive');
  assert.equal(towerFloor(start+6).goal,35);
  assert.equal(towerFloor(start+9).objective,'assassinate');
  assert.equal(towerFloor(start+9).enemyCount,1);
 }
});
test('101 onward is endless, with increasing difficulty and affixes',()=>{
  assert.equal(towerFloor(100).endless,false);
  assert.equal(towerFloor(101).endless,true);
  assert.ok(towerFloor(151).hpMultiplier>towerFloor(101).hpMultiplier);
  assert.equal(towerFloor(151).affixes,3);
});
test('entry gate does not change existing trial run',()=>{
  assert.equal(towerEntryError({thirdJob:true,level:210,hp:100,dawnUnlocked:true}),null);
  assert.match(towerEntryError({thirdJob:true,level:209,hp:100,dawnUnlocked:true}),/210/);
  assert.match(towerEntryError({thirdJob:true,level:210,hp:100,dawnUnlocked:true,trialRun:{}}),/挑戰/);
});
test('progress is saved without replayed first-clear rewards',()=>{
  const first=finishTowerFloor({},1,90);
  assert.equal(first.success,true);
  const boss=finishTowerFloor({highest:9},10,90);
  assert.equal(boss.firstReward,'破曉挑戰者');
  assert.equal(boss.progress.checkpoint,10);
  assert.equal(finishTowerFloor(boss.progress,10,90).firstReward,null);
  assert.equal(finishTowerFloor({},10,90).success,false);
  assert.equal(finishTowerFloor({highest:9},10,999).success,false);
});
test('individual floors remain replayable after clearing, and the next one unlocks',()=>{
 assert.deepEqual(towerAvailableFloors({highest:0},30),[1]);
 assert.deepEqual(towerAvailableFloors({highest:12},30),Array.from({length:13},(_,i)=>i+1));
 assert.deepEqual(towerAvailableFloors({highest:30},30),Array.from({length:30},(_,i)=>i+1));
});
test('estimator rejects incomplete data and reports survival risk',()=>{
  assert.equal(estimateTowerClear(1,{dps:0,hp:10}).viable,false);
  assert.equal(estimateTowerClear(1,{dps:1,hp:100,baselineEnemyHp:1,incomingDps:1}).viable,true);
  assert.equal(estimateTowerClear(1,{dps:1,hp:1,baselineEnemyHp:1,incomingDps:10}).viable,false);
  assert.equal(normalizeTowerProgress({highest:28}).checkpoint,20);
  const survive=estimateTowerClear(6,{dps:1,hp:200,baselineEnemyHp:1,incomingDps:10});
  assert.equal(survive.estimatedSeconds,35);
  assert.equal(survive.viable,false);
  assert.equal(estimateTowerClear(6,{dps:1,hp:400,baselineEnemyHp:1,incomingDps:10}).viable,true);
});
