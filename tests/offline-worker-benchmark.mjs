// Usage: node tests/offline-worker-benchmark.mjs path/to/legal-save.json
// Executes the production offline simulation via a Node Worker (no DOM).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';

const file=process.argv[2];
if(!file)throw Error('Usage: node tests/offline-worker-benchmark.mjs path/to/legal-save.json');
const loaded=JSON.parse(readFileSync(file,'utf8'));
const original=loaded.player||loaded;
assert.ok(original&&typeof original==='object'&&Array.isArray(original.pets),'expected a real player save');
assert.equal(original.offline?.enabled,true,'save must have offline combat enabled');
assert.ok(!['town','skycity','dawncity'].includes(original.location),'save must be on a combat map');
assert.ok(original.hp>0||original.autoRevive===true,'save must be alive or enable auto-revive');

const seed=Number(process.env.SPIRIT_BENCH_SEED||'12648430')>>>0;
const epoch=2000000000000;
const times=[1,6,12,24];
const maxWallMs=Number(process.env.SPIRIT_BENCH_TIMEOUT_MS||600000);
const results=[];

async function measure(hours){
 const duration=hours*3600000;
 const player=structuredClone(original);
 player.offline={...player.offline,enabled:true,at:epoch};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed='+seed,import.meta.url),{type:'module'});
 const started=performance.now();
 let firstProgressMs=null,progressEvents=0,mostRecentProgress=-1;
 const result=await new Promise((resolve,reject)=>{
  const deadline=setTimeout(()=>reject(Error('Offline benchmark timeout at '+hours+'h')),maxWallMs);
  worker.on('message',message=>{
   if(message.type==='progress'){
    progressEvents++;
    if(firstProgressMs===null)firstProgressMs=performance.now()-started;
    mostRecentProgress=message.value;
   }else if(message.type==='result'){clearTimeout(deadline);resolve(message);}
   else if(message.type==='error'){clearTimeout(deadline);reject(Error(message.message));}
  });
  worker.on('error',error=>{clearTimeout(deadline);reject(error)});
  worker.on('exit',code=>{if(code!==0){clearTimeout(deadline);reject(Error('Worker exited with '+code));}});
  worker.postMessage({player,now:epoch+duration});
 }).finally(()=>worker.terminate());
 const summary=result.result?.summary;
 assert.ok(summary,'offline worker must return a summary');
 return {
  hours,wallMs:Math.round(performance.now()-started),workerHeapMb:Math.round((result.workerHeapUsed||0)/1048576),
  processRssMb:Math.round(process.memoryUsage().rss/1048576),
  firstProgressMs:firstProgressMs===null?null:Math.round(firstProgressMs),
  progressEvents,mostRecentProgress,
  simulatedMs:summary.simulated,reason:summary.reason,kills:summary.kills,
  baseXp:summary.baseXp,jobXp:summary.jobXp,petXp:summary.petXp,
  gold:summary.gold,spent:summary.spent,consumables:summary.potions,
  equipmentDrops:summary.equipment?.length,cards:summary.cards?.length
 };
}
for(const hours of times){
 const row=await measure(hours);
 results.push(row);
 console.log(JSON.stringify(row));
}
console.log(JSON.stringify({seed,complete:true,results}));
