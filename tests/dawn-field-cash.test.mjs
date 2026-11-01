import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {DAWN_MONSTERS,DAWN_BOSS} from '../dist/dawn-world.js';

test('dawn field kills grant spendable coins while preserving mandatory sigil materials',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('dawn-cash','wizard'));
 Object.assign(p,{location:'dawnrift',level:210,jobLevel:70,reborn:true,thirdJob:true});
 const initial=p.gold;
 for(const [index,monster] of DAWN_MONSTERS.entries()){
  const defeated={...monster,hp:0,maxHp:monster.hp,instanceId:'field-'+index,slotIndex:index};
  a.setup(p,defeated);a.award();
  assert.equal(p.gold,initial+(index+1)*150,'field cash must be usable without selling crafting materials');
  assert.equal(p.bag.find(e=>e.id===monster.junkId)?.qty,1,'sigil material must still drop');
 }
 assert.equal(DAWN_BOSS.gold,0,'boss core must stay the unique guaranteed boss payout');
 const boss={...DAWN_BOSS,hp:0,maxHp:DAWN_BOSS.hp,instanceId:'archon-test'};
 const beforeBoss=p.gold;
 a.setup(p,boss);a.award();
 assert.equal(p.gold,beforeBoss,'boss does not multiply the regular field cash reward');
 assert.equal(p.bag.find(e=>e.id==='dawn_archon_core')?.qty,1,'boss core guarantee remains intact');
});
