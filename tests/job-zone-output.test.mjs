import test from 'node:test';
import assert from 'node:assert/strict';
import {jobZoneOutputFactor} from '../dist/combat-balance.js';

test('job-specific map output preserves the level-160 anchor and bounded late-game smoothing',()=>{
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  assert.equal(jobZoneOutputFactor(job,50),1);
  assert.equal(jobZoneOutputFactor(job,160),1);
  const late=jobZoneOutputFactor(job,200);
  assert.ok(late>=.98&&late<=1.03,job+' late-game smoothing must stay bounded');
  assert.equal(jobZoneOutputFactor(job,180),(1+late)/2,'late-game interpolation');
  for(const level of [99,110,120,130,150,155,201,210]){
   const value=jobZoneOutputFactor(job,level);
   assert.ok(Number.isFinite(value)&&value>=.7&&value<=1.9,job+'/'+level);
  }
 }
 assert.ok(jobZoneOutputFactor('priest',110)>jobZoneOutputFactor('wizard',110));
 assert.ok(jobZoneOutputFactor('assassin',201)>jobZoneOutputFactor('priest',201));
 assert.equal(jobZoneOutputFactor('unknown',110),1);
});

test('level-200 smoothing retains the audited job coefficients',()=>{
 const expected={knight:1.025,crusader:1.02,wizard:1,sage:1,assassin:1.01,rogue:1.03,priest:1,monk:1.01,hunter:1,performer:.98};
 for(const [job,value] of Object.entries(expected))assert.equal(jobZoneOutputFactor(job,200),value);
});
