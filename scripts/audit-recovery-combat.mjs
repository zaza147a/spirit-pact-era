// Fresh, deterministic audit of all 10 second/third jobs × 12 ordered fusion types.
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {runBuild} from './balance-v24.mjs';
const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS);
if(jobs.length!==10||pairs.length!==12)throw Error(`Expected 10 jobs and 12 ordered fusion types; got ${jobs.length}/${pairs.length}`);
const rows=[];
for(const level of [201,210])for(const job of jobs)for(const pair of pairs){
 const result=runBuild(job,pair.split('-')[0],{level,encounterLevel:level,gearLevel:200,scenario:level===210?'boss':'regional',seconds:20,seed:731,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement:'SSS'});
 rows.push({level,job,pair,alive:result.alive,kills:result.kills,ownerDps:result.ownerDps,petDps:result.petDps,ownerShare:result.ownerShare,score:result.score});
}
const summary={audit:'201 field / 210 boss – all 120 ordered job×fusion configurations',source:'fresh simulation; not earlier unpublished local builds',seconds:20,seed:731,samples:rows.length,byLevel:Object.fromEntries([201,210].map(level=>{const entries=rows.filter(r=>r.level===level);return [level,{configurations:entries.length,alive:entries.filter(x=>x.alive).length,avgPetShare:entries.reduce((n,x)=>n+1-x.ownerShare,0)/entries.length,minPetShare:Math.min(...entries.map(x=>1-x.ownerShare)),maxPetShare:Math.max(...entries.map(x=>1-x.ownerShare)),avgKills:entries.reduce((n,x)=>n+x.kills,0)/entries.length}]})),rows};
writeFileSync('docs/recovery-combat-audit.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary.byLevel,null,2));
console.log(`Verified ${rows.length} simulation profiles.`);
