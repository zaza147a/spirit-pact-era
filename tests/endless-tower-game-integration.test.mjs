import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';

async function fixture(){const c=await runtime(),a=c.api,p=a.normalize(a.fresh('終境測試','knight'));
 Object.assign(p,{level:210,jobLevel:70,thirdJob:true,reborn:true,dawnUnlocked:true,location:'dawncity',towerProgress:{highest:0},towerCoins:0});
 a.setup(p,null);p.hp=a.stat('hp');p.mp=a.stat('mp');return {c,a,p};}

test('actual game starts a tower floor without altering five-boss trial state',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 assert.equal(p.towerRun.floor,1);assert.equal(p.location,'dawnrift');assert.equal(p.trialRun,undefined);
 assert.equal(a.state().enemies.length,3);assert.ok(a.state().enemies.every(e=>e.tower&&e.xp===0&&e.gold===0));
 assert.match(a.renderTowerEncounter(),/第 1 層/);
});
test('actual game rewards once after all kills and safely returns to dawn city',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 for(let i=0;i<3;i++){const foe=a.state().enemy;assert.ok(foe.hp>0);foe.hp=0;a.award();}
 assert.equal(p.towerRun,undefined);assert.equal(p.location,'dawncity');
 assert.equal(p.towerProgress.highest,1);assert.ok(p.towerCoins>0);
 assert.equal(p.towerLastResult.floor,1);
 a.startTower(2);assert.equal(p.towerRun.floor,2);
 a.exitTower('撤退');assert.equal(p.towerRun,undefined);
 assert.equal(p.towerProgress.highest,1);
});
test('interrupted tower cannot resume with stale enemies or get duplicate rewards',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 const saved=a.normalize(structuredClone(p));
 assert.equal(saved.towerRun,undefined);assert.equal(saved.location,'dawncity');
 assert.equal(saved.towerInterrupted,true);assert.equal(saved.offline.enabled,false);
 assert.equal(saved.towerProgress.highest,0);
});
test('actual combat timeout exits safely and preserves prior progress',async()=>{
 const {c,a,p}=await fixture();p.towerProgress={highest:9};a.startTower(10);
 assert.equal(a.state().enemies.length,1);
 assert.ok(a.state().enemy.boss);
 c.setTime(1e6+181000);a.tickEncounters(1e6+181000);
 assert.equal(p.location,'dawncity');assert.equal(p.towerRun,undefined);
 assert.equal(p.towerProgress.highest,9);
});
test('actual combat death exits before auto revival and restores town party',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 p.hp=0;a.combatTick();
 assert.equal(p.towerRun,undefined);assert.equal(p.location,'dawncity');
 assert.ok(p.hp>0);assert.equal(p.towerProgress.highest,0);
});
test('twentieth-floor boss summons bounded adds and they do not count as floor clears',async()=>{
 const {a,p}=await fixture();p.towerProgress={highest:19};a.startTower(20);
 const boss=a.state().enemy;boss.hp=Math.round(boss.maxHp*.69);
 a.tickTowerBossMechanics(1e6+1000);
 assert.equal(a.state().enemies.length,5);
 assert.equal(boss.towerPhase,1);
 const summon=a.state().enemies.find(e=>e.towerSummon);summon.hp=0;
 a.setEnemies([summon,boss,...a.state().enemies.filter(e=>e!==summon&&e!==boss)]);
 a.award();
 assert.equal(p.towerRun.completedEnemyIds.length,0);
 assert.equal(p.towerProgress.highest,19);
 a.tickTowerBossMechanics(1e6+2000);
 assert.equal(a.state().enemies.length,4);
 assert.match(a.spriteHtml(boss.id,'monster'),/assets\/tower\/boss-20.webp/);
});
test('fire boss signature causes bounded periodic damage without duplicate casts',async()=>{
 const {a,p}=await fixture();p.towerProgress={highest:19};a.startTower(20);
 const boss=a.state().enemy,now=1e6+9000,before=p.hp;
 a.tickTowerBossMechanics(now);
 assert.ok(p.hp<before);const after=p.hp;
 a.tickTowerBossMechanics(now+100);
 assert.equal(p.hp,after);
 assert.ok(boss.towerNextSkill>now+100);
});
test('ice boss control is bounded and can be resisted by the existing SSS rule',async()=>{
 const {c,a,p}=await fixture();p.towerProgress={highest:29};a.startTower(30);
 const boss=a.state().enemy,now=1e6+12000;
 a.tickTowerBossMechanics(now);assert.equal(a.isControlled(),true);
 c.setTime(now+1500);assert.equal(a.isControlled(),false);
 a.exitTower('測試完成');
});
