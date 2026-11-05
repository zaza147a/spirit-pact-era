// Matched 120-second real-field battle for twelve jobs, three fixed seeds.
// Run with `node tests/spirit-twelve-job-120s-comparable.mjs`.
// This is an equal-fixture comparison, not a claim to reproduce an undocumented prior chart.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS} from './fixtures/spirit-vs-class-player.mjs';
import {offensiveComparisonPlayer} from './fixtures/spirit-ranking-offensive-player.mjs';

const EPOCH=2000000000000;
const SEEDS=[471122,93217,81733];
const DURATION=120000;
const rows=[];
for(const job of ALL_COMPARISON_JOBS){
  for(const seed of SEEDS){
    const player=offensiveComparisonPlayer(job);
    assert.equal(player.attributes.STR+player.attributes.AGI+player.attributes.VIT+
      player.attributes.INT+player.attributes.DEX+player.attributes.LUK,444);
    assert.ok(Math.max(...Object.values(player.attributes))<=150);
    const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+EPOCH,import.meta.url),
      {type:'module',workerData:{seed}});
    try{
      const result=await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(new Error(`Worker timeout: ${job}/${seed}`)),90000);
        worker.on('message',m=>{
          if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
          else if(m.type==='error'){clearTimeout(timeout);reject(new Error(m.stack||m.message));}
        });
        worker.on('error',e=>{clearTimeout(timeout);reject(e);});
        worker.postMessage({player,now:EPOCH+DURATION});
      });
      const s=result.summary;
      assert.ok(s.simulated>0&&s.simulated<=DURATION);
      rows.push({job,seed,kills:s.kills,actualDps:Math.round(s.damage.total*1000/s.simulated),
        ownerDps:Math.round(s.damage.player*1000/s.simulated),
        petDps:Math.round((s.damage.pet1+s.damage.pet2)*1000/s.simulated),
        revives:s.revives||0,seconds:s.simulated/1000,pets:player.pets.length});
    }finally{await worker.terminate();}
  }
  const group=rows.filter(row=>row.job===job);
  console.log(JSON.stringify({progress:job,meanKills:Number((group.reduce((a,r)=>a+r.kills,0)/3).toFixed(2))}));
}
const ranked=ALL_COMPARISON_JOBS.map(job=>{
  const group=rows.filter(r=>r.job===job);
  const mean=key=>group.reduce((total,row)=>total+row[key],0)/group.length;
  return {job,meanKills:Number(mean('kills').toFixed(2)),meanDps:Math.round(mean('actualDps')),
    ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
    revives:Number(mean('revives').toFixed(2))};
}).sort((a,b)=>b.meanKills-a.meanKills||b.meanDps-a.meanDps);
console.log(JSON.stringify({complete:true,conditions:{level:210,sigil:8,durationSeconds:120,seeds:SEEDS,
  caveat:'Fixed legal but nonoptimized SSS mythic fixture, same actual natural-spawn Worker for all jobs; does not reproduce undocumented chart gear/card choices or fixed boss+four fixture.'},
  ranked:ranked.map((row,index)=>({rank:index+1,...row})),rows},null,2));
