import test from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINAL_60_MECHANICS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
import {SECOND_JOBS} from '../dist/jobs.js';

// Ten contracts use individually authored multi-stage implementations in place
// of the generic placeholder payload. Keep the substitutions explicit.
const SPECIALIZED={
 'knight/defense-support':['dragonCounter'],
 'crusader/attack-defense':['siegeCounter'],
 'wizard/attack-defense':['storedSpellCharge'],
 'sage/magic-support':['starRainChain'],
 'rogue/defense-support':['sanctuaryChase'],
 'priest/attack-support':['haste','counterStrike'],
 'priest/magic-support':['overhealRain'],
 'monk/defense-support':['manaRefund','stackStrike'],
 'hunter/attack-support':['falconVolley'],
 'performer/attack-support':['haste','counterStrike']
};

test('all 60 authored third-job resonance mechanics are connected to the runtime rule table',()=>{
 const keys=Object.keys(ORIGINAL_60_MECHANICS);
 assert.equal(keys.length,60);
 assert.equal(Object.keys(SECOND_JOBS).length,10);
 for(const key of keys){
  const [job,pair]=key.split('/'),design=ORIGINAL_60_MECHANICS[key],runtime=THIRD_FUSION_RULES[job]?.[pair];
  assert.ok(runtime,`${key}: missing runtime contract`);
  assert.ok(runtime.originalEvent,`${key}: original trigger not connected`);
  const activeEvent=key==='knight/attack-defense'?'thirdHit_knight':design.event;
  assert.equal(runtime.originalEvent.event,activeEvent,`${key}: trigger mismatch`);
  const payloads=[runtime.originalEvent.payload].flat();
  if(SPECIALIZED[key])assert.deepEqual(payloads,SPECIALIZED[key],`${key}: specialized payload changed`);
  else assert.ok(payloads.includes(design.payload),`${key}: authored payload missing`);
  assert.ok(runtime.events.includes(activeEvent),`${key}: trigger not listenable`);
  assert.ok(runtime.cooldown>=1000&&runtime.duration>=1000,`${key}: missing cooldown/window`);
 }
});
