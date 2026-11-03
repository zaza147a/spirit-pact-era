// 191-200 trial under actual Lv170 and Lv180 gear, rather than Lv200 gear.
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
function equipAtLevel(p,level,rank){
 const rng=seeded(811229+level);
 for(const [slot,old] of Object.entries(p.gear)){
  if(!old)continue;
  const gear=rollGear(old.id,level,'mythic',rng);
  gear.uid='lower-level-owner-'+slot;
  if(rank)gear.enhancement=rank;
  p.gear[slot]=gear;
 }
 for(const pet of p.pets)for(const [slot,old]of Object.entries(pet.gear)){
  if(!old)continue;
  const gear=rollPetGear(old.id,level,'mythic',rng);
  gear.uid='lower-level-'+pet.id+'-'+slot;
  if(rank)gear.enhancement=rank;
  pet.gear[slot]=gear;
 }
 for(const pet of p.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;}
 const gear=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(gear.length,16);
 assert.ok(gear.every(item=>item.level===level&&item.rarity==='mythic'&&rankOf(item)===rank));
 return gear.length;
}
for(const job of ['pactWarrior','spiritCommander'])
 for(const gearLevel of [170,180])
 for(const enhancement of [null,'S','SS'])
 for(const pairKey of ['attack-defense+attack-magic','attack-magic+defense-support'])
 for(const seed of seeds){
 const p=highLevelSpiritPlayer({level:200,job,pairKey,gearRarity:'mythic'});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const gearCount=equipAtLevel(p,gearLevel,enhancement);
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
  const row={job,level:200,map:'worldroot',gearLevel,enhancement:enhancement||'none',pairKey,seed,gearCount,
   wallMs:Math.round(performance.now()-start),passedFive:clears>0,
   bossesKilled:s.kills,revives:s.revives||0,reason:s.reason,
   actualHpDps:Math.round(s.damage.total/(s.simulated/1000))};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,48);
for(const job of ['pactWarrior','spiritCommander'])for(const gearLevel of [170,180])
 for(const enhancement of ['none','S','SS']){
 const group=rows.filter(r=>r.job===job&&r.gearLevel===gearLevel&&r.enhancement===enhancement);
 console.log(JSON.stringify({summary:true,job,gearLevel,enhancement,scenarios:group.length,
  passedFive:group.filter(r=>r.passedFive).length,
  meanBossesKilled:Number((group.reduce((n,r)=>n+r.bossesKilled,0)/group.length).toFixed(2))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitations:'Level 200 jobs with actual Lv170/180 mythic player and pet equipment, unenhanced/S/SS; synthetic previously-cleared trial checkpoint, two seeds and two pet pairings; 210 zones always retain SSS and are tested separately.'}));
