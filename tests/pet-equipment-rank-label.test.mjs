import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {rollPetGear} from '../dist/loot.js';

test('active companion equipment lists show the actual upgrade rank in each slot',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('夥伴強化階','knight'));
 const pet=c.makePet('fang');pet.gear.head={...rollPetGear('petHelm',99,'mythic',()=>.5),enhancement:'SS'};
 pet.gear.body={...rollPetGear('petArmor',99,'mythic',()=>.5),enhancement:'D'};
 pet.gear.shoes=rollPetGear('petBoots',99,'rare',()=>.5);
 p.pets=[pet];p.activePetId=pet.id;a.setup(p,null);
 const html=a.renderActiveCompanion();
 assert.match(html,/強化：SS階/);
 assert.match(html,/強化：D階/);
 assert.match(html,/強化：未強化/);
});
