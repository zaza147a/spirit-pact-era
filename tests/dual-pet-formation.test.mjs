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
  assert.match(canSetSecondaryPet(p,'b'),/只能攜帶一隻/);
});

test('former dual roster safely keeps the second pet in the collection',()=>{
  const p=normalizeDualPetState(sample());
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
  assert.equal(p.pets[1].hp,50);
  assert.equal(secondPetDamageFactor(p,'a'),1);
  assert.equal(secondPetDamageFactor(p,'b'),0);
  assert.match(canSetSecondaryPet(p,'a'),/只能攜帶一隻/);
  p.secondaryPetId='a';normalizeDualPetState(p);
  assert.equal(p.secondaryPetId,null);
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
});

test('fixed job modes suppress pact pet damage but keep commander pet damage',()=>{
  assert.equal(secondPetDamageFactor(sample('spiritCommander'),'a'),1);
  assert.equal(secondPetDamageFactor(sample('spiritCommander'),'b',{overload:true}),0);
  assert.equal(secondPetDamageFactor(sample('pactWarrior'),'b'),0);
  assert.equal(secondPetDamageFactor(sample('pactWarrior'),'a'),0);
  const warrior=sample('pactWarrior');
  warrior.petStances={a:'assimilate',b:'assist'};
  assert.equal(secondPetDamageFactor(warrior,'a'),0);
  assert.equal(secondPetDamageFactor(warrior,'b'),0);
});

test('old saves without second pet normalize safely',()=>{
  const p=sample(); delete p.secondaryPetId;
  normalizeDualPetState(p);
  assert.equal(p.secondaryPetId,null);
  assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
  assert.equal(p.dualPetMode,'focus');
});

test('equipment targeting is always the one equipped companion',()=>{
 const p=sample('spiritCommander');
 assert.equal(equipmentTargetPet(p,'b').id,'a');
 assert.equal(equipmentTargetPet(p,'unknown').id,'a');
 assert.equal(equipmentTargetPet(p,null).id,'a');
 const wizard=sample('wizard');
 assert.equal(equipmentTargetPet(wizard,'b').id,'a');
 wizard.activePetId=null;
 assert.equal(equipmentTargetPet(wizard,'b'),null);
});

test('pact stance is fixed to assimilation for the entire owned roster',()=>{
  const p=sample('pactWarrior');
  p.petStances={a:'assist',b:'assimilate',c:'assist',removed:'assimilate'};
  normalizeDualPetState(p);
  assert.equal(p.petStances.b,'assimilate');
  p.secondaryPetId='c';normalizeDualPetState(p);
  assert.equal(p.petStances.b,'assimilate');
  p.secondaryPetId='b';normalizeDualPetState(p);
  assert.equal(secondPetDamageFactor(p,'b'),0);
  assert.equal(p.petStances.a,'assimilate');
  assert.equal(p.petStances.c,'assimilate');
  assert.equal(p.petStances.removed,undefined,'stale released pet state is discarded');
});

test('all second companions remain benched regardless of fusion type',()=>{
 const p=sample('pactWarrior');
 p.pets[0].fusion={main:'attack',sub:'magic'};
 p.pets[1].fusion={main:'magic',sub:'attack'};
 p.pets[2].fusion={main:'defense',sub:'support'};
 assert.match(canSetSecondaryPet(p,'b'),/只能攜帶一隻/);
 assert.deepEqual(activePetRoster(p).map(x=>x.id),['a'],'old unnormalized save cannot gain double damage');
 normalizeDualPetState(p);
 assert.equal(p.secondaryPetId,null,'migration unequips duplicate second slot');
 assert.equal(p.pets.length,3,'does not delete owned pets');
 assert.match(canSetSecondaryPet(p,'c'),/只能攜帶一隻/);
 p.secondaryPetId='c';
 assert.deepEqual(activePetRoster(p).map(x=>x.id),['a']);
 const ordinary=sample('wizard');
 ordinary.pets[0].fusion=p.pets[0].fusion;
 ordinary.pets[1].fusion=p.pets[1].fusion;
 assert.deepEqual(activePetRoster(ordinary).map(x=>x.id),['a']);
});
