import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {DAWN_BOSS} from '../dist/dawn-world.js';

function storage(){const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}
function player(c,kind){const p=c.api.fresh('極限試煉測試','swordsman');p.level=210;p.thirdJob=true;p.location='dawnrift';p.hp=1e9;p.mp=1e9;p.extremeRun={kind,floor:1,stageStartedAt:1e6,startedAt:1e6,status:'active',stageDamage:0,stageKills:0};return p;}

test('實際戰鬥引擎：存活二十秒後進入下一階並在角色存檔紀錄一次',async()=>{
 const c=await runtime();c.localStorage=storage();const p=player(c,'atk');
 c.api.setup(p,{...DAWN_BOSS,id:'extreme-atk',name:'破軍戰神',extremeKind:'atk',hp:1e15,maxHp:1e15,atk:1,matk:0,attackType:'physical',lastAttack:1e6+20000});
 c.api.setAutoForTest(false);c.setTime(1e6+20000);
 c.api.combatTick(1e6+20000);
 assert.equal(p.extremeProgress.atk.highest,1);
 assert.equal(p.extremeCoins,10);
 assert.equal(p.extremeRun.floor,2);
 assert.equal(c.api.state().enemy.extremeKind,'atk');
});

test('實際戰鬥引擎：血量王以真正傷害補足門檻，不發放擊殺掉落',async()=>{
 const c=await runtime();c.localStorage=storage();const p=player(c,'hp');
 p.extremeRun.stageDamage=3000000000-1;
 const foe={...DAWN_BOSS,id:'extreme-hp',extremeKind:'hp',boss:true,hp:1e15,maxHp:1e15,atk:0,matk:0,lastAttack:1e6+30000};
 c.api.setup(p,foe);c.api.setAutoForTest(false);
 const dealt=c.api.dealDamage(100,'playerDamage');assert.ok(dealt>0);
 assert.ok(p.extremeRun.stageDamage>=3000000000);
 c.setTime(1e6+30000);c.api.combatTick(1e6+30000);
 assert.equal(p.extremeProgress.hp.highest,1);
 assert.equal(p.kills,0);
});

test('實際戰鬥引擎：清怪王擊殺後補怪，不產生金幣經驗',async()=>{
 const c=await runtime();c.localStorage=storage();const p=player(c,'clear');
 const foe={...DAWN_BOSS,id:'extreme-clear-minion',extremeKind:'clear',boss:false,hp:1,maxHp:1,atk:0,matk:0,lastAttack:1e6};
 c.api.setup(p,foe);
 const oldGold=p.gold,oldXp=p.xp;
 c.api.dealDamage(100,'playerDamage');c.api.award();
 assert.equal(p.extremeRun.stageKills,1);
 assert.equal(c.api.state().enemies.length,1);
 assert.equal(p.gold,oldGold);assert.equal(p.xp,oldXp);
});
