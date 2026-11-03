// Intermediate, role-correct sustained-survival sweeps for tuning only the two spirit classes.
// Never overwrite enemy stats, legacy classes, or global pet revival behavior.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,seed=471122,rows=[];
for(const hours of [1,6])for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander'])for(const pairKey of ['attack-magic+attack-magic','attack-magic+defense-support']){
 const p=highLevelSpiritPlayer({level,job,pairKey,gearRarity:'mythic'});
 if(job==='pactWarrior')p.petStances={[p.pets[0].id]:'assimilate',[p.pets[1].id]:'assist'};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{type:'module',workerData:{seed}});
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('survival sweep timeout '+hours+'h '+level+' '+job+' '+pairKey)),180000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:epoch+hours*3600000});
  });
  const s=result.summary,d=s?.damage;
  assert.ok(s&&d&&Number.isFinite(d.total)&&s.simulated>0);
  const row={hours,level,job,pairKey,seed,wallMs:Math.round(performance.now()-start),
   simulatedHours:Math.round(s.simulated/36000)/100,reason:s.reason,
   complete:s.simulated===hours*3600000,alive:result.player.hp>0,
   pet1Alive:result.player.pets[0].hp>0,pet2Alive:result.player.pets[1].hp>0,
   kills:s.kills,revives:s.revives||0,netGold:result.player.gold-p.gold,
   actualHpDps:Math.round(d.total/(s.simulated/1000)),
   directEnemyTargets:s.spiritEnemyTargets||null};
  rows.push(row);console.log(JSON.stringify(row));
 }finally{await worker.terminate();}
}
assert.equal(rows.length,16);
console.log(JSON.stringify({summary:true,scenarios:rows.length,clean:rows.filter(r=>r.complete&&r.alive&&r.pet1Alive&&r.pet2Alive&&r.revives===0).length,
 limitations:'Fixed synthetic mythic fixtures, 200 unenhanced / 210 SSS, one seed, 1h and 6h; not a proof of indefinite survival.'}));
