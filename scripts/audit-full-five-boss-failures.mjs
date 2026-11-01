import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync} from 'node:fs';
const base=JSON.parse(readFileSync('docs/five-boss-full-skill-matrix.json','utf8'));
const cases=base.failed.flatMap(r=>[
 ...[42,137].map(seed=>({...r,replaySeed:seed,enhancement:null})),
 {...r,replaySeed:731,enhancement:'A'}
]);
const rows=Array(cases.length),workers=Array.from({length:4},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
let next=0,done=0;
try{if(cases.length)await new Promise((resolve,reject)=>{
 const send=w=>{if(next<cases.length){const index=next++,r=cases[index];w.postMessage({index,job:r.job,role:r.pair.split('-')[0],options:{level:200,encounterLevel:200,gearLevel:190,seconds:600,seed:r.replaySeed,scenario:'trialChain',trialMap:'worldroot',fusionPair:r.pair,petSkills:r.choice.map(i=>`fusion_${r.pair}_${i}`),enhancement:r.enhancement,petEnhancement:r.enhancement,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',gearStrength:.9,allocationStrength:.9,cardStrength:.9}});}};
 for(const w of workers){w.on('error',reject);w.on('message',m=>{if(m.error){reject(Error(m.error));return;}const c=cases[m.index],r=m.result;rows[m.index]={job:c.job,pair:c.pair,choice:c.choice,skillKinds:c.skillKinds,seed:c.replaySeed,enhancement:c.enhancement,won:!!r.chainComplete,kills:r.chainKills,seconds:r.elapsed,alive:r.alive,petDeaths:r.petDeaths,potions:r.potions};if(++done%10===0)console.log('failure replay',done,'/',cases.length);if(done===cases.length)resolve();else send(w);});send(w);}
});}finally{await Promise.all(workers.map(w=>w.terminate()));}
const summary=[null,'A'].map(enhancement=>{const a=rows.filter(r=>r.enhancement===enhancement);return {enhancement,count:a.length,wins:a.filter(r=>r.won).length,defeated:a.filter(r=>!r.alive).length,timeout:a.filter(r=>r.alive&&!r.won).length};});
writeFileSync('docs/five-boss-full-failure-replays.json',JSON.stringify({conditions:'Each failed full-matrix triplet replayed with seeds42/137 unenhanced, plus seed731 with both player and pet A-rank reference gear. Prior-tier Lv200 mythic90% fixture,600s. A gear is a valid prepared fixture, not an audit of material acquisition; no balance requirement that every unenhanced all-protection selection win.',failedTriplets:base.failed.length,summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
