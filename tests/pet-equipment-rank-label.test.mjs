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
 assert.match(html,/class="gear-title grade-mythic"/);
 assert.match(html,/class="gear-grade grade-mythic"/);
 assert.match(html,/class="rank-badge rank-SS">SS階 · 裝備能力×/);
 assert.match(html,/class="rank-badge rank-D">D階 · 裝備能力×/);
 assert.match(html,/class="pet-rank-empty">未強化/);
 assert.match(html,/class="gear-affixes"><span>/);
 assert.match(html,/data-petoff="head"/);
});
