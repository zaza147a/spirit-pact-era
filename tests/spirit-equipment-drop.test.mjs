import test from 'node:test';
import assert from 'node:assert/strict';
import {equipmentDrop} from '../dist/loot.js';
import {spiritEquipmentSplit} from '../dist/spirit-job-rules.js';

test('legacy jobs retain 9:1 conditional split with 20% total equipment',()=>{
 assert.equal(equipmentDrop(false,0,()=>.179),'character');
 assert.equal(equipmentDrop(false,0,()=>.19),'pet');
 assert.equal(equipmentDrop(false,0,()=>.20),null);
 assert.equal(equipmentDrop(true,0,()=>.89),'character');
 assert.equal(equipmentDrop(true,0,()=>.91),'pet');
});

test('spirit-specific split does not change overall drop chance',()=>{
 for(const [job,reborn,characterThreshold] of [
  ['spiritist',false,.16],['pactWarrior',false,.16],
  ['spiritCommander',true,.14],['wizard',false,.18]
 ]) {
  const share=spiritEquipmentSplit(job,reborn).character;
  assert.equal(equipmentDrop(false,0,()=>characterThreshold-.001,share),'character');
  assert.equal(equipmentDrop(false,0,()=>characterThreshold+.001,share),'pet');
  assert.equal(equipmentDrop(false,0,()=>.201,share),null);
 }
});

test('loot bonus applies to total chance, then splits kind',()=>{
 const split=spiritEquipmentSplit('spiritCommander',true).character;
 assert.equal(equipmentDrop(false,100,()=>.279,split),'character');
 assert.equal(equipmentDrop(false,100,()=>.30,split),'pet');
 assert.equal(equipmentDrop(false,100,()=>.41,split),null);
});
