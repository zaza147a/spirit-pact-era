import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000;
async function settle(player,minutes,disableOfflineIdleSkip){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed:471122,disableOfflineIdleSkip}
 });
 const started=performance.now();
 try{return await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Idle-skip parity timed out')),90000);
  worker.on('message',msg=>{
   if(msg.type==='result'){
    clearTimeout(timeout);
    resolve({result:msg.result,wallMs:Math.round(performance.now()-started)});
   }else if(msg.type==='error'){
    clearTimeout(timeout);reject(Error(msg.message));
   }
  });
  worker.on('error',error=>{clearTimeout(timeout);reject(error)});
  worker.postMessage({player:structuredClone(player),now:epoch+minutes*60000});
 });}finally{await worker.terminate();}
}

for(const [level,job] of [[200,'pactWarrior'],[200,'spiritCommander'],[210,'pactWarrior'],[210,'spiritCommander']]){
 test(`original 100ms grid and idle-event skip agree for ${level} ${job}`,async()=>{
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,10,true);
  const optimized=await settle(player,10,false);
  assert.deepEqual(optimized.result,baseline.result,
   'full state, loot, resources, combat damage and RNG-dependent results must match');
  assert.equal(optimized.result.summary.simulated,600000);
  console.log(JSON.stringify({level,job,minutes:10,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}
