import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_60_MECHANICS, ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
const supported = new Set(['armorBreak','armorExecution','vowShieldFollowup','elementBurn','comboLeech','overhealRain','dragonCounter','siegeCounter','sanctuaryChase','ward','wardCharge','manaRefund','haste','mark','stackStrike','splash','counterStrike','arcaneStrike','hunterSummon','lowHpRiposte','guardianAutoChase','soundShield','falconVolley','starRainChain','storedSpellCharge']);
test('every original VNext entry is present with source text and a supported effect',()=>{
 const jobs=Object.keys(SECOND_JOBS); assert.equal(jobs.length,10);
 assert.equal(Object.keys(ORIGINAL_60_MECHANICS).length,60);
 for(const job of jobs)for(const pair of ORIGINAL_SIX_KEYS){
  const key=job+'/'+pair,spec=ORIGINAL_60_MECHANICS[key],actual=THIRD_FUSION_RULES[job][pair];
  assert.ok(spec,key);assert.ok(spec.description.length>=4,key);
  const payloads=Array.isArray(actual.originalEvent.payload)?actual.originalEvent.payload:[actual.originalEvent.payload];assert.ok(payloads.length>0&&payloads.every(action=>supported.has(action)),key+'/'+payloads.join(','));
  const activeEvent=key==='knight/attack-defense'?'thirdHit_knight':spec.event;
  assert.equal(actual.originalEvent.event,activeEvent,key);
  assert.deepEqual(actual.events,[activeEvent],key);
  assert.ok(spec.threshold>=1&&spec.threshold<=3,key);
 }
});
test('the seven previously implemented mechanics keep their dedicated payloads',()=>{
 const expected={
  'knight/attack-defense':'armorBreak',
  'knight/defense-support':'dragonCounter',
  'crusader/attack-defense':'siegeCounter',
  'rogue/defense-support':'sanctuaryChase',
  'assassin/attack-magic':'elementBurn',
  'monk/attack-support':'comboLeech',
  'priest/magic-support':'overhealRain'
 };
 for(const [key,payload] of Object.entries(expected)){
  const [job,pair]=key.split('/');
  assert.equal(THIRD_FUSION_RULES[job][pair].originalEvent.payload,payload);
 }
});
