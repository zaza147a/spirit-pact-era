import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {LEGACY_OPTIMAL_MANIFEST,legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';

test('historical 240s candidate boss benchmark is not the 120s natural-spawn benchmark',()=>{
 assert.match(LEGACY_OPTIMAL_MANIFEST.conditions,/240-second mixed boss fights/);
 const assassin=LEGACY_OPTIMAL_MANIFEST.rows.find(row=>row.job==='assassin');
 assert.equal(assassin.weapon,'rifle');
 assert.equal(assassin.offhand,'offDagger');
 assert.ok(Math.abs(assassin.dps-729714391.9090437)<1);
 const saved=legacyOptimalPlayer('assassin');
 assert.equal(saved.gear.rightHand?.id,assassin.weapon);
 assert.equal(saved.gear.leftHand?.id,assassin.offhand);
});

test('misleading immortal five-target ranking entrypoints stay removed',()=>{
 for(const name of ['spirit-twelve-job-boss-four-120s.mjs',
  'spirit-twelve-optimal-fixed-boss-four-120s.mjs']){
  assert.equal(existsSync(new URL('./'+name,import.meta.url)),false,
   name+' must not reappear as an official ranking benchmark');
 }
});
