import test from 'node:test';
import assert from 'node:assert/strict';
import {jobZoneOutputFactor} from '../dist/combat-balance.js';

test('job-specific map output budget affects real stage gaps, not the 160–200 stable tier',()=>{
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  assert.equal(jobZoneOutputFactor(job,50),1);
  assert.equal(jobZoneOutputFactor(job,160),1);
  assert.equal(jobZoneOutputFactor(job,200),1);
  for(const level of [99,110,120,130,150,155,201,210]){
   const value=jobZoneOutputFactor(job,level);
   assert.ok(Number.isFinite(value)&&value>=.7&&value<=1.9,job+'/'+level);
  }
 }
 assert.ok(jobZoneOutputFactor('priest',110)>jobZoneOutputFactor('wizard',110));
 assert.ok(jobZoneOutputFactor('assassin',201)>jobZoneOutputFactor('priest',201));
 assert.equal(jobZoneOutputFactor('unknown',110),1);
});
