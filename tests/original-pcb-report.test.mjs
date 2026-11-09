import test from 'node:test';import assert from 'node:assert/strict';
import {damageSplitPcb} from '../dist/contribution.js';
test('P/C/B are exclusive, sum exactly to damage, and normalize to 50/40/10',()=>{
 const r={metrics:{playerDamage:460,playerBuffDamage:40,petDamage:270,resonanceDamage:130,buffDamage:100}};
 assert.deepEqual(damageSplitPcb(r),{P:500,C:400,B:100,total:1000,ratios:{P:.5,C:.4,B:.1}});
});
test('empty reports do not divide by zero; owner-given pet buff credits P, not pet',()=>{
 assert.equal(damageSplitPcb(null).total,0);
 const r=damageSplitPcb({metrics:{petDamage:50,playerBuffDamage:50,buffDamage:20}});
 assert.deepEqual({P:r.P,C:r.C,B:r.B,total:r.total},{P:50,C:50,B:20,total:120});
});
