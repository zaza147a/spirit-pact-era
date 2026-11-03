// Real offline Worker: level-200 five-boss trial, mythic no-enhancement vs SS.
// A synthetic previously-cleared trial checkpoint is used to exercise the actual
// continuous trial combat engine. Does not claim an ordinary first-run unlock.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {TRIAL_ROUTES,rankOf} from '../dist/sky-trials.js';
const epoch=2000000000000,duration=20*60000,seed=471122,rows=[];
const route=TRIAL_ROUTES.find(r=>r.map==='worldroot');
assert.ok(route&&route.level===191);
for(const job of ['pactWarrior','spiritCommander'])for(const {enhancement,pairKey} of [
 {enhancement:null,pairKey:'attack-magic+defense-support'},
 {enhancement:'SS',pairKey:'attack-magic+defense-support'},
 {enhancement:'SS',pairKey:'attack-magic+attack-defense'},
 {enhancement:'SS',pairKey:'attack-defense+magic-support'}]){
 const p=highLevelSpiritPlayer({level:200,job,pairKey,gearRarity:'mythic'});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const equipped=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(equipped.length,16);
 for(const g of equipped){
  assert.equal(g.rarity,'mythic');assert.equal(g.level,200);
  if(enhancement)g.enhancement=enhancement;
  else delete g.enhancement;
  assert.equal(rankOf(g),enhancement);
 }
 // Normalization requires one prior clear and a well-formed real checkpoint.
 p.trialClears={...p.trialClears,worldroot:1};
 p.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,
  stopAfterRound:true,
  checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},
   petEffects:{},classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
 p.location='worldroot';
 p.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('five-boss real Worker timeout '+job+' '+enhancement)),120000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary;assert.ok(s&&s.simulated>0&&Number.isFinite(s.damage?.total));
  const rounds=Math.max(0,(result.player.trialClears?.worldroot||0)-1);
  const row={level:200,job,enhancement:enhancement||'none',pairKey,seed,gearCount:equipped.length,
   wallMs:Math.round(performance.now()-start),simulatedMs:s.simulated,reason:s.reason,
   trialRounds:s.trialRounds||0,clearedFullFive:rounds>0,clears:rounds,
   kills:s.kills,revives:s.revives||0,alive:result.player.hp>0,
   actualHpDps:Math.round(s.damage.total/(s.simulated/1000)),
   trialStillActive:!!result.player.trialRun};
  assert.ok(Number.isFinite(row.actualHpDps));
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,8);
console.log(JSON.stringify({summary:true,scenarios:8,results:rows,
 limitation:'Synthetic already-unlocked continuous trial checkpoint; 200 mythic Lv200 gear and pets, none vs SS only; three SS fusion pairings and one unenhanced control per class, one seed, not optimized and not an assertion that all jobs must clear.'}));
