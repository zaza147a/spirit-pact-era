import test from 'node:test';
import assert from 'node:assert/strict';
import {weaponOffenseSourceFactor} from '../dist/weapon-offense-specialization.js';
import {GEAR_BASE} from '../dist/loot.js';

const expected={
 rogue:{rifle:.86},
 hunter:{shortBow:1.13,longBow:1.04,crossbow:1.055},
 sage:{oneStaff:1.38,spellFist:1.25},
 performer:{instrument:1.23}
};
test('only specific career and weapon pairing receives pre-defense source coefficient',()=>{
 for(const [job,weapons] of Object.entries(expected))for(const [weapon,factor] of Object.entries(weapons)){
  assert.equal(weaponOffenseSourceFactor(job,weapon),factor);
  assert.ok(GEAR_BASE[weapon].jobs.includes(job),job+' must equip '+weapon);
  assert.match(GEAR_BASE[weapon].weaponTrait,/主角攻擊來源|主角物理攻擊來源/);
 }
 for(const job of ['assassin','wizard','priest','monk','knight','crusader','pactWarrior','spiritCommander'])
  for(const weapon of ['rifle','shortBow','longBow','crossbow','oneStaff','spellFist','instrument'])
   assert.equal(weaponOffenseSourceFactor(job,weapon),1,job+'/'+weapon+' is unaffected');
 assert.equal(weaponOffenseSourceFactor('hunter','rifle'),1);
 assert.equal(weaponOffenseSourceFactor('performer','shortBow'),1);
});
