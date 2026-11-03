// Actual Worker survival/economy comparison with 200 mythic unenhanced and 210 mythic SSS gear.
// This is a fixed synthetic configuration matrix, not optimal player gearing.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,minutes=10,duration=minutes*60000,seed=471122;
const pairs=['attack-magic+attack-defense','attack-magic+defense-support','magic-support+defense-support'];
const rows=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])for(const pairKey of pairs){
 const player=highLevelSpiritPlayer({level,job,pairKey,gearRarity:'mythic'});
 if(job==='pactWarrior')player.petStances={[player.pets[0].id]:'assimilate',[player.pets[1].id]:'assist'};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('survival economy worker timeout '+job+' '+level)),45000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player,now:epoch+duration});
  });
  const s=result.summary;
  assert.ok(s&&s.simulated>0,'actual combat summary');
  const row={level,job,pairKey,gearRarity:'mythic',simulatedMs:s.simulated,
   cleanEnd:s.simulated===duration&&s.reason==='已完成離線時間'&&result.player.hp>0,
   reason:s.reason,kills:s.kills,revives:s.revives||0,
   goldEarned:s.goldEarned||0,spent:s.spent||0,netGold:result.player.gold-player.gold,
   potions:s.potions||{},purchased:s.purchased||{},
   alive:result.player.hp>0,pet1Alive:result.player.pets[0].hp>0,pet2Alive:result.player.pets[1].hp>0,
   petDownBlocked:s.dualSpiritBlockedPetDown||0,
   resonanceActivations:s.resonanceActivations||0};
  assert.equal(row.netGold,s.gold,'net gold must match offline summary');
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,12);
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const group=rows.filter(r=>r.level===level&&r.job===job);
 console.log(JSON.stringify({summary:true,level,job,minutes,
  variants:group.map(r=>({pairKey:r.pairKey,revives:r.revives,kills:r.kills,
   netGold:r.netGold,spent:r.spent,cleanEnd:r.cleanEnd}))}));
}
console.log(JSON.stringify({complete:true,scenarios:rows.length,minutes,seed}));
