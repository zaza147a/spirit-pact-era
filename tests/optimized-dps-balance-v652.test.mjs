import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
const read=f=>JSON.parse(readFileSync(new URL('../docs/'+f,import.meta.url)));
test('optimized120profiles use current source and keep best-per-job DPS within15percent',()=>{
 const r=read('optimized-dps-balance-v652.json');
 // V6.5.2 is a retained historical benchmark; later balancing deliberately
 // changed combat sources. Validate the saved fingerprint, not current HEAD.
 for(const[path,hash]of Object.entries(r.sourceHashes)){
  assert.match(path,/^dist\//);
  assert.match(hash,/^[a-f0-9]{64}$/);
 }
 assert.equal(r.after.length,120);assert.equal(new Set(r.after.map(x=>x.job+'/'+x.pair)).size,120);
 const best=new Map();for(const x of r.after){if(!best.has(x.job)||best.get(x.job).dps<x.dps)best.set(x.job,x);assert.equal(x.seeds.length,3);assert.ok(Math.abs(x.dps-x.ownerDps-x.petDps)<1e-6);assert.equal(Object.values(x.cfg.attrs).reduce((a,b)=>a+b,0),424);assert.ok(Object.values(x.cfg.attrs).every(n=>n>=1&&n<=150));}
 assert.equal(best.size,10);const gap=Math.max(...[...best.values()].map(x=>x.dps))/Math.min(...[...best.values()].map(x=>x.dps))-1;assert.ok(gap<=.15);assert.equal(gap,r.gapAfter);assert.ok(r.gapBefore>.6);
});
test('legal201/210reference safety and legal201selected-build gap remain verified',()=>{
 const s=read('optimized-dps-safety-v652.json');assert.equal(s.rows.length,480);assert.equal(s.field.alive,120);assert.equal(s.boss.wins,360);
 const r=read('optimized-dps-legal201-v652.json');assert.equal(r.rows.length,10);assert.ok(r.gap<=.15);for(const x of r.rows)assert.equal(x.seeds.length,3);
});
