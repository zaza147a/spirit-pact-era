import test from 'node:test';
import assert from 'node:assert/strict';
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {GEAR_BASE,rollGear,rollPetGear,primaryAffix} from '../dist/loot.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {allocationBudget,ATTRIBUTE_KEYS} from '../dist/growth-v5.js';
import {ENHANCEMENT_POWER} from '../dist/sky-trials.js';
import {THIRD_MAIN_CURVES} from '../dist/third-jobs.js';
import {fusionKey,fusedPair,fusionSkills,defaultFusionSkills,companionRole} from '../dist/pet-fusion.js';
import {fusionDirectOutputFactor} from '../dist/pet-effects.js';
import {companionResonance} from '../dist/fusion-resonance.js';

// Scenario construction and source-linked eligibility checks.
// This does NOT produce game-combat DPS; runtime combat, skills, cards, RNG,
// optimization, 8/60-second burst, survival and boss outcomes are separate tests.
export const FUSIONS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
export const LOADOUTS={
 knight:['blade+shield','oneSpear+shield','twoSword','twoSpear'],
 crusader:['blade+shield','oneSpear+shield'],
 wizard:['oneStaff+shield','twoStaff'],
 sage:['oneStaff+shield','twoStaff','spellFist'],
 assassin:['rifle+shield','rifle+offDagger','katar'],
 rogue:['rifle+shield'],
 priest:['mace+shield'],
 monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],
 performer:['instrument','shortBow','longBow']
};
export const STAGES=[
 {level:200,rank:null,petRank:null,gearLevel:200,scenario:'Lv200_unenhanced'},
 {level:210,rank:'SSS',petRank:'SSS',gearLevel:200,scenario:'Lv210_max_SSS'}
];
const petFor=(key,reverse=false)=>{
 const [a,b]=key.split('-');
 return {species:'fang',level:200,rarity:'mythic',ascended:true,iv:{hp:0,atk:0,def:0,matk:0,sp:0,aspd:0},fusion:{main:reverse?b:a,sub:reverse?a:b,version:1},gear:{head:null,body:null,shoes:null},equippedSkills:[]};
};
const basePlayer=(job,stage)=>({job,level:stage.level,reborn:true,thirdJob:true,secondJobLevel:70,jobLevel:70,firstJobLevel:50,attributes:Object.fromEntries(ATTRIBUTE_KEYS.map(x=>[x,1])),statPoints:allocationBudget(stage.level,true),jobSkills:{},gear:{},sockets:{},pets:[]});
export const scenarios=STAGES.flatMap(stage=>Object.keys(SECOND_JOBS).flatMap(job=>FUSIONS.map(fusion=>({
 id:stage.scenario+'__'+job+'__'+fusion,stage,job,fusion,legalWeapons:LOADOUTS[job]
}))));
test('exactly 120 unique scenario identifiers (2 × 10 × 6)',()=>{
 assert.equal(scenarios.length,120);
 assert.equal(new Set(scenarios.map(x=>x.id)).size,120);
 assert.deepEqual(Object.keys(LOADOUTS).sort(),Object.keys(SECOND_JOBS).sort());
});
test('both scenario attribute caps, allocation budget, enhancement standards',()=>{
 for(const stage of STAGES){
  const p=basePlayer('assassin',stage);
  assert.equal(attributeCap(p),stage.level===200?120:150);
  assert.equal(allocationBudget(stage.level,true),stage.level===200?418:438);
  assert.equal(stage.rank,stage.level===200?null:'SSS');
  assert.equal(stage.petRank,stage.level===200?null:'SSS');
  assert.equal(stage.gearLevel,200);
  if(stage.rank)assert.equal(ENHANCEMENT_POWER[stage.rank],3.2);
 }
});
test('all 23 full-hand loadouts are equip-legal for their job',()=>{
 assert.equal(Object.values(LOADOUTS).flat().length,23);
 for(const [job,choices] of Object.entries(LOADOUTS))for(const combo of choices){
  const [main,off]=combo.split('+'),item=GEAR_BASE[main];
  assert.ok(item&&item.slot==='rightHand');
  assert.ok(item.jobs?.includes(job)||item.jobs?.includes(parentJob(job)),job+' / '+main);
  assert.ok(item.hands===2?!off:!!off,'invalid hand occupancy: '+combo);
  if(off)assert.equal(GEAR_BASE[off]?.slot,'leftHand');
  if(off==='offDagger')assert.equal(item.weaponType,'dagger');
 }
});
test('all scenario class/fusion combinations retain one resonance and six possible fusion skills',()=>{
 for(const {job,fusion,stage} of scenarios){
  const pet=petFor(fusion),reverse=petFor(fusion,true),player=basePlayer(job,stage);
  assert.equal(fusionKey(...fusion.split('-')),fusionKey(...fusion.split('-').reverse()));
  assert.deepEqual(fusedPair(pet),fusedPair(reverse));
  assert.equal(companionRole(pet),companionRole(reverse));
  assert.deepEqual(fusionSkills(pet),fusionSkills(reverse));
  assert.deepEqual(defaultFusionSkills(pet),defaultFusionSkills(reverse));
  assert.equal(fusionDirectOutputFactor(pet),fusionDirectOutputFactor(reverse));
  assert.deepEqual(companionResonance(player,pet),companionResonance(player,reverse));
  assert.equal(fusionSkills(pet).length,6);
 }
});
test('generate source-based gear and pet-gear references without mutating them',()=>{
 for(const id of new Set(Object.values(LOADOUTS).flat().flatMap(x=>x.split('+')).filter(x=>x!=='shield').concat('shield'))){
  const item=rollGear(id,200,'mythic',()=>.5);
  assert.equal(item.tier,11);
  assert.equal(item.rarity,'mythic');
  assert.ok(Object.hasOwn(item.affixes,primaryAffix(id)));
 }
 for(const id of ['petHelm','petCirclet','petArmor','petRobe','petBoots','petGreaves']){
  const item=rollPetGear(id,200,'mythic',()=>.5);
  assert.equal(item.tier,11);
 }
});
test('all ten 200-level growth curves remain valid at level 210 cap',()=>{
 for(const job of Object.keys(SECOND_JOBS)){
  const curve=THIRD_MAIN_CURVES[job];
  assert.equal(curve.length,6);
  assert.ok(curve[5]>0);
 }
});
