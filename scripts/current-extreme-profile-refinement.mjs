// Second-pass profile refinement: test untried legal stat templates against each
// mode's best known fusion and weapon affix. Still bounded, not a global optimum.
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';

const job=process.env.EXTREME_JOB;
assert.ok(SECOND_JOBS[job],`Unknown EXTREME_JOB ${job}`);
const source=`docs/current-extreme-${job}-search-20261110.json`;
const baseline=JSON.parse(readFileSync(source,'utf8'));
assert.equal(baseline.completed,24,`Incomplete first pass: ${job}`);
const modes=['atk','matk','hp','clear'];
const extraProfiles='agi-vit,luk-vit,dex-vit,vit-luk,dex-luk';
const seed=process.env.EXTREME_SEED||'20261110';
async function refine(kind){
 const prior=baseline.best[kind];
 assert.ok(prior?.fusion&&prior?.weaponChoice&&prior.stopped==='first-failure');
 const path=`docs/current-extreme-refine-${job}-${kind}-20261111.json`;
 return new Promise((resolve,reject)=>{
  const proc=spawn(process.execPath,['scripts/current-extreme-candidate-search.mjs'],{
   env:{...process.env,EXTREME_JOB:job,EXTREME_FUSIONS:prior.fusion,
    EXTREME_WEAPONS:prior.weaponChoice,EXTREME_PROFILES:extraProfiles,
    EXTREME_MODES:kind,EXTREME_SEED:seed,EXTREME_CONCURRENCY:'1',
    EXTREME_OUTPUT:path},stdio:['ignore','pipe','pipe']});
  let output='',errors='';
  proc.stdout.on('data',chunk=>{output+=chunk;for(const line of chunk.toString().trim().split('\n'))if(line.trim().startsWith('{'))console.log(`${job}/${kind}: ${line.trim()}`);});
  proc.stderr.on('data',chunk=>errors+=chunk);
  proc.on('error',reject);
  proc.on('exit',code=>code===0?resolve(path):reject(Error(`${job}/${kind} failed: ${errors||output}`)));
 });
}
await Promise.all(modes.map(refine));
const comparison=Object.fromEntries(modes.map(kind=>{
 const extra=JSON.parse(readFileSync(`docs/current-extreme-refine-${job}-${kind}-20261111.json`,'utf8'));
 assert.equal(extra.completed,5);
 assert.equal(extra.results.length,5);
 assert.ok(extra.results.every(row=>row.stopped==='first-failure'));
 const candidates=[baseline.best[kind],...extra.results];
 const best=candidates.sort((a,b)=>b.highest-a.highest)[0];
 return [kind,{previous:baseline.best[kind].highest,best,additionalProfiles:5}];
}));
console.log(JSON.stringify({complete:true,job,comparison}));
