// A/B production Worker equivalence: same build, seed and 10-minute window,
// cached vs uncached level-200 pet stats. Observe actual speed, not formula.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
const epoch=2000000000000,duration=600000,seed=471122;
const keys=['simulated','reason','kills','baseXp','jobXp','petXp','gold','spent','revives',
 'resonanceActivations','dualSpiritMainEvents','dualSpiritBlockedPetDown','dualSpiritBlockedCooldown','damage'];
async function run(level,job,disablePetStatsCache){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed,disablePetStatsCache}
 });
 const start=performance.now();
 try{
  const result=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('cache A/B timeout '+job+' '+level)),45000);
   worker.on('message',msg=>{
    if(msg.type==='result'){clearTimeout(timer);resolve(msg.result);}
    if(msg.type==='error'){clearTimeout(timer);reject(Error(msg.stack||msg.message));}
   });
   worker.on('error',error=>{clearTimeout(timer);reject(error);});
   worker.postMessage({player:highLevelSpiritPlayer({level,job,gearRarity:level===210?'mythic':'legendary'}),now:epoch+duration});
  });
  const p=result.player,s=result.summary;
  assert.ok(s&&s.simulated===duration,'full production 10-minute simulation');
  return {wallMs:Math.round(performance.now()-start),summary:Object.fromEntries(keys.map(k=>[k,s[k]??null])),
   state:{level:p.level,jobLevel:p.jobLevel,hp:p.hp,mp:p.mp,gold:p.gold,kills:p.kills,
    pets:p.pets.map(q=>({id:q.id,level:q.level,hp:q.hp,sp:q.sp,xp:q.xp})),
    bag:p.bag.filter(item=>!item.uid).map(item=>({id:item.id,qty:item.qty})),
    gear:p.gear,attributes:p.attributes}}
 }finally{await worker.terminate();}
}
for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const baseline=await run(level,job,true),cached=await run(level,job,false);
 assert.deepEqual(cached.summary,baseline.summary,'combat rewards/damage must be bit-for-bit equal');
 assert.deepEqual(cached.state,baseline.state,'player and pet state must be bit-for-bit equal');
 console.log(JSON.stringify({level,job,simulatedMs:duration,uncachedMs:baseline.wallMs,
  cachedMs:cached.wallMs,speedup:Math.round(baseline.wallMs/cached.wallMs*100)/100,
  kills:cached.summary.kills,revives:cached.summary.revives||0,equivalent:true}));
}
console.log('Cached and uncached offline dual-fusion combat states match in four 10-minute cases.');
