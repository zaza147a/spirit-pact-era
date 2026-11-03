// End-to-end controlled combat through production offline Worker for all 42 routes.
// This is a trigger/attribution smoke, NOT a 200-trial or DPS ranking.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {DUAL_FUSION_TYPES,canonicalDualFusionKey} from '../dist/spirit-job-rules.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,duration=60000;
let routes=0,activations=0,damage=0;
const activationByJob={pactWarrior:0,spiritCommander:0};
const zeroActivationRoutes=[];
const blockerTotals={mainEvents:0,deadTarget:0,formation:0,petDown:0,missingPair:0,cooldown:0};
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
  // Live combat is conditional and stochastic: a valid route can have no trigger
  // within a finite encounter window. Exact trigger eligibility is covered by
  // the 42 positive/negative signature tests.
  assert.ok(Number.isInteger(count)&&count>=0,'legal nonnegative live resonance count');
  if(count===0)zeroActivationRoutes.push(job+':'+pairKey);
  const counters={mainEvents:result.summary.dualSpiritMainEvents,
   deadTarget:result.summary.dualSpiritBlockedDeadTarget,
   formation:result.summary.dualSpiritBlockedFormation,
   petDown:result.summary.dualSpiritBlockedPetDown,
   missingPair:result.summary.dualSpiritBlockedMissingPair,
   cooldown:result.summary.dualSpiritBlockedCooldown};
  assert.ok(Object.values(counters).every(n=>Number.isInteger(n)&&n>=0),'offline diagnostic counters');
  assert.equal(counters.formation,counters.petDown+counters.missingPair,'formation loss reasons must be exhaustive');
  assert.equal(counters.mainEvents,count+counters.deadTarget+counters.formation+counters.cooldown,
   'all main-skill events must have a trigger or recorded blocker');
  for(const key of Object.keys(blockerTotals))blockerTotals[key]+=counters[key];
  assert.equal(result.player.pets.length,2);
  assert.ok(result.summary.damage.pet1>0&&result.summary.damage.pet2>0,'both fused pets contribute '+job+' '+pairKey);
  activations+=count;activationByJob[job]+=count;
  assert.ok(Number.isFinite(result.summary.damage.resonance)&&result.summary.damage.resonance>=0);
  damage+=result.summary.damage.resonance;routes++;
  console.log(JSON.stringify({job,pairKey,simulatedMs:result.summary.simulated,kills:result.summary.kills,
   resonanceActivations:count,resonanceDamage:result.summary.damage.resonance,blockers:counters}));
 }finally{await worker.terminate();}
}
assert.equal(routes,42);
assert.ok(activationByJob.pactWarrior>0&&activationByJob.spiritCommander>0,'each job activates resonance in actual combat');
console.log(JSON.stringify({routes,activations,activationByJob,zeroActivationRoutes,
 blockerTotals,resonanceDamage:damage,complete:true}));
