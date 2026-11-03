import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';

// Trial gates are tested individually without enhancement, so stage difficulty
// is not conflated with the S/SS/SSS post-200 enhancement progression.
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fusions={attack:'attack-defense',magic:'attack-magic',defense:'defense-support'};
test('Lv200 unenhanced matching gear: isolated five-boss difficulty and survival gradient across 30 top-class fused builds',()=>{
 const rows=[];
 for(let index=0;index<5;index++)for(const job of jobs)for(const [role,fusionPair] of Object.entries(fusions)){
  const r=runBuild(job,role,{level:200,encounterLevel:200,gearLevel:200,petLevelOverride:200,
   trialMap:'worldroot',trialIndex:index,scenario:'bossTrial',seconds:120,
   rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',
   reborn:true,thirdJob:true,thirdRank:70,fusionPair,
   enhancement:null,petEnhancement:null,seed:731});
  rows.push({stage:index+1,job,role,ownerAlive:r.alive,petAlive:r.petAlive,
   petDeaths:r.petDeaths,potions:r.potions,bossVictory:!!r.bossVictory,
   elapsed:r.elapsed,ownerHp:r.maxHp,petHp:r.stats.pet.hp});
 }
 const summary=Array.from({length:5},(_,index)=>{
  const stage=index+1,v=rows.filter(r=>r.stage===stage);
  return {stage,cases:v.length,ownerDeaths:v.filter(r=>!r.ownerAlive).length,
   petDeaths:v.reduce((n,r)=>n+r.petDeaths,0),
   petStanding:v.filter(r=>r.petAlive).length,
   potions:v.reduce((n,r)=>n+r.potions,0),
   bossVictories:v.filter(r=>r.bossVictory).length,
   medianElapsed:[...v.map(r=>r.elapsed)].sort((a,b)=>a-b)[14]};
 });
 console.log('WORLDROOT_200_UNENHANCED_STAGE_SUMMARY',JSON.stringify(summary));
 console.log('WORLDROOT_200_UNENHANCED_STAGE_ROWS',JSON.stringify(rows));
 assert.equal(rows.length,150);
 for(const r of rows)assert.ok(Number.isFinite(r.petDeaths)&&r.petDeaths>=0);
});
