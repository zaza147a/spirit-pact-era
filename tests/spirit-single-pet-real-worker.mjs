// The production offline Worker performs encounter spawning, attacks, potions and revival.
// This is a short integration smoke, not a maximum-DPS optimization or 5-boss trial.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {rollGear} from '../dist/loot.js';

const start=2000000000000,elapsed=120000;
async function simulate(job,level){
 const player=highLevelSpiritPlayer({job,level});
 player.pets=player.pets.slice(0,1);
 player.activePetId=player.pets[0].id;
 player.secondaryPetId=null;
 player.petStances={[player.activePetId]:job==='pactWarrior'?'assimilate':'assist'};
 player.gear.rightHand=rollGear('staffSword',200,'mythic',()=>.25);
 if(level===210)player.gear.rightHand.enhancement='SSS';
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs',import.meta.url),{type:'module',workerData:{seed:21000+level+(job==='pactWarrior'?1:2)}});
 try{
  return await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error(`Worker timeout: ${job} ${level}`)),30000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    else if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player,now:start+elapsed});
  });
 }finally{await worker.terminate();}
}

for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const result=await simulate(job,level);
 assert.ok(result.summary?.simulated>0,`${job} ${level} must actually simulate combat`);
 assert.equal(result.player.job,job);
 assert.equal(result.player.pets.length,1);
 assert.equal(result.player.secondaryPetId,null);
 const targets=result.summary.spiritEnemyTargets||{};
 assert.ok((targets[job==='pactWarrior'?'owner':'pet1']||0)>0,'must face actual incoming attacks');
 assert.equal(targets[job==='pactWarrior'?'pet1':'owner']||0,0,'fixed aggro must not leak to opposite party');
 assert.equal(targets.pet2||0,0,'removed second pet must never receive attacks');
 assert.equal(result.summary.damage.pet2||0,0,'removed second pet must never deal damage');
 if(job==='pactWarrior')assert.equal(result.summary.damage.pet1||0,0,'assimilated pet never deals damage');
 if(job==='spiritCommander')assert.ok(result.summary.damage.pet1>result.summary.damage.player,'companion is the primary damage source');
 console.log(JSON.stringify({job,level,simulatedMs:result.summary.simulated,
  reason:result.summary.reason,kills:result.summary.kills,damage:result.summary.damage,
  targets,playerHp:result.player.hp,petHp:result.player.pets[0].hp,
  potions:result.summary.potions,revives:result.summary.revives}));
}
