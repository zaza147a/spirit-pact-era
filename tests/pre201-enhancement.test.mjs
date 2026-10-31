import test from 'node:test';
import assert from 'node:assert/strict';
import {enhanceEquipped,enhancePetEquipped} from '../dist/sky-trials.js';

test('pre-201 player and companion equipment can enhance with proper materials and step order',()=>{
 const weapon={uid:'owner-1',id:'blade'},petWeapon={uid:'pet-1',id:'pet-armor'};
 const pet={id:'pet-1',gear:{body:petWeapon}};
 const player={level:151,location:'town',hp:100,gear:{rightHand:weapon},pets:[pet],bag:[{id:'rank_core_D',qty:2},{id:'rank_core_C',qty:2}]};
 assert.match(enhanceEquipped(player,weapon,'C').error,/逐階/);
 assert.deepEqual(enhanceEquipped(player,weapon,'D'),{rank:'D',uid:weapon.uid});
 assert.deepEqual(enhancePetEquipped(player,pet,petWeapon,'D'),{rank:'D',uid:petWeapon.uid,petId:pet.id});
 assert.deepEqual(enhanceEquipped(player,weapon,'C'),{rank:'C',uid:weapon.uid});
 assert.deepEqual(enhancePetEquipped(player,pet,petWeapon,'C'),{rank:'C',uid:petWeapon.uid,petId:pet.id});
 assert.equal(weapon.enhancement,'C');
 assert.equal(petWeapon.enhancement,'C');
});
