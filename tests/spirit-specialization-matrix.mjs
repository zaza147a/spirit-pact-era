// Observational dual-spirit specialization matrix: real Worker five-boss trial versus field farming.
// Trial is a multi-stage boss-chain proxy, NOT a pure stationary one-target DPS dummy.
// Both jobs, all 15 legal distinct unordered fusion pairs, two deterministic seeds.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {rankOf} from '../dist/sky-trials.js';

const epoch=2000000000000,seeds=[471122,81733],jobs=['pactWarrior','spiritCommander'],rows=[];
const modes=[
 {name:'bossChain200',level:200,minutes:20},
 {name:'field210',level:210,minutes:5}
];
async function fight(mode,job,pairKey,seed){
 const player=highLevelSpiritPlayer({level:mode.level,job,pairKey,gearRarity:'mythic'});
 if(job==='pactWarrior')player.petStances=Object.fromEntries(player.pets.map(p=>[p.id,'assimilate']));
 const items=[...Object.values(player.gear).filter(Boolean),...player.pets.flatMap(p=>Object.values(p.gear).filter(Boolean))];
 assert.equal(items.length,16);
 assert.ok(items.every(g=>g.level===200&&g.rarity==='mythic'));
 if(mode.name==='bossChain200'){
  for(const gear of items)gear.enhancement='SS';
  player.trialClears={...player.trialClears,worldroot:1};
  player.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,stopAfterRound:true,
   checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},petEffects:{},
    classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
  player.location='worldroot';
 }else{
  assert.ok(items.every(g=>rankOf(g)==='SSS'),'201+ uses only SSS');
  player.location='dawnrift';
 }
 player.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('specialization matrix Worker timeout '+job+' '+mode.name+' '+pairKey)),120000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.postMessage({player,now:epoch+mode.minutes*60000});
  });
  const summary=result.summary,damage=summary?.damage;
  assert.ok(summary?.simulated>0&&Number.isFinite(damage?.total));
  const cleared=Math.max(0,(result.player.trialClears?.worldroot||0)-1);
  return {mode:mode.name,job,pairKey,seed,simulatedMs:summary.simulated,
   alive:result.player.hp>0,revives:summary.revives||0,kills:summary.kills,
   fiveBossClears:mode.name==='bossChain200'?cleared:null,
   ownerDps:Math.round(damage.player*1000/summary.simulated),
   petDps:Math.round((damage.pet1+damage.pet2)*1000/summary.simulated),
   totalHpDps:Math.round(damage.total*1000/summary.simulated),reason:summary.reason};
 }finally{await worker.terminate();}
}
for(const mode of modes)for(const job of jobs)for(const pairKey of DUAL_FUSION_TYPES)for(const seed of seeds){
 const row=await fight(mode,job,pairKey,seed);rows.push(row);console.log(JSON.stringify(row));
}
assert.equal(rows.length,modes.length*jobs.length*DUAL_FUSION_TYPES.length*seeds.length);
for(const mode of modes){
 const groups=Object.fromEntries(jobs.map(job=>{
  const subset=rows.filter(r=>r.mode===mode.name&&r.job===job);
  const avg=k=>Math.round(subset.reduce((v,r)=>v+r[k],0)/subset.length*100)/100;
  return [job,{scenarios:subset.length,meanKills:avg('kills'),meanHpDps:avg('totalHpDps'),
   meanOwnerDps:avg('ownerDps'),meanPetDps:avg('petDps'),
   survived:subset.filter(r=>r.alive).length,revives:subset.reduce((v,r)=>v+r.revives,0),
   fiveBossClears:mode.name==='bossChain200'?subset.filter(r=>r.fiveBossClears>0).length:null}];
 }));
 console.log(JSON.stringify({summary:true,mode:mode.name,groups,
  fieldKillsFavoursCommander:mode.name==='field210'?groups.spiritCommander.meanKills>groups.pactWarrior.meanKills:null,
  bossClearsFavoursWarrior:mode.name==='bossChain200'?groups.pactWarrior.fiveBossClears>groups.spiritCommander.fiveBossClears:null}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,legalFusionPairs:15,limitation:'200 boss chain and 210 field are not an isolated single-boss dummy nor an equal-HP three-enemy arena; coefficients and class strength must not be changed solely on this proxy.'}));
