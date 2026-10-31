// Release-gate diagnostics across every playable combat zone, not an automatic
// authorization to change difficulty or publish a build.
import {Worker} from 'node:worker_threads';
import {writeFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS),roles=['attack','magic','defense','support'];
const mapTiers=[
 ['starter',10],['forest',20],['desert',30],['frost',40],['astral',50],
 ['volcano',60],['abyss',70],['ruins',80],['eclipse',90],['celestial',99],
 ['skyport',110],['gearfell',120],['aether',130],['stormforge',140],['zenith',150],
 ['starshore',160],['oathwood',170],['nightclock',180],['sungrave',190],['worldroot',200],['dawnrift',201]
];
const priorGear=level=>level<=99?Math.max(1,level-10):level<=110?90:level<=130?110:level<=150?130:level<=170?150:level<=190?170:level<=200?190:200;
const cases=[];
for(const [map,level] of mapTiers){
 const late=level>=151,options={level,encounterLevel:level,gearLevel:priorGear(level),
  seconds:45,seed:731,scenario:'regional',reborn:level>=101,thirdJob:late,
  referenceBuild:level>=101,referenceQuality:late?'mythic':'legendary',
  rarity:late?'mythic':level<=99?'uncommon':'legendary',
  gearStrength:level<=50?.7:level<=99?.8:level<=150?.8:.9,
  allocationStrength:level<=50?.7:level<=99?.8:level<=150?.8:.9,
  cardStrength:level<=150?.8:.9,enhancement:level>=201?'SSS':null};
 for(const job of jobs)for(const pair of late?pairs:roles)
  cases.push({map,level,job,pair,options:{...options,fusionPair:late?pair:undefined}});
}
// Verify the low-tier gear penalty, long boss pressure, and enhancement separation.
for(const gearLevel of [151,171,191])for(const job of jobs)for(const pair of pairs)
 cases.push({map:'worldroot',level:200,job,pair,diagnostic:'gear-cross',gearLevel,
  options:{level:200,encounterLevel:200,gearLevel,seconds:45,seed:731,scenario:'regional',reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement:null}});
for(const enhancement of ['S','SSS'])for(const seed of [42,137,731])for(const job of jobs)for(const pair of pairs)
 cases.push({map:'dawnrift',level:210,job,pair,diagnostic:'boss',enhancement,seed,
  options:{level:210,encounterLevel:210,gearLevel:200,seconds:120,seed,scenario:'boss',reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement}});

const rows=Array(cases.length),workerCount=6,workers=Array.from({length:workerCount},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
await new Promise((resolve,reject)=>{
 let cursor=0,done=0,failed=false;
 const send=w=>{if(cursor<cases.length){const index=cursor++,c=cases[index];w.postMessage({index,job:c.job,role:c.pair.split('-')[0],options:c.options});}};
 for(const w of workers){w.on('error',err=>{if(!failed){failed=true;reject(err)}});w.on('message',({index,result,error})=>{
  if(failed)return;if(error){failed=true;reject(Error(error));return;}
  const {options,...caseMeta}=cases[index];rows[index]={...caseMeta,alive:result.alive,petAlive:result.petAlive,kills:result.kills,elapsed:result.elapsed,potions:result.potions,ownerDps:result.ownerDps,petDps:result.petDps,ownerShare:result.ownerShare};
  if(++done===cases.length)resolve();else send(w);
 });send(w);}
});
await Promise.all(workers.map(w=>w.terminate()));
const mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
const aggregate=values=>({n:values.length,alive:values.filter(x=>x.alive).length,
 avgKills:mean(values.map(x=>x.kills)),avgPotions:mean(values.map(x=>x.potions)),
 avgPetShare:mean(values.map(x=>1-x.ownerShare)),
 minKills:Math.min(...values.map(x=>x.kills)),maxKills:Math.max(...values.map(x=>x.kills))});
const zones=mapTiers.map(([map,level])=>({map,level,...aggregate(rows.filter(r=>r.map===map&&!r.diagnostic))}));
const crossing=[151,171,191].map(gearLevel=>({gearLevel,...aggregate(rows.filter(r=>r.diagnostic==='gear-cross'&&r.gearLevel===gearLevel))}));
const bosses=['S','SSS'].flatMap(enhancement=>[42,137,731].map(seed=>({enhancement,seed,...aggregate(rows.filter(r=>r.diagnostic==='boss'&&r.enhancement===enhancement&&r.seed===seed))})));
const result={conditions:'Live combatTick fixture, 45s region stress with immediate respawn and abundant supplies. Not encounter-wait, progression or economic balance. All pre-201 gear unenhanced; 201 SSS.',count:rows.length,zones,crossing,bosses,rows};
writeFileSync('docs/all-map-difficulty-audit.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,zones,crossing,bosses},null,2));
