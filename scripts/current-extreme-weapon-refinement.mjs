// Compare actual legally equipped weapon forms with the current best fusion/stat
// profile per trial mode. Generates resumable per-weapon result checkpoints.
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {WEAPON_VARIANTS,currentEndgamePlayer} from '../tests/fixtures/current-210-endgame-player.mjs';

const job=process.env.EXTREME_JOB;
const variants=WEAPON_VARIANTS[job];
assert.ok(variants?.length>1,`No alternate weapon for ${job}`);
const old=JSON.parse(readFileSync(`docs/current-extreme-${job}-search-20261110.json`,'utf8'));
const modes=['atk','matk','hp','clear'];
const prior=Object.fromEntries(modes.map(kind=>{
 const refined=JSON.parse(readFileSync(`docs/current-extreme-refine-${job}-${kind}-20261111.json`,'utf8'));
 assert.equal(refined.completed,5);
 return [kind,[old.best[kind],...refined.results].sort((a,b)=>b.highest-a.highest)[0]];
}));
const defaultWeapon=currentEndgamePlayer(job).gear.rightHand.id;
const alternatives=variants.filter(id=>id!==defaultWeapon);
const tasks=alternatives.flatMap(weaponId=>modes.map(kind=>({weaponId,kind})));
const concurrency=Math.max(1,Math.min(4,Number(process.env.EXTREME_WEAPON_CONCURRENCY||4)));
let cursor=0;
const outputFor=({weaponId,kind})=>`docs/current-extreme-weapon-${job}-${weaponId.replaceAll('+','-')}-${kind}-20261111.json`;
function run(task){return new Promise((resolve,reject)=>{
 const best=prior[task.kind];
 const proc=spawn(process.execPath,['scripts/current-extreme-candidate-search.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_WEAPON_ID:task.weaponId,
   EXTREME_FUSIONS:best.fusion,EXTREME_WEAPONS:'critDmg,aspdPct',
   EXTREME_PROFILES:best.attributeProfile,EXTREME_MODES:task.kind,
   EXTREME_CONCURRENCY:'2',EXTREME_OUTPUT:outputFor(task)},
  stdio:['ignore','pipe','pipe']});
 let error='';proc.stderr.on('data',x=>error+=x);
 proc.stdout.on('data',()=>{});
 proc.on('error',reject);
 proc.on('exit',code=>{
  if(code)return reject(Error(`${job}/${task.weaponId}/${task.kind}: ${error}`));
  try{
   const r=JSON.parse(readFileSync(outputFor(task),'utf8'));
   assert.equal(r.completed,2);
   assert.ok(r.results.every(row=>row.stopped==='first-failure'&&row.weaponId===task.weaponId));
   console.log(JSON.stringify({job,...task,highest:r.best[task.kind].highest,baseline:best.highest}));
   resolve();
  }catch(e){reject(e);}
 });
});}
async function worker(){while(cursor<tasks.length)await run(tasks[cursor++]);}
await Promise.all(Array.from({length:Math.min(concurrency,tasks.length)},worker));
const merged=Object.fromEntries(modes.map(kind=>{
 const candidates=[prior[kind],...alternatives.flatMap(weaponId=>JSON.parse(readFileSync(outputFor({weaponId,kind}),'utf8')).results)];
 return [kind,candidates.sort((a,b)=>b.highest-a.highest)[0]];
}));
console.log(JSON.stringify({complete:true,job,defaultWeapon,alternatives,merged}));
