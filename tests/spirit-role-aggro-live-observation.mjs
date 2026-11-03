// Real production offline Worker: verify owner-only Pact aggro vs Commander three-lane aggro.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {comparisonPlayer} from './fixtures/spirit-vs-class-player.mjs';
const epoch=2000000000000,duration=180000,seeds=[471122,81733,93217],rows=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])for(const seed of seeds){
 const player=comparisonPlayer({level,job});
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('spirit aggro timeout '+job+' '+level+' '+seed)),45000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',reject);
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary,t=s?.spiritEnemyTargets;
  assert.ok(s?.simulated>0&&t&&Number.isInteger(t.owner)&&Number.isInteger(t.pet1)&&Number.isInteger(t.pet2));
  assert.ok(t.owner+t.pet1+t.pet2>0);
  if(job==='pactWarrior'){
   assert.equal(t.pet1,0,'assimilating Pact first pet must take no direct enemy aggro');
   assert.equal(t.pet2,0,'assimilating Pact assisting pet must take no direct enemy aggro');
  }else{
   assert.ok(t.owner>0,'Commander owner must be targeted');
   assert.ok(t.pet1>0&&t.pet2>0,'Both commander pets must take enemy targets');
   // Aggregate per-route exposure is audited after all seeds, including pet downtime.
  }
  const row={level,job,seed,simulatedMs:s.simulated,targets:t,kills:s.kills,
   revives:s.revives||0,ownerAlive:result.player.hp>0,
   pet1Alive:result.player.pets[0].hp>0,pet2Alive:result.player.pets[1].hp>0};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,12);
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const group=rows.filter(r=>r.level===level&&r.job===job);
 const sum=key=>group.reduce((n,r)=>n+r.targets[key],0);
 if(job==='spiritCommander')assert.ok((sum('pet1')+sum('pet2'))/(sum('owner')+sum('pet1')+sum('pet2'))>=.15,'Commander three-way aggro must survive sustained combat');
 console.log(JSON.stringify({summary:true,level,job,seeds:group.length,ownerTargets:sum('owner'),
  pet1Targets:sum('pet1'),pet2Targets:sum('pet2'),
  totalTargets:sum('owner')+sum('pet1')+sum('pet2')}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,limitation:'Enemy direct-hit target counts from actual Worker, not damage split or revival timing; fixed legal gear.'}));
