// End-to-end 200/210 fully geared dual-fusion 1/6/12/24-hour benchmark.
// Observational: early termination is recorded, NEVER reported as full 24h.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,seed=471122;
const records=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 for(const hours of [1,6,12,24]){
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'legendary'});
  // Consistent with 200 unenhanced / 210 SSS normal-field difficulty baseline.
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
   type:'module',workerData:{seed}
  });
  const started=performance.now();let progressEvents=0;
  try{
   const response=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('High-level offline timeout '+job+' '+level+' '+hours+'h')),180000);
    worker.on('message',msg=>{
     if(msg.type==='progress')progressEvents++;
     if(msg.type==='result'){clearTimeout(timeout);resolve(msg);}
     if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.stack||msg.message));}
    });
    worker.on('error',error=>{clearTimeout(timeout);reject(error);});
    worker.postMessage({player,now:epoch+hours*3600000});
   });
   const s=response.result.summary,d=s?.damage;
   assert.ok(s&&d&&Number.isFinite(d.total),'real combat summary and damage');
   const parts=['player','pet1','pet2','resonance','petSupport','other'];
   assert.equal(parts.reduce((n,key)=>n+d[key],0),d.total,'no double-counted HP damage');
   assert.equal(response.result.player.pets.length,2,'fusion pair persisted');
   const full=s.simulated===hours*3600000;
   const row={job,level,gearRarity:'legendary',hours,simulatedHours:Math.round(s.simulated/3600000*1000)/1000,
    completed:full,reason:s.reason,wallMs:Math.round(performance.now()-started),
    workerHeapMb:Math.round((response.workerHeapUsed||0)/1048576),progressEvents,
    kills:s.kills,revives:s.revives||0,pet1Damage:d.pet1,pet2Damage:d.pet2,
    resonanceActivations:s.resonanceActivations||0,damageTotal:d.total,
    blockerPetDown:s.dualSpiritBlockedPetDown,inventorySize:response.result.player.bag.length};
   records.push(row);console.log(JSON.stringify(row));
  }finally{await worker.terminate();}
 }
}
assert.equal(records.length,16);
console.log(JSON.stringify({summary:true,scenarioCount:records.length,complete24h:records.filter(r=>r.hours===24&&r.completed).length,
 stopped24h:records.filter(r=>r.hours===24&&!r.completed).map(r=>({job:r.job,level:r.level,reason:r.reason,simulatedHours:r.simulatedHours})),
 benchmarkIsObservational:true}));
