// Diagnostic only: 120s natural spawn on stage-one 240s mixed-boss candidate saves.\n// Do NOT compare these results to the historical manifest.dps.
// No random gear generation, attribute changes, card scoring or skill optimization.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {LEGACY_OPTIMAL_BUILD_NAMES,legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';

const START=2000000000000;
const DURATION=Number(process.env.SPIRIT_DURATION_MS||120000);
const SEEDS=[471122,93217,81733];
const resultRows=[];
for(const job of LEGACY_OPTIMAL_BUILD_NAMES.filter(j=>!process.env.SPIRIT_JOB_FILTER||process.env.SPIRIT_JOB_FILTER===j)){
 for(const seed of SEEDS){
  const player=legacyOptimalPlayer(job);
  // Transport the original saved build into the same 201 map; no gear mutation.
  player.location='dawnrift';
  player.offline={at:START,enabled:true};
  player.potionThresholds={playerHp:90,playerSp:90,petHp:90,petSp:90};
  assert.equal(player.dawnSigil,8);
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+START,import.meta.url),
   {type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error(`Worker timeout: ${job}/${seed}`)),90000);
    worker.on('message',m=>{
     if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
     if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
    });
    worker.on('error',e=>{clearTimeout(timeout);reject(e);});
    worker.postMessage({player,now:START+DURATION});
   });
   const s=result.summary;
   assert.ok(s?.simulated>0&&s.simulated<=DURATION);
   const row={job,seed,kills:s.kills,revives:s.revives||0,
    duration:s.simulated/1000,ownerDps:Math.round(s.damage.player*1000/s.simulated),
    petDps:Math.round((s.damage.pet1+s.damage.pet2)*1000/s.simulated),
    dps:Math.round(s.damage.total*1000/s.simulated),
    bossEncounters:s.bossesEncountered||0};
   resultRows.push(row);
  }finally{await worker.terminate();}
 }
 const rows=resultRows.filter(r=>r.job===job);
 const mean=k=>rows.reduce((s,r)=>s+r[k],0)/rows.length;
 console.log(JSON.stringify({job,kills120:Number(mean('kills').toFixed(2)),
  dps:Math.round(mean('dps')),revives:Number(mean('revives').toFixed(2))}));
}
const ranked=[...new Set(resultRows.map(r=>r.job))].map(job=>{
 const rows=resultRows.filter(r=>r.job===job),mean=k=>rows.reduce((s,r)=>s+r[k],0)/rows.length;
 return {job,kills120:Number(mean('kills').toFixed(2)),dps:Math.round(mean('dps')),
  ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
  revives:Number(mean('revives').toFixed(2)),bossEncounters:Number(mean('bossEncounters').toFixed(2))};
}).sort((a,b)=>b.kills120-a.kills120);
console.log(JSON.stringify({complete:true,source:'user-supplied v6559 optimum saves (unchanged gear/cards/skills)',
 level:210,sigil:8,seeds:SEEDS,durationSeconds:DURATION/1000,
 caveat:'Production Worker natural encounters, not stationary boss+4. Saved HP and all gear preserved; location/datetime/90%-potion threshold set for benchmark.',
 ranking:ranked,rows:resultRows},null,2));
