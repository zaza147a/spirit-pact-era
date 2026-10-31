import {writeFileSync} from 'node:fs';
import {runBuild} from './balance-v24.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS),rows=[];
const scenarios=[
 ...[151,171,191].flatMap(gearLevel=>[191,200].map(level=>({name:'gear-curve',level,gearLevel,enhancement:null,seconds:45,seed:731,scenario:'regional'}))),
 ...[191,195,200].flatMap(level=>['sage','knight'].map(job=>({name:'survival',level,gearLevel:191,enhancement:null,seconds:90,seed:731,scenario:'regional',job}))),
 ...[42,137,731].flatMap(seed=>['S','SSS'].map(enhancement=>({name:'boss-long',level:210,gearLevel:200,enhancement,seconds:120,seed,scenario:'boss'})))
];
for(const cfg of scenarios){
 const selectedJobs=cfg.job?[cfg.job]:jobs;
 for(const job of selectedJobs)for(const pair of pairs){
  const result=runBuild(job,pair.split('-')[0],{level:cfg.level,encounterLevel:cfg.level,gearLevel:cfg.gearLevel,scenario:cfg.scenario,seconds:cfg.seconds,seed:cfg.seed,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement:cfg.enhancement});
  rows.push({scenario:cfg.name,level:cfg.level,gearLevel:cfg.gearLevel,enhancement:cfg.enhancement,seed:cfg.seed,seconds:cfg.seconds,job,pair,alive:result.alive,kills:result.kills,ownerDps:result.ownerDps,petDps:result.petDps,score:result.score,ownerShare:result.ownerShare});
 }
}
const grouped=Object.groupBy(rows,r=>[r.scenario,r.level,r.gearLevel,r.enhancement||'none',r.seed].join('/'));
const summary=Object.entries(grouped).map(([key,rs])=>({key,n:rs.length,alive:rs.filter(x=>x.alive).length,avgKills:rs.reduce((n,r)=>n+r.kills,0)/rs.length,avgPetShare:rs.reduce((n,r)=>n+1-r.ownerShare,0)/rs.length,avgScore:rs.reduce((n,r)=>n+r.score,0)/rs.length}));
const output={conditions:'reference build, mythical fusion, stat normalization and 20ms simulation engine; results conditional on this fixture',count:rows.length,summary,rows};
writeFileSync('docs/recovery-balance-deep.json',JSON.stringify(output,null,2));
console.log(JSON.stringify(summary,null,2));
console.log('Simulations:',rows.length);
