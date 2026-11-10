// Bounded candidate search over *real* extreme trials; never a proof of global optimum.
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FUSIONS} from '../tests/fixtures/current-210-endgame-player.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';

const job=process.env.EXTREME_JOB||'pactWarrior';
const fusions=(process.env.EXTREME_FUSIONS||FUSIONS.join(',')).split(',');
const weapons=(process.env.EXTREME_WEAPONS||'critDmg,aspdPct').split(',');
const modes=(process.env.EXTREME_MODES||'hp,clear').split(',');
const concurrency=Math.max(1,Math.min(4,Number(process.env.EXTREME_CONCURRENCY||4)));
const output=process.env.EXTREME_OUTPUT||`docs/current-extreme-candidates-${job}-20261110.json`;
assert.ok(SECOND_JOBS[job]&&fusions.every(x=>FUSIONS.includes(x))&&weapons.every(x=>['critDmg','aspdPct'].includes(x)));
assert.ok(modes.every(x=>['atk','matk','hp','clear'].includes(x)));
const tasks=fusions.flatMap(fusion=>weapons.map(weaponChoice=>({fusion,weaponChoice})));
let cursor=0;const results=[];
function one({fusion,weaponChoice}){return new Promise((resolve,reject)=>{
 const proc=spawn(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_FUSION:fusion,EXTREME_WEAPON:weaponChoice,EXTREME_MODES:modes.join(','),EXTREME_FLOOR_CEILING:'250'},stdio:['ignore','pipe','pipe']});
 let output='',errors='';proc.stdout.on('data',x=>output+=x);proc.stderr.on('data',x=>errors+=x);
 proc.on('error',reject);proc.on('exit',code=>{
  if(code!==0)return reject(Error(`${job}/${fusion}/${weaponChoice}: ${errors||output}`));
  try{
   const rows=output.trim().split('\n').map(JSON.parse);
   assert.deepEqual(rows.map(x=>x.kind),modes);
   results.push(...rows);console.log(JSON.stringify({fusion,weaponChoice,scores:rows.map(x=>({kind:x.kind,highest:x.highest,stopped:x.stopped}))}));resolve();
  }catch(err){reject(err);}
 });
});}
async function worker(){while(cursor<tasks.length)await one(tasks[cursor++]);}
await Promise.all(Array.from({length:Math.min(concurrency,tasks.length)},worker));
const best=Object.fromEntries(modes.map(kind=>[kind,results.filter(x=>x.kind===kind).sort((a,b)=>b.highest-a.highest)[0]]));
const report={status:'BOUNDED SEARCH, NOT globally optimized',job,conditions:'6 unordered pet fusions x 2 weapon special affixes; other attributes/weapon types/card choices still fixed; real extreme trial from floor1 to failure',modes,tasks:tasks.length,results,best};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({complete:true,job,tasks:tasks.length,best:Object.fromEntries(modes.map(k=>[k,{highest:best[k].highest,fusion:best[k].fusion,weaponChoice:best[k].weaponChoice}]))}));
