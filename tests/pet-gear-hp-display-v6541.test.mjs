import test from 'node:test';
import assert from 'node:assert/strict';
import {enhancedAffixes} from '../dist/sky-trials.js';
import {makePet,petStats} from '../dist/catalog.js';

test('151+ pet HP shown on gear matches effective pre-HP%-multiplication affix and existing item remains intact',()=>{
 const item={id:'petArmor',level:197,rarity:'mythic',enhancement:'SSS',affixes:{hp:261087,def:1000}};
 const before=JSON.stringify(item),shown=enhancedAffixes(item);
 assert.ok(shown.hp>0&&shown.hp<835478.4);
 assert.equal(shown.def,3200);
 assert.equal(item.affixes.hp,261087,'do not overwrite player save');
 assert.equal(JSON.stringify(item),before,'reading must not mutate item');
 const pet=makePet('fang');
 Object.assign(pet,{level:197,rarity:'mythic',evolution:4,ascended:true,
  gear:{head:null,body:item,shoes:null}});
 const withItem=petStats(pet).hp;
 pet.gear.body={...item,affixes:{...item.affixes,hp:0}};
 const withoutHp=petStats(pet).hp;
 assert.ok(withItem>withoutHp);
 const expectedPreFusion=shown.hp;
 assert.ok(expectedPreFusion>0);
});

test('pet equipment up to Lv150 still grants its original full enhancement HP',()=>{
 for(const level of [1,80,150]){
  const gear={id:'petArmor',level,enhancement:'SSS',affixes:{hp:261087}};
  assert.equal(enhancedAffixes(gear).hp,835478.4);
 }
 const playerGear={id:'armor',level:200,enhancement:'SSS',affixes:{hp:261087}};
 assert.equal(enhancedAffixes(playerGear).hp,835478.4);
});
