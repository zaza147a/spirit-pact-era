import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000;
async function settle(job,disableOfflineGearStatCache){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed:471122,disableOfflineGearStatCache}
 });
 const player=highLevelSpiritPlayer({level:210,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
 try{return await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Offline gear-stat parity timed out')),60000);
  worker.on('message',msg=>{
   if(msg.type==='result'){clearTimeout(timeout);resolve(msg.result);}
   if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.message));}
  });
  worker.on('error',err=>{clearTimeout(timeout);reject(err);});
  worker.postMessage({player,now:epoch+10*60000});
 });}finally{await worker.terminate();}
}

for(const job of ['pactWarrior','spiritCommander']){
 test(`offline item contribution memoization preserves complete result for ${job}`,async()=>{
  const uncached=await settle(job,true),cached=await settle(job,false);
  assert.deepEqual(cached,uncached);
  assert.equal(cached.summary.simulated,10*60000);
 });
}
