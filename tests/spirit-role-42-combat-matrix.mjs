// All 42 dual-resonance routes, role-correct owner-led pact and pet-led commander.
// 15 pairs x (pact one/both assimilation + commander assist) x 200/210 x 2 seeds = 180 real Worker fights.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {DUAL_FUSION_TYPES,canonicalDualFusionKey} from '../dist/spirit-job-rules.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,duration=60000,seeds=[471122,93217],levels=[200,210];
const setups=[{job:'pactWarrior',stance:'oneAssimilate'},
 {job:'pactWarrior',stance:'bothAssimilate'},{job:'spiritCommander',stance:'bothAssist'}],rows=[];
for(const level of levels)for(const {job,stance} of setups)for(const pairKey of DUAL_FUSION_TYPES)
 for(const seed of seeds){
 const p=highLevelSpiritPlayer({level,job,pairKey,gearRarity:'mythic'});
 p.petStances=Object.fromEntries(p.pets.map((pet,i)=>
  [pet.id,job==='spiritCommander'?'assist':stance==='bothAssimilate'||i===0?'assimilate':'assist']));
 assert.equal(canonicalDualFusionKey(...p.pets),pairKey);
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('role matrix timeout '+job+' '+pairKey+' '+level)),45000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary,d=s.damage,sim=s.simulated;
  assert.ok(sim>0&&sim<=duration&&Number.isFinite(d.total),'real worker data');
  assert.equal(result.player.pets.length,2);
  assert.ok(s.skillCasts&&Object.values(s.skillCasts).every(x=>Number.isInteger(x)&&x>=0));
  rows.push({level,job,stance,pairKey,seed,simulatedMs:sim,kills:s.kills,revives:s.revives||0,
   alive:result.player.hp>0,completed:sim===duration&&s.reason==='已完成離線時間'&&result.player.hp>0,
   totalDps:Math.round(d.total*1000/sim),ownerDps:Math.round(d.player*1000/sim),
   petsDps:Math.round((d.pet1+d.pet2)*1000/sim),resonanceDps:Math.round(d.resonance*1000/sim),
   ownerSharePct:d.total>0?Math.round(d.player/d.total*10000)/100:0,
   resonanceActivations:s.resonanceActivations||0,
   otherSkillCasts:Object.entries(s.skillCasts).filter(([k])=>k!=='thirdMain_'+job).reduce((v,[,n])=>v+n,0)});
 }finally{await worker.terminate();}
}
assert.equal(rows.length,252);
for(const level of levels)for(const {job,stance} of setups){
 const group=rows.filter(x=>x.level===level&&x.job===job&&x.stance===stance);
 const aggregate=k=>Math.round(group.reduce((n,x)=>n+x[k],0)/group.length*100)/100;
 const pairs=DUAL_FUSION_TYPES.map(pairKey=>{
  const v=group.filter(x=>x.pairKey===pairKey);
  assert.equal(v.length,2,'independent seeded route');
  const avg=k=>Math.round(v.reduce((n,x)=>n+x[k],0)/v.length*100)/100;
  return {pairKey,ownerSharePct:avg('ownerSharePct'),ownerDps:avg('ownerDps'),
   petsDps:avg('petsDps'),totalDps:avg('totalDps'),kills:avg('kills'),
   revives:avg('revives'),resonanceActivations:avg('resonanceActivations'),
   otherSkillCasts:avg('otherSkillCasts'),cleanRuns:v.filter(x=>x.completed).length};
 });
 console.log(JSON.stringify({summary:true,level,job,stance,scenarios:group.length,
  meanOwnerSharePct:aggregate('ownerSharePct'),meanDps:aggregate('totalDps'),
  meanKills:aggregate('kills'),meanRevives:aggregate('revives'),
  ownerDominant:pairs.filter(p=>p.ownerDps>p.petsDps).length,
  petDominant:pairs.filter(p=>p.petsDps>p.ownerDps).length,
  zeroKillRoutes:pairs.filter(p=>p.kills===0).map(p=>p.pairKey),
  pairs}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,seeds,levels,
 limitations:'Synthetic but legal fixed mythic 200 unenhanced / 210 SSS, sigil 0, 60s 201 field without boss, two independent seeds; other jobs and five-boss trials tested separately.'}));
