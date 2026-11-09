import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';
test('same seed reproduces actual field encounters, contribution events and resource use',()=>{
 const options={scenario:'field',seconds:30,seed:123},a=runBuild('monk','defense',options),b=runBuild('monk','defense',options);
 assert.deepEqual(a.metrics,b.metrics);assert.equal(a.kills,b.kills);assert.equal(a.potions,b.potions);assert.equal(a.remainingHp,b.remainingHp);assert.deepEqual(a.stats,b.stats);
});
