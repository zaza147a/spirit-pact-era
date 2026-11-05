import test from 'node:test';
import assert from 'node:assert/strict';
import {armorMultisets,rawArmorConfigurations,equivalentArmorConfigurations} from '../scripts/legal-dps-search-space.mjs';

test('防具兩輸出詞條的完整組合與等價類數量正確',()=>{
 assert.equal(rawArmorConfigurations(),2562890625n);
 assert.equal(equivalentArmorConfigurations(),319770n);
 assert.equal([...armorMultisets(2)].length,120);
});
