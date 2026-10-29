import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {balanceFingerprint} from '../scripts/balance-fingerprint.mjs';
const report=JSON.parse(readFileSync(new URL('../docs/balance-v24.json',import.meta.url)));
test('published balance audit matches current combat source and its declared 720-run scope',()=>{
 assert.equal(report.sourceDigest,balanceFingerprint(),'Run node scripts/audit-balance-v24.mjs after combat changes');assert.equal(report.level,99);assert.equal(report.seconds,120);assert.equal(report.runCount,720);assert.equal(report.scenarios.length,6);assert.equal(report.seedCount,3);
});
test('fixed-build multi-scenario contribution baseline meets gap target without equalizing role damage',()=>{
 const baseline=report.composites.find(c=>c.rarity==='uncommon');assert.ok(baseline.allPairGap<=.3);assert.equal(baseline.rows.length,40);
 const mythic=report.composites.find(c=>c.rarity==='mythic');assert.ok(mythic.meanOwnerShare>=.35&&mythic.meanOwnerShare<=.45);
 for(const scenario of report.scenarios){assert.equal(scenario.deaths,0);const avg=role=>{const rows=scenario.rows.filter(r=>r.role===role);return rows.reduce((s,r)=>s+r.petDirectDamage,0)/rows.length;};assert.ok(avg('defense')<avg('attack'));assert.ok(avg('support')<avg('magic'));}
});
