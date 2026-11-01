import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
import {normalMonsterStats} from '../dist/progression.js';

const reference={level:99,encounterLevel:99,gearLevel:89,seconds:45,seed:731,
 scenario:'regional',reborn:false,thirdJob:false,referenceBuild:false,
 referenceQuality:'legendary',rarity:'uncommon',gearStrength:.8,
 allocationStrength:.8,cardStrength:.8};

test('celestial tier retains an elite climb but no longer unexpectedly kills the two vulnerable second jobs',()=>{
 assert.ok(normalMonsterStats(99,true).atk>normalMonsterStats(91).atk);
 for(const job of ['wizard','assassin']){
  const result=runBuild(job,'attack',reference);
  assert.equal(result.alive,true,`${job} failed at ${result.elapsed}s`);
  assert.ok(result.kills>=20,`${job} could not clear the tier`);
 }
});
