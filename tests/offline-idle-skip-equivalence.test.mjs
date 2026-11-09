import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

const epoch=2000000000000;
function semanticState(value){
 const seen=new Map();
 const visit=node=>{
  if(Array.isArray(node))return node.map(visit);
  if(node&&typeof node==='object')return Object.fromEntries(Object.entries(node).map(([k,v])=>[k,visit(v)]));
  if(typeof node==='string'&&/^(?:g|pg)-\d+-[a-z0-9]+$/.test(node)){
   if(!seen.has(node))seen.set(node,'@generated-'+seen.size);
   return seen.get(node);
  }
  return node;
 };
 return visit(value);
}
async function settle(player,minutes,disableOfflineIdleSkip,disableOfflineEffectGuards=false,disableOfflineStorageGuard=false,disableOfflinePactFusionCache=false,disableOfflineAutoSkillCache=false){
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?clock='+epoch,import.meta.url),{
  type:'module',workerData:{seed:471122,disableOfflineIdleSkip,disableOfflineEffectGuards,disableOfflineStorageGuard,disableOfflinePactFusionCache,disableOfflineAutoSkillCache}
 });
 const started=performance.now();
 try{return await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Idle-skip parity timed out')),90000);
  worker.on('message',msg=>{
   if(msg.type==='result'){
    clearTimeout(timeout);
    resolve({result:msg.result,wallMs:Math.round(performance.now()-started)});
   }else if(msg.type==='error'){
    clearTimeout(timeout);reject(Error(msg.message));
   }
  });
  worker.on('error',error=>{clearTimeout(timeout);reject(error)});
  worker.postMessage({player:structuredClone(player),now:epoch+minutes*60000});
 });}finally{await worker.terminate();}
}

for(const [level,job] of [[200,'pactWarrior'],[200,'spiritCommander'],[210,'pactWarrior'],[210,'spiritCommander']]){
 test(`offline auto-skill order memo preserves ${level} ${job} combat`,async()=>{
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,10,false,false,false,false,true);
  const optimized=await settle(player,10,false,false,false,false,false);
  assert.deepEqual(semanticState(optimized.result),semanticState(baseline.result));
  console.log(JSON.stringify({autoSkillCache:true,level,job,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}

for(const [level,minutes] of [[200,10],[200,60],[210,10]]){
 test(`offline pact fusion profile cache preserves complete ${level} settlement over ${minutes}m`,async()=>{
  const player=highLevelSpiritPlayer({level,job:'pactWarrior',pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,minutes,false,false,false,true);
  const optimized=await settle(player,minutes,false,false,false,false);
  assert.deepEqual(semanticState(optimized.result),semanticState(baseline.result));
  console.log(JSON.stringify({pactFusionCache:true,level,minutes,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}

for(const [level,job] of [[200,'pactWarrior'],[200,'spiritCommander'],[210,'pactWarrior'],[210,'spiritCommander']]){
 test(`offline gold calculation avoids missing-storage exceptions for ${level} ${job}`,async()=>{
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,10,false,false,true);
  const optimized=await settle(player,10,false,false,false);
  assert.deepEqual(semanticState(optimized.result),semanticState(baseline.result));
  console.log(JSON.stringify({storageGuard:true,level,job,minutes:10,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}

for(const [level,job] of [[200,'pactWarrior'],[200,'spiritCommander'],[210,'pactWarrior'],[210,'spiritCommander']]){
 test(`offline inactive-effect fast path preserves settlement for ${level} ${job}`,async()=>{
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,10,false,true);
  const optimized=await settle(player,10,false,false);
  assert.deepEqual(semanticState(optimized.result),semanticState(baseline.result));
  console.log(JSON.stringify({effectGuard:true,level,job,minutes:10,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}

for(const [level,job] of [[200,'pactWarrior'],[200,'spiritCommander'],[210,'pactWarrior'],[210,'spiritCommander']]){
 test(`original 100ms grid and idle-event skip agree for ${level} ${job}`,async()=>{
  const player=highLevelSpiritPlayer({level,job,pairKey:'attack-magic+defense-support',gearRarity:'mythic'});
  const baseline=await settle(player,10,true);
  const optimized=await settle(player,10,false);
  assert.deepEqual(semanticState(optimized.result),semanticState(baseline.result),
   'full state, loot, resources, combat damage and RNG-dependent results must match');
  assert.equal(optimized.result.summary.simulated,600000);
  console.log(JSON.stringify({level,job,minutes:10,baselineMs:baseline.wallMs,optimizedMs:optimized.wallMs}));
 });
}
