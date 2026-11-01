import test from 'node:test';
import assert from 'node:assert/strict';
import {battlefieldPositions,approachCoordinates,battlefieldHit,battlefieldEnemySwing} from '../dist/battlefield-25d.js';

test('2.5D placement is deterministic and supports multiple live monster instances',()=>{
 const positions=battlefieldPositions(12);
 assert.equal(positions.length,12);
 assert.deepEqual(positions,battlefieldPositions(12));
 assert.ok(positions.every(p=>p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100));
 assert.deepEqual(battlefieldPositions(0),[]);
});

test('melee movement stops at reach instead of returning to its spawn point',()=>{
 const start={x:10,y:50},target={x:210,y:50};
 const destination=approachCoordinates(start,target,58);
 assert.deepEqual(destination,{x:152,y:50});
 assert.deepEqual(approachCoordinates(destination,target,58),destination);
 assert.deepEqual(approachCoordinates({x:160,y:60},target,58),{x:160,y:60});
});

test('visual events do not require the DOM in offline combat',()=>{
 assert.doesNotThrow(()=>battlefieldHit({source:'playerDamage',targetId:'target1',amount:100,range:'melee'}));
 assert.doesNotThrow(()=>battlefieldEnemySwing('target1','pet','ranged'));
});
