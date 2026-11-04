// Compare unchanged legacy classes and spirit jobs on 191-200 using real Lv170/180 gear.
// Every test runs the same production offline Worker. Monsters and job formulas remain untouched.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {ALL_COMPARISON_JOBS,comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
import {rollGear,rollPetGear} from '../dist/loot.js';
import {petStats} from '../dist/catalog.js';
import {rankOf} from '../dist/sky-trials.js';
const epoch=2000000000000,duration=10*60000,seed=471122,rows=[];
function seeded(s){return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function lowerGear(p,level){
 const rng=seeded(10982+level);
 for(const [slot,old]of Object.entries(p.gear)){
  if(!old)continue;
  const gear=rollGear(old.id,level,'mythic',rng);gear.uid='legacy-control-'+p.job+'-'+slot;
  p.gear[slot]=gear;
 }
 for(const pet of p.pets)for(const [slot,old]of Object.entries(pet.gear)){
  if(!old)continue;
  const gear=rollPetGear(old.id,level,'mythic',rng);gear.uid='legacy-control-'+pet.id+'-'+slot;
  pet.gear[slot]=gear;
 }
 for(const pet of p.pets){pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;}
}
for(const gearLevel of [170,180])for(const job of ALL_COMPARISON_JOBS){
 const p=comparisonPlayer({job,level:200});
 lowerGear(p,gearLevel);
 const gear=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.ok(gear.length>0&&gear.every(g=>g.level===gearLevel&&g.rarity==='mythic'&&rankOf(g)===null));
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('legacy underlevel timeout '+job+' '+gearLevel)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary;assert.ok(s?.simulated>0&&s.damage);
  const row={job,gearLevel,level:200,seed,petCount:p.pets.length,gearCount:gear.length,
   simulatedMinutes:Number((s.simulated/60000).toFixed(2)),alive:result.player.hp>0,
   revives:s.revives||0,kills:s.kills,reason:s.reason,
   actualHpDps:Math.round(s.damage.total/(s.simulated/1000))};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,ALL_COMPARISON_JOBS.length*2);
for(const gearLevel of [170,180])console.log(JSON.stringify({summary:true,gearLevel,rows:rows.filter(r=>r.gearLevel===gearLevel)}));
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitations:'One seed; 200 jobs in 191-200 field map with actual unenhanced mythic Lv170/180 player and pet gear. Legacy jobs use their unchanged native mechanics.'}));
