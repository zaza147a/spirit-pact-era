import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const roles=['attack','magic','defense','support'];
const fusionByRole={attack:'attack-defense',magic:'attack-magic',defense:'defense-support',support:null};
const baseline={level:210,encounterLevel:210,gearLevel:200,seconds:90,
 enhancement:'SSS',petEnhancement:'SSS',rarity:'mythic',
 referenceBuild:true,referenceQuality:'mythic',reborn:true,thirdJob:true,seed:731};
test('complete latest 210 full-combat sustain telemetry, ten jobs x four pet types x field/boss',()=>{
 const report=[];
 for(const job of jobs)for(const role of roles)for(const scenario of ['regional','dawnBoss']){
  const result=runBuild(job,role,{...baseline,scenario,
   ...(fusionByRole[role]?{fusionPair:fusionByRole[role],petLevelOverride:200}:{petLevelOverride:150})});
  const row={job,role,scenario,petLevel:result.stats.pet.level,seconds:result.elapsed,alive:result.alive,
   petAlive:result.petAlive,petDeaths:result.petDeaths,potions:result.potions,
   kills:result.kills,bossVictory:result.bossVictory??null,
   petMaxHp:result.stats.pet.hp,playerMaxHp:result.maxHp};
  assert.ok(Number.isFinite(row.petDeaths)&&row.petDeaths>=0);
  assert.ok(Number.isFinite(row.potions)&&row.potions>=0);
  report.push(row);
 }
 const aggregate=report.reduce((acc,r)=>{
  const key=r.scenario,slot=acc[key]??={cases:0,ownerDeaths:0,petDeaths:0,potions:0,petAlive:0,bossWins:0};
  slot.cases++;slot.ownerDeaths+=!r.alive;slot.petDeaths+=r.petDeaths;
  slot.potions+=r.potions;slot.petAlive+=r.petAlive;slot.bossWins+=!!r.bossVictory;return acc;
 },{});
 console.log('LATE_GAME_SURVIVAL_SUMMARY',JSON.stringify(aggregate));
 console.log('LATE_GAME_SURVIVAL_ROWS',JSON.stringify(report));
 assert.equal(report.length,80);
});
