import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';
import {extremeFiveFloorTitle} from '../dist/extreme-trials-rewards.js';

const epoch=1000000;
const fullDay=24*60*60*1000;

test('四王長達24小時離線只結算至首次失敗，禁止額外推關及重複徽記',async()=>{
 for(const [kind,minimum,reason] of [
  ['atk',70,'戰敗'],['matk',70,'戰敗'],
  ['hp',31,'階段傷害不足'],['clear',33,'階段擊殺數不足']]){
  const c=await runtime(),p=legacyOptimalPlayer('knight');
  equipExtremeBossCards(p);
  p.location='dawnrift';p.extremeProgress={[kind]:{highest:30}};
  p.extremeCoins=450;
  p.extremeRun={kind,floor:31,startedAt:epoch,stageStartedAt:epoch,
   stageDamage:0,stageKills:0,status:'active'};
  p.offline={at:epoch,enabled:true};
  c.api.setup(p);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
  const started=performance.now();
  const {player,summary}=await c.api.simulateOffline(p,epoch+fullDay);
  const elapsed=performance.now()-started;
  const highest=player.extremeProgress[kind].highest;
  console.info(`${kind} 24h trial: highest=${highest}, firstFailure=${player.extremeLastResult.floor}, elapsedMs=${Math.round(elapsed)}`);
  assert.ok(highest>=minimum,`${kind} finished at ${highest}`);
  assert.equal(player.extremeRun,undefined,kind);
  assert.equal(player.extremeLastResult.floor,highest+1,kind);
  assert.equal(summary.reason,reason,kind);
  assert.ok(summary.simulated<fullDay,kind);
  assert.equal(player.extremeCoins,450,kind);
  assert.ok(elapsed<45000,`${kind} 24h settlement took ${elapsed.toFixed(0)}ms`);
  if(highest>=35){
   assert.ok(player.extraHonorTitles.includes(extremeFiveFloorTitle(kind,35)),kind);
   const failedMilestone=Math.ceil((highest+1)/5)*5;
   if(failedMilestone>highest)
    assert.ok(!player.extraHonorTitles.includes(extremeFiveFloorTitle(kind,failedMilestone)),
     `${kind} must not award ${failedMilestone} before clearing it`);
  }
 }
});
