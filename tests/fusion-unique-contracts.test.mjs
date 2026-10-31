import test from 'node:test';
import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {THIRD_FUSION_RULES,fusionTransformAtLevel,companionResonance} from '../dist/fusion-resonance.js';

const oldFamilies=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const fingerprint=rule=>JSON.stringify({events:rule.events,perSkill:rule.perSkill});
test('60 classic job/fusion contracts have individual payloads rather than mere names',()=>{
 const jobs=Object.keys(SECOND_JOBS);
 assert.equal(jobs.length,10);
 const all=[];
 for(const job of jobs){
   const group=oldFamilies.map(key=>THIRD_FUSION_RULES[job][key]);
   assert.equal(new Set(group.map(fingerprint)).size,6,job);
   all.push(...group.map(fingerprint));
 }
 assert.equal(all.length,60);
 assert.equal(new Set(all).size,60,'all 60 baseline pacts require distinct event/power identities');
});
test('120 ordered routes use 12 distinct per-class combat effects',()=>{
 const allPairs=Object.keys(FUSION_PAIRS);assert.equal(allPairs.length,12);
 for(const job of Object.keys(SECOND_JOBS)){
  const rules=allPairs.map(key=>THIRD_FUSION_RULES[job][key]);
  assert.equal(new Set(rules.map(r=>r.name)).size,12,job);
  assert.equal(new Set(rules.map(fingerprint)).size,12,job);
  for(const rule of rules){
   for(const level of [151,175,200]){
    for(const payload of Object.values(rule.perSkill)){
     const values=fusionTransformAtLevel(payload,level);
     assert.ok(Object.values(values).every(v=>Number.isFinite(v)),job);
    }
   }
  }
 }
});
test('a reversed pair has different combat modifiers at all three skill positions',()=>{
 for(const job of Object.keys(SECOND_JOBS))
 for(const key of oldFamilies){
  const reverse=key.split('-').reverse().join('-');
  const old=THIRD_FUSION_RULES[job][key],newRule=THIRD_FUSION_RULES[job][reverse];
  for(const skill of Object.keys(old.perSkill))assert.notDeepEqual(old.perSkill[skill],newRule.perSkill[skill],job+'/'+reverse+'/'+skill);
 }
});
