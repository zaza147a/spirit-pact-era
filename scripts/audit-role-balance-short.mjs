import {runBuild} from './balance-v24.mjs';
import {damageSplitPcb} from '../dist/contribution.js';
import {SECOND_JOBS} from '../dist/jobs.js';
const jobs=Object.keys(SECOND_JOBS),levels=[110,160,200,201],pairs=['attack-magic','attack-support','magic-defense','defense-support'];
for(const level of levels)for(const pair of level<151?['attack','magic','defense','support']:pairs){
 const samples=jobs.map(job=>{const role=pair.split('-')[0],r=runBuild(job,role,{level,encounterLevel:level,gearLevel:level>=201?200:level>=191?190:level>=151?150:level>=111?110:90,seconds:45,seed:42,scenario:'regional',rarity:level>=151?'mythic':'legendary',referenceBuild:true,referenceQuality:level>=151?'mythic':'legendary',reborn:level>=101,thirdJob:level>=151,fusionPair:level>=151?pair:null,enhancement:level>=201?'SSS':null});return {r,pcb:damageSplitPcb({metrics:r.metrics})};});
 const avg=fn=>samples.reduce((s,x)=>s+fn(x),0)/samples.length;
 console.log(JSON.stringify({level,pair,kills:+avg(x=>x.r.kills).toFixed(2),alive:samples.filter(x=>x.r.alive).length,P:+avg(x=>x.pcb.ratios.P).toFixed(3),C:+avg(x=>x.pcb.ratios.C).toFixed(3),B:+avg(x=>x.pcb.ratios.B).toFixed(3)}));
}
