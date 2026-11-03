import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {allocationBudget} from '../dist/growth-v5.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {canonicalDualFusionKey} from '../dist/spirit-job-rules.js';

for(const job of ['pactWarrior','spiritCommander'])for(const level of [200,210]){
 const player=highLevelSpiritPlayer({level,job});
 const points=Object.values(player.attributes).reduce((sum,value)=>sum+value-1,0);
 assert.equal(points,allocationBudget(level,true));
 assert.ok(Object.values(player.attributes).every(value=>value>=1&&value<=attributeCap(player)));
 assert.equal(player.pets.length,2);
 assert.ok(canonicalDualFusionKey(...player.pets),'two genuinely fused pets required');
 assert.equal(player.pets[0].level,200);assert.equal(player.pets[1].level,200);
 assert.ok(Object.values(player.gear).filter(Boolean).every(g=>g.enhancement==='SSS'&&g.level===200));
 assert.ok(player.pets.every(pet=>Object.values(pet.gear).every(g=>g.enhancement==='SSS')));
 assert.equal(player.tacticEffect,undefined,'manual tactics excluded from balance');
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=20261103&clock=2000000000000',import.meta.url),{type:'module'});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('high-level worker timeout '+job+' '+level)),30000);
   worker.on('message',message=>{
    if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
    else if(message.type==='error'){clearTimeout(timeout);reject(Error(message.message));}
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player,now:2000000000000+10000});
  });
  assert.ok(result.summary,'production worker must accept high-level fixture');
  assert.ok(result.summary.simulated>0,'production worker actually simulates');
  assert.equal(result.player.job,job);
  assert.equal(result.player.level,level);
  assert.equal(result.player.pets.length,2);
  assert.ok(result.summary.damage&&Number.isFinite(result.summary.damage.total));
  console.log(JSON.stringify({job,level,simulatedMs:result.summary.simulated,reason:result.summary.reason,
   kills:result.summary.kills,damage:result.summary.damage}));
 }finally{await worker.terminate();}
}
console.log('All four synthetic high-level fusion Worker fixtures accepted.');
