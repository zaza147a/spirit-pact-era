import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
import {DAWN_BOSS} from '../dist/dawn-world.js';

test('dawnBoss audit uses actual level-210 HP, ATK and a real victory clock',()=>{
 const result=runBuild('knight','attack',{level:210,encounterLevel:210,gearLevel:200,
  scenario:'dawnBoss',seconds:120,seed:42,reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',
  fusionPair:'attack-magic',enhancement:'S'});
 assert.equal(result.initialTargets[0].id,DAWN_BOSS.id);
 assert.equal(result.initialTargets[0].hp,DAWN_BOSS.hp);
 assert.equal(result.initialTargets[0].atk,DAWN_BOSS.atk);
 // Kill counters also include summoned adds; only the actual boss-clear flag
 // and its clock can establish a victory.
 assert.equal(result.bossVictory,result.timeToKill!==null);
 assert.ok(result.timeToKill===null||result.timeToKill>=0&&result.timeToKill<=120);
});
