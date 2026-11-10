// Multi-job baseline orchestrator: every value is obtained from the production extreme trial.
// Default fused pet/weapon only. Never label this output as optimized class ranking.
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';

const jobs=(process.env.EXTREME_JOBS||Object.keys(SECOND_JOBS).join(',')).split(',');
const concurrency=Math.max(1,Math.min(4,Number(process.env.EXTREME_CONCURRENCY||3)));
const output=process.env.EXTREME_OUTPUT||'docs/current-extreme-baseline-20261110.json';
assert.ok(jobs.length&&jobs.every(j=>SECOND_JOBS[j]));
let cursor=0;const rows=[];
function runJob(job){return new Promise((resolve,reject)=>{
 const proc=spawn(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_FLOOR_CEILING:process.env.EXTREME_FLOOR_CEILING||'250'},stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';proc.stdout.on('data',x=>stdout+=x);proc.stderr.on('data',x=>stderr+=x);
 proc.on('error',reject);proc.on('exit',code=>{
  if(code!==0)return reject(Error(`${job}: ${stderr||stdout}`));
  try{
   const samples=stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
   assert.deepEqual(samples.map(x=>x.kind),['atk','matk','hp','clear']);
   rows.push(...samples);console.log(JSON.stringify({completeJob:job,results:samples.map(s=>({kind:s.kind,highest:s.highest,stopped:s.stopped}))}));resolve();
  }catch(err){reject(err);}
 });
});}
async function worker(){while(cursor<jobs.length){const job=jobs[cursor++];await runJob(job);}}
await Promise.all(Array.from({length:Math.min(concurrency,jobs.length)},worker));
const report={status:'NOT OPTIMIZED - default attack-magic companion, default profession weapon, critDmg special, static legal attributes',source:'dist/game.js real extreme trials',conditions:'Lv210 SSS mythic gear/pet, sigil8, homecoming completed, one companion, 6 priority affixes/boss cards',jobs,rows:rows.sort((a,b)=>jobs.indexOf(a.job)-jobs.indexOf(b.job)||['atk','matk','hp','clear'].indexOf(a.kind)-['atk','matk','hp','clear'].indexOf(b.kind))};
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({complete:true,jobs:jobs.length,rows:rows.length,output}));
