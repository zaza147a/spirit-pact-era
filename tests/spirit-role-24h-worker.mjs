// One-shot 24-hour role-correct high-level observation; retain for manual heavy runs.
// Four legal synthetic cases (2 jobs x 200/210); no assumption that simulatedFull means clean farm.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,hours=24,duration=hours*3600000,seed=471122,rows=[];
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const p=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),
  {type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('24h role benchmark timeout '+job+' '+level)),480000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:epoch+duration});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s&&d&&Number.isFinite(d.total)&&s.simulated>0);
  const row={level,job,stance:job==='pactWarrior'?'oneAssimilate':'bothAssist',seed,
   wallMs:Math.round(performance.now()-start),simulatedHours:Math.round(s.simulated/36000)/100,
   simulationCompleted:s.simulated===duration&&s.reason==='已完成離線時間'&&result.player.hp>0,
   sustainable:s.simulated===duration&&s.reason==='已完成離線時間'&&result.player.hp>0&&
    result.player.pets.every(pet=>pet.hp>0)&&result.player.gold>=p.gold,
   reason:s.reason,alive:result.player.hp>0,kills:s.kills,revives:s.revives||0,
   netGold:result.player.gold-p.gold,pet1Alive:result.player.pets[0].hp>0,
   pet2Alive:result.player.pets[1].hp>0,resonanceActivations:s.resonanceActivations||0,
   ownerDamage:d.player,petDamage:d.pet1+d.pet2,totalDamage:d.total,
   inventoryItems:result.player.bag.length};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,4);
console.log(JSON.stringify({summary:true,scenarios:4,simulationCompleted:rows.filter(x=>x.simulationCompleted).length,
 sustainable:rows.filter(x=>x.sustainable).length,
 stopped:rows.filter(x=>!x.simulationCompleted).map(x=>({job:x.job,level:x.level,reason:x.reason,simulatedHours:x.simulatedHours})),
 limitation:'Synthetic mythic gear, 200 unenhanced / 210 SSS, no trials or bosses, fixed attack-magic + defense-support pair and one seed.'}));
