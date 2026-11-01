import test from 'node:test';
import assert from 'node:assert/strict';
import {referenceAttributes,referenceAttributeVariant} from '../scripts/reference-builds-v508.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {runBuild} from '../scripts/balance-v24.mjs';
test('alternative audit allocations transfer 30 points within each legal cap and preserve the original budget',()=>{
 for(const level of [200,201,210])for(const job of Object.keys(SECOND_JOBS)){
  const base=referenceAttributes(level,job),sum=a=>Object.values(a).reduce((x,y)=>x+y,0);
  assert.deepEqual(referenceAttributeVariant(level,job),base);
  for(const profile of ['critical','swift']){
   const a=referenceAttributeVariant(level,job,profile);
   assert.equal(sum(a),sum(base));assert.equal(Object.keys(a).length,6);
   assert.equal(Object.keys(a).reduce((n,k)=>n+Math.max(0,a[k]-base[k]),0),30);
   assert.ok(Object.values(a).every(v=>Number.isInteger(v)&&v>=1&&v<=(level>=201?150:120)));
   const targets=profile==='critical'?['LUK','DEX']:['AGI','DEX','LUK'];
   assert.ok(targets.some(k=>a[k]>base[k]));
  }
 }
 assert.throws(()=>referenceAttributeVariant(200,'knight','fake'));
});
test('real combat fixture uses the alternative allocation without altering the default reference',()=>{
 const options={level:200,seconds:.04,reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic'};
 const normal=runBuild('wizard','magic',options),variant=runBuild('wizard','magic',{...options,attributeProfile:'critical'});
 assert.deepEqual(normal.attributes,referenceAttributes(200,'wizard'));
 assert.deepEqual(variant.attributes,referenceAttributeVariant(200,'wizard','critical'));
 assert.notDeepEqual(variant.stats.owner,normal.stats.owner);
});
