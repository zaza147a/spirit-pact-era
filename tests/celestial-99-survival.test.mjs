import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
import {normalMonsterStats} from '../dist/progression.js';

const reference={level:99,encounterLevel:99,gearLevel:89,seconds:45,seed:731,
 scenario:'regional',reborn:false,thirdJob:false,referenceBuild:false,
 referenceQuality:'legendary',rarity:'uncommon',gearStrength:.8,
 allocationStrength:.8,cardStrength:.8};

test('celestial tier pressure reflects adjacent-only AoE without changing monster stats',()=>{
 assert.ok(normalMonsterStats(99,true).atk>normalMonsterStats(91).atk);
 const wizard=runBuild('wizard','attack',reference),assassin=runBuild('assassin','attack',reference);
 assert.ok(wizard.kills>=20,'wizard must still clear at least twenty enemies before the tougher adjacent-only pressure');
 assert.ok(wizard.elapsed>0&&wizard.elapsed<=reference.seconds);
 assert.equal(assassin.alive,true);
 assert.ok(assassin.kills>=20);
});
