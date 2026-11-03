import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalFusionKey, canonicalDualFusionKey, DUAL_FUSION_TYPES,
  spiritThirdJobExtraError, spiritEquipmentSplit, spiritNormalEquipmentDrop,
  SPIRIT_TRIAL_ID, SPIRIT_TRIAL_KILLS, startSpiritQuest, recordSpiritQuestVictory, completeSpiritQuest
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

test('dual spirit oath persists victories and requires two living fused pets',()=>{
 const player={job:'pactWarrior',reborn:true,level:150,location:'skycity',quests:{}};
 const first={id:'first',hp:50,fusion:{main:'magic',sub:'attack'}};
 const second={id:'second',hp:40,fusion:{main:'support',sub:'defense'}};
 assert.equal(startSpiritQuest(player,[first,second]),null);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].kills,0);
 second.hp=0;
 assert.equal(recordSpiritQuestVictory(player,[first,second],{level:145}),false);
 second.hp=40;
 assert.equal(recordSpiritQuestVictory(player,[first,second],{level:151}),false);
 for(let n=0;n<SPIRIT_TRIAL_KILLS;n++)assert.equal(recordSpiritQuestVictory(player,[first,second],{level:145}),true);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].kills,SPIRIT_TRIAL_KILLS);
 player.location='zenith';
 assert.match(completeSpiritQuest(player,[first,second]),/蒼穹樞城/);
 player.location='skycity';
 assert.equal(completeSpiritQuest(player,[first,second]),null);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].done,true);
 assert.equal(spiritThirdJobExtraError(player,first,second),null);
});
