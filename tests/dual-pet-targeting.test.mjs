import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseDefendingPet,pactOwnerOnlyAggro} from '../dist/dual-pet-targeting.js';

test('single pet and existing-job behavior remains unchanged',()=>{
 const pet={id:'first',hp:20};
 assert.equal(chooseDefendingPet([pet],()=> 'attack'),pet);
 assert.equal(chooseDefendingPet([{id:'dead',hp:0}],()=> 'defense'),null);
});
test('dual target selection never chooses dead companion',()=>{
 const a={id:'attack',hp:10},d={id:'defense',hp:0};
 assert.equal(chooseDefendingPet([a,d],p=>p.id, {rng:()=>.999}),a);
});
test('defense pet guard weighting does not force 100% interception',()=>{
 const a={id:'attack',hp:10},d={id:'defense',hp:10};
 const roles=p=>p.id;
 assert.equal(chooseDefendingPet([a,d],roles,{mode:'guard',guardingIds:['defense'],rng:()=>0}),a);
 assert.equal(chooseDefendingPet([a,d],roles,{mode:'guard',guardingIds:['defense'],rng:()=>.999}),d);
});

test('Pact assimilation makes owner the sole direct enemy target',()=>{
 const pets=[{id:'one',hp:20},{id:'two',hp:20}];
 assert.equal(pactOwnerOnlyAggro({job:'pactWarrior',petStances:{one:'assimilate',two:'assist'}},pets),true);
 assert.equal(pactOwnerOnlyAggro({job:'pactWarrior',petStances:{one:'assist',two:'assimilate'}},pets),true);
 assert.equal(pactOwnerOnlyAggro({job:'pactWarrior',petStances:{one:'assist',two:'assist'}},pets),false);
 assert.equal(pactOwnerOnlyAggro({job:'spiritCommander',petStances:{one:'assimilate',two:'assist'}},pets),false);
 assert.equal(pactOwnerOnlyAggro({job:'knight',petStances:{one:'assimilate'}},pets.slice(0,1)),false);
 assert.equal(pactOwnerOnlyAggro({job:'pactWarrior',petStances:{bench:'assimilate'}},pets),false);
});
