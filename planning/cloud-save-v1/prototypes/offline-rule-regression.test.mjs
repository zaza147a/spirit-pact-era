// Standalone regression against the ACTUAL dist/offline-rules.js on this branch.
// Run: node --test planning/cloud-save-v1/prototypes/offline-rule-regression.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineWindow,OFFLINE_STEP_MS,OFFLINE_CAP_MS,inventoryDelta} from '../../../dist/offline-rules.js';
const NOW=1800000000000;
const sample=(duration,extra={})=>({offline:{at:NOW-duration,enabled:true},hp:10,location:'worldroot',autoRevive:false,...extra});
test('under 10 seconds normally ineligible',()=>assert.equal(offlineWindow(sample(9999),NOW).eligible,false));
test('at 10 seconds eligible',()=>assert.equal(offlineWindow(sample(10000),NOW).eligible,true));
test('continuous trials eligible within 10 seconds',()=>assert.equal(offlineWindow(sample(100,{trialRun:{continuous:true}}),NOW).eligible,true));
test('24-hour cap exact',()=>{const a=offlineWindow(sample(24*3600000),NOW);assert.equal(a.duration,OFFLINE_CAP_MS);assert.equal(a.capped,false)});
test('48-hour duration capped at 24h',()=>{const a=offlineWindow(sample(48*3600000),NOW);assert.equal(a.duration,OFFLINE_CAP_MS);assert.equal(a.capped,true)});
test('future timestamps rejected',()=>assert.equal(offlineWindow(sample(-1000),NOW).eligible,false));
test('disabled offline rejected',()=>assert.equal(offlineWindow(sample(3600000,{offline:{at:NOW-3600000,enabled:false}}),NOW).eligible,false));
test('town map rejected',()=>assert.equal(offlineWindow(sample(3600000,{location:'town'}),NOW).eligible,false));
test('dead without revive rejected',()=>assert.equal(offlineWindow(sample(3600000,{hp:0}),NOW).eligible,false));
test('dead with revive eligible',()=>assert.equal(offlineWindow(sample(3600000,{hp:0,autoRevive:true}),NOW).eligible,true));
test('step count at 24h',()=>assert.equal(OFFLINE_CAP_MS/OFFLINE_STEP_MS,864000));
test('inventoryDelta handles stacks and newly-created UID',()=>{const d=inventoryDelta({bag:[{id:'red',qty:2},{id:'sword',uid:'a'}],cards:[{id:'card1',qty:1}]},{bag:[{id:'red',qty:3},{id:'sword',uid:'a'},{id:'sword',uid:'b',name:'Sword',rarity:'rare'}],cards:[{id:'card1',qty:2}]});assert.deepEqual(d.stacks,[{id:'red',qty:1}]);assert.equal(d.equipment.length,1);assert.equal(d.cards[0].qty,1)});
