import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';

const epoch=1000000;

async function advanceFrom31(kind){
 const c=await runtime(),p=legacyOptimalPlayer('knight');
 equipExtremeBossCards(p);
 p.location='dawnrift';p.extremeProgress={[kind]:{highest:30}};
 p.extremeCoins=450;
 p.extremeRun={kind,floor:31,startedAt:epoch,stageStartedAt:epoch,
  stageDamage:0,stageKills:0,status:'active'};
 p.offline={at:epoch,enabled:true};
 c.api.setup(p);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const {player,summary}=await c.api.simulateOffline(p,epoch+400000);
 return {player,summary};
}

test('ATK與MATK王31階後可連續推進，50階仍無額外徽記',async()=>{
 for(const kind of ['atk','matk']){
  const {player,summary}=await advanceFrom31(kind);
  assert.equal(player.extremeProgress[kind].highest,50,kind);
  assert.equal(player.extremeRun.floor,51,kind);
  assert.equal(player.extremeCoins,450,kind);
  assert.equal(summary.simulated,400000,kind);
 }
});

test('HP與CLEAR王31階後達不到目標立即停止，保留進度但無新徽記',async()=>{
 for(const [kind,highest,failedFloor,reason] of [
  ['hp',31,32,'階段傷害不足'],['clear',33,34,'階段擊殺數不足']]){
  const {player,summary}=await advanceFrom31(kind);
  assert.equal(player.extremeProgress[kind].highest,highest,kind);
  assert.equal(player.extremeRun,undefined,kind);
  assert.equal(player.extremeLastResult.floor,failedFloor,kind);
  assert.equal(player.extremeLastResult.reason,reason,kind);
  assert.equal(player.extremeCoins,450,kind);
  assert.equal(summary.reason,reason,kind);
  assert.ok(summary.simulated<400000,kind);
 }
});
