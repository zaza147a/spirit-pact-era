import test from 'node:test';
import assert from 'node:assert/strict';
import {mainAttribute,allocateForAspd} from '../scripts/legal-dps-attributes.mjs';

test('主屬性依近戰、遠距、法系分配',()=>{
 assert.equal(mainAttribute('crusader'),'STR');
 assert.equal(mainAttribute('hunter'),'DEX');
 assert.equal(mainAttribute('wizard'),'INT');
});
test('ASPD 達標後優先 LUK，所有配點合法',()=>{
 for(const job of ['crusader','hunter','wizard'])for(const agi of [1,32,100,150]){
  const a=allocateForAspd(job,agi);
  assert.equal(a[mainAttribute(job)],150);
  assert.equal(a.AGI,agi);
  assert.equal(Object.values(a).reduce((sum,n)=>sum+n,0),444);
  assert.ok(Object.values(a).every(n=>Number.isInteger(n)&&n>=1&&n<=150));
  assert.equal(a.LUK,Math.min(150,1+438-149-(agi-1)));
 }
});
