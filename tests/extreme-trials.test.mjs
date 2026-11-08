import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeStage,beginExtremeRun,recordExtremeDamage,extremeStageResult,settleExtremeStage,normalizeExtremeProgress} from '../dist/extreme-trials.js';

const player={level:210,location:'dawncity'};
test('三種首領在第 1、10、100 階使用預期的線性成長',()=>{
  assert.equal(extremeStage('atk',10).attackMultiplier,2.3499999999999996);
  assert.equal(extremeStage('matk',100).attackMultiplier,15.85);
  assert.equal(extremeStage('hp',1).requiredDamage,3000000000);
  assert.equal(extremeStage('hp',10).requiredDps,550000000);
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
  recordExtremeDamage(run,2999999999);
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
test('首次突破只補發新階段獎勵，三王獨立紀錄',()=>{
  let data=settleExtremeStage(null,'atk',10);
  assert.equal(data.coins,100);
  assert.equal(settleExtremeStage(data.progress,'atk',10).coins,0);
  data=settleExtremeStage(data.progress,'atk',12);
  assert.equal(data.coins,30);
  assert.equal(normalizeExtremeProgress(data.progress).matk.highest,0);
});
