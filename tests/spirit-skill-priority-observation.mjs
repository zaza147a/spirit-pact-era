// Diagnostic only: does the auto-skill priority mask the spirit owner's actual contribution?
// Production offline Worker, 2 spirit jobs x 2 levels x 3 priorities x 3 RNG seeds.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';

const epoch=2000000000000,duration=60000,seeds=[471122,81733,93217];
const profiles={
 baseline:['thirdStance_','thirdUtility_','thirdWide_','thirdFinish_','thirdMain_'],
 mainFirst:['thirdMain_','thirdFinish_','thirdWide_','thirdStance_','thirdUtility_'],
 finishFirst:['thirdFinish_','thirdMain_','thirdWide_','thirdUtility_','thirdStance_']
};
const rows=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])
 for(const [priority,order] of Object.entries(profiles))for(const seed of seeds){
  const p=comparisonPlayer({level,job});
  p.autoSkills={version:2,disabled:[],order:order.map(prefix=>prefix+job)};
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
   {type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('priority worker timeout')),45000);
    worker.on('message',msg=>{
     if(msg.type==='result'){clearTimeout(timeout);resolve(msg.result);}
     if(msg.type==='error'){clearTimeout(timeout);reject(Error(msg.stack||msg.message));}
    });
    worker.on('error',err=>{clearTimeout(timeout);reject(err);});
    worker.postMessage({player:p,now:epoch+duration});
   });
   const s=result.summary,d=s.damage;
   assert.equal(s.simulated,duration,'full actual worker interval');
   assert.ok(Number.isFinite(d.player)&&Number.isFinite(d.total)&&d.total>0);
   rows.push({level,job,priority,seed,kills:s.kills,revives:s.revives||0,
    ownerDps:Math.round(d.player*1000/duration),petDps:Math.round((d.pet1+d.pet2)*1000/duration),
    resonanceDps:Math.round(d.resonance*1000/duration),totalDps:Math.round(d.total*1000/duration),
    ownerShare:Math.round(10000*d.player/d.total)/100});
  }finally{await worker.terminate();}
 }
assert.equal(rows.length,36);
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const group=rows.filter(r=>r.level===level&&r.job===job);
 const means=Object.keys(profiles).map(priority=>{
  const v=group.filter(r=>r.priority===priority);
  assert.equal(v.length,3);
  const avg=k=>Math.round(v.reduce((sum,r)=>sum+r[k],0)/v.length*100)/100;
  return {priority,meanOwnerDps:avg('ownerDps'),meanPetDps:avg('petDps'),
   meanResonanceDps:avg('resonanceDps'),meanTotalDps:avg('totalDps'),
   meanOwnerSharePct:avg('ownerShare'),meanKills:avg('kills'),meanRevives:avg('revives')};
 });
 console.log(JSON.stringify({summary:true,level,job,means}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,seeds,
 limitation:'Only priority order changes; synthetic fixed mythic equipment, no skill or item optimization.'}));
