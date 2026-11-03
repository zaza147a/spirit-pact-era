// Control group: one-hour actual Worker survival on existing ten jobs and both spirit jobs.
// Uses exactly the same map/gear-quality/seed as the prior 12-job DPS benchmark.
// No game mechanic changes or monster edits.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
const epoch=2000000000000,duration=3600000,seed=471122,rows=[];
for(const level of [200,210])for(const job of ALL_COMPARISON_JOBS){
 const player=comparisonPlayer({job,level});
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('legacy-survival control timeout '+job+' '+level)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary;
  assert.ok(s?.simulated>0);
  const row={job,level,petCount:player.pets.length,seed,wallMs:Math.round(performance.now()-start),
   simulatedHours:Number((s.simulated/3600000).toFixed(3)),complete:s.simulated===duration,
   reason:s.reason,alive:result.player.hp>0,petAlive:result.player.pets.filter(p=>p.hp>0).length,
   kills:s.kills,revives:s.revives||0,netGold:result.player.gold-player.gold};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,24);
for(const level of [200,210])console.log(JSON.stringify({summary:true,level,rows:rows.filter(r=>r.level===level)}));
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitation:'Synthetic mythic 200 unenhanced / 210 SSS, sigil 0, one seed, no bosses; existing classes retain their original unmodified combat rules.'}));
