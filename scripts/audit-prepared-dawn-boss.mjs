import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

// The 201–210 region is an SSS-only equipment environment. No S-tier or
// unenhanced loadout is an eligible configuration for its difficulty checks.
// Sigil 1–4 require field drops; tiers 5–8 require the boss core itself.
const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS),seeds=[42,137,731];
const stages=[
 {stage:'early-sss-sigil-0',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,seconds:240},
 {stage:'early-farm-sss-sigil-1',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:1,seconds:240},
 {stage:'partial-farm-sss-sigil-2',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:2,seconds:240},
 {stage:'advanced-farm-sss-sigil-3',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:3,seconds:240},
 {stage:'farmed-preboss-sss-only',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:4,seconds:240}
];
const selectedStages=process.argv.includes('--boundary-only')?stages.filter(s=>[0,4].includes(s.dawnSigil)):
 process.argv.includes('--intermediate-only')?stages.filter(s=>[1,2,3].includes(s.dawnSigil)):stages;
const cases=selectedStages.flatMap(stage=>seeds.flatMap(seed=>jobs.flatMap(job=>pairs.map(pair=>({stage,seed,job,pair})))));
const workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
const rows=Array(cases.length);
await new Promise((resolve,reject)=>{
 let next=0,done=0,failed=false;
 const send=w=>{
  if(next>=cases.length)return;
  const index=next++,c=cases[index];
  w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:{
   level:210,encounterLevel:210,gearLevel:200,seconds:c.stage.seconds,
   seed:c.seed,scenario:'dawnBoss',reborn:true,thirdJob:true,
   referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',
   fusionPair:c.pair,enhancement:c.stage.enhancement,
   petEnhancement:c.stage.petEnhancement,dawnSigil:c.stage.dawnSigil
  }});
 };
 for(const w of workers){
  w.on('error',e=>{if(!failed){failed=true;reject(e);}});
  w.on('message',m=>{
   if(failed)return;
   if(m.error){failed=true;reject(Error(m.error));return;}
   const c=cases[m.index],r=m.result;
   rows[m.index]={stage:c.stage.stage,seed:c.seed,job:c.job,pair:c.pair,won:!!r.bossVictory,
    alive:r.alive,timeToKill:r.timeToKill,petDeaths:r.petDeaths,potions:r.potions};
   if(++done===cases.length)resolve();else{if(process.argv.includes('--execution-recheck')&&done%120===0)console.error(`210 boss execution recheck: ${done}/${cases.length}`);send(w);}
  });
  send(w);
 }
});
await Promise.all(workers.map(w=>w.terminate()));
const summary=selectedStages.map(stage=>{
 const a=rows.filter(r=>r.stage===stage.stage),wins=a.filter(r=>r.won),times=wins.map(r=>r.timeToKill).sort((x,y)=>x-y);
 return {stage:stage.stage,enhancement:stage.enhancement,petEnhancement:stage.petEnhancement,
  dawnSigil:stage.dawnSigil,windowSeconds:stage.seconds,total:a.length,wins:wins.length,
  medianWinSeconds:times[Math.floor(times.length/2)]??null,
  minWinSeconds:times[0]??null,maxWinSeconds:times.at(-1)??null,
  byPair:pairs.map(pair=>({pair,wins:a.filter(r=>r.pair===pair&&r.won).length,total:a.filter(r=>r.pair===pair).length})),
  missed:a.filter(r=>!r.won).map(({job,pair,seed,alive,petDeaths})=>({job,pair,seed,alive,petDeaths}))};
});
writeFileSync(process.argv.includes('--execution-recheck')?'docs/prepared-dawn-boss-execution-recheck.json':process.argv.includes('--signature-recheck')?'docs/prepared-dawn-boss-signature-recheck.json':process.argv.includes('--boundary-only')?'docs/prepared-dawn-boss-role-recheck.json':process.argv.includes('--intermediate-only')?'docs/prepared-dawn-boss-intermediate-recheck.json':'docs/prepared-dawn-boss-audit.json',JSON.stringify({conditions:'201–210 SSS-only equipment. 10 jobs × 12 ordered fusion roles × 3 seeds, SSS player/pet gear and field-farmable sigil tiers against the real Lv210 archon with full 240s victory clock. Boundary checks 0/IV; intermediate checks I/II/III.',summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
