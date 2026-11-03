// Longer observational combat for the five low-frequency routes identified by the
// 42-route, 60-second regression. No guaranteed proc assumption or balance edit.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';

const targets=[
 ['pactWarrior','attack-defense+attack-support'],
 ['spiritCommander','attack-support+attack-support'],
 ['spiritCommander','attack-support+magic-defense'],
 ['spiritCommander','magic-defense+magic-defense'],
 ['spiritCommander','defense-support+magic-defense']
];
const epoch=2000000000000,duration=300000,rows=[];
for(const [job,pairKey] of targets){
 assert.ok(DUAL_FUSION_TYPES.includes(pairKey));
 for(const level of [200,210])for(const seed of [717171,93217]){
  const player=highLevelSpiritPlayer({job,pairKey,level});
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed='+seed+'&clock='+epoch,import.meta.url),{type:'module'});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Worker timeout '+job+' '+level+' '+seed)),60000);
    worker.on('message',msg=>{
     if(msg.type==='result'){clearTimeout(timeout);resolve(msg.result);}
     if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.stack||msg.message));}
    });
    worker.on('error',error=>{clearTimeout(timeout);reject(error);});
    worker.postMessage({player,now:epoch+duration});
   });
   const s=result.summary;
   assert.equal(s.simulated,duration,'full five-minute production combat');
   assert.equal(s.dualSpiritMainEvents,(s.resonanceActivations||0)+s.dualSpiritBlockedDeadTarget+s.dualSpiritBlockedFormation+s.dualSpiritBlockedCooldown);
   const row={job,pairKey,level,seed,kills:s.kills,revives:s.revives||0,
    mainEvents:s.dualSpiritMainEvents,activations:s.resonanceActivations||0,
    petDown:s.dualSpiritBlockedPetDown,cooldown:s.dualSpiritBlockedCooldown,
    directResonanceDamage:s.damage.resonance};
   rows.push(row);console.log(JSON.stringify(row));
  }finally{await worker.terminate();}
 }
}
assert.equal(rows.length,20);
const summary={complete:true,scenarios:20,duration,
 zeroActivationScenarios:rows.filter(r=>r.activations===0).length,
 affectedRoutes:targets.map(([job,pairKey])=>({job,pairKey,
  runs:rows.filter(r=>r.job===job&&r.pairKey===pairKey).length,
  activations:rows.filter(r=>r.job===job&&r.pairKey===pairKey).reduce((n,r)=>n+r.activations,0)})),
 totalActivations:rows.reduce((n,r)=>n+r.activations,0)};
console.log(JSON.stringify(summary));
