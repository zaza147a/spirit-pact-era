import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';

const epoch=1_000_000;
async function checkpoint(kind,floor){
 const c=await runtime(),p=legacyOptimalPlayer('knight');
 p.location='dawnrift';p.extremeProgress={[kind]:{highest:floor-1}};
 p.extremeRun={kind,floor,startedAt:epoch,stageStartedAt:epoch,status:'active',stageDamage:0,stageKills:0};
 p.offline={at:epoch,enabled:false};
 c.api.setup(p);c.setTime(epoch);c.api.spawnExtremeBoss();
 return {c,p};
}

test('重新登入恢復ATK王的敵人狀態與剩餘倒數，不得憑重新整理直接過關',async()=>{
 const {c,p}=await checkpoint('atk',45);
 c.setTime(epoch+8000);
 const foe=c.api.state().enemy;
 foe.hp=foe.maxHp-123456;
 p.extremeRun.stageDamage=98765;
 c.api.checkpointExtreme();
 const saved=JSON.parse(JSON.stringify(p));
 const next=await runtime();next.setTime(epoch+108000);
 next.api.setup(saved);
 assert.equal(next.api.restoreExtremeCheckpoint(),true);
 assert.equal(next.api.state().enemy.hp,foe.hp);
 assert.equal(saved.extremeRun.stageDamage,98765);
 assert.equal(saved.extremeRun.stageStartedAt,epoch+100000);
 assert.equal(saved.extremeRun.floor,45);
 assert.equal(saved.extremeProgress.atk.highest,44);
 assert.equal(saved.extremeCoins||0,0);
 saved.offline={at:epoch+108000,enabled:true};
 const after=await next.api.simulateOffline(saved,epoch+120500);
 assert.equal(after.player.extremeProgress.atk.highest,45);
 assert.equal(after.player.extremeCoins||0,0);
});

test('CLEAR王重新登入仍是五隻不同小怪，保留已擊殺數與時間，不重複給獎',async()=>{
 const {c,p}=await checkpoint('clear',35);
 const enemies=c.api.state().enemies;
 assert.equal(enemies.length,5);
 c.setTime(epoch+12000);
 p.extremeRun.stageKills=6;
 enemies[0].hp=Math.floor(enemies[0].maxHp/2);
 c.api.checkpointExtreme();
 const saved=JSON.parse(JSON.stringify(p));
 const next=await runtime();next.setTime(epoch+212000);
 next.api.setup(saved);
 assert.equal(next.api.restoreExtremeCheckpoint(),true);
 const restored=next.api.state().enemies;
 assert.equal(restored.length,5);
 assert.equal(new Set(restored.map(enemy=>enemy.instanceId)).size,5);
 assert.equal(restored[0].hp,enemies[0].hp);
 assert.equal(saved.extremeRun.stageKills,6);
 assert.equal(saved.extremeRun.stageStartedAt,epoch+200000);
 assert.equal(saved.extremeProgress.clear.highest,34);
 assert.equal(saved.extremeCoins||0,0);
 saved.offline={at:epoch+212000,enabled:true};
 const after=await next.api.simulateOffline(saved,epoch+230500);
 assert.equal(after.player.extremeProgress.clear.highest,34);
 assert.equal(after.player.extremeLastResult?.floor,35);
 assert.match(after.summary.reason,/階段擊殺數不足/);
 assert.equal(after.player.extremeCoins||0,0);
});
