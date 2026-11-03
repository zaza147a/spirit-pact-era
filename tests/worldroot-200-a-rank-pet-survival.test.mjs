import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fusions={attack:'attack-defense',magic:'attack-magic',defense:'defense-support'};
test('original Lv200 five trial bosses: A-rank enhanced owner and fused pet gear survival, 30 real battles each',()=>{
 const rows=[];
 for(let index=0;index<5;index++)for(const job of jobs)for(const [role,fusionPair] of Object.entries(fusions)){
  const r=runBuild(job,role,{level:200,encounterLevel:200,gearLevel:200,petLevelOverride:200,
   trialMap:'worldroot',trialIndex:index,scenario:'bossTrial',seconds:120,
   rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',
   reborn:true,thirdJob:true,thirdRank:70,fusionPair,
   enhancement:'A',petEnhancement:'A',seed:731});
  rows.push({stage:index+1,job,role,petDeaths:r.petDeaths,petAlive:r.petAlive,
    ownerAlive:r.alive,bossVictory:!!r.bossVictory,potions:r.potions,petHp:r.stats.pet.hp});
 }
 const summary=Array.from({length:5},(_,i)=>{const a=rows.filter(x=>x.stage===i+1);
  return {stage:i+1,cases:a.length,petDeaths:a.reduce((n,x)=>n+x.petDeaths,0),
   petDeadAtEnd:a.filter(x=>!x.petAlive).length,
   ownerDeaths:a.filter(x=>!x.ownerAlive).length,
   wins:a.filter(x=>x.bossVictory).length,potions:a.reduce((n,x)=>n+x.potions,0),
   petDeathsByRole:Object.fromEntries(Object.keys(fusions).map(role=>[role,a.filter(x=>x.role===role).reduce((n,x)=>n+x.petDeaths,0)]))};
 });
 console.log('WORLDROOT_200_A_GEAR_PET_SURVIVAL',JSON.stringify(summary));
 console.log('WORLDROOT_200_A_GEAR_PET_ROWS',JSON.stringify(rows));
 assert.equal(rows.length,150);
 for(const row of rows)assert.ok(Number.isFinite(row.petDeaths)&&row.petDeaths>=0);
});
