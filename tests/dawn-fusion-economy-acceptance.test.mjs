import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

test('audited dawn farming matrix covers every ordered fusion and has no 60s cash deficits',()=>{
 const data=JSON.parse(readFileSync(new URL('../docs/dawn-fusion-economy-matrix.json',import.meta.url),'utf8'));
 const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS);
 assert.equal(data.count,480);
 assert.equal(data.rows.length,480);
 const identities=new Set(data.rows.map(r=>[r.level,r.pair,r.job,r.seed].join('|')));
 assert.equal(identities.size,480,'each economy case needs distinct level/pair/job/seed');
 for(const level of [201,210])for(const pair of pairs)for(const job of jobs)for(const seed of [42,137]){
  const key=[level,pair,job,seed].join('|');
  assert.ok(identities.has(key),'missing configuration '+key);
 }
 for(const row of data.rows){
  const id=[row.level,row.pair,row.job,row.seed].join('/');
  assert.ok(row.kills>0,id+' never killed a monster');
  assert.ok(row.coins>=row.potionValue,id+' cannot cover its potion replacement cost');
  assert.ok(row.netGold>=0,id+' lost gold after restock');
  assert.ok(row.dawnMaterials>0,id+' did not retain sigil materials');
  assert.equal(row.revives,0,id+' required revival');
  assert.match(row.reason,/已完成離線時間/,id+' stopped early');
 }
});
