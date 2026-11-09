// Actual 191-200 wild map with Lv170/180 gear; 201-210 with SSS only.
// Tests new spirit jobs without changing monsters, existing jobs or revival times.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {rollGear,rollPetGear} from '../dist/loot.js';
import {petStats} from '../dist/catalog.js';
import {rankOf} from '../dist/sky-trials.js';
const epoch=2000000000000,minutes=10,duration=minutes*60000,seeds=[471122,81733],rows=[];
function seeded(seed){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function equipLevel(p,level){
 const rng=seeded(20261103+level);
 for(const [slot,old]of Object.entries(p.gear)){
  if(!old)continue;
  const gear=rollGear(old.id,level,'mythic',rng);gear.uid='map-low-owner-'+slot;
  p.gear[slot]=gear;
 }
 for(const pet of p.pets)for(const [slot,old]of Object.entries(pet.gear)){
  if(!old)continue;
  const gear=rollPetGear(old.id,level,'mythic',rng);
  gear.uid='map-low-'+pet.id+'-'+slot;pet.gear[slot]=gear;
 }
 for(const pet of p.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;}
}
for(const level of [200,210])
 for(const gearLevel of (level===200?[170,180]:[200]))
 for(const job of ['pactWarrior','spiritCommander'])
 for(const pairKey of ['attack-defense+attack-magic','attack-magic+defense-support'])
 for(const seed of seeds){
 const p=highLevelSpiritPlayer({level,job,pairKey,gearRarity:'mythic'});
 if(level===200)equipLevel(p,gearLevel);
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const gear=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(gear.length,16);
 assert.ok(gear.every(g=>g.level===gearLevel&&rankOf(g)===(level===210?'SSS':null)));
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('under-level map Worker timeout '+level+' '+job+' '+gearLevel)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary;assert.ok(s?.simulated>0);
  const row={level,map:level===200?'worldroot':'dawnrift',gearLevel,
   enhancement:level===210?'SSS':'none',job,pairKey,seed,
   simulatedMinutes:Number((s.simulated/60000).toFixed(2)),reason:s.reason,
   alive:result.player.hp>0,petAlive:result.player.pets.filter(p=>p.hp>0).length,
   kills:s.kills,revives:s.revives||0,netGold:result.player.gold-p.gold,
   actualHpDps:Math.round((s.damage?.total||0)/(s.simulated/1000))};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,24);
for(const level of [200,210])for(const gearLevel of (level===200?[170,180]:[200]))for(const job of ['pactWarrior','spiritCommander']){
 const group=rows.filter(r=>r.level===level&&r.gearLevel===gearLevel&&r.job===job);
 console.log(JSON.stringify({summary:true,level,gearLevel,job,scenarios:group.length,
  alive:group.filter(r=>r.alive).length,noRevives:group.filter(r=>r.revives===0).length,
  meanKills:Number((group.reduce((n,r)=>n+r.kills,0)/group.length).toFixed(2))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitation:'Synthetic mythic rank, 200 unenhanced Lv170/180 gear, 210 strictly Lv200 SSS gear; two seeds, two pet pairings, 10 minutes per field run.'}));
