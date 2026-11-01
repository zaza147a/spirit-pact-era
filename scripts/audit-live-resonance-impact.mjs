import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
const allRoutes=[['priest','attack-support'],['performer','attack-defense'],['performer','attack-support'],['performer','magic-support'],['performer','defense-support']];
const melodyOnly=process.argv.includes('--melody-only');
const routes=melodyOnly?allRoutes.filter(([job,pair])=>job==='performer'&&pair==='defense-support'):allRoutes;
const combos=[];for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let c=b+1;c<6;c++)combos.push([a,b,c]);
const reference={reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic'};
const cases=routes.flatMap(([job,pair])=>[
 ...combos.map(choice=>({job,pair,kind:'fiveBoss',choice,options:{...reference,level:200,encounterLevel:200,gearLevel:190,seconds:600,seed:731,scenario:'trialChain',trialMap:'worldroot',fusionPair:pair,petSkills:choice.map(i=>`fusion_${pair}_${i}`),gearStrength:.9,allocationStrength:.9,cardStrength:.9}})),
 ...[42,137,731].flatMap(seed=>[
  {job,pair,kind:'field201',options:{...reference,level:201,encounterLevel:201,gearLevel:200,seconds:60,seed,scenario:'regional',fusionPair:pair,enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0}},
  {job,pair,kind:'boss210',options:{...reference,level:210,encounterLevel:210,gearLevel:200,seconds:240,seed,scenario:'dawnBoss',fusionPair:pair,enhancement:'SSS',petEnhancement:'SSS',dawnSigil:4}}
 ])
]);
const rows=Array(cases.length),workers=Array.from({length:4},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
let next=0,done=0;
try{await new Promise((resolve,reject)=>{
 const send=w=>{if(next<cases.length){const index=next++;const c=cases[index];w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:c.options});}};
 for(const w of workers){w.on('error',reject);w.on('message',m=>{
  if(m.error){reject(Error(m.error));return;}
  const c=cases[m.index],r=m.result;
  rows[m.index]={kind:c.kind,job:c.job,pair:c.pair,choice:c.choice,seed:c.options.seed,
   won:c.kind==='fiveBoss'?!!r.chainComplete:c.kind==='boss210'?!!r.bossVictory:undefined,
   kills:c.kind==='fiveBoss'?r.chainKills:r.kills,seconds:c.kind==='boss210'?r.timeToKill:r.elapsed,
   alive:r.alive,petDeaths:r.petDeaths,potions:r.potions,score:r.score,contribution:r.contribution};
  if(++done%10===0)console.log(`impact ${done}/${cases.length}`);
  if(done===cases.length)resolve();else send(w);
 });send(w);}
});}finally{await Promise.all(workers.map(w=>w.terminate()));}
const summary=['fiveBoss','field201','boss210'].map(kind=>{const a=rows.filter(r=>r.kind===kind);return {kind,count:a.length,wins:a.filter(r=>r.won).length,alive:a.filter(r=>r.alive).length,failed:a.filter(r=>kind==='field201'?!r.alive:!r.won)};});
writeFileSync(melodyOnly?'docs/live-melody-auto-impact.json':'docs/live-resonance-impact.json',JSON.stringify({conditions:'Post live-event fix: all five affected original pacts. Five-boss: all 20 triplets, seed731, unenhanced prior-tier Lv200 reference. Field201 and actual boss210: SSS owner/pet reference gear, three seeds42/137/731, sigil0/IV respectively. No fixed contribution ratios. Changes: generic buff alias without double energy, performer defense-support effective healing, performer attack-defense 20s accumulation window.',summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(rows.some(r=>r.kind==='field201'?!r.alive:r.kind==='boss210'&&!r.won))process.exitCode=1;
