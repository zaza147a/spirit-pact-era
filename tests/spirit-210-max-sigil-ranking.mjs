// Real level-210 five-minute all-class Worker ranking at sigil 0 and max rank 8.
// Compare identical mythic SSS legal fixtures and seeds without changing gameplay.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {DAWN_SIGIL_MAX,sigilLevel,sigilBonus} from '../dist/dawn-sigil.js';
import {JOB_SKILLS} from '../dist/job-skills.js';
const epoch=2000000000000,duration=5*60000,seeds=[471122,93217];
const variants=[...ALL_COMPARISON_JOBS.map(job=>({id:job,job})),
 {id:'pactWarrior_bothAssimilate',job:'pactWarrior'}];
const rows=[];
assert.equal(DAWN_SIGIL_MAX,8);
for(const sigil of [0,DAWN_SIGIL_MAX])for(const variant of variants)for(const seed of seeds){
 const player=comparisonPlayer({level:210,job:variant.job});
 if(variant.id==='pactWarrior_bothAssimilate')
  player.petStances=Object.fromEntries(player.pets.map(p=>[p.id,'assimilate']));
 player.dawnSigil=sigil;
 assert.equal(sigilLevel(player),sigil);
 const bonus=sigilBonus(player);
 assert.equal(bonus.atk,1+sigil*.02);
 const totals={first:0,second:0,third:0};
 for(const [id,rank] of Object.entries(player.jobSkills)){
  const skill=JOB_SKILLS[variant.job].find(s=>s.id===id);
  assert.ok(skill&&rank>=0&&rank<=skill.maxRank);
  totals[skill.branch]+=rank;
 }
 assert.deepEqual(totals,{first:49,second:69,third:69});
 const equipment=[...Object.values(player.gear).filter(Boolean),
  ...player.pets.flatMap(p=>Object.values(p.gear).filter(Boolean))];
 assert.ok(equipment.length>0&&equipment.every(g=>g.level===200&&g.rarity==='mythic'&&g.enhancement==='SSS'));
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('sigil 5m timeout '+sigil+' '+variant.id)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total));
  rows.push({sigil,id:variant.id,job:variant.job,seed,kills:s.kills,
   seconds:s.simulated/1000,revives:s.revives||0,alive:result.player.hp>0,
   completed:s.simulated===duration&&result.player.hp>0,
   ownerDps:Math.round(d.player*1000/s.simulated),
   petDps:Math.round((d.pet1+d.pet2)*1000/s.simulated),
   actualHpDps:Math.round(d.total*1000/s.simulated)});
 }finally{await worker.terminate();}
}
assert.equal(rows.length,2*variants.length*seeds.length);
const rankings={};
for(const sigil of [0,DAWN_SIGIL_MAX]){
 const ranked=variants.map(v=>{
  const sub=rows.filter(r=>r.sigil===sigil&&r.id===v.id);
  const mean=k=>sub.reduce((a,r)=>a+r[k],0)/sub.length;
  return {id:v.id,job:v.job,sigil,kills5m:Number(mean('kills').toFixed(2)),
   ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
   actualHpDps:Math.round(mean('actualHpDps')),
   revives:Number(mean('revives').toFixed(2)),
   completed:sub.filter(r=>r.completed).length,attempts:sub.length};
 }).sort((a,b)=>b.kills5m-a.kills5m||b.actualHpDps-a.actualHpDps);
 rankings[sigil]=ranked;
 console.log(JSON.stringify({summary:true,sigil,rankedByFiveMinuteKills:ranked.map((r,i)=>({rank:i+1,...r}))}));
}
console.log(JSON.stringify({sigilDeltas:true,comparisons:variants.map(v=>{
 const zero=rankings[0].find(r=>r.id===v.id),max=rankings[8].find(r=>r.id===v.id);
 const pct=(a,b)=>b===0?null:Number(((a/b-1)*100).toFixed(2));
 return {id:v.id,baseKills:zero.kills5m,maxKills:max.kills5m,
  killsGainPct:pct(max.kills5m,zero.kills5m),
  ownerDpsGainPct:pct(max.ownerDps,zero.ownerDps),
  petDpsGainPct:pct(max.petDps,zero.petDps),
  zeroRank:rankings[0].indexOf(zero)+1,maxRank:rankings[8].indexOf(max)+1};
})}));
console.log(JSON.stringify({complete:true,scenarios:rows.length,seeds,maxSigil:8,minutes:5,
 limitations:'Same fixed legal but nonoptimized 210 mythic SSS owner/pet gear; 5m field kills on production Worker; no boss ranking, no claim of theoretical optimal DPS.'}));
