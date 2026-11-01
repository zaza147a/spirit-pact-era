import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const engineHash=createHash('sha256').update(readFileSync(new URL('../dist/game.js',import.meta.url))).digest('hex');
import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
const fiveBoss=process.argv.includes('--five-boss');
const reference={reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',enhancement:'SSS',petEnhancement:'SSS'};
const cases=Object.keys(SECOND_JOBS).flatMap(job=>Object.keys(FUSION_PAIRS).flatMap(pair=>['critical','swift'].map(attributeProfile=>({job,pair,attributeProfile,kind:'boss210',options:{...reference,attributeProfile,level:210,encounterLevel:210,gearLevel:200,seconds:240,seed:137,scenario:'dawnBoss',fusionPair:pair,dawnSigil:4}}))));
if(fiveBoss)for(const c of cases){c.kind='fiveBoss';Object.assign(c.options,{level:200,encounterLevel:200,gearLevel:190,seconds:600,scenario:'trialChain',trialMap:'worldroot',enhancement:'A',petEnhancement:'A',dawnSigil:0,gearStrength:.9,allocationStrength:.9,cardStrength:.9});}
const rows=Array(cases.length),workers=Array.from({length:4},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
let next=0,done=0;
try{await new Promise((resolve,reject)=>{
 const send=w=>{if(next<cases.length){const index=next++;const c=cases[index];w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:c.options});}};
 for(const w of workers){w.on('error',reject);w.on('message',m=>{
  if(m.error){reject(Error(m.error));return;}
  const c=cases[m.index],r=m.result;
  rows[m.index]={kind:c.kind,job:c.job,pair:c.pair,attributeProfile:c.attributeProfile,attributes:r.attributes,seed:c.options.seed,
   won:c.kind==='fiveBoss'?!!r.chainComplete:c.kind==='boss210'?!!r.bossVictory:undefined,
   kills:c.kind==='fiveBoss'?r.chainKills:r.kills,seconds:c.kind==='boss210'?r.timeToKill:r.elapsed,
   alive:r.alive,petDeaths:r.petDeaths,potions:r.potions,score:r.score,contribution:r.contribution};
  if(++done%10===0)console.log(`impact ${done}/${cases.length}`);
  if(done===cases.length)resolve();else send(w);
 });send(w);}
});}finally{await Promise.all(workers.map(w=>w.terminate()));}
const summary=['fiveBoss','field201','boss210'].map(kind=>{const a=rows.filter(r=>r.kind===kind);return {kind,count:a.length,wins:a.filter(r=>r.won).length,alive:a.filter(r=>r.alive).length,failed:a.filter(r=>kind==='field201'?!r.alive:!r.won)};});
writeFileSync(fiveBoss?'docs/alternative-attribute-five-boss-audit.json':'docs/alternative-attribute-boss-audit.json',JSON.stringify({sourceCommit,engineHash,conditions:(fiveBoss?'Five consecutive Worldroot bosses, Lv200 with Lv190 prior-tier mythic A owner/pet gear; gear/card/allocation strength90%, seed137, default skills,600s. ':'Actual Archon, Lv210 with Lv200 prior-tier SSS owner/pet gear, sigilIV, seed137, default skills,240s. ')+'All 10 jobs × 12 ordered fusions × 2 alternative legal allocations; each transfers 30 points at identical invested budget and caps, toward critical LUK/DEX or swift AGI/DEX with capped excess moved to LUK. Tests combat configuration only; no claim of all seeds, lower gear, or actual farming.',summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(rows.some(r=>r.kind==='field201'?!r.alive:r.kind==='boss210'&&!r.won))process.exitCode=1;
