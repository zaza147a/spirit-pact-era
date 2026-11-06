// Diagnostic: preserve the authored optimal save and exercise real encounters.
// This is not a trial benchmark or a claim of equal class balance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Worker} from 'node:worker_threads';

const start=2000000000000;
const duration=120000;
for(const job of ['pactWarrior','spiritCommander']){
 for(const seed of [20261106,471122,93217]){
 const file=new URL(`./fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`,import.meta.url);
 const p=JSON.parse(readFileSync(file,'utf8')).player;
 assert.equal(p.level,210);
 assert.equal(p.pets.length,1);
 assert.equal(p.gear.rightHand.id,'staffSword');
 p.location='dawnrift';
 p.offline={at:start,enabled:true};
 const worker=new Worker(new URL(`./offline-worker-node-entry.mjs?clock=${start}`,import.meta.url),{
  type:'module',workerData:{seed}
 });
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error(`${job} timed out`)),60000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timer);resolve(m.result);}
    else if(m.type==='error'){clearTimeout(timer);reject(Error(m.stack||m.message));}
   });
   worker.on('error',reject);
   worker.postMessage({player:p,now:start+duration});
  });
  const s=result.summary;
  assert.ok(s?.simulated>0&&s.simulated<=duration);
  assert.equal(s.simulated,duration,`${job}/${seed} stopped early`);
  assert.ok((s.bossesEncountered||0)>=1,`${job}/${seed} saw no boss`);
  assert.equal(s.revives||0,0,`${job}/${seed} required a revive`);
  assert.equal(result.player.pets.length,1);
  assert.equal(s.damage?.pet2||0,0);
  console.log(JSON.stringify({job,seed,simulatedMs:s.simulated,reason:s.reason,
   kills:s.kills,bosses:s.bossesEncountered||0,revives:s.revives||0,
   totalDps:Math.round(s.damage.total/(s.simulated/1000)),
   playerHp:result.player.hp,petHp:result.player.pets[0].hp}));
 }finally{await worker.terminate();}
 }
}
