import test from 'node:test';
import {jobLevelCap} from '../dist/adventure-progression.js';
import {GEAR_BASE,rollGear} from '../dist/loot.js';
import {JOB_ATTRIBUTE_MAX,jobAttributeBonus} from '../dist/job-attributes.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {thirdJobError,THIRD_SEAL,THIRD_SEAL_COST,PET_REVIVE_MS} from '../dist/frontier.js';
import assert from 'node:assert/strict';
import {
  canonicalFusionKey, canonicalDualFusionKey, DUAL_FUSION_TYPES,
  spiritThirdJobExtraError, spiritEquipmentSplit, spiritNormalEquipmentDrop,
  SPIRIT_TRIAL_ID, SPIRIT_TRIAL_KILLS, spiritGrowthGuide, startSpiritQuest, recordSpiritQuestVictory, completeSpiritQuest
} from '../dist/spirit-job-rules.js';

test('six canonical pet fusions yield 15 distinct unordered dual combinations', () => {
  assert.equal(DUAL_FUSION_TYPES.length,15);
  assert.equal(new Set(DUAL_FUSION_TYPES).size,15);
  assert.equal(canonicalFusionKey({fusion:{main:'magic',sub:'attack'}}),'attack-magic');
  assert.equal(canonicalFusionKey({fusionKey:'magic-attack'}),'attack-magic');
  assert.equal(canonicalDualFusionKey({fusionKey:'attack-magic'},{fusionKey:'support-defense'}),
    canonicalDualFusionKey({fusionKey:'defense-support'},{fusionKey:'magic-attack'}));
  assert.equal(canonicalDualFusionKey({fusionKey:'attack-magic'},{fusionKey:'attack-magic'}),
    null);
  assert.equal(canonicalDualFusionKey({fusionKey:'attack'},{fusionKey:'magic'}),null);
});

test('only spirit second jobs need one fused pet and a completed quest', () => {
  const first={fusion:{main:'attack',sub:'magic'}}, second={fusion:{main:'support',sub:'defense'}};
  const player={job:'pactWarrior',quests:{}};
  assert.match(spiritThirdJobExtraError(player,null,null),/一隻出戰融合/);
  assert.match(spiritThirdJobExtraError(player,first,null),/單靈誓約/);
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

test('single spirit oath persists victories and requires one living fused pet',()=>{
 const player={job:'pactWarrior',reborn:true,level:150,location:'skycity',quests:{}};
 const first={id:'first',hp:50,fusion:{main:'magic',sub:'attack'}};
 const second={id:'second',hp:40,fusion:{main:'support',sub:'defense'}};
 assert.equal(startSpiritQuest(player,[first]),null);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].kills,0);
 first.hp=0;
 assert.equal(recordSpiritQuestVictory(player,[first],{level:145}),false);
 first.hp=50;
 assert.equal(recordSpiritQuestVictory(player,[first],{level:151}),false);
 for(let n=0;n<SPIRIT_TRIAL_KILLS;n++)assert.equal(recordSpiritQuestVictory(player,[first],{level:145}),true);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].kills,SPIRIT_TRIAL_KILLS);
 player.location='zenith';
 assert.match(completeSpiritQuest(player,[first]),/蒼穹樞城/);
 player.location='skycity';
 assert.equal(completeSpiritQuest(player,[first]),null);
 assert.equal(player.quests[SPIRIT_TRIAL_ID].done,true);
 assert.equal(spiritThirdJobExtraError(player,first,null),null);
 assert.equal(startSpiritQuest({...player,quests:{},job:'spiritCommander'},[first]),null);
});

test('spirit third-job requirement is disclosed from first job onward',()=>{
 const p={job:'spiritist',level:1,reborn:false,quests:{}};
 assert.match(spiritGrowthGuide(p,[]).message,/三轉前須取得融合夥伴/);
 p.job='pactWarrior';p.level=99;
 assert.match(spiritGrowthGuide(p,[]).message,/提前培養一隻/);
 p.reborn=true;p.level=140;
 assert.match(spiritGrowthGuide(p,[]).message,/蒼穹樞城/);
 p.quests[SPIRIT_TRIAL_ID]={started:true,kills:4,done:false};
 assert.match(spiritGrowthGuide(p,[]).message,/4／24/);
 p.thirdJob=true;
 assert.equal(spiritGrowthGuide(p,[]),null,'completed third job hides stale growth hint even for unfinished legacy quest');
 p.thirdJob=false;
 p.job='wizard';
 assert.equal(spiritGrowthGuide(p,[]),null);
});

test('both reborn spirit second jobs can earn Job 70 and satisfy ordinary third-job gate',()=>{
 for(const job of ['pactWarrior','spiritCommander']){
  const player={job,reborn:true,thirdJob:false,level:150,jobLevel:70,location:'skycity',
   bag:[{id:THIRD_SEAL,qty:THIRD_SEAL_COST}]};
  assert.equal(jobLevelCap(player),70,job+' needs reachable Job 70');
  assert.equal(thirdJobError(player),null,job+' must pass original base/job/seal gate');
  assert.match(thirdJobError({...player,jobLevel:69}),/Job70/);
  assert.equal(jobLevelCap({...player,reborn:false}),50);
 }
 assert.equal(jobLevelCap({job:'wizard',reborn:true}),70,'existing jobs unchanged');
 assert.equal(jobLevelCap({job:'spiritist',reborn:true}),50,'first job unchanged');
});

test('spirit second jobs share the new one-hand dual-attack staff sword',()=>{
 assert.ok(!GEAR_BASE.mace.jobs.includes('spiritist'),'first-job spiritist must not use mace');
 assert.deepEqual(GEAR_BASE.staffSword.jobs,['spiritist','pactWarrior','spiritCommander']);
 assert.ok(GEAR_BASE.staffSword.atk>0&&GEAR_BASE.staffSword.matk>0);
 assert.equal(GEAR_BASE.staffSword.hands??1,1);
 const sword=rollGear('staffSword',200,'mythic',()=>.5);
 assert.ok(sword.affixes.atk>0&&sword.affixes.matk>0,'both damage affixes coexist');
 assert.ok(!GEAR_BASE.mace.jobs.includes('pactWarrior'),'physical pact warrior no longer uses mace');
 assert.ok(!GEAR_BASE.mace.jobs.includes('spiritCommander'),'magical spirit commander no longer uses mace');
 assert.equal(GEAR_BASE.shield.slot,'leftHand');
 assert.ok(!GEAR_BASE.mace.jobs.includes('wizard'),'mage weapon restrictions remain intact');
});

test('all spirit stages have finite JOB attribute bonuses, no undefined parent table',()=>{
 for(const job of ['spiritist','pactWarrior','spiritCommander']){
  const table=JOB_ATTRIBUTE_MAX[job];
  assert.equal(table.length,6);
  assert.equal(table.reduce((a,b)=>a+b,0),job==='spiritist'?20:30);
  const bonus=jobAttributeBonus({job,reborn:job!=='spiritist',thirdJob:false,
   jobLevel:job==='spiritist'?50:70,firstJobLevel:50},SECOND_JOBS);
  assert.ok(Object.values(bonus).every(Number.isFinite));
  assert.ok(Object.values(bonus).some(x=>x>0));
 }
});


test('pet revival duration stays at the original global ten seconds',()=>{
 assert.equal(PET_REVIVE_MS,10000);
});
