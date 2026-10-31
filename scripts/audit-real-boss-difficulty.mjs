// Unlike the historical `boss` DPS fixture, bossTrial/dawnBoss use real boss HP.
import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS);
const zones=[['starter',10],['forest',20],['desert',30],['frost',40],['astral',50],
 ['volcano',60],['abyss',70],['ruins',80],['eclipse',90],['celestial',99],
 ['skyport',110],['gearfell',120],['aether',130],['stormforge',140],['zenith',150],
 ['starshore',160],['oathwood',170],['nightclock',180],['sungrave',190],['worldroot',200]];
const priorGear=level=>level<=99?Math.max(1,level-10):level<=110?90:level<=130?110:level<=150?130:level<=170?150:level<=190?170:190;
const cases=[],dawnOnly=process.argv.includes('--dawn-only');
for(const [map,level] of dawnOnly?[]:zones)for(const seed of [42,137,731])for(const job of jobs){
 const late=level>=151;
 cases.push({map,level,seed,job,pair:late?'attack-magic':'attack',options:{level,encounterLevel:level,
  gearLevel:priorGear(level),seconds:120,seed,scenario:'bossTrial',reborn:level>=101,
  thirdJob:late,referenceBuild:level>=101,referenceQuality:late?'mythic':'legendary',
  rarity:late?'mythic':level<=99?'uncommon':'legendary',
  fusionPair:late?'attack-magic':undefined,enhancement:null,
  gearStrength:level<=50?.7:level<=99?.8:level<=150?.8:.9,
  allocationStrength:level<=50?.7:level<=99?.8:level<=150?.8:.9,
  cardStrength:level<=150?.8:.9}});
}
for(const enhancement of ['S','SSS'])for(const seed of [42,137,731])for(const job of jobs)for(const pair of pairs)
 cases.push({map:'dawnrift',level:210,seed,job,pair,enhancement,options:{level:210,encounterLevel:210,
  gearLevel:200,seconds:120,seed,scenario:'dawnBoss',reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement}});

const workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
const rows=Array(cases.length);
await new Promise((resolve,reject)=>{let at=0,done=0,failed=false;
 const send=w=>{if(at<cases.length){const index=at++,c=cases[index];w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:c.options});}};
 for(const w of workers){w.on('error',e=>{if(!failed){failed=true;reject(e)}});w.on('message',m=>{
  if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}
  const {options,...metadata}=cases[m.index],r=m.result;
  rows[m.index]={...metadata,bossId:r.initialTargets[0]?.id,bossHp:r.initialTargets[0]?.hp,
   won:r.bossVictory===true,timeToKill:r.timeToKill,alive:r.alive,potions:r.potions,petDeaths:r.petDeaths,ownerShare:r.ownerShare};
  if(++done===cases.length)resolve();else send(w);
 });send(w);}
});
await Promise.all(workers.map(w=>w.terminate()));
const avg=a=>a.length?a.reduce((n,v)=>n+v,0)/a.length:null;
const summarize=items=>({total:items.length,wins:items.filter(x=>x.won).length,
 avgWinSeconds:avg(items.filter(x=>x.won).map(x=>x.timeToKill)),
 avgPotions:avg(items.map(x=>x.potions)),petDeaths:items.reduce((n,x)=>n+x.petDeaths,0)});
const summary=zones.map(([map,level])=>({map,level,...summarize(rows.filter(x=>x.map===map))}));
const dawn=['S','SSS'].map(enhancement=>({enhancement,...summarize(rows.filter(x=>x.map==='dawnrift'&&x.enhancement===enhancement))}));
const output={notes:'Real named boss HP/ATK, actual victory clock, 120s fixed window. Earlier boss=1e9 sustained-damage fixtures are NOT real boss clears. Supplies are abundant and revenue is not tested.',total:rows.length,summary,dawn,rows};
writeFileSync(dawnOnly?'docs/dawn-boss-rebalance-audit.json':'docs/real-boss-difficulty-audit.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({total:rows.length,summary,dawn},null,2));
