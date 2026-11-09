import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_BASE,WEAPON_FIXED_ATTACK,WEAPON_FIXED_ATTACK_JOB,gearStatValue,rollGear} from '../dist/loot.js';

test('weapon-specific visible attack adjustments preserve other career stats',()=>{
 const expected={rifle:['rogue','atk',-2200],shortBow:['hunter','atk',3300],longBow:['hunter','atk',500],crossbow:['hunter','atk',1100],oneStaff:['sage','matk',9800],spellFist:['sage','matk',7200],instrument:['performer','atk',5300]};
 for(const [id,[job,stat,amount]] of Object.entries(expected)){
  const weapon=rollGear(id,200,'mythic',()=>.5);
  weapon.enhancement='SSS';
  assert.equal(WEAPON_FIXED_ATTACK_JOB[id],job);
  assert.equal(WEAPON_FIXED_ATTACK[id][stat],amount);
  assert.ok(GEAR_BASE[id].jobs.includes(job));
  assert.match(GEAR_BASE[id].weaponTrait,/專屬固定武器能力/);
  const original=gearStatValue(weapon,stat);
  assert.ok(Math.abs(gearStatValue(weapon,stat,job)-original-amount*3.2)<1);
  assert.equal(gearStatValue(weapon,stat,job==='sage'?'wizard':'sage'),original);
 }
});
