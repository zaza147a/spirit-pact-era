import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('worst-case sage magic-support retains cash and sigil materials through 30 minutes',()=>{
 const result=JSON.parse(readFileSync(new URL('../docs/dawn-longhaul-economy.json',import.meta.url),'utf8'));
 assert.equal(result.rows.length,4);
 const keys=new Set();
 for(const row of result.rows){
  const key=row.level+'-'+row.seed;
  assert.ok([201,210].includes(row.level));
  assert.ok([42,137].includes(row.seed));
  assert.ok(!keys.has(key),'duplicated case '+key);keys.add(key);
  assert.equal(row.job,'sage');assert.equal(row.pair,'magic-support');
  assert.equal(row.duration,30*60*1000);assert.equal(row.simulated,row.duration);
  assert.ok(row.kills>0);assert.ok(row.earned>=row.potionValue);
  assert.ok(row.netGold>0);assert.ok(row.remainingGold>=10000);
  assert.ok(row.materials>=row.kills,'sigil materials must remain in the bag');
  assert.equal(row.revives,0);assert.equal(row.valid,true);
  assert.match(row.reason,/已完成離線時間/);
 }
 assert.equal(keys.size,4);
});
