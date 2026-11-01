import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {damageSplitPcb} from '../dist/contribution.js';

const jobs=Object.keys(SECOND_JOBS),roles=['attack','magic','defense','support'],pairs=Object.keys(FUSION_PAIRS);
const tiers=[[99,90],[110,90],[130,110],[150,130],[160,150],[180,170],[200,190],[201,200]];
const selectedTiers=process.argv.includes('--201-only')?tiers.filter(([level])=>level===201):process.argv.includes('--focus')?tiers.filter(([level])=>[99,130,150].includes(level)):tiers;
const cases=[];
for(const [level,gearLevel] of selectedTiers)for(const seed of [42,137,731])for(const job of jobs)
 for(const pair of level>=151?pairs:roles)cases.push({level,job,pair,seed,
  options:{level,encounterLevel:level,gearLevel,seconds:120,seed,scenario:'regional',
   reborn:level>=101,thirdJob:level>=151,rarity:level>=151?'mythic':level>=101?'legendary':'uncommon',
   referenceBuild:level>=101,referenceQuality:level>=151?'mythic':'legendary',
   fusionPair:level>=151?pair:undefined,
   gearStrength:level>=151?.9:.8,allocationStrength:level>=151?.9:.8,
   cardStrength:level>=151?.9:.8,enhancement:level>=201?'SSS':null,
   petEnhancement:level>=201?'SSS':null,dawnSigil:0,
   trackBuffCoverage:process.argv.includes('--201-only')}});

const rows=Array(cases.length),workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
await new Promise((resolve,reject)=>{let next=0,done=0,failed=false;
 const send=w=>{if(next<cases.length){const i=next++,r=cases[i];w.postMessage({index:i,job:r.job,role:r.pair.split('-')[0],options:r.options});}};
 for(const w of workers){w.on('error',e=>{if(!failed){failed=true;reject(e)}});w.on('message',m=>{
  if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}
  const {options,...meta}=cases[m.index],r=m.result,pcb=damageSplitPcb({metrics:r.metrics});
  // Keep raw utility outcomes alongside mutually exclusive damage-source P/C/B.
  // Defensive/support fusions must be judged on actual prevention and recovery,
  // not forced to match an offense fusion's clear speed or damage percentages.
  rows[m.index]={...meta,kills:r.kills,alive:r.alive,potions:r.potions,
   P:pcb.ratios.P,C:pcb.ratios.C,B:pcb.ratios.B,
   playerTaken:r.metrics.playerTaken||0,petTaken:r.metrics.petTaken||0,
   petProtection:r.metrics.petProtection||0,shieldPrevented:r.metrics.shieldPrevented||0,
   effectiveHeal:r.metrics.effectiveHeal||0,playerHeal:r.metrics.playerHeal||0,
   buffDamage:r.metrics.buffDamage||0,playerBuffDamage:r.metrics.playerBuffDamage||0,
   blessingUptime:r.buffCoverage?.blessing??null,teamWardUptime:r.buffCoverage?.teamWard??null};
  if(++done===cases.length)resolve();else send(w);
 });send(w);}
});
await Promise.all(workers.map(w=>w.terminate()));
const avg=a=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);
const summary=selectedTiers.map(([level])=>{const a=rows.filter(r=>r.level===level),perJob=jobs.map(job=>{
 const jobRows=a.filter(r=>r.job===job),candidates=[...new Set(jobRows.map(r=>r.pair))].map(pair=>{
  const z=jobRows.filter(r=>r.pair===pair);return {pair,kills:avg(z.map(r=>r.kills))};
 }).sort((x,y)=>y.kills-x.kills);return {job,best:candidates[0],worst:candidates.at(-1)};
 });const bestValues=perJob.map(r=>r.best.kills).sort((a,b)=>a-b);
 return {level,n:a.length,alive:a.filter(r=>r.alive).length,avgKills:avg(a.map(r=>r.kills)),
  avgPotions:avg(a.map(r=>r.potions)),P:avg(a.map(r=>r.P)),C:avg(a.map(r=>r.C)),B:avg(a.map(r=>r.B)),
  bestBuildJobGap:bestValues.at(-1)/Math.max(.01,bestValues[0])-1,slowest:perJob.find(r=>r.best.kills===bestValues[0]),fastest:perJob.find(r=>r.best.kills===bestValues.at(-1)),perJob};
});
const output={conditions:'120s real combatTick, 3 seeds, previous-tier gear, 10 jobs and 4/12 companion choices. 201 uses mandatory SSS player+pet equipment with sigil 0 at the start of farming; best available pet choice per job, not exhaustive skill-order/attribute optimization.',count:rows.length,summary,rows};
writeFileSync(process.argv.includes('--201-only')?'docs/map-class-pcb-201-sss-audit.json':process.argv.includes('--focus')?'docs/map-class-pcb-focus-audit.json':'docs/map-class-pcb-audit.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,summary:summary.map(({perJob,...r})=>r)},null,2));
