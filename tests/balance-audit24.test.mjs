import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {balanceFingerprint} from '../scripts/balance-fingerprint.mjs';
const report=JSON.parse(readFileSync(new URL('../docs/balance-v24.json',import.meta.url)));
test('published balance audit matches current combat source and its declared 720-run scope',()=>{
 assert.equal(report.sourceDigest,balanceFingerprint(),'Run node scripts/audit-balance-v24.mjs after combat changes');assert.equal(report.level,99);assert.equal(report.seconds,120);assert.equal(report.runCount,720);assert.equal(report.scenarios.length,6);assert.equal(report.seedCount,3);
});
test('audit reports real class and pairing gaps honestly without equalizing pet damage',()=>{
 const baseline=report.composites.find(c=>c.rarity==='uncommon');assert.equal(baseline.allPairTargetPassed,true);assert.ok(baseline.allPairGap<=.3);assert.ok(baseline.bestJobGap<=.3);assert.equal(baseline.rows.length,40);
 const mythic=report.composites.find(c=>c.rarity==='mythic');assert.ok(mythic.meanOwnerShare>0&&mythic.meanOwnerShare<1);assert.equal(mythic.allPairTargetPassed,true);assert.ok(mythic.allPairGap<=.3);
 for(const scenario of report.scenarios){if(scenario.scenario!=='field')assert.equal(scenario.deaths,0);else assert.ok(scenario.deaths<=6,'fixed offensive builds without gold revival may fail at most 5% of field runs');const avg=role=>{const rows=scenario.rows.filter(r=>r.role===role);return rows.reduce((s,r)=>s+r.petDirectDamage,0)/rows.length;};assert.ok(avg('defense')<avg('attack'));assert.ok(avg('support')<avg('magic'));}
});
