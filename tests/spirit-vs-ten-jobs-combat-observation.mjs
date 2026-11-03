// 12 professions × 200/210 same-map actual offline Worker comparisons.
// Synthetic equal equipment quality, not each job's globally optimized DPS.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {GEAR_BASE} from '../dist/loot.js';
import {parentJob} from '../dist/jobs.js';
const epoch=2000000000000,duration=60000,seed=471122;
const rows=[];
for(const level of [200,210])for(const job of ALL_COMPARISON_JOBS){
 const player=comparisonPlayer({job,level});
 const stages={first:0,second:0,third:0};
 for(const [id,rank] of Object.entries(player.jobSkills)){
  const skill=JOB_SKILLS[job].find(s=>s.id===id);
  assert.ok(skill&&rank<=skill.maxRank&&rank>=0,'legal stage skill '+job+' '+id);
  stages[skill.branch]+=rank;
 }
 assert.deepEqual(stages,{first:49,second:69,third:69});
 const used=Object.values(player.gear).filter(Boolean);
 assert.ok(used.every(g=>g.level===200&&g.rarity==='mythic'&&(level===210?g.enhancement==='SSS':!g.enhancement)));
 assert.ok(!GEAR_BASE[player.gear.rightHand.id]?.jobs||GEAR_BASE[player.gear.rightHand.id].jobs.includes(parentJob(job)));
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('job comparison worker timeout '+job+' '+level)),45000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s&&d&&Number.isFinite(d.total)&&s.simulated>0);
  const row={job,level,petCount:result.player.pets.length,gearCount:used.length,
   simulatedMs:s.simulated,kills:s.kills,revives:s.revives||0,
   alive:result.player.hp>0,completed:s.simulated===duration&&s.reason==='已完成離線時間'&&result.player.hp>0,
   ownerDamage:d.player,petDamage:d.pet1+d.pet2,petSupport:d.petSupport,resonanceDamage:d.resonance,
   totalDamage:d.total,actualHpDps:Math.round(d.total/s.simulated*1000)};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,24);
for(const level of [200,210]){
 const rank=rows.filter(r=>r.level===level).sort((a,b)=>b.actualHpDps-a.actualHpDps);
 console.log(JSON.stringify({summary:true,level,scenarios:rank.length,
  ranking:rank.map((r,i)=>({rank:i+1,job:r.job,petCount:r.petCount,kills:r.kills,
   revives:r.revives,actualHpDps:r.actualHpDps,completed:r.completed}))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,
 limitation:'Synthetic fixed mythic equipment, same map and seed, one fused pet for legacy ten classes vs two for spirit jobs; no optimization or fair farming-cost adjustment.'}));
