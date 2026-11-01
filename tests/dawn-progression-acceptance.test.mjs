import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

test('archived 120-route progression actually farms each material, reloads paid sigils and earns an Archon core',()=>{
 const report=JSON.parse(readFileSync(new URL('../docs/dawn-progression-audit.json',import.meta.url),'utf8'));
 assert.equal(report.total,120);assert.equal(report.completed,120);assert.equal(report.rows.length,120);
 const indexed=new Map(report.rows.map(r=>[r.job+'/'+r.pair,r]));assert.equal(indexed.size,120);
 for(const job of Object.keys(SECOND_JOBS))for(const pair of Object.keys(FUSION_PAIRS)){
  const r=indexed.get(job+'/'+pair),label=job+'/'+pair;
  assert.ok(r,label);assert.equal(r.error,undefined,label);assert.equal(r.seed,42,label);
  assert.equal(r.startLevel,201,label);assert.ok(r.farmSeconds>=60&&r.farmSeconds<=1800,label);
  assert.ok(r.kills>=216,label);assert.equal(r.sigil,4,label);
  for(const id of ['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane']){
   assert.equal(r.required[id],72,label);assert.ok(r.farmMaterials[id]>=72,label);
  }
  assert.ok(r.earned>0&&r.spent>=0&&r.purchased>=0,label);
  assert.equal(r.won,true,label);assert.equal(r.bossRemainingHp,0,label);
  assert.ok(r.bossSeconds>0&&r.bossSeconds<=240,label);assert.ok(r.remainingHp>0,label);
  assert.equal(r.core,1,label);assert.ok(r.remainingGold>=0,label);assert.equal(r.valid,true,label);
 }
 assert.equal(report.wins,120);
});
