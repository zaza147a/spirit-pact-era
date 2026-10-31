import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

// An unenhanced Lv200 reference build; enhancement is also legal before Lv201.
const canonical=Object.keys(FUSION_PAIRS).slice(0,6),seeds=process.argv.includes('--three-seeds')?[42,137,731]:[731],jobs=Object.keys(SECOND_JOBS);
const cases=seeds.flatMap(seed=>jobs.flatMap(job=>canonical.map(pair=>({job,pair,seed,options:{level:200,encounterLevel:200,gearLevel:190,seconds:600,seed,scenario:'trialChain',trialMap:'worldroot',fusionPair:pair,enhancement:null,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',gearStrength:.9,allocationStrength:.9,cardStrength:.9}}))));
const workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url))),rows=Array(cases.length);
await new Promise((resolve,reject)=>{let next=0,done=0,failed=false;const send=w=>{if(next<cases.length){const index=next++,c=cases[index];w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:c.options});}};for(const w of workers){w.on('error',e=>{if(!failed){failed=true;reject(e);}});w.on('message',m=>{if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}const c=cases[m.index],r=m.result;rows[m.index]={job:c.job,pair:c.pair,seed:c.seed,completed:!!r.chainComplete,kills:r.chainKills,elapsed:r.elapsed,alive:r.alive,petDeaths:r.petDeaths,potions:r.potions};if(++done===cases.length)resolve();else send(w);});send(w);}});
await Promise.all(workers.map(w=>w.terminate()));
const won=rows.filter(r=>r.completed),seconds=won.map(r=>r.elapsed).sort((a,b)=>a-b),median=seconds.length?seconds[Math.floor(seconds.length/2)]:null;
const byPair=canonical.map(pair=>{const a=rows.filter(r=>r.pair===pair),w=a.filter(r=>r.completed);return {pair,wins:w.length,total:a.length,meanWinSeconds:w.length?w.reduce((s,r)=>s+r.elapsed,0)/w.length:null,meanPotions:a.reduce((s,r)=>s+r.potions,0)/a.length};});
const report={version:'one legal unenhanced Lv200 reference (enhancements optional)',conditions:'10 third jobs × 6 canonical fusion roles × seeds; five consecutive real worldroot trial bosses, prior-tier mythic gear/cards and 90% reference power, 600s window, no enhancement in this reference case, real cooldown and carryover; ample potions',count:rows.length,wins:won.length,medianWinSeconds:median,minWinSeconds:seconds[0]??null,maxWinSeconds:seconds.at(-1)??null,byPair,rows};
writeFileSync('docs/legal-five-boss-trial-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined},null,2));
