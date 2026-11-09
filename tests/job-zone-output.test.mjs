import test from 'node:test';
import assert from 'node:assert/strict';
import {jobZoneOutputFactor} from '../dist/combat-balance.js';

test('job-specific map output preserves the level-160 anchor and bounded late-game smoothing',()=>{
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  assert.equal(jobZoneOutputFactor(job,50),1);
  assert.equal(jobZoneOutputFactor(job,160),1);
  const late=jobZoneOutputFactor(job,200);
  assert.ok(late>=.75&&late<=1.4,job+' optimized-DPS calibration must stay bounded');
  assert.ok(Math.abs(jobZoneOutputFactor(job,180)-(1+(jobZoneOutputFactor(job,190)-1)*2/3))<1e-12,'preserve interpolation below 190');
  assert.equal(jobZoneOutputFactor(job,201),late,'no coefficient cliff at the dawn unlock');
  for(const level of [99,110,120,130,150,155,201,210]){
   const value=jobZoneOutputFactor(job,level);
   assert.ok(Number.isFinite(value)&&value>=.7&&value<=1.9,job+'/'+level);
  }
 }
 assert.ok(jobZoneOutputFactor('priest',110)>jobZoneOutputFactor('wizard',110));
 assert.ok(jobZoneOutputFactor('assassin',201)>jobZoneOutputFactor('priest',201));
 assert.equal(jobZoneOutputFactor('unknown',110),1);
});

test('level-200 optimized-DPS calibration retains per-job utility and continuous unlock coefficients',()=>{
 const expected={knight:1.06,crusader:1.35,wizard:1.03,sage:1.02,assassin:1.28,rogue:1.07,priest:.78,monk:1.01,hunter:1.1,performer:.98};
 for(const [job,value] of Object.entries(expected))assert.equal(jobZoneOutputFactor(job,200),value);
});
