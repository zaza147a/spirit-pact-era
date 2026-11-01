// Recheck every initially failing six-choose-three trial against two more seeds.
import {readFileSync,writeFileSync} from 'node:fs';
import {Worker} from 'node:worker_threads';

const failed=JSON.parse(readFileSync('docs/five-boss-skill-combos.json','utf8')).rows.filter(r=>!r.won);
const cases=failed.flatMap(row=>[42,137].map(seed=>({job:row.job,pair:row.pair,choice:row.choice,seed,
 options:{level:200,encounterLevel:200,gearLevel:190,seconds:600,seed,
  scenario:'trialChain',trialMap:'worldroot',fusionPair:row.pair,
  petSkills:row.choice.map(i=>`fusion_${row.pair}_${i}`),enhancement:null,reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',gearStrength:.9,
  allocationStrength:.9,cardStrength:.9}})));
const rows=Array(cases.length),workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
await new Promise((resolve,reject)=>{let next=0,done=0,failed=false;
 const send=w=>{if(next<cases.length){const i=next++,r=cases[i];w.postMessage({index:i,job:r.job,role:r.pair.split('-')[0],options:r.options});}};
 for(const w of workers){w.on('error',e=>{if(!failed){failed=true;reject(e);}});w.on('message',m=>{
  if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}
  const c=cases[m.index],r=m.result;
  rows[m.index]={job:c.job,pair:c.pair,choice:c.choice,seed:c.seed,won:!!r.chainComplete,
   kills:r.chainKills,seconds:r.elapsed,alive:r.alive,petDeaths:r.petDeaths,potions:r.potions};
  if(++done===cases.length)resolve();else send(w);
 });send(w);}
});
await Promise.all(workers.map(w=>w.terminate()));
const groups=failed.map(f=>{const extra=rows.filter(r=>r.job===f.job&&r.pair===f.pair&&r.choice.join(',')===f.choice.join(','));
 return {job:f.job,pair:f.pair,choice:f.choice,winsIncludingBaseline:extra.filter(r=>r.won).length,additionalRuns:extra};
});
const report={conditions:'12 six-choose-three configurations that failed the 600s Worldroot five-boss chain at seed 731, repeated under seeds 42 and 137 with identical legal level-200 unenhanced gear and skills.',cases:rows.length,wins:rows.filter(r=>r.won).length,groups,rows};
writeFileSync('docs/five-boss-skill-failure-recheck.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({cases:report.cases,wins:report.wins,groups:groups.map(({additionalRuns,...group})=>group)},null,2));
