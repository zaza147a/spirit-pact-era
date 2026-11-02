import test from 'node:test';
import assert from 'node:assert/strict';
import {adjacentTargets} from '../dist/adjacent-targets.js';
const foe=(slot,boss=false)=>({instanceId:String(slot),slotIndex:slot,hp:100,boss});
const ids=xs=>xs.map(x=>x.instanceId);
test('boss occupies the extra rightmost slot; three-target hits boss and its two left neighbors',()=>{
 const [a,b,c,boss]=[foe(0),foe(1),foe(2),foe(3,true)];
 assert.deepEqual(ids(adjacentTargets([a,b,c,boss],boss,3,3)),['3','2','1']);
 assert.deepEqual(ids(adjacentTargets([a,b,c,boss],boss,1,3)),['3']);
});
test('area effects never jump a vacant encounter slot',()=>{
 const [a,c,boss]=[foe(0),foe(2),foe(3,true)];
 assert.deepEqual(ids(adjacentTargets([a,c,boss],a,3,3)),['0']);
 assert.deepEqual(ids(adjacentTargets([a,c,boss],boss,3,3)),['3','2']);
});
test('a middle target uses only connected neighbors',()=>{
 const [a,b,c,boss]=[foe(0),foe(1),foe(2),foe(3,true)];
 assert.deepEqual(ids(adjacentTargets([a,b,c,boss],b,3,3)),['1','0','2']);
});
