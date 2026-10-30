import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import{combatFingerprintV50}from'../scripts/balance-fingerprint.mjs';
const report=()=>JSON.parse(readFileSync(new URL('../docs/balance-v50.json',import.meta.url)));
test('V5 acceptance audit matches current source and all40 pair means stay within30% at99 and150',()=>{
 const r=report();assert.equal(r.sourceDigest,combatFingerprintV50());assert.equal(r.recipeDigest,createHash('sha256').update(readFileSync(new URL('../scripts/audit-balance-v50.mjs',import.meta.url))).digest('hex'));assert.equal(r.runCount,2120);assert.equal(r.seconds,120);assert.deepEqual(r.seeds,[42,137,731]);assert.equal(r.baselines.length,4);
 for(const b of r.baselines){assert.equal(b.pet,b.level>99?'ascended legendary':'uncommon');assert.equal(b.rows.length,40);assert.equal(b.samples.length,120);assert.ok(b.rows.every(x=>x.killsPerMinute>0&&x.deaths===0));for(const row of b.rows){const sample=b.samples.filter(s=>s.job===row.job&&s.role===row.role);assert.equal(sample.length,3);assert.ok(Math.abs(row.killsPerMinute-sample.reduce((n,s)=>n+s.kills/2,0)/3)<1e-10);}assert.equal(b.passed,b.gap<=.3);assert.ok(b.passed,`Lv.${b.level}: ${b.gap}`);assert.ok(Math.abs(b.gap-b.fastest.killsPerMinute/b.slowest.killsPerMinute+1)<1e-10);}
 assert.equal(r.stress.length,4);for(const c of r.stress)assert.equal(c.passed,c.gap<=.3);
});
test('111+ calibration records60/80/100% prior legendary configurations across40 pairs and three seeds',()=>{
 const r=report();assert.equal(r.calibration.length,5);let count=0;
 for(const c of r.calibration){assert.equal(c.rows.length,40);assert.equal(c.gearLevel,c.level===101?90:c.level<131?110:130);assert.match(c.pet,/legendary/);
  if(c.level===101){assert.equal(c.variants.length,1);count+=c.variants[0].samples.length;continue;}
  assert.deepEqual(c.variants.map(v=>v.strength),[.6,.8,1]);const means=[];
  for(const v of c.variants){assert.equal(v.total,120);assert.equal(v.samples.length,120);assert.deepEqual(v.seeds,[42,137,731]);assert.equal(new Set(v.samples.map(s=>`${s.job}/${s.role}/${s.seed}`)).size,120);assert.equal(v.alive,v.samples.filter(s=>s.alive).length);assert.equal(v.passed,v.gap<=.3);means.push(v.rows.reduce((n,x)=>n+x.killsPerMinute,0)/40);count+=v.samples.length;}
  assert.ok(means[0]<means[1]&&means[1]<means[2],`Lv${c.level} must reward gear, attributes and cards together`);
 }
 assert.equal(count+r.baselines.reduce((n,b)=>n+b.samples.length,0)+r.stress.reduce((n,c)=>n+c.rows.length,0),r.runCount);
});
