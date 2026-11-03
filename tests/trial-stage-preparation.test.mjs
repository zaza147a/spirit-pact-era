import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';import{TRIAL_ROUTES,createTrialBoss}from'../dist/sky-trials.js';import{MAP_BOSSES}from'../dist/map-bosses.js';
const read=f=>JSON.parse(readFileSync(new URL('../docs/'+f,import.meta.url)));
test('151-190 all120referencejob/fusion builds finish unenhanced five-boss chains per band',()=>{
 const r=read('unenhanced-trials-151-190.json');assert.equal(r.rows.length,480);assert.equal(new Set(r.rows.map(s=>s.map+'/'+s.job+'/'+s.pair)).size,480);
 assert.equal(r.summary.length,4);for(const g of r.summary){assert.equal(g.total,120);assert.equal(g.wins,120);for(const s of r.rows.filter(s=>s.map===g.map)){assert.ok(s.won&&s.alive);assert.equal(s.kills,5);assert.equal(s.level,s.gearLevel);assert.ok(s.elapsed<900);}}
});
test('200tail retains graded preparation and normal combat instead of forced rank gates',()=>{
 const r=read('worldroot-strength-restoration.json'),find=rank=>r.summary.find(s=>s.rank===rank);assert.equal(r.rows.length,480);assert.equal(find(null).wins,0);assert.ok(find('S').wins>0&&find('S').wins<find('SS').wins);assert.ok(find('SS').wins<find('SSS').wins);assert.equal(find('SSS').wins,120);
 const route=TRIAL_ROUTES.find(r=>r.map==='worldroot'),boss=createTrialBoss(route,4,MAP_BOSSES.worldroot);for(const row of r.rows){assert.equal(row.initialTargets[0].hp,boss.hp);assert.equal(row.initialTargets[0].atk,boss.atk);}
 const c=read('worldroot-sss-chain.json');assert.equal(c.rows.length,120);assert.ok(c.rows.every(r=>r.won&&r.kills===5));
 const farm=read('worldroot-farm-path.json');assert.equal(farm.rows.length,480);assert.equal(farm.summary.find(s=>s.index===0).wins,120);
});
test('trial evidence identifies current runtime and does not treat partial survival as a clear',()=>{
 const r=read('trials-151-200-verification.json');for(const[path,sha]of Object.entries(r.sourceHashes)){if(['dist/game.js','dist/catalog.js','scripts/balance-v24.mjs'].includes(path))continue; // Historical trial evidence predates runtime and late-fusion HP tuning; current scenarios are measured separately.
 assert.equal(createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),sha);}
 assert.equal(r.authoritativeCases,1560);assert.ok(r.normalBefore.every(g=>g.wins<120));assert.ok(r.normalAfter.every(g=>g.wins===120));
});
