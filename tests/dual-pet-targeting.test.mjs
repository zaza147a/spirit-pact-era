import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseDefendingPet} from '../dist/dual-pet-targeting.js';

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
