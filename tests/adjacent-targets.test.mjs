import test from 'node:test';
import assert from 'node:assert/strict';
import {multiTargets} from '../dist/adjacent-targets.js';
const foe=(slot,boss=false)=>({instanceId:String(slot),slotIndex:slot,hp:100,boss});
const ids=xs=>xs.map(x=>x.instanceId);
test('boss primary can hit other living enemies without adjacency restriction',()=>{
 const [a,b,c,boss]=[foe(0),foe(1),foe(2),foe(3,true)];
 assert.deepEqual(ids(multiTargets([a,b,c,boss],boss,3)),['3','0','1']);
 assert.deepEqual(ids(multiTargets([a,b,c,boss],boss,1)),['3']);
});
test('multi-target effects can cross an empty encounter slot',()=>{
 const [a,c,boss]=[foe(0),foe(2),foe(3,true)];
 assert.deepEqual(ids(multiTargets([a,c,boss],a,3)),['0','2','3']);
 assert.deepEqual(ids(multiTargets([a,c,boss],boss,3)),['3','0','2']);
});
test('selected target stays first and dead secondary targets are excluded',()=>{
 const [a,b,c,boss]=[foe(0),foe(1),foe(2),foe(3,true)];
 c.hp=0;
 assert.deepEqual(ids(multiTargets([a,b,c,boss],b,3)),['1','0','3']);
 assert.deepEqual(ids(multiTargets([a,b,c,boss],b,2)),['1','0']);
});
