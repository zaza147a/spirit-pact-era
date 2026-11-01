import test from 'node:test';
import assert from 'node:assert/strict';
import {battlefieldPositions} from '../dist/battlefield-25d.js';

test('2.5D placement is deterministic and supports multiple live monster instances',()=>{
 const positions=battlefieldPositions(12);
 assert.equal(positions.length,12);
 assert.deepEqual(positions,battlefieldPositions(12));
 assert.ok(positions.every(p=>p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100));
 assert.deepEqual(battlefieldPositions(0),[]);
});
