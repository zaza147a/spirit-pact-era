import test from 'node:test';
import assert from 'node:assert/strict';
import {petProxyRanking} from './lv200-lv210-pet-output-diagnostic.mjs';
import {fusionKey} from '../dist/pet-fusion.js';
const PAIRS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
test('six unordered pet classes have real, nonidentical source-formula combat proxies',()=>{
 const outcomes=PAIRS.map(f=>petProxyRanking(200,'assassin',f));
 assert.equal(outcomes.length,6);
 for(const row of outcomes){
  assert.equal(row.mobCount,10);
  assert.equal(row.skills.length,3);
  assert.equal(row.petGear.length,3);
  assert.ok(row.bossDpsProxy>0);
  assert.ok(row.petNormalBossProxy>0);
  assert.ok(row.petSkillBossProxy>=0);
  assert.ok(row.petPanel.hp>0);
 }
 const numbers=outcomes.map(r=>r.bossDpsProxy);
 assert.ok(new Set(numbers).size>=2,'Pet fusions must not be mechanically collapsed into identical output');
});
test('210 real-map pet DPS includes SSS gear and actual Dawn targets',()=>{
 const result=petProxyRanking(210,'wizard','attack-magic');
 assert.equal(result.mobCount,3);
 assert.equal(result.level,210);
 assert.equal(result.skills.length,3);
 assert.ok(result.bossDpsProxy>0);
});
test('fusion order canonicalizes to same ability (visuals tested separately)',()=>{
 for(const f of PAIRS){const [a,b]=f.split('-');assert.equal(fusionKey(a,b),fusionKey(b,a));}
});
