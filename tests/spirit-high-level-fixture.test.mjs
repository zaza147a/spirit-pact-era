import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {allocationBudget} from '../dist/growth-v5.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {canonicalDualFusionKey} from '../dist/spirit-job-rules.js';
import {gearTier,GEAR_BASE,PET_GEAR_BASE} from '../dist/loot.js';
import {rankOf} from '../dist/sky-trials.js';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

for(const job of ['pactWarrior','spiritCommander'])for(const level of [200,210]){
 const player=highLevelSpiritPlayer({level,job});
 const points=Object.values(player.attributes).reduce((sum,value)=>sum+value-1,0);
 assert.equal(points,allocationBudget(level,true));
 assert.ok(Object.values(player.attributes).every(value=>value>=1&&value<=attributeCap(player)));
 assert.equal(player.pets.length,2);
 assert.ok(canonicalDualFusionKey(...player.pets),'two genuinely fused pets required');
 assert.equal(player.pets[0].level,200);assert.equal(player.pets[1].level,200);
 const expectedEnhancement=level===210?'SSS':null;
 const allGear=[...Object.values(player.gear).filter(Boolean),...player.pets.flatMap(pet=>Object.values(pet.gear).filter(Boolean))];
 assert.equal(allGear.length,16,'10 owner slots and 3 per fused pet');
 assert.ok(allGear.every(g=>g.level===200&&g.tier===gearTier(200)&&g.rarity==='mythic'));
 assert.ok(allGear.every(g=>rankOf(g)===expectedEnhancement),'wilderness 200 must not use enhancements; dawn 210 uses SSS');
 assert.ok(allGear.every(g=>Object.keys(g.affixes||{}).length===6),'mythic equipment has five regular and one special affix');
 assert.equal(player.dawnSigil,0,'no farmed dawn sigil at the initial balance baseline');
 assert.equal(player.autoEscapeBoss,level===210,'dawn wilderness farm must be separate from unprepared archon attack');
 assert.deepEqual(player.cards,[]); // all ten owned cards are slotted, not duplicated in bag
 assert.equal(Object.values(player.sockets).filter(Boolean).length,10);
 for(const [slot,id] of Object.entries(player.sockets)){
  assert.ok(cardAllowedInSlot(CARDS[id],slot),'slot restriction '+slot);
  assert.ok(/^world_19[1-9]$|^world_200$/.test(id),'only obtainable 191-200 normal cards');
 }
 assert.ok(Object.values(player.gear).filter(Boolean).every(g=>!GEAR_BASE[g.id]?.jobs||GEAR_BASE[g.id].jobs.includes(job)));
 assert.ok(player.pets.every(pet=>Object.values(pet.gear).every(g=>!!PET_GEAR_BASE[g.id])));
 assert.equal(player.tacticEffect,undefined,'manual tactics excluded from balance');
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=20261103&clock=2000000000000',import.meta.url),{type:'module'});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('high-level worker timeout '+job+' '+level)),30000);
   worker.on('message',message=>{
    if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
    else if(message.type==='error'){clearTimeout(timeout);reject(Error(message.stack||message.message));}
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
  assert.ok(result.summary.damage.resonance>0,'third-job fused pets must trigger real dual resonance HP damage');
  assert.ok(result.summary.damage.pet1>0&&result.summary.damage.pet2>0,'both fused pets must deal damage');
  console.log(JSON.stringify({job,level,simulatedMs:result.summary.simulated,reason:result.summary.reason,
   kills:result.summary.kills,damage:result.summary.damage}));
 }finally{await worker.terminate();}
}
console.log('All four synthetic high-level fusion Worker fixtures accepted.');
