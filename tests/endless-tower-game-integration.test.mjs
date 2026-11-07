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
 assert.equal(p.towerLastFailure,undefined);
 a.startTower(1);assert.equal(p.towerRun.floor,1);a.exitTower('重戰撤退');
 assert.equal(p.towerProgress.highest,1);
 assert.equal(p.towerLastResult.floor,1);
 a.startTower(2);assert.equal(p.towerRun.floor,2);
 // A player may respec, switch gear/pets, or recover in town between floors.
 assert.equal(p.location,'dawnrift');
 a.exitTower('撤退');assert.equal(p.towerRun,undefined);
 assert.equal(p.towerProgress.highest,1);
});
test('finishing a floor allows changing character setup before entering the next one',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 for(let i=0;i<3;i++){a.state().enemy.hp=0;a.award();}
 assert.equal(p.location,'dawncity');
 const previousVitality=p.attributes.VIT;p.attributes.VIT=previousVitality+1;p.attributes.AGI-=1;
 a.startTower(2);
 assert.equal(p.towerRun.floor,2);
 assert.equal(p.attributes.VIT,previousVitality+1);
 a.exitTower('測試切換配置');
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
 assert.match(p.towerLastFailure.reason,/超時/);
});
test('actual combat death exits before auto revival and restores town party',async()=>{
 const {a,p}=await fixture();a.startTower(1);
 p.hp=0;a.combatTick();
 assert.equal(p.towerRun,undefined);assert.equal(p.location,'dawncity');
 assert.ok(p.hp>0);assert.equal(p.towerProgress.highest,0);
 assert.equal(p.towerLastFailure.floor,1);
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
 assert.match(a.renderTowerEncounter(),/炎龍灼燒/);
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
test('pursuit floor requires four minor kills while an attacking boss remains alive',async()=>{
 const {a,p}=await fixture();p.towerProgress={highest:2};a.startTower(3);
 assert.equal(a.state().enemies.length,5);
 assert.ok(a.state().enemies.some(e=>e.towerPursuer&&e.boss));
 for(let i=0;i<4;i++){
  const foes=a.state().enemies,minor=foes.find(e=>!e.towerPursuer);
  a.setEnemies([minor,...foes.filter(e=>e!==minor)]);minor.hp=0;a.award();
 }
 assert.equal(p.towerProgress.highest,3);
 assert.equal(p.location,'dawncity');
});
test('hunt boss has no ordinary attacks, broadcasts a skill timer and each minor kill postpones it',async()=>{
 const {c,a,p}=await fixture();p.towerProgress={highest:2};a.startTower(3);
 const chaser=a.state().enemies.find(e=>e.towerPursuer),initial=chaser.towerNextStrikeAt;
 assert.equal(initial,1e6+12000);
 assert.match(a.renderTowerEncounter(),/終境追獵・裁決/);
 const minor=a.state().enemies.find(e=>!e.towerPursuer);
 a.setEnemies([minor,...a.state().enemies.filter(e=>e!==minor)]);minor.hp=0;a.award();
 assert.equal(chaser.towerNextStrikeAt,initial+8000);
 a.setEnemies([chaser]);a.setAutoForTest(false);
 const before=p.hp;c.setTime(initial-100);a.combatTick(initial-100);
 assert.equal(p.hp,before,'charged boss must not use basic attacks');
 c.setTime(initial);a.combatTick(initial);assert.equal(p.hp,before,'kill postpones the strike');
 c.setTime(initial+8000);a.tickTowerBossMechanics(initial+8000);
 assert.ok(p.hp<before,'the postponed attack eventually fires');
 assert.equal(chaser.towerNextStrikeAt,initial+8000+12000);
});
test('survival floor completes on elapsed time, without killing the pursuer',async()=>{
 const {a,p}=await fixture();p.towerProgress={highest:5};a.startTower(6);
 assert.ok(a.state().enemies.some(e=>e.towerPursuer));
 a.tickTowerBossMechanics(1e6+34900);
 assert.equal(p.towerProgress.highest,5);
 a.tickTowerBossMechanics(1e6+35000);
 assert.equal(p.towerProgress.highest,6);
 assert.equal(p.towerRun,undefined);
});
test('assassination floor clears when boss dies, even with both escorts still alive',async()=>{
 const {a,p}=await fixture();p.towerProgress={highest:8};a.startTower(9);
 assert.equal(a.state().enemies.length,3);
 assert.equal(a.state().enemies.filter(e=>e.towerEscort).length,2);
 const boss=a.state().enemies.find(e=>e.boss);
 a.setEnemies([boss,...a.state().enemies.filter(e=>e!==boss)]);boss.hp=0;a.award();
 assert.equal(p.towerProgress.highest,9);
 assert.equal(p.location,'dawncity');
 assert.ok(a.state().enemies.every(e=>!e.towerEscort));
});
