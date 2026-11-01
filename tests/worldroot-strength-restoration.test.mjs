import test from 'node:test';import assert from 'node:assert/strict';
import {TRIAL_ROUTES,TRIAL_TUNING,createTrialBoss,trialDropTable}from'../dist/sky-trials.js';import{MAP_BOSSES}from'../dist/map-bosses.js';
const route=TRIAL_ROUTES.find(r=>r.map==='worldroot');
test('worldroot five stages restore a genuine farm-to-SS/SSS power curve',()=>{
 const bosses=Array.from({length:5},(_,i)=>createTrialBoss(route,i,MAP_BOSSES.worldroot));
 for(let i=1;i<5;i++){assert.ok(bosses[i].hp>bosses[i-1].hp);assert.ok(bosses[i].atk>bosses[i-1].atk);}
 const tail=bosses[4];assert.equal(tail.hp,9252577488);assert.equal(tail.atk,20670000);assert.equal(tail.enrageAfter,240000);
 assert.ok(bosses[0].hp<tail.hp/8,'earlier stages remain a lower material-farming threshold');
});
test('trial reward rolls stay independent and every stage retains valid positive tuning',()=>{
 assert.deepEqual(trialDropTable(route,4).map(({rank,chance})=>({rank,chance})),[{rank:'S',chance:1},{rank:'SS',chance:.3},{rank:'SSS',chance:.1}]);
 for(const level of[151,161,171,181])assert.ok(TRIAL_TUNING[level].hp.every(n=>n>0));
 assert.ok(TRIAL_TUNING[181].hp[4]>TRIAL_TUNING[181].hp[0]);assert.ok(TRIAL_TUNING[181].atk[4]>TRIAL_TUNING[181].atk[0]);
});
