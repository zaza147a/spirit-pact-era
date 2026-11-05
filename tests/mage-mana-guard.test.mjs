import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';

const foe=()=>({id:'world_1',map:'starter',level:1,hp:1e9,maxHp:1e9,atk:9000,def:0,hit:1e9,flee:0,aspd:150,instanceId:'mana-guard-test'});
async function hit(job,rank,mpRatio=1){
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('SP護體',job));
 p.level=200;p.reborn=true;p.thirdJob=true;p.jobSkills.manaStudy=rank;
 a.setup(p,foe());p.hp=1e6;p.mp=Math.round(a.stat('mp')*mpRatio);p.shield=0;
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
  assert.ok(base.lostHp-guard.lostHp<=Math.floor(base.lostHp*.15)+1);
 }
});

test('insufficient SP disables conversion and the passive never benefits non-mages',async()=>{
 const low=await hit('wizard',5,.15),without=await hit('wizard',0,.15),other=await hit('knight',0);
 assert.equal(low.spentSp,0);
 assert.equal(low.lostHp,without.lostHp);
 assert.equal(other.spentSp,0);
});
