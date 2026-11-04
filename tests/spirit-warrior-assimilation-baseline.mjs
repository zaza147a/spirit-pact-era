// Real Worker audit of the existing Pact Warrior assimilation stances before rebalance.
// Measures whether owner damage becomes dominant instead of assuming assist-only fixtures.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
const duration=60000,epoch=2000000000000,seeds=[471122,81733,93217];
const profiles={bothAssist:['assist','assist'],oneAssimilate:['assimilate','assist'],bothAssimilate:['assimilate','assimilate']};
const rows=[];
for(const level of [200,210])for(const [profile,stances] of Object.entries(profiles))
 for(const seed of seeds){
  const p=comparisonPlayer({level,job:'pactWarrior'});
  p.petStances=Object.fromEntries(p.pets.map((pet,i)=>[pet.id,stances[i]]));
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
   {type:'module',workerData:{seed}});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('assimilation worker timeout')),45000);
    worker.on('message',msg=>{
     if(msg.type==='result'){clearTimeout(timer);resolve(msg.result);}
     if(msg.type==='error'){clearTimeout(timer);reject(Error(msg.stack||msg.message));}
    });
    worker.on('error',err=>{clearTimeout(timer);reject(err);});
    worker.postMessage({player:p,now:epoch+duration});
   });
   const s=result.summary,d=s.damage;
   assert.equal(s.simulated,duration);
   assert.ok(Number.isFinite(d.total)&&d.total>=0);
   rows.push({level,profile,seed,kills:s.kills,revives:s.revives||0,
    ownerDps:Math.round(d.player*1000/duration),petDps:Math.round((d.pet1+d.pet2)*1000/duration),
    totalDps:Math.round(d.total*1000/duration),
    ownerSharePct:d.total>0?100*d.player/d.total:0});
  }finally{await worker.terminate();}
 }
assert.equal(rows.length,18);
for(const level of [200,210]){
 const out=Object.keys(profiles).map(profile=>{
  const group=rows.filter(r=>r.level===level&&r.profile===profile);
  const mean=key=>Math.round(group.reduce((sum,x)=>sum+x[key],0)/group.length*100)/100;
  return {profile,ownerDps:mean('ownerDps'),petDps:mean('petDps'),
   totalDps:mean('totalDps'),ownerSharePct:mean('ownerSharePct'),
   kills:mean('kills'),revives:mean('revives')};
 });
 console.log(JSON.stringify({summary:true,level,profiles:out}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,
 limitation:'Pre-rebalance existing assist/assimilate mechanic, fixed synthetic mythic gear, no boss.'}));
