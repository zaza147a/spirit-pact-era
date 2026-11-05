import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {potionRestore} from '../dist/restoration.js';
import {LOOT_ITEMS} from '../dist/loot.js';
import {preferredPotion} from '../dist/supply-rules.js';

const foe=()=>({id:'world_1',map:'starter',level:1,hp:1e9,maxHp:1e9,atk:9000,def:0,hit:1e9,flee:0,aspd:150,instanceId:'mana-guard-test'});
async function hit(job,rank,mpRatio=1,enabled=true,lowHp=false){
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('SP護體',job));
 p.level=200;p.reborn=true;p.thirdJob=true;p.jobSkills.manaStudy=rank;p.manaGuardEnabled=enabled;
 a.setup(p,foe());p.hp=lowHp?Math.round(a.stat('hp')*.2):1e6;p.mp=Math.round(a.stat('mp')*mpRatio);p.shield=0;
 const beforeHp=p.hp,beforeMp=p.mp,maxMp=a.stat('mp');
 a.enemyAttack();
 return {lostHp:beforeHp-p.hp,spentSp:beforeMp-p.mp,maxMp,metrics:a.state().report?.metrics,p};
}

test('first-job mage passive converts actual HP damage to SP cost for both advanced mages',async()=>{
 for(const job of ['mage','wizard','sage']){
  const base=await hit(job,0),guard=await hit(job,5);
  assert.equal(base.spentSp,0);
  assert.ok(guard.spentSp>0,job+' should consume SP');
  assert.ok(guard.lostHp<base.lostHp,job+' should reduce HP loss');
  assert.ok(guard.spentSp<=Math.floor(guard.maxMp*.10));
  assert.ok(guard.p.mp>=Math.ceil(guard.maxMp*.15));
  assert.ok(base.lostHp-guard.lostHp<=Math.floor(base.lostHp*.30)+1);
  assert.ok(base.lostHp-guard.lostHp<=guard.spentSp*30,job+' must absorb at most 30 damage per SP');
  assert.ok(base.lostHp-guard.lostHp>Math.max(0,(guard.spentSp-1)*30),job+' should spend no excess SP');
 }
});

test('insufficient SP disables conversion and the passive never benefits non-mages',async()=>{
 const low=await hit('wizard',5,.15),without=await hit('wizard',0,.15),other=await hit('knight',0);
 assert.equal(low.spentSp,0);
 assert.equal(low.lostHp,without.lostHp);
 assert.equal(other.spentSp,0);
});

test('mana guard is a persistent non-casting switch and can be disabled',async()=>{
 const enabled=await hit('wizard',5,1,true),disabled=await hit('wizard',5,1,false),without=await hit('wizard',0);
 assert.ok(enabled.spentSp>0);
 assert.equal(disabled.spentSp,0);
 assert.equal(disabled.lostHp,without.lostHp);
 assert.equal(disabled.p.manaGuardEnabled,false);
});

test('low HP emergency converts more damage to SP without changing the normal 30% effect',async()=>{
 const normal=await hit('wizard',5,1,true),emergency=await hit('wizard',5,1,true,true);
 assert.ok(emergency.spentSp>normal.spentSp,'emergency must consume additional SP to absorb more damage');
 assert.ok(emergency.spentSp<=Math.floor(emergency.maxMp*.10));
 assert.ok(emergency.p.mp>=Math.ceil(emergency.maxMp*.15));
});

test('high-grade blue potion restores flat 220 plus 10% maximum SP and is preferred automatically',()=>{
 const maximum=10000,item=LOOT_ITEMS.blue_large;
 assert.equal(potionRestore(item,'mp',210,maximum),1220);
 assert.equal(potionRestore(item,'mp',50,maximum),220);
 assert.equal(preferredPotion([{id:'blue_small',qty:3},{id:'blue_large',qty:2}],LOOT_ITEMS,'mp','high',maximum).id,'blue_large');
});
