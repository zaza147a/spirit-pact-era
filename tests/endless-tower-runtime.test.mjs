import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTowerEnemies,beginTowerRun,markTowerEnemyDefeated,settleTowerRun,towerRemainingSeconds,towerBossPhase,towerBossSignature,TOWER_BOSS_PATTERNS} from '../dist/endless-tower-runtime.js';
import {DAWN_MONSTERS,DAWN_BOSS} from '../dist/dawn-world.js';

const player=()=>({thirdJob:true,level:210,hp:300000,dawnUnlocked:true,towerProgress:{highest:0}});
const bases={monster:{hp:1000,atk:100,def:50},boss:{hp:10000,atk:200,def:100}};
test('first thirty floors produce actual bounded combat enemy stats',()=>{
  for(let floor=1;floor<=30;floor++){
    const foes=buildTowerEnemies(floor,bases,1000);
    assert.ok(foes.length>=1&&foes.length<=3);
    for(const foe of foes){assert.ok(foe.hp>0&&foe.atk>0);assert.equal(foe.xp,0);assert.equal(foe.gold,0);}
  }
  assert.equal(buildTowerEnemies(10,bases)[0].name,'破曉守門者・艾德蘭');
  assert.ok(buildTowerEnemies(30,bases)[0].bossPattern.abilities.includes('永凍領域'));
});
test('live dawn baselines yield actual tower HP/ATK with no field rewards',()=>{
  const live={monster:DAWN_MONSTERS[0],boss:DAWN_BOSS};
  const tenth=buildTowerEnemies(10,live)[0],twentieth=buildTowerEnemies(20,live)[0],thirtieth=buildTowerEnemies(30,live)[0];
  assert.equal(tenth.hp,Math.round(DAWN_BOSS.hp*2));
  assert.equal(tenth.atk,Math.round(DAWN_BOSS.atk*1.1));
  assert.ok(tenth.hp<twentieth.hp&&twentieth.hp<thirtieth.hp);
  for(const foe of [tenth,twentieth,thirtieth])assert.deepEqual(foe.drops,[]);
});
test('run starts only at unlocked floor and does not consume old trials',()=>{
  assert.equal(beginTowerRun(player(),1,1000).run.floor,1);
  assert.match(beginTowerRun(player(),2,1000).error,/尚未解鎖/);
  assert.match(beginTowerRun({...player(),trialRun:{}},1,1000).error,/挑戰/);
  assert.match(beginTowerRun({...player(),towerProgress:{highest:30}},31,1000).error,/尚未解鎖/);
});
test('unique enemy defeats, timeout and first-clear reward',()=>{
  const p={...player(),towerProgress:{highest:9}},run=beginTowerRun(p,10,1000).run;
  const id='tower-10-0',done=markTowerEnemyDefeated(run,id,1,12000);
  assert.equal(done.stageCleared,true);
  assert.match(markTowerEnemyDefeated(done.run,id,1,12000).error,/已結算/);
  const cleared=settleTowerRun(p,done.run,12000,{alive:true,totalEnemies:1});
  assert.equal(cleared.firstReward,'破曉挑戰者');
  assert.equal(cleared.progress.checkpoint,10);
  assert.equal(towerRemainingSeconds(run,1000+181000),0);
  assert.match(settleTowerRun(p,done.run,1000+181000,{alive:true,totalEnemies:1}).error,/超時/);
});
test('boss phases never go backward and summons have deterministic thresholds',()=>{
  const pattern=TOWER_BOSS_PATTERNS[20];
  assert.equal(towerBossPhase(pattern,.8),0);
  assert.equal(towerBossPhase(pattern,.69),1);
  assert.equal(towerBossPhase(pattern,.2,1),2);
  assert.equal(towerBossPhase(pattern,.9,2),2);
  assert.deepEqual(pattern.summons,[4,0]);
});
test('signature skills are bounded, periodic and region-specific',()=>{
 const light=towerBossSignature(10,2),fire=towerBossSignature(20,2),ice=towerBossSignature(30,2);
 assert.equal(light.type,'strike');assert.ok(light.maxHpRatio<=.12);
 assert.equal(fire.type,'burn');assert.ok(fire.hpRatio<=fire.maxHpRatio);
 assert.equal(ice.type,'freeze');assert.ok(ice.durationMs<=ice.maxDurationMs);
 for(const skill of [light,fire,ice])assert.ok(skill.intervalMs>=7000);
});
