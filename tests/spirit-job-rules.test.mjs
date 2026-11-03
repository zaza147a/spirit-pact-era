import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalFusionKey, canonicalDualFusionKey, DUAL_FUSION_TYPES,
  spiritThirdJobExtraError, spiritEquipmentSplit, spiritNormalEquipmentDrop,
  SPIRIT_TRIAL_ID
} from '../dist/spirit-job-rules.js';

test('six canonical pet fusions yield 21 unordered dual combinations', () => {
  assert.equal(DUAL_FUSION_TYPES.length,21);
  assert.equal(new Set(DUAL_FUSION_TYPES).size,21);
  assert.equal(canonicalFusionKey({fusion:{main:'magic',sub:'attack'}}),'attack-magic');
  assert.equal(canonicalFusionKey({fusionKey:'magic-attack'}),'attack-magic');
  assert.equal(canonicalDualFusionKey({fusionKey:'attack-magic'},{fusionKey:'support-defense'}),
    canonicalDualFusionKey({fusionKey:'defense-support'},{fusionKey:'magic-attack'}));
  assert.equal(canonicalDualFusionKey({fusionKey:'attack-magic'},{fusionKey:'attack-magic'}),
    'attack-magic+attack-magic');
  assert.equal(canonicalDualFusionKey({fusionKey:'attack'},{fusionKey:'magic'}),null);
});

test('only spirit second jobs need two fused pets and a completed quest', () => {
  const first={fusion:{main:'attack',sub:'magic'}}, second={fusion:{main:'support',sub:'defense'}};
  const player={job:'pactWarrior',quests:{}};
  assert.match(spiritThirdJobExtraError(player,first,null),/兩隻融合/);
  assert.match(spiritThirdJobExtraError(player,first,second),/雙生靈契/);
  assert.equal(spiritThirdJobExtraError({...player,quests:{[SPIRIT_TRIAL_ID]:{done:true}}},first,second),null);
  assert.equal(spiritThirdJobExtraError({...player,job:'wizard'},null,null),null);
});

test('equipment type ratio changes but total equipment chance remains 20%', () => {
  assert.deepEqual(spiritEquipmentSplit('wizard'),{character:.9,pet:.1});
  assert.deepEqual(spiritEquipmentSplit('spiritist'),{character:.8,pet:.2});
  assert.deepEqual(spiritEquipmentSplit('spiritCommander',true),{character:.7,pet:.3});
  const roll=x=>()=>x;
  // Normal base total .20, with type boundaries .18, .16, .14.
  assert.equal(spiritNormalEquipmentDrop('wizard',false,0,roll(.17)),'character');
  assert.equal(spiritNormalEquipmentDrop('wizard',false,0,roll(.19)),'pet');
  assert.equal(spiritNormalEquipmentDrop('spiritist',false,0,roll(.17)),'pet');
  assert.equal(spiritNormalEquipmentDrop('pactWarrior',true,0,roll(.15)),'pet');
  for(const job of ['wizard','spiritist','pactWarrior'])
    assert.equal(spiritNormalEquipmentDrop(job,true,0,roll(.21)),null);
});
