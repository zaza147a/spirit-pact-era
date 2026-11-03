// Lower-investment 200 five-boss pressure test using the real offline Worker.
// Observational only: 200 trial is explicitly expected to need equipment enhancement.
// No monster or existing class modification.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {TRIAL_ROUTES,rankOf} from '../dist/sky-trials.js';
const epoch=2000000000000,duration=20*60000,seeds=[471122,81733],rows=[];
const route=TRIAL_ROUTES.find(r=>r.map==='worldroot');
assert.ok(route&&route.level===191);
for(const job of ['pactWarrior','spiritCommander'])
 for(const rarity of ['legendary','mythic'])
 for(const enhancement of [null,'S','SS'])
 for(const pairKey of ['attack-magic+attack-magic','attack-magic+defense-support'])
 for(const seed of seeds){
 const p=highLevelSpiritPlayer({level:200,job,pairKey,gearRarity:rarity});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const equipped=[...Object.values(p.gear).filter(Boolean),...p.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(equipped.length,16);
 for(const gear of equipped){
  assert.equal(gear.rarity,rarity);assert.equal(gear.level,200);
  if(enhancement)gear.enhancement=enhancement;else delete gear.enhancement;
  assert.equal(rankOf(gear),enhancement);
 }
 p.trialClears={...p.trialClears,worldroot:1};
 p.trialRun={map:'worldroot',index:0,nextAt:epoch+1000,continuous:true,round:2,stopAfterRound:true,
  checkpoint:{version:1,at:epoch,enemies:[],timers:{},jobSkillTimers:{},petSkillTimers:{},
   petEffects:{},classBuffs:{},casting:null,controlEffect:null,petShield:0,shield:0}};
 p.location='worldroot';p.offline={at:epoch,enabled:true};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('low gear five boss timeout '+job+' '+rarity+' '+enhancement)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });worker.on('error',reject);
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary;
  assert.ok(s?.simulated>0&&Number.isFinite(s.damage?.total));
  const clears=Math.max(0,(result.player.trialClears?.worldroot||0)-1);
  const row={job,level:200,rarity,enhancement:enhancement||'none',pairKey,seed,
   wallMs:Math.round(performance.now()-start),passedFive:clears>0,
   bossesKilled:s.kills,revives:s.revives||0,reason:s.reason,
   actualHpDps:Math.round(s.damage.total/(s.simulated/1000))};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,48);
for(const job of ['pactWarrior','spiritCommander'])for(const rarity of ['legendary','mythic'])
 for(const enhancement of ['none','S','SS']){
 const group=rows.filter(r=>r.job===job&&r.rarity===rarity&&r.enhancement===enhancement);
 console.log(JSON.stringify({summary:true,job,rarity,enhancement,scenarios:group.length,
  passedFive:group.filter(r=>r.passedFive).length,meanBossesKilled:Number((group.reduce((n,r)=>n+r.bossesKilled,0)/group.length).toFixed(2))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitations:'Synthetic prior-clear checkpoint (not first unlock), legal mythic or legendary gear with none/S/SS equipment on both character and pets; 200 only, two seeds and two pet pairings.'}));
