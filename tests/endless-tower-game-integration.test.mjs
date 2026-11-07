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
