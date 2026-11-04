// Lv200 five-boss production Worker comparison: ten old jobs and both spirit careers.
// Fixed legal 200 mythic SSS owner/pet gear and sigil 8, identical checkpoint/seeds.
// This measures five-boss progression, not a stationary isolated single-target DPS dummy.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {JOB_SKILLS} from '../dist/job-skills.js';
import {rankOf,TRIAL_ROUTES} from '../dist/sky-trials.js';
const epoch=2000000000000,duration=20*60000,seeds=[471122,93217],rows=[];
const variants=[...ALL_COMPARISON_JOBS.map(job=>({name:job,job})),{name:'pactWarrior_bothAssimilate',job:'pactWarrior'}];
const route=TRIAL_ROUTES.find(r=>r.map==='worldroot');assert.ok(route?.level===191);
for(const variant of variants)for(const seed of seeds){
 const player=comparisonPlayer({level:200,job:variant.job});
 if(variant.name==='pactWarrior_bothAssimilate')
  player.petStances=Object.fromEntries(player.pets.map(p=>[p.id,'assimilate']));
 const stages={first:0,second:0,third:0};
 for(const [id,rank] of Object.entries(player.jobSkills)){
  const skill=JOB_SKILLS[variant.job].find(s=>s.id===id);
  assert.ok(skill&&rank<=skill.maxRank&&rank>=0);
  stages[skill.branch]+=rank;
 }
 assert.deepEqual(stages,{first:49,second:69,third:69});
 const gear=[...Object.values(player.gear).filter(Boolean),...player.pets.flatMap(p=>Object.values(p.gear).filter(Boolean))];
 for(const item of gear){
  assert.equal(item.level,200);
  assert.equal(item.rarity,'mythic');
  item.enhancement='SSS';
  assert.equal(rankOf(item),'SSS');
 }
 player.dawnSigil=8;
 player.trialClears={...player.trialClears,worldroot:1};
 player.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,stopAfterRound:true,
  checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},
   petEffects:{},classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
 player.location='worldroot';player.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('twelve-job five-boss timeout '+variant.name)),120000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total));
  const clears=Math.max(0,(result.player.trialClears?.worldroot||0)-1);
  const row={name:variant.name,job:variant.job,seed,petCount:result.player.pets.length,
   gearCount:gear.length,clearFive:clears>0,bossesKilled:s.kills,
   trialRounds:s.trialRounds||0,revives:s.revives||0,alive:result.player.hp>0,
   actualHpDps:Math.round(d.total*1000/s.simulated),reason:s.reason};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,variants.length*seeds.length);
const ranking=variants.map(v=>{
 const group=rows.filter(r=>r.name===v.name);
 const avg=k=>group.reduce((sum,r)=>sum+r[k],0)/group.length;
 return {name:v.name,job:v.job,petCount:group[0].petCount,
  clearedFive:group.filter(r=>r.clearFive).length,attempts:group.length,
  meanBossesKilled:Number(avg('bossesKilled').toFixed(2)),
  meanHpDps:Math.round(avg('actualHpDps')),revives:Number(avg('revives').toFixed(2))};
}).sort((a,b)=>b.clearedFive-a.clearedFive||b.meanBossesKilled-a.meanBossesKilled||b.meanHpDps-a.meanHpDps);
console.log(JSON.stringify({summary:true,ranking:ranking.map((r,i)=>({rank:i+1,...r}))}));
console.log(JSON.stringify({complete:true,scenarios:rows.length,seeds,
 limitations:'Synthetic previously-unlocked five-boss checkpoint, 200 mythic SSS gear for owner and pets, sigil 8; nonoptimized skill/card equipment; five-boss clears are not an isolated steady single-target DPS measure.'}));
