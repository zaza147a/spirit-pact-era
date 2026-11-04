// Usage: node tests/offline-worker-benchmark.mjs path/to/legal-save.json
// Executes the production offline simulation via a Node Worker (no DOM).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Worker} from 'node:worker_threads';
import {performance} from 'node:perf_hooks';
import {starterPlayer} from './fixtures/starter-player.mjs';
import {makePet,petStats,SPECIES} from '../dist/catalog.js';

const file=process.argv[2];
if(!file)throw Error('Usage: node tests/offline-worker-benchmark.mjs path/to/legal-save.json | --starter | --starter-salvage | --starter-dual-salvage');
const starterMode=['--starter','--starter-salvage','--starter-dual-salvage'].includes(file);
const loaded=starterMode?starterPlayer():JSON.parse(readFileSync(file,'utf8'));
if(file==='--starter-dual-salvage'){
 // Use production capture construction/stat formulas, then stable benchmark IDs.
 loaded.pets=['fang','wisp'].map((species,index)=>{
  const pet=makePet(species);
  pet.id='bench-pet-'+(index+1);
  pet.nickname=SPECIES[species].name;
  pet.rarity='common';
  pet.iv={hp:2,atk:2,def:1,matk:2,sp:2,aspd:1};
  pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;
  return pet;
 });
 loaded.activePetId=loaded.pets[0].id;
 loaded.secondaryPetId=loaded.pets[1].id;
}
if(file==='--starter-salvage'||file==='--starter-dual-salvage'){
 // Keep mythical items; dismantle ordinary drops through the real game rules.
 loaded.autoSalvage=true;
 loaded.salvageInventory=true;
 loaded.keepRarity=true;
 loaded.salvageMaxRarity='mythic';
 loaded.keepTier=false;
 loaded.keepStat=false;
 loaded.salvageMatchMode='any';
}
const original=loaded.player||loaded;
assert.ok(original&&typeof original==='object'&&Array.isArray(original.pets),'expected a real player save');
assert.equal(original.offline?.enabled,true,'save must have offline combat enabled');
assert.ok(!['town','skycity','dawncity'].includes(original.location),'save must be on a combat map');
assert.ok(original.hp>0||original.autoRevive===true,'save must be alive or enable auto-revive');

const seed=Number(process.env.SPIRIT_BENCH_SEED||'12648430')>>>0;
const epoch=2000000000000;
const times=(process.env.SPIRIT_BENCH_HOURS||'1,6,12,24').split(',').map(Number);
assert.ok(times.length>0&&times.every(h=>Number.isFinite(h)&&h>0&&h<=24),'hours must be greater than 0 and at most 24');
const repeats=Number(process.env.SPIRIT_BENCH_REPEAT||1);
assert.ok(Number.isInteger(repeats)&&repeats>=1&&repeats<=3,'repeat count must be an integer between 1 and 3');
const maxWallMs=Number(process.env.SPIRIT_BENCH_TIMEOUT_MS||600000);
const results=[];

async function measure(hours){
 const duration=hours*3600000;
 const player=structuredClone(original);
 player.offline={...player.offline,enabled:true,at:epoch};
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs?seed='+seed+'&clock='+epoch,import.meta.url),{type:'module'});
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
 const damage=summary.damage;
 assert.ok(damage&&Number.isFinite(damage.total),'offline combat must report real dealt HP damage');
 const parts=['player','pet1','pet2','resonance','petSupport','other'];
 for(const key of parts)assert.ok(Number.isFinite(damage[key])&&damage[key]>=0,'nonnegative damage component '+key);
 assert.ok(Math.abs(parts.reduce((sum,key)=>sum+damage[key],0)-damage.total)<.001,'damage attribution must equal total actual HP damage');
 return {
  _state:result.result.player,
  hours,stateSha256:createHash('sha256').update(JSON.stringify(result.result.player)).digest('hex'),wallMs:Math.round(performance.now()-started),workerHeapMb:Math.round((result.workerHeapUsed||0)/1048576),
  processRssMb:Math.round(process.memoryUsage().rss/1048576),
  firstProgressMs:firstProgressMs===null?null:Math.round(firstProgressMs),
  progressEvents,mostRecentProgress,
  simulatedMs:summary.simulated,reason:summary.reason,kills:summary.kills,
  baseXp:summary.baseXp,jobXp:summary.jobXp,petXp:summary.petXp,
  gold:summary.gold,spent:summary.spent,consumables:summary.potions,
  equipmentDrops:summary.equipment?.length,cards:summary.cards?.length,damage
 };
}
function differencePaths(a,b,prefix='',out=[]){
 if(out.length>=30)return out;
 if(Object.is(a,b))return out;
 if(!a||!b||typeof a!=='object'||typeof b!=='object'){out.push(prefix||'<root>');return out;}
 const keys=new Set([...Object.keys(a),...Object.keys(b)]);
 for(const key of keys)differencePaths(a[key],b[key],prefix?prefix+'.'+key:key,out);
 return out;
}
// A gear UID is a storage identity, not a combat outcome. Preserve alias
// relationships while canonicalizing only generated gear IDs for comparison.
// This intentionally does not change game loot generation or player saves.
function semanticState(state){
 const ids=new Map();
 const seenGear=new Set();
 function collect(value){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const entry of value)collect(entry);return;}
  if(typeof value.uid==='string'&&/^(?:g|pg)-\d+-[a-z0-9]+$/.test(value.uid)){
   if(seenGear.has(value.uid))throw Error('Duplicate gear UID in benchmark result');
   seenGear.add(value.uid);
   ids.set(value.uid,'@gear-'+ids.size);
  }
  for(const item of Object.values(value))collect(item);
 }
 // Gear items can be referenced more than once across the save; unique IDs
 // are checked on inventory-bearing gear entities, not every reference.
 function rewrite(value){
  if(typeof value==='string')return ids.get(value)||value;
  if(Array.isArray(value))return value.map(rewrite);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v)]));
  return value;
 }
 collect(state);
 return rewrite(state);
}
function semanticHash(state){
 return createHash('sha256').update(JSON.stringify(semanticState(state))).digest('hex');
}
for(const hours of times){
 const rows=[];
 for(let repetition=0;repetition<repeats;repetition++){
  const row=await measure(hours);
  rows.push(row);
  const {_state,...publicRow}=row;
  console.log(JSON.stringify({repetition:repetition+1,...publicRow}));
 }
 if(file==='--starter-salvage'||file==='--starter-dual-salvage'){
  for(const row of rows){
   assert.equal(row.simulatedMs,hours*3600000,'salvage benchmark must complete the FULL requested duration');
   assert.equal(row.reason,'已完成離線時間','salvage benchmark must not stop early');
  }
 }
 if(file==='--starter-dual-salvage'){
  for(const row of rows){
   assert.equal(row._state.activePetId,'bench-pet-1','first pet selection must persist');
   assert.equal(row._state.secondaryPetId,'bench-pet-2','second pet selection must persist');
   assert.equal(row._state.pets.length,2,'dual-pet roster must remain intact');
   assert.ok(row.damage.pet1>0&&row.damage.pet2>0,'both companions must actually deal HP damage');
  }
 }
 const identical=rows.every(x=>x.stateSha256===rows[0].stateSha256);
 const semanticHashes=rows.map(x=>semanticHash(x._state));
 const semanticallyIdentical=semanticHashes.every(hash=>hash===semanticHashes[0]);
 if(repeats>1&&!identical){
  const paths=differencePaths(rows[0]._state,rows[1]._state);
  console.error('State mismatch property paths (values withheld): '+JSON.stringify(paths));
  console.error('Full state differs; checking UID-normalized semantic state at '+hours+'h');
 }
 if(repeats>1&&!semanticallyIdentical){
  const paths=differencePaths(semanticState(rows[0]._state),semanticState(rows[1]._state));
  console.error('Semantic state mismatch property paths (values withheld): '+JSON.stringify(paths));
  assert.fail('same seed and save produced different semantic player states at '+hours+'h');
 }
 results.push({hours,repeat:repeats,identicalState:identical,semanticallyIdentical,wallMs:rows.map(x=>x.wallMs),stateSha256:rows[0].stateSha256,semanticSha256:semanticHashes[0]});
}
console.log(JSON.stringify({seed,complete:true,results}));
