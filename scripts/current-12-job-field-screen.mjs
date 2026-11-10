// Stage 1 observational screen, NOT optimal class rankings or single-target DPS.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {currentEndgamePlayer,FUSIONS} from '../tests/fixtures/current-210-endgame-player.mjs';

const start=2_000_000_000_000,seconds=120,seed=20261110;
async function sample(job,fusion,weaponChoice){
 const p=currentEndgamePlayer(job,{fusion,weaponChoice});
 p.location='dawnrift';p.autoEscapeBoss=false;
 const worker=new Worker(new URL('../tests/offline-worker-node-entry.mjs?clock='+start,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const r=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error(`worker timeout ${job}/${fusion}/${weaponChoice}`)),120000);
   worker.on('message',message=>{
    if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
    if(message.type==='error'){clearTimeout(timeout);reject(Error(message.message));}
   });
   worker.on('error',reject);
   worker.postMessage({player:p,now:start+seconds*1000});
  });
  const s=r.summary;assert.ok(s?.simulated>0,job);
  const damage=s.damage||{},total=Number(damage.total)||0;
  return {job,fusion,weaponChoice,seed,seconds:s.simulated/1000,damage:total,
   dps:Math.round(total*1000/s.simulated),kills:s.kills||0,
   revives:s.revives||0,ownerHp:r.player.hp,petHp:r.player.pets[0]?.hp,
   ownerDamage:Number(damage.player)||0,petDamage:(Number(damage.pet1)||0)+(Number(damage.pet2)||0),
   targetHits:s.spiritEnemyTargets||{},reason:s.reason||null};
 }finally{await worker.terminate();}
}
const jobs=Object.keys(SECOND_JOBS),rows=[];
for(const job of jobs){
 for(const fusion of FUSIONS)for(const weaponChoice of ['critDmg','aspdPct']){
  const row=await sample(job,fusion,weaponChoice);rows.push(row);console.log(JSON.stringify(row));
 }
}
assert.equal(rows.length,144);
const result={type:'first-pass-only',date:'2026-11-10',conditions:'Lv210 full mythic SSS, sigil8, all homecoming complete, one SSS fused pet, boss cards, 6 owner affixes; all six unordered fusions and two weapon special affixes, but default weapon and one static legal attribute allocation; 120s real offline dawn field. NOT a best-build ranking; does not isolate single target or identify maximum incoming ATK.',rows};
writeFileSync('docs/current-12-job-field-screen-20261110.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({complete:true,rows:rows.length}));
