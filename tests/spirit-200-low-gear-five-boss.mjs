// Lv200 trial uses Lv200 equipment: legendary (survival control) versus mythic (enhancement controls).
// New classes only; the original trial enemies and revival timers are unchanged.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {rollGear,rollPetGear} from '../dist/loot.js';
import {petStats} from '../dist/catalog.js';
import {TRIAL_ROUTES,rankOf} from '../dist/sky-trials.js';
const epoch=2000000000000,duration=20*60000,seeds=[471122,81733],rows=[];
const route=TRIAL_ROUTES.find(r=>r.map==='worldroot');
assert.ok(route&&route.level===191);
function seeded(seed){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function equipAtLevel(p,level,rarity,rank){
 const rng=seeded(811229+level);
 for(const [slot,old] of Object.entries(p.gear)){
  if(!old)continue;
  const gear=rollGear(old.id,level,rarity,rng);
  gear.uid='lower-level-owner-'+slot;
  if(rank)gear.enhancement=rank;
  p.gear[slot]=gear;
 }
 for(const pet of p.pets)for(const [slot,old]of Object.entries(pet.gear)){
  if(!old)continue;
  const gear=rollPetGear(old.id,level,rarity,rng);
  gear.uid='lower-level-'+pet.id+'-'+slot;
  if(rank)gear.enhancement=rank;
  pet.gear[slot]=gear;
 }
 for(const pet of p.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;}
 const gear=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(gear.length,16);
 assert.ok(gear.every(item=>item.level===level&&item.rarity===rarity&&rankOf(item)===rank));
 return gear.length;
}
for(const job of ['pactWarrior','spiritCommander'])
 for(const {rarity,enhancement} of [{rarity:'legendary',enhancement:null},{rarity:'mythic',enhancement:null},{rarity:'mythic',enhancement:'SS'}])
 for(const pairKey of ['attack-defense+attack-magic','attack-magic+defense-support'])
 for(const seed of seeds){
 const gearLevel=200;
 const p=highLevelSpiritPlayer({level:200,job,pairKey,gearRarity:rarity});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const gearCount=equipAtLevel(p,gearLevel,rarity,enhancement);
 p.trialClears={...p.trialClears,worldroot:1};
 p.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,stopAfterRound:true,
  checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},
   petEffects:{},classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
 p.location='worldroot';p.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('under-level gear five boss timeout '+job+' '+gearLevel+' '+enhancement)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary;
  assert.ok(s?.simulated>0&&Number.isFinite(s.damage?.total));
  const clears=Math.max(0,(result.player.trialClears?.worldroot||0)-1);
  const row={job,level:200,map:'worldroot',gearLevel,rarity,enhancement:enhancement||'none',pairKey,seed,gearCount,
   wallMs:Math.round(performance.now()-start),passedFive:clears>0,
   bossesKilled:s.kills,revives:s.revives||0,reason:s.reason,
   actualHpDps:Math.round(s.damage.total/(s.simulated/1000))};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,24);
for(const job of ['pactWarrior','spiritCommander'])
 for(const {rarity,enhancement} of [{rarity:'legendary',enhancement:'none'},{rarity:'mythic',enhancement:'none'},{rarity:'mythic',enhancement:'SS'}]){
 const group=rows.filter(r=>r.job===job&&r.rarity===rarity&&r.enhancement===enhancement);
 console.log(JSON.stringify({summary:true,job,gearLevel:200,rarity,enhancement,scenarios:group.length,
  passedFive:group.filter(r=>r.passedFive).length,
  meanBossesKilled:Number((group.reduce((n,r)=>n+r.bossesKilled,0)/group.length).toFixed(2))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitations:'Only Lv200 gear for Lv200 five-boss trial; legendary unenhanced checks for excessive survival; mythic none/SS controls; two seeds, two legal pet pairings; synthetic previously-cleared trial checkpoint. Lv170/180 unenhanced gear is tested only on 191-200 wild maps.'}));
