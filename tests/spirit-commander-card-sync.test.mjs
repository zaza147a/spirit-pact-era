import assert from 'node:assert/strict';
import {synchronizeCommanderCards} from '../dist/commander-card-sync.js';

const base={hp:10000,sp:1000,atk:2000,matk:3000,def:500,mdef:500,hit:100,
 flee:100,aspd:180,aspdPct:0,crit:20,critDmg:140,ignoreDef:0,damageReduction:35};
const original={...base};
const synced=synchronizeCommanderCards(base,{hpPct:20,atkPct:20,matkPct:20,
 damageReduction:10,crit:15,critDmg:25,magicDamage:10,aspdPct:5});
assert.equal(synced.hp,12000);
assert.equal(synced.atk,2400);
assert.equal(synced.matk,3960);
assert.equal(synced.damageReduction,40);
assert.equal(synced.crit,35);
assert.equal(synced.critDmg,165);
assert.equal(synced.aspdPct,5);
assert.deepEqual(base,original,'card synchronization must not modify source pet stats');
const resourceCards=synchronizeCommanderCards(base,{mp:120,mpPct:25,aspd:3});
assert.equal(resourceCards.sp,1400,'flat MP must become companion SP before percentage scaling');
assert.equal(resourceCards.aspd,183,'flat ASPD must be inherited by the sole companion');
console.log('PASS: full commander card effects apply once to the pet without mutating base');
