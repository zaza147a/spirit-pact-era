import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';

// An actual-runtime progression audit: entry with previous-band gear,
// end of band with matching gear, and final Lv200 SSS graduation.
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fused={attack:'attack-defense',magic:'attack-magic',defense:'defense-support'};
const bands=[
 {entry:151,finish:160,previous:150},
 {entry:161,finish:170,previous:160},
 {entry:171,finish:180,previous:170},
 {entry:181,finish:190,previous:180},
 {entry:191,finish:200,previous:190}
];
const common={seconds:60,seed:731,reborn:true,thirdJob:true,thirdRank:70,
 rarity:'mythic',referenceBuild:true,referenceQuality:'mythic'};

test('Lv151-200 progression: prev-tier gear at entry versus matching gear, 10 jobs x 3 fused companion roles x 5 stages x field/boss',()=>{
 const rows=[];
 for(const band of bands)for(const phase of ['entry','prepared'])for(const job of jobs)
  for(const [role,fusionPair] of Object.entries(fused))
   for(const scenario of ['regional','bossTrial']){
    const level=phase==='entry'?band.entry:band.finish;
    const gearLevel=phase==='entry'?band.previous:band.finish;
    const enhancement=level===200?'SSS':null;
    const r=runBuild(job,role,{...common,level,encounterLevel:level,
      gearLevel,petLevelOverride:level,fusionPair,scenario,
      enhancement,petEnhancement:enhancement});
    const row={band:band.finish,phase,level,gearLevel,job,role,scenario,
      playerHp:r.maxHp,petHp:r.stats.pet.hp,
      playerDef:r.stats.owner.def,playerFlee:r.stats.owner.flee,
      petDef:r.stats.pet.def,petMdef:r.stats.pet.mdef,petFlee:r.stats.pet.flee,
      playerAlive:r.alive,petAlive:r.petAlive,petDeaths:r.petDeaths,
      potions:r.potions,kills:r.kills,bossVictory:r.bossVictory??null};
    assert.ok(row.playerHp>0&&row.petHp>0,'healthy stats');
    assert.ok(row.petDeaths>=0&&Number.isFinite(row.petDeaths),'valid death count');
    rows.push(row);
   }
 const summary=[];
 for(const band of bands)for(const phase of ['entry','prepared'])
  for(const scenario of ['regional','bossTrial']){
   const v=rows.filter(r=>r.band===band.finish&&r.phase===phase&&r.scenario===scenario);
   summary.push({band:band.finish,phase,scenario,cases:v.length,
      ownerDeaths:v.filter(r=>!r.playerAlive).length,
      petDeaths:v.reduce((n,r)=>n+r.petDeaths,0),
      petAlive:v.filter(r=>r.petAlive).length,
      potionUses:v.reduce((n,r)=>n+r.potions,0),
      bossVictories:v.filter(r=>r.bossVictory).length,
      hpByRole:Object.fromEntries(Object.keys(fused).map(role=>
       [role,Math.round(v.filter(r=>r.role===role).reduce((n,r)=>n+r.petHp,0)/10)]))});
  }
 console.log('PROGRESSION_151_200_SUMMARY',JSON.stringify(summary));
 console.log('PROGRESSION_151_200_ROWS',JSON.stringify(rows));
 assert.equal(rows.length,600);
 assert.equal(summary.length,20);
});
