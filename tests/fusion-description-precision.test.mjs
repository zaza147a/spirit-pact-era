import test from 'node:test';import assert from 'node:assert/strict';
import {describeFusionTransform,companionResonance} from '../dist/fusion-resonance.js';
import {SECOND_JOBS} from '../dist/jobs.js';import {FUSION_PAIRS} from '../dist/pet-fusion.js';
test('zero effects are omitted; small actual effects retain their percent precision',()=>{
 assert.equal(describeFusionTransform({magic:0,haste:0,targets:0}),'');
 assert.match(describeFusionTransform({haste:.0008,magic:.0023}),/0\.08%/);
 assert.match(describeFusionTransform({haste:.0008,magic:.0023}),/0\.23%/);
 assert.match(describeFusionTransform({haste:.0000001}),/<0\.001%/);
 assert.equal(describeFusionTransform({magic:NaN,bonus:Infinity}),'');
});
test('all 120 contracts display actual nonzero values without false zero-percent payloads',()=>{
 for(const job of Object.keys(SECOND_JOBS))for(const key of Object.keys(FUSION_PAIRS))for(const level of [151,175,200,201]){
  const [main,sub]=key.split('-');const r=companionResonance({job,level,thirdJob:true},{fusion:{main,sub}});
  assert.ok(r);assert.doesNotMatch(r.description,/(?<![\d.])0%|：；|：。/,job+'/'+key+'/'+level);
  for(const transform of Object.values(r.perSkill))for(const[k,v]of Object.entries(transform)){
   if(v!==0)assert.ok(describeFusionTransform({[k]:v}).length>0);
  }
 }
});
