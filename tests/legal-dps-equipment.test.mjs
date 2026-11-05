import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalArmor,OUTPUT_PAIRS,outputPairsForJob,legalEquipment,assertLegalItem} from '../scripts/legal-dps-equipment.mjs';

test('神話防具可以固定 DEF/MDEF/FLEE 與 HP% 並列舉兩條輸出詞條',()=>{
 assert.equal(OUTPUT_PAIRS.length,15);
 for(const pair of OUTPUT_PAIRS){
  const item=canonicalArmor('helm',pair,42);
  assert.deepEqual(Object.keys(item.affixes),['def','mdef','flee',...pair,'hpPct']);
  assert.equal(assertLegalItem(item),true);
 }
});
test('依職業主屬性限制兩條輸出詞條',()=>{
 assert.deepEqual(outputPairsForJob('wizard'),[['INT','AGI'],['INT','LUK'],['INT','DEX']]);
 assert.deepEqual(outputPairsForJob('priest'),[['INT','AGI'],['INT','LUK'],['INT','DEX']]);
 assert.deepEqual(outputPairsForJob('monk'),[['STR','AGI'],['STR','LUK']]);
 assert.deepEqual(outputPairsForJob('crusader'),[['STR','AGI'],['STR','LUK']]);
 assert.deepEqual(outputPairsForJob('hunter'),[['DEX','AGI'],['DEX','LUK']]);
 assert.deepEqual(outputPairsForJob('performer'),[['DEX','AGI'],['DEX','LUK']]);
});

test('夥伴裝備只接受原本部位的合法詞條',()=>{
 const head=legalEquipment('petHelm',{pet:true,seed:14});
 const body=legalEquipment('petArmor',{pet:true,seed:15});
 const shoes=legalEquipment('petBoots',{pet:true,seed:16});
 assert.ok([head,body,shoes].every(item=>assertLegalItem(item,{pet:true})));
 const illegal=structuredClone(head);
 illegal.affixes.hp=10000;
 assert.throws(()=>assertLegalItem(illegal,{pet:true}),/Illegal number|Illegal .* hp/);
});

test('不能把武器專屬特殊詞條放到防具',()=>{
 const armor=canonicalArmor('vest',OUTPUT_PAIRS[0]);
 delete armor.affixes.hpPct;
 armor.affixes.critDmg=20;
 assert.throws(()=>assertLegalItem(armor),/Illegal .* special/);
});
