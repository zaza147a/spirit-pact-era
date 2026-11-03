// Bounded legal-build search on the real 201-210 map Worker with mobs + random Archon.
// This is NOT a mathematical proof of global optimum. Report candidates and limitations.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_TYPES,DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {allocationBudget} from '../dist/growth-v5.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,seed=471122,roles=new Set(['pactWarrior','spiritCommander']);
const stats=['baseline','agi-luk','vit-luk','agi-dex','vit-agi'];
const orders=['default','main-first'];
function variants(job){
 if(!roles.has(job))return FUSION_TYPES.map(fusion=>({job,pair:fusion,stance:'solo'}));
 return DUAL_FUSION_TYPES.flatMap(pair=>job==='pactWarrior'
  ?['assist-assist','assimilate-assist','assimilate-assimilate'].map(stance=>({job,pair,stance}))
  :[{job,pair,stance:'assist-assist'}]);
}
function createPlayer(cfg){
 const spirit=roles.has(cfg.job);
 const p=spirit?highLevelSpiritPlayer({level:210,job:cfg.job,pairKey:cfg.pair}):comparisonPlayer({level:210,job:cfg.job});
 if(!spirit){
  const pairKey=DUAL_FUSION_TYPES.find(key=>key.split('+').includes(cfg.pair));
  const alt=highLevelSpiritPlayer({level:210,job:'pactWarrior',pairKey});
  const index=pairKey.split('+').indexOf(cfg.pair);
  p.pets=[alt.pets[index]];p.activePetId=p.pets[0].id;p.secondaryPetId=null;
  p.petStances={[p.pets[0].id]:'assist'};
 }else{
  const stances=cfg.stance.split('-');
  p.petStances=Object.fromEntries(p.pets.map((pet,i)=>[pet.id,stances[i]]));
 }
 p.dawnSigil=8;p.autoEscapeBoss=false;p.location='dawnrift';
 if(cfg.stat!=='baseline'){
  const keys=cfg.stat.split('-').map(x=>x.toUpperCase());
  [p.attributes[keys[0]],p.attributes[keys[1]]]=[p.attributes[keys[1]],p.attributes[keys[0]]];
 }
 if(cfg.order==='main-first')p.autoSkills.order=[...p.autoSkills.order].reverse();
 assert.equal(Object.values(p.attributes).reduce((a,b)=>a+b-1,0),allocationBudget(210,true));
 assert.ok(Object.values(p.attributes).every(n=>n>=1&&n<=attributeCap(p)));
 assert.ok(p.gear.rightHand&&Object.values(p.gear).filter(Boolean).every(g=>g.level===200&&g.enhancement==='SSS'));
 assert.ok(p.pets.every(pet=>Object.values(pet.gear).filter(Boolean).every(g=>g.level===200&&g.enhancement==='SSS')));
 if(spirit)assert.equal(p.pets.length,2);
 return p;
}
async function run(cfg,seconds,runSeed){
 const player=createPlayer(cfg),coreBefore=player.bag.find(x=>x.id==='dawn_archon_core')?.qty||0;
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed:runSeed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('mixed201 timeout '+JSON.stringify(cfg))),110000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',e=>{clearTimeout(timer);reject(e);});
   worker.postMessage({player,now:epoch+seconds*1000});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total));
  return {cfg,seed:runSeed,seconds:s.simulated/1000,
   kills:s.kills,revives:s.revives||0,alive:result.player.hp>0,
   bossCores:(result.player.bag.find(x=>x.id==='dawn_archon_core')?.qty||0)-coreBefore,
   ownerDps:Math.round(d.player*1000/s.simulated),
   petDps:Math.round((d.pet1+d.pet2)*1000/s.simulated),
   totalDps:Math.round(d.total*1000/s.simulated)};
 }finally{await worker.terminate();}
}
const screen=[],best=[];
for(const job of Object.keys(SECOND_JOBS)){
 const candidates=variants(job),results=[];
 for(const v of candidates)results.push(await run({...v,stat:'baseline',order:'default'},90,seed));
 results.sort((a,b)=>b.totalDps-a.totalDps);
 const finalists=[];
 for(const result of results){if(!finalists.some(x=>x.cfg.pair===result.cfg.pair)){
  finalists.push(result.cfg);if(finalists.length===3)break;
 }}
 assert.equal(finalists.length,3);
 screen.push({job,candidates:candidates.length,top:results.slice(0,4).map(r=>({pair:r.cfg.pair,stance:r.cfg.stance,dps:r.totalDps,kills:r.kills,bossCores:r.bossCores}))});
 let winner=null,count=0;
 for(const f of finalists)for(const stat of stats)for(const order of orders){
  const r=await run({...f,stat,order},90,seed);count++;
  if(!winner||r.totalDps>winner.totalDps)winner=r;
 }
 const validations=[];
 for(const testSeed of [471122,93217,81733])validations.push(await run(winner.cfg,300,testSeed));
 const mean=k=>validations.reduce((sum,r)=>sum+r[k],0)/validations.length;
 const row={job,pair:winner.cfg.pair,stance:winner.cfg.stance,stat:winner.cfg.stat,order:winner.cfg.order,
  candidates:candidates.length,refinements:count,
  ownerDps:Math.round(mean('ownerDps')),petDps:Math.round(mean('petDps')),
  totalDps:Math.round(mean('totalDps')),kills5m:Number(mean('kills').toFixed(2)),
  bossCores:validations.reduce((n,r)=>n+r.bossCores,0),
  survival:validations.filter(r=>r.alive).length,revives:Number(mean('revives').toFixed(2)),
  seeds:validations.map(r=>({seed:r.seed,kills:r.kills,bossCores:r.bossCores,dps:r.totalDps,alive:r.alive}))};
 best.push(row);console.log(JSON.stringify({stage:'jobComplete',row}));
}
assert.equal(screen.length,12);assert.equal(best.length,12);
best.sort((a,b)=>b.totalDps-a.totalDps);
console.log(JSON.stringify({summary:true,ranking:best.map((r,i)=>({rank:i+1,...r}))}));
console.log(JSON.stringify({complete:true,jobs:12,legalFusionTypes:FUSION_TYPES.length,
 legalDualCombinations:DUAL_FUSION_TYPES.length,stage1:screen,
 limitations:'Bounded coordinate search of 6 single-fusion or 15 distinct dual-fusion combinations, top 3 pair profiles, 5 legal stat permutations, 2 skill priorities. Fixed mythic SSS gear/cards and default pet skills, no exhaustive weapon/card/affix/active-pet skill optimization. Random 201 map includes boss chance; bossCore counts show actual boss kills. DPS capped by enemy HP, not theoretical maximum.'}));
