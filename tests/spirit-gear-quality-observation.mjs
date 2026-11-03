// Production Worker observation of obtainable equipment rarity at fixed stages.
// This is a gear-sensitivity test, not randomized drop farming or an optimal DPS rank.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {rankOf} from '../dist/sky-trials.js';

const epoch=2000000000000,duration=60000;
const pairs=['attack-magic+attack-magic','attack-defense+magic-support','defense-support+defense-support'];
const rows=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])
 for(const gearRarity of ['common','legendary','mythic'])for(const pairKey of pairs){
  const player=highLevelSpiritPlayer({level,job,pairKey,gearRarity});
  const gear=[...Object.values(player.gear).filter(Boolean),...player.pets.flatMap(pet=>Object.values(pet.gear))];
  assert.equal(gear.length,16);
  assert.ok(gear.every(g=>g.rarity===gearRarity&&g.level===200&&rankOf(g)===(level===210?'SSS':null)));
  const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed=20261104&clock='+epoch,import.meta.url),{type:'module'});
  try{
   const result=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Worker timeout '+job+' '+level+' '+gearRarity+' '+pairKey)),45000);
    worker.on('message',message=>{
     if(message.type==='result'){clearTimeout(timeout);resolve(message.result);}
     if(message.type==='error'){clearTimeout(timeout);reject(Error(message.stack||message.message));}
    });
    worker.on('error',error=>{clearTimeout(timeout);reject(error);});
    worker.postMessage({player,now:epoch+duration});
   });
   const s=result.summary;
   assert.ok(s?.simulated>0&&s.damage?.total>=0);
   const row={level,job,gearRarity,pairKey,simulatedMs:s.simulated,reason:s.reason,
    alive:result.player.hp>0,revives:s.revives||0,kills:s.kills,
    resonanceActivations:s.resonanceActivations||0,
    actualHpDps:Math.round(s.damage.total/(s.simulated/1000))};
   rows.push(row);console.log(JSON.stringify(row));
  }finally{await worker.terminate();}
 }
assert.equal(rows.length,36);
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])
 for(const gearRarity of ['common','legendary','mythic']){
  const group=rows.filter(r=>r.level===level&&r.job===job&&r.gearRarity===gearRarity);
  console.log(JSON.stringify({summary:true,level,job,gearRarity,scenarios:group.length,
   alive:group.filter(r=>r.alive).length,deathFree:group.filter(r=>r.alive&&r.revives===0).length,
   totalRevives:group.reduce((sum,r)=>sum+r.revives,0),
   meanKills:Number((group.reduce((sum,r)=>sum+r.kills,0)/group.length).toFixed(2)),
   meanActualHpDps:Math.round(group.reduce((sum,r)=>sum+r.actualHpDps,0)/group.length)}));
 }
console.log(JSON.stringify({complete:true,scenarios:rows.length,
 limitation:'Synthetic fixed-IV all-matched rarity gear, with no measured farming time; not a population-based gear availability study.'}));
