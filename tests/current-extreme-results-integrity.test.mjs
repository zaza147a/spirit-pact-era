// Only checks the current branch's actual extreme-trial run reports.
// Historical five-boss/DPS/field tests are deliberately excluded.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer','pactWarrior','spiritCommander'];
const modes=['atk','matk','hp','clear'];
const data=path=>JSON.parse(readFileSync(path,'utf8'));

test('all twelve first-pass searches ran 24 legal candidates through every real extreme mode',()=>{
 for(const job of jobs){
  const r=data(`docs/current-extreme-${job}-search-20261110.json`);
  assert.equal(r.completed,24,job);
  assert.equal(r.results.length,96,job);
  assert.equal(r.status,'BOUNDED SEARCH COMPLETE, not global optimum');
  for(const kind of modes){
   const rows=r.results.filter(x=>x.kind===kind);
   assert.equal(rows.length,24,`${job}/${kind}`);
   assert.ok(rows.every(x=>x.stopped==='first-failure'&&x.nextFloor===x.highest+1),`${job}/${kind}`);
   assert.equal(r.best[kind].highest,Math.max(...rows.map(x=>x.highest)),`${job}/${kind}`);
  }
 }
});

test('second-pass reports contain five additional legal attribute profiles per mode',()=>{
 for(const job of jobs)for(const kind of modes){
  const first=data(`docs/current-extreme-${job}-search-20261110.json`);
  const r=data(`docs/current-extreme-refine-${job}-${kind}-20261111.json`);
  assert.equal(r.completed,5,`${job}/${kind}`);
  assert.equal(r.results.length,5,`${job}/${kind}`);
  assert.equal(r.status,'BOUNDED SEARCH COMPLETE, not global optimum');
  assert.ok(r.results.every(x=>x.stopped==='first-failure'&&x.nextFloor===x.highest+1),`${job}/${kind}`);
  assert.ok(r.results.every(x=>x.fusion===first.best[kind].fusion&&x.weaponChoice===first.best[kind].weaponChoice),`${job}/${kind}`);
  assert.deepEqual(new Set(r.results.map(x=>x.attributeProfile)),new Set(['agi-vit','luk-vit','dex-vit','vit-luk','dex-luk']),`${job}/${kind}`);
 }
});
