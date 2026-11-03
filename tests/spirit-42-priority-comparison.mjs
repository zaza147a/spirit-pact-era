// Full 30-route dual-spirit priority A/B, 210 mythic SSS, 2 independent seeds.
// This is an observational production Worker study; no tactical or balance writes.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000,duration=60000,seeds=[471122,93217],level=210;
const jobs=['pactWarrior','spiritCommander'];
const profiles={baseline:['thirdStance_','thirdUtility_','thirdWide_','thirdFinish_','thirdMain_'],
 mainFirst:['thirdMain_','thirdFinish_','thirdWide_','thirdStance_','thirdUtility_']};
const rows=[];
for(const job of jobs)for(const pairKey of DUAL_FUSION_TYPES)for(const seed of seeds)
 for(const [priority,order] of Object.entries(profiles)){
  const player=highLevelSpiritPlayer({level,job,pairKey,gearRarity:'mythic'});
  player.autoSkills={version:2,disabled:[],order:order.map(prefix=>prefix+job)};
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
   {type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('30-route priority Worker timeout: '+job+' '+pairKey)),45000);
    worker.on('message',msg=>{
     if(msg.type==='result'){clearTimeout(timer);resolve(msg.result);}
     if(msg.type==='error'){clearTimeout(timer);reject(Error(msg.stack||msg.message));}
    });
    worker.on('error',error=>{clearTimeout(timer);reject(error);});
    worker.postMessage({player,now:epoch+duration});
   });
   const s=result.summary,d=s?.damage;
   assert.ok(s&&d&&s.simulated>0,'actual combat summary');
   assert.ok(s.skillCasts&&Number.isFinite(d.total)&&d.total>=0,'accepted cast metrics');
   assert.equal(result.player.pets.length,2);
   const main=s.skillCasts['thirdMain_'+job]||0;
   const others=Object.entries(s.skillCasts).filter(([id])=>id!=='thirdMain_'+job).reduce((v,[,n])=>v+n,0);
   rows.push({job,pairKey,priority,seed,simulatedMs:s.simulated,kills:s.kills,
    revives:s.revives||0,alive:result.player.hp>0,mainCasts:main,otherCasts:others,
    resonanceActivations:s.resonanceActivations||0,totalDamage:d.total,
    totalDps:Math.round(d.total*1000/s.simulated),ownerDps:Math.round(d.player*1000/s.simulated),
    petDps:Math.round((d.pet1+d.pet2)*1000/s.simulated)});
  }finally{await worker.terminate();}
 }
assert.equal(rows.length,120);
for(const job of jobs){
 const pairs=[];
 for(const pairKey of DUAL_FUSION_TYPES){
  const v=rows.filter(r=>r.job===job&&r.pairKey===pairKey);
  assert.equal(v.length,4);
  const summary=priority=>{
   const subset=v.filter(r=>r.priority===priority);
   const mean=k=>Math.round(subset.reduce((sum,r)=>sum+r[k],0)/subset.length*100)/100;
   return {dps:mean('totalDps'),kills:mean('kills'),revives:mean('revives'),
    mainCasts:mean('mainCasts'),otherCasts:mean('otherCasts'),
    resonanceActivations:mean('resonanceActivations'),petDps:mean('petDps'),
    aliveCount:subset.filter(x=>x.alive).length};
  };
  const baseline=summary('baseline'),mainFirst=summary('mainFirst');
  const deltaPct=baseline.dps>0?Math.round((mainFirst.dps/baseline.dps-1)*10000)/100:null;
  pairs.push({pairKey,baseline,mainFirst,deltaPct});
 }
 const winners={mainFirst:pairs.filter(x=>x.deltaPct>0).length,
  baseline:pairs.filter(x=>x.deltaPct<0).length,tied:pairs.filter(x=>x.deltaPct===0).length};
 console.log(JSON.stringify({summary:true,job,level,pairs:15,seeds,winners,
  rows:pairs.sort((a,b)=>b.deltaPct-a.deltaPct)}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,
 limitation:'60s fixed 210 mythic SSS synthetic field battle, two real RNG seeds, no boss, excludes farm investment and alternative skill schedules.'}));
