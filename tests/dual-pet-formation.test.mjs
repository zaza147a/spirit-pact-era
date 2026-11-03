import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activePetRoster, normalizeDualPetState, canSetSecondaryPet,
  secondPetDamageFactor, equipmentTargetPet
} from '../dist/dual-pet-formation.js';

const sample=(job='spiritist')=>({
  job,activePetId:'a',secondaryPetId:'b',
  pets:[{id:'a',hp:100,sp:20},{id:'b',hp:50,sp:10},{id:'c',hp:25,sp:5}]
});

test('existing jobs remain strictly one companion',()=>{
  const p=sample('wizard');
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
  assert.equal(secondPetDamageFactor(p,'b'),0);
  assert.match(canSetSecondaryPet(p,'b'),/只有御靈使/);
});

test('dual roster preserves independent pet objects and legal slots',()=>{
  const p=normalizeDualPetState(sample());
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a','b']);
  assert.equal(activePetRoster(p)[1].hp,50);
  assert.equal(secondPetDamageFactor(p,'a'),1);
  assert.equal(secondPetDamageFactor(p,'b'),.5);
  assert.match(canSetSecondaryPet(p,'a'),/同一隻/);
  p.secondaryPetId='a';normalizeDualPetState(p);
  assert.equal(p.secondaryPetId,null);
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
});

test('second job roles use distinct damage caps',()=>{
  assert.equal(secondPetDamageFactor(sample('spiritCommander'),'b'),.7);
  assert.equal(secondPetDamageFactor(sample('spiritCommander'),'b',{overload:true}),1);
  assert.equal(secondPetDamageFactor(sample('pactWarrior'),'b'),.35);
  assert.equal(secondPetDamageFactor(sample('pactWarrior'),'a'),.5);
  const warrior=sample('pactWarrior');
  warrior.petStances={a:'assimilate',b:'assist'};
  assert.equal(secondPetDamageFactor(warrior,'a'),0);
  assert.equal(secondPetDamageFactor(warrior,'b'),.35);
});

test('old saves without second pet normalize safely',()=>{
  const p=sample(); delete p.secondaryPetId;
  normalizeDualPetState(p);
  assert.equal(p.secondaryPetId,null);
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
  assert.equal(p.dualPetMode,'focus');
});

test('equipment targeting follows selected spirit slot but preserves old jobs',()=>{
 const p=sample('spiritCommander');
 assert.equal(equipmentTargetPet(p,'b').id,'b');
 assert.equal(equipmentTargetPet(p,'unknown').id,'a');
 assert.equal(equipmentTargetPet(p,null).id,'a');
 const wizard=sample('wizard');
 assert.equal(equipmentTargetPet(wizard,'b').id,'a');
 wizard.activePetId=null;
 assert.equal(equipmentTargetPet(wizard,'b'),null);
});
