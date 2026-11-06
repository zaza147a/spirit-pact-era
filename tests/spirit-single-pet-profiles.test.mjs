import test from 'node:test';
import assert from 'node:assert/strict';
import {SPIRIT_BASE_PROFILES,SPIRIT_FUSION_PROFILES,spiritSinglePetProfile} from '../dist/spirit-single-pet-profiles.js';

test('two fixed jobs each receive four second and six fused-only third profiles',()=>{
 assert.equal(Object.keys(SPIRIT_BASE_PROFILES).length,4);
 assert.equal(Object.keys(SPIRIT_FUSION_PROFILES).length,6);
 for(const job of ['pactWarrior','spiritCommander']){
  const source=job==='pactWarrior'?'owner':'pet';
  for(const role of Object.keys(SPIRIT_BASE_PROFILES)){
   const profile=spiritSinglePetProfile({job,thirdJob:false},{role});
   assert.equal(profile.source,source);
   assert.equal(profile.stage,'second');
   assert.ok(profile.name&&profile.trigger&&profile.effect);
  }
  assert.equal(spiritSinglePetProfile({job,thirdJob:true},{role:'attack'}),null);
  for(const key of Object.keys(SPIRIT_FUSION_PROFILES)){
   const [main,sub]=key.split('-');
   const forward=spiritSinglePetProfile({job,thirdJob:true},{fusion:{main,sub}});
   const reversed=spiritSinglePetProfile({job,thirdJob:true},{fusion:{main:sub,sub:main}});
   assert.deepEqual(forward,reversed);
   assert.equal(forward.source,source);
   assert.equal(forward.stage,'third');
   assert.ok(forward.name&&forward.trigger&&forward.effect);
  }
 }
});
