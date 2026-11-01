import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';

const read=name=>JSON.parse(readFileSync(new URL('../docs/'+name,import.meta.url),'utf8'));
const key=r=>[r.job,r.pair,r.choice.join(',')].join('|');

test('five-boss 20-choice audit has complete configurations and honestly records failed chains',()=>{
 const main=read('five-boss-skill-combos.json'),followup=read('five-boss-skill-failure-recheck.json');
 const jobs=['crusader','wizard','sage'],pairs=Object.keys(FUSION_PAIRS).slice(0,6);
 assert.equal(main.count,360);assert.equal(main.rows.length,360);
 const identities=new Set(main.rows.map(key));assert.equal(identities.size,360);
 for(const job of jobs)for(const pair of pairs){
  const rows=main.rows.filter(r=>r.job===job&&r.pair===pair);
  assert.equal(rows.length,20,'missing six-choose-three choices for '+job+'/'+pair);
  assert.equal(new Set(rows.map(r=>r.choice.join(','))).size,20);
 }
 const failed=main.rows.filter(r=>!r.won);
 assert.equal(main.wins+failed.length,360);
 assert.ok(failed.length>0,'do not silently label incomplete balance acceptance as complete');
 assert.equal(followup.cases,failed.length*2);
 const failingKeys=new Set(failed.map(key));
 for(const r of followup.rows){
  assert.ok(failingKeys.has(key(r)),'followup tested a case other than the failed source choice');
  assert.ok([42,137].includes(r.seed));
 }
 for(const k of failingKeys)assert.equal(followup.rows.filter(r=>key(r)===k).length,2,'missing two extra seeds for '+k);
});
