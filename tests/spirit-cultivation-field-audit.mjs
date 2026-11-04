// Real 201 field audit for low / mythic / SSS+sigil8 cultivation.
// Fixed skills, fusion and stats. No claim of theoretical best build or boss-only DPS.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {rollGear,rollPetGear} from '../dist/loot.js';
import {spiritCultivationMultiplier} from '../dist/spirit-cultivation.js';
const epoch=2000000000000,seeds=[471122,93217],duration=90;
const stages=[
 {id:'low',rarity:'common',enhancement:null,sigil:0,cards:false},
 {id:'mythic',rarity:'mythic',enhancement:null,sigil:0,cards:true},
 {id:'max',rarity:'mythic',enhancement:'SSS',sigil:8,cards:true}
];
const roles=['pactWarrior','spiritCommander'];
const repeatable=()=>.65;
function playerFor(job,stage){
 const p=comparisonPlayer({level:210,job});
 p.autoEscapeBoss=false;p.location='dawnrift';p.dawnSigil=stage.sigil;
 for(const [slot,old] of Object.entries(p.gear)){
  if(!old)continue;
  const gear=rollGear(old.id,200,stage.rarity,repeatable);
  gear.uid=old.uid;gear.enhancement=stage.enhancement;
  p.gear[slot]=gear;
 }
 for(const pet of p.pets){
  for(const [slot,old] of Object.entries(pet.gear||{})){
   if(!old)continue;
   const gear=rollPetGear(old.id,200,stage.rarity,repeatable);
   gear.uid=old.uid;gear.enhancement=stage.enhancement;
   pet.gear[slot]=gear;
  }
 }
 if(!stage.cards)for(const slot of Object.keys(p.sockets))p.sockets[slot]=null;
 if(job==='pactWarrior')p.petStances=Object.fromEntries(p.pets.map(pet=>[pet.id,'assimilate']));
 const equipped=[...Object.values(p.gear),...p.pets.flatMap(pet=>Object.values(pet.gear||{}))].filter(Boolean);
 assert.ok(equipped.length>=10&&equipped.every(g=>g.level===200&&g.rarity===stage.rarity&&g.enhancement===stage.enhancement));
 if(roles.includes(job))assert.equal(p.pets.length,2);
 return p;
}
async function simulate(job,stage,seed){
 const player=playerFor(job,stage);
 const cultivation=roles.includes(job)?spiritCultivationMultiplier(player,player.pets):null;
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('cultivation audit timeout '+job+' '+stage.id)),95000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',reject);
   worker.postMessage({player,now:epoch+duration*1000});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s?.simulated>0&&Number.isFinite(d?.total),'missing real Worker DPS '+job+' '+stage.id);
  return {job,stage:stage.id,seed,cultivation,kills:s.kills,dps:d.total*1000/s.simulated,
   ownerDps:d.player*1000/s.simulated,petDps:(d.pet1+d.pet2)*1000/s.simulated,alive:result.player.hp>0};
 }finally{await worker.terminate();}
}
const output=[];
for(const stage of stages){
 const rows=[];
 for(const job of ALL_COMPARISON_JOBS){
  const runs=await Promise.all(seeds.map(seed=>simulate(job,stage,seed)));
  const avg=key=>runs.reduce((n,r)=>n+r[key],0)/runs.length;
  rows.push({job,stage:stage.id,dps:Math.round(avg('dps')),kills:avg('kills'),
   ownerDps:Math.round(avg('ownerDps')),petDps:Math.round(avg('petDps')),
   cultivation:runs[0].cultivation,alive:runs.filter(r=>r.alive).length});
 }
 rows.sort((a,b)=>b.dps-a.dps);
 const ranked=rows.map((row,i)=>({...row,rank:i+1}));
 output.push({stage:stage.id,ranking:ranked});
 console.log(JSON.stringify({stageComplete:true,stage:stage.id,ranking:ranked}));
}
for(const job of roles){
 const history=output.map(stage=>stage.ranking.find(row=>row.job===job));
 console.log(JSON.stringify({cultivationCurve:true,job,history}));
 assert.ok(history[0].cultivation<history[1].cultivation&&history[1].cultivation<history[2].cultivation);
 assert.ok(history[2].dps>history[0].dps,'full cultivation must outperform weak gear for '+job);
}
console.log(JSON.stringify({complete:true,comparison:'12 professions, 3 equipment stages, 2 fixed seeds, 90 seconds of actual 201-map Worker combat',limitations:'Fixed non-optimized fusion/build and random boss exposure; ranks are observed under matched-stage gear, not absolute maximum.'}));
