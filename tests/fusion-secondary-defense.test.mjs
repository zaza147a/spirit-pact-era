import test from 'node:test';
import assert from 'node:assert/strict';
import {monsterTargetWeights,chooseMonsterTarget} from '../dist/formation.js';

test('secondary defensive fusion increases threat without making its owner untargetable',()=>{
 const owner={job:'wizard',hp:1000},plain={hp:1000,fusion:{main:'magic',sub:'support'}},guard={hp:1000,fusion:{main:'magic',sub:'defense'}};
 const weight=p=>monsterTargetWeights(owner,p,'magic').find(x=>x.kind==='pet').weight;
 assert.ok(weight(guard)>weight(plain));
 assert.equal(weight(guard),6);
 assert.equal(chooseMonsterTarget(owner,guard,'magic',false,()=>0),'player');
 assert.equal(chooseMonsterTarget(owner,guard,'magic',false,()=>.99),'pet');
 assert.ok(monsterTargetWeights(owner,guard,'magic',true)[1].weight>weight(guard));
});
