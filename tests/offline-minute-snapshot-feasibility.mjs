// Observational probe for the proposed minute-snapshot approximation.
// Run: node tests/offline-minute-snapshot-feasibility.mjs
// This never alters the production settlement algorithm or player saves.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000;
const durations=[1,5,10,30];
const fields=['kills','baseXp','jobXp','petXp','goldEarned','spent','revives'];

async function settle(player,minutes){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed:471122}
 });
 const started=performance.now();
 try{
  return await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Snapshot probe timeout')),90000);
   worker.on('message',message=>{
    if(message.type==='result'){
     clearTimeout(timeout);
     resolve({summary:message.result.summary,player:message.result.player,wallMs:Math.round(performance.now()-started)});
    }else if(message.type==='error'){
     clearTimeout(timeout);reject(Error(message.message));
    }
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error)});
   worker.postMessage({player:structuredClone(player),now:epoch+minutes*60000});
  });
 }finally{await worker.terminate();}
}

for(const level of [200,210])for(const job of ['pactWarrior','spiritCommander']){
 const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
 const results=[];
 for(const minutes of durations){
  const result=await settle(player,minutes);
  assert.equal(result.summary.simulated,minutes*60000,'probe must simulate the full requested interval');
  results.push({minutes,...result});
 }
 const first=results[0].summary;
 for(const {minutes,summary,player:ending,wallMs} of results){
  const divergence=Object.fromEntries(fields.map(field=>{
   const actual=Number(summary[field]||0),projected=Number(first[field]||0)*minutes;
   return [field,{actual,projected,error:actual-projected}];
  }));
  console.log(JSON.stringify({job,level,minutes,wallMs,reason:summary.reason,
   alive:ending.hp>0,divergence}));
 }
 // Keep concrete counterexamples in CI: a naive first-minute multiplier
 // cannot replace combat even when the first interval seems representative.
 const ten=results.find(result=>result.minutes===10).summary;
 if(level===200&&job==='spiritCommander'){
  assert.notEqual(ten.kills,first.kills*10,'revives change the kill rate');
  assert.notEqual(ten.spent,first.spent*10,'revival costs are not a linear stream');
 }
 if(level===210&&job==='pactWarrior'){
  assert.notEqual(ten.kills,first.kills*10,'even stable hunting has variable spawns');
 }
 if(level===210&&job==='spiritCommander'){
  assert.equal(first.kills,0,'the unsafe first-minute snapshot should show no kills');
  assert.ok(ten.kills>0,'future kills cannot be inferred from a zero-kill snapshot');
 }
}
console.log('Minute-snapshot feasibility probe completed; deviations are observations, not an approximation approval.');
