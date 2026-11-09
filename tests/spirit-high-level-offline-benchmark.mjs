// End-to-end 200/210 fully geared dual-fusion 1/6/12/24-hour benchmark.
// Observational: early termination is recorded, NEVER reported as full 24h.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,seed=471122;
const fastMinutes=Number(process.env.SPIRIT_HIGH_LEVEL_BENCH_MINUTES||0);
if(fastMinutes&&(!Number.isInteger(fastMinutes)||fastMinutes<1||fastMinutes>30))throw Error('fast benchmark minutes must be 1..30');
const durations=fastMinutes?[fastMinutes/60]:[1,6,12,24];
const selectedDurations=process.env.SPIRIT_HIGH_LEVEL_BENCH_HOURS
 ?process.env.SPIRIT_HIGH_LEVEL_BENCH_HOURS.split(',').map(Number):durations;
const selectedLevels=process.env.SPIRIT_HIGH_LEVEL_BENCH_LEVELS
 ?process.env.SPIRIT_HIGH_LEVEL_BENCH_LEVELS.split(',').map(Number):[200,210];
const selectedJobs=process.env.SPIRIT_HIGH_LEVEL_BENCH_JOBS
 ?process.env.SPIRIT_HIGH_LEVEL_BENCH_JOBS.split(','):['pactWarrior','spiritCommander'];
assert.ok(selectedDurations.length&&selectedDurations.every(h=>h>0&&h<=24));
assert.ok(selectedLevels.every(level=>[200,210].includes(level)));
assert.ok(selectedJobs.every(job=>['pactWarrior','spiritCommander'].includes(job)));
const records=[];
for(const level of selectedLevels)for(const job of selectedJobs){
 for(const hours of selectedDurations){
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  if(job==='pactWarrior')player.petStances={[player.pets[0].id]:'assimilate',[player.pets[1].id]:'assist'};
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
   const simulatedFull=s.simulated===hours*3600000;
   const full=simulatedFull&&s.reason==='已完成離線時間'&&response.result.player.hp>0;
   const wallMs=Math.round(performance.now()-started);
   const row={job,level,gearRarity:'mythic',hours,simulatedHours:Math.round(s.simulated/3600000*1000)/1000,
    completed:full,simulatedFull,reason:s.reason,wallMs,
    under30s:hours===24?full&&wallMs<=30000:null,
    workerHeapMb:Math.round((response.workerHeapUsed||0)/1048576),progressEvents,
    kills:s.kills,revives:s.revives||0,pet1Damage:d.pet1,pet2Damage:d.pet2,
    resonanceActivations:s.resonanceActivations||0,damageTotal:d.total,
    blockerPetDown:s.dualSpiritBlockedPetDown,inventorySize:response.result.player.bag.length};
   records.push(row);console.log(JSON.stringify(row));
  }finally{await worker.terminate();}
 }
}
assert.equal(records.length,selectedLevels.length*selectedJobs.length*selectedDurations.length);
console.log(JSON.stringify({summary:true,scenarioCount:records.length,fastMinutes,complete24h:records.filter(r=>r.hours===24&&r.completed).length,
 target24hMs:30000,met24hTarget:records.filter(r=>r.hours===24&&r.completed&&r.under30s).length,
 stopped24h:records.filter(r=>r.hours===24&&!r.completed).map(r=>({job:r.job,level:r.level,reason:r.reason,simulatedHours:r.simulatedHours})),
 benchmarkIsObservational:true,completionRequiresAlive:true}));
