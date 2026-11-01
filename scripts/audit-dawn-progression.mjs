import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const engineHash=createHash('sha256').update(readFileSync(new URL('../dist/game.js',import.meta.url))).digest('hex');
import {Worker,isMainThread,parentPort} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {runProgression} from './dawn-progression-case.mjs';
if(!isMainThread){
 parentPort.on('message',async ({index,job,pair,seed})=>{
  try{parentPort.postMessage({index,row:await runProgression(job,pair,seed)});}
  catch(e){parentPort.postMessage({index,row:{job,pair,seed,error:e.stack}});}
 });
}else{
 const allCases=Object.keys(SECOND_JOBS).flatMap(job=>Object.keys(FUSION_PAIRS).map(pair=>({job,pair,seed:42})));
 const affected=new Set(['priest/attack-support','performer/attack-defense','performer/attack-support','performer/magic-support','performer/defense-support']);
 const lifecycle=process.argv.includes('--lifecycle');
 if(lifecycle){affected.clear();for(const route of ['crusader/defense-support','hunter/defense-support','priest/defense-support','wizard/defense-support','performer/magic-support','rogue/magic-defense','sage/defense-support'])affected.add(route);}
 const qiOnly=process.argv.includes('--qi-only');if(qiOnly){affected.clear();affected.add('monk/defense-support');}
 const onlyAffected=process.argv.includes('--affected')||lifecycle||qiOnly;
 const cases=onlyAffected?allCases.filter(c=>affected.has(c.job+'/'+c.pair)):allCases;
 const rows=Array(cases.length),workers=Array.from({length:6},()=>new Worker(new URL(import.meta.url)));
 let next=0,done=0;
 const report=()=>({sourceCommit,engineHash,handoffHead:'9476c49a0aa1c9228927a4467c3d43b4f5b809b9',gameplayBaseHead:qiOnly?sourceCommit:lifecycle?sourceCommit:onlyAffected?'e79dbfccc71556792bcb66b881bc050affa570b6':'37c62a6535dbb95007e04ab1142553bfa7cf57f2',conditions:(onlyAffected?'Five live-event-affected routes. ':'10 jobs × 12 ordered fusions. ')+'seed42. Start Lv201 with reference mythic SSS owner/pet gear, zero sigil and materials, 10k gold and 25 HP/SP potions. Real 60s offline farm chunks (30min limit), natural monster selection/respawn, auto-purchase, retain materials, travel to town, pay ranks I-IV, serialize/normalize each rank, reject V before core. Travel back and force actual Archon encounter selection only; real stats and combat plus adds, 240s cap. No material/sigil/damage injection. Same farmed player continues to boss after ordinary consumed HP/SP potions in town; 4s online supply timer is driven alongside combat. No direct health/MP assignment. Not browser E2E or all skill selections.',total:cases.length,completed:done,wins:rows.filter(r=>r?.won).length,rows:rows.filter(Boolean)});
 const save=()=>writeFileSync(qiOnly?'docs/dawn-original-monk-qi-progression.json':lifecycle?'docs/dawn-original-lifecycle-progression.json':onlyAffected?'docs/dawn-live-resonance-progression.json':'docs/dawn-progression-audit.json',JSON.stringify(report(),null,2)+'\n');
 const send=w=>{if(next<cases.length){const index=next++;w.postMessage({index,...cases[index]});}};
 try{await new Promise((resolve,reject)=>{
  for(const w of workers){w.on('error',reject);w.on('message',({index,row})=>{rows[index]=row;done++;save();console.log(`${done}/${cases.length} ${row.job}/${row.pair} ${row.error?'ERROR':row.won?'WIN':'LOSS'} farm=${row.farmSeconds}s boss=${row.bossSeconds}s`);if(done===cases.length)resolve();else send(w);});send(w);}
 });}finally{await Promise.all(workers.map(w=>w.terminate()));}
 save();if(rows.some(r=>r.error||!r.won))process.exitCode=1;
}
