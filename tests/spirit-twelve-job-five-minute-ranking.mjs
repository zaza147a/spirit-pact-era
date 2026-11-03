// Actual five-minute Worker comparison for all ten legacy jobs and two spirit jobs.
// Include both Pact Warrior one- and two-assimilation stances to avoid benchmark cherry-picking.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {GEAR_BASE} from '../dist/loot.js';
import {parentJob} from '../dist/jobs.js';

const epoch=2000000000000,duration=5*60000,seeds=[471122,93217];
const scenarios=[...ALL_COMPARISON_JOBS.map(job=>({id:job,job,stance:'default'})),
 {id:'pactWarrior_bothAssimilate',job:'pactWarrior',stance:'bothAssimilate'}];
const rows=[];
for(const level of [200,210])for(const variant of scenarios)for(const seed of seeds){
 const player=comparisonPlayer({job:variant.job,level});
 if(variant.stance==='bothAssimilate')
  player.petStances=Object.fromEntries(player.pets.map(p=>[p.id,'assimilate']));
 const stage={first:0,second:0,third:0};
 for(const [id,rank]of Object.entries(player.jobSkills)){
  const skill=JOB_SKILLS[variant.job].find(s=>s.id===id);
  assert.ok(skill&&rank>=0&&rank<=skill.maxRank,variant.id+' '+id);
  stage[skill.branch]+=rank;
 }
 assert.deepEqual(stage,{first:49,second:69,third:69},variant.id+' legal skills');
 const gear=Object.values(player.gear).filter(Boolean);
 assert.ok(gear.every(g=>g.level===200&&g.rarity==='mythic'&&(level===210?g.enhancement==='SSS':!g.enhancement)));
 const weapon=player.gear.rightHand.id;
 assert.ok(!GEAR_BASE[weapon]?.jobs||GEAR_BASE[weapon].jobs.includes(variant.job)||GEAR_BASE[weapon].jobs.includes(parentJob(variant.job)));
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('5m class Worker timeout '+level+' '+variant.id)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timeout);reject(e);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total));
  const row={level,job:variant.job,variant:variant.id,seed,
   pets:result.player.pets.length,seconds:s.simulated/1000,
   kills:s.kills,revives:s.revives||0,alive:result.player.hp>0,
   complete:s.simulated===duration&&result.player.hp>0,
   ownerDps:Math.round(d.player*1000/s.simulated),
   petDps:Math.round((d.pet1+d.pet2)*1000/s.simulated),
   actualHpDps:Math.round(d.total*1000/s.simulated)};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,2*scenarios.length*seeds.length);
for(const level of [200,210]){
 const ranked=scenarios.map(variant=>{
  const subset=rows.filter(r=>r.level===level&&r.variant===variant.id);
  const mean=k=>subset.reduce((sum,r)=>sum+r[k],0)/subset.length;
  return {variant:variant.id,job:variant.job,pets:subset[0].pets,
   kills5m:Number(mean('kills').toFixed(2)),actualHpDps:Math.round(mean('actualHpDps')),
   ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
   meanRevives:Number(mean('revives').toFixed(2)),
   completed:subset.filter(r=>r.complete).length,seedCount:subset.length};
 }).sort((a,b)=>b.kills5m-a.kills5m);
 console.log(JSON.stringify({summary:true,level,rankedByFiveMinuteKills:ranked.map((r,i)=>({rank:i+1,...r}))}));
 const originals=ranked.filter(x=>!['pactWarrior','spiritCommander'].includes(x.job));
 const median=(sorted)=>sorted[Math.floor((sorted.length-1)/2)];
 const legacyKills=originals.map(x=>x.kills5m).sort((a,b)=>a-b);
 const legacyMedian=median(legacyKills);
 const commander=ranked.find(x=>x.job==='spiritCommander');
 const warrior=ranked.find(x=>x.variant==='pactWarrior_bothAssimilate');
 console.log(JSON.stringify({diagnostic:true,level,legacyMedianKills5m:legacyMedian,
  legacyMinKills5m:legacyKills[0],legacyMaxKills5m:legacyKills.at(-1),
  commanderToLegacyMedianPct:Number((commander.kills5m/legacyMedian*100).toFixed(2)),
  warriorDualAbsorbToLegacyMedianPct:Number((warrior.kills5m/legacyMedian*100).toFixed(2))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,minutes:5,seeds,limitations:'Synthetic same-rarity gear and maps; fixed legal but nonoptimized skills/cards; legacy jobs have one pet, special jobs have two; owner/pet equipment investments differ, and average capped HP DPS is not a theoretical DPS ceiling.'}));
