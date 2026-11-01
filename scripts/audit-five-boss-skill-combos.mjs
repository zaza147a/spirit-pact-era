import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const engineHash=createHash('sha256').update(readFileSync(new URL('../dist/game.js',import.meta.url))).digest('hex');
// Trial-chain balance across all 20 legal fusion skill triplets. Uses a
// representative subset of jobs; this is not the full 10-job × 12-pair matrix.
import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {SECOND_JOBS} from '../dist/jobs.js';

const full=process.argv.includes('--full');
const pairs=full?Object.keys(FUSION_PAIRS):Object.keys(FUSION_PAIRS).slice(0,6),jobs=full?Object.keys(SECOND_JOBS):['crusader','wizard','sage'],seed=731;
const requestedJob=process.argv.find(a=>a.startsWith('--job='))?.slice(6);
if(requestedJob){if(!jobs.includes(requestedJob))throw Error('Invalid audit job');jobs.splice(0,jobs.length,requestedJob);}
const combos=[];
for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)combos.push([a,b,c]);
const cases=jobs.flatMap(job=>pairs.flatMap(pair=>combos.map(choice=>({job,pair,choice,
 options:{level:200,encounterLevel:200,gearLevel:190,seconds:600,seed,
  scenario:'trialChain',trialMap:'worldroot',fusionPair:pair,
  petSkills:choice.map(i=>`fusion_${pair}_${i}`),enhancement:null,reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',
  gearStrength:.9,allocationStrength:.9,cardStrength:.9}}))));
const rows=Array(cases.length),workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
await new Promise((resolve,reject)=>{
 let next=0,done=0,failed=false;
 const send=w=>{if(next<cases.length){const i=next++,r=cases[i];w.postMessage({index:i,job:r.job,role:r.pair.split('-')[0],options:r.options});}};
 for(const w of workers){
  w.on('error',error=>{if(!failed){failed=true;reject(error);}});
  w.on('message',m=>{
   if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}
   const c=cases[m.index],r=m.result;
   rows[m.index]={job:c.job,pair:c.pair,choice:c.choice,seed,
    won:!!r.chainComplete,kills:r.chainKills,seconds:r.elapsed,
    alive:r.alive,petDeaths:r.petDeaths,potions:r.potions};
   if(++done%60===0)console.log('evaluated',done,'/',cases.length);
   if(done===cases.length)resolve();else send(w);
  });send(w);
 }
});
await Promise.all(workers.map(w=>w.terminate()));
const median=a=>{const values=a.sort((a,b)=>a-b);return values.length?values[Math.floor(values.length/2)]:null;};
const summary=jobs.map(job=>({job,byPair:pairs.map(pair=>{
 const rs=rows.filter(r=>r.job===job&&r.pair===pair),wins=rs.filter(r=>r.won);
 return {pair,n:rs.length,wins:wins.length,medianWinSeconds:median(wins.map(r=>r.seconds)),
  maxWinSeconds:wins.length?Math.max(...wins.map(r=>r.seconds)):null,
  choicesWithFailures:rs.filter(r=>!r.won).map(r=>r.choice)};
})}));
const wins=rows.filter(r=>r.won);
const report={sourceCommit,engineHash,engineUnchanged:engineHash===createHash('sha256').update(readFileSync(new URL('../dist/game.js',import.meta.url))).digest('hex'),conditions:(full?'Full 10-job × 12-ordered-fusion × 20-skill-triplet matrix. ':'Representative subset. ')+'Actual consecutive five Lv191 Worldroot bosses with legal unenhanced Lv200 prior-tier mythic owner+pet gear; all 20 of six-choose-three pet skill sets for each selected third job and ordered fusion, one seed 731, 600-second window; further seeds/allocations/gear remain pending.',count:rows.length,wins:wins.length,medianWinSeconds:median(wins.map(r=>r.seconds)),summary,rows};
writeFileSync(requestedJob?`matrix-${requestedJob}.json`:process.argv.includes('--current')?'docs/five-boss-full-skill-current.json':full?'docs/five-boss-full-skill-matrix.json':process.argv.includes('--tuned')?'docs/five-boss-skill-combos-tuned.json':'docs/five-boss-skill-combos.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,wins:report.wins,medianWinSeconds:report.medianWinSeconds,summary},null,2));
