import {readFileSync,writeFileSync} from 'node:fs';
import {runBuild} from './optimized-dps-simulator.mjs';

// Replay optimized legal-looking fixtures against 210 boss + four 201-area mobs.
// Uses the actual combat engine. Survivability and real-world drop rarity are separate concerns.
const source=JSON.parse(readFileSync('docs/weapon-fusion-audit-v6547.json'));
if(source.completed!==source.total)throw Error('Weapon/fusion optimization is not complete');
const rows=[];
for(const entry of source.rows){
 const {job,pair,weapon,offhand,cfg,equipment}=entry;
 const samples=[42,137,731].map(seed=>runBuild(job,pair.split('-')[0],{
  level:210,encounterLevel:201,gearLevel:200,petLevelOverride:200,
  scenario:'bossCrowdTrial',seconds:60,seed,reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,
  enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,petSkills:cfg.skills,
  searchConfig:(p,pet)=>{
   p.dawnUnlocked=true;p.attributes={...cfg.attrs};p.sockets={...equipment.sockets};
   p.gear=structuredClone(equipment.gear);pet.gear=structuredClone(equipment.petGear);
   pet.iv=Object.fromEntries(Object.keys(pet.iv).map(key=>[key,5]));
  }
 }));
 rows.push({job,pair,weapon,offhand,pureDps:entry.dps,
  bossVictories:samples.filter(x=>x.bossVictory).length,
  alive:samples.filter(x=>x.alive).length,
  meanBossTime:samples.every(x=>x.timeToKill!==null)?samples.reduce((sum,x)=>sum+x.timeToKill,0)/3:null,
  meanDps:samples.reduce((sum,x)=>sum+x.dps,0)/3,
  meanKills:samples.reduce((sum,x)=>sum+x.kills,0)/3,
  samples:samples.map(x=>({bossVictory:x.bossVictory,alive:x.alive,timeToKill:x.timeToKill,kills:x.kills,dps:x.dps,ownerDps:x.ownerDps,petDps:x.petDps,remainingHp:x.remainingHp}))});
 console.log(`${rows.length}/${source.rows.length} ${job} ${weapon} ${pair} boss ${rows.at(-1).bossVictories}/3`);
}
writeFileSync('docs/weapon-boss-audit-v6547.json',JSON.stringify({conditions:{level:210,scenario:'bossCrowdTrial',boss:'dawnrift',mobs:4,seeds:[42,137,731],seconds:60,source:'weapon-fusion-audit-v6547.json',note:'Controlled boss + four mobs, not natural spawn frequency or economy.'},rows},null,2)+'\n');
