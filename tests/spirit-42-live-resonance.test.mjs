// End-to-end controlled combat through production offline Worker for all 42 routes.
// This is a trigger/attribution smoke, NOT a 200-trial or DPS ranking.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {DUAL_FUSION_TYPES,canonicalDualFusionKey} from '../dist/spirit-job-rules.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,duration=10000;
let routes=0,activations=0,damage=0;
for(const job of ['pactWarrior','spiritCommander'])for(const pairKey of DUAL_FUSION_TYPES){
 const player=highLevelSpiritPlayer({level:200,job,pairKey});
 assert.equal(canonicalDualFusionKey(...player.pets),pairKey);
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=717171&clock='+epoch,import.meta.url),{type:'module'});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Worker timeout '+job+' '+pairKey)),30000);
   worker.on('message',msg=>{
    if(msg.type==='result'){clearTimeout(timer);resolve(msg.result);}
    if(msg.type==='error'){clearTimeout(timer);reject(Error(msg.stack||msg.message));}
   });
   worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player,now:epoch+duration});
  });
  assert.ok(result.summary?.simulated>0,'real combat must tick '+job+' '+pairKey);
  const count=result.summary.resonanceActivations||0;
  assert.ok(count>0,'actual third-job resonance must trigger '+job+' '+pairKey);
  assert.equal(result.player.pets.length,2);
  assert.ok(result.summary.damage.pet1>0&&result.summary.damage.pet2>0,'both fused pets contribute '+job+' '+pairKey);
  activations+=count;damage+=result.summary.damage.resonance;routes++;
  console.log(JSON.stringify({job,pairKey,simulatedMs:result.summary.simulated,kills:result.summary.kills,
   resonanceActivations:count,resonanceDamage:result.summary.damage.resonance}));
 }finally{await worker.terminate();}
}
assert.equal(routes,42);
console.log(JSON.stringify({routes,activations,resonanceDamage:damage,complete:true}));
