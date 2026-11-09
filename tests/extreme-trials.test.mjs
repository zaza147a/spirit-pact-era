import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeStage,beginExtremeRun,recordExtremeDamage,extremeStageResult,settleExtremeStage,normalizeExtremeProgress} from '../dist/extreme-trials.js';

const player={level:210,location:'dawncity'};
test('四種首領前 30 階平緩成長，31 階後提高極限門檻',()=>{
  assert.equal(extremeStage('atk',10).attackMultiplier,2.3499999999999996);
  assert.ok(Math.abs(extremeStage('matk',100).attackMultiplier-30.55)<1e-9);
  assert.equal(extremeStage('atk',30).attackMultiplier,5.35);
  assert.ok(extremeStage('atk',50).attackMultiplier>extremeStage('atk',40).attackMultiplier);
  assert.equal(extremeStage('hp',1).requiredDamage,1500000000);
  assert.equal(extremeStage('hp',10).requiredDps,90500000);
  assert.equal(extremeStage('hp',30).requiredDps,180500000);
  assert.equal(extremeStage('hp',31).requiredDps,230500000);
  assert.equal(extremeStage('clear',1).requiredKills,6);
  assert.equal(extremeStage('clear',30).requiredKills,20);
  assert.equal(extremeStage('clear',31).requiredKills,22);
  assert.equal(extremeStage('clear',100).requiredKills,160);
  assert.ok(Math.abs(extremeStage('clear',30).hpMultiplier-1.58)<1e-9);
});
test('清怪王必須在 30 秒實際擊殺足量怪物',()=>{
  const run=beginExtremeRun(player,'clear',1,0).run;
  run.stageKills=5;
  assert.equal(extremeStageResult(run,30000).status,'failed');
  run.stageKills=6;
  assert.equal(extremeStageResult(run,30000).status,'cleared');
});
test('入場等級、地點及十階快速入場限制',()=>{
  assert.match(beginExtremeRun({...player,level:199},'atk',1,0).error,/200/);
  assert.match(beginExtremeRun({...player,location:'town'},'atk',1,0).error,/曙光/);
  assert.ok(beginExtremeRun(player,'atk',1,0).run);
  assert.ok(beginExtremeRun({...player,extremeProgress:{atk:{highest:20}}},'atk',20,0).run);
  assert.ok(beginExtremeRun({...player,extremeProgress:{atk:{highest:19}}},'atk',20,0).error);
});
test('血量王 30 秒傷害不足失敗，達標才成功',()=>{
  const run=beginExtremeRun(player,'hp',1,1000).run;
  recordExtremeDamage(run,1499999999);
  assert.equal(extremeStageResult(run,31000).status,'failed');
  recordExtremeDamage(run,1);
  assert.equal(extremeStageResult(run,31000).status,'cleared');
});
test('攻擊王 20 秒存活過關，死亡失敗',()=>{
  const run=beginExtremeRun(player,'matk',1,0).run;
  assert.equal(extremeStageResult(run,19999).status,'active');
  assert.equal(extremeStageResult(run,20000,{alive:false}).status,'failed');
  assert.equal(extremeStageResult(run,20000).status,'cleared');
});
test('首次突破前 30 階可得徽記，31 階後只有稱號進度',()=>{
  let data=settleExtremeStage(null,'atk',10);
  assert.equal(data.coins,100);
  assert.equal(settleExtremeStage(data.progress,'atk',10).coins,0);
  data=settleExtremeStage(data.progress,'atk',12);
  assert.equal(data.coins,30);
  assert.equal(normalizeExtremeProgress(data.progress).matk.highest,0);
  data=settleExtremeStage(data.progress,'atk',30);
  assert.equal(data.coins,320);
  assert.equal(settleExtremeStage(data.progress,'atk',100).coins,0);
});

test('30 階後不封頂，極高層數不溢位、不建立巨大首次獎勵陣列',()=>{
 const floor=1000000000;
 const progress={atk:{highest:floor-1},hp:{highest:floor-1}};
 assert.equal(normalizeExtremeProgress(progress).atk.highest,floor-1);
 assert.ok(extremeStage('atk',floor).attackMultiplier>0);
 assert.ok(Number.isSafeInteger(extremeStage('hp',floor).requiredDamage));
 assert.ok(Number.isSafeInteger(extremeStage('clear',floor).requiredKills));
 assert.ok(beginExtremeRun({...player,extremeProgress:{atk:{highest:floor}}},'atk',floor,0).run);
 const claimed=settleExtremeStage(null,'hp',floor);
 assert.equal(claimed.progress.hp.highest,floor);
 assert.equal(claimed.coins,450);
 assert.ok(claimed.firstClears.length<=31);
});
