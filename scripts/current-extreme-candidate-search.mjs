// Bounded candidate search over *real* extreme trials; never a proof of global optimum.
import {spawn} from 'node:child_process';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FUSIONS,ATTRIBUTE_PROFILES,WEAPON_VARIANTS} from '../tests/fixtures/current-210-endgame-player.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';

const job=process.env.EXTREME_JOB||'pactWarrior';
const fusions=(process.env.EXTREME_FUSIONS||FUSIONS.join(',')).split(',');
const weapons=(process.env.EXTREME_WEAPONS||'critDmg,aspdPct').split(',');
const profiles=(process.env.EXTREME_PROFILES||'reference').split(',');
const modes=(process.env.EXTREME_MODES||'hp,clear').split(',');
const weaponId=process.env.EXTREME_WEAPON_ID||null;
const concurrency=Math.max(1,Math.min(4,Number(process.env.EXTREME_CONCURRENCY||4)));
const output=process.env.EXTREME_OUTPUT||`docs/current-extreme-candidates-${job}-20261110.json`;
assert.ok(SECOND_JOBS[job]&&fusions.every(x=>FUSIONS.includes(x))&&weapons.every(x=>['critDmg','aspdPct'].includes(x)));
assert.ok(weaponId===null||WEAPON_VARIANTS[job].includes(weaponId));
assert.ok(profiles.every(x=>ATTRIBUTE_PROFILES.includes(x)));
assert.ok(modes.every(x=>['atk','matk','hp','clear'].includes(x)));
const tasks=fusions.flatMap(fusion=>weapons.flatMap(weaponChoice=>profiles.map(attributeProfile=>({fusion,weaponChoice,attributeProfile}))));
const signature=JSON.stringify({job,fusions,weapons,profiles,modes,seed:process.env.EXTREME_SEED||'20261110',...(weaponId?{weaponId}:{})});
const previous=existsSync(output)?JSON.parse(readFileSync(output,'utf8')):null;
if(previous)assert.equal(previous.signature,signature,'Existing checkpoint belongs to different search settings');
let cursor=0;const results=previous?.results||[];
const key=x=>[x.fusion,x.weaponChoice,x.attributeProfile].join('/');
const completed=new Set(tasks.filter(task=>modes.every(kind=>results.some(r=>key(r)===key(task)&&r.kind===kind))).map(key));
function checkpoint(done=false){
 const best=Object.fromEntries(modes.map(kind=>[kind,results.filter(x=>x.kind===kind).sort((a,b)=>b.highest-a.highest)[0]||null]));
 const report={status:done?'BOUNDED SEARCH COMPLETE, not global optimum':'PARTIAL - resumable checkpoint',signature,job,weaponId,conditions:'Chosen unordered pet fusions x weapon special affixes x legal attribute profiles; explicit weaponId if given; cards fixed; real extreme trial from floor1 to failure',modes,tasks:tasks.length,completed:completed.size,results,best};
 writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 return best;
}
const pending=tasks.filter(task=>!completed.has(key(task)));
function one({fusion,weaponChoice,attributeProfile}){return new Promise((resolve,reject)=>{
 const proc=spawn(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_FUSION:fusion,EXTREME_WEAPON:weaponChoice,EXTREME_WEAPON_ID:weaponId||'',EXTREME_ATTRIBUTE_PROFILE:attributeProfile,EXTREME_MODES:modes.join(','),EXTREME_FLOOR_CEILING:'250'},stdio:['ignore','pipe','pipe']});
 let output='',errors='';proc.stdout.on('data',x=>output+=x);proc.stderr.on('data',x=>errors+=x);
 proc.on('error',reject);proc.on('exit',code=>{
  if(code!==0)return reject(Error(`${job}/${fusion}/${weaponChoice}/${attributeProfile}: ${errors||output}`));
  try{
   const rows=output.trim().split('\n').map(JSON.parse);
   assert.deepEqual(rows.map(x=>x.kind),modes);
   results.push(...rows);completed.add(key({fusion,weaponChoice,attributeProfile}));checkpoint();console.log(JSON.stringify({fusion,weaponChoice,attributeProfile,scores:rows.map(x=>({kind:x.kind,highest:x.highest,stopped:x.stopped}))}));resolve();
  }catch(err){reject(err);}
 });
});}
async function worker(){while(cursor<pending.length)await one(pending[cursor++]);}
await Promise.all(Array.from({length:Math.min(concurrency,pending.length)},worker));
const best=checkpoint(true);
console.log(JSON.stringify({complete:true,job,tasks:tasks.length,best:Object.fromEntries(modes.map(k=>[k,{highest:best[k].highest,fusion:best[k].fusion,weaponChoice:best[k].weaponChoice}]))}));
