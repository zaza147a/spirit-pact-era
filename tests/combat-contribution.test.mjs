import test from 'node:test';
import assert from 'node:assert/strict';
import {combatContribution} from '../dist/combat-contribution.js';
import {petOffensivePower} from '../dist/pet-effects.js';

test('low damage tank/support can contribute through actual protection/healing without matching damage',()=>{
 const tank=combatContribution({playerDamage:1000,petDamage:200,petTanked:300,shieldPrevented:500});
 const support=combatContribution({playerDamage:1000,petDamage:100,effectiveHeal:600,buffDamage:300});
 assert.equal(tank.pet.damage,200);assert.equal(tank.petTotal,1000);assert.equal(tank.ownerShare,.5);
 assert.equal(support.pet.damage,400);assert.equal(support.petTotal,1000);assert.equal(support.ownerShare,.5);
});
test('buff gains belong to their source and tank/received/interception duplicate records are not added twice',()=>{
 const result=combatContribution({playerDamage:100,playerBuffDamage:20,petDamage:40,buffDamage:30,resonanceDamage:10,playerTanked:50,petTanked:60,playerTaken:50,petTaken:60,interceptPrevented:9999,playerShieldPrevented:15,shieldPrevented:25,effectiveMana:9000,interrupts:99});
 assert.equal(result.ownerTotal,185);assert.equal(result.petTotal,165);assert.equal(result.total,350);
});
test('empty/corrupt metrics cannot create negative or nonfinite combat scores',()=>{
 assert.equal(combatContribution().total,0);assert.equal(combatContribution(null).total,0);
 assert.equal(combatContribution({petDamage:-10,effectiveHeal:NaN,petTanked:Infinity}).total,0);
});
test('defensive offense has no role multiplier added to match attacker damage',()=>{
 const s={atk:100,matk:100,def:20};assert.ok(petOffensivePower(s,'defense')<petOffensivePower(s,'attack'));
});
