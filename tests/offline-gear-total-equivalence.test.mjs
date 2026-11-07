import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000;
async function settle(job,disableOfflineGearTotals,minutes=10){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed:471122,disableOfflineGearTotals}
 });
 const player=highLevelSpiritPlayer({level:210,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
 try{return await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Offline gear-total parity timed out')),60000);
  worker.on('message',msg=>{
   if(msg.type==='result'){clearTimeout(timeout);resolve(msg.result);}
   if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.message));}
  });
  worker.on('error',err=>{clearTimeout(timeout);reject(err);});
  worker.postMessage({player,now:epoch+minutes*60000});
 });}finally{await worker.terminate();}
}

for(const job of ['pactWarrior','spiritCommander']){
 test(`offline equipment totals preserve full character and reward state for ${job}`,async()=>{
  const baseline=await settle(job,true),optimized=await settle(job,false);
  assert.deepEqual(optimized,baseline);
  assert.equal(optimized.summary.simulated,10*60000);
 });
}

test('offline gear totals preserve full settlement across one hour of repeated combat and loot',async()=>{
 const baseline=await settle('pactWarrior',true,60),optimized=await settle('pactWarrior',false,60);
 assert.deepEqual(optimized,baseline);
 assert.equal(optimized.summary.simulated,60*60000);
});
