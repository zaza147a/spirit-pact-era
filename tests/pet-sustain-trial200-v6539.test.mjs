import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const roles=['attack','magic','defense','support'];
test('Lv200 five-boss trial chain with SSS owner and pet gear, all jobs and pet roles',()=>{
 const rows=[];
 for(const job of jobs)for(const role of roles){
  const r=runBuild(job,role,{level:200,encounterLevel:200,gearLevel:200,
   scenario:'trialChain',trialMap:'worldroot',seconds:300,seed:731,reborn:true,thirdJob:true,
   rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',
   enhancement:'SSS',petEnhancement:'SSS'});
  rows.push({job,role,won:!!r.chainComplete,kills:r.chainKills||0,
   seconds:r.elapsed,alive:r.alive,petDeaths:r.petDeaths,potions:r.potions,petAlive:r.petAlive});
 }
 const totals=rows.reduce((acc,r)=>{acc.wins+=r.won;acc.ownerDeaths+=!r.alive;acc.petDeaths+=r.petDeaths;acc.potions+=r.potions;return acc;},{cases:rows.length,wins:0,ownerDeaths:0,petDeaths:0,potions:0});
 console.log('LV200_SSS_TRIAL_SUMMARY',JSON.stringify(totals));
 console.log('LV200_SSS_TRIAL_ROWS',JSON.stringify(rows));
 assert.equal(rows.length,40);
 for(const r of rows)assert.ok(r.kills>=0&&r.kills<=5&&Number.isFinite(r.petDeaths));
});
